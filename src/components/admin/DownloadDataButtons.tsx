import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Users, Ticket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminTickets } from '@/hooks/useAdminTickets';
import { exportAttendeesData, exportTicketsData } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';

interface DownloadDataButtonsProps {
  attendees: any[];
  eventName: string;
}

interface EnhancedAttendeeData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
  ticket_type: string | null;
  check_in_status: string;
  event_name: string | null;
  joined_at: string;
}

export const DownloadDataButtons: React.FC<DownloadDataButtonsProps> = ({
  attendees,
  eventName
}) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { eventTickets, isLoadingTickets } = useAdminTickets();
  const { selectedEventId } = useAdminEventContext();
  const { toast } = useToast();

  // Function to get enhanced attendee data with ticket information
  const getEnhancedAttendeeData = async (): Promise<EnhancedAttendeeData[]> => {
    if (!selectedEventId) {
      throw new Error('No event selected');
    }

    // Get attendees with their ticket information
    const { data: attendeesWithTickets, error } = await supabase
      .from('event_participants')
      .select(`
        id,
        user_id,
        created_at,
        joined_at,
        profiles!fk_event_participants_user_id (
          id,
          name,
          email,
          role
        )
      `)
      .eq('event_id', selectedEventId);

    if (error) {
      console.error('Error fetching attendees:', error);
      throw error;
    }

    // Get tickets for these attendees
    const userIds = attendeesWithTickets?.map(a => a.user_id) || [];
    const { data: tickets, error: ticketsError } = await supabase
      .from('event_tickets')
      .select(`
        user_id,
        guest_phone,
        check_in_status,
        ticket_types (
          name
        )
      `)
      .eq('event_id', selectedEventId)
      .in('user_id', userIds);

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
    }

    // Combine attendee and ticket data
    return attendeesWithTickets?.map(attendee => {
      const ticket = tickets?.find(t => t.user_id === attendee.user_id);
      return {
        id: attendee.id,
        name: attendee.profiles?.name || 'N/A',
        email: attendee.profiles?.email || 'N/A',
        phone: ticket?.guest_phone || 'N/A',
        role: attendee.profiles?.role || 'attendee',
        ticket_type: ticket?.ticket_types?.name || 'N/A',
        check_in_status: ticket?.check_in_status ? 'Checked In' : 'Not Checked In',
        event_name: eventName,
        joined_at: attendee.joined_at || attendee.created_at
      };
    }) || [];
  };

  const handleExportAttendees = async (format: 'csv' | 'excel') => {
    if (attendees.length === 0) {
      toast({
        title: 'No Data Available',
        description: 'No attendee data available to export.',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(`attendees-${format}`);
    try {
      // Get enhanced attendee data with ticket information
      const enhancedData = await getEnhancedAttendeeData();
      await exportAttendeesData(enhancedData, eventName, format);
      toast({
        title: 'Export Successful',
        description: `Attendees data exported as ${format.toUpperCase()} file successfully.`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export attendees data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportTickets = async (format: 'csv' | 'excel') => {
    if (eventTickets.length === 0) {
      toast({
        title: 'No Data Available',
        description: 'No ticket data available to export.',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(`tickets-${format}`);
    try {
      const ticketsData = eventTickets.map(ticket => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        ticket_type_name: ticket.ticket_types?.name || 'Unknown',
        price: ticket.price,
        user_name: ticket.profiles?.name,
        user_email: ticket.profiles?.email,
        guest_name: ticket.guest_name,
        guest_email: ticket.guest_email,
        check_in_status: ticket.check_in_status,
        checked_in_at: ticket.checked_in_at,
        purchase_date: ticket.purchase_date
      }));

      await exportTicketsData(ticketsData, eventName, format);
      toast({
        title: 'Export Successful',
        description: `Tickets data exported as ${format.toUpperCase()} file successfully.`,
      });
    } catch (error: any) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export tickets data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(null);
    }
  };

  const isAttendeesDisabled = isExporting !== null || attendees.length === 0;
  const isTicketsDisabled = isExporting !== null || isLoadingTickets || eventTickets.length === 0;

  return (
    <Card className="w-full max-w-full">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground shrink-0">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Data:</span>
            <span className="sm:hidden">Export:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Attendees Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isAttendeesDisabled}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[140px] text-xs sm:text-sm"
                >
                  {isExporting?.startsWith('attendees') ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  <span className="truncate">
                    Attendees ({attendees.length})
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleExportAttendees('csv')}
                  disabled={isExporting !== null}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  CSV File
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleExportAttendees('excel')}
                  disabled={isExporting !== null}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Tickets Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isTicketsDisabled}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto sm:min-w-[140px] text-xs sm:text-sm"
                >
                  {isExporting?.startsWith('tickets') ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isLoadingTickets ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Ticket className="h-4 w-4" />
                  )}
                  <span className="truncate">
                    Tickets ({isLoadingTickets ? '...' : eventTickets.length})
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleExportTickets('csv')}
                  disabled={isExporting !== null || isLoadingTickets}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  CSV File
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleExportTickets('excel')}
                  disabled={isExporting !== null || isLoadingTickets}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Excel File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};