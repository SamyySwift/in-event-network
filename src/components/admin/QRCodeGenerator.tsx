
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
    <div className="w-full max-w-lg mx-auto p-4">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <QrCode className="h-5 w-5 text-primary" />
            Event QR Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 max-h-[80vh] overflow-y-auto px-4 sm:px-6 pb-6">
          <div className="space-y-3">
            <Label htmlFor="qr-url" className="text-sm font-medium">Event Registration URL</Label>
            <div className="flex gap-2">
              <Input
                id="qr-url"
                value={qrUrl}
                onChange={(e) => setQrUrl(e.target.value)}
                placeholder="Enter event registration URL"
                autoComplete="off"
                className="text-sm"
              />
              <Button variant="outline" size="icon" onClick={copyQRCodeUrl} className="flex-shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This URL should contain your access code (e.g., {window.location.origin}/register?code=123456)
            </p>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="qr-size" className="text-sm font-medium">QR Code Size</Label>
            <Input
              id="qr-size"
              type="number"
              min="128"
              max="512"
              value={qrSize}
              onChange={(e) => setQrSize(parseInt(e.target.value) || 256)}
              className="text-sm"
            />
          </div>
          
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="relative bg-white rounded-lg p-4 shadow-sm border">
              <canvas 
                ref={canvasRef}
                className={`rounded-lg transition-opacity ${isGenerating ? 'opacity-50' : ''}`}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </div>

            {/* Alternative direct-image download for users if canvas fails */}
            {qrImageUrl && (
              <a
                href={qrImageUrl}
                download={`${eventName.replace(/\s+/g, '_')}_QR_Code.png`}
                className="text-xs text-blue-600 underline hover:text-blue-800 transition-colors"
                tabIndex={0}
              >
                Download as Image (alternative)
              </a>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button 
                onClick={generateQRCode} 
                variant="outline"
                disabled={isGenerating}
                className="flex-1 text-sm"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Regenerate'}
              </Button>
              <Button 
                onClick={downloadQRCode}
                disabled={isGenerating || !qrImageUrl}
                className="flex-1 bg-primary hover:bg-primary/90 text-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-800 space-y-3">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">How to use this QR Code:</h4>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1.5 leading-relaxed">
              <li>• Display on screens or projectors at your event entrance</li>
              <li>• Print on flyers, posters, or event materials</li>
              <li>• Share digitally via email or social media</li>
              <li>• Attendees scan to create account and join your event</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground text-center leading-relaxed px-2">
            Having trouble downloading? Try the alternative download link above, or right click the QR image and "Save image as...".
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;
