
import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { AttendeeEventProvider } from '@/contexts/AttendeeEventContext'
import { AdminEventProvider } from '@/hooks/useAdminEventContext'
import { NetworkProvider } from '@/contexts/NetworkContext'
import { Toaster } from '@/components/ui/toaster'
import { router } from './routes.tsx'
import './index.css'

// Optimized QueryClient for slow networks (2G/Edge)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh longer
      gcTime: 1000 * 60 * 15, // 15 minutes - keep in cache longer
      retry: 1, // Reduce retries on slow networks
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false, // Don't refetch on focus - saves bandwidth
      refetchOnReconnect: true, // Do refetch when connection restored
      networkMode: 'offlineFirst', // Use cache first, fetch in background
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

// Simple loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NetworkProvider>
        <AuthProvider>
          <AttendeeEventProvider>
            <AdminEventProvider>
              <Suspense fallback={<PageLoader />}>
                <RouterProvider router={router} />
              </Suspense>
              <Toaster />
            </AdminEventProvider>
          </AttendeeEventProvider>
        </AuthProvider>
      </NetworkProvider>
    </QueryClientProvider>
  </StrictMode>
);
