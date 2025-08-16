
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
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-6">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 overflow-hidden animate-fade-in">
        <CardHeader className="pb-4 px-4 sm:px-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-semibold">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Event QR Code Generator
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="h-[75vh] overflow-y-auto scroll-smooth p-0">
          <div className="p-4 sm:p-6 space-y-6">
            {/* URL Input Section */}
            <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <Label htmlFor="qr-url" className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                Event Registration URL
              </Label>
              <div className="relative group">
                <Input
                  id="qr-url"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  placeholder="Enter event registration URL"
                  autoComplete="off"
                  className="text-sm pr-12 border-2 border-border/50 focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm hover:bg-background/80"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyQRCodeUrl} 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-primary/10 transition-all duration-200 hover:scale-110"
                  aria-label="Copy URL"
                >
                  <Copy className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/30">
                💡 This URL should contain your access code (e.g., {window.location.origin}/register?code=123456)
              </p>
            </div>
            
            {/* Size Input Section */}
            <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Label htmlFor="qr-size" className="text-sm font-semibold text-foreground/80 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                QR Code Size (pixels)
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="qr-size"
                  type="number"
                  min="128"
                  max="512"
                  step="32"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value) || 256)}
                  className="text-sm w-32 border-2 border-border/50 focus:border-primary/50 transition-all duration-300"
                />
                <div className="text-xs text-muted-foreground bg-accent/20 px-3 py-2 rounded-lg border border-border/30">
                  Recommended: 256px
                </div>
              </div>
            </div>
            
            {/* QR Code Display Section */}
            <div className="flex flex-col items-center space-y-6 py-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-background to-muted/30 rounded-xl p-6 shadow-lg border border-border/50 backdrop-blur-sm">
                  <canvas 
                    ref={canvasRef}
                    className={`rounded-lg transition-all duration-300 block shadow-md ${isGenerating ? 'opacity-50 scale-95' : 'hover:scale-105'}`}
                    style={{ 
                      maxWidth: 'min(100%, 280px)',
                      height: 'auto',
                      width: 'auto'
                    }}
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                        <span className="text-sm text-muted-foreground animate-pulse">Generating QR Code...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <Button 
                  onClick={generateQRCode} 
                  variant="outline"
                  disabled={isGenerating}
                  className="flex-1 h-12 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                >
                  <QrCode className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-medium">{isGenerating ? 'Generating...' : 'Regenerate'}</span>
                </Button>
                <Button 
                  onClick={downloadQRCode}
                  disabled={isGenerating || !qrImageUrl}
                  className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-xl group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4 mr-2 group-hover:translate-y-0.5 transition-transform duration-300" />
                  <span className="font-medium">Download</span>
                </Button>
              </div>

              {/* Alternative download link */}
              {qrImageUrl && (
                <a
                  href={qrImageUrl}
                  download={`${eventName.replace(/\s+/g, '_')}_QR_Code.png`}
                  className="text-sm text-primary hover:text-primary/80 underline transition-all duration-200 hover:scale-105 bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/20"
                  tabIndex={0}
                >
                  📥 Alternative download link
                </a>
              )}
            </div>

            {/* Usage Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-700/30 space-y-4 animate-fade-in backdrop-blur-sm" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-base">How to use this QR Code</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-800/20 rounded-lg border border-blue-200/30">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 dark:text-blue-200">Display on screens or projectors at your event entrance</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-800/20 rounded-lg border border-blue-200/30">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 dark:text-blue-200">Print on flyers, posters, or event materials</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-800/20 rounded-lg border border-blue-200/30">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 dark:text-blue-200">Share digitally via email or social media</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-800/20 rounded-lg border border-blue-200/30">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-blue-800 dark:text-blue-200">Attendees scan to create account and join your event</span>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center space-y-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="bg-muted/30 rounded-lg p-4 border border-border/30 backdrop-blur-sm">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  💡 Having trouble downloading? Try the alternative download link above, or right-click the QR image and select "Save image as..."
                </p>
              </div>
              <div className="bg-accent/20 rounded-lg p-3 border border-border/20">
                <p className="text-xs text-muted-foreground font-medium">
                  🎯 Pro Tip: For best results, use a high contrast background when printing
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;
