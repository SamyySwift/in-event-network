import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Users, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminTickets } from '@/hooks/useAdminTickets';
import { exportAttendeesData, exportTicketsData } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

interface DownloadDataButtonsProps {
  attendees: any[];
  eventName: string;
}

export const DownloadDataButtons: React.FC<DownloadDataButtonsProps> = ({
  attendees,
  eventName
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { eventTickets } = useAdminTickets();
  const { toast } = useToast();

  const handleExportAttendees = async (format: 'csv' | 'excel') => {
    if (attendees.length === 0) {
      toast({
        title: 'No Data',
        description: 'No attendee data available to export.',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    try {
      exportAttendeesData(attendees, eventName, format);
      toast({
        title: 'Export Successful',
        description: `Attendees data exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export attendees data',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportTickets = async (format: 'csv' | 'excel') => {
    if (eventTickets.length === 0) {
      toast({
        title: 'No Data',
        description: 'No ticket data available to export.',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
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

      exportTicketsData(ticketsData, eventName, format);
      toast({
        title: 'Export Successful',
        description: `Tickets data exported as ${format.toUpperCase()}`
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export tickets data',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Attendees Export */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isExporting || attendees.length === 0}
            className="flex items-center gap-2"
          >
            <Users size={16} />
            <Download size={16} />
            Export Attendees
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Export Format</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExportAttendees('csv')}>
            <FileText size={16} className="mr-2" />
            CSV File
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportAttendees('excel')}>
            <FileSpreadsheet size={16} className="mr-2" />
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
            disabled={isExporting || eventTickets.length === 0}
            className="flex items-center gap-2"
          >
            <Ticket size={16} />
            <Download size={16} />
            Export Tickets
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Export Format</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExportTickets('csv')}>
            <FileText size={16} className="mr-2" />
            CSV File
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExportTickets('excel')}>
            <FileSpreadsheet size={16} className="mr-2" />
            Excel File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};