import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Ticket,
  Users,
  Calendar,
  MessageSquare,
  QrCode,
  Sparkles,
  Vote,
  Bell,
  Network,
  ChevronRight,
  Menu,
  X,
  Play,
} from "lucide-react";
import LandingFooter from "@/components/landing/LandingFooter";
import PricingSection from "@/components/landing/PricingSection";
import QRCodeScanner from "@/components/QRCodeScanner";
import { useToast } from "@/hooks/use-toast";
import { useJoinEvent } from "@/hooks/useJoinEvent";

const userTypes = [
  { label: "hosts", color: "bg-indigo-400", textColor: "text-white" },
  { label: "attendees", color: "bg-orange-400", textColor: "text-white" },
  { label: "speakers", color: "bg-cyan-400", textColor: "text-white" },
  { label: "vendors", color: "bg-amber-500", textColor: "text-white" },
  { label: "sponsors", color: "bg-pink-400", textColor: "text-white" },
  { label: "planners", color: "bg-emerald-400", textColor: "text-white" },
];

const features = [
  {
    icon: Ticket,
    title: "Ticketing & Check-in",
    description: "Sell tickets, manage RSVPs, and check in attendees with QR codes in seconds.",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Users,
    title: "Smart Networking",
    description: "AI-powered attendee matching helps your guests make meaningful connections.",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    icon: Calendar,
    title: "Event Schedule",
    description: "Create beautiful schedules your attendees can browse and save to their calendars.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: MessageSquare,
    title: "Live Q&A & Chat",
    description: "Engage your audience with real-time questions, polls, and group discussions.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: Vote,
    title: "Polls & Surveys",
    description: "Get instant feedback with interactive polls and post-event surveys.",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: Sparkles,
    title: "Highlights & Media",
    description: "Capture and share event moments with photo galleries and video highlights.",
    color: "bg-amber-100 text-amber-600",
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const { toast } = useToast();
  const { joinEvent, isJoining } = useJoinEvent();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleScanSuccess = (decodedText: string) => {
    setShowScanner(false);
    try {
      let accessCode = "";
      if (decodedText.includes("code=")) {
        const url = new URL(decodedText);
        accessCode = url.searchParams.get("code") || "";
      } else if (/^\d{6}$/.test(decodedText.trim())) {
        accessCode = decodedText.trim();
      }
      
      if (accessCode && /^\d{6}$/.test(accessCode)) {
        joinEvent(accessCode);
      } else {
        toast({
          title: "Invalid QR Code",
          description: "This doesn't appear to be a valid event code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "This doesn't appear to be a valid event code.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-lg border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Kconect" className="h-8 w-auto" />
              <span className="font-bold text-xl text-stone-900">kconect</span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => navigate("/guide")}
                className="text-stone-600 hover:text-stone-900 font-medium transition-colors"
              >
                Guide
              </button>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-stone-700 hover:text-stone-900 hover:bg-stone-100"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
              <Button
                className="bg-stone-900 hover:bg-stone-800 text-white rounded-full px-6"
                onClick={() => navigate("/register")}
              >
                Get Started Free
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-stone-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pt-4 pb-2 space-y-3"
            >
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left py-2 text-stone-600 hover:text-stone-900"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="block w-full text-left py-2 text-stone-600 hover:text-stone-900"
              >
                Pricing
              </button>
              <button
                onClick={() => { navigate("/guide"); setMobileMenuOpen(false); }}
                className="block w-full text-left py-2 text-stone-600 hover:text-stone-900"
              >
                Guide
              </button>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                >
                  Sign In
                </Button>
                <Button
                  className="flex-1 bg-stone-900 hover:bg-stone-800"
                  onClick={() => { navigate("/register"); setMobileMenuOpen(false); }}
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle pattern background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a373' fill-opacity='0.15'%3E%3Cpath d='M30 30l-4-4 4-4 4 4-4 4zm0-16l-4-4 4-4 4 4-4 4zm0 32l-4-4 4-4 4 4-4 4zm16-16l-4-4 4-4 4 4-4 4zm-32 0l-4-4 4-4 4 4-4 4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-full px-4 py-1.5 mb-8 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-stone-600 font-medium">Event management reimagined</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-stone-900 tracking-tight mb-6"
            >
              Create events{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500">
                people love
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-stone-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Plan events, sell tickets, network attendees, and share memories — all in one beautiful platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Button
                size="lg"
                className="bg-stone-900 hover:bg-stone-800 text-white rounded-full px-8 py-6 text-lg w-full sm:w-auto"
                onClick={() => navigate("/register?role=host")}
              >
                Create Your Event
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full px-8 py-6 text-lg w-full sm:w-auto"
                onClick={() => navigate("/discovery")}
              >
                <Play className="mr-2 h-5 w-5" />
                Discover Events
              </Button>
            </motion.div>

            {/* User Type Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <span className="text-stone-500 text-sm">Built for</span>
              {userTypes.map((type, index) => (
                <motion.span
                  key={type.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className={`${type.color} ${type.textColor} px-4 py-1.5 rounded-full text-sm font-medium shadow-sm`}
                >
                  {type.label}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* QR Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-900">Scan Event QR Code</h3>
              <button
                onClick={() => setShowScanner(false)}
                className="p-2 hover:bg-stone-100 rounded-full"
              >
                <X className="h-5 w-5 text-stone-600" />
              </button>
            </div>
            <QRCodeScanner
              onScanSuccess={handleScanSuccess}
              onScanError={(error) => console.error(error)}
            />
          </motion.div>
        </div>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-full px-4 py-1.5 mb-4"
            >
              Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4"
            >
              Everything you need to run{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-pink-500">
                amazing events
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-stone-600 max-w-2xl mx-auto"
            >
              From planning to post-event, we've got you covered with powerful tools that just work.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 bg-stone-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-stone-200"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">{feature.title}</h3>
                <p className="text-stone-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Additional CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-stone-300 text-stone-700 hover:bg-stone-100"
              onClick={() => navigate("/guide")}
            >
              Explore All Features
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-stone-100 to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-full px-4 py-1.5 mb-4"
            >
              How It Works
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4"
            >
              Get started in minutes
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Your Event",
                description: "Set up your event with all the details, tickets, and schedule in just a few clicks.",
                color: "text-indigo-500",
              },
              {
                step: "02",
                title: "Invite & Promote",
                description: "Share your event link, sell tickets, and let attendees discover your event.",
                color: "text-pink-500",
              },
              {
                step: "03",
                title: "Engage & Connect",
                description: "Check in guests, run live polls, facilitate networking, and create memories.",
                color: "text-emerald-500",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <span className={`text-6xl font-bold ${item.color} opacity-20`}>{item.step}</span>
                <h3 className="text-xl font-semibold text-stone-900 mt-4 mb-2">{item.title}</h3>
                <p className="text-stone-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 text-center">
            <div>
              <div className="text-4xl font-bold text-stone-900">1,000+</div>
              <div className="text-stone-600">Events Created</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-stone-200" />
            <div>
              <div className="text-4xl font-bold text-stone-900">50,000+</div>
              <div className="text-stone-600">Attendees Connected</div>
            </div>
            <div className="hidden md:block w-px h-12 bg-stone-200" />
            <div>
              <div className="text-4xl font-bold text-stone-900">4.9★</div>
              <div className="text-stone-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* Final CTA */}
      <section className="py-20 sm:py-28 bg-stone-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to create your next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
              unforgettable event?
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-stone-400 mb-8"
          >
            Join thousands of event creators who trust Kconect to bring their vision to life.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              size="lg"
              className="bg-white text-stone-900 hover:bg-stone-100 rounded-full px-8 py-6 text-lg w-full sm:w-auto"
              onClick={() => navigate("/register?role=host")}
            >
              Get Started Free
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-stone-600 text-white hover:bg-stone-800 rounded-full px-8 py-6 text-lg w-full sm:w-auto"
              onClick={() => setShowScanner(true)}
            >
              <QrCode className="mr-2 h-5 w-5" />
              Scan to Join Event
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default Landing;
