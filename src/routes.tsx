
import { createBrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminSpeakers from "@/pages/admin/AdminSpeakers";
import AdminAttendees from "@/pages/admin/AdminAttendees";
import AdminTeam from "@/pages/admin/AdminTeam";
import AdminRules from "@/pages/admin/AdminRules";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";
import AdminAdvertisements from "@/pages/admin/AdminAdvertisements";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminFacilities from "@/pages/admin/AdminFacilities";
import AdminQuestions from "@/pages/admin/AdminQuestions";
import AdminPolls from "@/pages/admin/AdminPolls";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import AdminSuggestions from "@/pages/admin/AdminSuggestions";
import AdminMedia from "@/pages/admin/AdminMedia";

// Attendee pages
import AttendeeDashboard from "@/pages/attendee/AttendeeDashboard";
import AttendeeProfile from "@/pages/attendee/AttendeeProfile";
import AttendeeNetworking from "@/pages/attendee/AttendeeNetworking";
import AttendeeSchedule from "@/pages/attendee/AttendeeSchedule";
import AttendeeMap from "@/pages/attendee/AttendeeMap";
import AttendeeRules from "@/pages/attendee/AttendeeRules";
import AttendeeSearch from "@/pages/attendee/AttendeeSearch";
import AttendeeAnnouncements from "@/pages/attendee/AttendeeAnnouncements";
import AttendeePolls from "@/pages/attendee/AttendeePolls";
import AttendeeNotifications from "@/pages/attendee/AttendeeNotifications";
import AttendeeOnboarding from "@/pages/attendee/AttendeeOnboarding";
import AttendeeQuestions from "@/pages/attendee/AttendeeQuestions";
import AttendeeRating from "@/pages/attendee/AttendeeRating";

// Host pages
import HostDashboard from "@/pages/host/HostDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/landing",
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
  
  // Admin routes
  {
    path: "/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/admin/events",
    element: <AdminEvents />,
  },
  {
    path: "/admin/speakers",
    element: <AdminSpeakers />,
  },
  {
    path: "/admin/attendees",
    element: <AdminAttendees />,
  },
  {
    path: "/admin/team",
    element: <AdminTeam />,
  },
  {
    path: "/admin/rules",
    element: <AdminRules />,
  },
  {
    path: "/admin/announcements",
    element: <AdminAnnouncements />,
  },
  {
    path: "/admin/advertisements",
    element: <AdminAdvertisements />,
  },
  {
    path: "/admin/settings",
    element: <AdminSettings />,
  },
  {
    path: "/admin/facilities",
    element: <AdminFacilities />,
  },
  {
    path: "/admin/questions",
    element: <AdminQuestions />,
  },
  {
    path: "/admin/polls",
    element: <AdminPolls />,
  },
  {
    path: "/admin/notifications",
    element: <AdminNotifications />,
  },
  {
    path: "/admin/suggestions",
    element: <AdminSuggestions />,
  },
  {
    path: "/admin/media",
    element: <AdminMedia />,
  },
  
  // Attendee routes
  {
    path: "/attendee",
    element: <AttendeeDashboard />,
  },
  {
    path: "/attendee/profile",
    element: <AttendeeProfile />,
  },
  {
    path: "/attendee/networking",
    element: <AttendeeNetworking />,
  },
  {
    path: "/attendee/schedule",
    element: <AttendeeSchedule />,
  },
  {
    path: "/attendee/map",
    element: <AttendeeMap />,
  },
  {
    path: "/attendee/rules",
    element: <AttendeeRules />,
  },
  {
    path: "/attendee/search",
    element: <AttendeeSearch />,
  },
  {
    path: "/attendee/announcements",
    element: <AttendeeAnnouncements />,
  },
  {
    path: "/attendee/polls",
    element: <AttendeePolls />,
  },
  {
    path: "/attendee/notifications",
    element: <AttendeeNotifications />,
  },
  {
    path: "/attendee/onboarding",
    element: <AttendeeOnboarding />,
  },
  {
    path: "/attendee/questions",
    element: <AttendeeQuestions />,
  },
  {
    path: "/attendee/rating",
    element: <AttendeeRating />,
  },
  
  // Host routes
  {
    path: "/host",
    element: <HostDashboard />,
  },
  
  // Catch all route
  {
    path: "*",
    element: <NotFound />,
  },
]);
