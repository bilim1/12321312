import { PaletteColor, ProcessingSettings, ProcessedImage, ImageSegment } from '../types';
import { findClosestColor } from './colorUtils';

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
  }

  async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  simplifyImage(imageData: ImageData, level: number): ImageData {
    const simplified = new ImageData(imageData.width, imageData.height);
    const blockSize = Math.max(1, Math.floor(level / 20));

    for (let y = 0; y < imageData.height; y += blockSize) {
      for (let x = 0; x < imageData.width; x += blockSize) {
        let r = 0, g = 0, b = 0, count = 0;

        for (let by = 0; by < blockSize && y + by < imageData.height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < imageData.width; bx++) {
            const idx = ((y + by) * imageData.width + (x + bx)) * 4;
            r += imageData.data[idx];
            g += imageData.data[idx + 1];
            b += imageData.data[idx + 2];
            count++;
          }
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        for (let by = 0; by < blockSize && y + by < imageData.height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < imageData.width; bx++) {
            const idx = ((y + by) * imageData.width + (x + bx)) * 4;
            simplified.data[idx] = r;
            simplified.data[idx + 1] = g;
            simplified.data[idx + 2] = b;
            simplified.data[idx + 3] = 255;
          }
        }
      }
    }

    return simplified;
  }

  quantizeColors(imageData: ImageData, palette: PaletteColor[]): { imageData: ImageData; colorMap: Map<number, PaletteColor> } {
    const quantized = new ImageData(imageData.width, imageData.height);
    const colorMap = new Map<number, PaletteColor>();

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];

      const closest = findClosestColor({ r, g, b, number: 0 }, palette);

      quantized.data[i] = closest.r;
      quantized.data[i + 1] = closest.g;
      quantized.data[i + 2] = closest.b;
      quantized.data[i + 3] = 255;

      colorMap.set(closest.number, closest);
    }

    return { imageData: quantized, colorMap };
  }

  segmentImage(imageData: ImageData, minSegmentSize: number): ImageSegment[] {
    const width = imageData.width;
    const height = imageData.height;
    const visited = new Array(width * height).fill(false);
    const segments: ImageSegment[] = [];

    const getColorKey = (x: number, y: number): string => {
      const idx = (y * width + x) * 4;
      return `${imageData.data[idx]},${imageData.data[idx + 1]},${imageData.data[idx + 2]}`;
    };

    const floodFill = (startX: number, startY: number, targetColor: string): number[] => {
      const stack: [number, number][] = [[startX, startY]];
      const pixels: number[] = [];

      while (stack.length > 0) {
        const [x, y] = stack.pop()!;

        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        const idx = y * width + x;
        if (visited[idx]) continue;

        const colorKey = getColorKey(x, y);
        if (colorKey !== targetColor) continue;

        visited[idx] = true;
        pixels.push(x, y);

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }

      return pixels;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;

        if (!visited[idx]) {
          const colorKey = getColorKey(x, y);
          const pixels = floodFill(x, y, colorKey);

          if (pixels.length >= minSegmentSize * 2) {
            let sumX = 0, sumY = 0;
            let minX = width, maxX = 0, minY = height, maxY = 0;

            for (let i = 0; i < pixels.length; i += 2) {
              const px = pixels[i];
              const py = pixels[i + 1];
              sumX += px;
              sumY += py;
              minX = Math.min(minX, px);
              maxX = Math.max(maxX, px);
              minY = Math.min(minY, py);
              maxY = Math.max(maxY, py);
            }

            const centerX = Math.round(sumX / (pixels.length / 2));
            const centerY = Math.round(sumY / (pixels.length / 2));

            const pidx = (y * width + x) * 4;
            const colorNumber = imageData.data[pidx] * 1000000 +
                              imageData.data[pidx + 1] * 1000 +
                              imageData.data[pidx + 2];

            segments.push({
              colorNumber,
              pixels,
              centerX,
              centerY,
              bounds: { minX, maxX, minY, maxY }
            });
          }
        }
      }
    }

    return segments;
  }

  async processImage(
    file: File,
    palette: PaletteColor[],
    settings: ProcessingSettings
  ): Promise<ProcessedImage> {
    const img = await this.loadImage(file);

    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.ctx.drawImage(img, 0, 0);

    let imageData = this.ctx.getImageData(0, 0, img.width, img.height);

    if (settings.simplification > 0) {
      imageData = this.simplifyImage(imageData, settings.simplification);
    }

    const { imageData: quantized, colorMap } = this.quantizeColors(imageData, palette);

    const segments = this.segmentImage(quantized, settings.segmentSize);

    return {
      width: img.width,
      height: img.height,
      segments,
      colorMap,
      imageData: quantized
    };
  }
}
