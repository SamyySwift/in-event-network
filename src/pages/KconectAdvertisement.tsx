import { motion } from "framer-motion";
import { 
  Monitor, 
  MapPin, 
  BarChart3, 
  Zap, 
  Building2, 
  Plane, 
  ShoppingBag, 
  Train, 
  Users, 
  Eye,
  ArrowRight,
  Sparkles,
  Globe,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.2 + i * 0.1,
      ease: [0.25, 0.4, 0.25, 1],
    },
  }),
};

const locations = [
  { icon: ShoppingBag, name: "Shopping Malls", reach: "5M+ Daily", description: "Premium screens in high-traffic retail spaces" },
  { icon: Plane, name: "Airports", reach: "2M+ Daily", description: "Captivate travelers at departure gates" },
  { icon: Building2, name: "Corporate Buildings", reach: "1M+ Daily", description: "Reach business professionals" },
  { icon: Train, name: "Transit Hubs", reach: "8M+ Daily", description: "Bus stops, train stations, metro systems" },
  { icon: Users, name: "Event Venues", reach: "500K+ Daily", description: "Stadiums, concert halls, conferences" },
  { icon: Globe, name: "Public Spaces", reach: "3M+ Daily", description: "Parks, squares, entertainment districts" },
];

const features = [
  { icon: Eye, title: "Maximum Visibility", description: "Strategic placement at eye-level in high-footprint areas" },
  { icon: BarChart3, title: "Real-time Analytics", description: "Track impressions, engagement, and ROI live" },
  { icon: Clock, title: "Flexible Scheduling", description: "Run campaigns by time of day or special events" },
  { icon: Zap, title: "Instant Updates", description: "Change content in real-time across all displays" },
];

const packages = [
  { 
    name: "Starter", 
    price: "₦500K", 
    period: "/month",
    features: ["5 Display Locations", "Basic Analytics", "Weekly Content Updates", "Email Support"],
    popular: false 
  },
  { 
    name: "Business", 
    price: "₦1.5M", 
    period: "/month",
    features: ["20 Display Locations", "Advanced Analytics", "Daily Content Updates", "Priority Support", "Custom Scheduling"],
    popular: true 
  },
  { 
    name: "Enterprise", 
    price: "Custom", 
    period: "",
    features: ["Unlimited Locations", "Real-time Analytics", "Instant Updates", "Dedicated Manager", "API Access", "White-label Options"],
    popular: false 
  },
];

export default function KconectAdvertisement() {
  const navigate = useNavigate();

  const handleContact = () => {
    const message = encodeURIComponent("Hello! I'm interested in Kconect Digital Signage advertising. Please provide more information about your packages and available locations.");
    window.open(`https://wa.me/2349068982251?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] via-transparent to-pink-500/[0.05] blur-3xl" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        {/* Floating Shapes */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] w-32 h-32 bg-gradient-to-br from-amber-500/20 to-transparent rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[30%] right-[15%] w-48 h-48 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[25%] w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-xl"
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm text-amber-300 tracking-wide">Digital Signage Solutions</span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
              Captivate Audiences at
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400">
              High Footprint Areas
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-lg md:text-xl text-white/60 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Transform your brand visibility with Kconect's digital signage network. 
            Reach millions of potential customers across malls, airports, transit hubs, and event venues.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={handleContact}
              className="bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white shadow-2xl shadow-amber-500/30 border-0 px-8 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/")}
              className="border border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-xl px-8 py-6 rounded-full text-lg"
            >
              Back to Home
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: "20M+", label: "Daily Impressions" },
              { value: "500+", label: "Display Locations" },
              { value: "50+", label: "Cities Covered" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white/60 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-transparent" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Kconect</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Cutting-edge digital signage technology with unmatched reach and analytics
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-pink-400">Locations</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Strategic placement in high-traffic areas across major cities
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all duration-300"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-pink-500/20 flex items-center justify-center">
                      <location.icon className="h-6 w-6 text-amber-400" />
                    </div>
                    <span className="text-xs font-medium text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full">
                      {location.reach}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{location.name}</h3>
                  <p className="text-white/50 text-sm">{location.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-transparent" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Advertising <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Packages</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Flexible plans designed to fit your marketing budget
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative p-8 rounded-3xl backdrop-blur-sm transition-all duration-300 ${
                  pkg.popular 
                    ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 scale-105' 
                    : 'bg-white/[0.03] border border-white/10 hover:border-white/20'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-medium text-white">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-xl font-semibold text-white mb-2">{pkg.name}</h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-white">{pkg.price}</span>
                  <span className="text-white/50 ml-1">{pkg.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, j) => (
                    <li key={j} className="flex items-center text-white/70 text-sm">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={handleContact}
                  className={`w-full py-6 rounded-xl transition-all duration-300 ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  Get Started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl bg-gradient-to-br from-purple-500/20 via-pink-500/10 to-amber-500/20 border border-white/10 backdrop-blur-xl text-center overflow-hidden"
          >
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <Monitor className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Amplify Your Brand?
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                Contact us today to discuss your advertising goals and get a customized quote for your campaign.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleContact}
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-2xl shadow-purple-500/30 px-10 py-6 text-lg rounded-full"
                >
                  Contact Sales
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="border border-white/20 bg-white/5 text-white hover:bg-white/10 px-10 py-6 rounded-full text-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Kconect Digital Signage. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
}
