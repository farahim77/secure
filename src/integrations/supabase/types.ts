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
      application_rules: {
        Row: {
          application_name: string
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          rule_type: string
        }
        Insert: {
          application_name: string
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          rule_type: string
        }
        Update: {
          application_name?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          rule_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          content_hash: string
          created_at: string | null
          device_id: string
          hmac_signature: string
          id: string
          metadata: Json | null
          previous_log_hash: string | null
          status: string
          target_application: string | null
          target_domain: string | null
          user_id: string
        }
        Insert: {
          action: string
          content_hash: string
          created_at?: string | null
          device_id: string
          hmac_signature: string
          id?: string
          metadata?: Json | null
          previous_log_hash?: string | null
          status: string
          target_application?: string | null
          target_domain?: string | null
          user_id: string
        }
        Update: {
          action?: string
          content_hash?: string
          created_at?: string | null
          device_id?: string
          hmac_signature?: string
          id?: string
          metadata?: Json | null
          previous_log_hash?: string | null
          status?: string
          target_application?: string | null
          target_domain?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clipboard_entries: {
        Row: {
          content_type: string
          created_at: string | null
          device_id: string
          encrypted_content: string
          encryption_metadata: Json
          expires_at: string | null
          id: string
          shared_with: string[] | null
          user_id: string
        }
        Insert: {
          content_type?: string
          created_at?: string | null
          device_id: string
          encrypted_content: string
          encryption_metadata: Json
          expires_at?: string | null
          id?: string
          shared_with?: string[] | null
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          device_id?: string
          encrypted_content?: string
          encryption_metadata?: Json
          expires_at?: string | null
          id?: string
          shared_with?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clipboard_entries_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clipboard_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          created_at: string | null
          device_name: string
          device_type: string
          id: string
          is_active: boolean | null
          last_active: string | null
          public_key: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_name: string
          device_type: string
          id?: string
          is_active?: boolean | null
          last_active?: string | null
          public_key: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_name?: string
          device_type?: string
          id?: string
          is_active?: boolean | null
          last_active?: string | null
          public_key?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_rules: {
        Row: {
          created_at: string | null
          created_by: string
          domain: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          rule_type: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          domain: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          rule_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          domain?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          rule_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "domain_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "domain_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
        }
        Relationships: []
      }
      security_policies: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          is_enabled: boolean | null
          organization_id: string | null
          policy_name: string
          policy_type: string
          rules: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          is_enabled?: boolean | null
          organization_id?: string | null
          policy_name: string
          policy_type: string
          rules: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          is_enabled?: boolean | null
          organization_id?: string | null
          policy_name?: string
          policy_type?: string
          rules?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_policies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          organization_id: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          organization_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          organization_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
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
