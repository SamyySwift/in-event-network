import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Star, Zap, PartyPopper } from 'lucide-react';

interface GameCelebrationProps {
  show: boolean;
  points: number;
  timeSeconds: number;
  onClose: () => void;
}

export const GameCelebration = ({ show, points, timeSeconds, onClose }: GameCelebrationProps) => {
  useEffect(() => {
    if (show) {
      // Fire confetti
      const duration = 4000;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 60 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 35,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.9),
            y: Math.random() - 0.2
          },
          colors: ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff', '#0088ff', '#ff00ff', '#ff0088']
        });
      }, 200);

      // Auto close after celebration
      const timeout = setTimeout(() => {
        onClose();
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.3, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.5 }}
        className="bg-cyan-400 border-8 border-blue-600 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md mx-4 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-4 left-4 w-8 h-8 bg-yellow-400 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            className="absolute top-6 right-6 w-6 h-6 bg-pink-500 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
            className="absolute bottom-8 left-8 w-5 h-5 bg-green-500 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: 0.6 }}
            className="absolute bottom-10 right-10 w-4 h-4 bg-purple-500 rounded-full"
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute top-12 left-1/3"
          >
            <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            className="absolute bottom-16 right-1/4"
          >
            <Star className="w-4 h-4 text-red-500 fill-red-500" />
          </motion.div>
        </div>

        {/* Trophy */}
        <motion.div
          animate={{ 
            rotate: [0, -15, 15, -15, 15, 0],
            scale: [1, 1.2, 1, 1.2, 1]
          }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-6 flex justify-center relative"
        >
          <div className="bg-yellow-400 p-6 rounded-full shadow-lg border-6 border-yellow-600">
            <Trophy className="w-16 h-16 text-yellow-800" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl sm:text-4xl font-black mb-4 text-blue-800"
        >
          🎉 AMAZING! 🎉
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg font-bold text-blue-700 mb-6"
        >
          You completed the puzzle! 🧩
        </motion.p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="bg-green-500 p-4 rounded-xl shadow-lg border-4 border-green-700"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-bold text-green-100">Points</span>
            </div>
            <p className="text-3xl font-black text-white">{points}</p>
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="bg-purple-500 p-4 rounded-xl shadow-lg border-4 border-purple-700"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-bold text-purple-100">Time</span>
            </div>
            <p className="text-3xl font-black text-white">{timeSeconds}s</p>
          </motion.div>
        </div>

        {/* Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="px-8 py-4 bg-orange-500 text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-shadow border-4 border-orange-700"
        >
          🌟 Awesome! 🌟
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
