import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
  const [formStorage, setFormStorage] = useState<Record<string, FormData>>({});

  const getFormData = useCallback((formKey: string): FormData | null => {
    return formStorage[formKey] || null;
  }, [formStorage]);

  const setFormData = useCallback((formKey: string, data: FormData) => {
    setFormStorage(prev => ({
      ...prev,
      [formKey]: data
    }));
  }, []);

  const clearFormData = useCallback((formKey: string) => {
    setFormStorage(prev => {
      const newStorage = { ...prev };
      delete newStorage[formKey];
      return newStorage;
    });
  }, []);

  const hasFormData = useCallback((formKey: string): boolean => {
    return Boolean(formStorage[formKey]);
  }, [formStorage]);

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