
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTickets } from '@/hooks/useTickets';
import { Loader, Ticket } from 'lucide-react';
import TicketCard from './TicketCard';
import QRCodeModal from './QRCodeModal';

const TicketWallet: React.FC = () => {
  const { useUserTickets } = useTickets();
  const { data: tickets, isLoading, error } = useUserTickets();
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  const handleShowQR = (qrData: string) => {
    setSelectedQR(qrData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Failed to load your tickets. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            My Tickets
          </CardTitle>
          <CardDescription>
            Your purchased event tickets will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              You haven't purchased any tickets yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            My Tickets ({tickets.length})
          </CardTitle>
          <CardDescription>
            Your purchased event tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={{
                  ...ticket,
                  ticket_types: ticket.ticket_type,
                  events: ticket.events
                }}
                onShowQR={handleShowQR}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <QRCodeModal
        isOpen={!!selectedQR}
        onClose={() => setSelectedQR(null)}
        qrData={selectedQR || ''}
        title="Ticket QR Code"
      />
    </>
  );
};

export default TicketWallet;
