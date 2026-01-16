import { ProcessedImage, PaletteColor } from '../types';

export class ExportUtils {
  static drawNumberedScheme(
    processed: ProcessedImage,
    fontSize: number,
    showColors: boolean
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = processed.width;
    canvas.height = processed.height;
    const ctx = canvas.getContext('2d')!;

    if (showColors) {
      ctx.putImageData(processed.imageData, 0, 0);
    } else {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 0.5;

      for (const segment of processed.segments) {
        for (let i = 0; i < segment.pixels.length; i += 2) {
          const x = segment.pixels[i];
          const y = segment.pixels[i + 1];

          if (x < processed.width - 1) {
            const nextIdx = (y * processed.width + x + 1) * 4;
            const currentIdx = (y * processed.width + x) * 4;
            const currentColor = `${processed.imageData.data[currentIdx]},${processed.imageData.data[currentIdx + 1]},${processed.imageData.data[currentIdx + 2]}`;
            const nextColor = `${processed.imageData.data[nextIdx]},${processed.imageData.data[nextIdx + 1]},${processed.imageData.data[nextIdx + 2]}`;

            if (currentColor !== nextColor) {
              ctx.beginPath();
              ctx.moveTo(x + 1, y);
              ctx.lineTo(x + 1, y + 1);
              ctx.stroke();
            }
          }

          if (y < processed.height - 1) {
            const nextIdx = ((y + 1) * processed.width + x) * 4;
            const currentIdx = (y * processed.width + x) * 4;
            const currentColor = `${processed.imageData.data[currentIdx]},${processed.imageData.data[currentIdx + 1]},${processed.imageData.data[currentIdx + 2]}`;
            const nextColor = `${processed.imageData.data[nextIdx]},${processed.imageData.data[nextIdx + 1]},${processed.imageData.data[nextIdx + 2]}`;

            if (currentColor !== nextColor) {
              ctx.beginPath();
              ctx.moveTo(x, y + 1);
              ctx.lineTo(x + 1, y + 1);
              ctx.stroke();
            }
          }
        }
      }
    }

    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const colorToNumber = new Map<number, number>();
    let counter = 1;

    const sortedColors = Array.from(processed.colorMap.values()).sort((a, b) => {
      const brightnessA = a.r * 0.299 + a.g * 0.587 + a.b * 0.114;
      const brightnessB = b.r * 0.299 + b.g * 0.587 + b.b * 0.114;
      return brightnessA - brightnessB;
    });

    sortedColors.forEach(color => {
      const key = color.r * 1000000 + color.g * 1000 + color.b;
      colorToNumber.set(key, counter++);
    });

    for (const segment of processed.segments) {
      const width = segment.bounds.maxX - segment.bounds.minX;
      const height = segment.bounds.maxY - segment.bounds.minY;

      if (width > fontSize * 1.5 && height > fontSize * 1.5) {
        const number = colorToNumber.get(segment.colorNumber) || 0;
        const text = number.toString();

        const pidx = (segment.centerY * processed.width + segment.centerX) * 4;
        const r = processed.imageData.data[pidx];
        const g = processed.imageData.data[pidx + 1];
        const b = processed.imageData.data[pidx + 2];
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

        ctx.fillStyle = showColors ? (brightness > 128 ? '#000000' : '#FFFFFF') : '#000000';
        ctx.strokeStyle = showColors ? (brightness > 128 ? '#FFFFFF' : '#000000') : '#FFFFFF';
        ctx.lineWidth = 3;

        ctx.strokeText(text, segment.centerX, segment.centerY);
        ctx.fillText(text, segment.centerX, segment.centerY);
      }
    }

    return canvas;
  }

  static generateColorTable(processed: ProcessedImage): { number: number; color: PaletteColor }[] {
    const sortedColors = Array.from(processed.colorMap.values()).sort((a, b) => {
      const brightnessA = a.r * 0.299 + a.g * 0.587 + a.b * 0.114;
      const brightnessB = b.r * 0.299 + b.g * 0.587 + b.b * 0.114;
      return brightnessA - brightnessB;
    });

    return sortedColors.map((color, index) => ({
      number: index + 1,
      color
    }));
  }

  static createStickersCanvas(colorTable: { number: number; color: PaletteColor }[]): HTMLCanvasElement {
    const stickerWidth = 200;
    const stickerHeight = 80;
    const columns = 4;
    const padding = 20;

    const rows = Math.ceil(colorTable.length / columns);
    const canvas = document.createElement('canvas');
    canvas.width = columns * (stickerWidth + padding) + padding;
    canvas.height = rows * (stickerHeight + padding) + padding;

    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    colorTable.forEach((item, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = col * (stickerWidth + padding) + padding;
      const y = row * (stickerHeight + padding) + padding;

      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(x, y, stickerWidth, stickerHeight);

      ctx.fillStyle = item.color.hex;
      ctx.fillRect(x + 10, y + 10, 60, 60);

      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 10, y + 10, 60, 60);

      ctx.fillStyle = '#333';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`№${item.number}`, x + 85, y + 30);

      ctx.font = '14px monospace';
      ctx.fillText(item.color.hex.toUpperCase(), x + 85, y + 55);
    });

    return canvas;
  }

  static downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    });
  }

  static downloadColorTableAsText(colorTable: { number: number; color: PaletteColor }[]): void {
    let text = 'Таблица цветов\n\n';
    text += 'Номер | HEX код | RGB\n';
    text += '------|---------|-----\n';

    colorTable.forEach(item => {
      text += `${item.number.toString().padStart(3, ' ')} | ${item.color.hex} | RGB(${item.color.r}, ${item.color.g}, ${item.color.b})\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'color-table.txt';
    link.click();
    URL.revokeObjectURL(url);
  }
}
