
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

  // Helper function to grant attendee dashboard access
  const grantAttendeeAccess = async (ticketData: any) => {
    try {
      // Get the attendee's user ID from the ticket
      const attendeeUserId = ticketData.user_id;
      
      if (attendeeUserId && selectedEventId) {
        // Call the same RPC function that's used for QR code event joining
        // This ensures consistent behavior between both access methods
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('event_key')
          .eq('id', selectedEventId)
          .single();

        if (eventError) {
          console.error('Error fetching event access key:', eventError);
          return;
        }

        if (eventData?.event_key) {
          // Use the join_event_by_access_key RPC to register the attendee
          const { data, error } = await supabase.rpc('join_event_by_access_key', {
            access_code: eventData.event_key
          });

          if (error) {
            console.error('Error granting attendee access:', error);
          } else {
            console.log('Successfully granted attendee dashboard access:', data);
          }
        }
      }
    } catch (error) {
      console.error('Error in grantAttendeeAccess:', error);
    }
  };

  // Check in a ticket by ticket number
  const checkInTicket = useMutation({
    mutationFn: async ({ ticketNumber, notes }: CheckInData) => {
      // First, find the ticket with user information
      const { data: ticket, error: ticketError } = await supabase
        .from('event_tickets')
        .select(`
          *,
          profiles!event_tickets_user_id_fkey(id, name, email)
        `)
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

      // Grant attendee dashboard access
      await grantAttendeeAccess(ticket);

      return ticket;
    },
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-tickets'] });
      toast({
        title: "Success",
        description: `Ticket checked in successfully. ${ticket.profiles?.name || 'Attendee'} now has dashboard access.`,
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
      console.log('QR Data received:', qrData); // Add debugging
      
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
          // Fix: Check for both ticketNumber and ticket_number
          ticketNumber = parsed.ticketNumber || parsed.ticket_number || '';
        }
      } catch (error) {
        console.error('QR parsing error:', error);
        ticketNumber = qrData; // Use as-is if parsing fails
      }
  
      console.log('Extracted ticket number:', ticketNumber); // Add debugging
      
      if (!ticketNumber) {
        throw new Error('Invalid QR code format. Could not extract ticket number.');
      }

      return checkInTicket.mutateAsync({ ticketNumber });
    },
    onSuccess: (ticket) => {
      console.log('QR check-in successful:', ticket);
    },
    onError: (error) => {
      console.error('QR check-in failed:', error);
    },
  });

  // Bulk check-in all tickets for the event
  const bulkCheckInAll = useMutation({
    mutationFn: async () => {
      if (!selectedEventId) throw new Error('No event selected');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all unchecked tickets for the event
      const { data: uncheckedTickets, error: fetchError } = await supabase
        .from('event_tickets')
        .select('id, ticket_number')
        .eq('event_id', selectedEventId)
        .eq('check_in_status', false);

      if (fetchError) throw fetchError;
      if (!uncheckedTickets || uncheckedTickets.length === 0) {
        throw new Error('No tickets to check in');
      }

      const now = new Date().toISOString();
      
      // Update all unchecked tickets
      const { error: updateError } = await supabase
        .from('event_tickets')
        .update({
          check_in_status: true,
          checked_in_at: now,
          checked_in_by: user.id,
        })
        .eq('event_id', selectedEventId)
        .eq('check_in_status', false);

      if (updateError) throw updateError;

      // Create check-in records for all tickets
      const checkInRecords = uncheckedTickets.map(ticket => ({
        ticket_id: ticket.id,
        admin_id: user.id,
        check_in_method: 'bulk',
        notes: 'Bulk check-in',
      }));

      const { error: checkInError } = await supabase
        .from('check_ins')
        .insert(checkInRecords);

      if (checkInError) throw checkInError;

      return uncheckedTickets.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['admin-event-tickets'] });
      toast({
        title: "Bulk Check-in Successful",
        description: `Successfully checked in ${count} attendees`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Check-in Failed",
        description: error.message || "Failed to check in attendees",
        variant: "destructive",
      });
    },
  });

  return {
    checkInTicket,
    checkInByQR,
    bulkCheckInAll,
    isCheckingIn: checkInTicket.isPending || checkInByQR.isPending,
    isBulkCheckingIn: bulkCheckInAll.isPending,
  };
};
