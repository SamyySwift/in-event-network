
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AdminLayout } from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminAttendees from "./pages/admin/AdminAttendees";
import AdminSpeakers from "./pages/admin/AdminSpeakers";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminSchedule from "./pages/admin/AdminSchedule";
import AdminPolls from "./pages/admin/AdminPolls";
import AdminFacilities from "./pages/admin/AdminFacilities";
import AdminRules from "./pages/admin/AdminRules";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminSuggestions from "./pages/admin/AdminSuggestions";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminSponsors from "./pages/admin/AdminSponsors";
import AdminAdvertisements from "./pages/admin/AdminAdvertisements";
import AdminVendorHub from "./pages/admin/AdminVendorHub";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminCheckIn from "./pages/admin/AdminCheckIn";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";
import TeamSignup from "@/pages/TeamSignup";
import AdminTeamManagement from "@/pages/admin/AdminTeamManagement";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="attendees" element={<AdminAttendees />} />
        <Route path="speakers" element={<AdminSpeakers />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="schedule" element={<AdminSchedule />} />
        <Route path="polls" element={<AdminPolls />} />
        <Route path="facilities" element={<AdminFacilities />} />
        <Route path="rules" element={<AdminRules />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="suggestions" element={<AdminSuggestions />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="sponsors" element={<AdminSponsors />} />
        <Route path="advertisements" element={<AdminAdvertisements />} />
        <Route path="vendor-hub" element={<AdminVendorHub />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="checkin" element={<AdminCheckIn />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="team-management" element={<AdminTeamManagement />} />
      </Route>

      {/* Add team signup route */}
      <Route path="/team-signup" element={<TeamSignup />} />
    </Route>
  )
);

export default router;
