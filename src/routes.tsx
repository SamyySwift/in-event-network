import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Eager load critical path components
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Lazy load all other pages for code splitting
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const Guide = lazy(() => import("@/pages/Guide"));
const Index = lazy(() => import("@/pages/Index"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ScanQR = lazy(() => import("@/pages/ScanQR"));
const VendorForm = lazy(() => import("@/pages/VendorForm"));
const BuyTickets = lazy(() => import("@/pages/BuyTickets"));
const JoinEvent = lazy(() => import("@/pages/JoinEvent"));
const Discovery = lazy(() => import("@/pages/Discovery"));
const DataPrivacy = lazy(() => import("@/pages/DataPrivacy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const SponsorForm = lazy(() => import("@/pages/SponsorForm"));
const LiveQuestions = lazy(() => import("@/pages/LiveQuestions"));
const LivePolls = lazy(() => import("@/pages/LivePolls"));
const LiveChat = lazy(() => import("@/pages/LiveChat"));
const LiveGames = lazy(() => import("@/pages/LiveGames"));
const CheckIn = lazy(() => import("@/pages/CheckIn"));

// Admin Pages - Lazy loaded
const AdminLayout = lazy(() => import("@/components/layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminAttendees = lazy(() => import("@/pages/admin/AdminAttendees"));
const AdminNetworking = lazy(() => import("@/pages/admin/AdminNetworking"));
const AdminSpeakers = lazy(() => import("@/pages/admin/AdminSpeakers"));
const AdminAnnouncements = lazy(() => import("@/pages/admin/AdminAnnouncements"));
const AdminSchedule = lazy(() => import("@/pages/admin/AdminSchedule"));
const AdminPolls = lazy(() => import("@/pages/admin/AdminPolls"));
const AdminFacilities = lazy(() => import("@/pages/admin/AdminFacilities"));
const AdminRules = lazy(() => import("@/pages/admin/AdminRules"));
const AdminQuestions = lazy(() => import("@/pages/admin/AdminQuestions"));
const AdminSuggestions = lazy(() => import("@/pages/admin/AdminSuggestions"));
const AdminNotifications = lazy(() => import("@/pages/admin/AdminNotifications"));
const AdminProfile = lazy(() => import("@/pages/admin/AdminProfile"));
const AdminSponsors = lazy(() => import("@/pages/admin/AdminSponsors"));
const AdminVendorHub = lazy(() => import("@/pages/admin/AdminVendorHub"));
const AdminHighlights = lazy(() => import("@/pages/admin/AdminHighlights"));
const AdminEventPreview = lazy(() => import("@/pages/admin/AdminEventPreview"));
const AdminGames = lazy(() => import("@/pages/admin/AdminGames"));
const AdminTickets = lazy(() => import("@/pages/admin/AdminTickets"));
const AdminCheckIn = lazy(() => import("@/pages/admin/AdminCheckIn"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));
const AdminWallet = lazy(() => import("@/pages/admin/AdminWallet"));
const AdminAdvertisements = lazy(() => import("@/pages/admin/AdminAdvertisements"));

// Attendee Pages - Lazy loaded
const AppLayout = lazy(() => import("@/components/layouts/AppLayout"));
const AttendeeDashboard = lazy(() => import("@/pages/attendee/AttendeeDashboard"));
const AttendeeProfile = lazy(() => import("@/pages/attendee/AttendeeProfile"));
const AttendeeNetworking = lazy(() => import("@/pages/attendee/AttendeeNetworking"));
const AttendeeSchedule = lazy(() => import("@/pages/attendee/AttendeeSchedule"));
const AttendeeQuestions = lazy(() => import("@/pages/attendee/AttendeeQuestions"));
const AttendeeMap = lazy(() => import("@/pages/attendee/AttendeeMap"));
const AttendeePolls = lazy(() => import("@/pages/attendee/AttendeePolls"));
const AttendeeSuggestions = lazy(() => import("@/pages/attendee/AttendeeSuggestions"));
const AttendeeAnnouncements = lazy(() => import("@/pages/attendee/AttendeeAnnouncements"));
const AttendeeRules = lazy(() => import("@/pages/attendee/AttendeeRules"));
const AttendeeNotifications = lazy(() => import("@/pages/attendee/AttendeeNotifications"));
const AttendeeSearch = lazy(() => import("@/pages/attendee/AttendeeSearch"));
const AttendeeOnboarding = lazy(() => import("@/pages/attendee/AttendeeOnboarding"));
const AttendeeGames = lazy(() => import("@/pages/attendee/AttendeeGames"));
const AttendeeMyTickets = lazy(() => import("@/pages/attendee/AttendeeMyTickets"));

// Host Pages
const HostDashboard = lazy(() => import("@/pages/host/HostDashboard"));

// Simple loading spinner for lazy components
const LazyLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

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
    return <LazyLoader />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === "host") {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.role === "attendee") {
      return <Navigate to="/attendee" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Admin Guard Component with lazy-loaded layout
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["host"]}>
      <Suspense fallback={<LazyLoader />}>
        <AdminLayout>{children}</AdminLayout>
      </Suspense>
    </ProtectedRoute>
  );
};

// Attendee Guard Component with lazy-loaded layout
const AttendeeRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["attendee"]}>
      <Suspense fallback={<LazyLoader />}>
        <AppLayout>{children}</AppLayout>
      </Suspense>
    </ProtectedRoute>
  );
};

