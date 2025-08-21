
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Share2, Copy, ExternalLink, QrCode, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode';

export function ShareableTicketLink() {
  const { selectedEventId } = useAdminEventContext();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch event key
  const { data: event } = useQuery({
    queryKey: ['event-key', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return null;
      
      const { data, error } = await supabase
        .from('events')
        .select('event_key')
        .eq('id', selectedEventId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedEventId,
  });

  const ticketUrl = event ? `${window.location.origin}/buy-tickets/${event.event_key}` : '';

  const copyToClipboard = async () => {
    if (!ticketUrl) return;
    
    try {
      await navigator.clipboard.writeText(ticketUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Ticket purchase link copied to clipboard",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const openInNewTab = () => {
    if (ticketUrl) {
      window.open(ticketUrl, '_blank');
    }
  };

  const generateQRCode = async () => {
    if (!ticketUrl) return;
    
    setIsGeneratingQR(true);
    try {
      const qrDataUrl = await QRCode.toDataURL(ticketUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Add logo overlay
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      canvas.width = 256;
      canvas.height = 256;
      
      // Draw QR code
      const qrImg = new Image();
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });
      ctx.drawImage(qrImg, 0, 0);
      
      // Add logo
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          const logoSize = 40;
          const x = (canvas.width - logoSize) / 2;
          const y = (canvas.height - logoSize) / 2;
          
          // Draw white background for logo
          ctx.fillStyle = 'white';
          ctx.fillRect(x - 4, y - 4, logoSize + 8, logoSize + 8);
          
          // Draw logo
          ctx.drawImage(logoImg, x, y, logoSize, logoSize);
          resolve(true);
        };
        logoImg.onerror = reject;
        logoImg.src = '/lovable-uploads/c1f92d5a-00e5-43d5-8607-33a3e08b6021.png';
      });
      
      const finalDataUrl = canvas.toDataURL();
      setQrCodeDataUrl(finalDataUrl);
      toast({
        title: "QR Code Generated",
        description: "QR code for the ticket link has been generated",
      });
    } catch (error) {
      toast({
        title: "QR Generation Failed",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl || !event) return;
    
    const link = document.createElement('a');
    link.download = `ticket-qr-${event.event_key}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "QR code has been saved to your downloads",
    });
  };

  if (!selectedEventId || !event) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Shareable Ticket Link
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Share this link with potential attendees so they can purchase tickets directly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={ticketUrl}
            readOnly
            className="font-mono text-sm flex-1"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
              <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openInNewTab}
              className="shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="ml-2">Preview</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateQRCode}
              disabled={isGeneratingQR}
              className="shrink-0"
            >
              <QrCode className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">
                {isGeneratingQR ? 'Generating...' : 'Generate QR'}
              </span>
              <span className="ml-2 sm:hidden">
                {isGeneratingQR ? 'Generating...' : 'QR'}
              </span>
            </Button>
          </div>
        </div>

        {qrCodeDataUrl && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex flex-col items-center space-y-3">
              <img 
                src={qrCodeDataUrl} 
                alt="Ticket Link QR Code" 
                className="border rounded-lg"
                style={{ width: '200px', height: '200px' }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQRCode}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Scan this QR code to access the ticket purchase page
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          This link allows anyone to purchase tickets without needing to log in or register.
        </div>
      </CardContent>
    </Card>
  );
}
