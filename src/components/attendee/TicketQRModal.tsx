
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TicketQRCode from './TicketQRCode';

interface TicketQRModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  } | null;
}

const TicketQRModal: React.FC<TicketQRModalProps> = ({ isOpen, onClose, ticket }) => {
  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Your Ticket</DialogTitle>
        </DialogHeader>
        <TicketQRCode ticket={ticket} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default TicketQRModal;
