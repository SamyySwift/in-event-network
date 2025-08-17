export interface VendorFormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'url' | 'number' | 'date' | 'select' | 'checkbox' | 'radio' | 'file' | 'rating' | 'address' | 'currency';
  required: boolean;
  placeholder?: string;
  description?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    fileTypes?: string[];
    maxFileSize?: number; // in MB
  };
  options?: string[]; // for select, radio, checkbox
  defaultValue?: string | number | boolean;
  conditional?: {
    showIf: string; // field id
    value: string | boolean | number;
  };
}

export interface VendorForm {
  id: string;
  title: string;
  description: string;
  fields: VendorFormField[];
  isActive: boolean;
  createdAt: string;
  submissionsCount: number;
  settings: {
    allowMultipleSubmissions: boolean;
    requireEmailVerification: boolean;
    customSubmissionMessage?: string;
    autoResponse?: boolean;
    categories: string[];
  };
}

export interface VendorSubmission {
  id: string;
  formId: string;
  responses: Record<string, string | number | boolean | string[]>;
  submittedAt: string;
  vendorName: string;
  vendorEmail: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}