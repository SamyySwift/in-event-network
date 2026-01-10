import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
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
  ChevronRight,
  BookOpen,
  Download,
} from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
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
import PricingSection from "@/components/landing/PricingSection";
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

const Landing = () => {
  const navigate = useNavigate();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [installDismissed, setInstallDismissed] = useState(
    () => sessionStorage.getItem('installDismissed') === 'true'
  );

  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInstallClick = async () => {
    const installed = await promptInstall();
    if (!installed) {
      navigate("/install");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white overflow-hidden">
      {/* Futuristic Header */}
      <header className="relative z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/header-logo.png" alt="Kconect Logo" className="h-8 w-auto" />
            <span className="ml-2 font-semibold text-2xl bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
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
                    onClick={() => navigate("/guide")}
                  >
                    Guide
                  </Button>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button
                    variant="ghost"
                    className="text-white/80 hover:text-white hover:bg-white/10"
                    onClick={() => scrollToSection("pricing")}
                  >
                    Pricing
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            <div className="flex space-x-3">
{/* Install button moved to floating position */}
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
      <section
        id="features"
        className="py-20 bg-black/20 backdrop-blur-sm border-y border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-cyan-400">Key Features</span>
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

      {/* Pricing Section - Use new component */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* Footer */}
      <LandingFooter />

      {/* Floating Install Button */}
      {isInstallable && !isInstalled && !installDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
        >
          <Button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/30 animate-pulse"
            size="lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Install App
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="bg-background/80 backdrop-blur-sm border-white/20 hover:bg-background"
            onClick={() => {
              setInstallDismissed(true);
              sessionStorage.setItem('installDismissed', 'true');
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default Landing;
