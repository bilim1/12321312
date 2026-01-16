import { useEffect, useRef } from 'react';
import { ProcessedImage } from '../types';
import { ExportUtils } from '../utils/exportUtils';

interface PreviewCanvasProps {
  processed: ProcessedImage;
  fontSize: number;
  showColors: boolean;
}

export function PreviewCanvas({ processed, fontSize, showColors }: PreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = ExportUtils.drawNumberedScheme(processed, fontSize, showColors);
    const ctx = canvasRef.current.getContext('2d')!;

    canvasRef.current.width = canvas.width;
    canvasRef.current.height = canvas.height;
    ctx.drawImage(canvas, 0, 0);
  }, [processed, fontSize, showColors]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto border border-gray-200 rounded"
      />
    </div>
  );
}
