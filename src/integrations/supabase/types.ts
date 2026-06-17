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
          ar_customization: Json
          ar_mode: string
          ar_subtype: string | null
          ar_viewer_url: string | null
          button_bg_color: string
          button_border_radius: number
          button_label: string
          button_size: string
          button_text_color: string
          category_id: string | null
          created_at: string | null
          dominant_color: string | null
          embed_count: number
          embed_token: string | null
          error_message: string | null
          extra_images: string[]
          file_size_bytes: number | null
          glb_url: string | null
          gradient_from: string | null
          gradient_to: string | null
          id: string
          image_height: number | null
          image_width: number | null
          is_demo: boolean
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
          view_count: number
          views_count: number
        }
        Insert: {
          ar_customization?: Json
          ar_mode?: string
          ar_subtype?: string | null
          ar_viewer_url?: string | null
          button_bg_color?: string
          button_border_radius?: number
          button_label?: string
          button_size?: string
          button_text_color?: string
          category_id?: string | null
          created_at?: string | null
          dominant_color?: string | null
          embed_count?: number
          embed_token?: string | null
          error_message?: string | null
          extra_images?: string[]
          file_size_bytes?: number | null
          glb_url?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_demo?: boolean
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
          view_count?: number
          views_count?: number
        }
        Update: {
          ar_customization?: Json
          ar_mode?: string
          ar_subtype?: string | null
          ar_viewer_url?: string | null
          button_bg_color?: string
          button_border_radius?: number
          button_label?: string
          button_size?: string
          button_text_color?: string
          category_id?: string | null
          created_at?: string | null
          dominant_color?: string | null
          embed_count?: number
          embed_token?: string | null
          error_message?: string | null
          extra_images?: string[]
          file_size_bytes?: number | null
          glb_url?: string | null
          gradient_from?: string | null
          gradient_to?: string | null
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_demo?: boolean
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
          view_count?: number
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "ar_products_category_fk"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ar_sessions: {
        Row: {
          ar_mode: string | null
          camera_used: string | null
          country: string | null
          created_at: string
          device_type: string | null
          did_close_manually: boolean
          did_interact: boolean
          id: string
          ip_hash: string | null
          os_type: string | null
          product_id: string
          referrer: string | null
          session_id: string
          time_spent_seconds: number
          user_agent: string | null
          vendor_id: string
        }
        Insert: {
          ar_mode?: string | null
          camera_used?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          did_close_manually?: boolean
          did_interact?: boolean
          id?: string
          ip_hash?: string | null
          os_type?: string | null
          product_id: string
          referrer?: string | null
          session_id: string
          time_spent_seconds?: number
          user_agent?: string | null
          vendor_id: string
        }
        Update: {
          ar_mode?: string | null
          camera_used?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          did_close_manually?: boolean
          did_interact?: boolean
          id?: string
          ip_hash?: string | null
          os_type?: string | null
          product_id?: string
          referrer?: string | null
          session_id?: string
          time_spent_seconds?: number
          user_agent?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ar_sessions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ar_products"
            referencedColumns: ["id"]
          },
        ]
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
      models_3d: {
        Row: {
          created_at: string
          error_message: string | null
          external_task_id: string | null
          glb_url: string | null
          id: string
          preview_url: string | null
          processing_status: string
          product_id: string
          updated_at: string
          usdz_url: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          external_task_id?: string | null
          glb_url?: string | null
          id?: string
          preview_url?: string | null
          processing_status?: string
          product_id: string
          updated_at?: string
          usdz_url?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          external_task_id?: string | null
          glb_url?: string | null
          id?: string
          preview_url?: string | null
          processing_status?: string
          product_id?: string
          updated_at?: string
          usdz_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "models_3d_product_id_fkey"
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
      product_alternatives: {
        Row: {
          alt_product_id: string
          created_at: string
          id: string
          position: number
          product_id: string
          user_id: string
        }
        Insert: {
          alt_product_id: string
          created_at?: string
          id?: string
          position?: number
          product_id: string
          user_id: string
        }
        Update: {
          alt_product_id?: string
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_alternatives_alt_product_id_fkey"
            columns: ["alt_product_id"]
            isOneToOne: false
            referencedRelation: "ar_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_alternatives_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ar_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          created_at: string
          extra_images: string[]
          id: string
          image_url: string
          label: string
          position: number
          product_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extra_images?: string[]
          id?: string
          image_url: string
          label: string
          position?: number
          product_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          extra_images?: string[]
          id?: string
          image_url?: string
          label?: string
          position?: number
          product_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ar_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ar_slots_used: number
          avatar_url: string | null
          business_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_free_trial_growth: boolean
          notify_on_scan: boolean
          notify_product_tips: boolean
          notify_weekly_summary: boolean
          phone: string | null
          store_name: string | null
          timezone: string | null
          updated_at: string | null
          user_sequence_number: number | null
          website_url: string | null
        }
        Insert: {
          ar_slots_used?: number
          avatar_url?: string | null
          business_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_free_trial_growth?: boolean
          notify_on_scan?: boolean
          notify_product_tips?: boolean
          notify_weekly_summary?: boolean
          phone?: string | null
          store_name?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_sequence_number?: number | null
          website_url?: string | null
        }
        Update: {
          ar_slots_used?: number
          avatar_url?: string | null
          business_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_free_trial_growth?: boolean
          notify_on_scan?: boolean
          notify_product_tips?: boolean
          notify_weekly_summary?: boolean
          phone?: string | null
          store_name?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_sequence_number?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      scan_frames: {
        Row: {
          created_at: string
          frame_number: number
          frame_url: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          frame_number: number
          frame_url: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          frame_number?: number
          frame_url?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_frames_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ar_products"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_products: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          handle: string | null
          id: string
          images: Json
          price_max: number | null
          price_min: number | null
          product_type: string | null
          shopify_product_id: string
          status: string | null
          store_id: string
          synced_at: string
          title: string
          total_inventory: number | null
          tryon_category: string | null
          tryon_enabled: boolean
          updated_at: string
          user_id: string
          variants: Json
          vendor: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          handle?: string | null
          id?: string
          images?: Json
          price_max?: number | null
          price_min?: number | null
          product_type?: string | null
          shopify_product_id: string
          status?: string | null
          store_id: string
          synced_at?: string
          title: string
          total_inventory?: number | null
          tryon_category?: string | null
          tryon_enabled?: boolean
          updated_at?: string
          user_id: string
          variants?: Json
          vendor?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          handle?: string | null
          id?: string
          images?: Json
          price_max?: number | null
          price_min?: number | null
          product_type?: string | null
          shopify_product_id?: string
          status?: string | null
          store_id?: string
          synced_at?: string
          title?: string
          total_inventory?: number | null
          tryon_category?: string | null
          tryon_enabled?: boolean
          updated_at?: string
          user_id?: string
          variants?: Json
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shopify_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "shopify_stores"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_stores: {
        Row: {
          access_token: string
          created_at: string
          currency: string | null
          id: string
          installed_at: string
          last_synced_at: string | null
          scopes: string | null
          shop_domain: string
          shop_email: string | null
          shop_name: string | null
          sync_status: string
          uninstalled_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          currency?: string | null
          id?: string
          installed_at?: string
          last_synced_at?: string | null
          scopes?: string | null
          shop_domain: string
          shop_email?: string | null
          shop_name?: string | null
          sync_status?: string
          uninstalled_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          currency?: string | null
          id?: string
          installed_at?: string
          last_synced_at?: string | null
          scopes?: string | null
          shop_domain?: string
          shop_email?: string | null
          shop_name?: string | null
          sync_status?: string
          uninstalled_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tryon_branding: {
        Row: {
          accent_color: string
          background_type: string
          background_value: string
          button_bg: string
          button_label: string
          button_radius: number
          button_shadow: boolean
          button_text_color: string
          created_at: string
          font: string
          font_family: string
          font_size: number
          header_subtitle: string | null
          header_title: string | null
          logo_url: string | null
          show_platform_watermark: boolean
          store_name: string | null
          updated_at: string
          user_id: string
          viewer_bg: string
          watermark_opacity: number
          watermark_position: string
          watermark_text: string | null
          watermark_url: string | null
        }
        Insert: {
          accent_color?: string
          background_type?: string
          background_value?: string
          button_bg?: string
          button_label?: string
          button_radius?: number
          button_shadow?: boolean
          button_text_color?: string
          created_at?: string
          font?: string
          font_family?: string
          font_size?: number
          header_subtitle?: string | null
          header_title?: string | null
          logo_url?: string | null
          show_platform_watermark?: boolean
          store_name?: string | null
          updated_at?: string
          user_id: string
          viewer_bg?: string
          watermark_opacity?: number
          watermark_position?: string
          watermark_text?: string | null
          watermark_url?: string | null
        }
        Update: {
          accent_color?: string
          background_type?: string
          background_value?: string
          button_bg?: string
          button_label?: string
          button_radius?: number
          button_shadow?: boolean
          button_text_color?: string
          created_at?: string
          font?: string
          font_family?: string
          font_size?: number
          header_subtitle?: string | null
          header_title?: string | null
          logo_url?: string | null
          show_platform_watermark?: boolean
          store_name?: string | null
          updated_at?: string
          user_id?: string
          viewer_bg?: string
          watermark_opacity?: number
          watermark_position?: string
          watermark_text?: string | null
          watermark_url?: string | null
        }
        Relationships: []
      }
      tryon_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metadata: Json
          product_id: string
          session_id: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          product_id: string
          session_id?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          product_id?: string
          session_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryon_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ar_products"
            referencedColumns: ["id"]
          },
        ]
      }
      tryon_feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          liked: boolean
          product_id: string
          session_id: string | null
          vendor_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          liked: boolean
          product_id: string
          session_id?: string | null
          vendor_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          liked?: boolean
          product_id?: string
          session_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryon_feedback_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "ar_products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plans: {
        Row: {
          ar_product_limit: number | null
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
          ar_product_limit?: number | null
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
          ar_product_limit?: number | null
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
      vendor_gradients: {
        Row: {
          angle: number
          created_at: string
          css: string
          direction: string
          id: string
          name: string
          stops: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          angle?: number
          created_at?: string
          css: string
          direction?: string
          id?: string
          name: string
          stops?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          angle?: number
          created_at?: string
          css?: string
          direction?: string
          id?: string
          name?: string
          stops?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_palettes: {
        Row: {
          colors: Json
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          colors?: Json
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          colors?: Json
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_dashboard_stats: { Args: { uid?: string }; Returns: Json }
      increment_ar_views: {
        Args: { p_capability: string; p_device: string; p_product_id: string }
        Returns: undefined
      }
      increment_view_by_token: { Args: { p_token: string }; Returns: undefined }
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
