export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      advertisements: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          sponsor_logo: string | null
          sponsor_name: string
          start_date: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          sponsor_logo?: string | null
          sponsor_name: string
          start_date?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          sponsor_logo?: string | null
          sponsor_name?: string
          start_date?: string | null
          title?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          event_id: string | null
          id: string
          image_url: string | null
          priority: string | null
          send_immediately: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          image_url?: string | null
          priority?: string | null
          send_immediately?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          image_url?: string | null
          priority?: string | null
          send_immediately?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          event_id: string | null
          id: string
          quoted_message_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id?: string | null
          id?: string
          quoted_message_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string | null
          id?: string
          quoted_message_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_quoted_message_id_fkey"
            columns: ["quoted_message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string | null
          id: string
          recipient_id: string | null
          requester_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipient_id?: string | null
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipient_id?: string | null
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connections_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          created_at: string
          event_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_event_participants_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_event_participants_event_id"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_event_participants_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_event_participants_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_event_participants_user_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_event_participants_user_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          event_id: string
          id: string
          paystack_reference: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          event_id: string
          id?: string
          paystack_reference: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          event_id?: string
          id?: string
          paystack_reference?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_url: string | null
          created_at: string
          description: string | null
          end_time: string
          event_key: string | null
          host_id: string | null
          id: string
          location: string | null
          logo_url: string | null
          name: string
          start_time: string
          updated_at: string
          website: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          event_key?: string | null
          host_id?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name: string
          start_time: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          event_key?: string | null
          host_id?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          start_time?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      facilities: {
        Row: {
          contact_info: string | null
          contact_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          event_id: string
          icon_type: string | null
          id: string
          image_url: string | null
          location: string | null
          name: string
          rules: string | null
          updated_at: string | null
        }
        Insert: {
          contact_info?: string | null
          contact_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id: string
          icon_type?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name: string
          rules?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_info?: string | null
          contact_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_id?: string
          icon_type?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          name?: string
          rules?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facilities_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      media_files: {
        Row: {
          created_at: string | null
          description: string | null
          file_size: number | null
          file_type: string
          filename: string
          id: string
          original_name: string
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type: string
          filename: string
          id?: string
          original_name: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string
          filename?: string
          id?: string
          original_name?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          created_by: string | null
          display_as_banner: boolean | null
          end_time: string
          event_id: string | null
          id: string
          is_active: boolean | null
          options: Json
          question: string
          show_results: boolean | null
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_as_banner?: boolean | null
          end_time: string
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          options: Json
          question: string
          show_results?: boolean | null
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_as_banner?: boolean | null
          end_time?: string
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          options?: Json
          question?: string
          show_results?: boolean | null
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "polls_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          access_key: string | null
          bio: string | null
          company: string | null
          created_at: string
          current_event_id: string | null
          email: string | null
          facebook_link: string | null
          github_link: string | null
          id: string
          instagram_link: string | null
          linkedin_link: string | null
          name: string | null
          networking_preferences: string[] | null
          niche: string | null
          photo_url: string | null
          role: string | null
          snapchat_link: string | null
          tags: string[] | null
          tiktok_link: string | null
          twitter_link: string | null
          updated_at: string
          website_link: string | null
        }
        Insert: {
          access_key?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          current_event_id?: string | null
          email?: string | null
          facebook_link?: string | null
          github_link?: string | null
          id: string
          instagram_link?: string | null
          linkedin_link?: string | null
          name?: string | null
          networking_preferences?: string[] | null
          niche?: string | null
          photo_url?: string | null
          role?: string | null
          snapchat_link?: string | null
          tags?: string[] | null
          tiktok_link?: string | null
          twitter_link?: string | null
          updated_at?: string
          website_link?: string | null
        }
        Update: {
          access_key?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string
          current_event_id?: string | null
          email?: string | null
          facebook_link?: string | null
          github_link?: string | null
          id?: string
          instagram_link?: string | null
          linkedin_link?: string | null
          name?: string | null
          networking_preferences?: string[] | null
          niche?: string | null
          photo_url?: string | null
          role?: string | null
          snapchat_link?: string | null
          tags?: string[] | null
          tiktok_link?: string | null
          twitter_link?: string | null
          updated_at?: string
          website_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_event_id_fkey"
            columns: ["current_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answered_at: string | null
          answered_by: string | null
          content: string
          created_at: string | null
          event_id: string | null
          id: string
          is_anonymous: boolean | null
          is_answered: boolean | null
          response: string | null
          response_created_at: string | null
          session_id: string | null
          updated_at: string | null
          upvotes: number | null
          user_id: string | null
        }
        Insert: {
          answered_at?: string | null
          answered_by?: string | null
          content: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_answered?: boolean | null
          response?: string | null
          response_created_at?: string | null
          session_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Update: {
          answered_at?: string | null
          answered_by?: string | null
          content?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          is_anonymous?: boolean | null
          is_answered?: boolean | null
          response?: string | null
          response_created_at?: string | null
          session_id?: string | null
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      rules: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          event_id: string | null
          id: string
          priority: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          id?: string
          priority?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          event_id?: string | null
          id?: string
          priority?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_items: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string
          event_id: string
          id: string
          image_url: string | null
          location: string | null
          priority: string | null
          start_time: string
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time: string
          event_id: string
          id?: string
          image_url?: string | null
          location?: string | null
          priority?: string | null
          start_time: string
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string
          event_id?: string
          id?: string
          image_url?: string | null
          location?: string | null
          priority?: string | null
          start_time?: string
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      speakers: {
        Row: {
          bio: string
          company: string | null
          created_at: string
          created_by: string | null
          event_id: string | null
          id: string
          linkedin_link: string | null
          name: string
          photo_url: string | null
          session_time: string | null
          session_title: string | null
          title: string | null
          twitter_link: string | null
          updated_at: string
          website_link: string | null
        }
        Insert: {
          bio: string
          company?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          linkedin_link?: string | null
          name: string
          photo_url?: string | null
          session_time?: string | null
          session_title?: string | null
          title?: string | null
          twitter_link?: string | null
          updated_at?: string
          website_link?: string | null
        }
        Update: {
          bio?: string
          company?: string | null
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          linkedin_link?: string | null
          name?: string
          photo_url?: string | null
          session_time?: string | null
          session_title?: string | null
          title?: string | null
          twitter_link?: string | null
          updated_at?: string
          website_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "speakers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speakers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestions: {
        Row: {
          content: string
          created_at: string | null
          event_id: string | null
          id: string
          rating: number | null
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          rating?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          event_id?: string | null
          id?: string
          rating?: number | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      conversations: {
        Row: {
          conversation_id: string | null
          is_sent_by_me: boolean | null
          last_message: string | null
          last_message_at: string | null
          other_user_id: string | null
          unread_count: number | null
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          bio: string | null
          company: string | null
          created_at: string | null
          github_link: string | null
          id: string | null
          instagram_link: string | null
          linkedin_link: string | null
          name: string | null
          networking_preferences: string[] | null
          niche: string | null
          photo_url: string | null
          role: string | null
          tags: string[] | null
          twitter_link: string | null
          website_link: string | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          github_link?: string | null
          id?: string | null
          instagram_link?: string | null
          linkedin_link?: string | null
          name?: string | null
          networking_preferences?: string[] | null
          niche?: string | null
          photo_url?: string | null
          role?: string | null
          tags?: string[] | null
          twitter_link?: string | null
          website_link?: string | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          created_at?: string | null
          github_link?: string | null
          id?: string | null
          instagram_link?: string | null
          linkedin_link?: string | null
          name?: string | null
          networking_preferences?: string[] | null
          niche?: string | null
          photo_url?: string | null
          role?: string | null
          tags?: string[] | null
          twitter_link?: string | null
          website_link?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_event_data: {
        Args: { event_uuid: string }
        Returns: boolean
      }
      generate_unique_event_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unique_host_access_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_event: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_event_attendees_with_profiles: {
        Args: { p_event_id: string }
        Returns: {
          id: string
          event_id: string
          user_id: string
          created_at: string
          joined_at: string
          name: string
          email: string
          role: string
          event_name: string
        }[]
      }
      get_poll_with_results: {
        Args: { poll_uuid: string }
        Returns: Json
      }
      get_user_current_event: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_event_host: {
        Args: { event_uuid: string }
        Returns: boolean
      }
      is_event_owner: {
        Args: { event_uuid: string }
        Returns: boolean
      }
      join_event_by_access_key: {
        Args: { access_code: string }
        Returns: Json
      }
      user_can_see_profile: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      user_has_joined_event: {
        Args: { user_uuid: string; event_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
