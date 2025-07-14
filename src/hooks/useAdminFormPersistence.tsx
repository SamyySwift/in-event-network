import { createContext, useContext, useCallback, ReactNode } from 'react';

// Define the shape of form data that can be persisted
interface FormData {
  [key: string]: any;
}

interface AdminFormPersistenceContextType {
  getFormData: (formKey: string) => FormData | null;
  setFormData: (formKey: string, data: FormData) => void;
  clearFormData: (formKey: string) => void;
  hasFormData: (formKey: string) => boolean;
}

const AdminFormPersistenceContext = createContext<AdminFormPersistenceContextType | undefined>(undefined);

export const useAdminFormPersistence = () => {
  const context = useContext(AdminFormPersistenceContext);
  if (!context) {
    throw new Error('useAdminFormPersistence must be used within AdminFormPersistenceProvider');
  }
  return context;
};

export const AdminFormPersistenceProvider = ({ children }: { children: ReactNode }) => {
  const STORAGE_KEY = 'admin-form-persistence';

  const getFormData = useCallback((formKey: string): FormData | null => {
    try {
      const storage = localStorage.getItem(STORAGE_KEY);
      if (!storage) return null;
      
      const parsedStorage = JSON.parse(storage);
      return parsedStorage[formKey] || null;
    } catch (error) {
      console.error('Error reading form data from localStorage:', error);
      return null;
    }
  }, []);

  const setFormData = useCallback((formKey: string, data: FormData) => {
    try {
      const storage = localStorage.getItem(STORAGE_KEY);
      const parsedStorage = storage ? JSON.parse(storage) : {};
      
      parsedStorage[formKey] = data;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedStorage));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);
    }
  }, []);

  const clearFormData = useCallback((formKey: string) => {
    try {
      const storage = localStorage.getItem(STORAGE_KEY);
      if (!storage) return;
      
      const parsedStorage = JSON.parse(storage);
      delete parsedStorage[formKey];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedStorage));
    } catch (error) {
      console.error('Error clearing form data from localStorage:', error);
    }
  }, []);

  const hasFormData = useCallback((formKey: string): boolean => {
    try {
      const storage = localStorage.getItem(STORAGE_KEY);
      if (!storage) return false;
      
      const parsedStorage = JSON.parse(storage);
      return Boolean(parsedStorage[formKey] && Object.keys(parsedStorage[formKey]).length > 0);
    } catch (error) {
      console.error('Error checking form data in localStorage:', error);
      return false;
    }
  }, []);

  const value = {
    getFormData,
    setFormData,
    clearFormData,
    hasFormData,
  };

  return (
    <AdminFormPersistenceContext.Provider value={value}>
      {children}
    </AdminFormPersistenceContext.Provider>
  );
};