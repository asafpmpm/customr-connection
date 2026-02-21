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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          body_template: string
          campaign_name: string
          campaign_type: string
          created_at: string
          id: string
          status: string
          subject_template: string | null
          target_filters: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body_template: string
          campaign_name: string
          campaign_type: string
          created_at?: string
          id?: string
          status?: string
          subject_template?: string | null
          target_filters?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body_template?: string
          campaign_name?: string
          campaign_type?: string
          created_at?: string
          id?: string
          status?: string
          subject_template?: string | null
          target_filters?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          birth_date: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          is_active: boolean
          last_name: string
          notes: string | null
          organization: string | null
          phone: string | null
          religion_affiliation: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean
          last_name: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          religion_affiliation?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean
          last_name?: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          religion_affiliation?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      holidays: {
        Row: {
          created_at: string
          description: string | null
          holiday_date: string
          holiday_name: string
          id: string
          is_active: boolean
          religion_affiliation: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          holiday_date: string
          holiday_name: string
          id?: string
          is_active?: boolean
          religion_affiliation: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          holiday_date?: string
          holiday_name?: string
          id?: string
          is_active?: boolean
          religion_affiliation?: string
          user_id?: string
        }
        Relationships: []
      }
      message_history: {
        Row: {
          body_rendered: string
          channel: string
          created_at: string
          customer_id: string
          event_id: string | null
          id: string
          message_type: string
          status: string
          subject_rendered: string | null
          template_id: string | null
          user_id: string
        }
        Insert: {
          body_rendered: string
          channel: string
          created_at?: string
          customer_id: string
          event_id?: string | null
          id?: string
          message_type: string
          status?: string
          subject_rendered?: string | null
          template_id?: string | null
          user_id: string
        }
        Update: {
          body_rendered?: string
          channel?: string
          created_at?: string
          customer_id?: string
          event_id?: string | null
          id?: string
          message_type?: string
          status?: string
          subject_rendered?: string | null
          template_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_history_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "relationship_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_history_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "message_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      message_templates: {
        Row: {
          body_template: string
          category: string
          channel: string
          created_at: string
          id: string
          is_default: boolean
          subject_template: string | null
          template_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body_template: string
          category: string
          channel: string
          created_at?: string
          id?: string
          is_default?: boolean
          subject_template?: string | null
          template_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body_template?: string
          category?: string
          channel?: string
          created_at?: string
          id?: string
          is_default?: boolean
          subject_template?: string | null
          template_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      relationship_events: {
        Row: {
          created_at: string
          customer_id: string
          event_date: string
          event_title: string
          event_type: string
          id: string
          notes: string | null
          religion_affiliation: string | null
          source_info: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          event_date: string
          event_title: string
          event_type: string
          id?: string
          notes?: string | null
          religion_affiliation?: string | null
          source_info?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          event_date?: string
          event_title?: string
          event_type?: string
          id?: string
          notes?: string | null
          religion_affiliation?: string | null
          source_info?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationship_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
