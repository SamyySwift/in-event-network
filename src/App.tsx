import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { AttendeeEventProvider } from '@/contexts/AttendeeEventContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LazyLoadErrorBoundary from '@/components/LazyLoadErrorBoundary';

// Eager load critical path components
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';

// Lazy load with retry wrapper for network resilience
const lazyWithRetry = (importFn: () => Promise<any>) => {
  return lazy(() => 
    importFn().catch((error) => {
      // Retry once after a short delay
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(importFn());
        }, 1500);
      });
    })
  );
};

// Public pages - lazy loaded with retry
const AuthCallback = lazyWithRetry(() => import('@/pages/AuthCallback'));
const Guide = lazyWithRetry(() => import('@/pages/Guide'));
const ScanQR = lazyWithRetry(() => import('@/pages/ScanQR'));
const BuyTickets = lazyWithRetry(() => import('@/pages/BuyTickets'));
const Index = lazyWithRetry(() => import('@/pages/Index'));
const DataPrivacy = lazyWithRetry(() => import('@/pages/DataPrivacy'));
const TermsOfService = lazyWithRetry(() => import('@/pages/TermsOfService'));

// Host pages
const HostDashboard = lazyWithRetry(() => import('@/pages/host/HostDashboard'));

// Admin pages
const AdminDashboard = lazyWithRetry(() => import('@/pages/admin/AdminDashboard'));
const AdminEvents = lazyWithRetry(() => import('@/pages/admin/AdminEvents'));
const AdminAttendees = lazyWithRetry(() => import('@/pages/admin/AdminAttendees'));
const AdminSpeakers = lazyWithRetry(() => import('@/pages/admin/AdminSpeakers'));
const AdminAnnouncements = lazyWithRetry(() => import('@/pages/admin/AdminAnnouncements'));
const AdminSchedule = lazyWithRetry(() => import('@/pages/admin/AdminSchedule'));
const AdminPolls = lazyWithRetry(() => import('@/pages/admin/AdminPolls'));
const AdminFacilities = lazyWithRetry(() => import('@/pages/admin/AdminFacilities'));
const AdminRules = lazyWithRetry(() => import('@/pages/admin/AdminRules'));
const AdminQuestions = lazyWithRetry(() => import('@/pages/admin/AdminQuestions'));
const AdminSuggestions = lazyWithRetry(() => import('@/pages/admin/AdminSuggestions'));
const AdminNotifications = lazyWithRetry(() => import('@/pages/admin/AdminNotifications'));
const AdminSettings = lazyWithRetry(() => import('@/pages/admin/AdminSettings'));
const AdminTickets = lazyWithRetry(() => import('@/pages/admin/AdminTickets'));
const AdminCheckIn = lazyWithRetry(() => import('@/pages/admin/AdminCheckIn'));
const AdminGames = lazyWithRetry(() => import('@/pages/admin/AdminGames'));

// Attendee pages
const AttendeeDashboard = lazyWithRetry(() => import('@/pages/attendee/AttendeeDashboard'));
const AttendeeProfile = lazyWithRetry(() => import('@/pages/attendee/AttendeeProfile'));
const AttendeeNetworking = lazyWithRetry(() => import('@/pages/attendee/AttendeeNetworking'));
const AttendeeAnnouncements = lazyWithRetry(() => import('@/pages/attendee/AttendeeAnnouncements'));
const AttendeeSchedule = lazyWithRetry(() => import('@/pages/attendee/AttendeeSchedule'));
const AttendeePolls = lazyWithRetry(() => import('@/pages/attendee/AttendeePolls'));
const AttendeeQuestions = lazyWithRetry(() => import('@/pages/attendee/AttendeeQuestions'));
const AttendeeSuggestions = lazyWithRetry(() => import('@/pages/attendee/AttendeeSuggestions'));
const AttendeeRules = lazyWithRetry(() => import('@/pages/attendee/AttendeeRules'));
const AttendeeNotifications = lazyWithRetry(() => import('@/pages/attendee/AttendeeNotifications'));
const AttendeeOnboarding = lazyWithRetry(() => import('@/pages/attendee/AttendeeOnboarding'));
const AttendeeMap = lazyWithRetry(() => import('@/pages/attendee/AttendeeMap'));
const AttendeeSearch = lazyWithRetry(() => import('@/pages/attendee/AttendeeSearch'));
const AttendeeGames = lazyWithRetry(() => import('@/pages/attendee/AttendeeGames'));
const AttendeeMyTickets = lazyWithRetry(() => import('@/pages/attendee/AttendeeMyTickets'));

