
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
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="px-3 sm:px-6 pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base lg:text-lg truncate">
          {eventName ? "Current Attendees" : "Attendees"}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm truncate">
          {filteredAttendees.length} of {totalAttendees} attendees for {eventName}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pt-0">
        {filteredAttendees.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-muted-foreground text-xs sm:text-sm">
              {searchTerm || filterRole !== 'all' 
                ? 'No attendees match your search criteria.'
                : 'No attendees registered yet for this event.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
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
