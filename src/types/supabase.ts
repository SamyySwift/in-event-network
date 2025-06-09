
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
      schedule_items: {
        Row: {
          id: string;
          title: string;
          description?: string;
          start_time: string;
          end_time: string;
          location?: string;
          type: string;
          priority: string;
          event_id: string;
          created_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          start_time: string;
          end_time: string;
          location?: string;
          type?: string;
          priority?: string;
          event_id: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          start_time?: string;
          end_time?: string;
          location?: string;
          type?: string;
          priority?: string;
          event_id?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      facilities: {
        Row: {
          id: string;
          name: string;
          description?: string;
          location?: string;
          rules?: string;
          contact_type?: 'none' | 'phone' | 'whatsapp';
          contact_info?: string;
          image_url?: string;
          icon_type?: string;
          event_id: string; // Now required, not nullable
          created_by?: string;
          created_at: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          location?: string;
          rules?: string;
          contact_type?: 'none' | 'phone' | 'whatsapp';
          contact_info?: string;
          image_url?: string;
          icon_type?: string;
          event_id: string; // Required for inserts
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          location?: string;
          rules?: string;
          contact_type?: 'none' | 'phone' | 'whatsapp';
          contact_info?: string;
          image_url?: string;
          icon_type?: string;
          event_id?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          role: string | null;
          photo_url: string | null;
          bio: string | null;
          niche: string | null;
          company: string | null;
          networking_preferences: string[] | null;
          tags: string[] | null;
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
          company?: string | null;
          networking_preferences?: string[] | null;
          tags?: string[] | null;
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
          company?: string | null;
          networking_preferences?: string[] | null;
          tags?: string[] | null;
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
      connections: {
        Row: {
          id: string;
          requester_id: string | null;
          recipient_id: string | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id?: string | null;
          recipient_id?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string | null;
          recipient_id?: string | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string | null;
          recipient_id: string | null;
          content: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          sender_id?: string | null;
          recipient_id?: string | null;
          content: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          sender_id?: string | null;
          recipient_id?: string | null;
          content?: string;
          created_at?: string;
          read_at?: string | null;
        };
      };
    };
    Views: {
      public_profiles: {
        Row: {
          id: string;
          name: string | null;
          role: string | null;
          company: string | null;
          bio: string | null;
          niche: string | null;
          photo_url: string | null;
          networking_preferences: string[] | null;
          tags: string[] | null;
          twitter_link: string | null;
          linkedin_link: string | null;
          github_link: string | null;
          instagram_link: string | null;
          website_link: string | null;
          created_at: string;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
