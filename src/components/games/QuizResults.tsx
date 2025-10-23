import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Clock, Star } from 'lucide-react';
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
    if (percentage === 100) return '🎉 Perfect Score! Amazing!';
    if (percentage >= 80) return '🌟 Excellent Work!';
    if (percentage >= 60) return '👍 Good Job!';
    if (percentage >= 40) return '💪 Keep Practicing!';
    return '📚 Don\'t Give Up!';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2 bg-gradient-to-br from-primary/10 to-secondary/10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <CardTitle className="text-3xl font-bold">{getMessage()}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-4 bg-primary/10 rounded-lg"
            >
              <Star className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-3xl font-bold text-primary">{score}</div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-4 bg-secondary/10 rounded-lg"
            >
              <Target className="w-6 h-6 text-secondary mx-auto mb-2" />
              <div className="text-3xl font-bold text-secondary">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center p-4 bg-accent/10 rounded-lg"
          >
            <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalTime}s</div>
            <div className="text-sm text-muted-foreground">Total Time</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative pt-2"
          >
            <div className="overflow-hidden h-4 text-xs flex rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-primary to-secondary"
              />
            </div>
            <div className="text-center mt-2 text-sm font-semibold">
              {percentage.toFixed(0)}% Accuracy
            </div>
          </motion.div>

          <Button onClick={onClose} className="w-full" size="lg">
            View Leaderboard
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
