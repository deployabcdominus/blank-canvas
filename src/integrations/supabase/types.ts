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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          client_name: string
          company_id: string
          created_at: string
          id: string
          logo_url: string | null
          notes: string | null
          primary_email: string | null
          primary_phone: string | null
          updated_at: string
        }
        Insert: {
          client_name: string
          company_id: string
          created_at?: string
          id?: string
          logo_url?: string | null
          notes?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          updated_at?: string
        }
        Update: {
          client_name?: string
          company_id?: string
          created_at?: string
          id?: string
          logo_url?: string | null
          notes?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          brand_color: string | null
          created_at: string | null
          enable_network_index: boolean
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          network_base_path: string | null
          plan_id: string | null
          service_types: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand_color?: string | null
          created_at?: string | null
          enable_network_index?: boolean
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          network_base_path?: string | null
          plan_id?: string | null
          service_types?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand_color?: string | null
          created_at?: string | null
          enable_network_index?: boolean
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          network_base_path?: string | null
          plan_id?: string | null
          service_types?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      installations: {
        Row: {
          client: string
          company_id: string | null
          created_at: string | null
          id: string
          location: string | null
          notes: string | null
          photos: Json | null
          project: string
          project_id: string | null
          scheduled_date: string | null
          status: string | null
          team: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          photos?: Json | null
          project: string
          project_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          team?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          photos?: Json | null
          project?: string
          project_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          team?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      installer_companies: {
        Row: {
          company_id: string | null
          contact: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          services: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          services?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          services?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "installer_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string | null
          created_by_user_id: string
          email: string
          expires_at: string
          id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string | null
          created_by_user_id: string
          email: string
          expires_at?: string
          id?: string
          role?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string | null
          created_by_user_id?: string
          email?: string
          expires_at?: string
          id?: string
          role?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to_user_id: string | null
          client_id: string | null
          company: string | null
          company_id: string | null
          created_at: string | null
          created_by_user_id: string | null
          email: string | null
          id: string
          location: string | null
          logo_url: string | null
          name: string
          phone: string | null
          project_id: string | null
          service: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          value: string | null
          website: string | null
        }
        Insert: {
          assigned_to_user_id?: string | null
          client_id?: string | null
          company?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          project_id?: string | null
          service?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          value?: string | null
          website?: string | null
        }
        Update: {
          assigned_to_user_id?: string | null
          client_id?: string | null
          company?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by_user_id?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          project_id?: string | null
          service?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          value?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          id: string
          method: string
          note: string | null
          paid_at: string
          proposal_id: string
          status: string
        }
        Insert: {
          amount: number
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          method?: string
          note?: string | null
          paid_at?: string
          proposal_id: string
          status?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          method?: string
          note?: string | null
          paid_at?: string
          proposal_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          created_at: string | null
          features: Json
          id: string
          name: string
          price: string
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          features?: Json
          id?: string
          name: string
          price: string
        }
        Update: {
          active?: boolean
          created_at?: string | null
          features?: Json
          id?: string
          name?: string
          price?: string
        }
        Relationships: []
      }
      production_orders: {
        Row: {
          client: string
          company_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          materials: Json | null
          owner_user_id: string | null
          progress: number | null
          project: string
          project_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client: string
          company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          materials?: Json | null
          owner_user_id?: string | null
          progress?: number | null
          project: string
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client?: string
          company_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          materials?: Json | null
          owner_user_id?: string | null
          progress?: number | null
          project?: string
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          full_name: string | null
          id: string
          is_active: boolean
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assigned_to_user_id: string | null
          client_id: string
          company_id: string
          created_at: string
          folder_full_path: string | null
          folder_relative_path: string | null
          id: string
          install_address: string
          owner_user_id: string
          project_name: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          client_id: string
          company_id: string
          created_at?: string
          folder_full_path?: string | null
          folder_relative_path?: string | null
          id?: string
          install_address?: string
          owner_user_id: string
          project_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to_user_id?: string | null
          client_id?: string
          company_id?: string
          created_at?: string
          folder_full_path?: string | null
          folder_relative_path?: string | null
          id?: string
          install_address?: string
          owner_user_id?: string
          project_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          approved_at: string | null
          approved_total: number | null
          client: string
          client_id: string | null
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          lead_id: string | null
          owner_user_id: string | null
          project: string
          project_id: string | null
          sent_date: string | null
          sent_method: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          value: number
        }
        Insert: {
          approved_at?: string | null
          approved_total?: number | null
          client: string
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          owner_user_id?: string | null
          project: string
          project_id?: string | null
          sent_date?: string | null
          sent_method?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          value: number
        }
        Update: {
          approved_at?: string | null
          approved_total?: number | null
          client?: string
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          owner_user_id?: string | null
          project?: string
          project_id?: string | null
          sent_date?: string | null
          sent_method?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          access_token: string
          company_id: string | null
          created_at: string | null
          id: string
          plan_id: string
          purchaser_email: string
          status: string
        }
        Insert: {
          access_token?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          plan_id: string
          purchaser_email: string
          status?: string
        }
        Update: {
          access_token?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          plan_id?: string
          purchaser_email?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      team_allocations: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          installation_id: string
          member_id: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          installation_id: string
          member_id: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          installation_id?: string
          member_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_allocations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_allocations_installation_id_fkey"
            columns: ["installation_id"]
            isOneToOne: false
            referencedRelation: "installations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_allocations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          role_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          role_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "installer_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "team_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_roles: {
        Row: {
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_roles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          app_name: string | null
          app_tagline: string | null
          brand_color: string | null
          brand_logo: string | null
          created_at: string | null
          glass_effect: boolean | null
          id: string
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_name?: string | null
          app_tagline?: string | null
          brand_color?: string | null
          brand_logo?: string | null
          created_at?: string | null
          glass_effect?: boolean | null
          id?: string
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_name?: string | null
          app_tagline?: string | null
          brand_color?: string | null
          brand_logo?: string | null
          created_at?: string | null
          glass_effect?: boolean | null
          id?: string
          theme?: string | null
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
      fix_auth_sessions_scopes: { Args: never; Returns: undefined }
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_admin: { Args: { _user_id: string }; Returns: boolean }
      is_member: { Args: { _user_id: string }; Returns: boolean }
      is_operations: { Args: { _user_id: string }; Returns: boolean }
      is_sales: { Args: { _user_id: string }; Returns: boolean }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      is_viewer: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "member"
        | "viewer"
        | "superadmin"
        | "sales"
        | "operations"
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
      app_role: [
        "admin",
        "member",
        "viewer",
        "superadmin",
        "sales",
        "operations",
      ],
    },
  },
} as const
