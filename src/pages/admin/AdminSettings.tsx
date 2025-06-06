
import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Lock, 
  CheckCircle,
  Shield,
  Users,
  Globe
} from 'lucide-react';

const AdminSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState({
    newRegistrations: true,
    importantUpdates: true,
    dailySummary: false,
  });

  const [inAppNotifications, setInAppNotifications] = useState({
    newQuestions: true,
    newSuggestions: true,
    connectionRequests: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    analytics: true,
    attendeeTracking: true,
    publicAttendeeList: true,
    contactSharing: true,
    followupEmails: true,
  });

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your event administration settings
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings size={16} />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell size={16} />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock size={16} />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>
                  Configure the basic information for your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-name">Event Name</Label>
                    <Input id="event-name" defaultValue="Annual Tech Conference 2025" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-website">Event Website</Label>
                    <Input id="event-website" type="url" defaultValue="https://techconf2025.com" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-description">Description</Label>
                  <Input id="event-description" defaultValue="The largest tech conference in the region" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" defaultValue="2025-06-15" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" defaultValue="2025-06-17" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" defaultValue="America/Los_Angeles" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t pt-5">
                <div className="text-sm text-muted-foreground">
                  Last updated: June 6, 2025
                </div>
                <Button>
                  <CheckCircle size={16} className="mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>
                  Configure language and localization preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <Input id="language" defaultValue="English (US)" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Input id="date-format" defaultValue="MM/DD/YYYY" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="auto-timezone" defaultChecked />
                  <Label htmlFor="auto-timezone">Auto-detect attendee timezone</Label>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-5">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Registrations</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive an email when new attendees register
                      </p>
                    </div>
                    <Switch 
                      checked={emailNotifications.newRegistrations}
                      onCheckedChange={(checked) => 
                        setEmailNotifications(prev => ({ ...prev, newRegistrations: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Important Updates</Label>
                      <p className="text-xs text-muted-foreground">
                        Critical information and updates about the event
                      </p>
                    </div>
                    <Switch 
                      checked={emailNotifications.importantUpdates}
                      onCheckedChange={(checked) => 
                        setEmailNotifications(prev => ({ ...prev, importantUpdates: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Summary</Label>
                      <p className="text-xs text-muted-foreground">
                        Daily digest of event activities and metrics
                      </p>
                    </div>
                    <Switch 
                      checked={emailNotifications.dailySummary}
                      onCheckedChange={(checked) => 
                        setEmailNotifications(prev => ({ ...prev, dailySummary: checked }))
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">In-App Notifications</h3>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Questions</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify when attendees submit new questions
                      </p>
                    </div>
                    <Switch 
                      checked={inAppNotifications.newQuestions}
                      onCheckedChange={(checked) => 
                        setInAppNotifications(prev => ({ ...prev, newQuestions: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Suggestions</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify when attendees submit new suggestions
                      </p>
                    </div>
                    <Switch 
                      checked={inAppNotifications.newSuggestions}
                      onCheckedChange={(checked) => 
                        setInAppNotifications(prev => ({ ...prev, newSuggestions: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Connection Requests</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify when attendees send connection requests
                      </p>
                    </div>
                    <Switch 
                      checked={inAppNotifications.connectionRequests}
                      onCheckedChange={(checked) => 
                        setInAppNotifications(prev => ({ ...prev, connectionRequests: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-5">
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control data privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Shield size={16} />
                    Data Collection & Usage
                  </h3>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics</Label>
                      <p className="text-xs text-muted-foreground">
                        Collect anonymous usage data to improve the app
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.analytics}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, analytics: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Attendee Activity Tracking</Label>
                      <p className="text-xs text-muted-foreground">
                        Track which sessions attendees visit
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.attendeeTracking}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, attendeeTracking: checked }))
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Users size={16} />
                    Attendee Networking
                  </h3>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Attendee List</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow attendees to see who else is attending
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.publicAttendeeList}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, publicAttendeeList: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Contact Sharing</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow attendees to share contact information
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.contactSharing}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, contactSharing: checked }))
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Globe size={16} />
                    Marketing & Communications
                  </h3>
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Follow-up Emails</Label>
                      <p className="text-xs text-muted-foreground">
                        Send post-event surveys and information
                      </p>
                    </div>
                    <Switch 
                      checked={privacySettings.followupEmails}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, followupEmails: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-5">
                <Button>Save Privacy Settings</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>
                  Manage event data and export options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div>
                    <h4 className="font-medium">Export All Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Download a complete export of all event data
                    </p>
                  </div>
                  <Button variant="outline">Export</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
