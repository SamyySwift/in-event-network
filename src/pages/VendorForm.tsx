import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Store, Star, Calendar, Clock, MapPin } from 'lucide-react';
import { VendorForm as VendorFormType, VendorFormField, VendorSubmission } from '@/types/vendorForm';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Event {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  banner_url?: string;
}

function VendorForm() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<VendorFormType | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [responses, setResponses] = useState<Record<string, string | number | boolean | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFormAndEvent = async () => {
      if (!formId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch vendor form with event details and dynamic fields
        const { data: formData, error: formError } = await supabase
          .from('vendor_forms')
          .select(`
            *,
            events:event_id (
              id,
              name,
              description,
              start_time,
              end_time,
              location,
              banner_url
            ),
            vendor_form_fields(*)
          `)
          .eq('id', formId)
          .eq('is_active', true)
          .single();

        if (formError || !formData) {
          console.error('Error fetching form:', formError);
          setForm(null);
          setEvent(null);
        } else {
          // Map DB fields -> UI fields
          const mappedFields: VendorFormField[] = (formData.vendor_form_fields || [])
            .sort((a: any, b: any) => (a.field_order ?? 0) - (b.field_order ?? 0))
            .map((ff: any) => ({
              id: ff.field_id,
              label: ff.label,
              type: ff.field_type,
              required: ff.is_required,
              placeholder: ff.placeholder || '',
              description: ff.field_description || '',
              options: ff.field_options
                ? (typeof ff.field_options === 'string' ? JSON.parse(ff.field_options) : ff.field_options)
                : undefined,
              validation: ff.validation_rules
                ? (typeof ff.validation_rules === 'string' ? JSON.parse(ff.validation_rules) : ff.validation_rules)
                : undefined,
            }));

          const mappedForm: VendorFormType = {
            id: formData.id,
            title: formData.form_title,
            description: formData.form_description || '',
            fields: mappedFields,
            isActive: formData.is_active,
            createdAt: formData.created_at,
            submissionsCount: 0,
            settings: {
              allowMultipleSubmissions: false,
              requireEmailVerification: false,
              autoResponse: false,
              categories: [],
            },
          };

          setForm(mappedForm);
          setEvent(formData.events as Event);
        }
      } catch (error) {
        console.error('Error loading form:', error);
        setForm(null);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    loadFormAndEvent();
  }, [formId]);

  // Helper to refresh only fields (preserve already entered responses for unchanged field ids)
  const reloadFields = async () => {
    if (!formId) return;
    const { data: fieldsData, error } = await supabase
      .from('vendor_form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('field_order', { ascending: true });

    if (error) {
      console.error('Error reloading fields:', error);
      return;
    }

    const mappedFields: VendorFormField[] = (fieldsData || []).map((ff: any) => ({
      id: ff.field_id,
      label: ff.label,
      type: ff.field_type,
      required: ff.is_required,
      placeholder: ff.placeholder || '',
      description: ff.field_description || '',
      options: ff.field_options
        ? (typeof ff.field_options === 'string' ? JSON.parse(ff.field_options) : ff.field_options)
        : undefined,
      validation: ff.validation_rules
        ? (typeof ff.validation_rules === 'string' ? JSON.parse(ff.validation_rules) : ff.validation_rules)
        : undefined,
    }));

    setForm((prev) => (prev ? { ...prev, fields: mappedFields } : prev));
  };

  // Optional: realtime subscription so attendee sees new fields without refreshing
  useEffect(() => {
    if (!formId) return;

    const channel = supabase
      .channel(`vendor_form_fields_${formId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vendor_form_fields', filter: `form_id=eq.${formId}` },
        () => {
          reloadFields();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [formId]);

  const handleInputChange = (fieldId: string, value: string | number | boolean | string[]) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateForm = () => {
    if (!form) return false;
    
    for (const field of form.fields) {
      const value = responses[field.id];
      
      if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
        toast({
          title: "Validation Error",
          description: `${field.label} is required`,
          variant: "destructive"
        });
        return false;
      }
      
      // Email validation
      if (field.type === 'email' && value && typeof value === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          toast({
            title: "Validation Error",
            description: `Please enter a valid email for ${field.label}`,
            variant: "destructive"
          });
          return false;
        }
      }
      
      // URL validation
      if (field.type === 'url' && value && typeof value === 'string') {
        try {
          new URL(value);
        } catch {
          toast({
            title: "Validation Error",
            description: `Please enter a valid URL for ${field.label}`,
            variant: "destructive"
          });
          return false;
        }
      }

      // Number validation
      if (field.type === 'number' || field.type === 'currency') {
        if (value && typeof value === 'string') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            toast({
              title: "Validation Error",
              description: `${field.label} must be a valid number`,
              variant: "destructive"
            });
            return false;
          }
          
          if (field.validation?.min !== undefined && numValue < field.validation.min) {
            toast({
              title: "Validation Error",
              description: `${field.label} must be at least ${field.validation.min}`,
              variant: "destructive"
            });
            return false;
          }
          
          if (field.validation?.max !== undefined && numValue > field.validation.max) {
            toast({
              title: "Validation Error",
              description: `${field.label} must be at most ${field.validation.max}`,
              variant: "destructive"
            });
            return false;
          }
        }
      }

      // Text length validation
      if ((field.type === 'text' || field.type === 'textarea') && typeof value === 'string') {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          toast({
            title: "Validation Error",
            description: `${field.label} must be at least ${field.validation.minLength} characters`,
            variant: "destructive"
          });
          return false;
        }
        
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          toast({
            title: "Validation Error", 
            description: `${field.label} must be at most ${field.validation.maxLength} characters`,
            variant: "destructive"
          });
          return false;
        }
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Get vendor name and email from responses
      const vendorNameField = form?.fields.find(f => f.label.toLowerCase().includes('name'));
      const vendorEmailField = form?.fields.find(f => f.type === 'email');
      
      const vendorName = vendorNameField ? String(responses[vendorNameField.id] || 'Unknown Vendor') : 'Unknown Vendor';
      const vendorEmail = vendorEmailField ? String(responses[vendorEmailField.id] || '') : '';

      // Submit to Supabase
      const { error } = await supabase
        .from('vendor_submissions')
        .insert({
          form_id: formId!,
          vendor_name: vendorName,
          vendor_email: vendorEmail,
          responses: responses,
          status: 'pending',
        });

      if (error) {
        console.error('Error submitting form:', error);
        toast({
          title: "Error",
          description: "Failed to submit form. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setIsSubmitted(true);
      localStorage.setItem(`vendor_form_submitted_${formId}`, 'true');

      toast({
        title: "Success!",
        description: "Your vendor registration has been submitted successfully."
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: VendorFormField) => {
    const value = responses[field.id] || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={String(value)}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'select':
        return (
          <Select
            value={String(value)}
            onValueChange={(val) => handleInputChange(field.id, val)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, i) => {
                const clean = (option ?? '').toString().trim();
                const valueSafe = clean || `option_${i + 1}`;
                const labelSafe = clean || `Option ${i + 1}`;
                return (
                  <SelectItem key={`${valueSafe}_${i}`} value={valueSafe}>
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
            onValueChange={(val) => handleInputChange(field.id, val)}
            required={field.required}
          >
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${i}`} />
                <Label htmlFor={`${field.id}-${i}`} className="text-sm">{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        const checkboxValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${i}`}
                  checked={checkboxValues.includes(option)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...checkboxValues, option]
                      : checkboxValues.filter(v => v !== option);
                    handleInputChange(field.id, newValues);
                  }}
                />
                <Label htmlFor={`${field.id}-${i}`} className="text-sm">{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <Input
            id={field.id}
            type="file"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                handleInputChange(field.id, files[0].name);
              }
            }}
            accept={field.validation?.fileTypes?.map(type => `.${type}`).join(',')}
            required={field.required}
          />
        );

      case 'rating':
        const ratingValue = typeof value === 'number' ? value : 0;
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 cursor-pointer transition-colors ${
                  star <= ratingValue ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
                onClick={() => handleInputChange(field.id, star)}
              />
            ))}
          </div>
        );

      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={String(value)}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case 'number':
      case 'currency':
        return (
          <Input
            id={field.id}
            type="number"
            value={String(value)}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.type === 'currency' ? '0.01' : undefined}
          />
        );

      case 'address':
        return (
          <Textarea
            id={field.id}
            value={String(value)}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder || "Enter your full address"}
            required={field.required}
            rows={3}
          />
        );
      
      default:
        return (
          <Input
            id={field.id}
            type={field.type === 'phone' ? 'tel' : field.type}
            value={String(value)}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Store className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p className="text-gray-600 mb-4">
              The vendor registration form you're looking for doesn't exist or is no longer active.
            </p>
            <Button onClick={() => navigate('/')}>Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">
              {form.settings.customSubmissionMessage || 
                "Your vendor registration has been submitted successfully. We'll review your application and get back to you soon."
              }
            </p>
            <Button onClick={() => navigate('/')}>Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Event Information Section */}
        {event && (
          <Card className="mb-6">
            <CardContent className="p-0">
              {event.banner_url && (
                <div className="w-full h-48 sm:h-64 relative overflow-hidden rounded-t-lg">
                  <img 
                    src={event.banner_url} 
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              )}
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h1>
                {event.description && (
                  <p className="text-gray-600 mb-4">{event.description}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.start_time), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(event.start_time), 'h:mm a')} - {format(new Date(event.end_time), 'h:mm a')}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-6 w-6" />
              {form.title}
            </CardTitle>
            {form.description && (
              <p className="text-muted-foreground">{form.description}</p>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields.map((field) => {
                // Handle conditional fields
                if (field.conditional) {
                  const dependentValue = responses[field.conditional.showIf];
                  if (dependentValue !== field.conditional.value) {
                    return null;
                  }
                }

                return (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.description && (
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    )}
                    {renderField(field)}
                  </div>
                );
              })}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorForm;