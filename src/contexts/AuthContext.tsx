
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AuthUser extends User {
  role?: 'host' | 'attendee' | 'team_member';
  current_event_id?: string;
  team_member_for_event?: string;
  name?: string;
  bio?: string;
  niche?: string;
  company?: string;
  photoUrl?: string;
  photo_url?: string;
  networking_preferences?: string[];
  networkingPreferences?: string[]; // Add alias for compatibility
  tags?: string[];
  customTags?: string[];
  links?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    snapchat?: string;
    tiktok?: string;
    github?: string;
    website?: string;
  };
  twitter_link?: string;
  linkedin_link?: string;
  github_link?: string;
  instagram_link?: string;
  website_link?: string;
  networking_visible?: boolean;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean; // Add alias for compatibility
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (name: string, email: string, password: string, role: string) => Promise<{ error: any }>;
  signInWithGoogle: (role: string) => Promise<{ error: any }>;
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
        .select(`
          role, 
          current_event_id, 
          team_member_for_event, 
          name, 
          email,
          bio,
          niche,
          company,
          photo_url,
          networking_preferences,
          tags,
          twitter_link,
          linkedin_link,
          github_link,
          instagram_link,
          website_link,
          networking_visible
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!session?.user) return null;

      return {
        ...session.user,
        role: profile.role,
        current_event_id: profile.current_event_id,
        team_member_for_event: profile.team_member_for_event,
        name: profile.name,
        bio: profile.bio,
        niche: profile.niche,
        company: profile.company,
        photoUrl: profile.photo_url,
        photo_url: profile.photo_url,
        networking_preferences: profile.networking_preferences,
        networkingPreferences: profile.networking_preferences, // Map to alias for compatibility
        tags: profile.tags,
        customTags: profile.tags, // Map tags to customTags for compatibility
        links: {
          twitter: profile.twitter_link,
          linkedin: profile.linkedin_link,
          github: profile.github_link,
          instagram: profile.instagram_link,
          website: profile.website_link,
        },
        twitter_link: profile.twitter_link,
        linkedin_link: profile.linkedin_link,
        github_link: profile.github_link,
        instagram_link: profile.instagram_link,
        website_link: profile.website_link,
        networking_visible: profile.networking_visible,
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

  const register = async (name: string, email: string, password: string, role: string) => {
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

  const signInWithGoogle = async (role: string) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
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
      // Map the updates to database column names
      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.bio) dbUpdates.bio = updates.bio;
      if (updates.niche) dbUpdates.niche = updates.niche;
      if (updates.company) dbUpdates.company = updates.company;
      if (updates.photoUrl) dbUpdates.photo_url = updates.photoUrl;
      if (updates.photo_url) dbUpdates.photo_url = updates.photo_url;
      if (updates.networking_preferences) dbUpdates.networking_preferences = updates.networking_preferences;
      if (updates.networkingPreferences) dbUpdates.networking_preferences = updates.networkingPreferences; // Handle alias
      if (updates.tags) dbUpdates.tags = updates.tags;
      if (updates.customTags) dbUpdates.tags = updates.customTags; // Map customTags to tags
      if (updates.networking_visible !== undefined) dbUpdates.networking_visible = updates.networking_visible;
      if (updates.role) dbUpdates.role = updates.role;
      if (updates.current_event_id) dbUpdates.current_event_id = updates.current_event_id;
      if (updates.team_member_for_event) dbUpdates.team_member_for_event = updates.team_member_for_event;
      
      // Handle links object
      if (updates.links) {
        if (updates.links.twitter) dbUpdates.twitter_link = updates.links.twitter;
        if (updates.links.linkedin) dbUpdates.linkedin_link = updates.links.linkedin;
        if (updates.links.github) dbUpdates.github_link = updates.links.github;
        if (updates.links.instagram) dbUpdates.instagram_link = updates.links.instagram;
        if (updates.links.website) dbUpdates.website_link = updates.links.website;
      }

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

  const value: AuthContextType = {
    currentUser,
    session,
    loading,
    isLoading: loading, // Provide alias for compatibility
    login,
    register,
    signInWithGoogle,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
