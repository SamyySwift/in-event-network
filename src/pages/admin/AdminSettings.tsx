
import React from 'react';
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
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your event settings and preferences
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
                <CardTitle>Event Configuration</CardTitle>
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
              <CardFooter className="justify-end border-t pt-5">
                <Button>
                  <CheckCircle size={16} className="mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>App Configuration</CardTitle>
                <CardDescription>
                  Configure app behavior and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Anonymous Questions</Label>
                    <p className="text-xs text-muted-foreground">
                      Let attendees ask questions without revealing their identity
                    </p>
                  </div>
                  <Switch id="anonymous-questions" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Networking</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow attendees to connect with each other
                    </p>
                  </div>
                  <Switch id="enable-networking" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Polls</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow real-time polling during sessions
                    </p>
                  </div>
                  <Switch id="enable-polls" defaultChecked />
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-5">
                <Button>Save Configuration</Button>
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
                  <h3 className="text-sm font-medium">Admin Notifications</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Questions</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify when attendees submit new questions
                      </p>
                    </div>
                    <Switch id="notify-questions" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Suggestions</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify when attendees submit new suggestions
                      </p>
                    </div>
                    <Switch id="notify-suggestions" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Registrations</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify when new attendees register
                      </p>
                    </div>
                    <Switch id="notify-registrations" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Important system notifications and updates
                      </p>
                    </div>
                    <Switch id="notify-system" defaultChecked />
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
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Control data privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Shield size={16} />
                    Data Collection
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics</Label>
                      <p className="text-xs text-muted-foreground">
                        Collect anonymous usage data to improve the app
                      </p>
                    </div>
                    <Switch id="privacy-analytics" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Activity Tracking</Label>
                      <p className="text-xs text-muted-foreground">
                        Track which sessions attendees visit
                      </p>
                    </div>
                    <Switch id="privacy-tracking" defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Users size={16} />
                    Attendee Privacy
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Public Attendee List</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow attendees to see who else is attending
                      </p>
                    </div>
                    <Switch id="privacy-attendee-list" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Contact Sharing</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow attendees to share contact information
                      </p>
                    </div>
                    <Switch id="privacy-contact-sharing" defaultChecked />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Globe size={16} />
                    Data Export
                  </h3>
                  
                  <div className="flex items-center justify-between border p-4 rounded-lg">
                    <div>
                      <h4 className="font-medium">Export Event Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Download a complete export of all event data
                      </p>
                    </div>
                    <Button variant="outline">Export</Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-5">
                <Button>Save Privacy Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
