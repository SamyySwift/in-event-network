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

interface DownloadDataButtonsProps {
  attendees: any[];
  eventName: string;
}

export const DownloadDataButtons: React.FC<DownloadDataButtonsProps> = ({
  attendees,
  eventName
}) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { eventTickets, isLoadingTickets } = useAdminTickets();
  const { toast } = useToast();

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
      await exportAttendeesData(attendees, eventName, format);
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
    <Card className="w-fit">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Download className="h-4 w-4" />
            Export Data:
          </div>
          
          <div className="flex gap-2">
            {/* Attendees Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isAttendeesDisabled}
                  className="flex items-center gap-2 min-w-[140px]"
                >
                  {isExporting?.startsWith('attendees') ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                  Attendees ({attendees.length})
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
                  className="flex items-center gap-2 min-w-[140px]"
                >
                  {isExporting?.startsWith('tickets') ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isLoadingTickets ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Ticket className="h-4 w-4" />
                  )}
                  Tickets ({isLoadingTickets ? '...' : eventTickets.length})
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