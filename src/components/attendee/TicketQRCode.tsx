
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, Download, CheckCircle, Clock } from 'lucide-react';

interface TicketQRCodeProps {
  ticket: {
    id: string;
    ticket_number: string;
    price: number;
    check_in_status: boolean;
    checked_in_at?: string;
    purchase_date: string;
    qr_code_data: string;
    ticket_types?: {
      name: string;
      description?: string;
    } | null;
    events?: {
      name: string;
      start_time: string;
      location?: string;
    } | null;
    guest_name?: string;
  };
  onClose: () => void;
}

const TicketQRCode: React.FC<TicketQRCodeProps> = ({ ticket, onClose }) => {
  const [qrImageUrl, setQrImageUrl] = React.useState<string>('');

  React.useEffect(() => {
    // Create QR code data URL that can be scanned by admin
    const qrData = JSON.stringify({
      ticketNumber: ticket.ticket_number,
      ticketId: ticket.id,
      eventName: ticket.events?.name || 'Unknown Event',
      ticketType: ticket.ticket_types?.name || 'Unknown Ticket Type',
      verifyUrl: `${window.location.origin}/admin/verify-ticket/${ticket.ticket_number}`
    });

    // Generate QR code with logo using QR Server API
    const qrSize = 300;
    const logoUrl = encodeURIComponent('https://89ffd642-3173-4004-8c28-eb0eea097a15.lovableproject.com/lovable-uploads/c1f92d5a-00e5-43d5-8607-33a3e08b6021.png');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData)}&logo=${logoUrl}`;
    setQrImageUrl(qrUrl);
  }, [ticket]);

  const downloadQRCode = async () => {
    try {
      // Generate complete ticket card instead of just QR code
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set canvas size for ticket card
      canvas.width = 600;
      canvas.height = 400;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add border
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      // Add dashed border for ticket effect
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.setLineDash([]);

      // Title
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Your Ticket', 30, 50);

      // Ticket type and price
      ctx.font = 'bold 20px Arial';
      ctx.fillText(ticket.ticket_types?.name || 'General Admission', 30, 90);
      
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = '#059669';
      const price = `₦${(ticket.price / 100).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      const priceWidth = ctx.measureText(price).width;
      ctx.fillText(price, canvas.width - priceWidth - 30, 90);

      // Ticket details
      ctx.fillStyle = '#374151';
      ctx.font = '16px Arial';
      
      ctx.fillText('Ticket Number:', 30, 130);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(ticket.ticket_number, 160, 130);

      ctx.fillStyle = '#374151';
      ctx.font = '16px Arial';
      ctx.fillText('Name:', 30, 160);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(ticket.guest_name || 'Guest', 80, 160);

      // Event info
      if (ticket.events) {
        ctx.fillStyle = '#374151';
        ctx.font = '14px Arial';
        ctx.fillText('Event:', 30, 200);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(ticket.events.name, 80, 200);

        if (ticket.events.location) {
          ctx.fillStyle = '#374151';
          ctx.font = '14px Arial';
          ctx.fillText('Location:', 30, 220);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 14px Arial';
          ctx.fillText(ticket.events.location, 100, 220);
        }

        ctx.fillStyle = '#374151';
        ctx.font = '14px Arial';
        ctx.fillText('Date:', 30, 240);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(formatDate(ticket.events.start_time), 70, 240);
      }

      // Generate QR code with logo
      const qrData = JSON.stringify({
        ticketNumber: ticket.ticket_number,
        ticketId: ticket.id,
        eventName: ticket.events?.name || 'Unknown Event',
        ticketType: ticket.ticket_types?.name || 'Unknown Ticket Type',
        verifyUrl: `${window.location.origin}/admin/verify-ticket/${ticket.ticket_number}`
      });

      const qrSize = 120;
      const logoUrl = encodeURIComponent('https://89ffd642-3173-4004-8c28-eb0eea097a15.lovableproject.com/lovable-uploads/c1f92d5a-00e5-43d5-8607-33a3e08b6021.png');
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData)}&logo=${logoUrl}`;
      
      // Load and draw QR code
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        qrImg.onload = () => {
          // Draw QR code
          ctx.drawImage(qrImg, canvas.width - 150, canvas.height - 170, 120, 120);
          
          // Add "Scan at venue" text
          ctx.fillStyle = '#6b7280';
          ctx.font = '12px Arial';
          const scanText = 'Scan at venue';
          const scanTextWidth = ctx.measureText(scanText).width;
          ctx.fillText(scanText, canvas.width - 150 + (120 - scanTextWidth) / 2, canvas.height - 30);
          
          resolve(true);
        };
        qrImg.onerror = reject;
        qrImg.src = qrUrl;
      });

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `ticket-${ticket.ticket_number}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to download ticket card:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-lg">
          <Ticket className="h-5 w-5" />
          Ticket QR Code
        </CardTitle>
        <Badge 
          variant={ticket.check_in_status ? "default" : "secondary"}
          className="mx-auto"
        >
          {ticket.check_in_status ? (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Checked In
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Not Checked In
            </div>
          )}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4 px-2 sm:px-6">
        {/* Event Information */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">{ticket.events?.name || 'Unknown Event'}</h3>
          <p className="text-sm text-muted-foreground">{ticket.ticket_types?.name || 'Unknown Ticket Type'}</p>
          <p className="text-xs text-muted-foreground">#{ticket.ticket_number}</p>
          {ticket.guest_name && (
            <p className="text-sm font-medium">{ticket.guest_name}</p>
          )}
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          {qrImageUrl ? (
            <div className="border rounded-lg p-2 sm:p-4 bg-white">
              <img 
                src={qrImageUrl} 
                alt="Ticket QR Code"
                className="w-48 h-48 sm:w-64 sm:h-64"
              />
            </div>
          ) : (
            <div className="w-48 h-48 sm:w-64 sm:h-64 border rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>
            <strong>Event Date:</strong> {ticket.events?.start_time ? formatDate(ticket.events.start_time) : 'Unknown Date'}
          </div>
          {ticket.events?.location && (
            <div>
              <strong>Location:</strong> {ticket.events.location}
            </div>
          )}
          <div>
            <strong>Purchased:</strong> {formatDate(ticket.purchase_date)}
          </div>
          {ticket.checked_in_at && (
            <div>
              <strong>Checked In:</strong> {formatDate(ticket.checked_in_at)}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-purple-50 p-3 rounded-lg text-sm">
          <p className="text-purple-800">
            <strong>Instructions:</strong> Show this QR code to event staff for check-in. 
            The QR code contains your ticket verification information.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={downloadQRCode} 
            variant="outline" 
            className="w-full sm:flex-1 h-12 text-base"
            disabled={!qrImageUrl}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={onClose} className="w-full sm:flex-1 h-12 text-base">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketQRCode;
