import { ProcessingSettings } from '../types';
import { Settings, Palette } from 'lucide-react';

interface SettingsPanelProps {
  settings: ProcessingSettings;
  onSettingsChange: (settings: ProcessingSettings) => void;
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const handleChange = (key: keyof ProcessingSettings, value: number) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-800">Настройки обработки</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Минимальный размер сегмента</span>
            <span className="text-sm font-bold text-blue-600">{settings.segmentSize}</span>
          </label>
          <input
            type="range"
            min="5"
            max="100"
            value={settings.segmentSize}
            onChange={(e) => handleChange('segmentSize', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Увеличьте значение для меньшего количества мелких деталей
          </p>
        </div>

        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Размер цифр</span>
            <span className="text-sm font-bold text-blue-600">{settings.fontSize}px</span>
          </label>
          <input
            type="range"
            min="8"
            max="32"
            value={settings.fontSize}
            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Размер номеров на схеме
          </p>
        </div>

        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Количество цветов</span>
            <span className="text-sm font-bold text-blue-600">{settings.colorCount}</span>
          </label>
          <input
            type="range"
            min="10"
            max="258"
            value={settings.colorCount}
            onChange={(e) => handleChange('colorCount', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Максимальное количество цветов в палитре
          </p>
        </div>

        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Упрощение изображения</span>
            <span className="text-sm font-bold text-blue-600">{settings.simplification}</span>
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={settings.simplification}
            onChange={(e) => handleChange('simplification', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Уменьшение мелких деталей и шума
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Палитра цветов</span>
          </div>
          <p className="text-xs text-gray-500">
            Сейчас используется временная палитра. После добавления вашей палитры из 258 цветов,
            все цвета будут автоматически приведены к ней.
          </p>
        </div>
      </div>
    </div>
  );
}
