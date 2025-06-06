
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Crop, RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  maxWidth?: number;
  maxHeight?: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio,
  cropShape = 'rect',
  maxWidth = 800,
  maxHeight = 600
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState([1]);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current;
      const centerX = (img.naturalWidth - 200) / 2;
      const centerY = (img.naturalHeight - 200) / 2;
      
      setCrop({
        x: Math.max(0, centerX),
        y: Math.max(0, centerY),
        width: Math.min(200, img.naturalWidth),
        height: Math.min(200, img.naturalHeight)
      });
      setImageLoaded(true);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current) return;
    
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x, imageRef.current.naturalWidth - crop.width));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y, imageRef.current.naturalHeight - crop.height));
    
    setCrop(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getCroppedImage = useCallback(async (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!imageRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = imageRef.current;

      if (!ctx) return;

      // Set canvas size
      canvas.width = crop.width;
      canvas.height = crop.height;

      // Apply transformations
      ctx.save();
      
      // Scale
      const scaleValue = scale[0];
      ctx.scale(scaleValue, scaleValue);
      
      // Rotation
      if (rotation !== 0) {
        ctx.translate(crop.width / 2 / scaleValue, crop.height / 2 / scaleValue);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-crop.width / 2 / scaleValue, -crop.height / 2 / scaleValue);
      }

      // Draw the cropped portion
      ctx.drawImage(
        img,
        crop.x / scaleValue,
        crop.y / scaleValue,
        crop.width / scaleValue,
        crop.height / scaleValue,
        0,
        0,
        crop.width / scaleValue,
        crop.height / scaleValue
      );

      ctx.restore();

      // Apply circular crop if needed
      if (cropShape === 'round') {
        const radius = Math.min(crop.width, crop.height) / 2;
        const centerX = crop.width / 2;
        const centerY = crop.height / 2;

        const imageData = ctx.getImageData(0, 0, crop.width, crop.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const x = (i / 4) % crop.width;
          const y = Math.floor(i / 4 / crop.width);
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          
          if (distance > radius) {
            data[i + 3] = 0; // Make transparent
          }
        }

        ctx.putImageData(imageData, 0, 0);
      }

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    });
  }, [crop, scale, rotation, cropShape]);

  const handleCropConfirm = async () => {
    const croppedBlob = await getCroppedImage();
    onCropComplete(croppedBlob);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Crop & Edit Image
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ZoomIn className="h-4 w-4" />
                  Scale: {scale[0].toFixed(1)}x
                </Label>
                <Slider
                  value={scale}
                  onValueChange={setScale}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Crop Size</Label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={crop.width}
                    onChange={(e) => setCrop(prev => ({ ...prev, width: parseInt(e.target.value) || 200 }))}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    min="50"
                    max={imageRef.current?.naturalWidth || 800}
                  />
                  <span className="text-sm text-muted-foreground">×</span>
                  <input
                    type="number"
                    value={crop.height}
                    onChange={(e) => setCrop(prev => ({ ...prev, height: parseInt(e.target.value) || 200 }))}
                    className="w-20 px-2 py-1 border rounded text-sm"
                    min="50"
                    max={imageRef.current?.naturalHeight || 600}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRotate}
                    className="flex items-center gap-1"
                  >
                    <RotateCw className="h-4 w-4" />
                    Rotate
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Image Preview */}
          <Card className="p-4">
            <div className="relative max-w-full max-h-96 overflow-auto border rounded">
              <div 
                className="relative cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Image to crop"
                  onLoad={handleImageLoad}
                  className="max-w-full h-auto"
                  style={{
                    transform: `scale(${scale[0]}) rotate(${rotation}deg)`,
                    transformOrigin: 'center'
                  }}
                />
                
                {imageLoaded && (
                  <div
                    className="absolute border-2 border-primary bg-primary/20 cursor-move"
                    style={{
                      left: crop.x,
                      top: crop.y,
                      width: crop.width,
                      height: crop.height,
                      borderRadius: cropShape === 'round' ? '50%' : '0'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Move className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleCropConfirm} disabled={!imageLoaded}>
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
