
import React, { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Shield, User, Book, ClipboardList, Lock, Scale, Clock, FileText, ChevronDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const TERMS_SECTIONS = [
  {
    icon: <FileText className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "Service Agreement",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>By using Kconnect, you agree to these terms and all applicable laws.</li>
        <li>The platform reserves the right to update these terms at any point.</li>
        <li>Continued use of the service implies acceptance of any changes.</li>
      </ul>
    ),
  },
  {
    icon: <User className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "User Accounts",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>Users must provide accurate information when creating accounts.</li>
        <li>You are responsible for all activity under your account and keeping your credentials safe.</li>
        <li>The platform may suspend or terminate accounts violating these terms.</li>
      </ul>
    ),
  },
  {
    icon: <ClipboardList className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "Event Management",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>Event hosts are responsible for the management and content of their events.</li>
        <li>Attendees agree to abide by event-specific rules and codes of conduct.</li>
        <li>Misuse of event features may result in suspension or removal.</li>
      </ul>
    ),
  },
  {
    icon: <Shield className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "User Conduct",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>Users must treat others with respect and may not harass, spam, or abuse other users.</li>
        <li>Prohibited activities include hacking, reverse engineering, or using the service for illegal purposes.</li>
        <li>Violations are grounds for immediate account suspension.</li>
      </ul>
    ),
  },
  {
    icon: <Book className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "Intellectual Property",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>Kconnect and its content are protected by copyright and trademark laws.</li>
        <li>You may not reproduce, modify, or distribute any content from this platform without permission.</li>
      </ul>
    ),
  },
  {
    icon: <Lock className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "Privacy & Data Handling",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>We process personal data as described in our <a className="text-cyan-400 underline" href="/privacy">Privacy Policy</a>.</li>
        <li>You may control your privacy settings through your profile.</li>
      </ul>
    ),
  },
  {
    icon: <Scale className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "Liability & Disclaimers",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>Service is provided “as-is” with no warranties or guarantees.</li>
        <li>Kconnect is not liable for any damages resulting from event participation or use of the platform.</li>
      </ul>
    ),
  },
  {
    icon: <Clock className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "Termination of Access",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>We may suspend or terminate access for violation of terms at our discretion.</li>
        <li>You may delete your account at any time by contacting support.</li>
      </ul>
    ),
  },
  {
    icon: <ChevronDown className="rotate-12 text-cyan-400 h-5 w-5 mr-2" />,
    title: "Changes to Terms",
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>We may revise these terms; changes take effect upon posting to the platform.</li>
        <li>We encourage users to review terms regularly.</li>
      </ul>
    ),
  },
  {
    icon: <Mail className="text-cyan-400 h-5 w-5 mr-2" />,
    title: "Contact Us",
    content: (
      <div>
        Questions or concerns? Email&nbsp;
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

export default function TermsOfService() {
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
            Terms of Service
          </h1>
        </div>
      </header>
      <section className="flex flex-col items-center py-16 px-4">
        <div className="max-w-2xl w-full">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4 border border-white/20">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-white/80">
                Agreement & Guidelines
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Our Commitment & Expectations
            </h2>
            <p className="text-lg text-white/70">
              Please review these terms before using Kconnect. Your safety and experience matter to us.
            </p>
          </div>
          <div className="space-y-4">
            {TERMS_SECTIONS.map((section, idx) => (
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
