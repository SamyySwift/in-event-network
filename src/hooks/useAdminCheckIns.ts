
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useToast } from '@/hooks/use-toast';

interface CheckInData {
  ticketNumber: string;
  notes?: string;
}

export const useAdminCheckIns = () => {
  const { selectedEventId } = useAdminEventContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Check in a ticket by ticket number
  const checkInTicket = useMutation({
    mutationFn: async ({ ticketNumber, notes }: CheckInData) => {
      // First, find the ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('ticket_number', ticketNumber)
        .eq('event_id', selectedEventId)
        .single();

      if (ticketError) throw new Error('Ticket not found');
      if (ticket.check_in_status) throw new Error('Ticket already checked in');

      // Update ticket status
      const { error: updateError } = await supabase
        .from('event_tickets')
        .update({
          check_in_status: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      // Create check-in record
      const { error: checkInError } = await supabase
        .from('check_ins')
        .insert([{
          ticket_id: ticket.id,
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          check_in_method: 'manual',
          notes,
        }]);

      if (checkInError) throw checkInError;

      return ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-tickets'] });
      toast({
        title: "Success",
        description: "Ticket checked in successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in Failed",
        description: error.message || "Failed to check in ticket",
        variant: "destructive",
      });
    },
  });

  // Check in ticket by QR code scan
  const checkInByQR = useMutation({
    mutationFn: async (qrData: string) => {
      // Parse QR data to get ticket number
      let ticketNumber = '';
      
      try {
        // Handle different QR formats
        if (qrData.includes('ticket_number=')) {
          const url = new URL(qrData);
          ticketNumber = url.searchParams.get('ticket_number') || '';
        } else if (qrData.startsWith('TKT-')) {
          ticketNumber = qrData;
        } else {
          // Try to parse as JSON
          const parsed = JSON.parse(qrData);
          ticketNumber = parsed.ticket_number || '';
        }
      } catch {
        ticketNumber = qrData; // Use as-is if parsing fails
      }

      if (!ticketNumber) throw new Error('Invalid QR code format');

      return checkInTicket.mutateAsync({ ticketNumber });
    },
  });

  return {
    checkInTicket,
    checkInByQR,
    isCheckingIn: checkInTicket.isPending || checkInByQR.isPending,
  };
};
