
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AuthUser extends User {
  role?: string;
  name?: string;
  bio?: string;
  niche?: string;
  company?: string;
  photoUrl?: string;
  photo_url?: string;
  current_event_id?: string;
  team_member_for_event?: string;
  networking_visible?: boolean;
  tags?: string[];
  networking_preferences?: string[];
  links?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
  };
  twitter_link?: string;
  linkedin_link?: string;
  facebook_link?: string;
  instagram_link?: string;
  github_link?: string;
  website_link?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
  signInWithGoogle: (role?: string) => Promise<{ error: any }>;
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
        .select(`
          role, 
          name, 
          email, 
          bio, 
          niche, 
          company, 
          photo_url, 
          current_event_id, 
          team_member_for_event,
          networking_visible,
          tags,
          networking_preferences,
          twitter_link,
          linkedin_link,
          facebook_link,
          instagram_link,
          github_link,
          website_link
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      const user = session?.user;
      if (!user) return null;

      return {
        ...user,
        role: profile.role,
        name: profile.name,
        bio: profile.bio,
        niche: profile.niche,
        company: profile.company,
        photoUrl: profile.photo_url,
        photo_url: profile.photo_url,
        current_event_id: profile.current_event_id,
        team_member_for_event: profile.team_member_for_event,
        networking_visible: profile.networking_visible,
        tags: profile.tags,
        networking_preferences: profile.networking_preferences,
        links: {
          website: profile.website_link,
          twitter: profile.twitter_link,
          linkedin: profile.linkedin_link,
          facebook: profile.facebook_link,
          instagram: profile.instagram_link,
          github: profile.github_link,
        },
        twitter_link: profile.twitter_link,
        linkedin_link: profile.linkedin_link,
        facebook_link: profile.facebook_link,
        instagram_link: profile.instagram_link,
        github_link: profile.github_link,
        website_link: profile.website_link,
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

  const register = async (name: string, email: string, password: string, role: string = 'attendee') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
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
      // Map updates to database columns
      const dbUpdates: any = {};
      
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.niche !== undefined) dbUpdates.niche = updates.niche;
      if (updates.company !== undefined) dbUpdates.company = updates.company;
      if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
      if (updates.photo_url !== undefined) dbUpdates.photo_url = updates.photo_url;
      if (updates.current_event_id !== undefined) dbUpdates.current_event_id = updates.current_event_id;
      if (updates.team_member_for_event !== undefined) dbUpdates.team_member_for_event = updates.team_member_for_event;
      if (updates.networking_visible !== undefined) dbUpdates.networking_visible = updates.networking_visible;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.networking_preferences !== undefined) dbUpdates.networking_preferences = updates.networking_preferences;
      if (updates.role !== undefined) dbUpdates.role = updates.role;
      
      // Handle links object
      if (updates.links) {
        if (updates.links.website !== undefined) dbUpdates.website_link = updates.links.website;
        if (updates.links.twitter !== undefined) dbUpdates.twitter_link = updates.links.twitter;
        if (updates.links.linkedin !== undefined) dbUpdates.linkedin_link = updates.links.linkedin;
        if (updates.links.facebook !== undefined) dbUpdates.facebook_link = updates.links.facebook;
        if (updates.links.instagram !== undefined) dbUpdates.instagram_link = updates.links.instagram;
        if (updates.links.github !== undefined) dbUpdates.github_link = updates.links.github;
      }
      
      // Handle direct link updates
      if (updates.twitter_link !== undefined) dbUpdates.twitter_link = updates.twitter_link;
      if (updates.linkedin_link !== undefined) dbUpdates.linkedin_link = updates.linkedin_link;
      if (updates.facebook_link !== undefined) dbUpdates.facebook_link = updates.facebook_link;
      if (updates.instagram_link !== undefined) dbUpdates.instagram_link = updates.instagram_link;
      if (updates.github_link !== undefined) dbUpdates.github_link = updates.github_link;
      if (updates.website_link !== undefined) dbUpdates.website_link = updates.website_link;

      // Update in database
      const { error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id);

      if (error) throw error;

      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const signInWithGoogle = async (role: string = 'attendee') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          role: role,
        },
      },
    });
    return { error };
  };

  const value: AuthContextType = {
    currentUser,
    session,
    loading,
    isLoading: loading,
    login,
    register,
    logout,
    updateUser,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
