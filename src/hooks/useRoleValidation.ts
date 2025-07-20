
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export const useRoleValidation = () => {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const validateRole = async () => {
      if (!currentUser) return;

      try {
        // Fetch fresh user data from database with a longer timeout to ensure profile is loaded
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role, team_member_for_event, current_event_id')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile data:', profileError);
          return;
        }

        // Update local user data if it's different
        if (profileData.role !== currentUser.role || 
            profileData.current_event_id !== currentUser.current_event_id) {
          console.log(`Updating user data. Role: ${profileData.role}, Event: ${profileData.current_event_id}`);
          await updateUser({ 
            role: profileData.role,
            current_event_id: profileData.current_event_id 
          });
        }

        // Only perform redirects for attendees who shouldn't be on admin pages
        // Hosts and team members should always have access to admin dashboard
        const currentPath = window.location.pathname;
        
        // Don't redirect hosts - they should always access admin dashboard
        if (profileData.role === 'host') {
          if (currentPath.startsWith('/attendee')) {
            console.log('Redirecting host to admin dashboard');
            navigate('/admin/dashboard', { replace: true });
          }
          return;
        }

        // Check team member status for team_member role
        if (profileData.role === 'team_member') {
          const { data: teamMemberData } = await supabase
            .from('team_members')
            .select('id, event_id, is_active, expires_at')
            .eq('user_id', currentUser.id)
            .eq('is_active', true)
            .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
            .single();

          const isActiveTeamMember = !!teamMemberData;
          
          // Ensure current_event_id matches team member event
          if (teamMemberData && profileData.current_event_id !== teamMemberData.event_id) {
            await supabase
              .from('profiles')
              .update({ current_event_id: teamMemberData.event_id })
              .eq('id', currentUser.id);
              
            await updateUser({ current_event_id: teamMemberData.event_id });
          }

          // Active team members should access admin dashboard
          if (isActiveTeamMember && currentPath.startsWith('/attendee')) {
            console.log('Redirecting active team member to admin dashboard');
            navigate('/admin/dashboard', { replace: true });
          }
          return;
        }

        // Only redirect regular attendees away from admin pages
        if (profileData.role === 'attendee' && currentPath.startsWith('/admin')) {
          console.log('Redirecting regular attendee to attendee dashboard');
          navigate('/attendee/dashboard', { replace: true });
        }

      } catch (error) {
        console.error('Error in role validation:', error);
      }
    };

    // Add longer delay to ensure auth state is fully loaded and avoid race conditions
    const timer = setTimeout(validateRole, 500);
    return () => clearTimeout(timer);
  }, [currentUser?.id, navigate, updateUser]); // Only depend on user id to avoid excessive re-runs
};
