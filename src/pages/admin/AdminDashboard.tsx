
import React from 'react';
import { BarChart4, Users, Calendar, User, TrendingUp, Clock, Flag, MessageSquare, Bell } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const AdminDashboard = () => {
  // Mock data for the dashboard
  const stats = [
    { 
      title: "Total Attendees",
      value: 1243,
      change: "+12.5%",
      trend: "up",
      icon: <Users className="h-6 w-6" />
    },
    { 
      title: "Events Scheduled",
      value: 24,
      change: "+3",
      trend: "up",
      icon: <Calendar className="h-6 w-6" />
    },
    { 
      title: "Speakers",
      value: 36,
      change: "+5",
      trend: "up",
      icon: <User className="h-6 w-6" />
    },
    { 
      title: "Open Questions",
      value: 58,
      change: "-14",
      trend: "down",
      icon: <Flag className="h-6 w-6" />
    }
  ];

  const recentActivities = [
    { id: 1, type: "registration", user: "Emma Thompson", time: "5 minutes ago" },
    { id: 2, type: "question", user: "Alex Johnson", time: "15 minutes ago" },
    { id: 3, type: "schedule_change", user: "Admin", time: "45 minutes ago" },
    { id: 4, type: "registration", user: "Michael Chen", time: "1 hour ago" },
    { id: 5, type: "feedback", user: "Sofia Martinez", time: "2 hours ago" },
    { id: 6, type: "announcement", user: "Admin", time: "3 hours ago" }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your event management dashboard.</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="backdrop-blur-sm border-none shadow-md bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className={`flex items-center text-xs mt-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? 
                    <TrendingUp className="h-3 w-3 mr-1" /> : 
                    <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />} 
                  {stat.change} from last month
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm border-none shadow-md bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>View your event analytics and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="attendance">
                  <TabsList className="mb-4">
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                    <TabsTrigger value="registrations">Registrations</TabsTrigger>
                    <TabsTrigger value="engagement">Engagement</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="attendance" className="space-y-4">
                    <div className="bg-muted/50 w-full rounded-lg aspect-[3/2] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <BarChart4 className="w-16 h-16 mx-auto mb-4 text-muted" />
                        <p>Interactive charts would go here</p>
                        <p className="text-xs mt-2">Attendee analytics visualization</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="registrations" className="space-y-4">
                    <div className="bg-muted/50 w-full rounded-lg aspect-[3/2] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <BarChart4 className="w-16 h-16 mx-auto mb-4 text-muted" />
                        <p>Registration trend charts would go here</p>
                        <p className="text-xs mt-2">Daily and weekly registration data</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="engagement" className="space-y-4">
                    <div className="bg-muted/50 w-full rounded-lg aspect-[3/2] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <BarChart4 className="w-16 h-16 mx-auto mb-4 text-muted" />
                        <p>Engagement metrics would go here</p>
                        <p className="text-xs mt-2">Q&A, feedback, and session attendance data</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Download Report</Button>
                <Button>View All Analytics</Button>
              </CardFooter>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-sm border-none shadow-md bg-gradient-to-br from-white to-gray-50 h-full">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest events from your conference</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="mr-4 mt-0.5">
                        {activity.type === "registration" && (
                          <div className="p-2 rounded-full bg-green-100 text-green-600">
                            <Users className="h-4 w-4" />
                          </div>
                        )}
                        {activity.type === "question" && (
                          <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                            <Flag className="h-4 w-4" />
                          </div>
                        )}
                        {activity.type === "schedule_change" && (
                          <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                            <Clock className="h-4 w-4" />
                          </div>
                        )}
                        {activity.type === "feedback" && (
                          <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                            <MessageSquare className="h-4 w-4" />
                          </div>
                        )}
                        {activity.type === "announcement" && (
                          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                            <Bell className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>
                          {activity.type === "registration" && " registered for the event"}
                          {activity.type === "question" && " asked a new question"}
                          {activity.type === "schedule_change" && " updated the event schedule"}
                          {activity.type === "feedback" && " submitted feedback"}
                          {activity.type === "announcement" && " posted a new announcement"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">View All Activity</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="backdrop-blur-sm border border-primary/10 hover:border-primary/20 shadow-md bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="text-lg font-medium">Create Event</h3>
                <p className="text-sm text-muted-foreground mb-4">Add a new event to your schedule</p>
                <Button variant="outline" className="w-full">Get Started</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm border border-primary/10 hover:border-primary/20 shadow-md bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <Bell className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="text-lg font-medium">Announcement</h3>
                <p className="text-sm text-muted-foreground mb-4">Send message to all attendees</p>
                <Button variant="outline" className="w-full">Compose</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm border border-primary/10 hover:border-primary/20 shadow-md bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <User className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="text-lg font-medium">Add Speaker</h3>
                <p className="text-sm text-muted-foreground mb-4">Register a new presenter</p>
                <Button variant="outline" className="w-full">Add Now</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm border border-primary/10 hover:border-primary/20 shadow-md bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart4 className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="text-lg font-medium">Reports</h3>
                <p className="text-sm text-muted-foreground mb-4">Generate analytics reports</p>
                <Button variant="outline" className="w-full">View Reports</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
