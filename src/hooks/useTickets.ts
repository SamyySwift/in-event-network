
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type TicketType = {
  id: string;
  event_id: string;
  name: string;
  price: number;
  description?: string;
  max_quantity?: number;
  available_quantity: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export type EventTicket = {
  id: string;
  event_id: string;
  user_id?: string;
  ticket_number: string;
  ticket_type_id: string;
  price: number;
  qr_code_data: string;
  purchase_date: string;
  check_in_status: boolean;
  checked_in_at?: string;
  checked_in_by?: string;
  guest_email?: string;
  guest_name?: string;
  created_at: string;
  updated_at: string;
};

export const useTickets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get ticket types for an event
  const useTicketTypes = (eventId: string) => {
    return useQuery({
      queryKey: ['ticket-types', eventId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('ticket_types')
          .select('*')
          .eq('event_id', eventId)
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) throw error;
        return data as TicketType[];
      },
      enabled: !!eventId,
    });
  };

  // Get user's tickets
  const useUserTickets = () => {
    return useQuery({
      queryKey: ['user-tickets'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('event_tickets')
          .select(`
            *,
            events(name, start_time, location),
            ticket_types(name, description)
          `)
          .order('purchase_date', { ascending: false });

        if (error) throw error;
        return data;
      },
    });
  };

  // Get event tickets for admin
  const useEventTickets = (eventId: string) => {
    return useQuery({
      queryKey: ['event-tickets', eventId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('event_tickets')
          .select(`
            *,
            profiles(name, email),
            ticket_types(name)
          `)
          .eq('event_id', eventId)
          .order('purchase_date', { ascending: false });

        if (error) throw error;
        return data;
      },
      enabled: !!eventId,
    });
  };

  // Purchase ticket mutation
  const purchaseTicket = useMutation({
    mutationFn: async ({
      eventId,
      ticketTypeId,
      price,
      guestName,
      guestEmail,
      userId
    }: {
      eventId: string;
      ticketTypeId: string;
      price: number;
      guestName?: string;
      guestEmail?: string;
      userId?: string;
    }) => {
      // Generate QR code data
      const qrData = `ticket:${Date.now()}:${Math.random().toString(36).substring(7)}`;
      
      const { data, error } = await supabase
        .from('event_tickets')
        .insert({
          event_id: eventId,
          ticket_type_id: ticketTypeId,
          price,
          qr_code_data: qrData,
          user_id: userId,
          guest_name: guestName,
          guest_email: guestEmail,
        })
        .select()
        .single();

      if (error) throw error;
      return data as EventTicket;
    },
    onSuccess: () => {
      toast({
        title: "Ticket Purchased",
        description: "Your ticket has been purchased successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-types'] });
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: "Failed to purchase ticket. Please try again.",
        variant: "destructive",
      });
      console.error('Ticket purchase error:', error);
    },
  });

  // Create ticket type mutation
  const createTicketType = useMutation({
    mutationFn: async (ticketType: Omit<TicketType, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('ticket_types')
        .insert(ticketType)
        .select()
        .single();

      if (error) throw error;
      return data as TicketType;
    },
    onSuccess: () => {
      toast({
        title: "Ticket Type Created",
        description: "New ticket type has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['ticket-types'] });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create ticket type. Please try again.",
        variant: "destructive",
      });
      console.error('Ticket type creation error:', error);
    },
  });

  return {
    useTicketTypes,
    useUserTickets,
    useEventTickets,
    purchaseTicket,
    createTicketType,
  };
};
