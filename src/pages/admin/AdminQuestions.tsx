
import React, { useState, useMemo } from "react";
// Remove this import:
// import AdminLayout from "@/components/layouts/AdminLayout";
import QuestionStatsCards from "./components/QuestionStatsCards";
import QuestionCard from "./components/QuestionCard";
import EventSelector from "@/components/admin/EventSelector";
import { Input } from "@/components/ui/input";
import { useAdminQuestions } from "@/hooks/useAdminQuestions";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import { Plus, Share2, Copy, ExternalLink } from "lucide-react";
import PaymentGuard from '@/components/payment/PaymentGuard';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const TABS = [
  { id: "all", label: "All" },
  { id: "unanswered", label: "Unanswered" },
  { id: "answered", label: "Answered" },
  { id: "trending", label: "Trending" },
];

const QuestionsContent = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const { toast } = useToast();

  const { selectedEventId, selectedEvent } = useAdminEventContext();
  const {
    questions,
    isLoading,
    error,
    markAsAnswered,
    deleteQuestion,
    respondToQuestion,
    isMarkingAnswered,
    isDeleting,
    isResponding
  } = useAdminQuestions(selectedEventId || undefined);

  // Stats for cards
  const total = questions.length;
  const answered = questions.filter((q) => q.is_answered).length;
  const trending = useMemo(() => {
    return questions.filter((q) => q.upvotes >= 2).length;
  }, [questions]);

  // Filter questions based on active tab and search
  const filteredQuestions = useMemo(() => {
    let filtered = questions;
    if (activeTab === "answered") filtered = filtered.filter((q) => q.is_answered);
    else if (activeTab === "unanswered") filtered = filtered.filter((q) => !q.is_answered);
    else if (activeTab === "trending") filtered = [...questions].sort((a, b) => b.upvotes - a.upvotes);
    if (searchQuery.trim().length > 0) {
      filtered = filtered.filter((question) =>
        question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (question.profiles?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (question.event_name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [questions, activeTab, searchQuery]);

  const handleStartResponse = (id: string) => {
    setRespondingTo(id);
    setResponseText("");
  };

  const handleSubmitResponse = (id: string, response: string) => {
    if (!response.trim()) return;
    respondToQuestion({ questionId: id, response: response.trim() });
    setRespondingTo(null);
    setResponseText("");
  };

  const handleCancelResponse = () => {
    setRespondingTo(null);
    setResponseText("");
  };

  const handleMarkAsAnswered = (id: string) => {
    markAsAnswered(id);
  };

  const handleDelete = (id: string) => {
    deleteQuestion(id);
  };

  // Generate shareable link
  const generateShareableLink = () => {
    if (!selectedEventId) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/live-questions/${selectedEventId}`;
  };

  const copyShareableLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Shareable link has been copied to clipboard",
    });
  };

  const openInNewTab = () => {
    const link = generateShareableLink();
    window.open(link, '_blank');
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <EventSelector />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Event Selector */}
      <div className="flex justify-between items-center">
        <EventSelector />
      </div>

      {/* Show message when no event is selected */}
      {!selectedEventId && (
        <div className="text-center py-12">
          <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg mb-2">No event selected</p>
          <p className="text-sm text-muted-foreground">Please select an event above to manage Q&amp;A</p>
        </div>
      )}

      {/* Only show content when an event is selected */}
      {selectedEventId && (
        <PaymentGuard 
          eventId={selectedEventId} 
          eventName={selectedEvent?.name || 'this event'}
          feature="Q&A Management"
        >
          {/* Gradient Hero Section */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 text-primary-900 dark:text-white shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
            <div className="absolute -top-12 -right-10 w-56 h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight">Q&amp;A Management</h1>
              <p className="mt-2 max-w-2xl text-primary-700 dark:text-primary-100">
                Manage attendee questions and answers for <span className="font-semibold">{selectedEvent?.name}</span>.
              </p>
              <div className="mt-6">
                <QuestionStatsCards total={total} answered={answered} trending={trending} loading={isLoading} />
              </div>
            </div>
          </div>

          {/* Quick Actions: Title, Tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Questions & Answers</h2>
              <p className="text-muted-foreground mt-1">
                Review, moderate and respond to attendee questions.
              </p>
            </div>
            <div className="flex gap-2 mt-2 sm:mt-0">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  className={`px-3 py-1.5 rounded-full font-medium transition ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar and Share Button */}
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Live View
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Share Live Questions
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Share this link to allow anyone to view questions and answers in real-time without needing to log in.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {generateShareableLink()}
                      </div>
                    </div>
                    <Button size="sm" onClick={copyShareableLink} className="shrink-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={openInNewTab} variant="outline" className="flex-1 gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Preview
                    </Button>
                    <Button onClick={() => setShareDialogOpen(false)} className="flex-1">
                      Done
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  isMarkingAnswered={isMarkingAnswered}
                  isDeleting={isDeleting}
                  isResponding={isResponding}
                  respondingTo={respondingTo}
                  responseText={responseText}
                  onStartResponse={handleStartResponse}
                  onSubmitResponse={handleSubmitResponse}
                  onCancelResponse={handleCancelResponse}
                  onMarkAsAnswered={handleMarkAsAnswered}
                  onDelete={handleDelete}
                  setResponseText={setResponseText}
                  selectedEventId={selectedEventId}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <Plus className="mx-auto h-12 w-12 text-muted-foreground opacity-30" />
                <h3 className="mt-4 text-lg font-medium">No questions found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No questions match your search criteria.
                </p>
              </div>
            )}
          </div>
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              Error loading questions: {error.message}
            </div>
          )}
        </PaymentGuard>
      )}
    </div>
  );
};

const AdminQuestions = QuestionsContent;

export default AdminQuestions;
