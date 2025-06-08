
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminEventContext } from '@/hooks/useAdminEventContext';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const EventSelector = () => {
  const { selectedEventId, setSelectedEventId, adminEvents, isLoading } = useAdminEventContext();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Loading events...</span>
      </div>
    );
  }

  if (adminEvents.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-muted-foreground">No events created yet</div>
        <Button 
          onClick={() => navigate('/admin/events')} 
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Calendar className="h-4 w-4" />
        Managing Event:
      </div>
      <Select value={selectedEventId || ''} onValueChange={setSelectedEventId}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select an event to manage" />
        </SelectTrigger>
        <SelectContent>
          {adminEvents.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              <div className="flex flex-col">
                <span className="font-medium">{event.name}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(event.start_time).toLocaleDateString()}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EventSelector;
