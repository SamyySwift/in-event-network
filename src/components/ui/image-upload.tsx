
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Crop } from 'lucide-react';
import { ImageCropper } from './image-cropper';
import { useImageCropper } from '@/hooks/useImageCropper';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  currentImageUrl?: string;
  label?: string;
  accept?: string;
  enableCropping?: boolean;
  cropShape?: 'rect' | 'round';
  aspectRatio?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  currentImageUrl,
  label = "Upload Image",
  accept = "image/*",
  enableCropping = true,
  cropShape = 'rect',
  aspectRatio
}) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isOpen, imageSrc, openCropper, closeCropper, handleCropComplete } = useImageCropper({
    cropShape,
    aspectRatio
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      if (enableCropping) {
        openCropper(file);
      } else {
        processFile(file);
      }
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
  };

  const handleCropConfirm = (croppedBlob: Blob) => {
    handleCropComplete(croppedBlob, (croppedFile) => {
      processFile(croppedFile);
    });
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditCrop = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border"
            style={{
              borderRadius: cropShape === 'round' ? '50%' : '8px'
            }}
          />
          <div className="absolute top-2 right-2 flex gap-1">
            {enableCropping && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={handleEditCrop}
                title="Edit/Crop Image"
              >
                <Crop className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Click to upload an image</p>
          <p className="text-xs text-gray-400 mt-1">
            PNG, JPG, GIF up to 5MB
            {enableCropping && " • Cropping available"}
          </p>
        </div>
      )}
      
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {isOpen && (
        <ImageCropper
          imageSrc={imageSrc}
          onCropComplete={handleCropConfirm}
          onCancel={closeCropper}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
        />
      )}
    </div>
  );
};
