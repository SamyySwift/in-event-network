import React, { useEffect, useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2 } from 'lucide-react';
import { useAdminSponsors } from '@/hooks/useAdminSponsors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EditSponsorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: any | null;
}

export function EditSponsorFormDialog({ open, onOpenChange, form }: EditSponsorFormDialogProps) {
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFields, setFormFields] = useState<any[]>([]);

  const { updateSponsorForm } = useAdminSponsors();

  useEffect(() => {
    if (form) {
      setFormTitle(form.form_title || '');
      setFormDescription(form.form_description || '');
      // 确保是数组
      setFormFields(Array.isArray(form.form_fields) ? form.form_fields : []);
    }
  }, [form]);

  const handleDialogChange = (openVal: boolean) => {
    onOpenChange(openVal);
  };

  const addField = () => {
    const newField = {
      id: `field_${Date.now()}`,
      label: 'New Field',
      type: 'text',
      required: false,
    };
    setFormFields(prev => [...prev, newField]);
  };

  const updateField = (id: string, updates: any) => {
    setFormFields(prev => prev.map(field => (field.id === id ? { ...field, ...updates } : field)));
  };

  const removeField = (id: string) => {
    setFormFields(prev => prev.filter(field => field.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    await updateSponsorForm.mutateAsync({
      id: form.id,
      form_title: formTitle,
      form_description: formDescription,
      form_fields: formFields,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-primary" />
            Edit Sponsor Form
          </DialogTitle>
          <DialogDescription>
            Update the form title, description, and fields. Changes are synced live to the attendee form.
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
                <Card key={field.id || index} className="rounded-lg border">
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

                    {field.type === 'select' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Options</Label>
                          <Button
                            type="button"
                            onClick={() => {
                              const currentOptions = field.options || [];
                              updateField(field.id, {
                                options: [...currentOptions, `Option ${currentOptions.length + 1}`],
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
                          {(field.options || []).map((option: string, optionIndex: number) => (
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
                        checked={!!field.required}
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
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}