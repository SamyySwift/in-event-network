import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SponsorFormField {
  id: string;
  form_id: string;
  field_type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'checkboxes' | 'date' | 'time' | 'file' | 'number';
  label: string;
  placeholder?: string;
  helper_text?: string;
  is_required: boolean;
  field_order: number;
  field_options?: {
    options?: Array<{ id: string; label: string; value: string }>;
    accept?: string; // For file fields
    multiple?: boolean;
    min?: number;
    max?: number;
  };
  created_at: string;
  updated_at: string;
}

export function useSponsorFormFields(formId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch form fields
  const { data: formFields = [], isLoading, error } = useQuery({
    queryKey: ['sponsor-form-fields', formId],
    queryFn: async (): Promise<SponsorFormField[]> => {
      if (!formId) return [];

      const { data, error } = await supabase
        .from('sponsor_form_fields')
        .select('*')
        .eq('form_id', formId)
        .order('field_order', { ascending: true });

      if (error) {
        console.error('Error fetching sponsor form fields:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!formId,
  });

  // Create form field
  const createField = useMutation({
    mutationFn: async (fieldData: Omit<SponsorFormField, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('sponsor_form_fields')
        .insert([fieldData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-form-fields', formId] });
      toast({
        title: 'Success',
        description: 'Form field created successfully',
      });
    },
    onError: (error) => {
      console.error('Error creating sponsor form field:', error);
      toast({
        title: 'Error',
        description: 'Failed to create form field',
        variant: 'destructive',
      });
    },
  });

  // Update form field
  const updateField = useMutation({
    mutationFn: async (fieldData: Partial<SponsorFormField> & { id: string }) => {
      const { id, ...updateData } = fieldData;
      const { data, error } = await supabase
        .from('sponsor_form_fields')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-form-fields', formId] });
      toast({
        title: 'Success',
        description: 'Form field updated successfully',
      });
    },
    onError: (error) => {
      console.error('Error updating sponsor form field:', error);
      toast({
        title: 'Error',
        description: 'Failed to update form field',
        variant: 'destructive',
      });
    },
  });

  // Delete form field
  const deleteField = useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from('sponsor_form_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-form-fields', formId] });
      toast({
        title: 'Success',
        description: 'Form field deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Error deleting sponsor form field:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete form field',
        variant: 'destructive',
      });
    },
  });

  // Reorder form fields
  const reorderFields = useMutation({
    mutationFn: async (updates: Array<{ id: string; field_order: number }>) => {
      const promises = updates.map(update =>
        supabase
          .from('sponsor_form_fields')
          .update({ field_order: update.field_order })
          .eq('id', update.id)
      );

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (result.error) throw result.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sponsor-form-fields', formId] });
    },
    onError: (error) => {
      console.error('Error reordering sponsor form fields:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder form fields',
        variant: 'destructive',
      });
    },
  });

  return {
    formFields,
    isLoading,
    error,
    createField,
    updateField,
    deleteField,
    reorderFields,
  };
}