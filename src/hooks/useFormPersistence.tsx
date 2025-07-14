
import { useEffect, useCallback, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useAdminFormPersistence } from './useAdminFormPersistence';
import { useToast } from '@/hooks/use-toast';

export const useFormPersistence = <T extends Record<string, any>>(
  formKey: string,
  form: UseFormReturn<T>,
  isActive: boolean = true,
  options: {
    autoSaveInterval?: number;
    showSaveNotifications?: boolean;
  } = {}
) => {
  const { getFormData, setFormData, clearFormData, hasFormData } = useAdminFormPersistence();
  const { toast } = useToast();
  const autoSaveRef = useRef<NodeJS.Timeout>();
  const { autoSaveInterval = 3000, showSaveNotifications = true } = options;

  // Restore form data when component mounts
  useEffect(() => {
    if (!isActive) return;
    
    const savedData = getFormData(formKey);
    if (savedData) {
      Object.keys(savedData).forEach(key => {
        form.setValue(key as any, savedData[key]);
      });
      
      if (showSaveNotifications) {
        toast({
          title: "Form Data Restored",
          description: "Your previous work has been restored.",
          duration: 3000,
        });
      }
    }
  }, [formKey, getFormData, form, isActive, showSaveNotifications, toast]);

  // Auto-save form data when form values change
  useEffect(() => {
    if (!isActive) return;

    const subscription = form.watch((data) => {
      // Clear existing timeout
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }

      // Set new timeout for auto-save
      autoSaveRef.current = setTimeout(() => {
        if (data && Object.keys(data).length > 0) {
          setFormData(formKey, data as T);
        }
      }, autoSaveInterval);
    });

    return () => {
      subscription.unsubscribe();
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [form, formKey, setFormData, isActive, autoSaveInterval]);

  // Manual save function
  const saveFormData = useCallback((data: T) => {
    if (!isActive) return;
    setFormData(formKey, data);
    
    if (showSaveNotifications) {
      toast({
        title: "Form Saved",
        description: "Your changes have been saved.",
        duration: 2000,
      });
    }
  }, [formKey, setFormData, isActive, showSaveNotifications, toast]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    clearFormData(formKey);
    
    if (showSaveNotifications) {
      toast({
        title: "Form Data Cleared",
        description: "Saved form data has been removed.",
        duration: 2000,
      });
    }
  }, [formKey, clearFormData, showSaveNotifications, toast]);

  // Check if we have saved data
  const hasSavedData = hasFormData(formKey);

  return {
    saveFormData,
    clearSavedData,
    hasSavedData,
  };
};
