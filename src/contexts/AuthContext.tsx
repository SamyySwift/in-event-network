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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth...");
        
        // Get initial session
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }

        if (mounted) {
          const session = data?.session;
          if (session?.user) {
            console.log("Found existing session:", session.user.id);
            await getUserProfile(session.user);
          } else {
            console.log("No existing session found");
            setCurrentUser(null);
          }
          setIsInitialized(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setCurrentUser(null);
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);
      
      if (!mounted) return;

      try {
        if (session?.user) {
          // Set loading to true only if we don't have the user profile yet
          if (!currentUser || currentUser.id !== session.user.id) {
            setIsLoading(true);
          }
          
          // Defer profile fetching to avoid potential deadlocks
          setTimeout(async () => {
            if (mounted) {
              await getUserProfile(session.user);
            }
          }, 0);
        } else {
          setCurrentUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log("Fetching profile for user:", supabaseUser.id);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }

      if (data) {
        const userProfile: User = {
          id: data.id,
          name: data.name || "",
          email: data.email || supabaseUser.email || "",
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
        console.log("Profile loaded successfully:", userProfile);
        setCurrentUser(userProfile);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setIsLoading(false);
      // Don't throw here, just log the error and continue
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting login for:", email);
      
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        setIsLoading(false);
        return { error };
      }

      console.log("Login successful for:", data.user?.id);
      return { error: null };
    } catch (error) {
      console.error("Error logging in:", error);
      setIsLoading(false);
      return { error: error as Error };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "host" | "attendee"
  ) => {
    try {
      setIsLoading(true);
      console.log("Attempting registration for:", email, "with role:", role);
      
      // Clear any existing session first
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      });

      if (error) {
        console.error("Registration error:", error);
        setIsLoading(false);
        return { error };
      }

      console.log("Registration successful for:", data.user?.id);
      
      // For development, automatically sign in the user after registration
      // In production, you might want to wait for email confirmation
      if (data.user && !data.session) {
        console.log("Attempting auto-login after registration...");
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          console.error("Auto-login error:", loginError);
          setIsLoading(false);
          return { error: loginError };
        }

        console.log("Auto-login successful:", loginData.user?.id);
      }

      return { error: null };
    } catch (error) {
      console.error("Error registering:", error);
      setIsLoading(false);
      return { error: error as Error };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("Logging out...");
      await supabase.auth.signOut();
      setCurrentUser(null);
      console.log("Logout successful");
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
