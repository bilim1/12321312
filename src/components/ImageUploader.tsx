import { Upload } from 'lucide-react';
import { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageSelect, disabled }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      onImageSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      onImageSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`border-3 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
        disabled
          ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
          : 'border-blue-400 bg-blue-50 hover:bg-blue-100 hover:border-blue-500'
      }`}
    >
      <Upload className="w-16 h-16 mx-auto mb-4 text-blue-500" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        Загрузите изображение
      </h3>
      <p className="text-gray-500 mb-2">
        Перетащите файл сюда или нажмите для выбора
      </p>
      <p className="text-sm text-gray-400">
        Поддерживаемые форматы: JPG, PNG
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
