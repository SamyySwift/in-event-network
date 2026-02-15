import React from "react";
import { Network, Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const LandingFooter: React.FC = () => {
  // Smooth scroll function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-black/40 backdrop-blur-xl border-t border-white/10 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="/event-connect-logo.png"
                alt="Event-connect Logo"
                className="h-8 w-auto object-cover"
              />
              <span className="text-xl font-bold text-cyan-400">Event-connect</span>
            </div>
            <p className="text-white/60 text-sm">
              Enhancing event networking through smart connections and intuitive
              technology.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-white/60 hover:text-cyan-400 transition-colors text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-white/60 hover:text-cyan-400 transition-colors text-left"
                >
                  Pricing
                </button>
              </li>
              <li>
                <Link
                  to="/guide"
                  className="text-white/60 hover:text-cyan-400 transition-colors"
                >
                  Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy"
                  className="text-white/60 hover:text-cyan-400 transition-colors"
                >
                  Data Privacy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-white/60 hover:text-cyan-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/40 text-sm">
            © 2025 Connect Events. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="https://instagram.com/__kconect"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-cyan-400 transition-colors"
              aria-label="Instagram"
            >
              <span className="sr-only">Instagram</span>
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="mailto:Kconect.com@gmail.com"
              className="text-white/40 hover:text-cyan-400 transition-colors"
              aria-label="Mail"
            >
              <span className="sr-only">Mail</span>
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
