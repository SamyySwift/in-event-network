
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
                <Button variant="outline" className="gap-2 hover-scale">
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share Live View</span>
                  <span className="sm:hidden">Share</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-w-[95vw] w-full mx-4 rounded-xl border-0 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl">
                <DialogHeader className="space-y-3 pb-4">
                  <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Share2 className="h-5 w-5 text-primary" />
                    </div>
                    Share Live Questions
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Share this link to allow anyone to view questions and answers in real-time without needing to log in.
                  </p>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* URL Display with Copy Button */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Shareable Link</label>
                    <div className="relative">
                      <div className="flex items-center rounded-lg border border-border bg-muted/50 p-3 pr-12 min-h-[44px]">
                        <span className="text-sm text-foreground truncate font-mono">
                          {generateShareableLink()}
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={copyShareableLink} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        <span className="sr-only">Copy link</span>
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button 
                      onClick={openInNewTab} 
                      variant="outline" 
                      className="flex-1 gap-2 h-11 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Preview Live View
                    </Button>
                    <Button 
                      onClick={() => setShareDialogOpen(false)} 
                      className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    >
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
