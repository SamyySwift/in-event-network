
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Public Pages
import Index from '@/pages/Index';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import JoinEvent from '@/pages/JoinEvent';

// Attendee Pages
import AttendeeDashboard from '@/pages/attendee/AttendeeDashboard';
import AttendeeProfile from '@/pages/attendee/AttendeeProfile';
import AttendeeSchedule from '@/pages/attendee/AttendeeSchedule';
import AttendeeNetworking from '@/pages/attendee/AttendeeNetworking';
import AttendeeAnnouncements from '@/pages/attendee/AttendeeAnnouncements';
import AttendeeRules from '@/pages/attendee/AttendeeRules';
import AttendeeMap from '@/pages/attendee/AttendeeMap';
import AttendeeNotifications from '@/pages/attendee/AttendeeNotifications';
import AttendeePolls from '@/pages/attendee/AttendeePolls';
import AttendeeSuggestions from '@/pages/attendee/AttendeeSuggestions';
import AttendeeSearch from '@/pages/attendee/AttendeeSearch';
import AttendeeOnboarding from '@/pages/attendee/AttendeeOnboarding';

// Host Pages
import HostDashboard from '@/pages/host/HostDashboard';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminAttendees from '@/pages/admin/AdminAttendees';
import AdminSpeakers from '@/pages/admin/AdminSpeakers';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminRules from '@/pages/admin/AdminRules';
import AdminFacilities from '@/pages/admin/AdminFacilities';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminPolls from '@/pages/admin/AdminPolls';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminTeam from '@/pages/admin/AdminTeam';
import AdminAdvertisements from '@/pages/admin/AdminAdvertisements';

import NotFound from '@/pages/NotFound';

const AppRoutes = () => {
  const { currentUser } = useAuth();

  const getDashboardPath = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'host':
        return '/host/dashboard';
      case 'attendee':
        return '/attendee/dashboard';
      default:
        return '/admin/dashboard';
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/join-event" element={<JoinEvent />} />

        {/* Attendee Routes */}
        <Route
          path="/attendee/dashboard"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/profile"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/schedule"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/networking"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeNetworking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/announcements"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/rules"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeRules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/map"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeMap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/notifications"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/polls"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeePolls />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/suggestions"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeSuggestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/search"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendee/onboarding"
          element={
            <ProtectedRoute allowedRoles={['attendee']}>
              <AttendeeOnboarding />
            </ProtectedRoute>
          }
        />

        {/* Host Routes */}
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <HostDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendees"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminAttendees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/speakers"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminSpeakers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rules"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminRules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/facilities"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminFacilities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/polls"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminPolls />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/suggestions"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminSuggestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/team"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminTeam />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/advertisements"
          element={
            <ProtectedRoute allowedRoles={['host']}>
              <AdminAdvertisements />
            </ProtectedRoute>
          }
        />

        {/* Dashboard redirect */}
        <Route
          path="/dashboard"
          element={<Navigate to={getDashboardPath()} replace />}
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
