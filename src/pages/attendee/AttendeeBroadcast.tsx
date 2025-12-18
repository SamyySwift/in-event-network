import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, ArrowLeft, Star, Sparkles, Circle, Users, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiveStream } from '@/hooks/useLiveStream';
import { useAttendeeEventContext } from '@/contexts/AttendeeEventContext';
import AttendeeRouteGuard from '@/components/attendee/AttendeeRouteGuard';
import { AttendeeEventProvider } from '@/contexts/AttendeeEventContext';
import AppLayout from '@/components/layouts/AppLayout';
import { useAuth } from '@/contexts/AuthContext';

function AttendeeBroadcastContent() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentEventId } = useAttendeeEventContext();
  const { liveStreamUrl, isLive, isLoading } = useLiveStream(currentEventId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Video className="w-16 h-16 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  if (!isLive || !liveStreamUrl) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-20 left-10 w-12 h-12 bg-blue-400 rounded-full opacity-60"
          />
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            className="absolute top-40 right-20 w-8 h-8 bg-purple-400 rounded-full opacity-60"
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
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-500 border-4 border-blue-700 rounded-full shadow-xl">
              <Video className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <h1 className="text-3xl font-black text-blue-600 dark:text-blue-400 mb-3">📺 No Live Meeting</h1>
          <p className="text-lg font-bold text-blue-500 dark:text-blue-300 mb-6">
            There's no live broadcast right now.<br />
            Check back later! 🎬
          </p>

          <Button
            onClick={() => navigate('/attendee')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-black text-lg px-8 py-6 rounded-xl border-4 border-blue-700 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const displayName = currentUser?.name || 'Attendee';
  const jitsiUrl = `https://meet.jit.si/${liveStreamUrl}#config.prejoinPageEnabled=false&config.startWithVideoMuted=true&config.startWithAudioMuted=true&userInfo.displayName=${encodeURIComponent(displayName)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300 dark:bg-blue-800 rounded-full opacity-30"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-300 dark:bg-purple-800 rounded-full opacity-30"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-4"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/attendee')}
            className="bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 font-bold rounded-xl border-2 border-blue-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-xl border-2 border-green-400">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Circle className="w-3 h-3 text-green-500 fill-green-500" />
            </motion.div>
            <span className="font-black text-green-600 dark:text-green-400">LIVE MEETING</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <Users className="w-5 h-5 text-blue-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Jitsi Meeting Embed */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl overflow-hidden border-4 border-blue-400 shadow-2xl bg-black"
        >
          <iframe
            src={jitsiUrl}
            className="w-full aspect-video min-h-[400px] md:min-h-[500px] lg:min-h-[600px]"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            allowFullScreen
          />
        </motion.div>

        {/* Fun bottom section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-6 py-3 rounded-xl border-2 border-purple-400">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-gray-700 dark:text-gray-300">You're connected! 🎉</span>
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function AttendeeBroadcast() {
  return (
    <AttendeeEventProvider>
      <AttendeeRouteGuard>
        <AppLayout>
          <AttendeeBroadcastContent />
        </AppLayout>
      </AttendeeRouteGuard>
    </AttendeeEventProvider>
  );
}
