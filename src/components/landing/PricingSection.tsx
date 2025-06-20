
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Rocket, Star, Zap, X } from 'lucide-react';

const PricingSection = () => {
  const navigate = useNavigate();

  return (
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
              Choose Your Plan
            </span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto">
            Start free or unlock premium features for professional events
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300">
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-400 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-white mb-2">Free Plan</CardTitle>
              <CardDescription className="text-white/60">
                Perfect for small events and getting started
              </CardDescription>
              <div className="flex items-center justify-center mt-6">
                <span className="text-4xl font-bold text-white">₦0</span>
                <span className="text-white/60 ml-2">/ forever</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-gray-500 to-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-xs h-3 w-3" />
                  </div>
                  <span className="text-white/80">Up to 50 attendees</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-gray-500 to-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-xs h-3 w-3" />
                  </div>
                  <span className="text-white/80">Basic networking features</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-gray-500 to-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-xs h-3 w-3" />
                  </div>
                  <span className="text-white/80">Event Q&A sessions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-gray-500 to-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-xs h-3 w-3" />
                  </div>
                  <span className="text-white/80">Basic analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <X className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-white/50 line-through">AI-powered smart matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <X className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="text-white/50 line-through">Priority support</span>
                </div>
              </div>

              <Button
                size="lg"
                variant="outline"
                className="w-full border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm py-4 text-lg font-semibold"
                onClick={() => navigate("/register?role=host")}
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Free
              </Button>

              <p className="text-center text-white/40 text-sm">
                No credit card required
              </p>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl">
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-semibold px-3 py-2 rounded-bl-xl rounded-tr-xl">
                Most Popular
              </div>
            </div>
            
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
            
            <CardHeader className="text-center pb-8 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-white mb-2">Premium Plan</CardTitle>
              <CardDescription className="text-white/60">
                Full-featured solution for professional events
              </CardDescription>
              <div className="flex items-center justify-center mt-6">
                <span className="text-3xl font-bold text-white/50 line-through decoration-2 mr-3">
                  ₦100,000
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ₦30,000
                </span>
                <span className="text-white/60 ml-2">/ per event</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-xs h-3 w-3" />
                  </div>
                  <span className="text-white/80">Unlimited attendees</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-xs h-3 w-3" />
                  </div>
                  <span className="text-white/80">AI-powered smart matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-xs h-3 w-3" />
                  </div>
                  <span className="text-white/80">Real-time analytics dashboard</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-xs h-3 w-3" />
                  </div>
                  <span className="text-white/80">Interactive Q&A sessions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-xs h-3 w-3" />
                  </div>
                  <span className="text-white/80">Real-time attendee messaging</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="text-white text-xs h-3 w-3" />
                  </div>
                  <span className="text-white/80">24/7 premium support</span>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-2xl shadow-purple-500/30 py-4 text-lg font-semibold transform hover:scale-105 transition-all duration-200"
                onClick={() => navigate("/register?role=host")}
              >
                <Rocket className="mr-2 h-5 w-5" />
                Get Started Today
              </Button>

              <p className="text-center text-white/40 text-sm">
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
