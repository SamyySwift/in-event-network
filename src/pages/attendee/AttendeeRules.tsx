import React from 'react';
import { Shield, AlertTriangle, Info, CheckCircle, Loader } from 'lucide-react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRules } from '@/hooks/useRules';
import EventAccessGuard from '@/components/EventAccessGuard';
import { useEventParticipation } from '@/hooks/useEventParticipation';

const AttendeeRules = () => {
  const { rules, loading } = useRules();
  const { getJoinedEvents, loading: participationLoading } = useEventParticipation();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Group rules by category
  const groupedRules = rules.reduce((acc, rule) => {
    const category = rule.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(rule);
    return acc;
  }, {} as Record<string, typeof rules>);

  const hasEventAccess = getJoinedEvents().length > 0;

  if (loading || participationLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <EventAccessGuard hasAccess={hasEventAccess} loading={participationLoading}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
              <Shield className="h-8 w-8 mr-3" />
              Event Rules
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please review and adhere to these rules to ensure a safe and enjoyable event for everyone.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            Object.entries(groupedRules).map(([category, rules]) => (
              <div key={category} className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2">
                  {category}
                </h2>
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <Card key={rule.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-gray-900 dark:text-white">
                              {rule.title}
                            </CardTitle>
                          </div>
                          <Badge className={getPriorityColor(rule.priority)}>
                            {rule.priority} priority
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-700 dark:text-gray-300">
                          {rule.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </EventAccessGuard>
    </AppLayout>
  );
};

export default AttendeeRules;
