
import { createBrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import AttendeeDashboard from '@/pages/attendee/AttendeeDashboard';
import AttendeeProfile from '@/pages/attendee/AttendeeProfile';
import AttendeeOnboarding from '@/pages/attendee/AttendeeOnboarding';
import AttendeeAnnouncements from '@/pages/attendee/AttendeeAnnouncements';
import AttendeeMap from '@/pages/attendee/AttendeeMap';
import AttendeePolls from '@/pages/attendee/AttendeePolls';
import AttendeeQuestions from '@/pages/attendee/AttendeeQuestions';
import AttendeeNetworking from '@/pages/attendee/AttendeeNetworking';
import AttendeeSchedule from '@/pages/attendee/AttendeeSchedule';
import AttendeeRules from '@/pages/attendee/AttendeeRules';
import AttendeeSuggestions from '@/pages/attendee/AttendeeSuggestions';
import AttendeeNotifications from '@/pages/attendee/AttendeeNotifications';
import AttendeeSearch from '@/pages/attendee/AttendeeSearch';
import QRScanPage from '@/pages/QRScanPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminAttendees from '@/pages/admin/AdminAttendees';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminFacilities from '@/pages/admin/AdminFacilities';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminPolls from '@/pages/admin/AdminPolls';
import AdminQuestions from '@/pages/admin/AdminQuestions';
import AdminRules from '@/pages/admin/AdminRules';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminSpeakers from '@/pages/admin/AdminSpeakers';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminTeam from '@/pages/admin/AdminTeam';
import AdminAdvertisements from '@/pages/admin/AdminAdvertisements';
import HostDashboard from '@/pages/host/HostDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/landing',
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
    path: '/scan',
    element: <ProtectedRoute><QRScanPage /></ProtectedRoute>,
  },
  {
    path: '/attendee',
    element: <ProtectedRoute><AttendeeDashboard /></ProtectedRoute>,
  },
  {
    path: '/attendee/profile',
    element: <ProtectedRoute><AttendeeProfile /></ProtectedRoute>,
  },
  {
    path: '/attendee/onboarding',
    element: <ProtectedRoute><AttendeeOnboarding /></ProtectedRoute>,
  },
  {
    path: '/attendee/announcements',
    element: <ProtectedRoute><AttendeeAnnouncements /></ProtectedRoute>,
  },
  {
    path: '/attendee/map',
    element: <ProtectedRoute><AttendeeMap /></ProtectedRoute>,
  },
  {
    path: '/attendee/polls',
    element: <ProtectedRoute><AttendeePolls /></ProtectedRoute>,
  },
  {
    path: '/attendee/questions',
    element: <ProtectedRoute><AttendeeQuestions /></ProtectedRoute>,
  },
  {
    path: '/attendee/networking',
    element: <ProtectedRoute><AttendeeNetworking /></ProtectedRoute>,
  },
  {
    path: '/attendee/schedule',
    element: <ProtectedRoute><AttendeeSchedule /></ProtectedRoute>,
  },
  {
    path: '/attendee/rules',
    element: <ProtectedRoute><AttendeeRules /></ProtectedRoute>,
  },
  {
    path: '/attendee/suggestions',
    element: <ProtectedRoute><AttendeeSuggestions /></ProtectedRoute>,
  },
  {
    path: '/attendee/notifications',
    element: <ProtectedRoute><AttendeeNotifications /></ProtectedRoute>,
  },
  {
    path: '/attendee/search',
    element: <ProtectedRoute><AttendeeSearch /></ProtectedRoute>,
  },
  {
    path: '/admin',
    element: <ProtectedRoute><AdminDashboard /></ProtectedRoute>,
  },
  {
    path: '/admin/announcements',
    element: <ProtectedRoute><AdminAnnouncements /></ProtectedRoute>,
  },
  {
    path: '/admin/attendees',
    element: <ProtectedRoute><AdminAttendees /></ProtectedRoute>,
  },
  {
    path: '/admin/events',
    element: <ProtectedRoute><AdminEvents /></ProtectedRoute>,
  },
  {
    path: '/admin/facilities',
    element: <ProtectedRoute><AdminFacilities /></ProtectedRoute>,
  },
  {
    path: '/admin/notifications',
    element: <ProtectedRoute><AdminNotifications /></ProtectedRoute>,
  },
  {
    path: '/admin/polls',
    element: <ProtectedRoute><AdminPolls /></ProtectedRoute>,
  },
  {
    path: '/admin/questions',
    element: <ProtectedRoute><AdminQuestions /></ProtectedRoute>,
  },
  {
    path: '/admin/rules',
    element: <ProtectedRoute><AdminRules /></ProtectedRoute>,
  },
  {
    path: '/admin/settings',
    element: <ProtectedRoute><AdminSettings /></ProtectedRoute>,
  },
  {
    path: '/admin/speakers',
    element: <ProtectedRoute><AdminSpeakers /></ProtectedRoute>,
  },
  {
    path: '/admin/suggestions',
    element: <ProtectedRoute><AdminSuggestions /></ProtectedRoute>,
  },
  {
    path: '/admin/team',
    element: <ProtectedRoute><AdminTeam /></ProtectedRoute>,
  },
  {
    path: '/admin/advertisements',
    element: <ProtectedRoute><AdminAdvertisements /></ProtectedRoute>,
  },
  {
    path: '/host',
    element: <ProtectedRoute><HostDashboard /></ProtectedRoute>,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
