import React, { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bell, 
  User, 
  CheckCircle, 
  Trash2, 
  Shield, 
  Globe, 
  Palette, 
  Database, 
  Lock,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Camera,
  Edit3
} from "lucide-react";
import { DeleteAccountDialog } from "@/components/profile/DeleteAccountDialog";
import { BrandingSettings } from "@/components/admin/BrandingSettings";
import { toast } from "sonner";
function AdminSettingsContent() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: true
  });
  const [theme, setTheme] = useState("system");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent" />
        <div className="relative p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                <Settings className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Admin Settings
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Configure your application preferences, notifications, and account settings to optimize your admin experience.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin Account
                </Badge>
                <Badge variant="outline" className="border-emerald-200 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto bg-muted/50 p-1 h-auto">
          <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-3">
            <Settings size={16} />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-3">
            <Palette size={16} />
            <span className="hidden sm:inline">Branding</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-3">
            <Bell size={16} />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm py-3">
            <User size={16} />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
        </TabsList>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-6">
          <BrandingSettings />
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Appearance Settings */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Appearance</CardTitle>
                    <CardDescription>Customize your interface theme and display settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Theme Preference</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "light", icon: Sun, label: "Light" },
                      { value: "dark", icon: Moon, label: "Dark" },
                      { value: "system", icon: Monitor, label: "System" }
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={theme === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme(option.value)}
                        className="justify-center gap-2"
                      >
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">High Contrast Mode</p>
                    <p className="text-xs text-muted-foreground">Enhance visibility with increased contrast</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Security</CardTitle>
                    <CardDescription>Manage your account security and privacy settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Session Timeout</p>
                    <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    30 min <Edit3 className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Login Notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified of new sign-ins</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Application Settings */}
            <Card className="hover:shadow-md transition-shadow md:col-span-2">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Application Preferences</CardTitle>
                    <CardDescription>Configure general application behavior and features</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Auto-save Changes</p>
                      <p className="text-xs text-muted-foreground">Automatically save form changes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Compact View</p>
                      <p className="text-xs text-muted-foreground">Show more content in tables</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Real-time Updates</p>
                      <p className="text-xs text-muted-foreground">Live data synchronization</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Advanced Features</p>
                      <p className="text-xs text-muted-foreground">Enable experimental features</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Email Notifications</CardTitle>
                    <CardDescription>Configure when and how you receive email updates</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Event Updates</p>
                    <p className="text-xs text-muted-foreground">New events and changes</p>
                  </div>
                  <Switch 
                    checked={notifications.email} 
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">System Alerts</p>
                    <p className="text-xs text-muted-foreground">Important system notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Weekly Reports</p>
                    <p className="text-xs text-muted-foreground">Summary of activity and stats</p>
                  </div>
                  <Switch 
                    checked={notifications.marketing} 
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Push Notifications</CardTitle>
                    <CardDescription>Real-time notifications on your devices</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Browser Notifications</p>
                    <p className="text-xs text-muted-foreground">Desktop and mobile browser alerts</p>
                  </div>
                  <Switch 
                    checked={notifications.push} 
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Urgent Alerts Only</p>
                    <p className="text-xs text-muted-foreground">Critical issues and emergencies</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Quiet Hours</p>
                    <p className="text-xs text-muted-foreground">Pause notifications during set times</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    10 PM - 8 AM <Edit3 className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                  <CardDescription>
                    Welcome back, {currentUser?.name || currentUser?.email}. Manage your account details and preferences.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-6 sm:flex-row sm:space-y-0 sm:space-x-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                    <AvatarImage src={currentUser?.photoUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xl font-semibold">
                      {currentUser?.email?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="sm" 
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 shadow-lg"
                    variant="secondary"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div>
                    <h3 className="text-2xl font-bold">
                      {currentUser?.name || currentUser?.email}
                    </h3>
                    <p className="text-muted-foreground">
                      {currentUser?.email}
                    </p>
                    <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                      <Badge variant="secondary">Administrator</Badge>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center sm:justify-start">
                    <Button size="sm" variant="outline" className="gap-2">
                      <Camera className="h-4 w-4" />
                      Change Photo
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2">
                      <Edit3 className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
                      <Input 
                        id="name" 
                        defaultValue={currentUser?.name || ""} 
                        placeholder="Enter your display name"
                        className="bg-muted/50 border-muted-foreground/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        defaultValue={currentUser?.email} 
                        disabled 
                        className="bg-muted/30"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Profile Visibility</p>
                        <p className="text-xs text-muted-foreground">Make your profile visible to other admins</p>
                      </div>
                      <Switch 
                        checked={!isPrivate} 
                        onCheckedChange={(checked) => setIsPrivate(!checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Activity Status</p>
                        <p className="text-xs text-muted-foreground">Show when you're online</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-base flex items-center gap-2 text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Danger Zone
                </h3>
                <Card className="border-destructive/20 bg-destructive/5">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-destructive">Delete Account</h4>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Permanently delete your account and all associated data. This action cannot be undone and will immediately revoke all access.
                        </p>
                      </div>
                      <DeleteAccountDialog userName={currentUser?.name || currentUser?.email || ""} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Actions */}
      <Card className="sticky bottom-4 shadow-lg border-border/50 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              Changes are saved automatically
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Reset to Default
              </Button>
              <Button onClick={handleSaveSettings} size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
const AdminSettings = AdminSettingsContent;
export default AdminSettings;