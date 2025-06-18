export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
      event_payments: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'success' | 'failed';
          paystack_reference: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          amount: number;
          currency?: string;
          status?: 'pending' | 'success' | 'failed';
          paystack_reference: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          amount?: number;
          currency?: string;
          status?: 'pending' | 'success' | 'failed';
          paystack_reference?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
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
          event_id: string;
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
          event_id: string;
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
      event_participants: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          created_at: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          created_at?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          created_at?: string;
          joined_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          name: string;
          description?: string;
          start_time: string;
          end_time: string;
          location?: string;
          host_id?: string;
          event_key?: string;
          logo_url?: string;
          banner_url?: string;
          website?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          start_time: string;
          end_time: string;
          location?: string;
          host_id?: string;
          event_key?: string;
          logo_url?: string;
          banner_url?: string;
          website?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          start_time?: string;
          end_time?: string;
          location?: string;
          host_id?: string;
          event_key?: string;
          logo_url?: string;
          banner_url?: string;
          website?: string;
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
          current_event_id: string | null;
          access_key: string | null;
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
          current_event_id?: string | null;
          access_key?: string | null;
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
          current_event_id?: string | null;
          access_key?: string | null;
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
    };
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
    };
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
          company: string
          bio: string
          niche: string
          photo_url: string
          networking_preferences: string[]
          tags: string[]
          twitter_link: string
          linkedin_link: string
          github_link: string
          instagram_link: string
          website_link: string
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
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    }
  };
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
