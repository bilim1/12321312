import { Color, PaletteColor } from '../types';

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function colorDistance(c1: Color, c2: Color): number {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

export function findClosestColor(color: Color, palette: PaletteColor[]): PaletteColor {
  let minDistance = Infinity;
  let closest = palette[0];

  for (const paletteColor of palette) {
    const distance = colorDistance(color, paletteColor);
    if (distance < minDistance) {
      minDistance = distance;
      closest = paletteColor;
    }
  }

  return closest;
}

export function generateDefaultPalette(count: number): PaletteColor[] {
  const palette: PaletteColor[] = [];

  for (let i = 0; i < count; i++) {
    const hue = (i * 360) / count;
    const saturation = 70 + (i % 3) * 10;
    const lightness = 40 + (i % 4) * 15;

    const rgb = hslToRgb(hue, saturation, lightness);
    palette.push({
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      number: i + 1,
      hex: rgbToHex(rgb.r, rgb.g, rgb.b)
    });
  }

  return palette;
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}
