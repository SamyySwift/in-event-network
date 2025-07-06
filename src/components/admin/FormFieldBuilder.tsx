import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, GripVertical, Edit2, Trash2, FormInput, AlignLeft, CheckSquare, List, Calendar, Clock, Grid3X3 } from 'lucide-react';
import { useTicketFormFields, FormField } from '@/hooks/useTicketFormFields';
import { FormFieldEditor } from './FormFieldEditor';
import { Badge } from '@/components/ui/badge';

interface FormFieldBuilderProps {
  ticketTypeId: string;
}

const fieldTypeIcons = {
  short_answer: FormInput,
  paragraph: AlignLeft,
  multiple_choice: CheckSquare,
  checkboxes: CheckSquare,
  dropdown: List,
  date: Calendar,
  time: Clock,
  grid: Grid3X3,
};

const fieldTypeLabels = {
  short_answer: 'Short Answer',
  paragraph: 'Paragraph',
  multiple_choice: 'Multiple Choice',
  checkboxes: 'Checkboxes',
  dropdown: 'Dropdown',
  date: 'Date',
  time: 'Time',
  grid: 'Grid',
};

export function FormFieldBuilder({ ticketTypeId }: FormFieldBuilderProps) {
  const { formFields, createField, updateField, deleteField, reorderFields } = useTicketFormFields(ticketTypeId);
  const [selectedFieldType, setSelectedFieldType] = useState<FormField['field_type']>('short_answer');
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddField = async () => {
    const newField: Omit<FormField, 'id' | 'created_at' | 'updated_at'> = {
      ticket_type_id: ticketTypeId,
      field_type: selectedFieldType,
      label: `New ${fieldTypeLabels[selectedFieldType]}`,
      is_required: false,
      field_order: formFields.length,
      field_options: selectedFieldType === 'multiple_choice' || selectedFieldType === 'checkboxes' || selectedFieldType === 'dropdown'
        ? { options: [{ id: '1', label: 'Option 1', value: 'option_1' }] }
        : selectedFieldType === 'grid'
        ? { 
            grid_rows: [{ id: '1', label: 'Row 1', value: 'row_1' }],
            grid_columns: [{ id: '1', label: 'Column 1', value: 'col_1' }],
            grid_type: 'multiple_choice'
          }
        : undefined,
    };

    await createField.mutateAsync(newField);
    setShowAddDialog(false);
    setSelectedFieldType('short_answer');
  };

  const handleDeleteField = async (fieldId: string) => {
    if (confirm('Are you sure you want to delete this form field?')) {
      await deleteField.mutateAsync(fieldId);
    }
  };

  const handleMoveField = async (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = formFields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= formFields.length) return;

    const reorderedFields = [...formFields];
    [reorderedFields[currentIndex], reorderedFields[newIndex]] = [reorderedFields[newIndex], reorderedFields[currentIndex]];

    const updates = reorderedFields.map((field, index) => ({
      id: field.id,
      field_order: index,
    }));

    await reorderFields.mutateAsync(updates);
  };

  if (formFields.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
          <FormInput className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No form fields yet</h3>
          <p className="text-muted-foreground mb-4">
            Add custom form fields to collect additional information from attendees during ticket purchase.
          </p>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Form Field
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Form Field</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Field Type</label>
                  <Select value={selectedFieldType} onValueChange={(value) => setSelectedFieldType(value as FormField['field_type'])}>
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
                  <Button onClick={handleAddField} disabled={createField.isPending} className="flex-1">
                    {createField.isPending ? 'Adding...' : 'Add Field'}
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
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Custom Form Fields</h3>
          <p className="text-sm text-muted-foreground">
            These fields will appear during ticket purchase
          </p>
        </div>
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
                <Select value={selectedFieldType} onValueChange={(value) => setSelectedFieldType(value as FormField['field_type'])}>
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
                <Button onClick={handleAddField} disabled={createField.isPending} className="flex-1">
                  {createField.isPending ? 'Adding...' : 'Add Field'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {formFields.map((field, index) => {
          const Icon = fieldTypeIcons[field.field_type];
          return (
            <Card key={field.id}>
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
                      disabled={index === formFields.length - 1}
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
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteField(field.id)}
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
        <FormFieldEditor
          field={editingField}
          isOpen={!!editingField}
          onClose={() => setEditingField(null)}
          onUpdate={updateField.mutateAsync}
        />
      )}
    </div>
  );
}