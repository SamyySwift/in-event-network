
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
import { 
  Switch, 
} from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Palette, 
  Lock, 
  Globe, 
  Mail, 
  CheckCircle,
  Shield,
  Users,
  Share
} from 'lucide-react';

const AdminSettings = () => {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your application settings and preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings size={16} />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell size={16} />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette size={16} />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Lock size={16} />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Share size={16} />
              <span className="hidden sm:inline">Integrations</span>
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
                  Last updated: June 1, 2025
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
                  Configure how and when notifications are sent
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
                    <Switch id="email-registrations" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Important Updates</Label>
                      <p className="text-xs text-muted-foreground">
                        Critical information and updates about the event
                      </p>
                    </div>
                    <Switch id="email-updates" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Summary</Label>
                      <p className="text-xs text-muted-foreground">
                        Daily digest of event activities and metrics
                      </p>
                    </div>
                    <Switch id="email-summary" />
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
                    <Switch id="app-questions" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Suggestions</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify when attendees submit new suggestions
                      </p>
                    </div>
                    <Switch id="app-suggestions" defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-5">
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>App Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of your event app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="primary-color" 
                          type="color" 
                          defaultValue="#9b87f5" 
                          className="w-12 h-10 p-1"
                        />
                        <Input defaultValue="#9b87f5" className="flex-1" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="secondary-color" 
                          type="color" 
                          defaultValue="#7E69AB" 
                          className="w-12 h-10 p-1"
                        />
                        <Input defaultValue="#7E69AB" className="flex-1" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo-upload">Event Logo</Label>
                      <Input id="logo-upload" type="file" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="banner-upload">Event Banner</Label>
                      <Input id="banner-upload" type="file" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="dark-mode" defaultChecked />
                    <Label htmlFor="dark-mode">Allow Dark Mode</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t pt-5">
                <Button variant="outline">Preview</Button>
                <Button>Save Theme</Button>
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
                    <Switch id="privacy-analytics" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Attendee Activity Tracking</Label>
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
                    <Switch id="privacy-followup" defaultChecked />
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

          {/* Integrations Settings */}
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Integration</CardTitle>
                <CardDescription>
                  Connect email services for notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-host">SMTP Host</Label>
                    <Input id="smtp-host" defaultValue="smtp.example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">SMTP Port</Label>
                    <Input id="smtp-port" defaultValue="587" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-user">Username</Label>
                    <Input id="smtp-user" defaultValue="events@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-password">Password</Label>
                    <Input id="smtp-password" type="password" value="********" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-primary" />
                    <div>
                      <h4 className="font-medium">Test Connection</h4>
                      <p className="text-sm text-muted-foreground">
                        Send a test email to verify settings
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Send Test</Button>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-5">
                <Button>Save Email Settings</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Social Media Integration</CardTitle>
                <CardDescription>
                  Connect social media accounts for sharing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-500 text-white rounded-full p-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.719 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Twitter</h4>
                      <p className="text-sm text-muted-foreground">
                        Not connected
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-700 text-white rounded-full p-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Facebook</h4>
                      <p className="text-sm text-primary">
                        Connected as Tech Conference
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Disconnect</Button>
                </div>
                
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded-full p-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                        <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium">Instagram</h4>
                      <p className="text-sm text-muted-foreground">
                        Not connected
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
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
