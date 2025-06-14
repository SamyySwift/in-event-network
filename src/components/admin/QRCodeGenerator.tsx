
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, QrCode, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeGeneratorProps {
  eventName?: string;
  eventUrl?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  eventName = "Connect Event", 
  eventUrl = window.location.origin 
}) => {
  const [qrUrl, setQrUrl] = useState(eventUrl);
  const [qrSize, setQrSize] = useState(256);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null); // add state
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    setIsGenerating(true);
    // Using QR Server API for QR code generation
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrUrl)}`;
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvasRef.current!.width = qrSize;
        canvasRef.current!.height = qrSize;
        ctx?.clearRect(0, 0, qrSize, qrSize);
        ctx?.drawImage(img, 0, 0, qrSize, qrSize);
        setIsGenerating(false);
        setQrImageUrl(qrApiUrl); // set the url for fallback download
        toast.success("QR Code generated successfully!");
      };

      img.onerror = (e) => {
        setIsGenerating(false);
        setQrImageUrl(null);
        toast.error("Failed to generate QR code");
        console.error("QR image error", e);
      };

      img.crossOrigin = 'anonymous';
      img.src = qrApiUrl;
    }
  };

  const downloadQRCode = () => {
    if (canvasRef.current) {
      try {
        // Only allow download if something's rendered in canvas
        const ctx = canvasRef.current.getContext('2d');
        const pixel = ctx?.getImageData(0, 0, 1, 1).data;
        if (!pixel || pixel.every(x => x === 0)) {
          toast.error("QR Code is not loaded yet. Please try again.");
          return;
        }
        // Create download link
        const link = document.createElement('a');
        const fileName = `${eventName.replace(/\s+/g, '_')}_QR_Code.png`;
        
        // Convert canvas to blob and create download URL
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("QR Code downloaded successfully!");
          } else {
            toast.error("Failed to create download file from QR canvas.");
            console.error("Canvas toBlob() returned null");
          }
        }, 'image/png', 1.0);
      } catch (error) {
        console.error('Download error:', error);
        toast.error("Failed to download QR code. Try the image download link below.");
      }
    } else {
      toast.error("No QR code available to download");
    }
  };

  const copyQRCodeUrl = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      toast.success("URL copied to clipboard!");
    } catch (error) {
      console.error('Copy error:', error);
      toast.error("Failed to copy URL");
    }
  };

  React.useEffect(() => {
    generateQRCode();
    // eslint-disable-next-line
  }, [qrUrl, qrSize]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Event QR Code Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qr-url">Event Registration URL</Label>
          <div className="flex gap-2">
            <Input
              id="qr-url"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              placeholder="Enter event registration URL"
              autoComplete="off"
            />
            <Button variant="outline" size="icon" onClick={copyQRCodeUrl}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This URL should contain your access code (e.g., {window.location.origin}/register?code=123456)
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="qr-size">QR Code Size</Label>
          <Input
            id="qr-size"
            type="number"
            min="128"
            max="512"
            value={qrSize}
            onChange={(e) => setQrSize(parseInt(e.target.value) || 256)}
          />
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <canvas 
              ref={canvasRef}
              className={`border rounded-lg shadow-sm ${isGenerating ? 'opacity-50' : ''}`}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {/* Alternative direct-image download for users if canvas fails */}
          {qrImageUrl && (
            <a
              href={qrImageUrl}
              download={`${eventName.replace(/\s+/g, '_')}_QR_Code.png`}
              className="text-xs text-blue-600 underline hover:text-blue-800 mt-2"
              tabIndex={0}
            >
              Download as Image (alternative)
            </a>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={generateQRCode} 
              variant="outline"
              disabled={isGenerating}
            >
              <QrCode className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Regenerate'}
            </Button>
            <Button 
              onClick={downloadQRCode}
              disabled={isGenerating || !qrImageUrl}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Having trouble downloading? Try the alternative download link above, or right click the QR image and "Save image as...".
        </p>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
