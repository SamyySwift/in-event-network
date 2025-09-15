// Top-level component: InlineVendorForm
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star } from 'lucide-react';

type VendorFormType = {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  fields: {
    id: string;
    label: string;
    type:
      | 'text'
      | 'textarea'
      | 'email'
      | 'phone'
      | 'url'
      | 'number'
      | 'date'
      | 'select'
      | 'checkbox'
      | 'radio'
      | 'file'
      | 'rating'
      | 'address'
      | 'currency';
    required: boolean;
    placeholder?: string;
    options?: string[];
    validation?: {
      min?: number;
      max?: number;
      minLength?: number;
      maxLength?: number;
      fileTypes?: string[];
    };
  }[];
};

interface InlineVendorFormProps {
  formId: string;
  onSubmitted?: () => void;
}

// Add a tiny helper to safely parse JSON-ish columns
const parseMaybeJSON = <T,>(val: any, fallback: T): T => {
  try {
    if (val == null) return fallback;
    if (typeof val === 'string') return JSON.parse(val) as T;
    if (typeof val === 'object') return (val as T);
    return fallback;
  } catch {
    return fallback;
  }
};

export const InlineVendorForm: React.FC<InlineVendorFormProps> = ({ formId, onSubmitted }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<VendorFormType | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      setLoading(true);
      try {
        const { data: formData, error } = await supabase
          .from('vendor_forms')
          .select(`
            *,
            vendor_form_fields(*)
          `)
          .eq('id', formId)
          .eq('is_active', true)
          .single();

        if (error || !formData) {
          setForm(null);
          return;
        }

        const mappedFields = (formData.vendor_form_fields || [])
          .sort((a: any, b: any) => (a.field_order ?? 0) - (b.field_order ?? 0))
          .map((ff: any) => {
            // Normalize field types to the inline renderer's union
            const rawType = ff.field_type as string;
            const normalizedType = rawType === 'checkboxes' ? 'checkbox' : rawType;
            const supportedTypes: VendorFormType['fields'][number]['type'][] = [
              'text', 'textarea', 'email', 'phone', 'url', 'number', 'date',
              'select', 'checkbox', 'radio', 'file', 'rating', 'address', 'currency'
            ];
            const safeType = supportedTypes.includes(normalizedType as any) ? (normalizedType as any) : 'text';

            // Parse DB columns that may be JSON strings or objects
            const options = parseMaybeJSON<string[]>(ff.field_options, []);
            const validation = parseMaybeJSON<Record<string, any>>(ff.validation_rules, {});

            return {
              id: ff.field_id,
              label: ff.label,
              type: safeType,
              required: ff.is_required,
              placeholder: ff.placeholder || '',
              options,
              validation,
            };
          });

        const mapped: VendorFormType = {
          id: formData.id,
          title: formData.form_title,
          description: formData.form_description || '',
          fields: mappedFields,
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

  useEffect(() => {
    // Re-fetch helper reused from load effect
    const reload = async () => {
      try {
        const { data: formData } = await supabase
          .from('vendor_forms')
          .select(`
            *,
            vendor_form_fields(*)
          `)
          .eq('id', formId)
          .eq('is_active', true)
          .single();
        if (!formData) return;
  
        const mappedFields = (formData.vendor_form_fields || [])
          .sort((a: any, b: any) => (a.field_order ?? 0) - (b.field_order ?? 0))
          .map((ff: any) => {
            const rawType = ff.field_type as string;
            const normalizedType = rawType === 'checkboxes' ? 'checkbox' : rawType;
            const supportedTypes: VendorFormType['fields'][number]['type'][] = [
              'text', 'textarea', 'email', 'phone', 'url', 'number', 'date',
              'select', 'checkbox', 'radio', 'file', 'rating', 'address', 'currency'
            ];
            const safeType = supportedTypes.includes(normalizedType as any) ? (normalizedType as any) : 'text';

            const options = parseMaybeJSON<string[]>(ff.field_options, []);
            const validation = parseMaybeJSON<Record<string, any>>(ff.validation_rules, {});

            return {
              id: ff.field_id,
              label: ff.label,
              type: safeType,
              required: ff.is_required,
              placeholder: ff.placeholder || '',
              options,
              validation,
            };
          });
  
        setForm(prev => prev ? {
          ...prev,
          fields: mappedFields,
          isActive: formData.is_active,
          title: formData.form_title,
          description: formData.form_description || '',
        } : {
          id: formData.id,
          title: formData.form_title,
          description: formData.form_description || '',
          fields: mappedFields,
          isActive: formData.is_active,
          createdAt: formData.created_at,
        });
      } catch {
        // ignore
      }
    };
  
    const channel = supabase
      .channel(`vendor_form_sync_${formId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vendor_form_fields', filter: `form_id=eq.${formId}` },
        () => reload()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vendor_forms', filter: `id=eq.${formId}` },
        () => reload()
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [formId]);

  const setValue = (id: string, value: any) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = async (fieldId: string, file: File | null) => {
    if (!file) {
      setValue(fieldId, '');
      return;
    }

    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `vendor-uploads/${formId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setValue(fieldId, publicUrl);
    } catch (e) {
      console.error('File upload failed:', e);
      toast({
        title: 'Upload Error',
        description: 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    }
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
      toast({ title: 'Success!', description: 'Your vendor registration has been submitted successfully.' });
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
        const value = responses[field.id] ?? (field.type === 'checkbox' ? [] : '');

        return (
          <div key={field.id} className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              {field.label}{field.required && ' *'}
            </label>

            {(() => {
              switch (field.type) {
                case 'textarea':
                case 'address':
                  return (
                    <Textarea
                      value={String(value)}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={field.type === 'address' ? 3 : undefined}
                    />
                  );

                case 'select':
                  return (
                    <Select
                      value={String(value)}
                      onValueChange={(val) => setValue(field.id, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.placeholder || 'Select an option'} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option, idx) => {
                          const clean = (option ?? '').toString().trim();
                          const valueSafe = clean || `option_${idx + 1}`;
                          const labelSafe = clean || `Option ${idx + 1}`;
                          return (
                            <SelectItem key={`${valueSafe}_${idx}`} value={valueSafe}>
                              {labelSafe}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  );

                case 'radio':
                  return (
                    <RadioGroup
                      value={String(value)}
                      onValueChange={(val) => setValue(field.id, val)}
                      required={field.required}
                    >
                      {field.options?.map((option, i) => {
                        const clean = (option ?? '').toString().trim();
                        const valueSafe = clean || `option_${i + 1}`;
                        const labelSafe = clean || `Option ${i + 1}`;
                        return (
                          <div key={`${valueSafe}_${i}`} className="flex items-center space-x-2">
                            <RadioGroupItem value={valueSafe} id={`${field.id}-${i}`} />
                            <label htmlFor={`${field.id}-${i}`} className="text-sm">{labelSafe}</label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  );

                case 'checkbox': {
                  const current: string[] = Array.isArray(value) ? value : [];
                  return (
                    <div className="space-y-2">
                      {field.options?.map((option, i) => {
                        const clean = (option ?? '').toString().trim();
                        const valueSafe = clean || `option_${i + 1}`;
                        const labelSafe = clean || `Option ${i + 1}`;
                        const checked = current.includes(valueSafe);
                        return (
                          <div key={`${valueSafe}_${i}`} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${field.id}-${i}`}
                              checked={checked}
                              onCheckedChange={(isChecked) => {
                                const next = isChecked
                                  ? [...current, valueSafe]
                                  : current.filter(v => v !== valueSafe);
                                setValue(field.id, next);
                              }}
                            />
                            <label htmlFor={`${field.id}-${i}`} className="text-sm">{labelSafe}</label>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                case 'file': {
                  const accept = field.validation?.fileTypes?.map(t => `.${t}`).join(',') || undefined;
                  return (
                    <Input
                      type="file"
                      accept={accept}
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        void handleFileUpload(field.id, f);
                      }}
                    />
                  );
                }

                case 'rating': {
                  const ratingValue = typeof value === 'number' ? value : 0;
                  return (
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer transition-colors ${
                            star <= ratingValue ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                          onClick={() => setValue(field.id, star)}
                        />
                      ))}
                    </div>
                  );
                }

                case 'date':
                  return (
                    <Input
                      type="date"
                      value={String(value)}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      required={field.required}
                    />
                  );

                case 'number':
                case 'currency':
                  return (
                    <Input
                      type="number"
                      value={String(value)}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      step={field.type === 'currency' ? '0.01' : undefined}
                    />
                  );

                case 'url':
                  return (
                    <Input
                      type="url"
                      value={String(value)}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  );

                default:
                  return (
                    <Input
                      type={field.type === 'phone' ? 'tel' : (field.type as any)}
                      value={String(value)}
                      onChange={(e) => setValue(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      minLength={field.validation?.minLength}
                      maxLength={field.validation?.maxLength}
                    />
                  );
              }
            })()}
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
}