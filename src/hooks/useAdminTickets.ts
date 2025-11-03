
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
  include_fees_in_price?: boolean;
  service_fee_percentage?: number;
  payment_gateway_fee_percentage?: number;
  payment_gateway_fixed_fee?: number;
  display_price?: number;
  organizer_receives?: number;
  requires_login?: boolean;
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

export const useAdminTickets = (eventIdOverride?: string) => {
  const { selectedEventId } = useAdminEventContext();
  const actualEventId = eventIdOverride || selectedEventId;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch ticket types for the selected event
  const { data: ticketTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['admin-ticket-types', actualEventId],
    queryFn: async (): Promise<TicketType[]> => {
      if (!actualEventId) return [];

      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', actualEventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!actualEventId,
  });

  // Fetch event tickets for the selected event
  const { data: eventTickets = [], isLoading: isLoadingTickets } = useQuery({
    queryKey: ['admin-event-tickets', actualEventId],
    queryFn: async (): Promise<EventTicket[]> => {
      if (!actualEventId) return [];

      const { data, error } = await supabase
        .from('event_tickets')
        .select(`
          *,
          ticket_types (*)
        `)
        .eq('event_id', actualEventId)
        .order('created_at', { ascending: false })
        .limit(10000);

      if (error) throw error;
      
      // Batch fetch profiles and form responses for better performance
      const ticketIds = (data || []).map(ticket => ticket.id);
      const userIds = (data || []).map(ticket => ticket.user_id).filter(Boolean);

      // Fetch all profiles in one query
      let profilesMap: Record<string, { name: string; email: string }> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds);
        
        if (profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = { name: profile.name, email: profile.email };
            return acc;
          }, {} as Record<string, { name: string; email: string }>);
        }
      }

      // Fetch all form responses in one query
      let formResponsesMap: Record<string, any[]> = {};
      if (ticketIds.length > 0) {
        const { data: formData, error: formError } = await supabase
          .from('ticket_form_responses')
          .select(`
            *,
            ticket_form_fields (
              label,
              field_type,
              field_order
            )
          `)
          .in('ticket_id', ticketIds);

        if (formError) {
          console.error('Error fetching form responses:', formError);
        } else if (formData) {
          // Group form responses by ticket_id
          formResponsesMap = formData.reduce((acc, response) => {
            if (!acc[response.ticket_id]) {
              acc[response.ticket_id] = [];
            }
            if (response.ticket_form_fields) {
              acc[response.ticket_id].push(response);
            }
            return acc;
          }, {} as Record<string, any[]>);

          // Sort form responses by field order within each ticket
          Object.keys(formResponsesMap).forEach(ticketId => {
            formResponsesMap[ticketId].sort((a, b) => 
              (a.ticket_form_fields?.field_order || 0) - (b.ticket_form_fields?.field_order || 0)
            );
          });
        }
      }

      // Combine all data
      const ticketsWithDetails = (data || []).map(ticket => ({
        ...ticket,
        profiles: ticket.user_id ? profilesMap[ticket.user_id] || null : null,
        form_responses: formResponsesMap[ticket.id] || []
      }));

      return ticketsWithDetails;
    },
    enabled: !!actualEventId,
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
