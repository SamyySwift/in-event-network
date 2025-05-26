import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";

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
              {/* Attendee Routes */}
              <Route path="/attendee" element={<AttendeeDashboard />} />
              <Route path="/attendee/profile" element={<AttendeeProfile />} />
              <Route
                path="/attendee/networking"
                element={<AttendeeNetworking />}
              />
              <Route
                path="/attendee/onboarding"
                element={<AttendeeOnboarding />}
              />
              <Route path="/attendee/schedule" element={<AttendeeSchedule />} />
              <Route
                path="/attendee/questions"
                element={<AttendeeQuestions />}
              />
              <Route path="/attendee/map" element={<AttendeeMap />} />
              <Route
                path="/attendee/notifications"
                element={<AttendeeNotifications />}
              />
              <Route
                path="/attendee/announcements"
                element={<AttendeeAnnouncements />}
              />
              <Route path="/attendee/rules" element={<AttendeeRules />} />
              <Route
                path="/attendee/rate"
                element={<AttendeeDashboard />}
              />{" "}
              {/* Placeholder for rate page */}
              <Route path="/attendee/polls" element={<AttendeePolls />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/attendees" element={<AdminAttendees />} />
              <Route path="/admin/speakers" element={<AdminSpeakers />} />
              <Route
                path="/admin/announcements"
                element={<AdminAnnouncements />}
              />
              <Route path="/admin/facilities" element={<AdminFacilities />} />
              <Route path="/admin/rules" element={<AdminRules />} />
              <Route path="/admin/polls" element={<AdminPolls />} />
              <Route path="/admin/questions" element={<AdminQuestions />} />
              <Route path="/admin/suggestions" element={<AdminSuggestions />} />
              <Route path="/admin/team" element={<AdminTeam />} />
              <Route
                path="/admin/notifications"
                element={<AdminNotifications />}
              />
              <Route path="/admin/settings" element={<AdminSettings />} />
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
