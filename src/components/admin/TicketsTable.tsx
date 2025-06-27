
import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, Clock, User, Mail } from 'lucide-react';

interface Ticket {
  id: string;
  ticket_number: string;
  guest_name?: string;
  guest_email?: string;
  price: number;
  check_in_status: boolean;
  checked_in_at?: string;
  purchase_date: string;
  ticket_types: {
    name: string;
  };
  profiles?: {
    name: string;
    email: string;
  };
}

interface TicketsTableProps {
  tickets: Ticket[];
}

export function TicketsTable({ tickets }: TicketsTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tickets sold yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket Number</TableHead>
            <TableHead>Attendee</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Check-in Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-mono text-sm">
                {ticket.ticket_number}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {ticket.guest_name || ticket.profiles?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {ticket.guest_email || ticket.profiles?.email || 'No email'}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{ticket.ticket_types.name}</Badge>
              </TableCell>
              <TableCell>₦{ticket.price.toLocaleString()}</TableCell>
              <TableCell>
                <Badge
                  variant={ticket.check_in_status ? "default" : "secondary"}
                  className="flex items-center w-fit"
                >
                  {ticket.check_in_status ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Checked In
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {new Date(ticket.purchase_date).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-sm">
                {ticket.checked_in_at 
                  ? new Date(ticket.checked_in_at).toLocaleString()
                  : '-'
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
