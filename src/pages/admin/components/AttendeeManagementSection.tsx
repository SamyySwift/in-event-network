
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface AttendeeManagementSectionProps {
  eventName: string;
  children: React.ReactNode;
}

const AttendeeManagementSection: React.FC<AttendeeManagementSectionProps> = ({
  eventName,
  children,
}) => {
  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-400 shadow-md shadow-purple-500/20 flex-shrink-0">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base sm:text-lg lg:text-xl truncate">
              Attendee Management
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground truncate">
              Manage attendees for {eventName}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 space-y-4 sm:space-y-6">
        {children}
      </CardContent>
    </Card>
  );
};

export default AttendeeManagementSection;
