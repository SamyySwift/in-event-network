import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Clock, Star, Sparkles, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface QuizResultsProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  totalTime: number;
  onClose: () => void;
}

export const QuizResults = ({
  score,
  correctAnswers,
  totalQuestions,
  totalTime,
  onClose,
}: QuizResultsProps) => {
  const percentage = (correctAnswers / totalQuestions) * 100;

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (percentage >= 80) {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 250);
    }
  }, [percentage]);

  const getMessage = () => {
    if (percentage === 100) return 'PERFECT! You are a SUPERSTAR!';
    if (percentage >= 80) return 'WOW! Amazing Job!';
    if (percentage >= 60) return 'Great Work! Keep Going!';
    if (percentage >= 40) return 'Good Try! Practice More!';
    return 'Never Give Up! Try Again!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-purple-500/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      {/* Animated background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-20 left-10 w-12 h-12 bg-yellow-400 rounded-full"
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute top-32 right-16 w-10 h-10 bg-pink-400 rounded-full"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-40 left-20 w-8 h-8 bg-green-400 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2.8 }}
          className="absolute bottom-32 right-12 w-14 h-14 bg-cyan-400 rounded-full"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute top-40 left-1/4"
        >
          <Star className="w-10 h-10 text-yellow-300 fill-yellow-300" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
          className="absolute bottom-48 right-1/4"
        >
          <Star className="w-8 h-8 text-orange-300 fill-orange-300" />
        </motion.div>
      </div>

      <Card className="w-full max-w-md bg-cyan-400 border-4 border-blue-500 shadow-[8px_8px_0px_0px_rgba(59,130,246,0.5)] overflow-hidden">
        <CardHeader className="text-center space-y-4 bg-yellow-400 border-b-4 border-yellow-600 pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="mx-auto w-24 h-24 bg-orange-400 border-4 border-orange-600 rounded-full flex items-center justify-center shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Trophy className="w-14 h-14 text-yellow-200" />
            </motion.div>
          </motion.div>
          <CardTitle className="text-2xl font-black text-orange-700 flex items-center justify-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}>
              <PartyPopper className="w-8 h-8 text-red-500" />
            </motion.div>
            {getMessage()}
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.25 }}>
              <PartyPopper className="w-8 h-8 text-red-500" />
            </motion.div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-4 bg-pink-400 border-3 border-pink-600 rounded-2xl shadow-[4px_4px_0px_0px_rgba(219,39,119,0.5)]"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Star className="w-10 h-10 text-yellow-300 fill-yellow-300 mx-auto mb-2" />
              </motion.div>
              <div className="text-4xl font-black text-white">{score}</div>
              <div className="text-sm font-bold text-pink-100">Total Score</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-4 bg-green-400 border-3 border-green-600 rounded-2xl shadow-[4px_4px_0px_0px_rgba(34,197,94,0.5)]"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Target className="w-10 h-10 text-white mx-auto mb-2" />
              </motion.div>
              <div className="text-4xl font-black text-white">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-sm font-bold text-green-100">Correct</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center p-4 bg-purple-400 border-3 border-purple-600 rounded-2xl shadow-[4px_4px_0px_0px_rgba(147,51,234,0.5)]"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <Clock className="w-10 h-10 text-white mx-auto mb-2" />
            </motion.div>
            <div className="text-3xl font-black text-white">{totalTime}s</div>
            <div className="text-sm font-bold text-purple-100">Total Time</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative pt-2"
          >
            <div className="overflow-hidden h-6 text-xs flex rounded-full bg-white border-3 border-blue-400">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-400"
              />
            </div>
            <div className="text-center mt-3 font-black text-xl text-white bg-blue-500 rounded-full py-2 border-3 border-blue-700">
              {percentage.toFixed(0)}% Accuracy
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={onClose} 
              className="w-full h-14 bg-green-500 hover:bg-green-600 border-4 border-green-700 shadow-[4px_4px_0px_0px_rgba(21,128,61,0.5)] font-black text-xl text-white"
              size="lg"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              View Leaderboard
              <Sparkles className="w-6 h-6 ml-2" />
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
