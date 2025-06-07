
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Attendee Pages
import AttendeeDashboard from "./pages/attendee/AttendeeDashboard";
import AttendeeProfile from "./pages/attendee/AttendeeProfile";
import AttendeeNetworking from "./pages/attendee/AttendeeNetworking";
import AttendeeSchedule from "./pages/attendee/AttendeeSchedule";
import AttendeeQuestions from "./pages/attendee/AttendeeQuestions";
import AttendeeMap from "./pages/attendee/AttendeeMap";
import AttendeeNotifications from "./pages/attendee/AttendeeNotifications";
import AttendeeAnnouncements from "./pages/attendee/AttendeeAnnouncements";
import AttendeeRules from "./pages/attendee/AttendeeRules";
import AttendeePolls from "./pages/attendee/AttendeePolls";
import AttendeeSuggestions from "./pages/attendee/AttendeeSuggestions";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminAttendees from "./pages/admin/AdminAttendees";
import AdminSpeakers from "./pages/admin/AdminSpeakers";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminFacilities from "./pages/admin/AdminFacilities";
import AdminRules from "./pages/admin/AdminRules";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminSuggestions from "./pages/admin/AdminSuggestions";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPolls from "./pages/admin/AdminPolls";
import AttendeeOnboarding from "./pages/attendee/AttendeeOnboarding";
import AdminAdvertisements from "./pages/admin/AdminAdvertisements";

const queryClient = new QueryClient();

// Check for dark mode preference
const checkDarkMode = () => {
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
    return true;
  } else {
    document.documentElement.classList.remove("dark");
    return false;
  }
};

const App = () => {
  // Initialize theme on app load
  useEffect(() => {
    checkDarkMode();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Attendee Routes */}
              <Route path="/attendee" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeDashboard />
                </ProtectedRoute>
              } />
              <Route path="/attendee/profile" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeProfile />
                </ProtectedRoute>
              } />
              <Route path="/attendee/networking" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeNetworking />
                </ProtectedRoute>
              } />
              <Route path="/attendee/onboarding" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeOnboarding />
                </ProtectedRoute>
              } />
              <Route path="/attendee/schedule" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeSchedule />
                </ProtectedRoute>
              } />
              <Route path="/attendee/questions" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeQuestions />
                </ProtectedRoute>
              } />
              <Route path="/attendee/map" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeMap />
                </ProtectedRoute>
              } />
              <Route path="/attendee/notifications" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeNotifications />
                </ProtectedRoute>
              } />
              <Route path="/attendee/announcements" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeAnnouncements />
                </ProtectedRoute>
              } />
              <Route path="/attendee/rules" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeRules />
                </ProtectedRoute>
              } />
              <Route path="/attendee/suggestions" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeeSuggestions />
                </ProtectedRoute>
              } />
              <Route path="/attendee/polls" element={
                <ProtectedRoute requiredRole="attendee">
                  <AttendeePolls />
                </ProtectedRoute>
              } />
              
              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="host">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/events" element={
                <ProtectedRoute requiredRole="host">
                  <AdminEvents />
                </ProtectedRoute>
              } />
              <Route path="/admin/attendees" element={
                <ProtectedRoute requiredRole="host">
                  <AdminAttendees />
                </ProtectedRoute>
              } />
              <Route path="/admin/speakers" element={
                <ProtectedRoute requiredRole="host">
                  <AdminSpeakers />
                </ProtectedRoute>
              } />
              <Route path="/admin/announcements" element={
                <ProtectedRoute requiredRole="host">
                  <AdminAnnouncements />
                </ProtectedRoute>
              } />
              <Route path="/admin/advertisements" element={
                <ProtectedRoute requiredRole="host">
                  <AdminAdvertisements />
                </ProtectedRoute>
              } />
              <Route path="/admin/facilities" element={
                <ProtectedRoute requiredRole="host">
                  <AdminFacilities />
                </ProtectedRoute>
              } />
              <Route path="/admin/rules" element={
                <ProtectedRoute requiredRole="host">
                  <AdminRules />
                </ProtectedRoute>
              } />
              <Route path="/admin/polls" element={
                <ProtectedRoute requiredRole="host">
                  <AdminPolls />
                </ProtectedRoute>
              } />
              <Route path="/admin/questions" element={
                <ProtectedRoute requiredRole="host">
                  <AdminQuestions />
                </ProtectedRoute>
              } />
              <Route path="/admin/suggestions" element={
                <ProtectedRoute requiredRole="host">
                  <AdminSuggestions />
                </ProtectedRoute>
              } />
              <Route path="/admin/team" element={
                <ProtectedRoute requiredRole="host">
                  <AdminTeam />
                </ProtectedRoute>
              } />
              <Route path="/admin/notifications" element={
                <ProtectedRoute requiredRole="host">
                  <AdminNotifications />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole="host">
                  <AdminSettings />
                </ProtectedRoute>
              } />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
