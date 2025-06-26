
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QrCode, Calendar, MapPin, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

type TicketCardProps = {
  ticket: {
    id: string;
    ticket_number: string;
    price: number;
    check_in_status: boolean;
    checked_in_at?: string;
    qr_code_data: string;
    events: {
      name: string;
      start_time: string;
      location?: string;
    };
    ticket_types: {
      name: string;
      description?: string;
    };
  };
  onShowQR: (qrData: string) => void;
};

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onShowQR }) => {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{ticket.events.name}</CardTitle>
          <Badge variant={ticket.check_in_status ? "default" : "secondary"}>
            {ticket.check_in_status ? (
              <>
                <CheckCircle className="w-4 h-4 mr-1" />
                Checked In
              </>
            ) : (
              "Not Checked In"
            )}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Ticket #{ticket.ticket_number}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(ticket.events.start_time), 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(ticket.events.start_time), 'p')}</span>
          </div>
          {ticket.events.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{ticket.events.location}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{ticket.ticket_types.name}</div>
              {ticket.ticket_types.description && (
                <div className="text-sm text-muted-foreground">
                  {ticket.ticket_types.description}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-bold">₦{ticket.price.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {ticket.check_in_status && ticket.checked_in_at && (
          <div className="text-xs text-muted-foreground">
            Checked in on {format(new Date(ticket.checked_in_at), 'PPp')}
          </div>
        )}

        <Button
          onClick={() => onShowQR(ticket.qr_code_data)}
          className="w-full"
          variant={ticket.check_in_status ? "outline" : "default"}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Show QR Code
        </Button>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
