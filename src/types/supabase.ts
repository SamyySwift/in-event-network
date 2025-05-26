export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          role: string | null;
          photo_url: string | null;
          bio: string | null;
          niche: string | null;
          twitter_link: string | null;
          facebook_link: string | null;
          linkedin_link: string | null;
          instagram_link: string | null;
          snapchat_link: string | null;
          tiktok_link: string | null;
          github_link: string | null;
          website_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          role?: string | null;
          photo_url?: string | null;
          bio?: string | null;
          niche?: string | null;
          twitter_link?: string | null;
          facebook_link?: string | null;
          linkedin_link?: string | null;
          instagram_link?: string | null;
          snapchat_link?: string | null;
          tiktok_link?: string | null;
          github_link?: string | null;
          website_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          role?: string | null;
          photo_url?: string | null;
          bio?: string | null;
          niche?: string | null;
          twitter_link?: string | null;
          facebook_link?: string | null;
          linkedin_link?: string | null;
          instagram_link?: string | null;
          snapchat_link?: string | null;
          tiktok_link?: string | null;
          github_link?: string | null;
          website_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Add other tables as needed
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};