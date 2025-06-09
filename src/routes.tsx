
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import ScanQR from '@/pages/ScanQR';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminAttendees from '@/pages/admin/AdminAttendees';
import AdminSpeakers from '@/pages/admin/AdminSpeakers';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminSchedule from '@/pages/admin/AdminSchedule';
import AdminPolls from '@/pages/admin/AdminPolls';
import AdminFacilities from '@/pages/admin/AdminFacilities';
import AdminRules from '@/pages/admin/AdminRules';
import AdminQuestions from '@/pages/admin/AdminQuestions';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminTeam from '@/pages/admin/AdminTeam';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminSettings from '@/pages/admin/AdminSettings';

// Attendee pages
import AttendeeDashboard from '@/pages/attendee/AttendeeDashboard';
import AttendeeProfile from '@/pages/attendee/AttendeeProfile';
import AttendeeNetworking from '@/pages/attendee/AttendeeNetworking';
import AttendeeSchedule from '@/pages/attendee/AttendeeSchedule';
import AttendeeQuestions from '@/pages/attendee/AttendeeQuestions';
import AttendeeMap from '@/pages/attendee/AttendeeMap';
import AttendeePolls from '@/pages/attendee/AttendeePolls';
import AttendeeSuggestions from '@/pages/attendee/AttendeeSuggestions';
import AttendeeAnnouncements from '@/pages/attendee/AttendeeAnnouncements';
import AttendeeRules from '@/pages/attendee/AttendeeRules';
import AttendeeNotifications from '@/pages/attendee/AttendeeNotifications';
import AttendeeOnboarding from '@/pages/attendee/AttendeeOnboarding';
import AttendeeSearch from '@/pages/attendee/AttendeeSearch';

// Host pages
import HostDashboard from '@/pages/host/HostDashboard';

// Auth components
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/scan" element={<ScanQR />} />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/events" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminEvents />
        </ProtectedRoute>
      } />
      <Route path="/admin/attendees" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminAttendees />
        </ProtectedRoute>
      } />
      <Route path="/admin/speakers" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminSpeakers />
        </ProtectedRoute>
      } />
      <Route path="/admin/announcements" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminAnnouncements />
        </ProtectedRoute>
      } />
      <Route path="/admin/schedule" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminSchedule />
        </ProtectedRoute>
      } />
      <Route path="/admin/polls" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminPolls />
        </ProtectedRoute>
      } />
      <Route path="/admin/facilities" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminFacilities />
        </ProtectedRoute>
      } />
      <Route path="/admin/rules" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminRules />
        </ProtectedRoute>
      } />
      <Route path="/admin/questions" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminQuestions />
        </ProtectedRoute>
      } />
      <Route path="/admin/suggestions" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminSuggestions />
        </ProtectedRoute>
      } />
      <Route path="/admin/team" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminTeam />
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminNotifications />
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminSettings />
        </ProtectedRoute>
      } />

      {/* Attendee routes */}
      <Route path="/attendee" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeeDashboard />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />
      <Route path="/attendee/profile" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeeProfile />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />
      <Route path="/attendee/networking" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeeNetworking />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />
      <Route path="/attendee/schedule" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeeSchedule />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />
      <Route path="/attendee/questions" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeeQuestions />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />
      <Route path="/attendee/map" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeeMap />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />
      <Route path="/attendee/polls" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeePolls />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />
      <Route path="/attendee/suggestions" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeeSuggestions />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />
      <Route path="/attendee/announcements" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeeAnnouncements />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />
      <Route path="/attendee/rules" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeeRules />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />
      <Route path="/attendee/notifications" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeeNotifications />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />
      <Route path="/attendee/onboarding" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeOnboarding />
        </ProtectedRoute>
      } />
      <Route path="/attendee/search" element={
        <ProtectedRoute allowedRoles={['attendee']}>
          <AttendeeRouteGuard>
            <AttendeeSearch />
          </AttendeeRouteGuard>
        </ProtectedRoute>
      } />

      {/* Host routes */}
      <Route path="/host" element={
        <ProtectedRoute allowedRoles={['host']}>
          <HostDashboard />
        </ProtectedRoute>
      } />

      {/* Fallback routes */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
