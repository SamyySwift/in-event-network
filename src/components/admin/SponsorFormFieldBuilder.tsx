import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, GripVertical, Edit2, Trash2, FormInput, AlignLeft, CheckSquare, List, Calendar, Clock, Grid3X3, Upload, Phone, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SponsorFormFieldEditor } from './SponsorFormFieldEditor';

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

interface SponsorFormFieldBuilderProps {
  formId: string;
  fields: SponsorFormField[];
  onCreateField: (field: Omit<SponsorFormField, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdateField: (field: Partial<SponsorFormField> & { id: string }) => Promise<void>;
  onDeleteField: (fieldId: string) => Promise<void>;
  onReorderFields: (updates: Array<{ id: string; field_order: number }>) => Promise<void>;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

const fieldTypeIcons = {
  text: FormInput,
  email: FormInput,
  tel: Phone,
  url: FormInput,
  textarea: AlignLeft,
  select: List,
  checkboxes: CheckSquare,
  date: Calendar,
  time: Clock,
  file: Upload,
  number: FormInput,
};

const fieldTypeLabels = {
  text: 'Text Input',
  email: 'Email',
  tel: 'Phone Number',
  url: 'Website URL',
  textarea: 'Long Text',
  select: 'Dropdown',
  checkboxes: 'Checkboxes',
  date: 'Date',
  time: 'Time',
  file: 'File Upload',
  number: 'Number',
};

const defaultFields = [
  { label: 'Organization Name', type: 'text', required: true, placeholder: 'Enter your organization name' },
  { label: 'Contact Person', type: 'text', required: true, placeholder: 'Full name of primary contact' },
  { label: 'Email Address', type: 'email', required: true, placeholder: 'contact@organization.com' },
  { label: 'Phone Number', type: 'tel', required: false, placeholder: '+234 xxx xxx xxxx' },
  { label: 'Sponsorship Type', type: 'select', required: true, options: ['Platinum Partner', 'Gold Sponsor', 'Silver Partner', 'Technology Partner', 'Media Partner', 'Community Partner'] },
  { label: 'Organization Description', type: 'textarea', required: true, placeholder: 'Tell us about your organization and what you do' },
  { label: 'Logo/Brand Assets', type: 'file', required: false, accept: 'image/*' },
  { label: 'Website URL', type: 'url', required: false, placeholder: 'https://yourwebsite.com' },
  { label: 'Social Media Links', type: 'textarea', required: false, placeholder: 'LinkedIn, Twitter, Instagram, etc.' },
  { label: 'Additional Notes', type: 'textarea', required: false, placeholder: 'Any additional information or specific requirements' },
];

export function SponsorFormFieldBuilder({ 
  formId, 
  fields, 
  onCreateField, 
  onUpdateField, 
  onDeleteField, 
  onReorderFields,
  isCreating,
  isUpdating,
  isDeleting
}: SponsorFormFieldBuilderProps) {
  const [selectedFieldType, setSelectedFieldType] = useState<SponsorFormField['field_type']>('text');
  const [editingField, setEditingField] = useState<SponsorFormField | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddField = async () => {
    const newField: Omit<SponsorFormField, 'id' | 'created_at' | 'updated_at'> = {
      form_id: formId,
      field_type: selectedFieldType,
      label: `New ${fieldTypeLabels[selectedFieldType]}`,
      is_required: false,
      field_order: fields.length,
      field_options: selectedFieldType === 'select' || selectedFieldType === 'checkboxes'
        ? { options: [{ id: '1', label: 'Option 1', value: 'option_1' }] }
        : selectedFieldType === 'file'
        ? { accept: 'image/*', multiple: false }
        : selectedFieldType === 'number'
        ? { min: 0, max: 100 }
        : undefined,
    };

    await onCreateField(newField);
    setShowAddDialog(false);
    setSelectedFieldType('text');
  };

  const handleAddDefaultFields = async () => {
    const fieldsToAdd = defaultFields.map((field, index) => ({
      form_id: formId,
      field_type: field.type as SponsorFormField['field_type'],
      label: field.label,
      placeholder: field.placeholder,
      is_required: field.required,
      field_order: fields.length + index,
      field_options: field.options 
        ? { options: field.options.map((opt, i) => ({ id: String(i + 1), label: opt, value: opt.toLowerCase().replace(/\s+/g, '_') })) }
        : field.accept 
        ? { accept: field.accept, multiple: false }
        : undefined,
    }));

    for (const field of fieldsToAdd) {
      await onCreateField(field);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (confirm('Are you sure you want to delete this form field?')) {
      await onDeleteField(fieldId);
    }
  };

  const handleMoveField = async (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const reorderedFields = [...fields];
    [reorderedFields[currentIndex], reorderedFields[newIndex]] = [reorderedFields[newIndex], reorderedFields[currentIndex]];

    const updates = reorderedFields.map((field, index) => ({
      id: field.id,
      field_order: index,
    }));

    await onReorderFields(updates);
  };

  if (fields.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl bg-muted/20">
          <FormInput className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No form fields yet</h3>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Create custom form fields to collect specific information from sponsors and partners.
            You can add individual fields or start with our recommended template.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleAddDefaultFields} disabled={isCreating} className="gap-2">
              <Building className="h-4 w-4" />
              {isCreating ? 'Adding Template...' : 'Add Sponsor Template'}
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Custom Field
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Form Field</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Field Type</label>
                    <Select value={selectedFieldType} onValueChange={(value) => setSelectedFieldType(value as SponsorFormField['field_type'])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(fieldTypeLabels).map(([value, label]) => {
                          const Icon = fieldTypeIcons[value as keyof typeof fieldTypeIcons];
                          return (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddField} disabled={isCreating} className="flex-1">
                      {isCreating ? 'Adding...' : 'Add Field'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Sponsor Form Fields</h3>
          <p className="text-sm text-muted-foreground">
            These fields will appear in your sponsorship application form
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleAddDefaultFields} disabled={isCreating}>
            <Building className="h-4 w-4 mr-2" />
            {isCreating ? 'Adding...' : 'Add Template'}
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Form Field</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Field Type</label>
                  <Select value={selectedFieldType} onValueChange={(value) => setSelectedFieldType(value as SponsorFormField['field_type'])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fieldTypeLabels).map(([value, label]) => {
                        const Icon = fieldTypeIcons[value as keyof typeof fieldTypeIcons];
                        return (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddField} disabled={isCreating} className="flex-1">
                    {isCreating ? 'Adding...' : 'Add Field'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => {
          const Icon = fieldTypeIcons[field.field_type];
          return (
            <Card key={field.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMoveField(field.id, 'up')}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleMoveField(field.id, 'down')}
                      disabled={index === fields.length - 1}
                    >
                      <GripVertical className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Badge variant="outline" className="text-xs">
                      {fieldTypeLabels[field.field_type]}
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{field.label}</span>
                      {field.is_required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                    {field.helper_text && (
                      <p className="text-sm text-muted-foreground truncate">{field.helper_text}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingField(field)}
                      disabled={isUpdating}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteField(field.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingField && (
        <SponsorFormFieldEditor
          field={editingField}
          isOpen={!!editingField}
          onClose={() => setEditingField(null)}
          onUpdate={onUpdateField}
        />
      )}
    </div>
  );
}