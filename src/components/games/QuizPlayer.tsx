import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import { QuizQuestion } from '@/hooks/useQuizGames';
import { useQuizAnswers } from '@/hooks/useQuizAnswers';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';

interface QuizPlayerProps {
  questions: QuizQuestion[];
  onComplete: (score: number, correctAnswers: number, totalTime: number) => void;
  currentQuestionIndex?: number;
  isLiveMode?: boolean;
  quizGameId?: string;
}

export const QuizPlayer = ({ 
  questions, 
  onComplete, 
  currentQuestionIndex: externalQuestionIndex, 
  isLiveMode = false,
  quizGameId 
}: QuizPlayerProps) => {
  const { currentUser } = useAuth();
  const { submitAnswer } = useQuizAnswers();
  const [internalQuestionIndex, setInternalQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(questions[0]?.time_limit || 20);
  const [totalTime, setTotalTime] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  // Use external index in live mode, internal otherwise
  const currentQuestionIndex = isLiveMode ? (externalQuestionIndex ?? 0) : internalQuestionIndex;

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    setTimeLeft(currentQuestion?.time_limit || 20);
  }, [currentQuestionIndex, currentQuestion]);

  useEffect(() => {
    if (showFeedback || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!isLiveMode) {
            handleNextQuestion();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, showFeedback, currentQuestion, isLiveMode]);

  const handleAnswerSelect = async (answer: string) => {
    if (showFeedback || !currentUser || !quizGameId) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    setTotalTime((prev) => prev + timeTaken);
    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === currentQuestion.correct_answer;
    if (isCorrect) {
      const questionScore = Math.max(100, 1000 - (timeTaken * 10));
      setScore((prev) => prev + questionScore);
      setCorrectCount((prev) => prev + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Save answer to database
    if ((currentQuestion as any).id) {
      await submitAnswer.mutateAsync({
        quiz_game_id: quizGameId,
        question_id: (currentQuestion as any).id,
        user_id: currentUser.id,
        selected_answer: answer,
        is_correct: isCorrect,
        time_taken: timeTaken,
      });
    }

    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (!isLiveMode) {
      if (currentQuestionIndex < questions.length - 1) {
        setInternalQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
        setStartTime(Date.now());
      } else {
        onComplete(score, correctCount, totalTime);
      }
    }
  };

  // Reset state when question changes in live mode
  useEffect(() => {
    if (isLiveMode && externalQuestionIndex !== undefined) {
      setSelectedAnswer(null);
      setShowFeedback(false);
      setStartTime(Date.now());
      
      if (externalQuestionIndex >= questions.length) {
        onComplete(score, correctCount, totalTime);
      }
    }
  }, [externalQuestionIndex, isLiveMode]);

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  const isCorrect = selectedAnswer === currentQuestion.correct_answer;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent">
        <motion.div
          className="h-full bg-white/30"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          </div>
          <motion.div
            animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
            transition={{ repeat: timeLeft <= 5 ? Infinity : 0, duration: 0.5 }}
            className={`flex items-center gap-2 font-bold text-lg ${
              timeLeft <= 5 ? 'text-destructive' : 'text-primary'
            }`}
          >
            <Clock className="w-5 h-5" />
            {timeLeft}s
          </motion.div>
        </div>

        <Progress value={progress} className="h-2" />

        <CardTitle className="text-xl md:text-2xl">
          {currentQuestion.question_text}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentQuestion.correct_answer;
              const showCorrect = showFeedback && isCorrectAnswer;
              const showIncorrect = showFeedback && isSelected && !isCorrect;

              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                  whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                >
                  <Button
                    variant={
                      showCorrect
                        ? 'default'
                        : showIncorrect
                        ? 'destructive'
                        : isSelected
                        ? 'secondary'
                        : 'outline'
                    }
                    className={`w-full h-auto min-h-[60px] text-left justify-start p-4 transition-all ${
                      showCorrect ? 'bg-green-500 hover:bg-green-600' : ''
                    }`}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showFeedback}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-background/20 flex items-center justify-center font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1">{option}</span>
                      {showCorrect && <CheckCircle2 className="w-5 h-5" />}
                      {showIncorrect && <XCircle className="w-5 h-5" />}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg text-center font-semibold ${
              isCorrect
                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                : 'bg-red-500/10 text-red-700 dark:text-red-400'
            }`}
          >
            {isCorrect ? '✨ Correct! Well done!' : '❌ Incorrect. The correct answer was highlighted.'}
          </motion.div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span>Score: {score}</span>
          </div>
          <div>
            Correct: {correctCount}/{questions.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
