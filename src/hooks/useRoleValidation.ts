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
        // Fetch fresh role and team member status from database
        const { data, error } = await supabase
          .from('profiles')
          .select('role, team_member_for_event, current_event_id')
          .eq('id', currentUser.id)
          .single();

        if (!error && data) {
          // Check if role needs updating
          if (data.role !== currentUser.role) {
            console.log(`Role mismatch detected. Local: ${currentUser.role}, DB: ${data.role}`);
            await updateUser({ role: data.role });
          }
          
          // Determine correct dashboard based on role and team member status
          const isTeamMember = data.team_member_for_event && data.current_event_id;
          const shouldAccessAdmin = data.role === 'host' || isTeamMember;
          
          const correctPath = shouldAccessAdmin ? '/admin' : '/attendee';
          const currentPath = window.location.pathname;
          
          // Only redirect if we're on the wrong dashboard
          if (shouldAccessAdmin && currentPath.startsWith('/attendee')) {
            navigate('/admin/dashboard', { replace: true });
          } else if (!shouldAccessAdmin && currentPath.startsWith('/admin')) {
            navigate('/attendee/dashboard', { replace: true });
          }
        }
      }
    };

    validateRole();
  }, [currentUser, navigate, updateUser]);
};