import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, Rocket, Star, Mail, MessageCircle } from "lucide-react";

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-black/30 backdrop-blur-sm border-y border-white/10 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/30">
            <Star className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-white/90 font-medium">
              Professional Event Solution
            </span>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Transform Your Events
            </span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Everything you need to create memorable, connected experiences
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Standard (Free) Plan */}
          <Card className="relative group bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-xl">
            <div className="absolute top-0 right-0">
              <div className="bg-white/10 text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-bl-xl rounded-tr-sm border border-white/20">
                Standard Plan
              </div>
            </div>

            <CardHeader className="pb-6 pt-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-300" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl text-white mb-1 font-bold">
                Free
              </CardTitle>
              <CardDescription className="text-white/70 text-base sm:text-lg">
                Essentials to launch and grow your event
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-6 sm:px-8 pb-8">
              <div className="space-y-3">
                {[
                  "Flexible ticketing — run free or paid events with ease",
                  "Fast, reliable attendee check-ins",
                  "Get discovered on the public Discovery page",
                  "Friendly support to help you succeed on the platform",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-white h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <span className="text-white/90 text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-xl py-4 sm:py-5 text-lg font-semibold transform hover:scale-105 transition-all duration-200 mt-4"
                onClick={() => navigate("/register?role=host")}
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative group bg-white/10 backdrop-blur-xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-xl">
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-bl-xl rounded-tr-sm">
                Premium Plan
              </div>
            </div>

            <CardHeader className="text-center pb-6 pt-10 relative z-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl text-white mb-2 font-bold">
                Premium
              </CardTitle>
              {/* Removed the price display row */}
              {/* Previously displayed ₦100,000 and "/ per event" */}
            </CardHeader>

            <CardContent className="space-y-6 relative z-10 px-6 sm:px-8 pb-8">
              <div className="space-y-3">
                {[
                  "Everything in Standard, plus:",
                  "Run multiple events effortlessly",
                  "Real-time Q&A that energizes your audience",
                  "Facility and venue coordination made simple",
                  "Broadcast announcements with one click",
                  "Interactive polls and sentiment surveys",
                  "Capture magic with event highlights & media",
                  "Showcase partners and sponsors beautifully",
                  "Vendor hub with streamlined workflows",
                  "Smart event rules and compliance",
                  "Lightning-fast bulk check-ins",
                  "AI-powered attendee networking",
                  "Actionable suggestions and 5-star ratings",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="text-white h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <span className="text-white/90 text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-xl py-4 sm:py-5 text-lg font-semibold transform hover:scale-105 transition-all duration-200 mt-2"
                onClick={() => navigate("/register?role=host")}
              >
                Start Premium
              </Button>
            </CardContent>
          </Card>

          {/* Custom Plan */}
          <Card className="relative group bg-white/10 backdrop-blur-xl border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-xl">
            <div className="absolute top-0 right-0">
              <div className="bg-white/10 text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-bl-xl rounded-tr-sm border border-white/20">
                Custom Plan
              </div>
            </div>

            <CardHeader className="pb-6 pt-10">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl text-white mb-1 font-bold">
                Tailored For You
              </CardTitle>
              <CardDescription className="text-white/70 text-base sm:text-lg">
                Everything in Premium, plus dedicated on‑site support
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 px-6 sm:px-8 pb-8">
              <div className="space-y-3">
                {[
                  "Setup personnel — venue prep and equipment arrangement",
                  "Registration personnel — swift check‑in and ticket validation",
                  "Protocol personnel — guest arrivals and VIP coordination",
                  "Ushering personnel — guided seating and attendee assistance",
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="text-white h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <span className="text-white/90 text-sm sm:text-base">{feature}</span>
                  </div>
                ))}
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-xl py-4 sm:py-5 text-lg font-semibold transform hover:scale-105 transition-all duration-200 mt-2"
                  >
                    Contact Sales
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Contact Sales</DialogTitle>
                    <DialogDescription>
                      Choose how you’d like to reach us.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button asChild className="w-full">
                      <a
                        href="https://wa.me/2349068982251"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Chat on WhatsApp"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button variant="secondary" asChild className="w-full">
                      <a
                        href="mailto:kconect.com@gmail.com?subject=Custom%20Plan%20Enquiry&body=Hi%20kconect%20team%2C%20I%27d%20like%20to%20learn%20more%20about%20the%20Custom%20Plan."
                        aria-label="Send an email"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </a>
                    </Button>
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <p className="text-xs text-white/60">We’ll get back to you quickly.</p>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
