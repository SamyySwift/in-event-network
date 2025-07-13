import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarketplaceQRCodeProps {
  data: {
    id: string;
    organization_name: string;
    category: 'sponsor' | 'partner' | 'exhibitor';
    website_link?: string;
    qr_code_data?: string;
  };
  size?: number;
}

export function MarketplaceQRCode({ data, size = 200 }: MarketplaceQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    generateQRCode();
  }, [data]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      const qrData = data.qr_code_data || JSON.stringify({
        type: data.category,
        name: data.organization_name,
        website: data.website_link || '',
        id: data.id
      });

      await QRCode.toCanvas(canvasRef.current, qrData, {
        width: size,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff',
        },
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = `${data.organization_name.replace(/\s+/g, '_')}_QR.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();

    toast({
      title: "QR Code Downloaded",
      description: `QR code for ${data.organization_name} has been downloaded.`,
    });
  };

  const copyQRData = () => {
    const qrData = data.qr_code_data || JSON.stringify({
      type: data.category,
      name: data.organization_name,
      website: data.website_link || '',
      id: data.id
    });

    navigator.clipboard.writeText(qrData);
    toast({
      title: "QR Data Copied",
      description: "QR code data has been copied to clipboard.",
    });
  };

  const getCategoryColor = () => {
    switch (data.category) {
      case 'sponsor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'partner': return 'bg-green-100 text-green-800 border-green-200';
      case 'exhibitor': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-fit">
      <CardHeader className="text-center pb-3">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <QrCode className="h-5 w-5" />
          QR Code
        </CardTitle>
        <CardDescription>
          {data.organization_name}
        </CardDescription>
        <Badge className={getCategoryColor()}>
          {data.category.charAt(0).toUpperCase() + data.category.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            className="border rounded-lg shadow-sm"
          />
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadQRCode}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyQRData}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}