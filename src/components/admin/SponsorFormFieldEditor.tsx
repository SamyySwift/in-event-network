import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, FormInput, AlignLeft, CheckSquare, List, Calendar, Clock, Upload, Phone } from 'lucide-react';
import { SponsorFormField } from './SponsorFormFieldBuilder';

interface SponsorFormFieldEditorProps {
  field: SponsorFormField;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (field: Partial<SponsorFormField> & { id: string }) => Promise<void>;
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

export function SponsorFormFieldEditor({ field, isOpen, onClose, onUpdate }: SponsorFormFieldEditorProps) {
  const [formData, setFormData] = useState({
    label: field.label,
    placeholder: field.placeholder || '',
    helper_text: field.helper_text || '',
    is_required: field.is_required,
    field_type: field.field_type,
    field_options: field.field_options || {},
  });

  const [options, setOptions] = useState<Array<{ id: string; label: string; value: string }>>(
    field.field_options?.options || []
  );

  useEffect(() => {
    setFormData({
      label: field.label,
      placeholder: field.placeholder || '',
      helper_text: field.helper_text || '',
      is_required: field.is_required,
      field_type: field.field_type,
      field_options: field.field_options || {},
    });
    setOptions(field.field_options?.options || []);
  }, [field]);

  const handleSave = async () => {
    const updatedField = {
      id: field.id,
      ...formData,
      field_options: hasOptions() 
        ? { ...formData.field_options, options }
        : hasFileOptions()
        ? { 
            accept: formData.field_options.accept || '*/*',
            multiple: formData.field_options.multiple || false 
          }
        : hasNumberOptions()
        ? {
            min: formData.field_options.min || 0,
            max: formData.field_options.max || 100
          }
        : undefined,
    };

    await onUpdate(updatedField);
    onClose();
  };

  const hasOptions = () => ['select', 'checkboxes'].includes(formData.field_type);
  const hasFileOptions = () => formData.field_type === 'file';
  const hasNumberOptions = () => formData.field_type === 'number';

  const addOption = () => {
    const newOption = {
      id: Date.now().toString(),
      label: `Option ${options.length + 1}`,
      value: `option_${options.length + 1}`,
    };
    setOptions([...options, newOption]);
  };

  const updateOption = (id: string, label: string) => {
    setOptions(options.map(opt => 
      opt.id === id 
        ? { ...opt, label, value: label.toLowerCase().replace(/\s+/g, '_') }
        : opt
    ));
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(opt => opt.id !== id));
  };

  const Icon = fieldTypeIcons[formData.field_type];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Edit {fieldTypeLabels[formData.field_type]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Field Type Badge */}
          <Badge variant="outline" className="w-fit">
            {fieldTypeLabels[formData.field_type]}
          </Badge>

          {/* Basic Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Field Label *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Enter field label"
              />
            </div>

            {!['date', 'time', 'file'].includes(formData.field_type) && (
              <div>
                <Label htmlFor="placeholder">Placeholder Text</Label>
                <Input
                  id="placeholder"
                  value={formData.placeholder}
                  onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                  placeholder="Enter placeholder text"
                />
              </div>
            )}

            <div>
              <Label htmlFor="helper_text">Helper Text</Label>
              <Textarea
                id="helper_text"
                value={formData.helper_text}
                onChange={(e) => setFormData({ ...formData, helper_text: e.target.value })}
                placeholder="Additional instructions or help text"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={formData.is_required}
                onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
              />
              <Label htmlFor="required">Required field</Label>
            </div>
          </div>

          {/* Options for select/checkboxes */}
          {hasOptions() && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      placeholder="Option text"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeOption(option.id)}
                      disabled={options.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File upload options */}
          {hasFileOptions() && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="accept">Accepted File Types</Label>
                <Select 
                  value={formData.field_options.accept || 'image/*'} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    field_options: { ...formData.field_options, accept: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image/*">Images Only</SelectItem>
                    <SelectItem value=".pdf">PDF Files</SelectItem>
                    <SelectItem value=".doc,.docx">Word Documents</SelectItem>
                    <SelectItem value="*/*">All Files</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="multiple"
                  checked={formData.field_options.multiple || false}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    field_options: { ...formData.field_options, multiple: checked }
                  })}
                />
                <Label htmlFor="multiple">Allow multiple files</Label>
              </div>
            </div>
          )}

          {/* Number options */}
          {hasNumberOptions() && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min">Minimum Value</Label>
                <Input
                  id="min"
                  type="number"
                  value={formData.field_options.min || 0}
                  onChange={(e) => setFormData({
                    ...formData,
                    field_options: { ...formData.field_options, min: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="max">Maximum Value</Label>
                <Input
                  id="max"
                  type="number"
                  value={formData.field_options.max || 100}
                  onChange={(e) => setFormData({
                    ...formData,
                    field_options: { ...formData.field_options, max: parseInt(e.target.value) || 100 }
                  })}
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}