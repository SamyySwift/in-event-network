import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Clock, Users, Filter, User } from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

interface SpeakerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDate: string;
  onDateChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedTopic: string;
  onTopicChange: (value: string) => void;
  speakers: any[];
}

const SpeakerFilters: React.FC<SpeakerFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedDate,
  onDateChange,
  selectedStatus,
  onStatusChange,
  selectedTopic,
  onTopicChange,
  speakers,
}) => {
  // Generate unique dates from speaker sessions
  const uniqueDates = Array.from(
    new Set(
      speakers
        .map((speaker) => {
          if (speaker.session_time) {
            return speaker.session_time.slice(0, 10);
          }
          return null;
        })
        .filter(Boolean)
    )
  ).sort();

  // Generate unique topics
  const uniqueTopics = Array.from(
    new Set(
      speakers
        .map((speaker) => speaker.topic)
        .filter(Boolean)
    )
  ).sort();

  const getDateLabel = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      return format(date, "MMM d");
    } catch {
      return dateStr;
    }
  };

  const getActiveCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedDate !== "all") count++;
    if (selectedStatus !== "all") count++;
    if (selectedTopic !== "all") count++;
    return count;
  };

  const clearFilters = () => {
    onSearchChange("");
    onDateChange("all");
    onStatusChange("all");
    onTopicChange("all");
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Header with filter badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">Filter Speakers</span>
          {getActiveCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveCount()} active
            </Badge>
          )}
        </div>
        {getActiveCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search speakers, companies, topics..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {/* Date filters */}
        <div className="flex flex-wrap gap-1">
          <Button
            variant={selectedDate === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onDateChange("all")}
            className="h-8"
          >
            All Days
          </Button>
          <Button
            variant={selectedDate === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => onDateChange("today")}
            className="h-8"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Today
          </Button>
          <Button
            variant={selectedDate === "tomorrow" ? "default" : "outline"}
            size="sm"
            onClick={() => onDateChange("tomorrow")}
            className="h-8"
          >
            Tomorrow
          </Button>
          <Button
            variant={selectedDate === "tba" ? "default" : "outline"}
            size="sm"
            onClick={() => onDateChange("tba")}
            className="h-8"
          >
            TBA
          </Button>
        </div>
      </div>

      {/* Additional filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Specific dates */}
        <div>
          <Select value={selectedDate.startsWith("date-") ? selectedDate : ""} onValueChange={onDateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select specific date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={`date-${date}`}>
                  {getDateLabel(date)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status filter */}
        <div>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Speakers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Speakers</SelectItem>
              <SelectItem value="confirmed">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  With Sessions
                </div>
              </SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Session TBA
                </div>
              </SelectItem>
              <SelectItem value="with_topic">With Topic</SelectItem>
              <SelectItem value="no_topic">No Topic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topic filter */}
        <div>
          <Select value={selectedTopic} onValueChange={onTopicChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {uniqueTopics.map((topic) => (
                <SelectItem key={topic} value={topic}>
                  {topic}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View mode could go here if needed */}
        <div>
          <Select defaultValue="list">
            <SelectTrigger>
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  List View
                </div>
              </SelectItem>
              <SelectItem value="grid">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  Grid View
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SpeakerFilters;