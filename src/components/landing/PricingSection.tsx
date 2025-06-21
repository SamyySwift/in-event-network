
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Rocket, Star } from 'lucide-react';

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

        <div className="max-w-lg mx-auto">
          {/* Premium Plan - Single Card */}
          <Card className="relative group bg-white/10 backdrop-blur-xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl shadow-xl">
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold px-4 py-3 rounded-bl-xl rounded-tr-xl">
                Professional Plan
              </div>
            </div>
            
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            
            <CardHeader className="text-center pb-8 relative z-10 pt-12">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl text-white mb-3 font-bold">Premium Plan</CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Complete solution for professional events
              </CardDescription>
              <div className="flex items-center justify-center mt-8">
                <span className="text-4xl font-bold text-white/60 line-through decoration-2 mr-4">
                  ₦100,000
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ₦30,000
                </span>
                <span className="text-white/70 ml-3 text-lg">/ per event</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 relative z-10 px-8 pb-8">
              <div className="space-y-5">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-sm h-4 w-4" />
                  </div>
                  <span className="text-white/90 text-lg">Unlimited attendees</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-sm h-4 w-4" />
                  </div>
                  <span className="text-white/90 text-lg">AI-powered smart matching</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-sm h-4 w-4" />
                  </div>
                  <span className="text-white/90 text-lg">Real-time analytics dashboard</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-sm h-4 w-4" />
                  </div>
                  <span className="text-white/90 text-lg">Interactive Q&A sessions</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-sm h-4 w-4" />
                  </div>
                  <span className="text-white/90 text-lg">Real-time attendee messaging</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-sm h-4 w-4" />
                  </div>
                  <span className="text-white/90 text-lg">24/7 premium support</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-2xl shadow-purple-500/30 py-6 text-xl font-semibold transform hover:scale-105 transition-all duration-200 mt-8"
                onClick={() => navigate("/register?role=host")}
              >
                <Rocket className="mr-3 h-6 w-6" />
                Get Started Today
              </Button>

              <p className="text-center text-white/60 text-base mt-4">
                30-day money-back guarantee
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
