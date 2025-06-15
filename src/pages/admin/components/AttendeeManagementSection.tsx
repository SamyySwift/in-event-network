
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

type AttendeeManagementSectionProps = {
  eventName: string;
  children: React.ReactNode;
};

const AttendeeManagementSection: React.FC<AttendeeManagementSectionProps> = ({
  eventName,
  children,
}) => {
  return (
    <div className="glass-card p-6 rounded-xl space-y-8 shadow-xl">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 via-purple-500 to-indigo-600 shadow-md">
            <Users className="w-6 h-6 text-white" />
          </span>
          <div>
            <div className="uppercase text-xs font-bold text-primary-600 tracking-wide">Attendees</div>
            <div className="text-lg font-semibold text-primary-900 dark:text-primary-100">
              {eventName}
            </div>
          </div>
        </div>
      </div>

      {/* Add Attendee Form (disabled for now, as creation not implemented) */}
      <Card className="mb-6 glass-card bg-gradient-to-br from-white/90 via-primary-50/70 to-primary-100/60 transition-all animate-fade-in shadow-lg">
        <CardHeader>
          <CardTitle>Add New Attendee (Coming soon)</CardTitle>
          <CardDescription>
            Manual addition of attendees is currently not available in this admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Please use the event registration link to add attendees.
          </div>
        </CardContent>
      </Card>

      {children}
    </div>
  );
};

export default AttendeeManagementSection;
