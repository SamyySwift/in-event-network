import React from 'react';
import { useRoleValidation } from '@/hooks/useRoleValidation';

// Mount this component anywhere inside AuthProvider to keep the local role
// in sync with the database and auto-redirect to the correct dashboard.
const RoleSync: React.FC = () => {
  useRoleValidation();
  return null;
};

export default RoleSync;
