
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useToast } from '@/hooks/use-toast';

interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  max_quantity?: number;
  available_quantity: number;
  max_tickets_per_user?: number;
  is_active: boolean;
  event_id: string;
  created_at: string;
  updated_at: string;
}

interface EventTicket {
  id: string;
  event_id: string;
  ticket_type_id: string;
  user_id?: string;
  guest_name?: string;
  guest_email?: string;
  ticket_number: string;
  price: number;
  qr_code_data: string;
  check_in_status: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
  purchase_date: string;
  created_at: string;
  updated_at: string;
  ticket_types: TicketType;
  profiles?: {
    name: string;
    email: string;
  } | null;
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

export const useAdminTickets = () => {
  const { selectedEventId } = useAdminEventContext();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch ticket types for the selected event
  const { data: ticketTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['admin-ticket-types', selectedEventId],
    queryFn: async (): Promise<TicketType[]> => {
      if (!selectedEventId) return [];

      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedEventId,
  });

  // Fetch event tickets for the selected event
  const { data: eventTickets = [], isLoading: isLoadingTickets } = useQuery({
    queryKey: ['admin-event-tickets', selectedEventId],
    queryFn: async (): Promise<EventTicket[]> => {
      if (!selectedEventId) return [];

      const { data, error } = await supabase
        .from('event_tickets')
        .select(`
          *,
          ticket_types (*)
        `)
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profile data and form responses separately
      const ticketsWithDetails = await Promise.all((data || []).map(async (ticket) => {
        let profile = null;
        let formResponses: any[] = [];

        if (ticket.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', ticket.user_id)
            .single();
          profile = profileData;
        }

        // Fetch form responses for this ticket
        const { data: formData } = await supabase
          .from('ticket_form_responses')
          .select(`
            *,
            ticket_form_fields (
              label,
              field_type,
              field_order
            )
          `)
          .eq('ticket_id', ticket.id);

        if (formData) {
          // Sort the form responses by field order
          formResponses = formData.sort((a, b) => 
            (a.ticket_form_fields?.field_order || 0) - (b.ticket_form_fields?.field_order || 0)
          );
        }
        
        return {
          ...ticket,
          profiles: profile,
          form_responses: formResponses
        };
      }));

      return ticketsWithDetails;
    },
    enabled: !!selectedEventId,
  });

  // Create ticket type mutation
  const createTicketType = useMutation({
    mutationFn: async (ticketType: Omit<TicketType, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ticket_types')
        .insert([ticketType])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-types'] });
      toast({
        title: "Success",
        description: "Ticket type created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create ticket type",
        variant: "destructive",
      });
    },
  });

  // Update ticket type mutation
  const updateTicketType = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TicketType> & { id: string }) => {
      const { data, error } = await supabase
        .from('ticket_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-types'] });
      toast({
        title: "Success",
        description: "Ticket type updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update ticket type",
        variant: "destructive",
      });
    },
  });

  // Delete ticket type mutation
  const deleteTicketType = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ticket_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ticket-types'] });
      toast({
        title: "Success",
        description: "Ticket type deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete ticket type",
        variant: "destructive",
      });
    },
  });

  const stats = {
    totalTickets: eventTickets.length,
    checkedInTickets: eventTickets.filter(ticket => ticket.check_in_status).length,
    totalRevenue: eventTickets.reduce((sum, ticket) => sum + ticket.price, 0),
    ticketTypes: ticketTypes.length,
  };

  return {
    ticketTypes,
    eventTickets,
    isLoadingTypes,
    isLoadingTickets,
    createTicketType,
    updateTicketType,
    deleteTicketType,
    stats,
  };
};
