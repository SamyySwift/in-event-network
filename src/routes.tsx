import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AuthCallback from "@/pages/AuthCallback";
import Guide from "@/pages/Guide";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import ScanQR from "@/pages/ScanQR";
import VendorForm from "./pages/VendorForm";
import BuyTickets from "@/pages/BuyTickets";
import JoinEvent from "@/pages/JoinEvent";
import Discovery from "@/pages/Discovery";

// Admin Pages
import AdminLayout from "@/components/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEvents from "@/pages/admin/AdminEvents";
import AdminAttendees from "@/pages/admin/AdminAttendees";
import AdminSpeakers from "@/pages/admin/AdminSpeakers";
import AdminAnnouncements from "@/pages/admin/AdminAnnouncements";
import AdminSchedule from "@/pages/admin/AdminSchedule";
import AdminPolls from "@/pages/admin/AdminPolls";
import AdminFacilities from "@/pages/admin/AdminFacilities";
import AdminRules from "@/pages/admin/AdminRules";
import AdminQuestions from "@/pages/admin/AdminQuestions";
import AdminSuggestions from "@/pages/admin/AdminSuggestions";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import AdminProfile from "@/pages/admin/AdminProfile";
import AdminSponsors from "@/pages/admin/AdminSponsors";
import AdminVendorHub from "@/pages/admin/AdminVendorHub";
import AdminHighlights from "@/pages/admin/AdminHighlights";
import AdminEventPreview from "@/pages/admin/AdminEventPreview";

import SponsorForm from "@/pages/SponsorForm";
import LiveQuestions from "@/pages/LiveQuestions";


// Attendee Pages
import AppLayout from "@/components/layouts/AppLayout";
import AttendeeDashboard from "@/pages/attendee/AttendeeDashboard";
import AttendeeProfile from "@/pages/attendee/AttendeeProfile";
import AttendeeNetworking from "@/pages/attendee/AttendeeNetworking";
import AttendeeSchedule from "@/pages/attendee/AttendeeSchedule";
import AttendeeQuestions from "@/pages/attendee/AttendeeQuestions";
import AttendeeMap from "@/pages/attendee/AttendeeMap";
import AttendeePolls from "@/pages/attendee/AttendeePolls";
import AttendeeSuggestions from "@/pages/attendee/AttendeeSuggestions";
import AttendeeAnnouncements from "@/pages/attendee/AttendeeAnnouncements";
import AttendeeRules from "@/pages/attendee/AttendeeRules";
import AttendeeNotifications from "@/pages/attendee/AttendeeNotifications";
import AttendeeSearch from "@/pages/attendee/AttendeeSearch";
import AttendeeOnboarding from "@/pages/attendee/AttendeeOnboarding";

import AttendeeMyTickets from "@/pages/attendee/AttendeeMyTickets";

// Host Pages
import HostDashboard from "@/pages/host/HostDashboard";

// Auth Guard Component
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect based on user role
    if (currentUser.role === "host") {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.role === "attendee") {
      return <Navigate to="/attendee" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Admin Guard Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["host"]}>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
};

// Attendee Guard Component
const AttendeeRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["attendee"]}>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
};

// Import the missing components at the top of the file
import AdminTickets from "@/pages/admin/AdminTickets";
import AdminCheckIn from "@/pages/admin/AdminCheckIn";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminWallet from "@/pages/admin/AdminWallet";