// Wrapper for lazy components
const LazyComponent = ({ Component }: { Component: React.LazyExoticComponent<any> }) => (
  <Suspense fallback={<LazyLoader />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  // Public routes - Landing, Login, Register are eager loaded
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  
  // Public routes - lazy loaded
  { path: "/guide", element: <LazyComponent Component={Guide} /> },
  { path: "/discovery", element: <LazyComponent Component={Discovery} /> },
  { path: "/privacy", element: <LazyComponent Component={DataPrivacy} /> },
  { path: "/terms", element: <LazyComponent Component={TermsOfService} /> },
  { path: "/auth/callback", element: <LazyComponent Component={AuthCallback} /> },
  { path: "/scan", element: <LazyComponent Component={ScanQR} /> },
  { path: "/index", element: <LazyComponent Component={Index} /> },
  { path: "/buy-tickets/:eventKey", element: <LazyComponent Component={BuyTickets} /> },
  { path: "/buy", element: <LazyComponent Component={BuyTickets} /> },
  { path: "/join/:code", element: <LazyComponent Component={JoinEvent} /> },
  { path: "/join", element: <LazyComponent Component={JoinEvent} /> },
  { path: "/sponsor-form/:formId", element: <LazyComponent Component={SponsorForm} /> },
  { path: "/vendor-form/:formId", element: <LazyComponent Component={VendorForm} /> },
  { path: "/live-questions/:eventId", element: <LazyComponent Component={LiveQuestions} /> },
  { path: "/live-polls/:eventId", element: <LazyComponent Component={LivePolls} /> },
  { path: "/live-chat/:eventId", element: <LazyComponent Component={LiveChat} /> },
  { path: "/live-games/:eventId", element: <LazyComponent Component={LiveGames} /> },
  { path: "/check-in/:eventId", element: <LazyComponent Component={CheckIn} /> },

  // Admin Routes
  { path: "/admin", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminDashboard /></Suspense></AdminRoute> },
  { path: "/admin/profile", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminProfile /></Suspense></AdminRoute> },
  { path: "/admin/events", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminEvents /></Suspense></AdminRoute> },
  { path: "/admin/attendees", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminAttendees /></Suspense></AdminRoute> },
  { path: "/admin/networking", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminNetworking /></Suspense></AdminRoute> },
  { path: "/admin/speakers", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminSpeakers /></Suspense></AdminRoute> },
  { path: "/admin/announcements", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminAnnouncements /></Suspense></AdminRoute> },
  { path: "/admin/schedule", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminSchedule /></Suspense></AdminRoute> },
  { path: "/admin/polls", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminPolls /></Suspense></AdminRoute> },
  { path: "/admin/facilities", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminFacilities /></Suspense></AdminRoute> },
  { path: "/admin/highlights", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminHighlights /></Suspense></AdminRoute> },
  { path: "/admin/event-preview", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminEventPreview /></Suspense></AdminRoute> },
  { path: "/admin/rules", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminRules /></Suspense></AdminRoute> },
  { path: "/admin/questions", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminQuestions /></Suspense></AdminRoute> },
  { path: "/admin/suggestions", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminSuggestions /></Suspense></AdminRoute> },
  { path: "/admin/notifications", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminNotifications /></Suspense></AdminRoute> },
  { path: "/admin/sponsors", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminSponsors /></Suspense></AdminRoute> },
  { path: "/admin/vendor-hub", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminVendorHub /></Suspense></AdminRoute> },
  { path: "/admin/games", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminGames /></Suspense></AdminRoute> },
  { path: "/admin/tickets", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminTickets /></Suspense></AdminRoute> },
  { path: "/admin/check-in", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminCheckIn /></Suspense></AdminRoute> },
  { path: "/admin/settings", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminSettings /></Suspense></AdminRoute> },
  { path: "/admin/wallet", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminWallet /></Suspense></AdminRoute> },
  { path: "/admin/advertisements", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminAdvertisements /></Suspense></AdminRoute> },

  // Host Routes (redirect to admin)
  { path: "/host", element: <Navigate to="/admin" replace /> },

  // Attendee Routes
  { path: "/attendee", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeDashboard /></Suspense></AttendeeRoute> },
  { path: "/attendee/profile", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeProfile /></Suspense></AttendeeRoute> },
  { path: "/attendee/networking", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeNetworking /></Suspense></AttendeeRoute> },
  { path: "/attendee/schedule", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeSchedule /></Suspense></AttendeeRoute> },
  { path: "/attendee/questions", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeQuestions /></Suspense></AttendeeRoute> },
  { path: "/attendee/map", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeMap /></Suspense></AttendeeRoute> },
  { path: "/attendee/polls", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeePolls /></Suspense></AttendeeRoute> },
  { path: "/attendee/suggestions", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeSuggestions /></Suspense></AttendeeRoute> },
  { path: "/attendee/announcements", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeAnnouncements /></Suspense></AttendeeRoute> },
  { path: "/attendee/rules", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeRules /></Suspense></AttendeeRoute> },
  { path: "/attendee/notifications", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeNotifications /></Suspense></AttendeeRoute> },
  { path: "/attendee/search", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeSearch /></Suspense></AttendeeRoute> },
  { path: "/attendee/onboarding", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeOnboarding /></Suspense></AttendeeRoute> },
  { path: "/attendee/my-tickets", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeMyTickets /></Suspense></AttendeeRoute> },
  { path: "/attendee/games", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeGames /></Suspense></AttendeeRoute> },

  // Catch all
  { path: "*", element: <Navigate to="/" replace /> },
]);
