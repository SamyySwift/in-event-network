
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDataTable from '@/components/admin/AdminDataTable';
import { TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminAttendees = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [attendees, setAttendees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.id) {
      fetchHostAttendees();
      
      // Set up real-time subscription for attendees joining this host's events
      const channel = supabase
        .channel('host-attendees-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_participants'
          },
          (payload) => {
            console.log('Real-time event participant update:', payload);
            fetchHostAttendees();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser?.id]);

  const fetchHostAttendees = async () => {
    if (!currentUser?.id) return;

    try {
      // Get attendees who have joined this host's events
      const { data, error } = await supabase
        .from('event_participants')
        .select(`
          user_id,
          joined_at,
          profiles:user_id (
            id,
            name,
            email,
            role,
            photo_url,
            bio,
            niche,
            company,
            networking_preferences,
            twitter_link,
            facebook_link,
            linkedin_link,
            instagram_link,
            snapchat_link,
            tiktok_link,
            github_link,
            website_link
          ),
          events:event_id (
            host_id,
            name
          )
        `)
        .eq('events.host_id', currentUser.id);

      if (error) throw error;

      // Transform and deduplicate attendees (same user might join multiple events)
      const uniqueAttendees = new Map<string, User>();
      
      (data || []).forEach(participant => {
        if (participant.profiles && participant.events) {
          const profile = participant.profiles;
          const attendee: User = {
            id: profile.id,
            name: profile.name || 'Unknown',
            email: profile.email || '',
            role: profile.role as 'host' | 'attendee',
            photoUrl: profile.photo_url,
            bio: profile.bio,
            niche: profile.niche,
            company: profile.company,
            networkingPreferences: profile.networking_preferences || [],
            links: {
              twitter: profile.twitter_link,
              facebook: profile.facebook_link,
              linkedin: profile.linkedin_link,
              instagram: profile.instagram_link,
              snapchat: profile.snapchat_link,
              tiktok: profile.tiktok_link,
              github: profile.github_link,
              website: profile.website_link,
            },
          };
          uniqueAttendees.set(profile.id, attendee);
        }
      });

      setAttendees(Array.from(uniqueAttendees.values()));
    } catch (error) {
      console.error('Error fetching host attendees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter attendees based on tab
  const getFilteredAttendees = () => {
    if (activeTab === 'all') return attendees;
    return attendees.filter(attendee => {
      switch (activeTab) {
        case 'technical':
          return attendee.niche?.toLowerCase().includes('tech') || 
                 attendee.niche?.toLowerCase().includes('dev') ||
                 attendee.niche?.toLowerCase().includes('engineer');
        case 'design':
          return attendee.niche?.toLowerCase().includes('design') || 
                 attendee.niche?.toLowerCase().includes('ux') ||
                 attendee.niche?.toLowerCase().includes('ui');
        case 'business':
          return attendee.niche?.toLowerCase().includes('business') || 
                 attendee.niche?.toLowerCase().includes('management') ||
                 attendee.niche?.toLowerCase().includes('marketing');
        default:
          return true;
      }
    });
  };

  const columns = [
    {
      header: 'Attendee',
      accessorKey: 'name',
      cell: (value: string, row: User) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={row.photoUrl} alt={row.name} />
            <AvatarFallback>{row.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.name}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Niche/Industry',
      accessorKey: 'niche',
      cell: (value: string) => value || 'Not specified',
    },
    {
      header: 'Company',
      accessorKey: 'company',
      cell: (value: string) => value || 'Not specified',
    },
    {
      header: 'Networking Preferences',
      accessorKey: 'networkingPreferences',
      cell: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            value.map((pref, i) => (
              <Badge key={i} variant="outline">{pref}</Badge>
            ))
          ) : (
            'None specified'
          )}
        </div>
      ),
    }
  ];

  const handleEditAttendee = (attendee: User) => {
    console.log('Edit attendee', attendee);
    toast({
      title: "Edit Attendee",
      description: "Edit functionality will be implemented soon",
    });
  };

  const handleDeleteAttendee = async (attendee: User) => {
    if (!currentUser?.id) return;

    try {
      // Remove attendee from all of this host's events
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('user_id', attendee.id)
        .in('event_id', 
          supabase
            .from('events')
            .select('id')
            .eq('host_id', currentUser.id)
        );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendee removed from your events",
      });

      fetchHostAttendees();
    } catch (error) {
      console.error('Error removing attendee:', error);
      toast({
        title: "Error",
        description: "Failed to remove attendee",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading attendees...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Event Attendees"
        description={`Manage attendees who have joined your events (${attendees.length} total)`}
        tabs={[
          { id: 'all', label: `All Attendees (${attendees.length})` },
          { id: 'technical', label: 'Technical' },
          { id: 'design', label: 'Design' },
          { id: 'business', label: 'Business' },
        ]}
        defaultTab="all"
        onTabChange={setActiveTab}
      >
        {['all', 'technical', 'design', 'business'].map(tabId => (
          <TabsContent key={tabId} value={tabId} className="space-y-4">
            {attendees.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No attendees have joined your events yet. Share your event access codes to get started!
                </p>
              </div>
            ) : (
              <AdminDataTable
                columns={columns}
                data={getFilteredAttendees()}
                onEdit={handleEditAttendee}
                onDelete={handleDeleteAttendee}
              />
            )}
          </TabsContent>
        ))}
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminAttendees;
