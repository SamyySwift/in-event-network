import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Clock, MapPin, Filter } from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

interface ScheduleFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDate: string;
  onDateChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedPriority: string;
  onPriorityChange: (value: string) => void;
  scheduleItems: any[];
}

const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedDate,
  onDateChange,
  selectedType,
  onTypeChange,
  selectedPriority,
  onPriorityChange,
  scheduleItems,
}) => {
  // Generate unique dates from schedule items
  const uniqueDates = Array.from(
    new Set(
      scheduleItems
        .map((item) => {
          if (item.start_date) return item.start_date;
          if (item.start_time) return item.start_time.slice(0, 10);
          return null;
        })
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
    if (selectedType !== "all") count++;
    if (selectedPriority !== "all") count++;
    return count;
  };

  const clearFilters = () => {
    onSearchChange("");
    onDateChange("all");
    onTypeChange("all");
    onPriorityChange("all");
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Header with filter badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">Filter Schedule</span>
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
          placeholder="Search schedule items..."
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Type filter */}
        <div>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="session">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Sessions
                </div>
              </SelectItem>
              <SelectItem value="break">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Breaks
                </div>
              </SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="meal">Meals</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority filter */}
        <div>
          <Select value={selectedPriority} onValueChange={onPriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFilters;