
import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  TrendingUp, 
  Bell,
  QrCode
} from 'lucide-react';

const AdminDashboard = () => {
  // Mock data for dashboard metrics
  const metrics = [
    {
      title: 'Total Attendees',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Sessions',
      value: '24',
      change: '+5%',
      icon: Calendar,
      color: 'text-green-600',
    },
    {
      title: 'Questions Asked',
      value: '156',
      change: '+23%',
      icon: MessageSquare,
      color: 'text-purple-600',
    },
    {
      title: 'Poll Responses',
      value: '1,892',
      change: '+18%',
      icon: BarChart3,
      color: 'text-orange-600',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'question',
      content: 'New question submitted for "AI in Healthcare" session',
      time: '2 minutes ago',
      status: 'pending'
    },
    {
      id: 2,
      type: 'registration',
      content: '5 new attendees registered',
      time: '5 minutes ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'poll',
      content: 'Poll "Keynote Feedback" ended with 234 responses',
      time: '10 minutes ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'announcement',
      content: 'New announcement published: "Lunch Break Extended"',
      time: '15 minutes ago',
      status: 'published'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your event.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{metric.change}</span> from last hour
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* QR Code Generator Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Event QR Code
            </h2>
            <QRCodeGenerator 
              eventName="Connect 2025" 
              eventUrl={`${window.location.origin}/register`}
            />
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest updates from your event
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.content}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        activity.status === 'success' ? 'default' :
                        activity.status === 'pending' ? 'secondary' :
                        activity.status === 'completed' ? 'outline' : 'default'
                      }
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Event Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">85%</div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">92%</div>
                <p className="text-sm text-muted-foreground">Satisfaction Score</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">67%</div>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
