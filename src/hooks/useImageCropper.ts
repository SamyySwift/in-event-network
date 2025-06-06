
import { useState, useCallback } from 'react';

interface UseImageCropperOptions {
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  maxWidth?: number;
  maxHeight?: number;
}

export const useImageCropper = (options: UseImageCropperOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  const openCropper = useCallback((file: File) => {
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setIsOpen(true);
  }, []);

  const closeCropper = useCallback(() => {
    setIsOpen(false);
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc('');
    setOriginalFile(null);
  }, [imageSrc]);

  const handleCropComplete = useCallback((croppedBlob: Blob, onComplete?: (file: File) => void) => {
    if (originalFile && onComplete) {
      // Create a new File from the blob with the original filename
      const croppedFile = new File([croppedBlob], originalFile.name, {
        type: croppedBlob.type,
        lastModified: Date.now(),
      });
      onComplete(croppedFile);
    }
    closeCropper();
  }, [originalFile, closeCropper]);

  return {
    isOpen,
    imageSrc,
    openCropper,
    closeCropper,
    handleCropComplete,
    options
  };
};
