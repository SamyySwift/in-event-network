
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AuthUser extends User {
  role?: string;
  current_event_id?: string;
  team_member_for_event?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, name: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async (userId: string): Promise<AuthUser | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, current_event_id, team_member_for_event, name, email')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        ...session?.user,
        role: profile.role,
        current_event_id: profile.current_event_id,
        team_member_for_event: profile.team_member_for_event,
      } as AuthUser;
    } catch (error) {
      console.error('Error in refreshUserProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        setSession(session);
        
        if (session?.user) {
          // Defer profile refresh to avoid blocking auth state update
          setTimeout(async () => {
            const userWithProfile = await refreshUserProfile(session.user.id);
            setCurrentUser(userWithProfile);
            setLoading(false);
          }, 0);
        } else {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        refreshUserProfile(session.user.id).then((userWithProfile) => {
          setCurrentUser(userWithProfile);
          setSession(session);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const register = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    return { error };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    } else {
      setCurrentUser(null);
      setSession(null);
    }
  };

  const updateUser = async (updates: Partial<AuthUser>) => {
    if (!currentUser) return;

    try {
      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);

      if (error) throw error;

      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    session,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
