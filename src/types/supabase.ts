
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
      facilities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          location: string | null;
          rules: string | null;
          image_url: string | null;
          icon_type: string | null;
          contact_number: string | null;
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
          icon_type?: string | null;
          contact_number?: string | null;
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
          icon_type?: string | null;
          contact_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          content: string;
          user_id: string | null;
          session_id: string | null;
          event_id: string | null;
          is_anonymous: boolean | null;
          is_answered: boolean | null;
          answered_at: string | null;
          answered_by: string | null;
          upvotes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          user_id?: string | null;
          session_id?: string | null;
          event_id?: string | null;
          is_anonymous?: boolean | null;
          is_answered?: boolean | null;
          answered_at?: string | null;
          answered_by?: string | null;
          upvotes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          user_id?: string | null;
          session_id?: string | null;
          event_id?: string | null;
          is_anonymous?: boolean | null;
          is_answered?: boolean | null;
          answered_at?: string | null;
          answered_by?: string | null;
          upvotes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      question_feedback: {
        Row: {
          id: string;
          question_id: string | null;
          user_id: string | null;
          satisfaction_level: number | null;
          feedback_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id?: string | null;
          user_id?: string | null;
          satisfaction_level?: number | null;
          feedback_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          question_id?: string | null;
          user_id?: string | null;
          satisfaction_level?: number | null;
          feedback_text?: string | null;
          created_at?: string;
        };
      };
      suggestions: {
        Row: {
          id: string;
          content: string;
          user_id: string | null;
          event_id: string | null;
          type: string | null;
          rating: number | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          user_id?: string | null;
          event_id?: string | null;
          type?: string | null;
          rating?: number | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          user_id?: string | null;
          event_id?: string | null;
          type?: string | null;
          rating?: number | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
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
          uploaded_by: string | null;
          description: string | null;
          tags: string[] | null;
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
          uploaded_by?: string | null;
          description?: string | null;
          tags?: string[] | null;
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
          uploaded_by?: string | null;
          description?: string | null;
          tags?: string[] | null;
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
          type: string | null;
          related_id: string | null;
          is_read: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title: string;
          message: string;
          type?: string | null;
          related_id?: string | null;
          is_read?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string;
          message?: string;
          type?: string | null;
          related_id?: string | null;
          is_read?: boolean | null;
          created_at?: string;
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
