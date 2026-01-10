import React, { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { lazyWithRetry } from "@/lib/lazyWithRetry";
import LazyLoadErrorBoundary from "@/components/LazyLoadErrorBoundary";

// Eager load critical path components
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Lazy load all other pages with retry mechanism
const AuthCallback = lazyWithRetry(() => import("@/pages/AuthCallback"));
const Guide = lazyWithRetry(() => import("@/pages/Guide"));
const Index = lazyWithRetry(() => import("@/pages/Index"));
const NotFound = lazyWithRetry(() => import("@/pages/NotFound"));
const ScanQR = lazyWithRetry(() => import("@/pages/ScanQR"));
const VendorForm = lazyWithRetry(() => import("@/pages/VendorForm"));
const BuyTickets = lazyWithRetry(() => import("@/pages/BuyTickets"));
const JoinEvent = lazyWithRetry(() => import("@/pages/JoinEvent"));
const Discovery = lazyWithRetry(() => import("@/pages/Discovery"));
const DataPrivacy = lazyWithRetry(() => import("@/pages/DataPrivacy"));
const TermsOfService = lazyWithRetry(() => import("@/pages/TermsOfService"));
const SponsorForm = lazyWithRetry(() => import("@/pages/SponsorForm"));
const LiveQuestions = lazyWithRetry(() => import("@/pages/LiveQuestions"));
const LivePolls = lazyWithRetry(() => import("@/pages/LivePolls"));
const LiveChat = lazyWithRetry(() => import("@/pages/LiveChat"));
const LiveGames = lazyWithRetry(() => import("@/pages/LiveGames"));
const CheckIn = lazyWithRetry(() => import("@/pages/CheckIn"));
const Install = lazyWithRetry(() => import("@/pages/Install"));

// Admin Pages - Lazy loaded with retry
const AdminLayout = lazyWithRetry(() => import("@/components/layouts/AdminLayout"));
const AdminDashboard = lazyWithRetry(() => import("@/pages/admin/AdminDashboard"));
const AdminEvents = lazyWithRetry(() => import("@/pages/admin/AdminEvents"));
const AdminAttendees = lazyWithRetry(() => import("@/pages/admin/AdminAttendees"));
const AdminNetworking = lazyWithRetry(() => import("@/pages/admin/AdminNetworking"));
const AdminSpeakers = lazyWithRetry(() => import("@/pages/admin/AdminSpeakers"));
const AdminAnnouncements = lazyWithRetry(() => import("@/pages/admin/AdminAnnouncements"));
const AdminSchedule = lazyWithRetry(() => import("@/pages/admin/AdminSchedule"));
const AdminPolls = lazyWithRetry(() => import("@/pages/admin/AdminPolls"));
const AdminFacilities = lazyWithRetry(() => import("@/pages/admin/AdminFacilities"));
const AdminRules = lazyWithRetry(() => import("@/pages/admin/AdminRules"));
const AdminQuestions = lazyWithRetry(() => import("@/pages/admin/AdminQuestions"));
const AdminSuggestions = lazyWithRetry(() => import("@/pages/admin/AdminSuggestions"));
const AdminNotifications = lazyWithRetry(() => import("@/pages/admin/AdminNotifications"));
const AdminProfile = lazyWithRetry(() => import("@/pages/admin/AdminProfile"));
const AdminSponsors = lazyWithRetry(() => import("@/pages/admin/AdminSponsors"));
const AdminVendorHub = lazyWithRetry(() => import("@/pages/admin/AdminVendorHub"));
const AdminHighlights = lazyWithRetry(() => import("@/pages/admin/AdminHighlights"));
const AdminEventPreview = lazyWithRetry(() => import("@/pages/admin/AdminEventPreview"));
const AdminGames = lazyWithRetry(() => import("@/pages/admin/AdminGames"));
const AdminTickets = lazyWithRetry(() => import("@/pages/admin/AdminTickets"));
const AdminCheckIn = lazyWithRetry(() => import("@/pages/admin/AdminCheckIn"));
const AdminSettings = lazyWithRetry(() => import("@/pages/admin/AdminSettings"));
const AdminWallet = lazyWithRetry(() => import("@/pages/admin/AdminWallet"));
const AdminAdvertisements = lazyWithRetry(() => import("@/pages/admin/AdminAdvertisements"));
const AdminLiveBroadcast = lazyWithRetry(() => import("@/pages/admin/AdminLiveBroadcast"));
const AdminGuide = lazyWithRetry(() => import("@/pages/admin/AdminGuide"));

// Attendee Pages - Lazy loaded with retry
const AppLayout = lazyWithRetry(() => import("@/components/layouts/AppLayout"));
const AttendeeDashboard = lazyWithRetry(() => import("@/pages/attendee/AttendeeDashboard"));
const AttendeeProfile = lazyWithRetry(() => import("@/pages/attendee/AttendeeProfile"));
const AttendeeNetworking = lazyWithRetry(() => import("@/pages/attendee/AttendeeNetworking"));
const AttendeeSchedule = lazyWithRetry(() => import("@/pages/attendee/AttendeeSchedule"));
const AttendeeQuestions = lazyWithRetry(() => import("@/pages/attendee/AttendeeQuestions"));
const AttendeeMap = lazyWithRetry(() => import("@/pages/attendee/AttendeeMap"));
const AttendeePolls = lazyWithRetry(() => import("@/pages/attendee/AttendeePolls"));
const AttendeeSuggestions = lazyWithRetry(() => import("@/pages/attendee/AttendeeSuggestions"));
const AttendeeAnnouncements = lazyWithRetry(() => import("@/pages/attendee/AttendeeAnnouncements"));
const AttendeeRules = lazyWithRetry(() => import("@/pages/attendee/AttendeeRules"));
const AttendeeNotifications = lazyWithRetry(() => import("@/pages/attendee/AttendeeNotifications"));
const AttendeeSearch = lazyWithRetry(() => import("@/pages/attendee/AttendeeSearch"));
const AttendeeOnboarding = lazyWithRetry(() => import("@/pages/attendee/AttendeeOnboarding"));
const AttendeeGames = lazyWithRetry(() => import("@/pages/attendee/AttendeeGames"));
const AttendeeMyTickets = lazyWithRetry(() => import("@/pages/attendee/AttendeeMyTickets"));
const AttendeeBroadcast = lazyWithRetry(() => import("@/pages/attendee/AttendeeBroadcast"));

// Host Pages
const HostDashboard = lazyWithRetry(() => import("@/pages/host/HostDashboard"));

// Loading spinner for lazy components
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

// Admin Guard Component with lazy-loaded layout and error boundary
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["host"]}>
      <LazyLoadErrorBoundary>
        <Suspense fallback={<LazyLoader />}>
          <AdminLayout>{children}</AdminLayout>
        </Suspense>
      </LazyLoadErrorBoundary>
    </ProtectedRoute>
  );
};

