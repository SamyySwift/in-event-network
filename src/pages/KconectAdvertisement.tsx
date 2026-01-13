import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DigitalSignage3D = lazy(() => import("@/components/advertisement/DigitalSignage3D"));

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  },
};

const locations = [
  { name: "Shopping Malls", reach: "5M+ daily views" },
  { name: "Airports", reach: "2M+ daily views" },
  { name: "Corporate Buildings", reach: "1M+ daily views" },
  { name: "Transit Hubs", reach: "8M+ daily views" },
  { name: "Event Venues", reach: "500K+ daily views" },
  { name: "Public Spaces", reach: "3M+ daily views" },
];

const features = [
  { title: "Strategic Placement", description: "Premium locations at eye-level in high-traffic areas across major cities." },
  { title: "Real-time Analytics", description: "Track impressions, engagement metrics, and campaign ROI with live dashboards." },
  { title: "Flexible Scheduling", description: "Run campaigns by time of day, week, or sync with special events." },
  { title: "Instant Updates", description: "Change your content in seconds across all display locations." },
];

const packages = [
  { 
    name: "Starter", 
    price: "₦500K", 
    period: "/month",
    features: ["5 Display Locations", "Basic Analytics", "Weekly Content Updates", "Email Support"],
  },
  { 
    name: "Business", 
    price: "₦1.5M", 
    period: "/month",
    features: ["20 Display Locations", "Advanced Analytics", "Daily Content Updates", "Priority Support", "Custom Scheduling"],
    featured: true,
  },
  { 
    name: "Enterprise", 
    price: "Custom", 
    period: "",
    features: ["Unlimited Locations", "Real-time Analytics", "Instant Updates", "Dedicated Manager", "API Access"],
  },
];

export default function KconectAdvertisement() {
  const navigate = useNavigate();

  const handleContact = () => {
    const message = encodeURIComponent("Hello! I'm interested in Kconect Digital Signage advertising. Please provide more information.");
    window.open(`https://wa.me/2349068982251?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="text-sm font-medium text-gray-500 tracking-wide uppercase mb-4"
          >
            Digital Signage
          </motion.p>
          
          <motion.h1
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-semibold text-black tracking-tight mb-6"
          >
            Reach millions.
            <br />
            <span className="text-gray-400">Effortlessly.</span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto mb-10"
          >
            Transform your brand visibility with our premium digital signage network across malls, airports, and transit hubs.
          </motion.p>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={handleContact}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full px-8 py-6 text-lg font-medium"
            >
              Get started
              <ChevronRight className="ml-1 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-[#0071e3] hover:text-[#0077ed] rounded-full px-8 py-6 text-lg font-medium"
            >
              Learn more
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 3D Display Section */}
      <section className="py-16 px-6 bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Suspense fallback={
              <div className="w-full h-[400px] md:h-[500px] rounded-3xl bg-white flex items-center justify-center">
                <div className="text-gray-400">Loading display...</div>
              </div>
            }>
              <DigitalSignage3D />
            </Suspense>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "20M+", label: "Daily Impressions" },
              { value: "500+", label: "Display Locations" },
              { value: "50+", label: "Cities" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-semibold text-black mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-semibold text-black mb-4">
              Why Kconect
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Everything you need to run impactful advertising campaigns.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8"
              >
                <h3 className="text-xl font-semibold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-semibold text-black mb-4">
              Premium Locations
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Strategic placement in high-traffic areas.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#f5f5f7] rounded-2xl p-6 hover:bg-[#e8e8ed] transition-colors"
              >
                <h3 className="text-lg font-semibold text-black mb-1">{location.name}</h3>
                <p className="text-gray-500 text-sm">{location.reach}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-semibold text-black mb-4">
              Advertising Packages
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Flexible plans for every budget.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {packages.map((pkg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-8 ${
                  pkg.featured 
                    ? 'bg-black text-white' 
                    : 'bg-white'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-2 ${pkg.featured ? 'text-white' : 'text-black'}`}>
                  {pkg.name}
                </h3>
                <div className="flex items-baseline mb-6">
                  <span className={`text-4xl font-semibold ${pkg.featured ? 'text-white' : 'text-black'}`}>
                    {pkg.price}
                  </span>
                  <span className={`ml-1 ${pkg.featured ? 'text-gray-400' : 'text-gray-500'}`}>
                    {pkg.period}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, j) => (
                    <li key={j} className={`flex items-center text-sm ${pkg.featured ? 'text-gray-300' : 'text-gray-600'}`}>
                      <Check className={`h-4 w-4 mr-3 ${pkg.featured ? 'text-white' : 'text-black'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={handleContact}
                  className={`w-full rounded-full py-6 ${
                    pkg.featured 
                      ? 'bg-white text-black hover:bg-gray-100' 
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  Get started
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold text-black mb-6"
          >
            Ready to amplify your brand?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 mb-10"
          >
            Get in touch with our team today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button
              size="lg"
              onClick={handleContact}
              className="bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full px-10 py-6 text-lg font-medium"
            >
              Contact Sales
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200">
        <div className="max-w-5xl mx-auto text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Kconect. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
