
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import EventSelector from '@/components/admin/EventSelector';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, Building } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminEventContext, AdminEventProvider } from '@/hooks/useAdminEventContext';

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  type: string;
  priority: string;
  event_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ScheduleFormData {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  type: string;
  priority: string;
}

const AdminScheduleContent = () => {
  const [activeTab, setActiveTab] = useState<string>('view');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { selectedEventId, selectedEvent } = useAdminEventContext();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ScheduleFormData>();

  useEffect(() => {
    if (selectedEventId) {
      fetchScheduleItems();
    } else {
      setScheduleItems([]);
      setLoading(false);
    }
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin-schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_items'
        },
        () => {
          console.log('Schedule items updated, refetching...');
          if (selectedEventId) {
            fetchScheduleItems();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedEventId]);

  const fetchScheduleItems = async () => {
    if (!selectedEventId) return;

    try {
      console.log('Fetching schedule items for event:', selectedEventId);
      
      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('event_id', selectedEventId)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching schedule items:', error);
        throw error;
      }

      console.log('Schedule items data:', data);
      setScheduleItems(data || []);
    } catch (error) {
      console.error('Error fetching schedule items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch schedule items. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ScheduleFormData) => {
    if (!selectedEventId) {
      toast({
        title: "Error",
        description: "Please select an event first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const scheduleData = {
        ...data,
        event_id: selectedEventId,
        created_by: currentUser?.id,
      };

      let result;
      if (editingItem) {
        result = await supabase
          .from('schedule_items')
          .update(scheduleData)
          .eq('id', editingItem.id);
      } else {
        result = await supabase
          .from('schedule_items')
          .insert([scheduleData]);
      }

      if (result.error) {
        console.error('Error saving schedule item:', result.error);
        throw result.error;
      }

      toast({
        title: "Success",
        description: `Schedule item ${editingItem ? 'updated' : 'created'} successfully`,
      });

      reset();
      setEditingItem(null);
      setActiveTab('view');
      fetchScheduleItems();
    } catch (error) {
      console.error('Error saving schedule item:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule item",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setValue('title', item.title);
    setValue('description', item.description || '');
    setValue('start_time', item.start_time.slice(0, 16)); // Format for datetime-local input
    setValue('end_time', item.end_time.slice(0, 16));
    setValue('location', item.location || '');
    setValue('type', item.type);
    setValue('priority', item.priority);
    setActiveTab('add');
  };

  const handleDelete = async (item: ScheduleItem) => {
    try {
      const { error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', item.id);

      if (error) {
        console.error('Error deleting schedule item:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Schedule item deleted successfully",
      });

      fetchScheduleItems();
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule item",
        variant: "destructive",
      });
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'session':
        return <Badge variant="default">Session</Badge>;
      case 'break':
        return <Badge variant="secondary">Break</Badge>;
      case 'networking':
        return <Badge className="bg-blue-100 text-blue-800">Networking</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading schedule...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <EventSelector />
        
        {!selectedEventId && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Building className="h-5 w-5" />
                <span className="font-medium">
                  Please select an event above to manage its schedule.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedEventId && (
          <AdminPageHeader
            title={`Schedule for ${selectedEvent?.name || 'Selected Event'}`}
            description="Manage event schedule items that attendees will see"
            tabs={[
              { id: 'view', label: 'View Schedule' },
              { id: 'add', label: editingItem ? 'Edit Item' : 'Add Item' }
            ]}
            defaultTab="view"
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab === 'add' && !editingItem) {
                reset();
              }
            }}
          >
            <TabsContent value="view" className="space-y-4">
              {scheduleItems.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No schedule items created yet.</p>
                    <p className="text-sm mt-2">Create your first schedule item to get started.</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setActiveTab('add')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Schedule Item
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {scheduleItems.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {item.description}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-destructive border-destructive/20 hover:bg-destructive/10"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {format(new Date(item.start_time), 'MMM d, h:mm a')} - {format(new Date(item.end_time), 'h:mm a')}
                          </div>
                          {item.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {item.location}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {getTypeBadge(item.type)}
                          {getPriorityBadge(item.priority)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{editingItem ? 'Edit Schedule Item' : 'Add New Schedule Item'}</CardTitle>
                  <CardDescription>
                    {editingItem ? 'Update the schedule item details' : 'Create a new schedule item for attendees to see'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...register("title", { required: "Title is required" })}
                        placeholder="Enter schedule item title"
                      />
                      {errors.title?.message && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="Enter schedule item description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="datetime-local"
                          {...register("start_time", { required: "Start time is required" })}
                        />
                        {errors.start_time?.message && (
                          <p className="text-sm text-destructive">{errors.start_time.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                          id="end_time"
                          type="datetime-local"
                          {...register("end_time", { required: "End time is required" })}
                        />
                        {errors.end_time?.message && (
                          <p className="text-sm text-destructive">{errors.end_time.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...register("location")}
                        placeholder="Enter location (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select onValueChange={(value) => setValue("type", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="session">Session</SelectItem>
                            <SelectItem value="break">Break</SelectItem>
                            <SelectItem value="networking">Networking</SelectItem>
                            <SelectItem value="meal">Meal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select onValueChange={(value) => setValue("priority", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        <Plus className="h-4 w-4 mr-2" />
                        {editingItem ? 'Update Item' : 'Add Schedule Item'}
                      </Button>
                      {editingItem && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setEditingItem(null);
                            reset();
                            setActiveTab('view');
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </AdminPageHeader>
        )}
      </div>
    </AdminLayout>
  );
};

const AdminSchedule = () => {
  return (
    <AdminEventProvider>
      <AdminScheduleContent />
    </AdminEventProvider>
  );
};

export default AdminSchedule;
