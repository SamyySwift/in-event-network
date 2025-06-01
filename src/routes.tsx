
import { createBrowserRouter } from 'react-router-dom';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
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
import AttendeeSearch from '@/pages/attendee/AttendeeSearch';
import AttendeeNotifications from '@/pages/attendee/AttendeeNotifications';
import AttendeeOnboarding from '@/pages/attendee/AttendeeOnboarding';
import HostDashboard from '@/pages/host/HostDashboard';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminEvents from '@/pages/admin/AdminEvents';
import AdminAttendees from '@/pages/admin/AdminAttendees';
import AdminSpeakers from '@/pages/admin/AdminSpeakers';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminFacilities from '@/pages/admin/AdminFacilities';
import AdminQuestions from '@/pages/admin/AdminQuestions';
import AdminSuggestions from '@/pages/admin/AdminSuggestions';
import AdminPolls from '@/pages/admin/AdminPolls';
import AdminAdvertisements from '@/pages/admin/AdminAdvertisements';
import AdminRules from '@/pages/admin/AdminRules';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminTeam from '@/pages/admin/AdminTeam';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import NotFound from '@/pages/NotFound';

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
    path: '/attendee/suggestions',
    element: <AttendeeSuggestions />,
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
    path: '/attendee/notifications',
    element: <AttendeeNotifications />,
  },
  {
    path: '/attendee/onboarding',
    element: <AttendeeOnboarding />,
  },
  {
    path: '/host',
    element: <HostDashboard />,
  },
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
    path: '/admin/suggestions',
    element: <AdminSuggestions />,
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
    path: '/admin/rules',
    element: <AdminRules />,
  },
  {
    path: '/admin/settings',
    element: <AdminSettings />,
  },
  {
    path: '/admin/team',
    element: <AdminTeam />,
  },
  {
    path: '/admin/notifications',
    element: <AdminNotifications />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
