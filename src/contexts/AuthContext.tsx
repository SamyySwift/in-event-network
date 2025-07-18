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
  signInWithGoogle: (
    role?: "host" | "attendee"
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
  
      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error fetching profile:", error);
        throw error;
      }
  
      if (data) {
        // Profile exists - check if there's a pending role update from Google OAuth
        const pendingRole = localStorage.getItem("pendingGoogleRole") as "host" | "attendee";
  
        if (pendingRole && pendingRole !== data.role) {
          console.log(`Updating existing profile role from ${data.role} to ${pendingRole}`);
          
          // Update the role in the database
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ role: pendingRole })
            .eq("id", supabaseUser.id);
            
          if (updateError) {
            console.error("Error updating profile role:", updateError);
            // Don't remove pendingRole if update failed
          } else {
            data.role = pendingRole; // Update local data
            localStorage.removeItem("pendingGoogleRole");
          }
        } else {
          // Remove pendingRole if no update needed
          localStorage.removeItem("pendingGoogleRole");
        }
        
        // Profile exists
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
      } else {
        // Profile doesn't exist (new Google user), create one
        console.log("Creating new profile for Google user");
        const pendingRole =
          (localStorage.getItem("pendingGoogleRole") as "host" | "attendee") ||
          "attendee";
        localStorage.removeItem("pendingGoogleRole");

        const newProfile = {
          id: supabaseUser.id,
          name:
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.email?.split("@")[0] ||
            "",
          email: supabaseUser.email || "",
          role: pendingRole,
          photo_url: supabaseUser.user_metadata?.avatar_url || null,
        };

        const { error: insertError } = await supabase
          .from("profiles")
          .insert(newProfile);

        if (insertError) {
          console.error("Error creating profile:", insertError);
          throw insertError;
        }

        const userProfile: User = {
          id: newProfile.id,
          name: newProfile.name,
          email: newProfile.email,
          role: newProfile.role,
          photoUrl: newProfile.photo_url,
          bio: null,
          links: {
            twitter: null,
            facebook: null,
            linkedin: null,
            instagram: null,
            snapchat: null,
            tiktok: null,
            github: null,
            website: null,
          },
          niche: null,
        };

        console.log("New profile created:", userProfile);
        setCurrentUser(userProfile);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting login for:", email);

      // Clear any existing session and cached auth data first
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn("Failed to clear previous session:", err);
      }
      
      // Clear localStorage auth items
      localStorage.removeItem("pendingGoogleRole");
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });

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

      if (data.user) {
        console.log("Registration successful for:", data.user.id);

        // Create or update profile with the specified role
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          name,
          email,
          role,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          setIsLoading(false);
          return { error: profileError };
        }

        // For development, automatically sign in the user after registration
        if (!data.session) {
          console.log("Attempting auto-login after registration...");
          const { data: loginData, error: loginError } =
            await supabase.auth.signInWithPassword({
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
      
      // Clear all auth-related data first
      setCurrentUser(null);
      
      // Clear all auth-related localStorage items
      localStorage.removeItem("pendingGoogleRole");
      localStorage.removeItem("redirectAfterLogin");
      localStorage.removeItem("pendingTicketingUrl");
      sessionStorage.removeItem("pendingEventCode");
      
      // Clear any cached user data that might persist
      localStorage.removeItem("supabase.auth.token");
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out from Supabase (try both local and global scope)
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.warn("Global signout failed, trying local:", err);
        await supabase.auth.signOut();
      }
      
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

  const signInWithGoogle = async (role: "host" | "attendee" = "attendee") => {
    try {
      setIsLoading(true);
      console.log("Attempting Google sign-in with role:", role);

      // Store the role preference for after OAuth callback
      localStorage.setItem("pendingGoogleRole", role);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            role: role,
          },
        },
      });

      if (error) {
        console.error("Google sign-in error:", error);
        localStorage.removeItem("pendingGoogleRole");
        setIsLoading(false);
        return { error };
      }

      // The actual sign-in will be handled by the OAuth callback
      return { error: null };
    } catch (error) {
      console.error("Error with Google sign-in:", error);
      localStorage.removeItem("pendingGoogleRole");
      setIsLoading(false);
      return { error: error as Error };
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    signInWithGoogle,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
