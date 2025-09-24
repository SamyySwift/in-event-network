import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const normalizeRole = (role?: string | null): 'host' | 'attendee' =>
  role && ['host', 'admin', 'organizer'].includes(role.toLowerCase()) ? 'host' : 'attendee';

export const useRoleValidation = () => {
  const { currentUser, updateUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const hasValidated = useRef(false);

  useEffect(() => {
    const validateRole = async () => {
      // Only validate once per session and only when auth is fully loaded
      if (!currentUser || isLoading || hasValidated.current) {
        return;
      }

      // Wait a bit for initial auth flow to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        console.log('Validating role for user:', currentUser.id, 'Current role:', currentUser.role);
        
        // Fetch fresh role from database
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        if (error) {
          console.error('Error fetching role from database:', error);
          return;
        }

        const dbRoleNorm = normalizeRole(data?.role);
        const currentRoleNorm = normalizeRole(currentUser.role);

        if (dbRoleNorm !== currentRoleNorm) {
          console.log(`Role mismatch detected. Local: ${currentUser.role}, DB: ${data.role}`);
          
          // Update local user state using the available updateUser method (keeps DB role, normalizes local)
          await updateUser({ role: data.role });
          
          // Mark as validated to prevent repeated validations
          hasValidated.current = true;
          
          // Redirect to correct dashboard using normalized DB role
          const correctPath = dbRoleNorm === 'host' ? '/admin' : '/attendee';
          console.log('Redirecting to:', correctPath);
          navigate(correctPath, { replace: true });
        } else {
          console.log('Role validation passed - no changes needed');
          hasValidated.current = true;
        }
      } catch (error) {
        console.error('Error in role validation:', error);
      }
    };

    // Only run if we have a current user and auth is not loading
    if (currentUser && !isLoading) {
      validateRole();
    }
  }, [currentUser, isLoading, navigate, updateUser]);

  // Reset validation flag when user changes (e.g., login/logout)
  useEffect(() => {
    hasValidated.current = false;
  }, [currentUser?.id]);
};