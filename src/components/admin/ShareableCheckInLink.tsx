import React, { useState } from 'react';
import { Link2, Copy, ExternalLink, QrCode, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { toast } from 'sonner';
import QRCode from 'qrcode';

const ShareableCheckInLink = () => {
  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  if (!selectedEventId || !selectedEvent) {
    return null;
  }

  const checkInUrl = `${window.location.origin}/check-in/${selectedEventId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(checkInUrl);
      setCopied(true);
      toast.success('Check-in link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  const openInNewTab = () => {
    window.open(checkInUrl, '_blank');
  };

  const generateQRCode = async () => {
    setIsGeneratingQR(true);
    try {
      const dataUrl = await QRCode.toDataURL(checkInUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(dataUrl);
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `check-in-qr-${selectedEvent.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="lg"
          className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Link2 className="h-4 w-4 mr-2" />
          Share Check-In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <Link2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Share Check-In Portal
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Share this link to allow check-ins for {selectedEvent.name}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Event Info */}
          <Card className="rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border-muted/20">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-semibold text-foreground">{selectedEvent.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Event Check-In Portal
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shareable Link */}
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Shareable Link</label>
              <div className="relative">
                <div className="flex items-center rounded-lg border border-border bg-muted/50 p-3 pr-12 min-h-[44px] overflow-hidden">
                  <span className="text-sm text-foreground break-all font-mono leading-relaxed max-w-full">
                    {checkInUrl}
                  </span>
                </div>
                <Button
                  onClick={copyToClipboard}
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-muted"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 font-medium">✓ Copied to clipboard!</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={copyToClipboard}
                variant="outline"
                className="flex-1 rounded-lg"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button 
                onClick={openInNewTab}
                variant="outline"
                className="flex-1 rounded-lg"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button 
                onClick={generateQRCode}
                disabled={isGeneratingQR}
                variant="outline"
                className="flex-1 rounded-lg"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {isGeneratingQR ? 'Generating...' : 'Generate QR'}
              </Button>
            </div>
          </div>

          {/* QR Code Display */}
          {qrCodeDataUrl && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">QR Code</label>
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-white rounded-xl border border-border">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Check-in QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <Button 
                  onClick={downloadQRCode}
                  variant="outline"
                  className="rounded-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          <div className="p-4 rounded-xl bg-muted/30 border border-muted">
            <h4 className="font-medium text-foreground mb-2">How to use:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Share this link with your team or volunteers</li>
              <li>• Anyone with the link can check in attendees</li>
              <li>• QR code scanning and manual entry are both supported</li>
              <li>• Real-time updates across all devices</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareableCheckInLink;