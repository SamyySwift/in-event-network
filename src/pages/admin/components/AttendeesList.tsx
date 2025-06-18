
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AttendeeCard from './AttendeeCard';

type Attendee = {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url?: string;
  bio?: string;
  company?: string;
  event_name: string;
  joined_at: string;
};

type AttendeesListProps = {
  filteredAttendees: Attendee[];
  totalAttendees: number;
  eventName: string;
  searchTerm: string;
  filterRole: string;
};

const AttendeesList: React.FC<AttendeesListProps> = ({
  filteredAttendees,
  totalAttendees,
  eventName,
  searchTerm,
  filterRole,
}) => {
  return (
    <Card className="sm:p-4 p-2 rounded-lg">
      <CardHeader className="px-0 pb-2">
        <CardTitle className="text-base sm:text-lg truncate">{eventName ? "Current Attendees" : "Attendees"}</CardTitle>
        <CardDescription className="text-xs sm:text-sm truncate">{filteredAttendees.length} of {totalAttendees} attendees for {eventName}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {filteredAttendees.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            {searchTerm || filterRole !== 'all' 
              ? 'No attendees match your search criteria.'
              : 'No attendees registered yet for this event.'
            }
          </p>
        ) : (
          <div className="space-y-4">
            {filteredAttendees.map((attendee) => (
              <AttendeeCard
                key={attendee.id}
                attendee={attendee}
                onEdit={() => {}} // no-op
                onDelete={() => {}} // no-op
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendeesList;