// Remove the markdown comments and add the missing route:
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/guide",
    element: <Guide />,
  },
  {
    path: "/discovery",
    element: <Discovery />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/scan",
    element: <ScanQR />,
  },
  {
    path: "/index",
    element: <Index />,
  },
  {
    path: "/buy-tickets/:eventKey",
    element: <BuyTickets />,
  },
  {
    path: "/buy",
    element: <BuyTickets />,
  },
  {
    path: "/join/:code",
    element: <JoinEvent />,
  },
  {
    path: "/join",
    element: <JoinEvent />,
  },

  // Admin Routes
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/profile",
    element: (
      <AdminRoute>
        <AdminProfile />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/events",
    element: (
      <AdminRoute>
        <AdminEvents />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/attendees",
    element: (
      <AdminRoute>
        <AdminAttendees />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/speakers",
    element: (
      <AdminRoute>
        <AdminSpeakers />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/announcements",
    element: (
      <AdminRoute>
        <AdminAnnouncements />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/schedule",
    element: (
      <AdminRoute>
        <AdminSchedule />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/polls",
    element: (
      <AdminRoute>
        <AdminPolls />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/facilities",
    element: (
      <AdminRoute>
        <AdminFacilities />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/highlights",
    element: (
      <AdminRoute>
        <AdminHighlights />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/event-preview",
    element: (
      <AdminRoute>
        <AdminEventPreview />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/rules",
    element: (
      <AdminRoute>
        <AdminRules />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/questions",
    element: (
      <AdminRoute>
        <AdminQuestions />
      </AdminRoute>
    ),
  },

  {
    path: "/admin/suggestions",
    element: (
      <AdminRoute>
        <AdminSuggestions />
      </AdminRoute>
    ),
  },

  {
    path: "/admin/notifications",
    element: (
      <AdminRoute>
        <AdminNotifications />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/sponsors",
    element: (
      <AdminRoute>
        <AdminSponsors />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/vendor-hub",
    element: (
      <AdminRoute>
        <AdminVendorHub />
      </AdminRoute>
    ),
  },

  // Public sponsor form route
  {
    path: "/sponsor-form/:formId",
    element: <SponsorForm />,
  },

  // Public live questions route
  {
    path: "/live-questions/:eventId",
    element: <LiveQuestions />,
  },

  // Host Routes (redirect to admin)
  {
    path: "/host",
    element: <Navigate to="/admin" replace />,
  },

  // Attendee Routes
  {
    path: "/attendee",
    element: (
      <AttendeeRoute>
        <AttendeeDashboard />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/profile",
    element: (
      <AttendeeRoute>
        <AttendeeProfile />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/networking",
    element: (
      <AttendeeRoute>
        <AttendeeNetworking />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/schedule",
    element: (
      <AttendeeRoute>
        <AttendeeSchedule />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/questions",
    element: (
      <AttendeeRoute>
        <AttendeeQuestions />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/map",
    element: (
      <AttendeeRoute>
        <AttendeeMap />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/polls",
    element: (
      <AttendeeRoute>
        <AttendeePolls />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/suggestions",
    element: (
      <AttendeeRoute>
        <AttendeeSuggestions />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/announcements",
    element: (
      <AttendeeRoute>
        <AttendeeAnnouncements />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/rules",
    element: (
      <AttendeeRoute>
        <AttendeeRules />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/notifications",
    element: (
      <AttendeeRoute>
        <AttendeeNotifications />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/search",
    element: (
      <AttendeeRoute>
        <AttendeeSearch />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/onboarding",
    element: (
      <AttendeeRoute>
        <AttendeeOnboarding />
      </AttendeeRoute>
    ),
  },
  {
    path: "/attendee/my-tickets",
    element: (
      <AttendeeRoute>
        <AttendeeMyTickets />
      </AttendeeRoute>
    ),
  },

  // Catch all route - redirect to landing instead of 404
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
  // Add these routes in the admin routes section
  {
    path: "/admin/tickets",
    element: (
      <AdminRoute>
        <AdminTickets />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/checkin",
    element: (
      <AdminRoute>
        <AdminCheckIn />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <AdminRoute>
        <AdminSettings />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/wallet",
    element: (
      <AdminRoute>
        <AdminWallet />
      </AdminRoute>
    ),
  },
  {
    path: "/vendor-form/:formId",
    element: <VendorForm />,
  },
]);