import { AdminEventProvider } from '@/hooks/useAdminEventContext';

const queryClient = new QueryClient();

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Wrapped lazy component with error boundary
const LazyPage = ({ children }: { children: React.ReactNode }) => (
  <LazyLoadErrorBoundary>
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  </LazyLoadErrorBoundary>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes - eager loaded */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Public routes - lazy loaded */}
              <Route path="/guide" element={<LazyPage><Guide /></LazyPage>} />
              <Route path="/auth/callback" element={<LazyPage><AuthCallback /></LazyPage>} />
              <Route path="/scan" element={<LazyPage><ScanQR /></LazyPage>} />
              <Route path="/join/:eventKey" element={<LazyPage><Index /></LazyPage>} />
              <Route path="/buy-tickets/:eventKey" element={<LazyPage><BuyTickets /></LazyPage>} />
              <Route path="/buy" element={<LazyPage><BuyTickets /></LazyPage>} />
              <Route path="/privacy" element={<LazyPage><DataPrivacy /></LazyPage>} />
              <Route path="/terms" element={<LazyPage><TermsOfService /></LazyPage>} />

              {/* Admin routes - wrapped in AdminEventProvider */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="host">
                    <AdminEventProvider>
                      <LazyPage>
                        <Routes>
                          <Route path="" element={<AdminDashboard />} />
                          <Route path="events" element={<AdminEvents />} />
                          <Route path="attendees" element={<AdminAttendees />} />
                          <Route path="speakers" element={<AdminSpeakers />} />
                          <Route path="announcements" element={<AdminAnnouncements />} />
                          <Route path="schedule" element={<AdminSchedule />} />
                          <Route path="polls" element={<AdminPolls />} />
                          <Route path="facilities" element={<AdminFacilities />} />
                          <Route path="rules" element={<AdminRules />} />
                          <Route path="questions" element={<AdminQuestions />} />
                          <Route path="suggestions" element={<AdminSuggestions />} />
                          <Route path="notifications" element={<AdminNotifications />} />
                          <Route path="settings" element={<AdminSettings />} />
                          <Route path="tickets" element={<AdminTickets />} />
                          <Route path="checkin" element={<AdminCheckIn />} />
                          <Route path="games" element={<AdminGames />} />
                        </Routes>
                      </LazyPage>
                    </AdminEventProvider>
                  </ProtectedRoute>
                }
              />

              {/* Host routes */}
              <Route
                path="/host"
                element={
                  <ProtectedRoute requiredRole="host">
                    <LazyPage><HostDashboard /></LazyPage>
                  </ProtectedRoute>
                }
              />

              {/* Attendee routes - wrapped with AttendeeEventProvider */}
              <Route
                path="/attendee"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeDashboard /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/dashboard"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeDashboard /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/my-tickets"
                element={
                  <ProtectedRoute requiredRole="attendee">
                    <LazyPage><AttendeeMyTickets /></LazyPage>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendee/profile"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeProfile /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/networking"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeNetworking /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/announcements"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeAnnouncements /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/schedule"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeSchedule /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/polls"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeePolls /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/questions"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeQuestions /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/suggestions"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeSuggestions /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/rules"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeRules /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/games"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeGames /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/notifications"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeNotifications /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/onboarding"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeOnboarding /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/map"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeMap /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/search"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <LazyPage><AttendeeSearch /></LazyPage>
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
