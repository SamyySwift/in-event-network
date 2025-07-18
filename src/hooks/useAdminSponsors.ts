import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminEventContext } from './useAdminEventContext';
import { toast } from '@/hooks/use-toast';

export const useAdminSponsors = () => {
  const queryClient = useQueryClient();
  const { selectedEventId } = useAdminEventContext();

  // Fetch sponsor forms
  const { data: sponsorForms = [], isLoading: isLoadingForms } = useQuery({
    queryKey: ['sponsorForms', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return [];
      
      const { data, error } = await supabase
        .from('sponsor_forms')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedEventId,
  });

  // Fetch sponsor submissions
  const { data: sponsors = [], isLoading: isLoadingSponsors } = useQuery({
    queryKey: ['sponsors', selectedEventId],
    queryFn: async () => {
      if (!selectedEventId) return [];
      
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedEventId,
  });

  // Create sponsor form
  const createSponsorForm = useMutation({
    mutationFn: async (formData: {
      form_title: string;
      form_description?: string;
      form_fields: any[];
    }) => {
      if (!selectedEventId) throw new Error('No event selected');

      const shareableId = crypto.randomUUID();
      const shareable_link = `${window.location.origin}/sponsor-form/${shareableId}`;

      const { data, error } = await supabase
        .from('sponsor_forms')
        .insert({
          event_id: selectedEventId,
          ...formData,
          shareable_link,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorForms', selectedEventId] });
      toast({
        title: "Success",
        description: "Sponsor form created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update sponsor form
  const updateSponsorForm = useMutation({
    mutationFn: async ({ id, ...formData }: {
      id: string;
      form_title?: string;
      form_description?: string;
      form_fields?: any[];
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('sponsor_forms')
        .update(formData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorForms', selectedEventId] });
      toast({
        title: "Success",
        description: "Sponsor form updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update sponsor status
  const updateSponsorStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('sponsors')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsors', selectedEventId] });
      toast({
        title: "Success",
        description: "Sponsor status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete sponsor form
  const deleteSponsorForm = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sponsor_forms')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsorForms', selectedEventId] });
      toast({
        title: "Success",
        description: "Sponsor form deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stats = {
    totalSubmissions: sponsors.length,
    pendingSubmissions: sponsors.filter(s => s.status === 'pending').length,
    approvedSubmissions: sponsors.filter(s => s.status === 'approved').length,
    activeForms: sponsorForms.filter(f => f.is_active).length,
  };

  return {
    sponsorForms,
    sponsors,
    isLoadingForms,
    isLoadingSponsors,
    createSponsorForm,
    updateSponsorForm,
    updateSponsorStatus,
    deleteSponsorForm,
    stats,
  };
};