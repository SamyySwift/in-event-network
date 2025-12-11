export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_wallet_credits: {
        Row: {
          admin_id: string
          amount_naira: number
          created_at: string
          event_id: string
          id: string
          ticket_id: string
        }
        Insert: {
          admin_id: string
          amount_naira: number
          created_at?: string
          event_id: string
          id?: string
          ticket_id: string
        }
        Update: {
          admin_id?: string
          amount_naira?: number
          created_at?: string
          event_id?: string
          id?: string
          ticket_id?: string
        }
        Relationships: []
      }
      admin_wallets: {
        Row: {
          account_name: string | null
          account_number: string | null
          admin_id: string
          available_balance: number
          bank_code: string | null
          bank_name: string | null
          created_at: string
          event_id: string
          id: string
          is_bank_verified: boolean | null
          last_payout_at: string | null
          minimum_payout_amount: number | null
          recipient_code: string | null
          total_earnings: number
          updated_at: string
          withdrawn_amount: number
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          admin_id: string
          available_balance?: number
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string
          event_id: string
          id?: string
          is_bank_verified?: boolean | null
          last_payout_at?: string | null
          minimum_payout_amount?: number | null
          recipient_code?: string | null
          total_earnings?: number
          updated_at?: string
          withdrawn_amount?: number
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          admin_id?: string
          available_balance?: number
          bank_code?: string | null
          bank_name?: string | null
          created_at?: string
          event_id?: string
          id?: string
          is_bank_verified?: boolean | null
          last_payout_at?: string | null
          minimum_payout_amount?: number | null
          recipient_code?: string | null
          total_earnings?: number
          updated_at?: string
          withdrawn_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_wallets_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_wallets_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_wallets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisement_analytics: {
        Row: {
          advertisement_id: string
          created_at: string
          event_id: string | null
          id: string
          interaction_type: string
          ip_address: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          advertisement_id: string
          created_at?: string
          event_id?: string | null
          id?: string
          interaction_type: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          advertisement_id?: string
          created_at?: string
          event_id?: string | null
          id?: string
          interaction_type?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisement_analytics_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisement_analytics_summary"
            referencedColumns: ["advertisement_id"]
          },
          {
            foreignKeyName: "advertisement_analytics_advertisement_id_fkey"
            columns: ["advertisement_id"]
            isOneToOne: false
            referencedRelation: "advertisements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advertisement_analytics_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      advertisements: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number | null
          duration_seconds: number | null
          end_date: string | null
          event_id: string | null
          facebook_link: string | null
          id: string
          image_url: string | null
          instagram_link: string | null
          is_active: boolean | null
          link_url: string | null
          linkedin_link: string | null
          media_type: string | null
          media_url: string | null
          sponsor_logo: string | null
          sponsor_name: string
          start_date: string | null
          tiktok_link: string | null
          title: string
          twitter_link: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          end_date?: string | null
          event_id?: string | null
          facebook_link?: string | null
          id?: string
          image_url?: string | null
          instagram_link?: string | null
          is_active?: boolean | null
          link_url?: string | null
          linkedin_link?: string | null
          media_type?: string | null
          media_url?: string | null
          sponsor_logo?: string | null
          sponsor_name: string
          start_date?: string | null
          tiktok_link?: string | null
          title: string
          twitter_link?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          end_date?: string | null
          event_id?: string | null
          facebook_link?: string | null
          id?: string
          image_url?: string | null
          instagram_link?: string | null
          is_active?: boolean | null
          link_url?: string | null
          linkedin_link?: string | null
          media_type?: string | null
          media_url?: string | null
          sponsor_logo?: string | null
          sponsor_name?: string
          start_date?: string | null
          tiktok_link?: string | null
          title?: string
          twitter_link?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          event_id: string | null
          facebook_link: string | null
          id: string
          image_url: string | null
          instagram_link: string | null
          priority: string | null
          require_submission: boolean
          send_immediately: boolean | null
          tiktok_link: string | null
          title: string
          twitter_link: string | null
          updated_at: string
          vendor_form_id: string | null
          website_link: string | null
          whatsapp_link: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          facebook_link?: string | null
          id?: string
          image_url?: string | null
          instagram_link?: string | null
          priority?: string | null
          require_submission?: boolean
          send_immediately?: boolean | null
          tiktok_link?: string | null
          title: string
          twitter_link?: string | null
          updated_at?: string
          vendor_form_id?: string | null
          website_link?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          facebook_link?: string | null
          id?: string
          image_url?: string | null
          instagram_link?: string | null
          priority?: string | null
          require_submission?: boolean
          send_immediately?: boolean | null
          tiktok_link?: string | null
          title?: string
          twitter_link?: string | null
          updated_at?: string
          vendor_form_id?: string | null
          website_link?: string | null
          whatsapp_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_vendor_form_id_fkey"
            columns: ["vendor_form_id"]
            isOneToOne: false
            referencedRelation: "vendor_forms"
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
          room_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id?: string | null
          id?: string
          quoted_message_id?: string | null
          room_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string | null
          id?: string
          quoted_message_id?: string | null
          room_id?: string | null
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
          {
            foreignKeyName: "chat_messages_room_fk"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participation_points: {
        Row: {
          event_id: string
          points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          event_id: string
          points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          event_id?: string
          points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participation_points_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participation_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participation_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          event_id: string
          id: string
          name: string
          tag: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          event_id: string
          id?: string
          name: string
          tag?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          event_id?: string
          id?: string
          name?: string
          tag?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_event_fk"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_owner_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_owner_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          admin_id: string | null
          check_in_method: string
          checked_in_at: string
          created_at: string
          id: string
          notes: string | null
          ticket_id: string
        }
        Insert: {
          admin_id?: string | null
          check_in_method?: string
          checked_in_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          ticket_id: string
        }
        Update: {
          admin_id?: string | null
          check_in_method?: string
          checked_in_at?: string
          created_at?: string
          id?: string
          notes?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "event_tickets"
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
      event_access_codes: {
        Row: {
          access_code: string
          created_at: string
          event_id: string
          id: string
          unlocked_at: string
          unlocked_by_user_id: string | null
        }
        Insert: {
          access_code: string
          created_at?: string
          event_id: string
          id?: string
          unlocked_at?: string
          unlocked_by_user_id?: string | null
        }
        Update: {
          access_code?: string
          created_at?: string
          event_id?: string
          id?: string
          unlocked_at?: string
          unlocked_by_user_id?: string | null
        }
        Relationships: []
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
          user_id: string | null
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
          user_id?: string | null
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
          user_id?: string | null
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
      event_tickets: {
        Row: {
          check_in_status: boolean
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string
          event_id: string
          first_name: string | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          last_name: string | null
          payment_reference: string | null
          payment_status: string | null
          price: number
          purchase_date: string
          qr_code_data: string
          ticket_number: string
          ticket_type_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          check_in_status?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          event_id: string
          first_name?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          last_name?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          price?: number
          purchase_date?: string
          qr_code_data: string
          ticket_number: string
          ticket_type_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          check_in_status?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          event_id?: string
          first_name?: string | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          last_name?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          price?: number
          purchase_date?: string
          qr_code_data?: string
          ticket_number?: string
          ticket_type_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tickets_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ticket_type"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          accent_color: string | null
          background_color: string | null
          banner_url: string | null
          created_at: string
          custom_title: string | null
          description: string | null
          end_time: string
          event_key: string | null
          font_family: string | null
          host_id: string | null
          id: string
          is_live: boolean | null
          live_stream_url: string | null
          location: string | null
          logo_url: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          start_time: string
          text_color: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          banner_url?: string | null
          created_at?: string
          custom_title?: string | null
          description?: string | null
          end_time: string
          event_key?: string | null
          font_family?: string | null
          host_id?: string | null
          id?: string
          is_live?: boolean | null
          live_stream_url?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          start_time: string
          text_color?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          banner_url?: string | null
          created_at?: string
          custom_title?: string | null
          description?: string | null
          end_time?: string
          event_key?: string | null
          font_family?: string | null
          host_id?: string | null
          id?: string
          is_live?: boolean | null
          live_stream_url?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          start_time?: string
          text_color?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      facilities: {
        Row: {
          category: string
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
          voice_note_url: string | null
        }
        Insert: {
          category?: string
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
          voice_note_url?: string | null
        }
        Update: {
          category?: string
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
          voice_note_url?: string | null
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
      highlight_media: {
        Row: {
          created_at: string
          duration_seconds: number | null
          highlight_id: string
          id: string
          media_order: number
          media_type: string
          media_url: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          highlight_id: string
          id?: string
          media_order?: number
          media_type: string
          media_url: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          highlight_id?: string
          id?: string
          media_order?: number
          media_type?: string
          media_url?: string
        }
        Relationships: []
      }
      highlights: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          display_order: number
          event_id: string
          id: string
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          event_id: string
          id?: string
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          event_id?: string
          id?: string
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      live_stream_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          stream_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          stream_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_stream_messages_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_stream_signals: {
        Row: {
          created_at: string
          id: string
          signal_data: Json
          signal_type: string
          stream_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          signal_data: Json
          signal_type: string
          stream_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          signal_data?: Json
          signal_type?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_stream_signals_stream_id_fkey"
            columns: ["stream_id"]
            isOneToOne: false
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          created_at: string
          description: string | null
          ended_at: string | null
          event_id: string
          host_id: string
          id: string
          is_active: boolean
          started_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ended_at?: string | null
          event_id: string
          host_id: string
          id?: string
          is_active?: boolean
          started_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ended_at?: string | null
          event_id?: string
          host_id?: string
          id?: string
          is_active?: boolean
          started_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_streams_event_id_fkey"
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
          require_submission: boolean
          show_results: boolean | null
          start_time: string
          updated_at: string | null
          vote_limit: number | null
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
          require_submission?: boolean
          show_results?: boolean | null
          start_time: string
          updated_at?: string | null
          vote_limit?: number | null
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
          require_submission?: boolean
          show_results?: boolean | null
          start_time?: string
          updated_at?: string | null
          vote_limit?: number | null
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
          networking_visible: boolean | null
          niche: string | null
          photo_url: string | null
          role: string | null
          snapchat_link: string | null
          tags: string[] | null
          team_member_for_event: string | null
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
          networking_visible?: boolean | null
          niche?: string | null
          photo_url?: string | null
          role?: string | null
          snapchat_link?: string | null
          tags?: string[] | null
          team_member_for_event?: string | null
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
          networking_visible?: boolean | null
          niche?: string | null
          photo_url?: string | null
          role?: string | null
          snapchat_link?: string | null
          tags?: string[] | null
          team_member_for_event?: string | null
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
          {
            foreignKeyName: "profiles_team_member_for_event_fkey"
            columns: ["team_member_for_event"]
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
      quiz_games: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_id: string
          id: string
          is_active: boolean
          play_mode: string
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_id: string
          id?: string
          is_active?: boolean
          play_mode?: string
          title: string
          total_questions?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_id?: string
          id?: string
          is_active?: boolean
          play_mode?: string
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_games_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          options: Json
          question_order: number
          question_text: string
          quiz_game_id: string
          time_limit: number
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          options?: Json
          question_order?: number
          question_text: string
          quiz_game_id: string
          time_limit?: number
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          options?: Json
          question_order?: number
          question_text?: string
          quiz_game_id?: string
          time_limit?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_game_id_fkey"
            columns: ["quiz_game_id"]
            isOneToOne: false
            referencedRelation: "quiz_games"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_responses: {
        Row: {
          answered_at: string
          id: string
          is_correct: boolean
          question_id: string
          quiz_game_id: string
          selected_answer: string
          time_taken: number
          user_id: string
        }
        Insert: {
          answered_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          quiz_game_id: string
          selected_answer: string
          time_taken: number
          user_id: string
        }
        Update: {
          answered_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          quiz_game_id?: string
          selected_answer?: string
          time_taken?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_responses_quiz_game_id_fkey"
            columns: ["quiz_game_id"]
            isOneToOne: false
            referencedRelation: "quiz_games"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_scores: {
        Row: {
          completed_at: string
          correct_answers: number
          id: string
          quiz_game_id: string
          total_score: number
          total_time: number
          user_id: string
        }
        Insert: {
          completed_at?: string
          correct_answers?: number
          id?: string
          quiz_game_id: string
          total_score?: number
          total_time?: number
          user_id: string
        }
        Update: {
          completed_at?: string
          correct_answers?: number
          id?: string
          quiz_game_id?: string
          total_score?: number
          total_time?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_scores_quiz_game_id_fkey"
            columns: ["quiz_game_id"]
            isOneToOne: false
            referencedRelation: "quiz_games"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_sessions: {
        Row: {
          created_at: string
          current_question_index: number
          ended_at: string | null
          event_id: string
          id: string
          is_active: boolean
          quiz_game_id: string
          started_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_question_index?: number
          ended_at?: string | null
          event_id: string
          id?: string
          is_active?: boolean
          quiz_game_id: string
          started_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_question_index?: number
          ended_at?: string | null
          event_id?: string
          id?: string
          is_active?: boolean
          quiz_game_id?: string
          started_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_sessions_quiz_game_id_fkey"
            columns: ["quiz_game_id"]
            isOneToOne: false
            referencedRelation: "quiz_games"
            referencedColumns: ["id"]
          },
        ]
      }
      room_members: {
        Row: {
          id: string
          joined_at: string
          room_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          room_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_members_room_fk"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_members_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_members_user_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
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
          end_date: string | null
          end_time: string | null
          end_time_only: string | null
          event_id: string
          id: string
          image_url: string | null
          location: string | null
          priority: string | null
          start_date: string | null
          start_time: string | null
          start_time_only: string | null
          time_allocation: string | null
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          end_time_only?: string | null
          event_id: string
          id?: string
          image_url?: string | null
          location?: string | null
          priority?: string | null
          start_date?: string | null
          start_time?: string | null
          start_time_only?: string | null
          time_allocation?: string | null
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          end_time_only?: string | null
          event_id?: string
          id?: string
          image_url?: string | null
          location?: string | null
          priority?: string | null
          start_date?: string | null
          start_time?: string | null
          start_time_only?: string | null
          time_allocation?: string | null
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
          end_date: string | null
          end_time: string | null
          event_id: string | null
          id: string
          instagram_link: string | null
          linkedin_link: string | null
          name: string
          photo_url: string | null
          session_time: string | null
          session_title: string | null
          start_date: string | null
          start_time: string | null
          tiktok_link: string | null
          time_allocation: string | null
          title: string | null
          topic: string | null
          twitter_link: string | null
          updated_at: string
          website_link: string | null
        }
        Insert: {
          bio: string
          company?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          end_time?: string | null
          event_id?: string | null
          id?: string
          instagram_link?: string | null
          linkedin_link?: string | null
          name: string
          photo_url?: string | null
          session_time?: string | null
          session_title?: string | null
          start_date?: string | null
          start_time?: string | null
          tiktok_link?: string | null
          time_allocation?: string | null
          title?: string | null
          topic?: string | null
          twitter_link?: string | null
          updated_at?: string
          website_link?: string | null
        }
        Update: {
          bio?: string
          company?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          end_time?: string | null
          event_id?: string | null
          id?: string
          instagram_link?: string | null
          linkedin_link?: string | null
          name?: string
          photo_url?: string | null
          session_time?: string | null
          session_title?: string | null
          start_date?: string | null
          start_time?: string | null
          tiktok_link?: string | null
          time_allocation?: string | null
          title?: string | null
          topic?: string | null
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
      sponsor_form_fields: {
        Row: {
          created_at: string
          field_options: Json | null
          field_order: number
          field_type: string
          form_id: string
          helper_text: string | null
          id: string
          is_required: boolean
          label: string
          placeholder: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          field_options?: Json | null
          field_order?: number
          field_type: string
          form_id: string
          helper_text?: string | null
          id?: string
          is_required?: boolean
          label: string
          placeholder?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          field_options?: Json | null
          field_order?: number
          field_type?: string
          form_id?: string
          helper_text?: string | null
          id?: string
          is_required?: boolean
          label?: string
          placeholder?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "sponsor_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsor_forms: {
        Row: {
          created_at: string
          created_by: string | null
          event_id: string
          form_description: string | null
          form_fields: Json
          form_title: string
          id: string
          is_active: boolean
          shareable_link: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_id: string
          form_description?: string | null
          form_fields?: Json
          form_title?: string
          id?: string
          is_active?: boolean
          shareable_link?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_id?: string
          form_description?: string | null
          form_fields?: Json
          form_title?: string
          id?: string
          is_active?: boolean
          shareable_link?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sponsor_forms_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          additional_notes: string | null
          call_number: string | null
          category: string
          contact_person_name: string
          created_at: string
          description: string | null
          email: string
          event_id: string
          facebook_link: string | null
          id: string
          instagram_handle: string | null
          linkedin_link: string | null
          logo_url: string | null
          organization_name: string
          phone_number: string | null
          products: Json | null
          qr_code_data: string | null
          social_media_links: Json | null
          sponsorship_type: string
          status: string
          twitter_link: string | null
          updated_at: string
          website_link: string | null
          whatsapp_number: string | null
        }
        Insert: {
          additional_notes?: string | null
          call_number?: string | null
          category?: string
          contact_person_name: string
          created_at?: string
          description?: string | null
          email: string
          event_id: string
          facebook_link?: string | null
          id?: string
          instagram_handle?: string | null
          linkedin_link?: string | null
          logo_url?: string | null
          organization_name: string
          phone_number?: string | null
          products?: Json | null
          qr_code_data?: string | null
          social_media_links?: Json | null
          sponsorship_type: string
          status?: string
          twitter_link?: string | null
          updated_at?: string
          website_link?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          additional_notes?: string | null
          call_number?: string | null
          category?: string
          contact_person_name?: string
          created_at?: string
          description?: string | null
          email?: string
          event_id?: string
          facebook_link?: string | null
          id?: string
          instagram_handle?: string | null
          linkedin_link?: string | null
          logo_url?: string | null
          organization_name?: string
          phone_number?: string | null
          products?: Json | null
          qr_code_data?: string | null
          social_media_links?: Json | null
          sponsorship_type?: string
          status?: string
          twitter_link?: string | null
          updated_at?: string
          website_link?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sponsors_event"
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
      super_admins: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          permissions: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          permissions?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          admin_id: string
          allowed_sections: Database["public"]["Enums"]["dashboard_section"][]
          created_at: string
          email: string
          event_id: string
          expires_at: string | null
          id: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          admin_id: string
          allowed_sections?: Database["public"]["Enums"]["dashboard_section"][]
          created_at?: string
          email: string
          event_id: string
          expires_at?: string | null
          id?: string
          status?: string
          token: string
          updated_at?: string
        }
        Update: {
          admin_id?: string
          allowed_sections?: Database["public"]["Enums"]["dashboard_section"][]
          created_at?: string
          email?: string
          event_id?: string
          expires_at?: string | null
          id?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          admin_id: string
          allowed_sections: Database["public"]["Enums"]["dashboard_section"][]
          created_at: string
          event_id: string
          expires_at: string | null
          id: string
          invited_at: string
          is_active: boolean
          joined_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id: string
          allowed_sections?: Database["public"]["Enums"]["dashboard_section"][]
          created_at?: string
          event_id: string
          expires_at?: string | null
          id?: string
          invited_at?: string
          is_active?: boolean
          joined_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string
          allowed_sections?: Database["public"]["Enums"]["dashboard_section"][]
          created_at?: string
          event_id?: string
          expires_at?: string | null
          id?: string
          invited_at?: string
          is_active?: boolean
          joined_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_form_fields: {
        Row: {
          created_at: string | null
          field_options: Json | null
          field_order: number
          field_type: string
          helper_text: string | null
          id: string
          is_required: boolean | null
          label: string
          ticket_type_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          field_options?: Json | null
          field_order?: number
          field_type: string
          helper_text?: string | null
          id?: string
          is_required?: boolean | null
          label: string
          ticket_type_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          field_options?: Json | null
          field_order?: number
          field_type?: string
          helper_text?: string | null
          id?: string
          is_required?: boolean | null
          label?: string
          ticket_type_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_form_fields_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_form_responses: {
        Row: {
          created_at: string | null
          form_field_id: string
          id: string
          response_value: Json
          ticket_id: string
        }
        Insert: {
          created_at?: string | null
          form_field_id: string
          id?: string
          response_value: Json
          ticket_id: string
        }
        Update: {
          created_at?: string | null
          form_field_id?: string
          id?: string
          response_value?: Json
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_form_responses_form_field_id_fkey"
            columns: ["form_field_id"]
            isOneToOne: false
            referencedRelation: "ticket_form_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_form_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "event_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_types: {
        Row: {
          available_quantity: number
          created_at: string
          created_by: string | null
          description: string | null
          display_price: number | null
          event_id: string
          id: string
          include_fees_in_price: boolean | null
          is_active: boolean
          max_quantity: number | null
          max_tickets_per_user: number
          name: string
          organizer_receives: number | null
          payment_gateway_fee_percentage: number | null
          payment_gateway_fixed_fee: number | null
          price: number
          requires_login: boolean
          service_fee_percentage: number | null
          updated_at: string
        }
        Insert: {
          available_quantity?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_price?: number | null
          event_id: string
          id?: string
          include_fees_in_price?: boolean | null
          is_active?: boolean
          max_quantity?: number | null
          max_tickets_per_user?: number
          name: string
          organizer_receives?: number | null
          payment_gateway_fee_percentage?: number | null
          payment_gateway_fixed_fee?: number | null
          price?: number
          requires_login?: boolean
          service_fee_percentage?: number | null
          updated_at?: string
        }
        Update: {
          available_quantity?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_price?: number | null
          event_id?: string
          id?: string
          include_fees_in_price?: boolean | null
          is_active?: boolean
          max_quantity?: number | null
          max_tickets_per_user?: number
          name?: string
          organizer_receives?: number | null
          payment_gateway_fee_percentage?: number | null
          payment_gateway_fixed_fee?: number | null
          price?: number
          requires_login?: boolean
          service_fee_percentage?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_types_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          poll_id: string | null
          status: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          poll_id?: string | null
          status?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          poll_id?: string | null
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_form_fields: {
        Row: {
          created_at: string
          field_description: string | null
          field_id: string
          field_options: Json | null
          field_order: number
          field_type: string
          form_id: string
          id: string
          is_required: boolean
          label: string
          placeholder: string | null
          updated_at: string
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string
          field_description?: string | null
          field_id: string
          field_options?: Json | null
          field_order?: number
          field_type: string
          form_id: string
          id?: string
          is_required?: boolean
          label: string
          placeholder?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string
          field_description?: string | null
          field_id?: string
          field_options?: Json | null
          field_order?: number
          field_type?: string
          form_id?: string
          id?: string
          is_required?: boolean
          label?: string
          placeholder?: string | null
          updated_at?: string
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "vendor_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_forms: {
        Row: {
          created_at: string
          created_by: string | null
          event_id: string
          form_description: string | null
          form_title: string
          id: string
          is_active: boolean
          shareable_link: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_id: string
          form_description?: string | null
          form_title?: string
          id?: string
          is_active?: boolean
          shareable_link?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_id?: string
          form_description?: string | null
          form_title?: string
          id?: string
          is_active?: boolean
          shareable_link?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_vendor_forms_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_submissions: {
        Row: {
          created_at: string
          form_id: string
          id: string
          ip_address: unknown
          notes: string | null
          responses: Json
          status: string
          submitted_at: string
          updated_at: string
          user_agent: string | null
          vendor_email: string
          vendor_name: string
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          ip_address?: unknown
          notes?: string | null
          responses?: Json
          status?: string
          submitted_at?: string
          updated_at?: string
          user_agent?: string | null
          vendor_email: string
          vendor_name: string
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          ip_address?: unknown
          notes?: string | null
          responses?: Json
          status?: string
          submitted_at?: string
          updated_at?: string
          user_agent?: string | null
          vendor_email?: string
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "vendor_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          business_logo_url: string | null
          created_at: string
          description: string | null
          event_id: string
          facebook_link: string | null
          id: string
          instagram_link: string | null
          is_active: boolean
          is_approved: boolean
          phone_number: string | null
          updated_at: string
          vendor_name: string
          website_link: string | null
          whatsapp_contact: string | null
        }
        Insert: {
          business_logo_url?: string | null
          created_at?: string
          description?: string | null
          event_id: string
          facebook_link?: string | null
          id?: string
          instagram_link?: string | null
          is_active?: boolean
          is_approved?: boolean
          phone_number?: string | null
          updated_at?: string
          vendor_name: string
          website_link?: string | null
          whatsapp_contact?: string | null
        }
        Update: {
          business_logo_url?: string | null
          created_at?: string
          description?: string | null
          event_id?: string
          facebook_link?: string | null
          id?: string
          instagram_link?: string | null
          is_active?: boolean
          is_approved?: boolean
          phone_number?: string | null
          updated_at?: string
          vendor_name?: string
          website_link?: string | null
          whatsapp_contact?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vendors_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          account_name: string | null
          account_number: string | null
          admin_wallet_id: string
          amount: number
          amount_naira: number | null
          bank_name: string | null
          created_at: string | null
          failure_reason: string | null
          id: string
          paystack_recipient_code: string | null
          paystack_transfer_code: string | null
          processed_at: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          account_name?: string | null
          account_number?: string | null
          admin_wallet_id: string
          amount: number
          amount_naira?: number | null
          bank_name?: string | null
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          paystack_recipient_code?: string | null
          paystack_transfer_code?: string | null
          processed_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          account_name?: string | null
          account_number?: string | null
          admin_wallet_id?: string
          amount?: number
          amount_naira?: number | null
          bank_name?: string | null
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          paystack_recipient_code?: string | null
          paystack_transfer_code?: string | null
          processed_at?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_admin_wallet_id_fkey"
            columns: ["admin_wallet_id"]
            isOneToOne: false
            referencedRelation: "admin_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      word_search_games: {
        Row: {
          created_at: string
          created_by: string | null
          difficulty: string | null
          event_id: string
          grid_data: Json
          grid_size: number
          hints_enabled: boolean | null
          id: string
          is_active: boolean
          theme: string | null
          time_limit: number | null
          title: string
          updated_at: string
          words: string[]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          event_id: string
          grid_data: Json
          grid_size?: number
          hints_enabled?: boolean | null
          id?: string
          is_active?: boolean
          theme?: string | null
          time_limit?: number | null
          title: string
          updated_at?: string
          words: string[]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          difficulty?: string | null
          event_id?: string
          grid_data?: Json
          grid_size?: number
          hints_enabled?: boolean | null
          id?: string
          is_active?: boolean
          theme?: string | null
          time_limit?: number | null
          title?: string
          updated_at?: string
          words?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "word_search_games_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      word_search_scores: {
        Row: {
          completed_at: string
          created_at: string
          game_id: string
          id: string
          points: number
          time_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          game_id: string
          id?: string
          points: number
          time_seconds: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          game_id?: string
          id?: string
          points?: number
          time_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_search_scores_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "word_search_games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      advertisement_analytics_summary: {
        Row: {
          advertisement_id: string | null
          event_names: string[] | null
          events_displayed_count: number | null
          is_active: boolean | null
          sponsor_name: string | null
          title: string | null
          total_clicks: number | null
          total_redirects: number | null
          total_views: number | null
          unique_sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
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
          id: string | null
          name: string | null
          niche: string | null
          photo_url: string | null
          role: string | null
        }
        Insert: {
          bio?: string | null
          company?: string | null
          id?: string | null
          name?: string | null
          niche?: string | null
          photo_url?: string | null
          role?: string | null
        }
        Update: {
          bio?: string | null
          company?: string | null
          id?: string | null
          name?: string | null
          niche?: string | null
          photo_url?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_update_user_role: {
        Args: { new_role: string; target_email: string }
        Returns: Json
      }
      bulk_scan_in_attendees: {
        Args: { target_event_id: string }
        Returns: number
      }
      bulk_scan_out_attendees: {
        Args: { target_event_id: string }
        Returns: number
      }
      calculate_ticket_pricing: {
        Args: {
          base_price: number
          gateway_fee_pct?: number
          gateway_fixed_fee?: number
          include_fees?: boolean
          service_fee_pct?: number
        }
        Returns: {
          display_price: number
          gateway_fee: number
          organizer_receives: number
          service_fee: number
          total_fees: number
        }[]
      }
      can_access_event_data: { Args: { event_uuid: string }; Returns: boolean }
      checkin_ticket_by_qr_public: {
        Args: { qr_data: string; target_event_id: string }
        Returns: Json
      }
      checkin_ticket_public: {
        Args: {
          notes_text?: string
          search_query: string
          target_event_id: string
        }
        Returns: Json
      }
      debug_user_role: {
        Args: { user_email: string }
        Returns: {
          created_at: string
          email: string
          name: string
          role: string
          user_id: string
        }[]
      }
      generate_invite_token: { Args: never; Returns: string }
      generate_sponsor_qr_data: {
        Args: { sponsor_id: string }
        Returns: string
      }
      generate_ticket_number: { Args: never; Returns: string }
      generate_unique_event_key: { Args: never; Returns: string }
      generate_unique_host_access_key: { Args: never; Returns: string }
      get_admin_event_connections: {
        Args: { admin_event_ids: string[] }
        Returns: {
          connection_count: number
        }[]
      }
      get_current_user_event: { Args: never; Returns: string }
      get_current_user_role: { Args: never; Returns: string }
      get_dashboard_analytics: {
        Args: never
        Returns: {
          active_events: number
          completed_events: number
          monthly_registrations: number
          total_admins: number
          total_attendees: number
          total_revenue: number
          total_subscriptions: number
          total_tickets_sold: number
          weekly_registrations: number
        }[]
      }
      get_event_attendance_count: {
        Args: { event_uuid: string }
        Returns: number
      }
      get_event_attendees_with_profiles: {
        Args: { p_event_id: string }
        Returns: {
          bio: string
          company: string
          created_at: string
          email: string
          event_id: string
          event_name: string
          github_link: string
          id: string
          instagram_link: string
          joined_at: string
          linkedin_link: string
          name: string
          networking_preferences: string[]
          niche: string
          photo_url: string
          role: string
          tags: string[]
          twitter_link: string
          user_id: string
          website_link: string
        }[]
      }
      get_event_checkin_stats: {
        Args: { target_event_id: string }
        Returns: Json
      }
      get_event_tickets_for_checkin: {
        Args: { target_event_id: string }
        Returns: {
          check_in_status: boolean
          checked_in_at: string
          guest_email: string
          guest_name: string
          id: string
          price: number
          profile_email: string
          profile_name: string
          purchase_date: string
          ticket_number: string
          ticket_type_name: string
          user_id: string
        }[]
      }
      get_poll_with_results: { Args: { poll_uuid: string }; Returns: Json }
      get_user_current_event: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      grant_attendee_dashboard_access: {
        Args: { attendee_user_id: string; target_event_id: string }
        Returns: Json
      }
      has_section_access: {
        Args: { section_name: string; target_event_id?: string }
        Returns: boolean
      }
      impersonate_organizer: {
        Args: { organizer_user_id: string }
        Returns: Json
      }
      increment_wallet_balance: {
        Args: { p_admin_id: string; p_amount: number; p_event_id: string }
        Returns: undefined
      }
      is_admin_for_event: { Args: { event_uuid: string }; Returns: boolean }
      is_admin_role: { Args: { role_text: string }; Returns: boolean }
      is_admin_user: { Args: { user_uuid: string }; Returns: boolean }
      is_event_host: { Args: { event_uuid: string }; Returns: boolean }
      is_event_owner: { Args: { event_uuid: string }; Returns: boolean }
      is_super_admin: { Args: { user_uuid?: string }; Returns: boolean }
      join_event_by_access_key: { Args: { access_code: string }; Returns: Json }
      log_activity: {
        Args: {
          p_action: string
          p_details?: Json
          p_entity_id?: string
          p_entity_type?: string
        }
        Returns: string
      }
      user_can_see_profile: {
        Args: { profile_user_id: string }
        Returns: boolean
      }
      user_has_joined_event: {
        Args: { event_uuid: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      dashboard_section:
        | "dashboard"
        | "events"
        | "tickets"
        | "checkin"
        | "attendees"
        | "speakers"
        | "announcements"
        | "schedule"
        | "polls"
        | "facilities"
        | "rules"
        | "questions"
        | "suggestions"
        | "notifications"
        | "sponsors"
        | "vendor-hub"
        | "settings"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dashboard_section: [
        "dashboard",
        "events",
        "tickets",
        "checkin",
        "attendees",
        "speakers",
        "announcements",
        "schedule",
        "polls",
        "facilities",
        "rules",
        "questions",
        "suggestions",
        "notifications",
        "sponsors",
        "vendor-hub",
        "settings",
      ],
    },
  },
} as const
