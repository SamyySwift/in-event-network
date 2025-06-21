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
import { Check, Rocket, Star } from "lucide-react";

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

        <div className="max-w-md mx-auto">
          {/* Premium Plan - Single Card */}
          <div className="max-w-md mx-auto sm:max-w-sm md:max-w-md lg:max-w-lg">
            <Card className="relative group bg-white/10 backdrop-blur-xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-xl">
              <div className="absolute top-0 right-0">
                <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs sm:text-sm font-semibold px-3 py-2 rounded-bl-xl rounded-tr-sm">
                  Professional Plan
                </div>
              </div>

              <CardHeader className="text-center pb-6 pt-10 relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl text-white mb-2 font-bold">
                  Premium Plan
                </CardTitle>
                <CardDescription className="text-white/70 text-base sm:text-lg">
                  Complete solution for professional events
                </CardDescription>
                <div className="flex items-center justify-center mt-6">
                  <span className="text-xl sm:text-3xl font-bold text-white/60 line-through decoration-2 mr-4">
                    ₦100,000
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    ₦30,000
                  </span>
                  <span className="text-white/70 ml-2 text-base sm:text-lg">
                    / per event
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10 px-6 sm:px-8 pb-6 sm:pb-8">
                {/* Features – Reduce text size on smaller screens */}
                <div className="space-y-3 sm:space-y-3">
                  {[
                    "Unlimited attendees",
                    "AI-powered smart matching",
                    "Real-time analytics dashboard",
                    "Interactive Q&A sessions",
                    "Real-time attendee messaging",
                    "24/7 premium support",
                  ].map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 sm:space-x-4"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="text-white h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <span className="text-white/90 text-sm sm:text-base">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-xl py-4 sm:py-6 text-lg sm:text-xl font-semibold transform hover:scale-105 transition-all duration-200 mt-6"
                  onClick={() => navigate("/register?role=host")}
                >
                  <Rocket className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  Get Started Today
                </Button>

                <p className="text-center text-white/60 text-sm sm:text-base mt-2 sm:mt-4">
                  30-day money-back guarantee
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
