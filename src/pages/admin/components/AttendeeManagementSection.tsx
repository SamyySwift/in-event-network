
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAttendees } from '@/hooks/useAdminAttendees';
import ClearAttendeesDialog from './ClearAttendeesDialog';

interface AttendeeManagementSectionProps {
  children: React.ReactNode;
  eventName: string;
}

const AttendeeManagementSection: React.FC<AttendeeManagementSectionProps> = ({ children, eventName }) => {
  const { clearAttendees, isClearing } = useAdminAttendees();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <Card className="glass-card hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-400 shadow-md shadow-green-500/20">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Attendee Management</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage attendees for {eventName}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
          </CardContent>
        </Card>
      </div>

      {/* Actions Sidebar */}
      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>
              Manage all attendees at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ClearAttendeesDialog
              onConfirm={clearAttendees}
              isClearing={isClearing}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendeeManagementSection;
