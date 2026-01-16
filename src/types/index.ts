export interface Color {
  r: number;
  g: number;
  b: number;
  number: number;
}

export interface PaletteColor extends Color {
  hex: string;
  name?: string;
}

export interface ProcessingSettings {
  segmentSize: number;
  fontSize: number;
  colorCount: number;
  simplification: number;
}

export interface ProcessedImage {
  width: number;
  height: number;
  segments: ImageSegment[];
  colorMap: Map<number, PaletteColor>;
  imageData: ImageData;
}

export interface ImageSegment {
  colorNumber: number;
  pixels: number[];
  centerX: number;
  centerY: number;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}
