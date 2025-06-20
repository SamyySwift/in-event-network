import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  Zap,
  Sparkles,
  Network,
  Brain,
  Rocket,
  Globe,
  Shield,
  Star,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { cn } from "@/lib/utils";
import { Instagram, Mail } from "lucide-react";
import XLogo from "@/components/icons/XLogo";
import LandingFooter from "@/components/landing/LandingFooter";
import FeatureCard from "@/components/landing/FeatureCard";
import ListItem from "@/components/landing/ListItem";
const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white overflow-hidden">
      {/* Futuristic Header */}
      <header className="relative z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Network className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Kconect
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent text-white/80 hover:text-white hover:bg-white/10">
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 w-[500px] grid-cols-2 bg-black/90 backdrop-blur-xl border border-white/10">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a className="flex h-full w-full select-none flex-col justify-end rounded-lg bg-gradient-to-b from-purple-600/20 to-cyan-600/20 p-6 no-underline outline-none focus:shadow-md border border-white/10">
                            <Brain className="h-6 w-6 text-cyan-400 mb-2" />
                            <div className="mb-2 text-lg font-medium text-white">
                              Smart Matching
                            </div>
                            <p className="text-sm text-white/60">
                              AI-powered connections that transform how you
                              network at events
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <ListItem
                        title="Network"
                        icon={<Network className="h-4 w-4" />}
                      >
                        Build lasting professional relationships through
                        intelligent connection recommendations
                      </ListItem>
                      <ListItem
                        title="Hybrid Experience"
                        icon={<Zap className="h-4 w-4" />}
                      >
                        Seamlessly blend virtual and physical event experiences
                        for maximum engagement
                      </ListItem>
                      <ListItem
                        title="Q&Live Chat"
                        icon={<Globe className="h-4 w-4" />}
                      >
                        Immersive interaction with fellow attendees
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                  >
                    Pricing
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex space-x-3">
              <Button
                variant="ghost"
                className="text-white/80 hover:text-white border border-white/20 hover:bg-white/10"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
              <Button
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20"
                onClick={() => navigate("/register")}
              >
                Launch Event
              </Button>
            </div>
          </div>

          <div className="flex md:hidden space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-purple-500"
              onClick={() => navigate("/register")}
            >
              Launch
            </Button>
          </div>
        </div>
      </header>

      <HeroGeometric
        badge="The Future of Event Networking"
        title1="Kconect"
        title2="Events Reimagined"
      />

      {/* Features Section */}
      <section className="py-20 bg-black/20 backdrop-blur-sm border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Key Features
              </span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Powerful tools to create meaningful connections and memorable
              event experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="Smart Matching"
              description="AI-powered intelligent algorithms analyze interests and goals to create meaningful networking opportunities"
              gradient="from-cyan-500/20 to-blue-500/20"
              borderGradient="from-cyan-500/50 to-blue-500/50"
            />

            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Efficient Scheduling"
              description="Real-time adaptive scheduling that adjusts based on attendee preferences and engagement"
              gradient="from-purple-500/20 to-pink-500/20"
              borderGradient="from-purple-500/50 to-pink-500/50"
            />

            <FeatureCard
              icon={<Globe className="h-8 w-8" />}
              title="Interactive Sessions"
              description="Engaging Q&A sessions and presentations that enhance participant experience"
              gradient="from-green-500/20 to-cyan-500/20"
              borderGradient="from-green-500/50 to-cyan-500/50"
            />

            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Enhanced Security"
              description="Enterprise-grade encryption and privacy controls protect all interactions and data"
              gradient="from-orange-500/20 to-red-500/20"
              borderGradient="from-orange-500/50 to-red-500/50"
            />

            <FeatureCard
              icon={<Network className="h-8 w-8" />}
              title="Connection Building"
              description="Build lasting professional relationships through intelligent connection recommendations"
              gradient="from-indigo-500/20 to-purple-500/20"
              borderGradient="from-indigo-500/50 to-purple-500/50"
            />

            <FeatureCard
              icon={<Sparkles className="h-8 w-8" />}
              title="Hybrid Experience"
              description="Seamlessly blend virtual and physical event experiences for maximum engagement"
              gradient="from-pink-500/20 to-cyan-500/20"
              borderGradient="from-pink-500/50 to-cyan-500/50"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-black/30 backdrop-blur-sm border-y border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8 border border-white/20">
              <Star className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-white/80">
                Simple, Transparent Pricing
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                One Price, Everything Included
              </span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Get access to all premium features with our all-inclusive pricing.
              No hidden fees, no surprises.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-semibold px-3 py-2 rounded-bl-xl rounded-tr-xl">
                    Premium Plan
                  </div>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-white mb-2 relative">
                    <span className="line-through decoration-2 opacity-50">
                      ₦100,000
                    </span>
                  </h3>
                  <div className="flex items-center justify-center mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      ₦30,000{" "}
                    </span>
                    <p className="text-white/60">/ per event</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/80">Unlimited attendees</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/80">
                      AI-powered smart matching
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/80">
                      Real-time analytics dashboard
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/80">
                      Interactive Q&amp;A sessions
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/80">
                      Real-time attendee messaging
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="text-white/80">24/7 premium support</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-2xl shadow-purple-500/30 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
                  onClick={() => navigate("/register?role=host")}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Get Started Today
                </Button>

                <p className="text-center text-white/40 text-sm mt-4">
                  30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {/* <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Ready to Transform Your Events?
            </span>
          </h2>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Join us and experience networking that makes a difference. Start
            connecting today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-2xl shadow-purple-500/30 px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
              onClick={() => navigate("/register?role=host")}
            >
              <Rocket className="mr-2 h-5 w-5" />
              Create Your Event
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold"
              onClick={() => setShowScanner(true)}
            >
              <Zap className="mr-2 h-5 w-5" />
              Join an Event
            </Button>
          </div>
        </div>
       </section> */}

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default Landing;
