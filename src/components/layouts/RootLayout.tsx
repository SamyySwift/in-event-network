import React from 'react';
import { Outlet } from 'react-router-dom';
import RoleSync from '@/components/auth/RoleSync';

const RootLayout: React.FC = () => {
  return (
    <>
      <RoleSync />
      <Outlet />
    </>
  );
};

export default RootLayout;