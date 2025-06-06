import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Landing from '@/pages/Landing';
import NotFound from '@/pages/NotFound';
import QRScanPage from '@/pages/QRScanPage';
import AttendeeDashboard from '@/pages/attendee/AttendeeDashboard';
import AttendeeProfile from '@/pages/attendee/AttendeeProfile';
import AttendeeNetworking from '@/pages/attendee/AttendeeNetworking';
import AttendeeQuestions from '@/pages/attendee/AttendeeQuestions';
import AttendeeSchedule from '@/pages/attendee/AttendeeSchedule';
import AttendeeMap from '@/pages/attendee/AttendeeMap';
import AttendeeRate from '@/pages/attendee/AttendeeRate';
import AttendeeRules from '@/pages/attendee/AttendeeRules';
import AttendeeSearch from '@/pages/attendee/AttendeeSearch';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAttendees from '@/pages/admin/AdminAttendees';
import AdminQuestions from '@/pages/admin/AdminQuestions';
import AdminEvents from '@/pages/admin/AdminEvents';
import HostDashboard from '@/pages/host/HostDashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
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
    path: '/landing',
    element: <Landing />,
  },
  {
    path: '/scan',
    element: <QRScanPage />,
  },
  {
    path: '/attendee',
    element: (
      <ProtectedRoute requiredRole="attendee">
        <AttendeeDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/profile/:id',
    element: (
      <ProtectedRoute requiredRole="attendee">
        <AttendeeProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/networking',
    element: (
      <ProtectedRoute requiredRole="attendee">
        <AttendeeNetworking />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/questions',
    element: (
      <ProtectedRoute requiredRole="attendee">
        <AttendeeQuestions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/schedule',
    element: (
      <ProtectedRoute requiredRole="attendee">
        <AttendeeSchedule />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/map',
    element: (
      <ProtectedRoute requiredRole="attendee">
        <AttendeeMap />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/rate',
    element: (
      <ProtectedRoute requiredRole="attendee">
        <AttendeeRate />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/rules',
    element: (
      <ProtectedRoute requiredRole="attendee">
        <AttendeeRules />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/search',
    element: (
      <ProtectedRoute requiredRole="attendee">
        <AttendeeSearch />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="host">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/attendees',
    element: (
      <ProtectedRoute requiredRole="host">
        <AdminAttendees />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/questions',
    element: (
      <ProtectedRoute requiredRole="host">
        <AdminQuestions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/events',
    element: (
      <ProtectedRoute requiredRole="host">
        <AdminEvents />
      </ProtectedRoute>
    ),
  },
  {
    path: '/host',
    element: (
      <ProtectedRoute requiredRole="host">
        <HostDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
