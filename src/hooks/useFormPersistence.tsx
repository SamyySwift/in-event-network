import { useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';

export const useFormPersistence = <T extends Record<string, any>>(
  formKey: string,
  form: UseFormReturn<T>,
  isActive: boolean = true
) => {
  const STORAGE_KEY = 'form-persistence';

  const getFormData = useCallback((key: string): T | null => {
    try {
      const storage = localStorage.getItem(STORAGE_KEY);
      if (!storage) return null;
      
      const parsedStorage = JSON.parse(storage);
      return parsedStorage[key] || null;
    } catch (error) {
      console.error('Error reading form data from localStorage:', error);
      return null;
    }
  }, []);

  const setFormData = useCallback((key: string, data: T) => {
    try {
      const storage = localStorage.getItem(STORAGE_KEY);
      const parsedStorage = storage ? JSON.parse(storage) : {};
      
      parsedStorage[key] = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedStorage));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  }, []);

  const clearFormData = useCallback((key: string) => {
    try {
      const storage = localStorage.getItem(STORAGE_KEY);
      if (!storage) return;
      
      const parsedStorage = JSON.parse(storage);
      delete parsedStorage[key];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedStorage));
    } catch (error) {
      console.error('Error clearing form data from localStorage:', error);
    }
  }, []);

  const hasFormData = useCallback((key: string): boolean => {
    try {
      const storage = localStorage.getItem(STORAGE_KEY);
      if (!storage) return false;
      
      const parsedStorage = JSON.parse(storage);
      return Boolean(parsedStorage[key] && Object.keys(parsedStorage[key]).length > 0);
    } catch (error) {
      console.error('Error checking form data in localStorage:', error);
      return false;
    }
  }, []);

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