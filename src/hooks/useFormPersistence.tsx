import { useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useAdminFormPersistence } from './useAdminFormPersistence';

export const useFormPersistence = <T extends Record<string, any>>(
  formKey: string,
  form: UseFormReturn<T>,
  isActive: boolean = true
) => {
  const { getFormData, setFormData, clearFormData, hasFormData } = useAdminFormPersistence();

  // Restore form data when component mounts
  useEffect(() => {
    if (!isActive) return;
    
    const savedData = getFormData(formKey);
    if (savedData) {
      Object.keys(savedData).forEach(key => {
        form.setValue(key as any, savedData[key]);
      });
    }
  }, [formKey, getFormData, form, isActive]);

  // Save form data when form values change
  const saveFormData = useCallback((data: T) => {
    if (!isActive) return;
    setFormData(formKey, data);
  }, [formKey, setFormData, isActive]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    clearFormData(formKey);
  }, [formKey, clearFormData]);

  // Check if we have saved data
  const hasSavedData = hasFormData(formKey);

  return {
    saveFormData,
    clearSavedData,
    hasSavedData,
  };
};