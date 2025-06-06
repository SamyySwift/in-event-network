
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Landing from './pages/Landing';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Attendee Pages
import AttendeeDashboard from './pages/attendee/AttendeeDashboard';
import AttendeeProfile from './pages/attendee/AttendeeProfile';
import AttendeeSchedule from './pages/attendee/AttendeeSchedule';
import AttendeeNetworking from './pages/attendee/AttendeeNetworking';
import AttendeePolls from './pages/attendee/AttendeePolls';
import AttendeeQuestions from './pages/attendee/AttendeeQuestions';
import AttendeeAnnouncements from './pages/attendee/AttendeeAnnouncements';
import AttendeeFacilities from './pages/attendee/AttendeeFacilities';
import AttendeeRules from './pages/attendee/AttendeeRules';
import AttendeeMap from './pages/attendee/AttendeeMap';
import AttendeeSuggestions from './pages/attendee/AttendeeSuggestions';
import AttendeeSearch from './pages/attendee/AttendeeSearch';
import AttendeeNotifications from './pages/attendee/AttendeeNotifications';
import AttendeeOnboarding from './pages/attendee/AttendeeOnboarding';

// Host Pages
import HostDashboard from './pages/host/HostDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminSpeakers from './pages/admin/AdminSpeakers';
import AdminAttendees from './pages/admin/AdminAttendees';
import AdminPolls from './pages/admin/AdminPolls';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminFacilities from './pages/admin/AdminFacilities';
import AdminRules from './pages/admin/AdminRules';
import AdminSuggestions from './pages/admin/AdminSuggestions';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminAdvertisements from './pages/admin/AdminAdvertisements';
import AdminSettings from './pages/admin/AdminSettings';
import AdminTeam from './pages/admin/AdminTeam';

const router = createBrowserRouter([
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
    path: '/attendee',
    element: (
      <ProtectedRoute>
        <AttendeeDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/profile',
    element: (
      <ProtectedRoute>
        <AttendeeProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/schedule',
    element: (
      <ProtectedRoute>
        <AttendeeSchedule />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/networking',
    element: (
      <ProtectedRoute>
        <AttendeeNetworking />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/polls',
    element: (
      <ProtectedRoute>
        <AttendeePolls />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/questions',
    element: (
      <ProtectedRoute>
        <AttendeeQuestions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/announcements',
    element: (
      <ProtectedRoute>
        <AttendeeAnnouncements />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/facilities',
    element: (
      <ProtectedRoute>
        <AttendeeFacilities />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/rules',
    element: (
      <ProtectedRoute>
        <AttendeeRules />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/map',
    element: (
      <ProtectedRoute>
        <AttendeeMap />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/suggestions',
    element: (
      <ProtectedRoute>
        <AttendeeSuggestions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/search',
    element: (
      <ProtectedRoute>
        <AttendeeSearch />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/notifications',
    element: (
      <ProtectedRoute>
        <AttendeeNotifications />
      </ProtectedRoute>
    ),
  },
  {
    path: '/attendee/onboarding',
    element: (
      <ProtectedRoute>
        <AttendeeOnboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: '/host',
    element: (
      <ProtectedRoute>
        <HostDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/events',
    element: (
      <ProtectedRoute>
        <AdminEvents />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/speakers',
    element: (
      <ProtectedRoute>
        <AdminSpeakers />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/attendees',
    element: (
      <ProtectedRoute>
        <AdminAttendees />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/polls',
    element: (
      <ProtectedRoute>
        <AdminPolls />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/questions',
    element: (
      <ProtectedRoute>
        <AdminQuestions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/announcements',
    element: (
      <ProtectedRoute>
        <AdminAnnouncements />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/facilities',
    element: (
      <ProtectedRoute>
        <AdminFacilities />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/rules',
    element: (
      <ProtectedRoute>
        <AdminRules />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/suggestions',
    element: (
      <ProtectedRoute>
        <AdminSuggestions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/notifications',
    element: (
      <ProtectedRoute>
        <AdminNotifications />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/advertisements',
    element: (
      <ProtectedRoute>
        <AdminAdvertisements />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/settings',
    element: (
      <ProtectedRoute>
        <AdminSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/team',
    element: (
      <ProtectedRoute>
        <AdminTeam />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

const Routes = () => {
  return <RouterProvider router={router} />;
};

export default Routes;
