import { Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Clock, Zap, Building2, Plane, Train, Users, TreePine } from 'lucide-react';

const DigitalSignage3D = lazy(() => import('@/components/advertisement/DigitalSignage3D'));

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const locations = [
  { 
    name: 'Shopping Malls', 
    reach: 'Thousands daily',
    icon: Building2,
    description: 'Premium retail environments'
  },
  { 
    name: 'Airports', 
    reach: 'Thousands daily',
    icon: Plane,
    description: 'High-value travelers'
  },
  { 
    name: 'Transit Hubs', 
    reach: 'Thousands daily',
    icon: Train,
    description: 'Daily commuters'
  },
  { 
    name: 'Event Venues', 
    reach: 'Hundreds daily',
    icon: Users,
    description: 'Engaged audiences'
  },
  { 
    name: 'Corporate Districts', 
    reach: 'Hundreds daily',
    icon: Building2,
    description: 'Business professionals'
  },
  { 
    name: 'Public Spaces', 
    reach: 'Thousands daily',
    icon: TreePine,
    description: 'Diverse demographics'
  },
];

const KconectAdvertisement = () => {
  const handleContact = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in advertising on Kconect Digital Signage. I'd like to learn more about available locations and pricing.`
    );
    window.open(`https://wa.me/2349068982251?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex flex-col justify-center items-center px-6 relative overflow-hidden">
        <motion.div 
          className="text-center max-w-5xl mx-auto z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold tracking-tighter text-black leading-[0.9]">
            Your brand.
            <br />
            <span className="text-gray-400">Everywhere.</span>
          </h1>
          
          <p className="mt-8 text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto font-light">
            Reach thousands of people daily across premium locations with stunning digital displays.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleContact}
              className="bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full px-8 py-6 text-lg font-medium"
            >
              Get started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              className="border-gray-300 text-gray-900 hover:bg-gray-50 rounded-full px-8 py-6 text-lg font-medium"
              onClick={() => document.getElementById('locations')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See locations
            </Button>
          </div>
        </motion.div>

        {/* 3D Display - Hero */}
        <motion.div 
          className="w-full max-w-4xl mx-auto mt-16 h-[400px] md:h-[500px]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0071e3] rounded-full animate-spin" />
            </div>
          }>
            <DigitalSignage3D />
          </Suspense>
        </motion.div>
      </section>

      {/* Immersive Statement */}
      <section className="py-32 md:py-48 bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-black"
            {...fadeIn}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            See your message on
            <br />
            <span className="text-gray-400">the biggest screens.</span>
          </motion.h2>
          <motion.p 
            className="mt-8 text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            High-impact digital displays in the locations that matter most to your brand.
          </motion.p>
        </div>
      </section>

      {/* Locations Grid */}
      <section id="locations" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="text-center mb-20"
            {...fadeIn}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-black">
              Where your audience is.
            </h2>
            <p className="mt-6 text-xl text-gray-500">
              Premium placements across high-traffic locations.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {locations.map((location) => {
              const IconComponent = location.icon;
              return (
                <motion.div
                  key={location.name}
                  variants={fadeIn}
                  className="group p-8 rounded-3xl bg-[#f5f5f7] hover:bg-[#e8e8ed] transition-colors duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="text-2xl font-semibold text-black mb-2">
                    {location.name}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {location.description}
                  </p>
                  <p className="text-sm font-medium text-[#0071e3]">
                    {location.reach}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Feature Section 1 - Strategic Placement */}
      <section className="py-32 bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeIn}
              viewport={{ once: true }}
              whileInView="animate"
              initial="initial"
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm">
                <MapPin className="h-8 w-8 text-gray-700" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-black mb-6">
                Strategic placement.
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed">
                Your advertisements appear in carefully selected high-traffic areas where your target audience spends their time. From shopping centers to transit hubs, we position your brand where it matters.
              </p>
            </motion.div>
            <motion.div
              className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <MapPin className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Prime locations</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 - Flexible Scheduling */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center order-2 lg:order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <Clock className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Your schedule</p>
              </div>
            </motion.div>
            <motion.div
              className="order-1 lg:order-2"
              {...fadeIn}
              viewport={{ once: true }}
              whileInView="animate"
              initial="initial"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#f5f5f7] flex items-center justify-center mb-8">
                <Clock className="h-8 w-8 text-gray-700" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-black mb-6">
                Flexible scheduling.
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed">
                Run your campaigns when they'll have the most impact. Choose specific times, days, or run continuously. Full control over when your message appears.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section 3 - Instant Updates */}
      <section className="py-32 bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeIn}
              viewport={{ once: true }}
              whileInView="animate"
              initial="initial"
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm">
                <Zap className="h-8 w-8 text-gray-700" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-black mb-6">
                Instant updates.
              </h2>
              <p className="text-xl text-gray-500 leading-relaxed">
                Change your content in real-time. Launch new campaigns, update messaging, or respond to current events instantly across all your displays.
              </p>
            </motion.div>
            <motion.div
              className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <Zap className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Real-time control</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 md:py-48 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            {...fadeIn}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-black mb-8">
              Get started today.
            </h2>
            <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
              Connect with our team to find the perfect advertising solution for your brand.
            </p>
            <Button 
              onClick={handleContact}
              className="bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full px-10 py-7 text-xl font-medium"
            >
              Contact sales
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 bg-[#f5f5f7] border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Kconect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default KconectAdvertisement;