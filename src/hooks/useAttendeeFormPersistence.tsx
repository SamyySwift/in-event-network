
import { createContext, useContext, useCallback, ReactNode, useEffect, useState } from 'react';

// Define the shape of form data that can be persisted
interface FormData {
  [key: string]: any;
}

interface AttendeeFormPersistenceContextType {
  getFormData: (formKey: string) => FormData | null;
  setFormData: (formKey: string, data: FormData) => void;
  clearFormData: (formKey: string) => void;
  hasFormData: (formKey: string) => boolean;
  clearAllFormData: () => void;
}

const AttendeeFormPersistenceContext = createContext<AttendeeFormPersistenceContextType | undefined>(undefined);

export const useAttendeeFormPersistence = () => {
  const context = useContext(AttendeeFormPersistenceContext);
  if (!context) {
    throw new Error('useAttendeeFormPersistence must be used within AttendeeFormPersistenceProvider');
  }
  return context;
};

export const AttendeeFormPersistenceProvider = ({ children }: { children: ReactNode }) => {
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getFormData = useCallback((formKey: string): FormData | null => {
    if (!isHydrated) return null;
    try {
      const saved = localStorage.getItem(`attendee_form_${formKey}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error reading attendee form data from localStorage:', error);
      return null;
    }
  }, [isHydrated]);

  const setFormData = useCallback((formKey: string, data: FormData) => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(`attendee_form_${formKey}`, JSON.stringify(data));
      console.log(`Auto-saved attendee form data for: ${formKey}`);
    } catch (error) {
      console.error('Error saving attendee form data to localStorage:', error);
    }
  }, [isHydrated]);

  const clearFormData = useCallback((formKey: string) => {
    if (!isHydrated) return;
    try {
      localStorage.removeItem(`attendee_form_${formKey}`);
      console.log(`Cleared attendee form data for: ${formKey}`);
    } catch (error) {
      console.error('Error clearing attendee form data from localStorage:', error);
    }
  }, [isHydrated]);

  const hasFormData = useCallback((formKey: string): boolean => {
    if (!isHydrated) return false;
    try {
      const saved = localStorage.getItem(`attendee_form_${formKey}`);
      return saved !== null && saved !== 'null';
    } catch (error) {
      console.error('Error checking attendee form data in localStorage:', error);
      return false;
    }
  }, [isHydrated]);

  const clearAllFormData = useCallback(() => {
    if (!isHydrated) return;
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('attendee_form_')) {
          localStorage.removeItem(key);
        }
      });
      console.log('Cleared all attendee form data');
    } catch (error) {
      console.error('Error clearing all attendee form data:', error);
    }
  }, [isHydrated]);

  const value = {
    getFormData,
    setFormData,
    clearFormData,
    hasFormData,
    clearAllFormData,
  };

  return (
    <AttendeeFormPersistenceContext.Provider value={value}>
      {children}
    </AttendeeFormPersistenceContext.Provider>
  );
};
