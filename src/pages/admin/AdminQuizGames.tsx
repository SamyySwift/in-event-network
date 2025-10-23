import { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { useQuizGames, useQuizQuestions } from '@/hooks/useQuizGames';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Play, Pause, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const AdminQuizGames = () => {
  const { selectedEventId } = useAdminEventContext();
  const { currentUser } = useAuth();
  const { quizGames, isLoading, createQuizGame, updateQuizGame, deleteQuizGame } = useQuizGames(selectedEventId);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    total_questions: 10,
  });

  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    time_limit: 20,
  });

  const { questions, addQuestion, deleteQuestion } = useQuizQuestions(selectedQuiz?.id);

  const handleCreateQuiz = async () => {
    if (!selectedEventId || !currentUser) return;

    await createQuizGame.mutateAsync({
      event_id: selectedEventId,
      title: newQuiz.title,
      description: newQuiz.description,
      total_questions: newQuiz.total_questions,
      is_active: false,
      created_by: currentUser.id,
    });

    setCreateDialogOpen(false);
    setNewQuiz({ title: '', description: '', total_questions: 10 });
  };

  const handleToggleActive = async (quiz: any) => {
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

  if (!selectedEventId) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Quiz Games</h1>
          <p className="text-center text-muted-foreground">Please select an event first</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Quiz Games</h1>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Create and manage Kahoot-style quiz games for your attendees
          </p>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
                <Button onClick={handleCreateQuiz} className="w-full">
                  Create Quiz
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
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
                    {quiz.is_active && (
                      <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
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
                      onClick={() => handleToggleActive(quiz)}
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
                  <CardTitle className="text-lg">Add New Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Question Text</Label>
                    <Textarea
                      value={newQuestion.question_text}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                      placeholder="Enter your question"
                    />
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
      </div>
    </AdminLayout>
  );
};

export default AdminQuizGames;
