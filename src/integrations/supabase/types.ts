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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ar_products: {
        Row: {
          ar_viewer_url: string | null
          button_bg_color: string
          button_border_radius: number
          button_label: string
          button_size: string
          button_text_color: string
          created_at: string | null
          dominant_color: string | null
          embed_count: number
          error_message: string | null
          file_size_bytes: number | null
          glb_url: string | null
          gradient_from: string | null
          gradient_to: string | null
          id: string
          image_height: number | null
          image_width: number | null
          is_public: boolean | null
          original_image_url: string | null
          processed_image_url: string | null
          processing_progress: number | null
          processing_step: string | null
          product_colors: Json
          product_name: string
          product_price: number | null
          qr_code_url: string | null
          show_branding: boolean
          status: string
          updated_at: string | null
          usdz_url: string | null
          use_gradient: boolean
          user_id: string
          views_count: number
        }
        Insert: {
          ar_viewer_url?: string | null
          button_bg_color?: string
          button_border_radius?: number
          button_label?: string
          button_size?: string
          button_text_color?: string
          created_at?: string | null
          dominant_color?: string | null
          embed_count?: number
          error_message?: string | null
          file_size_bytes?: number | null
          glb_url?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_public?: boolean | null
          original_image_url?: string | null
          processed_image_url?: string | null
          processing_progress?: number | null
          processing_step?: string | null
          product_colors?: Json
          product_name: string
          product_price?: number | null
          qr_code_url?: string | null
          show_branding?: boolean
          status?: string
          updated_at?: string | null
          usdz_url?: string | null
          use_gradient?: boolean
          user_id: string
          views_count?: number
        }
        Update: {
          ar_viewer_url?: string | null
          button_bg_color?: string
          button_border_radius?: number
          button_label?: string
          button_size?: string
          button_text_color?: string
          created_at?: string | null
          dominant_color?: string | null
          embed_count?: number
          error_message?: string | null
          file_size_bytes?: number | null
          glb_url?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_public?: boolean | null
          original_image_url?: string | null
          processed_image_url?: string | null
          processing_progress?: number | null
          processing_step?: string | null
          product_colors?: Json
          product_name?: string
          product_price?: number | null
          qr_code_url?: string | null
          show_branding?: boolean
          status?: string
          updated_at?: string | null
          usdz_url?: string | null
          use_gradient?: boolean
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      ar_views: {
        Row: {
          ar_capability: string | null
          browser: string | null
          country_code: string | null
          device_type: string | null
          id: string
          product_id: string
          viewed_at: string | null
          viewer_ip_hash: string | null
        }
        Insert: {
          ar_capability?: string | null
          browser?: string | null
          country_code?: string | null
          device_type?: string | null
          id?: string
          product_id: string
          viewed_at?: string | null
          viewer_ip_hash?: string | null
        }
        Update: {
          ar_capability?: string | null
          browser?: string | null
          country_code?: string | null
          device_type?: string | null
          id?: string
          product_id?: string
          viewed_at?: string | null
          viewer_ip_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ar_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ar_products"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_history: {
        Row: {
          amount_usd: number
          billing_period_end: string | null
          billing_period_start: string | null
          created_at: string | null
          currency: string | null
          id: string
          invoice_url: string | null
          plan: string
          status: string
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount_usd: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          invoice_url?: string | null
          plan: string
          status: string
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount_usd?: number
          billing_period_end?: string | null
          billing_period_start?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          invoice_url?: string | null
          plan?: string
          status?: string
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          store_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          store_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          store_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_plans: {
        Row: {
          ar_product_limit: number
          billing_end_date: string | null
          billing_start_date: string | null
          billing_status: string | null
          created_at: string | null
          id: string
          plan: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ar_product_limit?: number
          billing_end_date?: string | null
          billing_start_date?: string | null
          billing_status?: string | null
          created_at?: string | null
          id?: string
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ar_product_limit?: number
          billing_end_date?: string | null
          billing_start_date?: string | null
          billing_status?: string | null
          created_at?: string | null
          id?: string
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_dashboard_stats: { Args: { uid: string }; Returns: Json }
      increment_ar_views: {
        Args: { p_capability: string; p_device: string; p_product_id: string }
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
