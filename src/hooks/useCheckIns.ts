
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type CheckIn = {
  id: string;
  ticket_id: string;
  admin_id: string;
  checked_in_at: string;
  check_in_method: string;
  notes?: string;
  created_at: string;
  event_tickets?: {
    ticket_number: string;
    guest_name?: string;
    guest_email?: string;
    profiles?: {
      name: string;
      email: string;
    };
  };
};

export const useCheckIns = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  // Get check-ins for an event
  const useEventCheckIns = (eventId: string) => {
    return useQuery({
      queryKey: ['event-checkins', eventId],
      queryFn: async () => {
        if (!eventId) return [];
        
        const { data, error } = await supabase
          .from('check_ins')
          .select(`
            *,
            event_tickets!inner(
              ticket_number,
              guest_name,
              guest_email,
              event_id,
              profiles(name, email)
            )
          `)
          .eq('event_tickets.event_id', eventId)
          .order('checked_in_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      enabled: !!eventId,
    });
  };

  // Check-in a ticket by QR code
  const checkInTicket = useMutation({
    mutationFn: async ({
      qrCodeData,
      adminId,
      method = 'qr_scan',
      notes
    }: {
      qrCodeData: string;
      adminId: string;
      method?: string;
      notes?: string;
    }) => {
      // First, find the ticket by QR code
      const { data: ticket, error: ticketError } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('qr_code_data', qrCodeData)
        .single();

      if (ticketError) throw new Error('Invalid ticket QR code');
      if (ticket.check_in_status) throw new Error('Ticket already checked in');

      // Update ticket status
      const { error: updateError } = await supabase
        .from('event_tickets')
        .update({
          check_in_status: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: adminId,
        })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      // Create check-in record
      const { data: checkIn, error: checkInError } = await supabase
        .from('check_ins')
        .insert({
          ticket_id: ticket.id,
          admin_id: adminId,
          check_in_method: method,
          notes,
        })
        .select()
        .single();

      if (checkInError) throw checkInError;
      return { ticket, checkIn };
    },
    onSuccess: (data) => {
      toast({
        title: "Check-in Successful",
        description: `Ticket ${data.ticket.ticket_number} checked in successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ['event-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['eventTickets'] });
    },
    onError: (error) => {
      toast({
        title: "Check-in Failed",
        description: error.message || "Failed to check in ticket. Please try again.",
        variant: "destructive",
      });
      console.error('Check-in error:', error);
    },
  });

  // Manual check-in by ticket number
  const manualCheckIn = useMutation({
    mutationFn: async ({
      ticketNumber,
      adminId,
      notes
    }: {
      ticketNumber: string;
      adminId: string;
      notes?: string;
    }) => {
      // Find ticket by number
      const { data: ticket, error: ticketError } = await supabase
        .from('event_tickets')
        .select('*')
        .eq('ticket_number', ticketNumber)
        .single();

      if (ticketError) throw new Error('Ticket not found');
      if (ticket.check_in_status) throw new Error('Ticket already checked in');

      // Update ticket status
      const { error: updateError } = await supabase
        .from('event_tickets')
        .update({
          check_in_status: true,
          checked_in_at: new Date().toISOString(),
          checked_in_by: adminId,
        })
        .eq('id', ticket.id);

      if (updateError) throw updateError;

      // Create check-in record
      const { data: checkIn, error: checkInError } = await supabase
        .from('check_ins')
        .insert({
          ticket_id: ticket.id,
          admin_id: adminId,
          check_in_method: 'manual',
          notes,
        })
        .select()
        .single();

      if (checkInError) throw checkInError;
      return { ticket, checkIn };
    },
    onSuccess: (data) => {
      toast({
        title: "Manual Check-in Successful",
        description: `Ticket ${data.ticket.ticket_number} checked in manually!`,
      });
      queryClient.invalidateQueries({ queryKey: ['event-checkins'] });
      queryClient.invalidateQueries({ queryKey: ['eventTickets'] });
    },
    onError: (error) => {
      toast({
        title: "Manual Check-in Failed",
        description: error.message || "Failed to check in ticket manually.",
        variant: "destructive",
      });
      console.error('Manual check-in error:', error);
    },
  });

  // Simple check-in mutation for ticket ID
  const checkInTicketById = useMutation({
    mutationFn: async (ticketId: string) => {
      if (!currentUser?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          ticket_id: ticketId,
          admin_id: currentUser.id,
          checked_in_at: new Date().toISOString(),
        })
        .select('*')
        .single();
        
      if (error) throw error;
      
      // Update the ticket status
      const { error: updateError } = await supabase
        .from('event_tickets')
        .update({ check_in_status: true })
        .eq('id', ticketId);
        
      if (updateError) throw updateError;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventCheckIns'] });
      queryClient.invalidateQueries({ queryKey: ['eventTickets'] });
      toast({
        title: "Check-in Successful",
        description: "Attendee has been checked in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Check-in Failed",
        description: error.message || "Could not check in attendee.",
        variant: "destructive",
      });
    },
  });

  return {
    useEventCheckIns,
    checkInTicket,
    manualCheckIn,
    checkInTicketById,
  };
};
