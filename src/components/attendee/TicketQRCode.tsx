
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
    ticket_types: {
      name: string;
      description?: string;
    };
    events: {
      name: string;
      start_time: string;
      location?: string;
    };
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
      eventName: ticket.events.name,
      ticketType: ticket.ticket_types.name,
      verifyUrl: `${window.location.origin}/admin/verify-ticket/${ticket.ticket_number}`
    });

    // Generate QR code using QR Server API
    const qrSize = 300;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData)}`;
    setQrImageUrl(qrUrl);
  }, [ticket]);

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticket.ticket_number}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code:', error);
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
          <h3 className="font-semibold text-lg">{ticket.events.name}</h3>
          <p className="text-sm text-muted-foreground">{ticket.ticket_types.name}</p>
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
            <strong>Event Date:</strong> {formatDate(ticket.events.start_time)}
          </div>
          {ticket.events.location && (
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
