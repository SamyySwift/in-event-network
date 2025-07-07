
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
  // Add custom form responses
  ticket_form_responses?: {
    form_field_id: string;
    response_value: any;
    ticket_form_fields: {
      label: string;
      field_type: string;
      field_options?: any;
    };
  }[];
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
              <TableHead>Ticket Info</TableHead>
              <TableHead>Attendee</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Custom Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{ticket.ticket_types.name}</p>
                    <p className="text-xs text-gray-500 font-mono">#{ticket.ticket_number}</p>
                    <p className="text-xs text-gray-500">₦{ticket.price.toLocaleString()}</p>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {ticket.guest_name || ticket.profiles?.name || 'N/A'}
                    </span>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span>{ticket.guest_email || ticket.profiles?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{ticket.guest_phone || 'N/A'}</span>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  {ticket.ticket_form_responses && ticket.ticket_form_responses.length > 0 ? (
                    <div className="space-y-1 max-w-xs">
                      {ticket.ticket_form_responses.slice(0, 2).map((response, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-medium text-gray-600">
                            {response.ticket_form_fields.label}:
                          </span>
                          <span className="ml-1 text-gray-800">
                            {renderFormResponsePreview(response.response_value, response.ticket_form_fields.field_type)}
                          </span>
                        </div>
                      ))}
                      {ticket.ticket_form_responses.length > 2 && (
                        <p className="text-xs text-gray-500 italic">
                          +{ticket.ticket_form_responses.length - 2} more fields
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">No custom data</span>
                  )}
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
    </div>
  );
}

const renderFormResponsePreview = (value: any, fieldType: string) => {
  if (!value) return 'N/A';
  
  switch (fieldType) {
    case 'checkboxes':
      if (Array.isArray(value)) {
        return value.slice(0, 2).join(', ') + (value.length > 2 ? '...' : '');
      }
      return String(value);
    case 'paragraph':
      return String(value).substring(0, 50) + (String(value).length > 50 ? '...' : '');
    default:
      return String(value).substring(0, 30) + (String(value).length > 30 ? '...' : '');
  }
};
