
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Ticket, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TicketVerifierProps {
  ticketNumber: string;
  onCheckIn?: (ticketId: string) => void;
  onCancel?: () => void;
}

const TicketVerifier: React.FC<TicketVerifierProps> = ({ 
  ticketNumber, 
  onCheckIn, 
  onCancel 
}) => {
  const { toast } = useToast();

  const { data: ticketData, isLoading, error } = useQuery({
    queryKey: ['verify-ticket', ticketNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_tickets')
        .select(`
          *,
          ticket_types (
            name,
            description
          ),
          events (
            name,
            start_time,
            location
          ),
          profiles!event_tickets_user_id_fkey (
            name
          )
        `)
        .eq('ticket_number', ticketNumber)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!ticketNumber,
  });

  const handleCheckIn = () => {
    if (ticketData && onCheckIn) {
      onCheckIn(ticketData.id);
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

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Verifying ticket...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !ticketData) {
    return (
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-red-600">
            <X className="h-5 w-5" />
            Invalid Ticket
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-red-600">
            Ticket #{ticketNumber} not found or invalid.
          </p>
          {onCancel && (
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Ticket className="h-5 w-5" />
          Ticket Verification
        </CardTitle>
        <Badge 
          variant={ticketData.check_in_status ? "default" : "secondary"}
          className="mx-auto"
        >
          {ticketData.check_in_status ? "Already Checked In" : "Ready for Check-in"}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-lg">{ticketData.events.name}</h3>
          <p className="text-sm text-muted-foreground">{ticketData.ticket_types.name}</p>
          <p className="text-xs text-muted-foreground">#{ticketData.ticket_number}</p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(ticketData.events.start_time)}</span>
          </div>
          {ticketData.events.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{ticketData.events.location}</span>
            </div>
          )}
          <div>
            <strong>Attendee:</strong> {ticketData.guest_name || ticketData.profiles?.name || 'N/A'}
          </div>
          <div>
            <strong>Price:</strong> ₦{ticketData.price.toLocaleString()}
          </div>
          {ticketData.checked_in_at && (
            <div>
              <strong>Checked in:</strong> {formatDate(ticketData.checked_in_at)}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {!ticketData.check_in_status && onCheckIn && (
            <Button onClick={handleCheckIn} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Check In
            </Button>
          )}
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketVerifier;
