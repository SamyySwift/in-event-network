
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

const AdminAttendees = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [attendees, setAttendees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendees();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('attendees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.attendee'
        },
        (payload) => {
          console.log('Real-time attendee update:', payload);
          fetchAttendees();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'attendee')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedAttendees: User[] = (data || []).map(profile => ({
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
      }));

      setAttendees(transformedAttendees);
    } catch (error) {
      console.error('Error fetching attendees:', error);
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
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', attendee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendee removed successfully",
      });

      fetchAttendees();
    } catch (error) {
      console.error('Error deleting attendee:', error);
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
        title="Attendees"
        description={`Manage event attendees and their profiles (${attendees.length} total)`}
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
            <AdminDataTable
              columns={columns}
              data={getFilteredAttendees()}
              onEdit={handleEditAttendee}
              onDelete={handleDeleteAttendee}
            />
          </TabsContent>
        ))}
      </AdminPageHeader>
    </AdminLayout>
  );
};

export default AdminAttendees;
