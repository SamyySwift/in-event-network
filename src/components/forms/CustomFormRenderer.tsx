import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/hooks/useTicketFormFields';
import { Card, CardContent } from '@/components/ui/card';

interface CustomFormRendererProps {
  formFields: FormField[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  errors?: Record<string, string>;
}

export function CustomFormRenderer({ formFields, values, onChange, errors }: CustomFormRendererProps) {
  if (formFields.length === 0) {
    return null;
  }

  const renderField = (field: FormField) => {
    const value = values[field.id] || '';
    const error = errors?.[field.id];

    const baseProps = {
      id: field.id,
      required: field.is_required,
      'aria-describedby': field.helper_text ? `${field.id}-help` : undefined,
      'aria-invalid': !!error,
    };

    switch (field.field_type) {
      case 'short_answer':
        return (
          <Input
            {...baseProps}
            type="text"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder="Enter your answer"
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'paragraph':
        return (
          <Textarea
            {...baseProps}
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder="Enter your response"
            rows={3}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'multiple_choice':
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) => onChange(field.id, newValue)}
          >
            {field.field_options?.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.id}`} />
                <Label htmlFor={`${field.id}-${option.id}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {field.field_options?.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.id}`}
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (checked) {
                      onChange(field.id, [...currentValues, option.value]);
                    } else {
                      onChange(field.id, currentValues.filter((v: string) => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${option.id}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <Select value={value} onValueChange={(newValue) => onChange(field.id, newValue)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.field_options?.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            {...baseProps}
            type="date"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'time':
        return (
          <Input
            {...baseProps}
            type="time"
            value={value}
            onChange={(e) => onChange(field.id, e.target.value)}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'grid':
        return (
          <div className="space-y-4">
            {field.field_options?.grid_rows?.map((row) => (
              <div key={row.id} className="space-y-2">
                <Label className="font-medium">{row.label}</Label>
                {field.field_options?.grid_type === 'multiple_choice' ? (
                  <RadioGroup
                    value={value?.[row.value] || ''}
                    onValueChange={(newValue) => 
                      onChange(field.id, { ...value, [row.value]: newValue })
                    }
                  >
                    <div className="flex flex-wrap gap-4">
                      {field.field_options?.grid_columns?.map((column) => (
                        <div key={column.id} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={column.value} 
                            id={`${field.id}-${row.id}-${column.id}`} 
                          />
                          <Label 
                            htmlFor={`${field.id}-${row.id}-${column.id}`} 
                            className="font-normal text-sm"
                          >
                            {column.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {field.field_options?.grid_columns?.map((column) => (
                      <div key={column.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${field.id}-${row.id}-${column.id}`}
                          checked={
                            Array.isArray(value?.[row.value]) 
                              ? value[row.value].includes(column.value)
                              : false
                          }
                          onCheckedChange={(checked) => {
                            const currentRowValues = Array.isArray(value?.[row.value]) 
                              ? value[row.value] 
                              : [];
                            const newRowValues = checked
                              ? [...currentRowValues, column.value]
                              : currentRowValues.filter((v: string) => v !== column.value);
                            onChange(field.id, { ...value, [row.value]: newRowValues });
                          }}
                        />
                        <Label 
                          htmlFor={`${field.id}-${row.id}-${column.id}`} 
                          className="font-normal text-sm"
                        >
                          {column.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Additional Information</h3>
            <p className="text-sm text-muted-foreground">
              Please provide the following information to complete your ticket purchase.
            </p>
          </div>

          {formFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-sm font-medium">
                {field.label}
                {field.is_required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {renderField(field)}
              
              {field.helper_text && (
                <p id={`${field.id}-help`} className="text-xs text-muted-foreground">
                  {field.helper_text}
                </p>
              )}
              
              {errors?.[field.id] && (
                <p className="text-xs text-red-500">{errors[field.id]}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}