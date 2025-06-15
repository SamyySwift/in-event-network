
import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Lock, Shield, User, Globe2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const PRIVACY_SECTIONS = [
  {
    icon: <User className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "Information We Collect",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>
          <span className="font-semibold text-cyan-400">Personal info:</span> name, email, contact details
        </li>
        <li>
          <span className="font-semibold text-cyan-400">Event data:</span> events joined or hosted on our platform
        </li>
        <li>
          <span className="font-semibold text-cyan-400">Usage data:</span> sessions, preferences, interactions
        </li>
      </ul>
    ),
  },
  {
    icon: <Globe2 className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "How We Use Your Data",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>To connect you with relevant events and attendees</li>
        <li>To improve our services and personalize your experience</li>
        <li>To ensure the security of your account and data</li>
      </ul>
    ),
  },
  {
    icon: <Shield className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "Data Sharing & Third Parties",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>We do <span className="font-semibold text-cyan-400">not</span> sell your data</li>
        <li>Service providers only get what's needed to run Kconnect</li>
        <li>Legal compliance in response to court orders or law enforcement</li>
      </ul>
    ),
  },
  {
    icon: <Lock className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "Security Measures",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>End-to-end encryption for sensitive interactions</li>
        <li>Regular security audits and updates</li>
        <li>Strict access controls</li>
      </ul>
    ),
  },
  {
    icon: <ChevronDown className="rotate-12 text-cyan-400 h-5 w-5 mr-2" />,
    title: "Your Rights & Controls",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>Access and update your personal data anytime</li>
        <li>Request deletion of your account and related data</li>
        <li>Manage your contact preferences</li>
      </ul>
    ),
  },
  {
    icon: <Mail className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "Contact Us",
    content: (
      <div>
        Questions or requests? Email&nbsp;
        <a
          className="text-cyan-400 underline"
          href="mailto:support@kconnect.com"
        >
          support@kconnect.com
        </a>
      </div>
    ),
  },
];

export default function DataPrivacy() {
  const [openSection, setOpenSection] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 text-white relative">
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center space-x-4">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Data Privacy Policy
          </h1>
        </div>
      </header>

      <section className="flex flex-col items-center py-16 px-4">
        <div className="max-w-2xl w-full">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4 border border-white/20">
              <Lock className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-white/80">Your Trust, Our Priority</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Data Privacy at Kconnect
            </h2>
            <p className="text-lg text-white/70">
              We are committed to protecting your information. Review our privacy practices below.
            </p>
          </div>

          <div className="space-y-4">
            {PRIVACY_SECTIONS.map((section, idx) => (
              <Collapsible
                key={idx}
                open={openSection === idx}
                onOpenChange={(open) =>
                  setOpenSection(open ? idx : null)
                }
              >
                <CollapsibleTrigger
                  asChild
                  onMouseEnter={() => setOpenSection(idx)}
                  onMouseLeave={() =>
                    setOpenSection((current) => (current === idx ? null : current))
                  }
                >
                  <div
                    className={cn(
                      "cursor-pointer flex items-center justify-between px-5 py-4 rounded-xl bg-black/20 border border-white/10 backdrop-blur-md group transition-all duration-300",
                      openSection === idx
                        ? "shadow-2xl scale-105 border-cyan-400/50"
                        : "hover:border-cyan-400/30"
                    )}
                    tabIndex={0}
                    aria-expanded={openSection === idx}
                  >
                    <div className="flex items-center text-white text-lg font-medium">
                      {section.icon}
                      {section.title}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 ml-2 text-cyan-400 transition-transform duration-200",
                        openSection === idx && "rotate-180"
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-5 pb-6 pt-2 rounded-b-xl bg-black/30 border-x border-b border-white/10 text-white/80 animate-fade-in">
                    {section.content}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
