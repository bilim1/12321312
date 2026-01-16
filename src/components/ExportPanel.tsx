import { Download, FileImage, Palette, FileText } from 'lucide-react';
import { ProcessedImage } from '../types';
import { ExportUtils } from '../utils/exportUtils';

interface ExportPanelProps {
  processed: ProcessedImage | null;
  fontSize: number;
}

export function ExportPanel({ processed, fontSize }: ExportPanelProps) {
  if (!processed) return null;

  const handleExportScheme = (withColors: boolean) => {
    const canvas = ExportUtils.drawNumberedScheme(processed, fontSize, withColors);
    const filename = withColors ? 'scheme-colored.png' : 'scheme-numbers.png';
    ExportUtils.downloadCanvas(canvas, filename);
  };

  const handleExportStickers = () => {
    const colorTable = ExportUtils.generateColorTable(processed);
    const canvas = ExportUtils.createStickersCanvas(colorTable);
    ExportUtils.downloadCanvas(canvas, 'color-stickers.png');
  };

  const handleExportColorTable = () => {
    const colorTable = ExportUtils.generateColorTable(processed);
    ExportUtils.downloadColorTableAsText(colorTable);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Download className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-800">Экспорт файлов</h2>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => handleExportScheme(false)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FileImage className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Схема с номерами</div>
            <div className="text-xs text-blue-100">Черно-белая схема для печати</div>
          </div>
        </button>

        <button
          onClick={() => handleExportScheme(true)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FileImage className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Цветная превью</div>
            <div className="text-xs text-green-100">Схема с цветами и номерами</div>
          </div>
        </button>

        <button
          onClick={handleExportStickers}
          className="w-full flex items-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Palette className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Стикеры с цветами</div>
            <div className="text-xs text-purple-100">Номера и образцы цветов</div>
          </div>
        </button>

        <button
          onClick={handleExportColorTable}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <FileText className="w-5 h-5" />
          <div className="text-left">
            <div className="font-semibold">Таблица цветов</div>
            <div className="text-xs text-gray-100">Текстовый файл с HEX и RGB кодами</div>
          </div>
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Всего цветов:</strong> {processed.colorMap.size}
        </p>
        <p className="text-sm text-blue-800">
          <strong>Всего сегментов:</strong> {processed.segments.length}
        </p>
      </div>
    </div>
  );
}
