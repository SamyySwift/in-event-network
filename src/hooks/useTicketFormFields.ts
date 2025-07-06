import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldOptions {
  options?: FormFieldOption[];
  grid_rows?: FormFieldOption[];
  grid_columns?: FormFieldOption[];
  grid_type?: 'multiple_choice' | 'checkboxes';
}

export interface FormField {
  id: string;
  ticket_type_id: string;
  field_type: 'short_answer' | 'paragraph' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'date' | 'time' | 'grid';
  label: string;
  helper_text?: string;
  is_required: boolean;
  field_order: number;
  field_options?: FormFieldOptions;
  created_at: string;
  updated_at: string;
}

// Database-compatible type for insertions/updates
interface FormFieldDB {
  ticket_type_id: string;
  field_type: string;
  label: string;
  helper_text?: string;
  is_required: boolean;
  field_order: number;
  field_options?: Json;
}

export const useTicketFormFields = (ticketTypeId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch form fields for a ticket type
  const { data: formFields = [], isLoading, error } = useQuery({
    queryKey: ['ticket-form-fields', ticketTypeId],
    queryFn: async (): Promise<FormField[]> => {
      if (!ticketTypeId) return [];

      const { data, error } = await supabase
        .from('ticket_form_fields')
        .select('*')
        .eq('ticket_type_id', ticketTypeId)
        .order('field_order', { ascending: true });

      if (error) throw error;
      return data as FormField[];
    },
    enabled: !!ticketTypeId,
  });

  // Create form field
  const createField = useMutation({
    mutationFn: async (field: Omit<FormField, 'id' | 'created_at' | 'updated_at'>) => {
      const dbField: FormFieldDB = {
        ...field,
        field_options: field.field_options ? field.field_options as Json : null,
      };
      
      const { data, error } = await supabase
        .from('ticket_form_fields')
        .insert(dbField)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-form-fields'] });
      toast({
        title: 'Success',
        description: 'Form field created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create form field: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Update form field
  const updateField = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FormField> & { id: string }) => {
      const dbUpdates: Partial<FormFieldDB> = {
        ...updates,
        field_options: updates.field_options ? updates.field_options as Json : undefined,
      };
      
      const { data, error } = await supabase
        .from('ticket_form_fields')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-form-fields'] });
      toast({
        title: 'Success',
        description: 'Form field updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update form field: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete form field
  const deleteField = useMutation({
    mutationFn: async (fieldId: string) => {
      const { error } = await supabase
        .from('ticket_form_fields')
        .delete()
        .eq('id', fieldId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-form-fields'] });
      toast({
        title: 'Success',
        description: 'Form field deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete form field: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  // Reorder fields
  const reorderFields = useMutation({
    mutationFn: async (fields: { id: string; field_order: number }[]) => {
      const updates = fields.map(field => 
        supabase
          .from('ticket_form_fields')
          .update({ field_order: field.field_order })
          .eq('id', field.id)
      );

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-form-fields'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to reorder fields: ' + error.message,
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
};