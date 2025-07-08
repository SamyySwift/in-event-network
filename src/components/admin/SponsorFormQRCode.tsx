import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Download, Copy, Share } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SponsorFormQRCodeProps {
  formLink: string;
  formTitle: string;
}

export function SponsorFormQRCode({ formLink, formTitle }: SponsorFormQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && formLink) {
      QRCode.toCanvas(canvasRef.current, formLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    }
  }, [formLink]);

  const handleDownloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${formTitle.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      
      toast({
        title: "QR Code Downloaded",
        description: "QR code has been saved to your downloads folder",
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formLink);
    toast({
      title: "Link Copied",
      description: "Form link has been copied to clipboard",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: formTitle,
          text: `Fill out our ${formTitle}`,
          url: formLink,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <canvas
          ref={canvasRef}
          className="border rounded-lg shadow-sm"
        />
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Scan this QR code to access the sponsor form
          </p>
          <p className="text-xs text-muted-foreground break-all bg-muted p-2 rounded">
            {formLink}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          onClick={handleDownloadQR}
          className="flex-1 rounded-xl"
          variant="default"
        >
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
        
        <Button 
          onClick={handleCopyLink}
          className="flex-1 rounded-xl"
          variant="outline"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
        
        <Button 
          onClick={handleShare}
          className="flex-1 rounded-xl"
          variant="outline"
        >
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">How to use this QR code:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Download and include in event flyers or posters</li>
          <li>• Share on social media to attract sponsors</li>
          <li>• Print on business cards or promotional materials</li>
          <li>• Display on screens during events or presentations</li>
        </ul>
      </div>
    </div>
  );
}