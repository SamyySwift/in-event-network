import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, ArrowLeft, Star, Sparkles, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LiveStreamViewer } from '@/components/attendee/LiveStreamViewer';
import { useLiveStream } from '@/hooks/useLiveStream';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';
import { AttendeeEventProvider } from '@/contexts/AttendeeEventContext';
import AppLayout from '@/components/layouts/AppLayout';

function AttendeeLiveContent() {
  const navigate = useNavigate();
  const { currentEventId } = useAttendeeEventContext();
  const { liveStreamUrl, isLive, isLoading } = useLiveStream(currentEventId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Radio className="w-16 h-16 text-red-500" />
        </motion.div>
      </div>
    );
  }

  if (!isLive || !liveStreamUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-100 via-pink-100 to-yellow-100">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-20 left-10 w-12 h-12 bg-yellow-400 rounded-full opacity-60"
          />
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="absolute top-40 right-20 w-8 h-8 bg-cyan-400 rounded-full opacity-60"
          />
          <motion.div
            animate={{ y: [0, -25, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            className="absolute bottom-40 left-20 w-10 h-10 bg-pink-400 rounded-full opacity-60"
          />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center z-10"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-6"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-500 border-4 border-red-700 rounded-full shadow-xl">
              <Radio className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <h1 className="text-3xl font-black text-red-600 mb-3">📺 No Live Stream</h1>
          <p className="text-lg font-bold text-red-500 mb-6">
            There's no live broadcast right now.<br />
            Check back later! 🎬
          </p>

          <Button
            onClick={() => navigate('/attendee')}
            className="bg-red-500 hover:bg-red-600 text-white font-black text-lg px-8 py-6 rounded-xl border-4 border-red-700 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-pink-100 to-yellow-100 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-300 rounded-full opacity-30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-300 rounded-full opacity-30"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/attendee')}
            className="bg-white/80 hover:bg-white text-red-600 font-bold rounded-xl border-2 border-red-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl border-2 border-red-400">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Circle className="w-3 h-3 text-red-500 fill-red-500" />
            </motion.div>
            <span className="font-black text-red-600">LIVE NOW</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-yellow-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Stream viewer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <LiveStreamViewer 
            streamUrl={liveStreamUrl} 
            onBack={() => navigate('/attendee')}
            showBackButton={false}
          />
        </motion.div>

        {/* Fun bottom section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 px-6 py-3 rounded-xl border-2 border-yellow-400">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-gray-700">Enjoy the show! 🎉</span>
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AttendeeLive() {
  return (
    <AttendeeEventProvider>
      <AttendeeRouteGuard>
        <AppLayout>
          <AttendeeLiveContent />
        </AppLayout>
      </AttendeeRouteGuard>
    </AttendeeEventProvider>
  );
}
