
import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, Clock, User, Mail, Phone, Search, Users, FormInput } from 'lucide-react';
import { useAdminCheckIns } from '@/hooks/useAdminCheckIns';
import { EditTicketTypeFormDialog } from './EditTicketTypeFormDialog';

interface Ticket {
  id: string;
  ticket_number: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
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
  form_responses?: Array<{
    id: string;
    response_value: any;
    ticket_form_fields: {
      label: string;
      field_type: string;
      field_order: number;
    };
  }>;
}

interface TicketsTableProps {
  tickets: Ticket[];
}

export function TicketsTable({ tickets }: TicketsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicketType, setSelectedTicketType] = useState<{id: string, name: string} | null>(null);
  const { bulkCheckInAll, isBulkCheckingIn } = useAdminCheckIns();

  // Filter tickets based on search term
  const filteredTickets = useMemo(() => {
    if (!searchTerm.trim()) return tickets;
    
    const searchLower = searchTerm.toLowerCase();
    return tickets.filter(ticket => {
      const name = (ticket.guest_name || ticket.profiles?.name || '').toLowerCase();
      const email = (ticket.guest_email || ticket.profiles?.email || '').toLowerCase();
      const phone = (ticket.guest_phone || '').toLowerCase();
      
      return name.includes(searchLower) || 
             email.includes(searchLower) || 
             phone.includes(searchLower);
    });
  }, [tickets, searchTerm]);

  const uncheckedCount = tickets.filter(ticket => !ticket.check_in_status).length;

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No tickets sold yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {uncheckedCount > 0 && (
          <Button
            onClick={() => bulkCheckInAll.mutate()}
            disabled={isBulkCheckingIn}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            {isBulkCheckingIn ? 'Checking in...' : `Bulk Check-In (${uncheckedCount})`}
          </Button>
        )}
      </div>

      {/* Results count */}
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredTickets.length} of {tickets.length} tickets
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket Number</TableHead>
              <TableHead>Attendee</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Form Data</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Purchase Date</TableHead>
              <TableHead>Check-in Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
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
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm flex items-center">
                      <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {ticket.guest_email || ticket.profiles?.email || 'No email'}
                      </span>
                    </div>
                    {ticket.guest_phone && (
                      <div className="text-sm flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">{ticket.guest_phone}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{ticket.ticket_types.name}</Badge>
                </TableCell>
                <TableCell>
                  {ticket.form_responses && ticket.form_responses.length > 0 ? (
                    <div className="space-y-1">
                      {ticket.form_responses.slice(0, 2).map((response) => (
                        <div key={response.id} className="text-xs">
                          <span className="font-medium text-muted-foreground">
                            {response.ticket_form_fields.label}:
                          </span>{' '}
                          <span className="text-foreground">
                            {typeof response.response_value === 'string' 
                              ? response.response_value 
                              : JSON.stringify(response.response_value)
                            }
                          </span>
                        </div>
                      ))}
                      {ticket.form_responses.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{ticket.form_responses.length - 2} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <FormInput className="h-3 w-3 mr-1" />
                      No form data
                    </div>
                  )}
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
    </div>
  );
}
