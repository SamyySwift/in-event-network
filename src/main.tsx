
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { AttendeeEventProvider } from '@/contexts/AttendeeEventContext'
import { AdminEventProvider } from '@/hooks/useAdminEventContext'
import { Toaster } from '@/components/ui/toaster'
import RoleSync from '@/components/auth/RoleSync'
import { router } from './routes.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AttendeeEventProvider>
          <AdminEventProvider>
            <RoleSync />
            <RouterProvider router={router} />
            <Toaster />
          </AdminEventProvider>
        </AttendeeEventProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
