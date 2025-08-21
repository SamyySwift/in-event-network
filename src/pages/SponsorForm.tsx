import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, Send, CheckCircle, Calendar, Clock, MapPin } from 'lucide-react';

export default function SponsorForm() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchFormAndEvent = async () => {
      try {
        // Fetch sponsor form data
        const { data: formData, error: formError } = await supabase
          .from('sponsor_forms')
          .select('*')
          .eq('shareable_link', `${window.location.origin}/sponsor-form/${formId}`)
          .eq('is_active', true)
          .single();

        if (formError) throw formError;
        if (!formData) {
          toast({
            title: "Form not found",
            description: "This sponsor form is no longer available.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setForm(formData);

        // Fetch event data if we have an event_id
        if (formData.event_id) {
          const { data: eventData, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', formData.event_id)
            .single();

          if (eventError) {
            console.error('Error fetching event:', eventError);
          } else {
            setEvent(eventData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Unable to load the sponsor form.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (formId) {
      fetchFormAndEvent();
    }
  }, [formId, navigate]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFileUpload = async (fieldId: string, file: File | null) => {
    if (!file) {
      handleInputChange(fieldId, null);
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `sponsor-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      handleInputChange(fieldId, publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = form.form_fields.filter((field: any) => field.required);
      const missingFields = requiredFields.filter((field: any) => !formData[field.id]);

      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill out: ${missingFields.map((f: any) => f.label).join(', ')}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Map form data to sponsor record structure
      const sponsorData = {
        event_id: form.event_id,
        organization_name: formData['1'] || '',
        contact_person_name: formData['2'] || '',
        email: formData['3'] || '',
        phone_number: formData['4'] || null,
        sponsorship_type: formData['5'] || '',
        description: formData['6'] || '',
        logo_url: formData['7'] || null,
        website_link: formData['8'] || null,
        social_media_links: formData['9'] ? { links: formData['9'] } : {},
        additional_notes: formData['10'] || null,
        status: 'pending',
      };

      const { error } = await supabase
        .from('sponsors')
        .insert(sponsorData);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "Thank you for your sponsorship application. We'll be in touch soon!",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50"
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50 min-h-[100px] resize-none"
          />
        );
      
      case 'select':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleInputChange(field.id, val)}
            required={field.required}
          >
            <SelectTrigger className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'file':
        return (
          <ImageUpload
            onImageSelect={(file) => handleFileUpload(field.id, file)}
            label="Upload Logo/Image"
            accept="image/*"
          />
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
            className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50"
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center rounded-xl border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Application Submitted!
            </h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your interest in sponsoring or partnering with us. 
              We've received your application and will review it shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              We'll contact you at the email address you provided within 2-3 business days.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto">
        {/* Event Information Section */}
        {event && (
          <div className="mb-8">
            {event.banner_url && (
              <div className="w-full h-64 rounded-lg overflow-hidden mb-6">
                <img 
                  src={event.banner_url} 
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <h1 className="text-3xl font-bold mb-4 text-foreground">{event.name}</h1>
            
            {event.description && (
              <p className="text-muted-foreground mb-4">{event.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(event.start_time).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Card className="rounded-xl border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 shadow-lg mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {form.form_title}
            </CardTitle>
            {form.form_description && (
              <p className="text-muted-foreground mt-2">
                {form.form_description}
              </p>
            )}
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.form_fields.map((field: any) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id} className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                  {field.helper_text && (
                    <p className="text-xs text-muted-foreground">
                      {field.helper_text}
                    </p>
                  )}
                </div>
              ))}

              <div className="pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full rounded-xl h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-lg font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}