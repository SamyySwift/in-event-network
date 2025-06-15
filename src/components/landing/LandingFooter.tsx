
import React from "react";
import { Network, Instagram, Mail, Linkedin } from "lucide-react";
import XLogo from "@/components/icons/XLogo";

const LandingFooter: React.FC = () => (
  <footer className="bg-black/40 backdrop-blur-xl border-t border-white/10 py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Network className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">kconect</span>
          </div>
          <p className="text-white/60 text-sm">
            Enhancing event networking through smart connections and intuitive technology.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4 text-white">Events</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="text-white/60 hover:text-cyan-400 transition-colors">
                Pricing
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4 text-white">Legal</h3>
          <ul className="space-y-2">
            <li>
              <a href="/privacy" className="text-white/60 hover:text-cyan-400 transition-colors">
                Data Privacy
              </a>
            </li>
            <li>
              <a href="/terms" className="text-white/60 hover:text-cyan-400 transition-colors">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-white/40 text-sm">
          © 2025 Connect Events. All rights reserved.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors" aria-label="Instagram">
            <span className="sr-only">Instagram</span>
            <Instagram className="h-5 w-5" />
          </a>
          <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors" aria-label="LinkedIn">
            <span className="sr-only">LinkedIn</span>
            <Linkedin className="h-5 w-5" />
          </a>
          <a href="#" className="text-white/40 hover:text-cyan-400 transition-colors" aria-label="X (formerly Twitter)">
            <span className="sr-only">X (formerly Twitter)</span>
            <XLogo size={20} className="h-5 w-5" />
          </a>
          <a href="mailto:support@kconnect.com" className="text-white/40 hover:text-cyan-400 transition-colors" aria-label="Mail">
            <span className="sr-only">Mail</span>
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
