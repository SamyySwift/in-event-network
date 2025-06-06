
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAttendees from '@/pages/admin/AdminAttendees';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminSpeakers from '@/pages/admin/AdminSpeakers';
import AdminPolls from '@/pages/admin/AdminPolls';
import AdminQuestions from '@/pages/admin/AdminQuestions';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminAdvertisements from '@/pages/admin/AdminAdvertisements';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminTeam from '@/pages/admin/AdminTeam';
import AdminRules from '@/pages/admin/AdminRules';
import AdminFacilities from '@/pages/admin/AdminFacilities';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';

// Attendee Pages
import AttendeeDashboard from '@/pages/attendee/AttendeeDashboard';
import AttendeeProfile from '@/pages/attendee/AttendeeProfile';
import AttendeeSchedule from '@/pages/attendee/AttendeeSchedule';
import AttendeeNetworking from '@/pages/attendee/AttendeeNetworking';
import AttendeePolls from '@/pages/attendee/AttendeePolls';
import AttendeeQuestions from '@/pages/attendee/AttendeeQuestions';
import AttendeeAnnouncements from '@/pages/attendee/AttendeeAnnouncements';
import AttendeeNotifications from '@/pages/attendee/AttendeeNotifications';
import AttendeeSearch from '@/pages/attendee/AttendeeSearch';
import AttendeeRules from '@/pages/attendee/AttendeeRules';
import AttendeeMap from '@/pages/attendee/AttendeeMap';
import AttendeeOnboarding from '@/pages/attendee/AttendeeOnboarding';
import AttendeeSuggestions from '@/pages/attendee/AttendeeSuggestions';
import AttendeeFacilities from '@/pages/attendee/AttendeeFacilities';

// Host Pages
import HostDashboard from '@/pages/host/HostDashboard';

// Protected Route Component
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/app',
    element: <ProtectedRoute><Index /></ProtectedRoute>,
  },
  
  // Admin Routes
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminDashboard /></ProtectedRoute>,
  },
  {
    path: '/admin/attendees',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminAttendees /></ProtectedRoute>,
  },
  {
    path: '/admin/events',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminEvents /></ProtectedRoute>,
  },
  {
    path: '/admin/speakers',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminSpeakers /></ProtectedRoute>,
  },
  {
    path: '/admin/polls',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminPolls /></ProtectedRoute>,
  },
  {
    path: '/admin/questions',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminQuestions /></ProtectedRoute>,
  },
  {
    path: '/admin/announcements',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminAnnouncements /></ProtectedRoute>,
  },
  {
    path: '/admin/advertisements',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminAdvertisements /></ProtectedRoute>,
  },
  {
    path: '/admin/notifications',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminNotifications /></ProtectedRoute>,
  },
  {
    path: '/admin/settings',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminSettings /></ProtectedRoute>,
  },
  {
    path: '/admin/team',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminTeam /></ProtectedRoute>,
  },
  {
    path: '/admin/rules',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminRules /></ProtectedRoute>,
  },
  {
    path: '/admin/facilities',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminFacilities /></ProtectedRoute>,
  },
  {
    path: '/admin/suggestions',
    element: <ProtectedRoute allowedRoles={['admin', 'host']}><AdminSuggestions /></ProtectedRoute>,
  },

  // Attendee Routes
  {
    path: '/attendee',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeDashboard /></ProtectedRoute>,
  },
  {
    path: '/attendee/profile',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeProfile /></ProtectedRoute>,
  },
  {
    path: '/attendee/schedule',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeSchedule /></ProtectedRoute>,
  },
  {
    path: '/attendee/networking',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeNetworking /></ProtectedRoute>,
  },
  {
    path: '/attendee/polls',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeePolls /></ProtectedRoute>,
  },
  {
    path: '/attendee/questions',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeQuestions /></ProtectedRoute>,
  },
  {
    path: '/attendee/announcements',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeAnnouncements /></ProtectedRoute>,
  },
  {
    path: '/attendee/notifications',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeNotifications /></ProtectedRoute>,
  },
  {
    path: '/attendee/search',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeSearch /></ProtectedRoute>,
  },
  {
    path: '/attendee/rules',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeRules /></ProtectedRoute>,
  },
  {
    path: '/attendee/map',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeMap /></ProtectedRoute>,
  },
  {
    path: '/attendee/onboarding',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeOnboarding /></ProtectedRoute>,
  },
  {
    path: '/attendee/suggestions',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeSuggestions /></ProtectedRoute>,
  },
  {
    path: '/attendee/facilities',
    element: <ProtectedRoute allowedRoles={['attendee']}><AttendeeFacilities /></ProtectedRoute>,
  },

  // Host Routes
  {
    path: '/host',
    element: <ProtectedRoute allowedRoles={['host']}><HostDashboard /></ProtectedRoute>,
  },

  // Catch all route
  {
    path: '*',
    element: <NotFound />,
  },
]);
