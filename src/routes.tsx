
import { createBrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Landing from '@/pages/Landing';
import NotFound from '@/pages/NotFound';

// Attendee pages
import AttendeeDashboard from '@/pages/attendee/AttendeeDashboard';
import AttendeeProfile from '@/pages/attendee/AttendeeProfile';
import AttendeeNetworking from '@/pages/attendee/AttendeeNetworking';
import AttendeeSchedule from '@/pages/attendee/AttendeeSchedule';
import AttendeeQuestions from '@/pages/attendee/AttendeeQuestions';
import AttendeeMap from '@/pages/attendee/AttendeeMap';
import AttendeePolls from '@/pages/attendee/AttendeePolls';
import AttendeeNotifications from '@/pages/attendee/AttendeeNotifications';
import AttendeeAnnouncements from '@/pages/attendee/AttendeeAnnouncements';
import AttendeeRules from '@/pages/attendee/AttendeeRules';
import AttendeeSearch from '@/pages/attendee/AttendeeSearch';
import AttendeeOnboarding from '@/pages/attendee/AttendeeOnboarding';
import AttendeeRating from '@/pages/attendee/AttendeeRating';
import AttendeeSuggestions from '@/pages/attendee/AttendeeSuggestions';

// Host pages
import HostDashboard from '@/pages/host/HostDashboard';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminAttendees from '@/pages/admin/AdminAttendees';
import AdminSpeakers from '@/pages/admin/AdminSpeakers';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminFacilities from '@/pages/admin/AdminFacilities';
import AdminQuestions from '@/pages/admin/AdminQuestions';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminRules from '@/pages/admin/AdminRules';
import AdminPolls from '@/pages/admin/AdminPolls';
import AdminAdvertisements from '@/pages/admin/AdminAdvertisements';
import AdminTeam from '@/pages/admin/AdminTeam';
import AdminMedia from '@/pages/admin/AdminMedia';

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
  
  // Attendee routes
  {
    path: '/attendee',
    element: <AttendeeDashboard />,
  },
  {
    path: '/attendee/profile',
    element: <AttendeeProfile />,
  },
  {
    path: '/attendee/networking',
    element: <AttendeeNetworking />,
  },
  {
    path: '/attendee/schedule',
    element: <AttendeeSchedule />,
  },
  {
    path: '/attendee/questions',
    element: <AttendeeQuestions />,
  },
  {
    path: '/attendee/map',
    element: <AttendeeMap />,
  },
  {
    path: '/attendee/polls',
    element: <AttendeePolls />,
  },
  {
    path: '/attendee/notifications',
    element: <AttendeeNotifications />,
  },
  {
    path: '/attendee/announcements',
    element: <AttendeeAnnouncements />,
  },
  {
    path: '/attendee/rules',
    element: <AttendeeRules />,
  },
  {
    path: '/attendee/search',
    element: <AttendeeSearch />,
  },
  {
    path: '/attendee/onboarding',
    element: <AttendeeOnboarding />,
  },
  {
    path: '/attendee/rate',
    element: <AttendeeRating />,
  },
  {
    path: '/attendee/suggestions',
    element: <AttendeeSuggestions />,
  },
  
  // Host routes
  {
    path: '/host',
    element: <HostDashboard />,
  },
  
  // Admin routes
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/events',
    element: <AdminEvents />,
  },
  {
    path: '/admin/attendees',
    element: <AdminAttendees />,
  },
  {
    path: '/admin/speakers',
    element: <AdminSpeakers />,
  },
  {
    path: '/admin/announcements',
    element: <AdminAnnouncements />,
  },
  {
    path: '/admin/facilities',
    element: <AdminFacilities />,
  },
  {
    path: '/admin/questions',
    element: <AdminQuestions />,
  },
  {
    path: '/admin/settings',
    element: <AdminSettings />,
  },
  {
    path: '/admin/notifications',
    element: <AdminNotifications />,
  },
  {
    path: '/admin/suggestions',
    element: <AdminSuggestions />,
  },
  {
    path: '/admin/rules',
    element: <AdminRules />,
  },
  {
    path: '/admin/polls',
    element: <AdminPolls />,
  },
  {
    path: '/admin/advertisements',
    element: <AdminAdvertisements />,
  },
  {
    path: '/admin/team',
    element: <AdminTeam />,
  },
  {
    path: '/admin/media',
    element: <AdminMedia />,
  },
  
  // Catch all route for 404
  {
    path: '*',
    element: <NotFound />,
  },
]);
