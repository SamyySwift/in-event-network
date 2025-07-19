import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export const useRoleValidation = () => {
  const { currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const validateRole = async () => {
      if (currentUser) {
        try {
          // Fetch fresh role and team member status from database
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, team_member_for_event, current_event_id')
            .eq('id', currentUser.id)
            .single();

          if (profileError) {
            console.error('Error fetching profile data:', profileError);
            return;
          }

          // Check if role needs updating
          if (profileData.role !== currentUser.role) {
            console.log(`Role mismatch detected. Local: ${currentUser.role}, DB: ${profileData.role}`);
            await updateUser({ role: profileData.role });
          }
          
          // Check if user is an active team member
          const { data: teamMemberData } = await supabase
            .from('team_members')
            .select('id, event_id, is_active, expires_at')
            .eq('user_id', currentUser.id)
            .eq('is_active', true)
            .gt('expires_at', new Date().toISOString())
            .or('expires_at.is.null')
            .maybeSingle();

          // Determine correct dashboard based on role and team member status
          const isHost = profileData.role === 'host';
          const isActiveTeamMember = teamMemberData && teamMemberData.is_active;
          const shouldAccessAdmin = isHost || isActiveTeamMember;
          
          const currentPath = window.location.pathname;
          
          // Only redirect if we're on the wrong dashboard
          if (shouldAccessAdmin && currentPath.startsWith('/attendee')) {
            console.log('Redirecting team member/host to admin dashboard');
            navigate('/admin/dashboard', { replace: true });
          } else if (!shouldAccessAdmin && currentPath.startsWith('/admin')) {
            console.log('Redirecting regular user to attendee dashboard');
            navigate('/attendee/dashboard', { replace: true });
          }
        } catch (error) {
          console.error('Error in role validation:', error);
        }
      }
    };

    // Add small delay to ensure auth state is fully loaded
    const timer = setTimeout(validateRole, 100);
    return () => clearTimeout(timer);
  }, [currentUser, navigate, updateUser]);
};