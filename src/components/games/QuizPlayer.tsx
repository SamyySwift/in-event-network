import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trophy, CheckCircle2, XCircle, Star, Sparkles, Zap } from 'lucide-react';
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

const OPTION_COLORS = [
  { bg: 'bg-pink-400', border: 'border-pink-600', hover: 'hover:bg-pink-500' },
  { bg: 'bg-blue-400', border: 'border-blue-600', hover: 'hover:bg-blue-500' },
  { bg: 'bg-green-400', border: 'border-green-600', hover: 'hover:bg-green-500' },
  { bg: 'bg-orange-400', border: 'border-orange-600', hover: 'hover:bg-orange-500' },
];

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
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Star className="w-12 h-12 text-yellow-400" />
        </motion.div>
      </div>
    );
  }

  const isCorrect = selectedAnswer === currentQuestion.correct_answer;

  return (
    <Card className="relative overflow-hidden bg-cyan-400 border-4 border-blue-500 shadow-[8px_8px_0px_0px_rgba(59,130,246,0.5)]">
      {/* Decorative animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full"
        />
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute top-12 left-4 w-6 h-6 bg-pink-400 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute bottom-4 right-8"
        >
          <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-6"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
      </div>

      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-yellow-300 border-b-2 border-yellow-500">
        <motion.div
          className="h-full bg-green-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <CardHeader className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-full border-2 border-purple-400 shadow-md">
            <Zap className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-purple-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <motion.div
            animate={{ scale: timeLeft <= 5 ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: timeLeft <= 5 ? Infinity : 0, duration: 0.5 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border-3 shadow-md font-black text-xl ${
              timeLeft <= 5 
                ? 'bg-red-400 border-red-600 text-white' 
                : 'bg-orange-400 border-orange-600 text-white'
            }`}
          >
            <Clock className="w-6 h-6" />
            {timeLeft}s
          </motion.div>
        </div>

        {/* Custom playful progress bar */}
        <div className="h-4 bg-white/50 rounded-full border-2 border-blue-400 overflow-hidden">
          <motion.div
            className="h-full bg-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <CardTitle className="text-xl md:text-2xl bg-white/90 p-4 rounded-2xl border-3 border-purple-400 shadow-lg text-purple-700 font-black">
          {currentQuestion.question_text}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 gap-3"
          >
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = option === currentQuestion.correct_answer;
              const showCorrect = showFeedback && isCorrectAnswer;
              const showIncorrect = showFeedback && isSelected && !isCorrect;
              const colors = OPTION_COLORS[index % OPTION_COLORS.length];

              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: showFeedback ? 1 : 1.02 }}
                  whileTap={{ scale: showFeedback ? 1 : 0.98 }}
                >
                  <Button
                    variant="outline"
                    className={`w-full h-auto min-h-[70px] text-left justify-start p-4 transition-all border-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] font-bold text-lg ${
                      showCorrect 
                        ? 'bg-green-400 border-green-600 text-white' 
                        : showIncorrect 
                        ? 'bg-red-400 border-red-600 text-white' 
                        : isSelected
                        ? `${colors.bg} ${colors.border} text-white`
                        : `bg-white ${colors.border} text-gray-800 ${colors.hover}`
                    }`}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showFeedback}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border-2 ${
                        showCorrect || showIncorrect || isSelected
                          ? 'bg-white/30 border-white/50 text-white'
                          : `${colors.bg} border-white text-white`
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="flex-1 text-base">{option}</span>
                      {showCorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <CheckCircle2 className="w-8 h-8" />
                        </motion.div>
                      )}
                      {showIncorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <XCircle className="w-8 h-8" />
                        </motion.div>
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-2xl text-center font-black text-xl border-3 shadow-lg ${
              isCorrect
                ? 'bg-green-300 border-green-500 text-green-800'
                : 'bg-red-300 border-red-500 text-red-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {isCorrect ? (
                <>
                  <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                  </motion.div>
                  <span>Correct! Amazing!</span>
                  <motion.div animate={{ rotate: [0, -20, 20, 0] }} transition={{ repeat: Infinity, duration: 0.5 }}>
                    <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                  </motion.div>
                </>
              ) : (
                <span>Oops! Try again next time!</span>
              )}
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between bg-white/90 p-4 rounded-2xl border-3 border-yellow-400 shadow-md">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Trophy className="w-8 h-8 text-yellow-500" />
            </motion.div>
            <span className="font-black text-xl text-yellow-600">Score: {score}</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-400 px-4 py-2 rounded-full border-2 border-purple-600">
            <span className="font-bold text-white">Correct: {correctCount}/{questions.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
