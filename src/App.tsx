import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import JoinEvent from './pages/JoinEvent';
import NotFound from './pages/NotFound';

// Attendee pages
import AttendeeDashboard from './pages/attendee/AttendeeDashboard';
import AttendeeProfile from './pages/attendee/AttendeeProfile';
import AttendeeSchedule from './pages/attendee/AttendeeSchedule';
import AttendeeNetworking from './pages/attendee/AttendeeNetworking';
import AttendeeAnnouncements from './pages/attendee/AttendeeAnnouncements';
import AttendeeRules from './pages/attendee/AttendeeRules';
import AttendeeMap from './pages/attendee/AttendeeMap';
import AttendeeNotifications from './pages/attendee/AttendeeNotifications';
import AttendeePolls from './pages/attendee/AttendeePolls';
import AttendeeSuggestions from './pages/attendee/AttendeeSuggestions';
import AttendeeSearch from './pages/attendee/AttendeeSearch';
import AttendeeOnboarding from './pages/attendee/AttendeeOnboarding';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminAttendees from './pages/admin/AdminAttendees';
import AdminSpeakers from './pages/admin/AdminSpeakers';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminRules from './pages/admin/AdminRules';
import AdminFacilities from './pages/admin/AdminFacilities';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminPolls from './pages/admin/AdminPolls';
import AdminSuggestions from './pages/admin/AdminSuggestions';
import AdminSettings from './pages/admin/AdminSettings';
import AdminTeam from './pages/admin/AdminTeam';
import AdminAdvertisements from './pages/admin/AdminAdvertisements';

// Host pages
import HostDashboard from './pages/host/HostDashboard';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/join/:accessKey" element={<JoinEvent />} />

              {/* Attendee routes */}
              <Route path="/attendee/dashboard" element={
                <ProtectedRoute>
                  <AttendeeDashboard />
                </ProtectedRoute>
              } />
              <Route path="/attendee/onboarding" element={
                <ProtectedRoute>
                  <AttendeeOnboarding />
                </ProtectedRoute>
              } />
              <Route path="/attendee/profile" element={
                <ProtectedRoute>
                  <AttendeeProfile />
                </ProtectedRoute>
              } />
              <Route path="/attendee/schedule" element={
                <ProtectedRoute>
                  <AttendeeSchedule />
                </ProtectedRoute>
              } />
              <Route path="/attendee/networking" element={
                <ProtectedRoute>
                  <AttendeeNetworking />
                </ProtectedRoute>
              } />
              <Route path="/attendee/announcements" element={
                <ProtectedRoute>
                  <AttendeeAnnouncements />
                </ProtectedRoute>
              } />
              <Route path="/attendee/rules" element={
                <ProtectedRoute>
                  <AttendeeRules />
                </ProtectedRoute>
              } />
              <Route path="/attendee/map" element={
                <ProtectedRoute>
                  <AttendeeMap />
                </ProtectedRoute>
              } />
              <Route path="/attendee/notifications" element={
                <ProtectedRoute>
                  <AttendeeNotifications />
                </ProtectedRoute>
              } />
              <Route path="/attendee/polls" element={
                <ProtectedRoute>
                  <AttendeePolls />
                </ProtectedRoute>
              } />
              <Route path="/attendee/suggestions" element={
                <ProtectedRoute>
                  <AttendeeSuggestions />
                </ProtectedRoute>
              } />
              <Route path="/attendee/search" element={
                <ProtectedRoute>
                  <AttendeeSearch />
                </ProtectedRoute>
              } />

              {/* Admin routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/events" element={
                <ProtectedRoute>
                  <AdminEvents />
                </ProtectedRoute>
              } />
              <Route path="/admin/attendees" element={
                <ProtectedRoute>
                  <AdminAttendees />
                </ProtectedRoute>
              } />
              <Route path="/admin/speakers" element={
                <ProtectedRoute>
                  <AdminSpeakers />
                </ProtectedRoute>
              } />
              <Route path="/admin/announcements" element={
                <ProtectedRoute>
                  <AdminAnnouncements />
                </ProtectedRoute>
              } />
              <Route path="/admin/rules" element={
                <ProtectedRoute>
                  <AdminRules />
                </ProtectedRoute>
              } />
              <Route path="/admin/facilities" element={
                <ProtectedRoute>
                  <AdminFacilities />
                </ProtectedRoute>
              } />
              <Route path="/admin/notifications" element={
                <ProtectedRoute>
                  <AdminNotifications />
                </ProtectedRoute>
              } />
              <Route path="/admin/polls" element={
                <ProtectedRoute>
                  <AdminPolls />
                </ProtectedRoute>
              } />
              <Route path="/admin/suggestions" element={
                <ProtectedRoute>
                  <AdminSuggestions />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              } />
              <Route path="/admin/team" element={
                <ProtectedRoute>
                  <AdminTeam />
                </ProtectedRoute>
              } />
              <Route path="/admin/advertisements" element={
                <ProtectedRoute>
                  <AdminAdvertisements />
                </ProtectedRoute>
              } />

              {/* Host routes */}
              <Route path="/host/dashboard" element={
                <ProtectedRoute>
                  <HostDashboard />
                </ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
