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
      // Use the role the user selected during registration or Google OAuth as a temporary fallback
      const pendingFallbackRole =
        (localStorage.getItem("pendingRegisterRole") as "host" | "attendee") ||
        (localStorage.getItem("pendingGoogleRole") as "host" | "attendee") ||
        "attendee";

      setCurrentUser({
        id: supabaseUser.id,
        name:
          supabaseUser.user_metadata?.full_name ||
          supabaseUser.email?.split("@")[0] ||
          "",
        email: supabaseUser.email || "",
        role: pendingFallbackRole,
        photoUrl: supabaseUser.user_metadata?.avatar_url || null,
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
      });

      // Clear pending flags after using them
      localStorage.removeItem("pendingRegisterRole");
      localStorage.removeItem("pendingGoogleRole");

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

      // Preserve chosen role across the immediate post-signup flow
      localStorage.setItem("pendingRegisterRole", role);

      // Clear any existing session first
      await supabase.auth.signOut();

      // Check if registering for event joining (don't redirect away from current page)
      const pendingEventCode = sessionStorage.getItem("pendingEventCode");
      const urlParams = new URLSearchParams(window.location.search);
      const eventCode = urlParams.get("eventCode");
      const isEventRegistration = pendingEventCode || eventCode;

      // Only redirect to home page if not registering for an event
      const redirectUrl = isEventRegistration 
        ? window.location.href // Stay on current page to allow event joining
        : `${window.location.origin}/`; // Normal redirect to home

      console.log("Registration redirect URL:", redirectUrl, "Event registration:", isEventRegistration);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            role, // Pass role in metadata so the trigger can use it
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

        // Verify the role was set correctly by the trigger
        // Use a slight delay to ensure the trigger has completed
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        // If role is incorrect, update it
        if (profileData?.role !== role) {
          console.log("Role mismatch detected, correcting from", profileData?.role, "to", role);
          const { error: updateError } = await supabase.from("profiles").upsert({
            id: data.user.id,
            name,
            email,
            role,
          }, {
            onConflict: 'id'
          });

          if (updateError) {
            console.error("Error updating profile role:", updateError);
            throw updateError;
          }
        }

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

      // Registration complete; clear pending role flag
      localStorage.removeItem("pendingRegisterRole");

      return { error: null };
    } catch (error) {
      // Ensure we clear pending role on error too
      localStorage.removeItem("pendingRegisterRole");
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
      
      // Check if there's a pending event code and include it in OAuth state
      const pendingEventCode = localStorage.getItem('pendingEventCode') || 
                              sessionStorage.getItem('pendingEventCode');
      
      // Build redirect URL with event context if needed
      let redirectUrl = `${window.location.origin}/auth/callback`;
      const queryParams: any = { role: role };
      
      if (pendingEventCode) {
        console.log("Including event code in OAuth flow:", pendingEventCode);
        queryParams.eventCode = pendingEventCode;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: queryParams,
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
