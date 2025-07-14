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

  // Auto-save form data when form values change
  useEffect(() => {
    if (!isActive) return;
    
    const subscription = form.watch((data) => {
      // Only save if there's actual data
      if (data && Object.keys(data).some(key => data[key] !== undefined && data[key] !== '')) {
        setFormData(formKey, data as T);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, formKey, setFormData, isActive]);

  // Save form data manually
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