import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File, imageUrl: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      // give a little delay if you like
      setTimeout(() => {
        setUploading(false);
        onImageUpload(file, imageUrl);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative border border-stone-200 rounded-lg p-16 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-stone-400 bg-stone-100' 
            : 'hover:border-stone-300 hover:bg-stone-50'
        } ${uploading ? 'pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-12 h-12 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div>
            <p className="text-stone-600 font-light">Processing...</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
                <Upload className="w-8 h-8 text-stone-600" />
              </div>
              <p className="text-stone-600 font-light text-lg mb-2">
                Upload your item
              </p>
              <p className="text-stone-500 text-sm font-light">
                Drag and drop, or click to select
              </p>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <button className="inline-flex items-center space-x-2 bg-stone-800 hover:bg-stone-900 text-stone-50 px-6 py-3 rounded-md font-light transition-colors">
              <Upload className="w-4 h-4" />
              <span>Choose File</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
