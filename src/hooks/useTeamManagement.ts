
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TeamInvitation {
  id: string;
  admin_id: string;
  email: string;
  event_id: string;
  token: string;
  allowed_sections: string[];
  expires_at: string | null;
  status: 'pending' | 'accepted' | 'revoked';
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  admin_id: string;
  event_id: string;
  allowed_sections: string[];
  expires_at: string | null;
  is_active: boolean;
  invited_at: string;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  user: {
    name: string | null;
    email: string | null;
    photo_url: string | null;
  };
}

export const DASHBOARD_SECTIONS = [
  { value: 'dashboard', label: 'Dashboard Overview' },
  { value: 'events', label: 'Event Management' },
  { value: 'tickets', label: 'Tickets & Sales' },
  { value: 'checkin', label: 'Check-in Management' },
  { value: 'attendees', label: 'Attendee Management' },
  { value: 'speakers', label: 'Speaker Management' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'schedule', label: 'Event Schedule' },
  { value: 'polls', label: 'Polls & Surveys' },
  { value: 'facilities', label: 'Facilities & Venues' },
  { value: 'rules', label: 'Event Rules' },
  { value: 'questions', label: 'Q&A Management' },
  { value: 'suggestions', label: 'Feedback & Suggestions' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'sponsors', label: 'Sponsors & Partners' },
  { value: 'vendor-hub', label: 'Vendor Hub' },
  { value: 'settings', label: 'Event Settings' },
] as const;

export function useTeamManagement(eventId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get team invitations
  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ['team-invitations', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TeamInvitation[];
    },
    enabled: !!user && !!eventId,
  });

  // Get team members
  const { data: teamMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ['team-members', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user:profiles!user_id (
            name,
            email,
            photo_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!user && !!eventId,
  });

  // Create invitation mutation
  const createInvitation = useMutation({
    mutationFn: async (data: {
      email: string;
      allowed_sections: string[];
      expires_at?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('team_invitations')
        .insert({
          admin_id: user!.id,
          event_id: eventId,
          email: data.email,
          allowed_sections: data.allowed_sections,
          expires_at: data.expires_at || null,
          token: crypto.randomUUID(), // Will be replaced by DB function
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', eventId] });
      toast.success('Team invitation created successfully!');
    },
    onError: (error) => {
      console.error('Error creating invitation:', error);
      toast.error('Failed to create invitation');
    },
  });

  // Resend invitation mutation
  const resendInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('team_invitations')
        .update({ 
          updated_at: new Date().toISOString(),
          token: crypto.randomUUID() // Generate new token
        })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', eventId] });
      toast.success('Invitation resent successfully!');
    },
    onError: () => {
      toast.error('Failed to resend invitation');
    },
  });

  // Revoke invitation mutation
  const revokeInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', eventId] });
      toast.success('Invitation revoked successfully!');
    },
    onError: () => {
      toast.error('Failed to revoke invitation');
    },
  });

  // Update team member mutation
  const updateTeamMember = useMutation({
    mutationFn: async (data: {
      memberId: string;
      allowed_sections?: string[];
      expires_at?: string | null;
      is_active?: boolean;
    }) => {
      const { error } = await supabase
        .from('team_members')
        .update({
          allowed_sections: data.allowed_sections,
          expires_at: data.expires_at,
          is_active: data.is_active,
        })
        .eq('id', data.memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', eventId] });
      toast.success('Team member updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update team member');
    },
  });

  // Remove team member mutation
  const removeTeamMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', eventId] });
      toast.success('Team member removed successfully!');
    },
    onError: () => {
      toast.error('Failed to remove team member');
    },
  });

  return {
    invitations,
    teamMembers,
    isLoading: invitationsLoading || membersLoading,
    createInvitation,
    resendInvitation,
    revokeInvitation,
    updateTeamMember,
    removeTeamMember,
  };
}
