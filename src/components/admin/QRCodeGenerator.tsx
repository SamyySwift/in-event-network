
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = () => {
    // Using QR Server API for QR code generation
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrUrl)}`;
    
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvasRef.current!.width = qrSize;
        canvasRef.current!.height = qrSize;
        ctx?.drawImage(img, 0, 0, qrSize, qrSize);
        toast.success("QR Code generated successfully!");
      };
      
      img.onerror = () => {
        toast.error("Failed to generate QR code");
      };
      
      img.src = qrApiUrl;
    }
  };

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${eventName.replace(/\s+/g, '_')}_QR_Code.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      toast.success("QR Code downloaded!");
    }
  };

  const copyQRCodeUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    toast.success("URL copied to clipboard!");
  };

  React.useEffect(() => {
    generateQRCode();
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
          <Label htmlFor="qr-url">Event URL</Label>
          <div className="flex gap-2">
            <Input
              id="qr-url"
              value={qrUrl}
              onChange={(e) => setQrUrl(e.target.value)}
              placeholder="Enter event URL"
            />
            <Button variant="outline" size="icon" onClick={copyQRCodeUrl}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
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
          <canvas 
            ref={canvasRef}
            className="border rounded-lg shadow-sm"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          
          <div className="flex gap-2">
            <Button onClick={generateQRCode} variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
            <Button onClick={downloadQRCode}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
