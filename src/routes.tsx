
import { RouteObject } from 'react-router-dom';

// Layouts
import AppLayout from './components/layouts/AppLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Attendee Pages
import AttendeeDashboard from './pages/attendee/AttendeeDashboard';
import AttendeeProfile from './pages/attendee/AttendeeProfile';
import AttendeeSearch from './pages/attendee/AttendeeSearch';
import AttendeeSchedule from './pages/attendee/AttendeeSchedule';

// Host Pages
import HostDashboard from './pages/host/HostDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
];

export const attendeeRoutes: RouteObject[] = [
  {
    path: "/attendee",
    element: <AttendeeDashboard />,
  },
  {
    path: "/attendee/profile",
    element: <AttendeeProfile />,
  },
  {
    path: "/attendee/search",
    element: <AttendeeSearch />,
  },
  {
    path: "/attendee/schedule",
    element: <AttendeeSchedule />,
  },
];

export const hostRoutes: RouteObject[] = [
  {
    path: "/host",
    element: <HostDashboard />,
  },
];

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
];

export const catchAllRoutes: RouteObject[] = [
  {
    path: "*",
    element: <NotFound />,
  },
];

export const allRoutes: RouteObject[] = [
  ...publicRoutes,
  ...attendeeRoutes,
  ...hostRoutes,
  ...adminRoutes,
  ...catchAllRoutes,
];
