import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAdminSponsors } from '@/hooks/useAdminSponsors';
import { Users, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateSponsorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultFields = [
  { id: '1', label: 'Organization/Brand Name', type: 'text', required: true },
  { id: '2', label: 'Contact Person Name', type: 'text', required: true },
  { id: '3', label: 'Email Address', type: 'email', required: true },
  { id: '4', label: 'Phone Number', type: 'tel', required: false },
  { id: '5', label: 'Type of Sponsorship', type: 'select', required: true, options: ['Financial', 'Product', 'Service', 'Media', 'Other'] },
  { id: '6', label: 'Description or Proposal', type: 'textarea', required: true },
  { id: '7', label: 'Logo/Company Image Upload', type: 'file', required: false },
  { id: '8', label: 'Website URL', type: 'url', required: false },
  { id: '9', label: 'Social Media Links', type: 'textarea', required: false, placeholder: 'LinkedIn: ...\nTwitter: ...\nInstagram: ...' },
  { id: '10', label: 'Additional Notes', type: 'textarea', required: false },
];

export function CreateSponsorFormDialog({ open, onOpenChange }: CreateSponsorFormDialogProps) {
  const [formTitle, setFormTitle] = useState('Sponsor & Partner Application');
  const [formDescription, setFormDescription] = useState('Please fill out this form to apply for sponsorship or partnership opportunities.');
  const [formFields, setFormFields] = useState(defaultFields);

  const { createSponsorForm } = useAdminSponsors();

  const resetForm = () => {
    setFormTitle('Sponsor & Partner Application');
    setFormDescription('Please fill out this form to apply for sponsorship or partnership opportunities.');
    setFormFields(defaultFields);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createSponsorForm.mutateAsync({
        form_title: formTitle,
        form_description: formDescription,
        form_fields: formFields,
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating sponsor form:', error);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (id: string, updates: any) => {
    setFormFields(formFields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const removeField = (id: string) => {
    setFormFields(formFields.filter(field => field.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-primary" />
            Create Sponsor Form
          </DialogTitle>
          <DialogDescription>
            Create a custom form to collect sponsorship and partnership applications from potential sponsors.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="formTitle" className="text-sm font-medium">
                Form Title
              </Label>
              <Input
                id="formTitle"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="formDescription" className="text-sm font-medium">
                Form Description
              </Label>
              <Textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="rounded-xl border-2 transition-all duration-200 focus:border-primary/50 min-h-[80px] resize-none"
                placeholder="Describe the purpose of this form..."
              />
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Form Fields</Label>
              <Button 
                type="button"
                onClick={addField}
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {formFields.map((field, index) => (
                <Card key={field.id} className="rounded-lg border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">Field {index + 1}</CardTitle>
                      <Button
                        type="button"
                        onClick={() => removeField(field.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="rounded-lg border"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => {
                            const updates: any = { type: value };
                            // Initialize options for select fields
                            if (value === 'select' && !field.options) {
                              updates.options = ['Option 1', 'Option 2'];
                            }
                            updateField(field.id, updates);
                          }}
                        >
                          <SelectTrigger className="rounded-lg border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="tel">Phone</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="file">File Upload</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Options for select fields */}
                    {field.type === 'select' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Options</Label>
                          <Button
                            type="button"
                            onClick={() => {
                              const currentOptions = field.options || [];
                              updateField(field.id, { 
                                options: [...currentOptions, `Option ${currentOptions.length + 1}`] 
                              });
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {(field.options || []).map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(field.options || [])];
                                  newOptions[optionIndex] = e.target.value;
                                  updateField(field.id, { options: newOptions });
                                }}
                                className="text-xs h-7"
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  const newOptions = (field.options || []).filter((_, i) => i !== optionIndex);
                                  updateField(field.id, { options: newOptions });
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                disabled={(field.options || []).length <= 1}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`required-${field.id}`}
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor={`required-${field.id}`} className="text-xs">
                        Required field
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createSponsorForm.isPending}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {createSponsorForm.isPending ? 'Creating...' : 'Create Form'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}