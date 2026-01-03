import React, { useState, useEffect } from "react";
// Remove this import:
// import AdminLayout from "@/components/layouts/AdminLayout";
import SuggestionStatsCards from "./components/SuggestionStatsCards";
import SuggestionCard from "./components/SuggestionCard";
import EventSelector from "@/components/admin/EventSelector";
import { Input } from "@/components/ui/input";
import { Plus, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminEventContext } from "@/hooks/useAdminEventContext";
import { useIsMobile } from "@/hooks/use-mobile";
import PaymentGuard from '@/components/payment/PaymentGuard';

interface Suggestion {
  id: string;
  content: string;
  type: "suggestion" | "rating";
  rating: number | null;
  status: "new" | "reviewed" | "implemented";
  created_at: string;
  user_id: string;
  event_id: string | null;
}

interface Profile {
  id: string;
  name: string | null;
  photo_url: string | null;
}

interface SuggestionWithProfile extends Suggestion {
  profile: Profile | null;
  event_name?: string;
}

// --- Main Content ---
const AdminSuggestionsContent = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<SuggestionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { selectedEventId, selectedEvent, adminEvents } = useAdminEventContext();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchSuggestions();

    // Real-time updates
    const channel = supabase
      .channel("admin-suggestions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "suggestions",
        },
        () => {
          fetchSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedEventId]);

  const fetchSuggestions = async () => {
    if (!currentUser?.id) return;

    setLoading(true);
    try {
      let suggestionsQuery;

      if (selectedEventId) {
        suggestionsQuery = supabase
          .from("suggestions")
          .select("*")
          .eq("event_id", selectedEventId);
      } else {
        const { data: adminEvents, error: eventsError } = await supabase
          .from("events")
          .select("id")
          .eq("host_id", currentUser.id);

        if (eventsError) throw eventsError;

        if (!adminEvents || adminEvents.length === 0) {
          setSuggestions([]);
          setLoading(false);
          return;
        }
        const eventIds = adminEvents.map((event) => event.id) as string[];
        suggestionsQuery = supabase
          .from("suggestions")
          .select("*")
          .in("event_id", eventIds);
      }

      const { data: suggestionsData, error: suggestionsError } = await suggestionsQuery
        .order("created_at", { ascending: false });

      if (suggestionsError) throw suggestionsError;

      if (!suggestionsData || suggestionsData.length === 0) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(suggestionsData.map((s) => s.user_id).filter(Boolean))] as string[];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, name, photo_url")
        .in("id", userIds);

      let eventsData = null;
      if (!selectedEventId) {
        const eventIds = [...new Set(suggestionsData.map((s) => s.event_id).filter(Boolean))] as string[];
        const { data } = await supabase
          .from("events")
          .select("id, name")
          .in("id", eventIds);

        eventsData = data;
      }

      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach((profile) => {
          profilesMap.set(profile.id, profile);
        });
      }
      const eventsMap = new Map();
      if (eventsData) {
        eventsData.forEach((event) => {
          eventsMap.set(event.id, event);
        });
      }

      const suggestionsWithProfiles: SuggestionWithProfile[] = suggestionsData.map((suggestion) => ({
        ...suggestion,
        type: suggestion.type as "suggestion" | "rating",
        status: suggestion.status as "new" | "reviewed" | "implemented",
        profile: suggestion.user_id ? profilesMap.get(suggestion.user_id) || null : null,
        event_name: suggestion.event_id ? eventsMap.get(suggestion.event_id)?.name || "Unknown Event" : undefined,
      }));

      setSuggestions(suggestionsWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Suggestion stats
  const getStats = () => {
    const total = suggestions.length;
    const newCount = suggestions.filter((s) => s.status === "new").length;
    const implemented = suggestions.filter((s) => s.status === "implemented").length;
    return { total, newCount, implemented };
  };

  // Filtering logic
  const getFilteredSuggestions = () => {
    let filtered = suggestions;
    if (activeTab === "suggestions") filtered = filtered.filter((s) => s.type === "suggestion");
    if (activeTab === "ratings") filtered = filtered.filter((s) => s.type === "rating");
    if (activeTab === "new") filtered = filtered.filter((s) => s.status === "new");
    if (activeTab === "reviewed") filtered = filtered.filter((s) => s.status === "reviewed");
    // Search bar filter
    if (searchQuery) {
      filtered = filtered.filter(
        (s) =>
          s.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  // --- Actions ---
  const handleUpdateStatus = async (
    suggestion: SuggestionWithProfile,
    newStatus: "new" | "reviewed" | "implemented"
  ) => {
    try {
      const { error } = await supabase
        .from("suggestions")
        .update({ status: newStatus })
        .eq("id", suggestion.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Suggestion marked as ${newStatus}`,
      });

      fetchSuggestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update suggestion",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSuggestion = async (suggestion: SuggestionWithProfile) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("suggestions")
        .delete()
        .eq("id", suggestion.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Suggestion deleted successfully",
      });

      fetchSuggestions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete suggestion",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const stats = getStats();
  const filteredSuggestions = getFilteredSuggestions();

  // Loading
  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
          <EventSelector />
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading suggestions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in px-4 sm:px-0">
      {/* Event Selector */}
      <div className="flex justify-between items-center">
        <EventSelector />
      </div>

      {/* Show message when no event is selected */}
      {adminEvents.length > 0 && !selectedEventId && (
        <div className="text-center py-8 sm:py-12">
          <div className="p-4 rounded-full bg-primary/10 inline-block mb-4">
            <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-base sm:text-lg mb-2">No event selected</p>
          <p className="text-sm text-muted-foreground px-4">Please select an event above to view suggestions</p>
        </div>
      )}

      {/* Only show content when an event is selected */}
      {selectedEventId && (
        <PaymentGuard 
          eventId={selectedEventId} 
          eventName={selectedEvent?.name || 'this event'}
          feature="Suggestions & Ratings"
        >
          {/* Gradient Hero Section */}
          <div className="p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-100 via-blue-100 to-indigo-50 text-primary-900 dark:text-white shadow-lg sm:shadow-2xl shadow-primary/10 mb-2 relative overflow-hidden">
            <div className="absolute -top-12 -right-10 w-32 h-32 sm:w-56 sm:h-56 bg-white/10 rounded-full opacity-40 blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-14 -left-14 w-24 h-24 sm:w-36 sm:h-36 bg-white/20 rounded-full opacity-30 pointer-events-none"></div>
            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">Feedback Management</h1>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-primary-700 dark:text-primary-100">
                Manage feedback and suggestions for{" "}
                <span className="font-semibold">{selectedEvent?.name}</span>.
              </p>
              <div className="mt-4 sm:mt-6">
                <SuggestionStatsCards {...stats} loading={loading} />
              </div>
            </div>
          </div>

          {/* Quick Actions Section (title, tabs, search) */}
          <div className="flex flex-col gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold">Feedback</h2>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                Review, filter, and manage suggestions and feedback.
              </p>
            </div>
            
            {/* Mobile: Stack tabs vertically, Desktop: Horizontal */}
            <div className={`flex gap-2 ${isMobile ? 'flex-wrap justify-center' : 'flex-wrap'}`}>
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === "all"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-primary-50"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("suggestions")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === "suggestions"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-primary-50"
                }`}
              >
                Suggestions
              </button>
              <button
                onClick={() => setActiveTab("ratings")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === "ratings"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-primary-50"
                }`}
              >
                Ratings
              </button>
              <button
                onClick={() => setActiveTab("new")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === "new"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-primary-50"
                }`}
              >
                New
              </button>
              <button
                onClick={() => setActiveTab("reviewed")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === "reviewed"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground hover:bg-primary-50"
                }`}
              >
                Reviewed
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="flex justify-center sm:justify-start mb-4">
            <Input
              placeholder="Search suggestions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-sm"
            />
          </div>

          {/* Suggestions List */}
          <div className="space-y-4">
            {filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteSuggestion}
                  selectedEventId={selectedEventId}
                  isDeleting={isDeleting}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <Lightbulb className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground opacity-30" />
                <h3 className="mt-4 text-base sm:text-lg font-medium">
                  No suggestions found
                </h3>
                <p className="text-sm text-muted-foreground mt-1 px-4">
                  No suggestions match your filter or search criteria.
                </p>
              </div>
            )}
          </div>
        </PaymentGuard>
      )}
    </div>
  );
};

const AdminSuggestions = AdminSuggestionsContent;

export default AdminSuggestions;
