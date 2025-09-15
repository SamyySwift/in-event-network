import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';
import { VendorFormField } from '@/types/vendorForm';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface VendorFormFieldBuilderProps {
  fields: VendorFormField[];
  onFieldsChange: (fields: VendorFormField[]) => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input', icon: '📝' },
  { value: 'textarea', label: 'Text Area', icon: '📄' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'phone', label: 'Phone', icon: '📞' },
  { value: 'url', label: 'Website URL', icon: '🌐' },
  { value: 'number', label: 'Number', icon: '🔢' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'select', label: 'Dropdown', icon: '⬇️' },
  { value: 'radio', label: 'Radio Buttons', icon: '🔘' },
  { value: 'checkbox', label: 'Checkboxes', icon: '☑️' },
  { value: 'file', label: 'File Upload', icon: '📎' },
  { value: 'rating', label: 'Rating', icon: '⭐' },
  { value: 'address', label: 'Address', icon: '📍' },
  { value: 'currency', label: 'Currency', icon: '💰' },
];

const VendorFormFieldBuilder: React.FC<VendorFormFieldBuilderProps> = ({
  fields,
  onFieldsChange,
}) => {
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const addField = () => {
    const newField: VendorFormField = {
      id: Date.now().toString(),
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      description: '',
      validation: {},
      options: [],
      defaultValue: '',
    };
    onFieldsChange([...fields, newField]);
    setExpandedField(newField.id);
  };

  const updateField = (id: string, updates: Partial<VendorFormField>) => {
    onFieldsChange(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (id: string) => {
    onFieldsChange(fields.filter((field) => field.id !== id));
    if (expandedField === id) {
      setExpandedField(null);
    }
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    const newFields = [...fields];
    const [removed] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, removed);
    onFieldsChange(newFields);
  };

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
      updateField(fieldId, {
        options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
      });
    }
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      updateField(fieldId, {
        options: field.options.filter((_, i) => i !== optionIndex)
      });
    }
  };

  const renderFieldPreview = (field: VendorFormField) => {
    const commonProps = {
      placeholder: field.placeholder,
      required: field.required,
      className: "w-full",
    };

    switch (field.type) {
      case 'textarea':
        return <Textarea {...commonProps} rows={3} />;
      case 'select':
        return (
          <Select>
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
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="radio" name={field.id} id={`${field.id}-${i}`} />
                <label htmlFor={`${field.id}-${i}`} className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <input type="checkbox" id={`${field.id}-${i}`} />
                <label htmlFor={`${field.id}-${i}`} className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
      case 'file':
        return <Input type="file" {...commonProps} />;
      case 'date':
        return <Input type="date" {...commonProps} />;
      case 'number':
      case 'currency':
        return <Input type="number" {...commonProps} />;
      case 'rating':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-2xl text-gray-300 cursor-pointer hover:text-yellow-400">⭐</span>
            ))}
          </div>
        );
      default:
        return <Input {...commonProps} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Form Fields</h3>
        <Button onClick={addField} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {fields.map((field, index) => (
          <Card key={field.id} className="p-4">
            <Collapsible
              open={expandedField === field.id}
              onOpenChange={(open) => setExpandedField(open ? field.id : null)}
            >
              <div className="space-y-4">
                {/* Field Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {field.label || `Field ${index + 1}`}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {FIELD_TYPES.find(t => t.value === field.type)?.label}
                      </Badge>
                      {field.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </CollapsibleTrigger>
                    <Button
                      onClick={() => removeField(field.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Field Preview */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {field.label || 'Untitled Field'}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {field.description && (
                    <p className="text-xs text-muted-foreground">{field.description}</p>
                  )}
                  {renderFieldPreview(field)}
                </div>

                {/* Field Configuration */}
                <CollapsibleContent className="space-y-4 mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Field Label</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Enter field label"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Field Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value: VendorFormField['type']) =>
                          updateField(field.id, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FIELD_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Placeholder Text</Label>
                      <Input
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        placeholder="Enter placeholder text"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Description (Optional)</Label>
                      <Input
                        value={field.description || ''}
                        onChange={(e) => updateField(field.id, { description: e.target.value })}
                        placeholder="Help text for this field"
                      />
                    </div>
                  </div>

                  {/* Options for select, radio, checkbox */}
                  {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">Options</Label>
                        <Button
                          onClick={() => addOption(field.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {field.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1"
                            />
                            <Button
                              onClick={() => removeOption(field.id, optionIndex)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validation Rules */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Validation & Settings</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                        />
                        <Label className="text-sm">Required field</Label>
                      </div>

                      {(field.type === 'text' || field.type === 'textarea') && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-xs">Min Length</Label>
                            <Input
                              type="number"
                              value={field.validation?.minLength || ''}
                              onChange={(e) =>
                                updateField(field.id, {
                                  validation: {
                                    ...field.validation,
                                    minLength: parseInt(e.target.value) || undefined,
                                  },
                                })
                              }
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Max Length</Label>
                            <Input
                              type="number"
                              value={field.validation?.maxLength || ''}
                              onChange={(e) =>
                                updateField(field.id, {
                                  validation: {
                                    ...field.validation,
                                    maxLength: parseInt(e.target.value) || undefined,
                                  },
                                })
                              }
                              placeholder="1000"
                            />
                          </div>
                        </>
                      )}

                      {(field.type === 'number' || field.type === 'currency') && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-xs">Min Value</Label>
                            <Input
                              type="number"
                              value={field.validation?.min || ''}
                              onChange={(e) =>
                                updateField(field.id, {
                                  validation: {
                                    ...field.validation,
                                    min: parseFloat(e.target.value) || undefined,
                                  },
                                })
                              }
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Max Value</Label>
                            <Input
                              type="number"
                              value={field.validation?.max || ''}
                              onChange={(e) =>
                                updateField(field.id, {
                                  validation: {
                                    ...field.validation,
                                    max: parseFloat(e.target.value) || undefined,
                                  },
                                })
                              }
                              placeholder="999999"
                            />
                          </div>
                        </>
                      )}

                      {field.type === 'file' && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-xs">Allowed File Types</Label>
                            <Input
                              value={field.validation?.fileTypes?.join(', ') || ''}
                              onChange={(e) =>
                                updateField(field.id, {
                                  validation: {
                                    ...field.validation,
                                    fileTypes: e.target.value.split(',').map(s => s.trim()),
                                  },
                                })
                              }
                              placeholder="pdf, doc, jpg, png"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Max File Size (MB)</Label>
                            <Input
                              type="number"
                              value={field.validation?.maxFileSize || ''}
                              onChange={(e) =>
                                updateField(field.id, {
                                  validation: {
                                    ...field.validation,
                                    maxFileSize: parseFloat(e.target.value) || undefined,
                                  },
                                })
                              }
                              placeholder="5"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </Card>
        ))}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No fields added yet. Click "Add Field" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default VendorFormFieldBuilder;