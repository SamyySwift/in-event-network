import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, Rocket, Star, Mail, MessageCircle } from "lucide-react";

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 sm:py-28 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-pink-600 bg-pink-50 rounded-full px-4 py-1.5 mb-4"
          >
            Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-stone-600 max-w-2xl mx-auto"
          >
            Everything you need to create amazing events, with plans that grow with you.
          </motion.p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {/* Standard Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300"
          >
            <div className="inline-flex items-center gap-2 bg-stone-100 rounded-full px-3 py-1 mb-6">
              <span className="text-sm font-medium text-stone-700">Standard</span>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-stone-900">Free</span>
            </div>
            
            <p className="text-stone-600 mb-8">Perfect for getting started with your first events.</p>
            
            <div className="space-y-4 mb-8">
              {[
                "Create unlimited events",
                "Sell free or paid tickets",
                "QR code check-in",
                "Discovery page listing",
                "Email support",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span className="text-stone-700">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button
              className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-full py-6"
              onClick={() => navigate("/register?role=host")}
            >
              Get Started Free
            </Button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-stone-900 rounded-2xl p-8 text-white relative overflow-hidden lg:scale-105 shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 blur-2xl" />
            
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-6">
                <Rocket className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-white">Premium</span>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Pro</span>
              </div>
              
              <p className="text-stone-400 mb-8">Full-featured event management for serious hosts.</p>
              
              <div className="space-y-4 mb-8">
                {[
                  "Everything in Standard",
                  "Live Q&A and polls",
                  "AI-powered networking",
                  "Event highlights & media",
                  "Sponsor & vendor management",
                  "Bulk check-in",
                  "Priority support",
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-indigo-400" />
                    </div>
                    <span className="text-stone-300">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button
                className="w-full bg-white text-stone-900 hover:bg-stone-100 rounded-full py-6"
                onClick={() => navigate("/register?role=host")}
              >
                Start Premium
              </Button>
            </div>
          </motion.div>

          {/* Custom Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300"
          >
            <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-3 py-1 mb-6">
              <Star className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Custom</span>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-bold text-stone-900">Tailored</span>
            </div>
            
            <p className="text-stone-600 mb-8">White-glove service with on-site support.</p>
            
            <div className="space-y-4 mb-8">
              {[
                "Everything in Premium",
                "Dedicated account manager",
                "On-site setup personnel",
                "Registration staff",
                "VIP coordination",
                "Custom integrations",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-amber-600" />
                  </div>
                  <span className="text-stone-700">{feature}</span>
                </div>
              ))}
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-stone-300 text-stone-700 hover:bg-stone-100 rounded-full py-6"
                >
                  Contact Sales
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Contact Sales</DialogTitle>
                  <DialogDescription>
                    Choose how you'd like to reach us.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button asChild className="w-full">
                    <a
                      href="https://wa.me/2349068982251"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </a>
                  </Button>
                  <Button variant="secondary" asChild className="w-full">
                    <a
                      href="mailto:kconect.com@gmail.com?subject=Custom%20Plan%20Enquiry"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </a>
                  </Button>
                </div>
                <DialogFooter className="sm:justify-start">
                  <p className="text-xs text-muted-foreground">We'll get back to you quickly.</p>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
