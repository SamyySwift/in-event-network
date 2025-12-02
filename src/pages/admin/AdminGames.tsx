import AdminLayout from "@/components/layouts/AdminLayout";
import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import { useWordSearchGames } from "@/hooks/useWordSearchGames";
import { useQuizGames, useQuizQuestions } from "@/hooks/useQuizGames";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Gamepad2, Lightbulb, Link2, ExternalLink, Edit, Play, Pause, Eye, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateWordSearchGrid } from "@/utils/wordSearchGenerator";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AdminGames = () => {
  const { selectedEventId } = useAdminEventContext();
  const { currentUser } = useAuth();
  const { games, isLoading, createGame, deleteGame, updateGame } =
    useWordSearchGames(selectedEventId);
  const { quizGames, isLoading: quizLoading, createQuizGame, updateQuizGame, deleteQuizGame } = useQuizGames(selectedEventId);
  const { toast: toastHook } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [wordsInput, setWordsInput] = useState("");
  const [gridSize, setGridSize] = useState(15);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "medium"
  );
  const [theme, setTheme] = useState("general");
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);

  // Quiz Game State
  const [createQuizDialogOpen, setCreateQuizDialogOpen] = useState(false);
  const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    total_questions: 10,
    play_mode: 'admin_directed' as 'admin_directed' | 'self_paced',
  });

  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    time_limit: 20,
  });

  // AI Auto-generation state
  const [aiEnabled, setAiEnabled] = useState(true);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);

  const { questions, addQuestion, deleteQuestion } = useQuizQuestions(selectedQuiz?.id);

  // Auto-generate options when question text changes
  const generateOptionsWithAI = async (questionText: string) => {
    if (!aiEnabled || !questionText || questionText.trim().length < 10) return;
    
    setIsGeneratingOptions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz-options', {
        body: { question: questionText }
      });

      if (error) throw error;

      if (data?.options && data?.correct_answer) {
        // Pad options to 4 if needed
        const paddedOptions = [...data.options];
        while (paddedOptions.length < 4) paddedOptions.push('');
        
        setNewQuestion(prev => ({
          ...prev,
          options: paddedOptions.slice(0, 4),
          correct_answer: data.correct_answer
        }));
        toast.success('AI generated options successfully!');
      }
    } catch (error: any) {
      console.error('Error generating options:', error);
      if (error.message?.includes('Rate limit')) {
        toast.error('Rate limit reached. Please wait a moment.');
      } else {
        toast.error('Failed to generate options');
      }
    } finally {
      setIsGeneratingOptions(false);
    }
  };

  const THEMED_WORDS = {
    tech: [
      "JAVASCRIPT",
      "PYTHON",
      "DATABASE",
      "CODING",
      "ALGORITHM",
      "BINARY",
      "NETWORK",
      "SOFTWARE",
      "HARDWARE",
      "CYBERSECURITY",
    ],
    business: [
      "STRATEGY",
      "PROFIT",
      "REVENUE",
      "MARKETING",
      "SALES",
      "BUDGET",
      "INVESTMENT",
      "PARTNERSHIP",
      "INNOVATION",
      "LEADERSHIP",
    ],
    health: [
      "WELLNESS",
      "NUTRITION",
      "FITNESS",
      "MEDICINE",
      "THERAPY",
      "EXERCISE",
      "MINDFULNESS",
      "HYGIENE",
      "IMMUNITY",
      "HEALTHCARE",
    ],
    education: [
      "LEARNING",
      "KNOWLEDGE",
      "TEACHER",
      "STUDENT",
      "CLASSROOM",
      "STUDY",
      "RESEARCH",
      "ACADEMIC",
      "DEGREE",
      "SCHOLARSHIP",
    ],
    general: [],
  };

  const handleCreateGame = async () => {
    if (!selectedEventId) {
      toast.error("Please select an event first");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const words = wordsInput
      .split("\n")
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    if (words.length < 3) {
      toast.error("Please enter at least 3 words");
      return;
    }

    const { grid, positions } = generateWordSearchGrid(words, gridSize);

    await createGame.mutateAsync({
      event_id: selectedEventId,
      title,
      words,
      grid_size: gridSize,
      grid_data: { grid, positions },
      difficulty,
      theme,
      hints_enabled: hintsEnabled,
      time_limit: timeLimit,
    });

    setIsCreating(false);
    setTitle("");
    setWordsInput("");
    setDifficulty("medium");
    setTheme("general");
    setHintsEnabled(false);
    setTimeLimit(null);
  };

  const handleToggleActive = async (gameId: string, currentStatus: boolean) => {
    await updateGame.mutateAsync({
      id: gameId,
      is_active: !currentStatus,
    });
  };

  const generateShareableLink = () => {
    if (!selectedEventId) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/live-games/${selectedEventId}`;
  };

  const copyShareableLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link);
    toastHook({
      title: "Link copied!",
      description: "Shareable link has been copied to clipboard",
    });
  };

  const openInNewTab = () => {
    const link = generateShareableLink();
    window.open(link, '_blank');
  };

  const handleCreateQuiz = async () => {
    if (!selectedEventId || !currentUser) return;

    await createQuizGame.mutateAsync({
      event_id: selectedEventId,
      title: newQuiz.title,
      description: newQuiz.description,
      total_questions: newQuiz.total_questions,
      play_mode: newQuiz.play_mode,
      is_active: false,
      created_by: currentUser.id,
    });

    setCreateQuizDialogOpen(false);
    setNewQuiz({ title: '', description: '', total_questions: 10, play_mode: 'admin_directed' });
  };

  const handleToggleQuizActive = async (quiz: any) => {
    await updateQuizGame.mutateAsync({
      id: quiz.id,
      updates: { is_active: !quiz.is_active },
    });
  };

  const handleAddQuestion = async () => {
    if (!selectedQuiz || !newQuestion.question_text || !newQuestion.correct_answer) {
      toast.error('Please fill in all fields');
      return;
    }

    const validOptions = newQuestion.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    if (!validOptions.includes(newQuestion.correct_answer)) {
      toast.error('Correct answer must be one of the options');
      return;
    }

    await addQuestion.mutateAsync({
      quiz_game_id: selectedQuiz.id,
      question_text: newQuestion.question_text,
      options: validOptions,
      correct_answer: newQuestion.correct_answer,
      time_limit: newQuestion.time_limit,
      question_order: questions.length,
    });

    setNewQuestion({
      question_text: '',
      options: ['', '', '', ''],
      correct_answer: '',
      time_limit: 20,
    });
  };

  return (
    <AdminPageHeader
      title="Games"
      description="Create and manage interactive games for your attendees"
    >
      <Tabs defaultValue="word-search" className="space-y-4">
        <TabsList>
          <TabsTrigger value="word-search">Word Search</TabsTrigger>
          <TabsTrigger value="quiz">Quiz Games</TabsTrigger>
        </TabsList>

        <TabsContent value="word-search" className="space-y-4">
        {selectedEventId && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Live Leaderboard Link</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Share this link to display the live game leaderboard
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono break-all">
                      {generateShareableLink()}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyShareableLink}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={openInNewTab}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {!isCreating ? (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Word Search Game
          </Button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Create New Word Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Game Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Tech Conference Word Search"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={difficulty}
                    onValueChange={(v: any) => setDifficulty(v)}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy (10x10 grid)</SelectItem>
                      <SelectItem value="medium">
                        Medium (15x15 grid)
                      </SelectItem>
                      <SelectItem value="hard">Hard (20x20 grid)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="theme">Word Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="tech">Technology</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="health">Health & Wellness</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {theme !== "general" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const themedWords =
                      THEMED_WORDS[theme as keyof typeof THEMED_WORDS] || [];
                    setWordsInput(themedWords.join("\n"));
                    const newGridSize =
                      difficulty === "easy"
                        ? 10
                        : difficulty === "hard"
                        ? 20
                        : 15;
                    setGridSize(newGridSize);
                  }}
                  className="w-full"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Use {theme.charAt(0).toUpperCase() + theme.slice(1)} Themed
                  Words
                </Button>
              )}

              <div>
                <Label htmlFor="words">
                  Words (one per line, minimum 3 words)
                </Label>
                <Textarea
                  id="words"
                  value={wordsInput}
                  onChange={(e) => setWordsInput(e.target.value)}
                  placeholder="Enter words, one per line, or use themed words above"
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gridSize">
                    Grid Size: {gridSize}x{gridSize}
                  </Label>
                  <Input
                    id="gridSize"
                    type="range"
                    min="10"
                    max="20"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="timeLimit">
                    Time Limit (optional, in seconds)
                  </Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    min="30"
                    placeholder="No limit"
                    value={timeLimit || ""}
                    onChange={(e) =>
                      setTimeLimit(
                        e.target.value ? Number(e.target.value) : null
                      )
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="hints"
                  checked={hintsEnabled}
                  onCheckedChange={setHintsEnabled}
                />
                <Label htmlFor="hints">Enable hints for players</Label>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateGame}
                  disabled={createGame.isPending}
                >
                  Create Game
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                  disabled={createGame.isPending}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {isLoading ? (
            <p>Loading games...</p>
          ) : games.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No games created yet. Create your first word search game!
              </CardContent>
            </Card>
          ) : (
            games.map((game) => (
              <Card key={game.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{game.title}</CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`active-${game.id}`}>Active</Label>
                        <Switch
                          id={`active-${game.id}`}
                          checked={game.is_active}
                          onCheckedChange={() =>
                            handleToggleActive(game.id, game.is_active)
                          }
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteGame.mutate(game.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap text-sm">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                        {game.difficulty || "medium"}
                      </span>
                      {game.theme && game.theme !== "general" && (
                        <span className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-full">
                          {game.theme}
                        </span>
                      )}
                      {game.hints_enabled && (
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                          Hints enabled
                        </span>
                      )}
                      {game.time_limit && (
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full">
                          {game.time_limit}s limit
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {game.words.length} words • {game.grid_size}x
                      {game.grid_size} grid
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {game.words.map((word, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-muted rounded text-sm"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4">
          {selectedEventId && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Live Quiz Feedback Link</label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Share this link to display the live quiz leaderboard and results
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 bg-muted rounded-lg text-sm font-mono break-all">
                        {`${window.location.origin}/live-games/${selectedEventId}?tab=quiz`}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/live-games/${selectedEventId}?tab=quiz`);
                          toast.success('Link copied to clipboard!');
                        }}
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(`${window.location.origin}/live-games/${selectedEventId}?tab=quiz`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Create and manage Kahoot-style quiz games for your attendees
            </p>
            <Dialog open={createQuizDialogOpen} onOpenChange={setCreateQuizDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Quiz
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Quiz Game</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Quiz Title</Label>
                    <Input
                      value={newQuiz.title}
                      onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                      placeholder="e.g., Event Trivia Challenge"
                    />
                  </div>
                  <div>
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={newQuiz.description}
                      onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                      placeholder="Brief description of the quiz"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Quiz Mode</Label>
                    <div className="space-y-3">
                      <div
                        onClick={() => setNewQuiz({ ...newQuiz, play_mode: 'admin_directed' })}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          newQuiz.play_mode === 'admin_directed'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            newQuiz.play_mode === 'admin_directed' ? 'border-primary' : 'border-muted-foreground'
                          }`}>
                            {newQuiz.play_mode === 'admin_directed' && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <span className="font-medium">Admin-Directed (Kahoot-style)</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          You control question progression. All attendees see the same question.
                        </p>
                      </div>
                      <div
                        onClick={() => setNewQuiz({ ...newQuiz, play_mode: 'self_paced' })}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          newQuiz.play_mode === 'self_paced'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            newQuiz.play_mode === 'self_paced' ? 'border-primary' : 'border-muted-foreground'
                          }`}>
                            {newQuiz.play_mode === 'self_paced' && (
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <span className="font-medium">Self-Paced</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          Attendees play independently at their own pace.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleCreateQuiz} className="w-full">
                    Create Quiz
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {quizLoading ? (
            <p>Loading quizzes...</p>
          ) : quizGames.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No quiz games yet. Create your first one!
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {quizGames.map((quiz) => (
                <Card key={quiz.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{quiz.title}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          quiz.play_mode === 'self_paced'
                            ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                            : 'bg-purple-500/20 text-purple-700 dark:text-purple-300'
                        }`}>
                          {quiz.play_mode === 'self_paced' ? 'Self-Paced' : 'Admin-Directed'}
                        </span>
                        {quiz.is_active && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {quiz.description && (
                      <p className="text-sm text-muted-foreground">{quiz.description}</p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Total Questions: {quiz.total_questions}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setQuestionsDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Questions
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleQuizActive(quiz)}
                      >
                        {quiz.is_active ? (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteQuizGame.mutate(quiz.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Questions Management Dialog */}
          <Dialog open={questionsDialogOpen} onOpenChange={setQuestionsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Manage Questions - {selectedQuiz?.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Add New Question */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Add New Question</CardTitle>
                      <div className="flex items-center gap-2">
                        <Sparkles className={`w-4 h-4 ${aiEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        <Label htmlFor="ai-toggle" className="text-sm">AI Auto-fill</Label>
                        <Switch
                          id="ai-toggle"
                          checked={aiEnabled}
                          onCheckedChange={setAiEnabled}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <div className="flex gap-2">
                        <Textarea
                          value={newQuestion.question_text}
                          onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                          placeholder="Enter your question"
                          className="flex-1"
                        />
                        {aiEnabled && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => generateOptionsWithAI(newQuestion.question_text)}
                            disabled={isGeneratingOptions || newQuestion.question_text.trim().length < 10}
                            className="shrink-0"
                            title="Generate options with AI"
                          >
                            {isGeneratingOptions ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      {aiEnabled && newQuestion.question_text.trim().length < 10 && newQuestion.question_text.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Type at least 10 characters to enable AI generation
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {newQuestion.options.map((option, index) => (
                        <div key={index}>
                          <Label>Option {String.fromCharCode(65 + index)}</Label>
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[index] = e.target.value;
                              setNewQuestion({ ...newQuestion, options: newOptions });
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label>Correct Answer</Label>
                      <Input
                        value={newQuestion.correct_answer}
                        onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                        placeholder="Enter the correct answer"
                      />
                    </div>

                    <div>
                      <Label>Time Limit (seconds)</Label>
                      <Input
                        type="number"
                        value={newQuestion.time_limit}
                        onChange={(e) => setNewQuestion({ ...newQuestion, time_limit: parseInt(e.target.value) })}
                        min={10}
                        max={60}
                      />
                    </div>

                    <Button onClick={handleAddQuestion} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </CardContent>
                </Card>

                {/* Existing Questions */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Existing Questions ({questions.length})</h3>
                  {questions.map((q, index) => (
                    <Card key={q.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold mb-2">
                              {index + 1}. {q.question_text}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {q.options.map((opt, i) => (
                                <div
                                  key={i}
                                  className={`p-2 rounded ${
                                    opt === q.correct_answer
                                      ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                      : 'bg-muted'
                                  }`}
                                >
                                  {String.fromCharCode(65 + i)}) {opt}
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Time: {q.time_limit}s
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => q.id && deleteQuestion.mutate(q.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </AdminPageHeader>
  );
};

export default AdminGames;
