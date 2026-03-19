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
      diet_plans: {
        Row: {
          created_at: string
          id: string
          plan_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      food_logs: {
        Row: {
          carbs: string | null
          confidence: string | null
          created_at: string
          estimated_calories: number | null
          fat: string | null
          fiber: string | null
          food_name: string
          id: string
          image_url: string | null
          protein: string | null
          user_id: string
        }
        Insert: {
          carbs?: string | null
          confidence?: string | null
          created_at?: string
          estimated_calories?: number | null
          fat?: string | null
          fiber?: string | null
          food_name: string
          id?: string
          image_url?: string | null
          protein?: string | null
          user_id: string
        }
        Update: {
          carbs?: string | null
          confidence?: string | null
          created_at?: string
          estimated_calories?: number | null
          fat?: string | null
          fiber?: string | null
          food_name?: string
          id?: string
          image_url?: string | null
          protein?: string | null
          user_id?: string
        }
        Relationships: []
      }
      phone_otps: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          phone: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone?: string
          verified?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: string | null
          body_fat: number | null
          created_at: string
          dietary_preference: string | null
          equipment: string | null
          experience: string | null
          gender: string | null
          goal: string | null
          height: number | null
          id: string
          last_login_at: string | null
          location: string | null
          login_count: number | null
          name: string | null
          onboarding_completed: boolean
          phone: string | null
          total_diet_plans_generated: number | null
          total_food_scans: number | null
          total_workouts_generated: number | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: string | null
          body_fat?: number | null
          created_at?: string
          dietary_preference?: string | null
          equipment?: string | null
          experience?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id: string
          last_login_at?: string | null
          location?: string | null
          login_count?: number | null
          name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          total_diet_plans_generated?: number | null
          total_food_scans?: number | null
          total_workouts_generated?: number | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: string | null
          body_fat?: number | null
          created_at?: string
          dietary_preference?: string | null
          equipment?: string | null
          experience?: string | null
          gender?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          last_login_at?: string | null
          location?: string | null
          login_count?: number | null
          name?: string | null
          onboarding_completed?: boolean
          phone?: string | null
          total_diet_plans_generated?: number | null
          total_food_scans?: number | null
          total_workouts_generated?: number | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          body_fat: number | null
          created_at: string
          id: string
          measurement_date: string
          user_id: string
          weight: number
        }
        Insert: {
          body_fat?: number | null
          created_at?: string
          id?: string
          measurement_date?: string
          user_id: string
          weight: number
        }
        Update: {
          body_fat?: number | null
          created_at?: string
          id?: string
          measurement_date?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string
          id: string
          plan_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_data?: Json
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_login_count: {
        Args: { user_id_input: string }
        Returns: undefined
      }
      increment_profile_counter: {
        Args: { counter_field: string; user_id_input: string }
        Returns: undefined
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
