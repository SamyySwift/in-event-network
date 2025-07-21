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
        // Fetch fresh role from database
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUser.id)
          .single();

        if (!error && data && data.role !== currentUser.role) {
          console.log(`Role mismatch detected. Local: ${currentUser.role}, DB: ${data.role}`);
          
          // Update local user state using the available updateUser method
          await updateUser({ role: data.role });
          
          // Redirect to correct dashboard
          const correctPath = data.role === 'host' ? '/admin' : '/attendee';
          navigate(correctPath, { replace: true });
        }
      }
    };

    validateRole();
  }, [currentUser, navigate, updateUser]);
};