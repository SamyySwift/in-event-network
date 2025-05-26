import React, { createContext, useState, useContext, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { User } from "@/types";

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "host" | "attendee"
  ) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const session = data?.session;
        if (session?.user) {
          await getUserProfile(session.user);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event, session);
      if (session?.user) {
        await getUserProfile(session.user);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (error) throw error;

      if (data) {
        const userProfile: User = {
          id: data.id,
          name: data.name || "",
          email: data.email || "",
          role: (data.role as "host" | "attendee") || "attendee",
          photoUrl: data.photo_url,
          bio: data.bio,
          links: {
            twitter: data.twitter_link,
            facebook: data.facebook_link,
            linkedin: data.linkedin_link,
            instagram: data.instagram_link,
            snapchat: data.snapchat_link,
            tiktok: data.tiktok_link,
            github: data.github_link,
            website: data.website_link,
          },
          niche: data.niche,
        };
        setCurrentUser(userProfile);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data?.session?.user) {
        await getUserProfile(data.session.user);
      }

      return { error: null };
    } catch (error) {
      console.error("Error logging in:", error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "host" | "attendee"
  ) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      return { error };
    } catch (error) {
      console.error("Error registering:", error);
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const profileData: any = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        photo_url: userData.photoUrl,
        bio: userData.bio,
        niche: userData.niche,
      };

      if (userData.links) {
        if (userData.links.twitter)
          profileData.twitter_link = userData.links.twitter;
        if (userData.links.facebook)
          profileData.facebook_link = userData.links.facebook;
        if (userData.links.linkedin)
          profileData.linkedin_link = userData.links.linkedin;
        if (userData.links.instagram)
          profileData.instagram_link = userData.links.instagram;
        if (userData.links.snapchat)
          profileData.snapchat_link = userData.links.snapchat;
        if (userData.links.tiktok)
          profileData.tiktok_link = userData.links.tiktok;
        if (userData.links.github)
          profileData.github_link = userData.links.github;
        if (userData.links.website)
          profileData.website_link = userData.links.website;
      }

      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", currentUser.id);

      if (error) throw error;

      setCurrentUser({ ...currentUser, ...userData });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
