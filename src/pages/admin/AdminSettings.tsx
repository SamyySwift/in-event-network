import React from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Bell, User, CheckCircle, Trash2 } from "lucide-react";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";


function AdminSettingsContent() {
  const { currentUser } = useAuth();

  return (
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
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings size={16} />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell size={16} />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            <span className="hidden sm:inline">Profile</span>
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
                  <Input
                    id="event-name"
                    defaultValue="Annual Tech Conference 2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-website">Event Website</Label>
                  <Input
                    id="event-website"
                    type="url"
                    defaultValue="https://techconf2025.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-description">Description</Label>
                <Input
                  id="event-description"
                  defaultValue="The largest tech conference in the region"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    defaultValue="2025-06-15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    defaultValue="2025-06-17"
                  />
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
                <Label htmlFor="auto-timezone">
                  Auto-detect attendee timezone
                </Label>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-5">
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          // ... existing code ...
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Welcome{" "}
                {currentUser?.name || currentUser?.email}.
                Manage your profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={currentUser?.photoUrl} />
                  <AvatarFallback>
                    {currentUser?.email?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-xl font-semibold">
                    {currentUser?.name || currentUser?.email}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.email}
                  </p>
                  <div className="flex justify-center sm:justify-start">
                    <Button size="sm" variant="outline" className="mt-2">
                      Change Avatar
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Account Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={currentUser?.email}
                    disabled
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
                <div className="border border-destructive/20 rounded-md p-4 bg-destructive/5">
                  <h4 className="font-medium mb-2">Delete Your Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <DeleteAccountDialog userName={currentUser?.name || currentUser?.email || ""} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const AdminSettings = AdminSettingsContent;

export default AdminSettings;
