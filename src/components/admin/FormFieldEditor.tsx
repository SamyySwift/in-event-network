import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { FormField, FormFieldOption } from '@/hooks/useTicketFormFields';

interface FormFieldEditorProps {
  field: FormField;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<FormField> & { id: string }) => Promise<any>;
}

export function FormFieldEditor({ field, isOpen, onClose, onUpdate }: FormFieldEditorProps) {
  const [label, setLabel] = useState(field.label);
  const [helperText, setHelperText] = useState(field.helper_text || '');
  const [isRequired, setIsRequired] = useState(field.is_required);
  const [options, setOptions] = useState<FormFieldOption[]>(field.field_options?.options || []);
  const [gridRows, setGridRows] = useState<FormFieldOption[]>(field.field_options?.grid_rows || []);
  const [gridColumns, setGridColumns] = useState<FormFieldOption[]>(field.field_options?.grid_columns || []);
  const [gridType, setGridType] = useState<'multiple_choice' | 'checkboxes'>(
    field.field_options?.grid_type || 'multiple_choice'
  );

  useEffect(() => {
    setLabel(field.label);
    setHelperText(field.helper_text || '');
    setIsRequired(field.is_required);
    setOptions(field.field_options?.options || []);
    setGridRows(field.field_options?.grid_rows || []);
    setGridColumns(field.field_options?.grid_columns || []);
    setGridType(field.field_options?.grid_type || 'multiple_choice');
  }, [field]);

  const hasOptions = ['multiple_choice', 'checkboxes', 'dropdown'].includes(field.field_type);
  const isGrid = field.field_type === 'grid';

  const addOption = () => {
    const newOption: FormFieldOption = {
      id: Date.now().toString(),
      label: `Option ${options.length + 1}`,
      value: `option_${options.length + 1}`,
    };
    setOptions([...options, newOption]);
  };

  const updateOption = (index: number, updates: Partial<FormFieldOption>) => {
    const updatedOptions = options.map((opt, i) => 
      i === index ? { ...opt, ...updates } : opt
    );
    setOptions(updatedOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const addGridRow = () => {
    const newRow: FormFieldOption = {
      id: Date.now().toString(),
      label: `Row ${gridRows.length + 1}`,
      value: `row_${gridRows.length + 1}`,
    };
    setGridRows([...gridRows, newRow]);
  };

  const updateGridRow = (index: number, updates: Partial<FormFieldOption>) => {
    const updatedRows = gridRows.map((row, i) => 
      i === index ? { ...row, ...updates } : row
    );
    setGridRows(updatedRows);
  };

  const removeGridRow = (index: number) => {
    setGridRows(gridRows.filter((_, i) => i !== index));
  };

  const addGridColumn = () => {
    const newColumn: FormFieldOption = {
      id: Date.now().toString(),
      label: `Column ${gridColumns.length + 1}`,
      value: `col_${gridColumns.length + 1}`,
    };
    setGridColumns([...gridColumns, newColumn]);
  };

  const updateGridColumn = (index: number, updates: Partial<FormFieldOption>) => {
    const updatedColumns = gridColumns.map((col, i) => 
      i === index ? { ...col, ...updates } : col
    );
    setGridColumns(updatedColumns);
  };

  const removeGridColumn = (index: number) => {
    setGridColumns(gridColumns.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const updates: Partial<FormField> & { id: string } = {
      id: field.id,
      label,
      helper_text: helperText,
      is_required: isRequired,
    };

    if (hasOptions) {
      updates.field_options = { options };
    } else if (isGrid) {
      updates.field_options = { grid_rows: gridRows, grid_columns: gridColumns, grid_type: gridType };
    }

    await onUpdate(updates);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Form Field</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Field Label</Label>
              <Input
                id="label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Enter field label"
              />
            </div>

            <div>
              <Label htmlFor="helper">Helper Text (Optional)</Label>
              <Textarea
                id="helper"
                value={helperText}
                onChange={(e) => setHelperText(e.target.value)}
                placeholder="Additional instructions for this field"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="required"
                checked={isRequired}
                onCheckedChange={setIsRequired}
              />
              <Label htmlFor="required">Required field</Label>
            </div>
          </div>

          {/* Options for multiple choice, checkboxes, dropdown */}
          {hasOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
              
              <div className="space-y-2">
                {options.map((option, index) => (
                  <Card key={option.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            value={option.label}
                            onChange={(e) => updateOption(index, { label: e.target.value })}
                            placeholder="Option label"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Grid Settings */}
          {isGrid && (
            <div className="space-y-4">
              <div>
                <Label>Grid Type</Label>
                <Select value={gridType} onValueChange={(value) => setGridType(value as 'multiple_choice' | 'checkboxes')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice (radio buttons)</SelectItem>
                    <SelectItem value="checkboxes">Checkboxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grid Rows */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Rows</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addGridRow}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Row
                    </Button>
                  </div>
                  {gridRows.map((row, index) => (
                    <div key={row.id} className="flex items-center gap-2">
                      <Input
                        value={row.label}
                        onChange={(e) => updateGridRow(index, { label: e.target.value })}
                        placeholder="Row label"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGridRow(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Grid Columns */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Columns</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addGridColumn}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Column
                    </Button>
                  </div>
                  {gridColumns.map((column, index) => (
                    <div key={column.id} className="flex items-center gap-2">
                      <Input
                        value={column.label}
                        onChange={(e) => updateGridColumn(index, { label: e.target.value })}
                        placeholder="Column label"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGridColumn(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}