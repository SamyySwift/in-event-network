import React from "react";
import { Instagram, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const LandingFooter: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-stone-100 border-t border-stone-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img
                src="/logo.png"
                alt="Kconect Logo"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-stone-900">kconect</span>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed">
              Making event management simple, beautiful, and connected.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-stone-900 mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <Link
                  to="/guide"
                  className="text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/discovery"
                  className="text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Discovery
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-stone-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy"
                  className="text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-stone-900 mb-4">Connect</h3>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/__kconect"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-stone-200 hover:bg-stone-300 rounded-full flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-stone-700" />
              </a>
              <a
                href="mailto:Kconect.com@gmail.com"
                className="w-10 h-10 bg-stone-200 hover:bg-stone-300 rounded-full flex items-center justify-center transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5 text-stone-700" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-sm">
            © 2025 Kconect. All rights reserved.
          </p>
          <p className="text-stone-400 text-sm">
            Made with ❤️ for event creators
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
