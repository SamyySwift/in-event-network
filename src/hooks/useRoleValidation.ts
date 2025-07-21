
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
        // Fetch fresh user data from database
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

        // Check team member status for team_member role
        let isActiveTeamMember = false;
        if (profileData.role === 'team_member') {
          const { data: teamMemberData } = await supabase
            .from('team_members')
            .select('id, event_id, is_active, expires_at')
            .eq('user_id', currentUser.id)
            .eq('is_active', true)
            .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
            .single();

          isActiveTeamMember = !!teamMemberData;
          
          // Ensure current_event_id matches team member event
          if (teamMemberData && profileData.current_event_id !== teamMemberData.event_id) {
            await supabase
              .from('profiles')
              .update({ current_event_id: teamMemberData.event_id })
              .eq('id', currentUser.id);
              
            await updateUser({ current_event_id: teamMemberData.event_id });
          }
        }

        // Determine correct dashboard access
        const isHost = profileData.role === 'host';
        const shouldAccessAdmin = isHost || isActiveTeamMember;
        
        const currentPath = window.location.pathname;
        
        // Route team members and hosts to admin dashboard
        if (shouldAccessAdmin && currentPath.startsWith('/attendee')) {
          console.log('Redirecting team member/host to admin dashboard');
          navigate('/admin/dashboard', { replace: true });
        } 
        // Route regular attendees to attendee dashboard
        else if (!shouldAccessAdmin && profileData.role === 'attendee' && currentPath.startsWith('/admin')) {
          console.log('Redirecting regular attendee to attendee dashboard');
          navigate('/attendee/dashboard', { replace: true });
        }
        // Handle users without proper role assignment (but don't redirect hosts without events)
        else if (!profileData.role) {
          console.log('User missing role assignment, redirecting to home');
          if (currentPath.startsWith('/admin') || currentPath.startsWith('/attendee')) {
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error in role validation:', error);
      }
    };

    // Add small delay to ensure auth state is fully loaded
    const timer = setTimeout(validateRole, 100);
    return () => clearTimeout(timer);
  }, [currentUser, navigate, updateUser]);
};
