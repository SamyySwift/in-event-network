import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users,
  Calendar,
  MessageSquare,
  MapPin,
  Bell,
  Settings,
  BarChart3,
  UserCheck,
  Vote,
  HelpCircle,
  Search,
  QrCode,
  ArrowLeft,
  BookOpen,
  Shield,
  Network,
  Zap,
  Globe,
  Brain,
  Star,
  ChevronRight,
} from "lucide-react";

const Guide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white">
      {/* Header */}
      <header className="relative z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Kconect Logo" className="h-8 w-auto" />
          </div>
          <div className="flex space-x-3">
            <Button
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20"
              onClick={() => navigate("/register")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-10 w-10 text-cyan-400 mr-4" />
            <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Getting Started Guide
            </h1>
          </div>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Learn how to make the most of Kconect, whether you're organizing
            events or attending them. This comprehensive guide covers everything
            you need to know.
          </p>
        </div>

        {/* Quick Start Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-cyan-400">
            Quick Start
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full w-10 h-10 flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <CardTitle className="text-white text-2xl lg:text-3xl">
                    Sign Up
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  Create your account by choosing between Host (for event
                  organizers) or Attendee roles.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-10 h-10 flex items-center justify-center">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <CardTitle className="text-white text-2xl lg:text-3xl">
                    Set Up Profile
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  Complete your profile with relevant information to enhance
                  networking opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-full w-10 h-10 flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <CardTitle className="text-white text-2xl lg:text-3xl">
                    Start Connecting
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white/70">
                  Begin creating events or joining them to start building
                  meaningful professional connections.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Admin Guide Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-purple-400">
            Admin/Host Dashboard Guide
          </h2>
          <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="dashboard" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                    <span>Dashboard Overview</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Your central command center for event management:</p>
                    <ul className="space-y-2 ml-4">
                      <li>• View real-time event statistics and metrics</li>
                      <li>• Monitor attendee engagement and participation</li>
                      <li>• Access quick actions for common tasks</li>
                      <li>• Get insights into event performance</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="events" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    <span>Events Management</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Create and manage your events:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Create Event:</strong> Set up new events with
                        details, dates, and settings
                      </li>
                      <li>
                        • <strong>Edit Event:</strong> Modify event information
                        and configurations
                      </li>
                      <li>
                        • <strong>Publish/Unpublish:</strong> Control event
                        visibility to attendees
                      </li>
                      <li>
                        • <strong>Generate QR Code:</strong> Create registration
                        QR codes for easy sign-up
                      </li>
                      <li>
                        • <strong>Event Analytics:</strong> View detailed
                        performance metrics
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="attendees" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-cyan-400" />
                    <span>Attendee Management</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Manage your event participants:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>View Attendees:</strong> See all registered
                        participants
                      </li>
                      <li>
                        • <strong>Approve/Reject:</strong> Control attendee
                        registration requests
                      </li>
                      <li>
                        • <strong>Send Messages:</strong> Communicate directly
                        with attendees
                      </li>
                      <li>
                        • <strong>Export Data:</strong> Download attendee lists
                        and information
                      </li>
                      <li>
                        • <strong>Check-in Status:</strong> Monitor who has
                        arrived at the event
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="speakers" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-5 w-5 text-cyan-400" />
                    <span>Speakers & Presenters</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Manage event speakers and presentations:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Add Speakers:</strong> Register speakers with
                        bios and photos
                      </li>
                      <li>
                        • <strong>Assign Sessions:</strong> Link speakers to
                        specific time slots
                      </li>
                      <li>
                        • <strong>Speaker Profiles:</strong> Manage detailed
                        speaker information
                      </li>
                      <li>
                        • <strong>Contact Speakers:</strong> Send direct
                        communications
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="schedule" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    <span>Schedule Management</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Create and manage event schedules:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Add Sessions:</strong> Create time slots with
                        descriptions
                      </li>
                      <li>
                        • <strong>Set Locations:</strong> Assign venues to
                        sessions
                      </li>
                      <li>
                        • <strong>Update Times:</strong> Modify session timings
                      </li>
                      <li>
                        • <strong>Publish Schedule:</strong> Make schedule
                        visible to attendees
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="announcements" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-cyan-400" />
                    <span>Announcements & Notifications</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Communicate with your attendees:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Create Announcements:</strong> Send important
                        updates
                      </li>
                      <li>
                        • <strong>Schedule Messages:</strong> Set announcements
                        for future delivery
                      </li>
                      <li>
                        • <strong>Target Audiences:</strong> Send to specific
                        attendee groups
                      </li>
                      <li>
                        • <strong>Push Notifications:</strong> Send real-time
                        alerts
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="polls" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <Vote className="h-5 w-5 text-cyan-400" />
                    <span>Polls & Surveys</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Engage attendees with interactive content:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Create Polls:</strong> Set up multiple choice
                        questions
                      </li>
                      <li>
                        • <strong>Live Voting:</strong> Enable real-time
                        audience participation
                      </li>
                      <li>
                        • <strong>View Results:</strong> Monitor poll responses
                        and analytics
                      </li>
                      <li>
                        • <strong>Export Data:</strong> Download poll results
                        for analysis
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="facilities" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    <span>Facilities & Venues</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Manage event locations and facilities:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Add Venues:</strong> Register event locations
                        with details
                      </li>
                      <li>
                        • <strong>Capacity Management:</strong> Set room limits
                        and availability
                      </li>
                      <li>
                        • <strong>Facility Maps:</strong> Upload floor plans and
                        directions
                      </li>
                      <li>
                        • <strong>Amenities:</strong> List available facilities
                        and services
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Attendee Guide Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-green-400">
            Attendee Dashboard Guide
          </h2>
          <div className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem
                value="attendee-dashboard"
                className="border-white/10"
              >
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-green-400" />
                    <span>Dashboard Overview</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Your personal event hub:</p>
                    <ul className="space-y-2 ml-4">
                      <li>• View upcoming sessions and events</li>
                      <li>• See your networking connections</li>
                      <li>• Access quick actions for common tasks</li>
                      <li>• Check recent announcements and updates</li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="profile" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-green-400" />
                    <span>Profile Management</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Customize your professional presence:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Edit Profile:</strong> Update your bio, photo,
                        and contact information
                      </li>
                      <li>
                        • <strong>Professional Details:</strong> Add job title,
                        company, and expertise
                      </li>
                      <li>
                        • <strong>Networking Preferences:</strong> Set your
                        availability and interests
                      </li>
                      <li>
                        • <strong>Privacy Settings:</strong> Control who can see
                        your information
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="networking" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <Network className="h-5 w-5 text-green-400" />
                    <span>Smart Networking</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Connect with other attendees intelligently:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Browse Attendees:</strong> View other
                        participants' profiles
                      </li>
                      <li>
                        • <strong>Smart Matching:</strong> Get AI-powered
                        connection recommendations
                      </li>
                      <li>
                        • <strong>Send Requests:</strong> Initiate networking
                        connections
                      </li>
                      <li>
                        • <strong>Schedule Meetings:</strong> Arrange one-on-one
                        sessions
                      </li>
                      <li>
                        • <strong>Chat:</strong> Message your connections
                        directly
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="attendee-schedule"
                className="border-white/10"
              >
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-green-400" />
                    <span>Personal Schedule</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Manage your event agenda:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>View Schedule:</strong> See all event sessions
                        and timings
                      </li>
                      <li>
                        • <strong>Add to Calendar:</strong> Save sessions to
                        your personal calendar
                      </li>
                      <li>
                        • <strong>Set Reminders:</strong> Get notifications
                        before sessions start
                      </li>
                      <li>
                        • <strong>Track Attendance:</strong> Mark sessions
                        you've attended
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="qna" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="h-5 w-5 text-green-400" />
                    <span>Ask Questions</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Engage with speakers and sessions:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Ask Questions:</strong> Submit questions
                        during sessions
                      </li>
                      <li>
                        • <strong>Vote on Questions:</strong> Support questions
                        from other attendees
                      </li>
                      <li>
                        • <strong>View Answers:</strong> See responses from
                        speakers
                      </li>
                      <li>
                        • <strong>Follow Up:</strong> Continue conversations
                        after sessions
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="findway" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-green-400" />
                    <span>Find Your Way</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Navigate the event venue:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Interactive Maps:</strong> View detailed venue
                        layouts
                      </li>
                      <li>
                        • <strong>Room Locations:</strong> Find specific session
                        rooms
                      </li>
                      <li>
                        • <strong>Facility Information:</strong> Locate
                        amenities and services
                      </li>
                      <li>
                        • <strong>Directions:</strong> Get step-by-step
                        navigation
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="attendee-polls" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <Vote className="h-5 w-5 text-green-400" />
                    <span>Polls & Feedback</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Participate in interactive content:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Vote in Polls:</strong> Participate in live
                        audience polls
                      </li>
                      <li>
                        • <strong>Submit Feedback:</strong> Rate sessions and
                        speakers
                      </li>
                      <li>
                        • <strong>View Results:</strong> See poll outcomes in
                        real-time
                      </li>
                      <li>
                        • <strong>Suggest Topics:</strong> Propose discussion
                        topics
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="search" className="border-white/10">
                <AccordionTrigger className="text-white hover:text-cyan-400">
                  <div className="flex items-center space-x-3">
                    <Search className="h-5 w-5 text-green-400" />
                    <span>Search & Discovery</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70">
                  <div className="space-y-4">
                    <p>Find what you're looking for:</p>
                    <ul className="space-y-2 ml-4">
                      <li>
                        • <strong>Search Attendees:</strong> Find specific
                        people by name or company
                      </li>
                      <li>
                        • <strong>Filter by Interests:</strong> Discover people
                        with similar professional interests
                      </li>
                      <li>
                        • <strong>Search Sessions:</strong> Find specific talks
                        or workshops
                      </li>
                      <li>
                        • <strong>Advanced Filters:</strong> Use multiple
                        criteria to narrow results
                      </li>
                    </ul>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-yellow-400">
            Pro Tips for Success
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Star className="h-6 w-6 text-yellow-400" />
                  <CardTitle className="text-white">
                    For Event Organizers
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-white/70">
                <p>• Set up your event details completely before publishing</p>
                <p>• Use QR codes for easy attendee registration</p>
                <p>• Send regular announcements to keep attendees engaged</p>
                <p>• Monitor analytics to understand attendee behavior</p>
                <p>• Encourage connections through polls and question sessions</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Network className="h-6 w-6 text-green-400" />
                  <CardTitle className="text-white">For Attendees</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-white/70">
                <p>
                  • Complete your profile to maximize networking opportunities
                </p>
                <p>• Use smart matching to find relevant connections</p>
                <p>• Participate actively in polls and question sessions</p>
                <p>• Schedule meetings with interesting connections</p>
                <p>• Follow up with new contacts after the event</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who are already using Kconect to
              create meaningful connections and successful events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20"
                onClick={() => navigate("/register")}
              >
                Create Account
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-black hover:bg-white/10"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Guide;
