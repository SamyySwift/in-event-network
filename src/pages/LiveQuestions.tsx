import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, Users, CheckCircle, ArrowUp, Search, Clock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface Question {
  id: string;
  content: string;
  created_at: string;
  upvotes: number;
  is_answered: boolean;
  user_id: string;
  is_anonymous: boolean;
  answered_at: string | null;
  response: string | null;
  response_created_at: string | null;
  profiles: {
    name: string;
    photo_url: string | null;
  } | null;
}

interface Event {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  start_time: string;
  end_time: string;
}

const TABS = [
  { id: "all", label: "All Questions" },
  { id: "answered", label: "Answered" },
  { id: "trending", label: "Trending" },
];

export default function LiveQuestions() {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const queryClient = useQueryClient();

  // Fetch event details
  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async (): Promise<Event | null> => {
      if (!eventId) return null;
      
      const { data, error } = await supabase
        .from('events')
        .select('id, name, description, logo_url, start_time, end_time')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return null;
      }

      return data;
    },
    enabled: !!eventId,
  });

  // Fetch questions for the event
  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['live-questions', eventId],
    queryFn: async (): Promise<Question[]> => {
      if (!eventId) return [];

      const { data: questionsData, error } = await supabase
        .from('questions')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        return [];
      }

      if (!questionsData || questionsData.length === 0) {
        return [];
      }

      // Fetch user profiles for questions
      const userIds = questionsData.map((q: any) => q.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, photo_url')
        .in('id', userIds);

      // Process questions with user profiles
      const processedQuestions = questionsData.map((question: any) => {
        const userProfile = profiles?.find(p => p.id === question.user_id);
        
        return {
          ...question,
          profiles: question.is_anonymous ? null : (userProfile ? {
            name: userProfile.name || 'Anonymous User',
            photo_url: userProfile.photo_url
          } : null),
        };
      });

      return processedQuestions;
    },
    enabled: !!eventId,
    refetchInterval: 5000, // Refetch every 5 seconds as fallback
  });

  // Set up real-time subscription for questions
  useEffect(() => {
    if (!eventId) return;

    console.log('Setting up real-time subscription for live questions, eventId:', eventId);

    const channel = supabase
      .channel('live-questions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('New question received:', payload);
          queryClient.invalidateQueries({ queryKey: ['live-questions', eventId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('Question updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['live-questions', eventId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'questions',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('Question deleted:', payload);
          queryClient.invalidateQueries({ queryKey: ['live-questions', eventId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);

  // Stats for display
  const total = questions.length;
  const answered = questions.filter((q) => q.is_answered).length;
  const trending = useMemo(() => {
    return questions.filter((q) => q.upvotes >= 2).length;
  }, [questions]);

  // Filter questions based on active tab and search
  const filteredQuestions = useMemo(() => {
    let filtered = questions;
    if (activeTab === "answered") filtered = filtered.filter((q) => q.is_answered);
    else if (activeTab === "trending") filtered = [...questions].sort((a, b) => b.upvotes - a.upvotes);
    
    if (searchQuery.trim().length > 0) {
      filtered = filtered.filter((question) =>
        question.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (question.profiles?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [questions, activeTab, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading questions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="p-4 rounded-full bg-destructive/10 inline-block mb-4">
              <MessageSquare className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground">The event you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {event.logo_url && (
              <Avatar className="h-16 w-16">
                <AvatarImage src={event.logo_url} alt={event.name} />
                <AvatarFallback>{event.name.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-3xl font-bold">{event.name}</h1>
              <p className="text-muted-foreground">Live Q&A Session</p>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{total}</p>
                    <p className="text-sm text-muted-foreground">Total Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{answered}</p>
                    <p className="text-sm text-muted-foreground">Answered</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <ArrowUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{trending}</p>
                    <p className="text-sm text-muted-foreground">Trending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-full font-medium transition ${
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
          
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <Card key={question.id} className={`glass-card overflow-hidden hover:shadow-xl transition-all ${question.upvotes > 0 ? 'fire-border animate-enter' : 'hover:shadow-md transition-shadow'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {question.profiles && !question.is_anonymous ? (
                        <>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={question.profiles.photo_url || ''} />
                            <AvatarFallback>
                              {question.profiles.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{question.profiles.name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">Anonymous</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {question.upvotes > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <ArrowUp className="h-3 w-3" />
                          {question.upvotes} {question.upvotes > 0 && <span aria-hidden="true">🔥</span>}
                        </Badge>
                      )}
                      {question.is_answered && (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Answered
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-foreground mb-3">{question.content}</p>
                  
                  {question.response && (
                    <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">Official Response</Badge>
                        {question.response_created_at && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(question.response_created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{question.response}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                <h3 className="text-lg font-medium mb-2">No questions found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No questions match your search criteria." : "No questions have been submitted yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live indicator */}
        <div className="fixed bottom-4 right-4">
          <Badge variant="default" className="gap-2 animate-pulse">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live
          </Badge>
        </div>
      </div>
    </div>
  );
}