// Attendee Guard Component with lazy-loaded layout and error boundary
const AttendeeRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["attendee"]}>
      <LazyLoadErrorBoundary>
        <Suspense fallback={<LazyLoader />}>
          <AppLayout>{children}</AppLayout>
        </Suspense>
      </LazyLoadErrorBoundary>
    </ProtectedRoute>
  );
};

// Wrapper for lazy components with error boundary
const LazyComponent = ({ Component }: { Component: React.LazyExoticComponent<any> }) => (
  <LazyLoadErrorBoundary>
    <Suspense fallback={<LazyLoader />}>
      <Component />
    </Suspense>
  </LazyLoadErrorBoundary>
);

export const router = createBrowserRouter([
  // Public routes - Landing, Login, Register are eager loaded
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  
  // Public routes - lazy loaded with error boundary
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
  { path: "/install", element: <LazyComponent Component={Install} /> },

  // Admin Routes with error boundary
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
  { path: "/admin/broadcast", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminLiveBroadcast /></Suspense></AdminRoute> },
  { path: "/admin/guide", element: <AdminRoute><Suspense fallback={<LazyLoader />}><AdminGuide /></Suspense></AdminRoute> },

  // Host Routes (redirect to admin)
  { path: "/host", element: <Navigate to="/admin" replace /> },

  // Attendee Routes with error boundary
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
  { path: "/attendee/broadcast", element: <AttendeeRoute><Suspense fallback={<LazyLoader />}><AttendeeBroadcast /></Suspense></AttendeeRoute> },

  // Catch all
  { path: "*", element: <Navigate to="/" replace /> },
]);
