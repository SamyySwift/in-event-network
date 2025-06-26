
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { AttendeeEventProvider } from '@/contexts/AttendeeEventContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Public pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Guide from '@/pages/Guide';
import NotFound from '@/pages/NotFound';
import ScanQR from '@/pages/ScanQR';
import Discovery from '@/pages/Discovery';

// Host pages
import HostDashboard from '@/pages/host/HostDashboard';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminTickets from '@/pages/admin/AdminTickets';
import AdminCheckIns from '@/pages/admin/AdminCheckIns';
import AdminAttendees from '@/pages/admin/AdminAttendees';
import AdminSpeakers from '@/pages/admin/AdminSpeakers';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminSchedule from '@/pages/admin/AdminSchedule';
import AdminPolls from '@/pages/admin/AdminPolls';
import AdminFacilities from '@/pages/admin/AdminFacilities';
import AdminRules from '@/pages/admin/AdminRules';
import AdminQuestions from '@/pages/admin/AdminQuestions';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminSettings from '@/pages/admin/AdminSettings';

// Attendee pages
import AttendeeDashboard from '@/pages/attendee/AttendeeDashboard';
import AttendeeProfile from '@/pages/attendee/AttendeeProfile';
import AttendeeNetworking from '@/pages/attendee/AttendeeNetworking';
import AttendeeAnnouncements from '@/pages/attendee/AttendeeAnnouncements';
import AttendeeSchedule from '@/pages/attendee/AttendeeSchedule';
import AttendeePolls from '@/pages/attendee/AttendeePolls';
import AttendeeQuestions from '@/pages/attendee/AttendeeQuestions';
import AttendeeSuggestions from '@/pages/attendee/AttendeeSuggestions';
import AttendeeRules from '@/pages/attendee/AttendeeRules';
import AttendeeNotifications from '@/pages/attendee/AttendeeNotifications';
import AttendeeOnboarding from '@/pages/attendee/AttendeeOnboarding';
import AttendeeMap from '@/pages/attendee/AttendeeMap';
import AttendeeSearch from '@/pages/attendee/AttendeeSearch';

import Index from '@/pages/Index';
import { AdminEventProvider } from '@/hooks/useAdminEventContext';
import DataPrivacy from '@/pages/DataPrivacy';
import TermsOfService from '@/pages/TermsOfService';

// Add this import
import TicketPurchase from '@/pages/TicketPurchase';

// Add this route in your routing configuration
<Route path="/tickets/:eventId" element={<TicketPurchase />} />

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/scan" element={<ScanQR />} />
              <Route path="/join/:eventKey" element={<Index />} />
              <Route path="/privacy" element={<DataPrivacy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Admin routes - now wrapped in AdminEventProvider */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requiredRole="host">
                    <AdminEventProvider>
                      <Routes>
                        <Route path="" element={<AdminDashboard />} />
                        <Route path="events" element={<AdminEvents />} />
                        <Route path="tickets" element={<AdminTickets />} />
                        <Route path="checkins" element={<AdminCheckIns />} />
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
                      </Routes>
                    </AdminEventProvider>
                  </ProtectedRoute>
                }
              />

              {/* Host routes */}
              <Route
                path="/host"
                element={
                  <ProtectedRoute requiredRole="host">
                    <HostDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Attendee routes - wrapped with AttendeeEventProvider */}
              <Route
                path="/attendee"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeDashboard />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/dashboard"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeDashboard />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/profile"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeProfile />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/networking"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeNetworking />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/announcements"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeAnnouncements />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/schedule"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeSchedule />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/polls"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeePolls />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/questions"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeQuestions />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/suggestions"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeSuggestions />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/rules"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeRules />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/notifications"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeNotifications />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/onboarding"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeOnboarding />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/map"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeMap />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />
              <Route
                path="/attendee/search"
                element={
                  <AttendeeEventProvider>
                    <ProtectedRoute requiredRole="attendee">
                      <AttendeeSearch />
                    </ProtectedRoute>
                  </AttendeeEventProvider>
                }
              />

              {/* Add this route in the Routes section: */}
              <Route path="/discovery" element={<Discovery />} />
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
