import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, Store } from 'lucide-react';

interface VendorForm {
  id: string;
  title: string;
  description: string;
  fields: VendorFormField[];
  isActive: boolean;
  submissionsCount: number;
}

interface VendorFormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'url';
  required: boolean;
  placeholder?: string;
}

interface VendorSubmission {
  id: string;
  formId: string;
  responses: Record<string, string>;
  submittedAt: string;
  vendorName: string;
  vendorEmail: string;
}

const VendorForm = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<VendorForm | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll simulate loading the form from localStorage
    const loadForm = () => {
      try {
        const savedForms = localStorage.getItem('vendorForms');
        if (savedForms) {
          const forms: VendorForm[] = JSON.parse(savedForms);
          const foundForm = forms.find(f => f.id === formId);
          
          if (foundForm && foundForm.isActive) {
            setForm(foundForm);
          } else {
            // Form not found or inactive
            setForm(null);
          }
        }
      } catch (error) {
        console.error('Error loading form:', error);
      } finally {
        setLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  const handleInputChange = (fieldId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const validateForm = () => {
    if (!form) return false;
    
    for (const field of form.fields) {
      if (field.required && !responses[field.id]?.trim()) {
        toast({
          title: "Validation Error",
          description: `${field.label} is required`,
          variant: "destructive"
        });
        return false;
      }
      
      // Email validation
      if (field.type === 'email' && responses[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(responses[field.id])) {
          toast({
            title: "Validation Error",
            description: `Please enter a valid email for ${field.label}`,
            variant: "destructive"
          });
          return false;
        }
      }
      
      // URL validation
      if (field.type === 'url' && responses[field.id]) {
        try {
          new URL(responses[field.id]);
        } catch {
          toast({
            title: "Validation Error",
            description: `Please enter a valid URL for ${field.label}`,
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
      // Create submission object
      const submission: VendorSubmission = {
        id: Date.now().toString(),
        formId: formId!,
        responses,
        submittedAt: new Date().toISOString(),
        vendorName: responses[form?.fields.find(f => f.label.toLowerCase().includes('name'))?.id || ''] || 'Unknown Vendor',
        vendorEmail: responses[form?.fields.find(f => f.type === 'email')?.id || ''] || ''
      };
      
      // Save submission to localStorage (in real app, this would be an API call)
      const existingSubmissions = localStorage.getItem('vendorSubmissions');
      const submissions: VendorSubmission[] = existingSubmissions ? JSON.parse(existingSubmissions) : [];
      submissions.push(submission);
      localStorage.setItem('vendorSubmissions', JSON.stringify(submissions));
      
      // Update form submission count
      const savedForms = localStorage.getItem('vendorForms');
      if (savedForms) {
        const forms: VendorForm[] = JSON.parse(savedForms);
        const updatedForms = forms.map(f => 
          f.id === formId ? { ...f, submissionsCount: (f.submissionsCount || 0) + 1 } : f
        );
        localStorage.setItem('vendorForms', JSON.stringify(updatedForms));
      }
      
      setIsSubmitted(true);
      
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
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
          />
        );
      
      default:
        return (
          <Input
            id={field.id}
            type={field.type === 'phone' ? 'tel' : field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
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
              Your vendor registration has been submitted successfully. We'll review your application and get back to you soon.
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
              {form.fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
              
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