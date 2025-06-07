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
          current_event_id: string | null;
          access_key: string | null;
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
          current_event_id?: string | null;
          access_key?: string | null;
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
          current_event_id?: string | null;
          access_key?: string | null;
        };
      };
      questions: {
        Row: {
          id: string;
          content: string;
          user_id: string | null;
          event_id: string | null;
          session_id: string | null;
          is_anonymous: boolean | null;
          is_answered: boolean | null;
          response: string | null;
          upvotes: number | null;
          answered_at: string | null;
          answered_by: string | null;
          response_created_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          content: string;
          user_id?: string | null;
          event_id?: string | null;
          session_id?: string | null;
          is_anonymous?: boolean | null;
          is_answered?: boolean | null;
          response?: string | null;
          upvotes?: number | null;
          answered_at?: string | null;
          answered_by?: string | null;
          response_created_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          content?: string;
          user_id?: string | null;
          event_id?: string | null;
          session_id?: string | null;
          is_anonymous?: boolean | null;
          is_answered?: boolean | null;
          response?: string | null;
          upvotes?: number | null;
          answered_at?: string | null;
          answered_by?: string | null;
          response_created_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
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
      events: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          start_time: string;
          end_time: string;
          location: string | null;
          banner_url: string | null;
          logo_url: string | null;
          website: string | null;
          event_key: string | null;
          host_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          location?: string | null;
          banner_url?: string | null;
          logo_url?: string | null;
          website?: string | null;
          event_key?: string | null;
          host_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          location?: string | null;
          banner_url?: string | null;
          logo_url?: string | null;
          website?: string | null;
          event_key?: string | null;
          host_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          priority: string;
          image_url: string | null;
          send_immediately: boolean;
          event_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          priority?: string;
          image_url?: string | null;
          send_immediately?: boolean;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          priority?: string;
          image_url?: string | null;
          send_immediately?: boolean;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rules: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: string | null;
          priority: string;
          event_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          category?: string | null;
          priority?: string;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          category?: string | null;
          priority?: string;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      facilities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          location: string | null;
          rules: string | null;
          image_url: string | null;
          icon_type: string;
          contact_type: string;
          contact_info: string | null;
          event_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          location?: string | null;
          rules?: string | null;
          image_url?: string | null;
          icon_type?: string;
          contact_type?: string;
          contact_info?: string | null;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          location?: string | null;
          rules?: string | null;
          image_url?: string | null;
          icon_type?: string;
          contact_type?: string;
          contact_info?: string | null;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      polls: {
        Row: {
          id: string;
          question: string;
          options: any;
          start_time: string;
          end_time: string;
          is_active: boolean;
          show_results: boolean;
          display_as_banner: boolean;
          event_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          options: any;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          show_results?: boolean;
          display_as_banner?: boolean;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          options?: any;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          show_results?: boolean;
          display_as_banner?: boolean;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      speakers: {
        Row: {
          id: string;
          name: string;
          bio: string;
          title: string | null;
          company: string | null;
          photo_url: string | null;
          session_title: string | null;
          session_time: string | null;
          twitter_link: string | null;
          linkedin_link: string | null;
          website_link: string | null;
          event_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          bio: string;
          title?: string | null;
          company?: string | null;
          photo_url?: string | null;
          session_title?: string | null;
          session_time?: string | null;
          twitter_link?: string | null;
          linkedin_link?: string | null;
          website_link?: string | null;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          bio?: string;
          title?: string | null;
          company?: string | null;
          photo_url?: string | null;
          session_title?: string | null;
          session_time?: string | null;
          twitter_link?: string | null;
          linkedin_link?: string | null;
          website_link?: string | null;
          event_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      suggestions: {
        Row: {
          id: string;
          content: string;
          type: string;
          rating: number | null;
          status: string;
          user_id: string | null;
          event_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          type?: string;
          rating?: number | null;
          status?: string;
          user_id?: string | null;
          event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          type?: string;
          rating?: number | null;
          status?: string;
          user_id?: string | null;
          event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string | null;
          user_id: string | null;
          option_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id?: string | null;
          user_id?: string | null;
          option_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          poll_id?: string | null;
          user_id?: string | null;
          option_id?: string;
          created_at?: string;
        };
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          joined_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          joined_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          joined_at?: string;
          created_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          quoted_message_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          quoted_message_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          quoted_message_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      direct_messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          content: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          content?: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string | null;
          title: string;
          message: string;
          type: string;
          related_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          message: string;
          type?: string;
          related_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          message?: string;
          type?: string;
          related_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      advertisements: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string | null;
          sponsor_name: string;
          sponsor_logo: string | null;
          link_url: string | null;
          display_order: number;
          is_active: boolean;
          start_date: string | null;
          end_date: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          sponsor_name: string;
          sponsor_logo?: string | null;
          link_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          start_date?: string | null;
          end_date?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          image_url?: string | null;
          sponsor_name?: string;
          sponsor_logo?: string | null;
          link_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          start_date?: string | null;
          end_date?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      media_files: {
        Row: {
          id: string;
          filename: string;
          original_name: string;
          file_type: string;
          file_size: number | null;
          url: string;
          description: string | null;
          tags: string[] | null;
          uploaded_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          original_name: string;
          file_type: string;
          file_size?: number | null;
          url: string;
          description?: string | null;
          tags?: string[] | null;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          original_name?: string;
          file_type?: string;
          file_size?: number | null;
          url?: string;
          description?: string | null;
          tags?: string[] | null;
          uploaded_by?: string | null;
          created_at?: string;
          updated_at?: string;
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
      conversations: {
        Row: {
          conversation_id: string | null;
          other_user_id: string | null;
          last_message: string | null;
          last_message_at: string | null;
          unread_count: number | null;
          is_sent_by_me: boolean | null;
        };
      };
    };
    Functions: {
      join_event_by_access_key: {
        Args: {
          access_code: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
