import { useState, useRef, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { SettingsPanel } from './components/SettingsPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ExportPanel } from './components/ExportPanel';
import { ProcessingSettings, ProcessedImage, PaletteColor } from './types';
import { ImageProcessor } from './utils/imageProcessor';
import { generateDefaultPalette } from './utils/colorUtils';
import { Paintbrush, Loader2 } from 'lucide-react';

function App() {
  const [settings, setSettings] = useState<ProcessingSettings>({
    segmentSize: 20,
    fontSize: 14,
    colorCount: 50,
    simplification: 10
  });

  const [palette] = useState<PaletteColor[]>(() => generateDefaultPalette(258));
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showColors, setShowColors] = useState(true);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleImageSelect = async (file: File) => {
    setOriginalFile(file);
    await processImage(file, settings);
  };

  const processImage = async (file: File, processSettings: ProcessingSettings) => {
    setProcessing(true);
    try {
      const processor = new ImageProcessor();
      const colorCount = Math.min(processSettings.colorCount, 258);
      const usedPalette = palette.slice(0, colorCount);
      const result = await processor.processImage(file, usedPalette, processSettings);
      setProcessed(result);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Ошибка при обработке изображения. Попробуйте другой файл.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSettingsChange = (newSettings: ProcessingSettings) => {
    setSettings(newSettings);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (originalFile && processed) {
      debounceRef.current = setTimeout(() => {
        processImage(originalFile, newSettings);
      }, 500);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Paintbrush className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-800">
              Генератор картин по номерам
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Загрузите изображение и получите готовую схему для рисования по номерам
            с автоматической нумерацией и цветовой палитрой
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <SettingsPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          </div>

          <div className="lg:col-span-2">
            {!processed ? (
              <div className="h-full flex items-center">
                <ImageUploader
                  onImageSelect={handleImageSelect}
                  disabled={processing}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Превью</h2>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showColors}
                          onChange={(e) => setShowColors(e.target.checked)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Показать цвета
                        </span>
                      </label>
                      <button
                        onClick={() => setProcessed(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                      >
                        Новое изображение
                      </button>
                    </div>
                  </div>
                  <PreviewCanvas
                    processed={processed}
                    fontSize={settings.fontSize}
                    showColors={showColors}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {processed && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ExportPanel processed={processed} fontSize={settings.fontSize} />
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Как использовать результаты
                </h2>
                <div className="space-y-3 text-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <p>
                      <strong>Схема с номерами</strong> - распечатайте эту схему для рисования.
                      Каждый номер соответствует определенному цвету.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <p>
                      <strong>Цветная превью</strong> - используйте для проверки результата
                      и понимания, как будет выглядеть готовая работа.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <p>
                      <strong>Стикеры с цветами</strong> - распечатайте и наклейте на баночки
                      с красками для удобной организации работы.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      4
                    </div>
                    <p>
                      <strong>Таблица цветов</strong> - содержит HEX и RGB коды всех цветов
                      для точного подбора красок.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {processing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-lg font-semibold text-gray-800">
                Обработка изображения...
              </p>
              <p className="text-sm text-gray-600">
                Это может занять несколько секунд
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
