
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AttendeeStatsCards from './AttendeeStatsCards';
import AttendeesList from './AttendeesList';
import ClearAttendeesDialog from './ClearAttendeesDialog';
import { useAdminAttendees } from '@/hooks/useAdminAttendees';

const AttendeeManagementSection = () => {
  const { 
    attendees, 
    isLoading, 
    clearAttendees, 
    isClearing 
  } = useAdminAttendees();

  const handleClearAttendees = async () => {
    return new Promise<void>((resolve, reject) => {
      clearAttendees(undefined, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error)
      });
    });
  };

  return (
    <div className="space-y-6">
      <AttendeeStatsCards attendees={attendees} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendeesList attendees={attendees} isLoading={isLoading} />
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your attendee data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClearAttendeesDialog 
                onConfirm={handleClearAttendees}
                isClearing={isClearing}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AttendeeManagementSection;
