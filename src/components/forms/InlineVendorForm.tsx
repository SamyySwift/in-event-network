import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle } from 'lucide-react';

type VendorFormType = {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'email' | 'phone';
    required: boolean;
    placeholder?: string;
  }[];
};

interface InlineVendorFormProps {
  formId: string;
  onSubmitted?: () => void;
}

export const InlineVendorForm: React.FC<InlineVendorFormProps> = ({ formId, onSubmitted }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<VendorFormType | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      setLoading(true);
      try {
        const { data: formData, error } = await supabase
          .from('vendor_forms')
          .select('*')
          .eq('id', formId)
          .eq('is_active', true)
          .single();

        if (error || !formData) {
          setForm(null);
          return;
        }

        const { data: fieldsData, error: fieldsError } = await supabase
          .from('vendor_form_fields')
          .select('*')
          .eq('form_id', formData.id)
          .order('field_order', { ascending: true });

        if (fieldsError) {
          console.error('Error fetching form fields:', fieldsError);
        }

        const mapOptions = (input: any): string[] | undefined => {
          if (!input) return undefined;
          if (typeof input === 'string') {
            try { return JSON.parse(input); } catch { return undefined; }
          }
          return Array.isArray(input) ? input as string[] : undefined;
        };

        const dynamicFields = (fieldsData || []).map((f) => ({
          id: f.field_id || f.id,
          label: f.label,
          type: (f.field_type as 'text' | 'textarea' | 'email' | 'phone') || 'text',
          required: !!f.is_required,
          placeholder: f.placeholder || undefined,
          // description optional in inline; can be added if needed
          options: mapOptions(f.field_options),
        }));

        const mapped: VendorFormType = {
          id: formData.id,
          title: formData.form_title,
          description: formData.form_description || '',
          fields: dynamicFields,
          isActive: formData.is_active,
          createdAt: formData.created_at,
        };

        setForm(mapped);
      } catch (e) {
        setForm(null);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  const setValue = (id: string, value: string) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    if (!form) return false;
    for (const f of form.fields) {
      if (f.required && !String(responses[f.id] || '').trim()) {
        toast({ title: 'Missing field', description: `${f.label} is required`, variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    if (!validate()) return;

    setSubmitting(true);
    try {
      const vendorNameField = form.fields.find(f => f.label.toLowerCase().includes('name'));
      const vendorEmailField = form.fields.find(f => f.type === 'email');

      const vendorName = vendorNameField ? String(responses[vendorNameField.id] || 'Unknown Vendor') : 'Unknown Vendor';
      const vendorEmail = vendorEmailField ? String(responses[vendorEmailField.id] || '') : '';

      const { error } = await supabase
        .from('vendor_submissions')
        .insert({
          form_id: formId,
          vendor_name: vendorName,
          vendor_email: vendorEmail,
          responses,
          status: 'pending',
        });

      if (error) {
        toast({ title: 'Error', description: 'Failed to submit form. Please try again.', variant: 'destructive' });
        return;
      }

      setIsSubmitted(true);
      // Persist submission for compulsory announcements
      localStorage.setItem(`vendor_form_submitted_${formId}`, 'true');
      // Submission success copy
      // toast when submitted:
      // toast({ title: 'Success!', description: 'Your form has been submitted successfully.' });
      onSubmitted?.();
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to submit form. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!form) {
    return <div className="text-sm text-muted-foreground">This form is not available.</div>;
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700">
        <CheckCircle className="h-4 w-4" />
        Submitted successfully
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {form.fields.map(field => {
        const value = responses[field.id] || '';
        return (
          <div key={field.id} className="space-y-1">
            <label className="text-xs font-medium text-gray-700">{field.label}{field.required && ' *'}</label>
            {field.type === 'textarea' ? (
              <Textarea
                value={value}
                onChange={(e) => setValue(field.id, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
              />
            ) : (
              <Input
                type={field.type === 'phone' ? 'tel' : field.type}
                value={value}
                onChange={(e) => setValue(field.id, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
              />
            )}
          </div>
        );
      })}

      <div className="flex">
        <Button type="submit" disabled={submitting} className="ml-auto">
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Submit
        </Button>
      </div>
    </form>
  );
};