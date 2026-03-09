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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          created_at: string | null
          id: string
          industry: string | null
          name: string
          plan: Database["public"]["Enums"]["plan_type"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          plan?: Database["public"]["Enums"]["plan_type"] | null
        }
        Relationships: []
      }
      compliance_rules: {
        Row: {
          band_green_min: number | null
          band_platinum_min: number | null
          band_yellow_min: number | null
          company_size_max: number | null
          company_size_min: number | null
          country: Database["public"]["Enums"]["country_code"]
          effective_from: string
          effective_to: string | null
          id: string
          industry_sector: string | null
          notes: string | null
          program_name: string
          source_url: string | null
          target_percentage: number
        }
        Insert: {
          band_green_min?: number | null
          band_platinum_min?: number | null
          band_yellow_min?: number | null
          company_size_max?: number | null
          company_size_min?: number | null
          country: Database["public"]["Enums"]["country_code"]
          effective_from: string
          effective_to?: string | null
          id?: string
          industry_sector?: string | null
          notes?: string | null
          program_name: string
          source_url?: string | null
          target_percentage: number
        }
        Update: {
          band_green_min?: number | null
          band_platinum_min?: number | null
          band_yellow_min?: number | null
          company_size_max?: number | null
          company_size_min?: number | null
          country?: Database["public"]["Enums"]["country_code"]
          effective_from?: string
          effective_to?: string | null
          id?: string
          industry_sector?: string | null
          notes?: string | null
          program_name?: string
          source_url?: string | null
          target_percentage?: number
        }
        Relationships: []
      }
      compliance_scores: {
        Row: {
          band: Database["public"]["Enums"]["compliance_band"] | null
          calculated_at: string | null
          entity_id: string
          id: string
          national_count: number
          ratio: number
          rule_id: string | null
          status: Database["public"]["Enums"]["compliance_status"] | null
          total_count: number
        }
        Insert: {
          band?: Database["public"]["Enums"]["compliance_band"] | null
          calculated_at?: string | null
          entity_id: string
          id?: string
          national_count: number
          ratio?: number
          rule_id?: string | null
          status?: Database["public"]["Enums"]["compliance_status"] | null
          total_count: number
        }
        Update: {
          band?: Database["public"]["Enums"]["compliance_band"] | null
          calculated_at?: string | null
          entity_id?: string
          id?: string
          national_count?: number
          ratio?: number
          rule_id?: string | null
          status?: Database["public"]["Enums"]["compliance_status"] | null
          total_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "compliance_scores_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_scores_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          contract_type: Database["public"]["Enums"]["contract_type"] | null
          counts_toward_quota: boolean | null
          created_at: string | null
          department: string | null
          end_date: string | null
          entity_id: string
          full_name: string
          id: string
          is_national: boolean | null
          job_title: string | null
          nationality: string
          salary_band: string | null
          start_date: string | null
        }
        Insert: {
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          counts_toward_quota?: boolean | null
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          entity_id: string
          full_name: string
          id?: string
          is_national?: boolean | null
          job_title?: string | null
          nationality: string
          salary_band?: string | null
          start_date?: string | null
        }
        Update: {
          contract_type?: Database["public"]["Enums"]["contract_type"] | null
          counts_toward_quota?: boolean | null
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          entity_id?: string
          full_name?: string
          id?: string
          is_national?: boolean | null
          job_title?: string | null
          nationality?: string
          salary_band?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          company_id: string
          country: Database["public"]["Enums"]["country_code"]
          created_at: string | null
          employee_count_band: string | null
          id: string
          industry_sector: string | null
          legal_type: string | null
          name: string
          registration_number: string | null
        }
        Insert: {
          company_id: string
          country: Database["public"]["Enums"]["country_code"]
          created_at?: string | null
          employee_count_band?: string | null
          id?: string
          industry_sector?: string | null
          legal_type?: string | null
          name: string
          registration_number?: string | null
        }
        Update: {
          company_id?: string
          country?: Database["public"]["Enums"]["country_code"]
          created_at?: string | null
          employee_count_band?: string | null
          id?: string
          industry_sector?: string | null
          legal_type?: string | null
          name?: string
          registration_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      forecasts: {
        Row: {
          confidence: Database["public"]["Enums"]["confidence_level"] | null
          entity_id: string
          generated_at: string | null
          horizon_days: number
          id: string
          projected_ratio_30d: number | null
          projected_ratio_60d: number | null
          projected_ratio_90d: number | null
          risk_date: string | null
          scenario_inputs: Json | null
        }
        Insert: {
          confidence?: Database["public"]["Enums"]["confidence_level"] | null
          entity_id: string
          generated_at?: string | null
          horizon_days?: number
          id?: string
          projected_ratio_30d?: number | null
          projected_ratio_60d?: number | null
          projected_ratio_90d?: number | null
          risk_date?: string | null
          scenario_inputs?: Json | null
        }
        Update: {
          confidence?: Database["public"]["Enums"]["confidence_level"] | null
          entity_id?: string
          generated_at?: string | null
          horizon_days?: number
          id?: string
          projected_ratio_30d?: number | null
          projected_ratio_60d?: number | null
          projected_ratio_90d?: number | null
          risk_date?: string | null
          scenario_inputs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "forecasts_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string | null
          id: string
          read: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string | null
          id?: string
          read?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          action_type: string | null
          compliance_gain: number | null
          created_at: string | null
          description: string | null
          effort_level: Database["public"]["Enums"]["effort_level"] | null
          entity_id: string
          id: string
          impact_score: number | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          status: Database["public"]["Enums"]["recommendation_status"] | null
          title: string
        }
        Insert: {
          action_type?: string | null
          compliance_gain?: number | null
          created_at?: string | null
          description?: string | null
          effort_level?: Database["public"]["Enums"]["effort_level"] | null
          entity_id: string
          id?: string
          impact_score?: number | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          status?: Database["public"]["Enums"]["recommendation_status"] | null
          title: string
        }
        Update: {
          action_type?: string | null
          compliance_gain?: number | null
          created_at?: string | null
          description?: string | null
          effort_level?: Database["public"]["Enums"]["effort_level"] | null
          entity_id?: string
          id?: string
          impact_score?: number | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          status?: Database["public"]["Enums"]["recommendation_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_changes: {
        Row: {
          affects_sectors: string[] | null
          change_type: Database["public"]["Enums"]["change_type"] | null
          country: Database["public"]["Enums"]["country_code"]
          detected_at: string | null
          effective_date: string | null
          headline: string
          id: string
          impact_level: Database["public"]["Enums"]["impact_level"] | null
          program: string
          source_url: string | null
          summary: string | null
        }
        Insert: {
          affects_sectors?: string[] | null
          change_type?: Database["public"]["Enums"]["change_type"] | null
          country: Database["public"]["Enums"]["country_code"]
          detected_at?: string | null
          effective_date?: string | null
          headline: string
          id?: string
          impact_level?: Database["public"]["Enums"]["impact_level"] | null
          program: string
          source_url?: string | null
          summary?: string | null
        }
        Update: {
          affects_sectors?: string[] | null
          change_type?: Database["public"]["Enums"]["change_type"] | null
          country?: Database["public"]["Enums"]["country_code"]
          detected_at?: string | null
          effective_date?: string | null
          headline?: string
          id?: string
          impact_level?: Database["public"]["Enums"]["impact_level"] | null
          program?: string
          source_url?: string | null
          summary?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          company_id: string | null
          created_at: string | null
          full_name: string | null
          id: string
          language_pref: string | null
          notification_email: boolean | null
          notification_in_app: boolean | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          language_pref?: string | null
          notification_email?: boolean | null
          notification_in_app?: boolean | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          language_pref?: string | null
          notification_email?: boolean | null
          notification_in_app?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hr_director" | "hr_manager" | "cfo" | "viewer"
      change_type:
        | "TARGET_INCREASE"
        | "NEW_REGULATION"
        | "FINE_CHANGE"
        | "SECTOR_RECLASSIFICATION"
      compliance_band:
        | "PLATINUM"
        | "GREEN_HIGH"
        | "GREEN_LOW"
        | "GREEN"
        | "YELLOW"
        | "RED"
      compliance_status: "COMPLIANT" | "AT_RISK" | "NON_COMPLIANT" | "UNKNOWN"
      confidence_level: "HIGH" | "MEDIUM" | "LOW"
      contract_type: "full_time" | "part_time" | "contract" | "intern"
      country_code: "SA" | "AE" | "QA" | "OM"
      effort_level: "LOW" | "MEDIUM" | "HIGH"
      impact_level: "HIGH" | "MEDIUM" | "LOW"
      notification_type:
        | "COMPLIANCE_ALERT"
        | "REGULATORY_CHANGE"
        | "FORECAST_RISK"
        | "SYSTEM"
      plan_type: "starter" | "growth" | "scale" | "enterprise"
      priority_level: "CRITICAL" | "IMPORTANT" | "OPTIONAL"
      recommendation_status: "OPEN" | "IN_PROGRESS" | "DONE" | "DISMISSED"
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
      app_role: ["admin", "hr_director", "hr_manager", "cfo", "viewer"],
      change_type: [
        "TARGET_INCREASE",
        "NEW_REGULATION",
        "FINE_CHANGE",
        "SECTOR_RECLASSIFICATION",
      ],
      compliance_band: [
        "PLATINUM",
        "GREEN_HIGH",
        "GREEN_LOW",
        "GREEN",
        "YELLOW",
        "RED",
      ],
      compliance_status: ["COMPLIANT", "AT_RISK", "NON_COMPLIANT", "UNKNOWN"],
      confidence_level: ["HIGH", "MEDIUM", "LOW"],
      contract_type: ["full_time", "part_time", "contract", "intern"],
      country_code: ["SA", "AE", "QA", "OM"],
      effort_level: ["LOW", "MEDIUM", "HIGH"],
      impact_level: ["HIGH", "MEDIUM", "LOW"],
      notification_type: [
        "COMPLIANCE_ALERT",
        "REGULATORY_CHANGE",
        "FORECAST_RISK",
        "SYSTEM",
      ],
      plan_type: ["starter", "growth", "scale", "enterprise"],
      priority_level: ["CRITICAL", "IMPORTANT", "OPTIONAL"],
      recommendation_status: ["OPEN", "IN_PROGRESS", "DONE", "DISMISSED"],
    },
  },
} as const
