import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Download, Copy, Share, QrCode } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col items-center space-y-4">
        <div className="hover-scale">
          <canvas
            ref={canvasRef}
            className="border rounded-lg shadow-sm transition-shadow duration-200 hover:shadow-md"
          />
        </div>
        
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Scan this QR code to access the sponsor form
          </p>
          <div className="max-w-full overflow-hidden">
            <p className="text-xs text-muted-foreground break-all bg-muted p-3 rounded-xl">
              {formLink}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button 
          onClick={handleDownloadQR}
          className="rounded-xl transition-all duration-200 hover-scale"
          variant="default"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        
        <Button 
          onClick={handleCopyLink}
          className="rounded-xl transition-all duration-200 hover-scale"
          variant="outline"
        >
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
        
        <Button 
          onClick={handleShare}
          className="rounded-xl transition-all duration-200 hover-scale"
          variant="outline"
        >
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h4 className="font-medium text-primary mb-3 flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          How to use this QR code:
        </h4>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Download and include in event flyers or posters</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Share on social media to attract sponsors</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Print on business cards or promotional materials</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Display on screens during events or presentations</span>
          </li>
        </ul>
      </div>
    </div>
  );
}