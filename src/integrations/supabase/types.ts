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
      audit_logs: {
        Row: {
          action: string
          company_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_label: string | null
          entity_type: string
          id: string
          user_id: string
          user_name: string
        }
        Insert: {
          action: string
          company_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type: string
          id?: string
          user_id: string
          user_name?: string
        }
        Update: {
          action?: string
          company_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string
          id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_items: {
        Row: {
          catalog_type: string
          color: string | null
          company_id: string
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          label: string
          sort_order: number | null
          value: string
        }
        Insert: {
          catalog_type: string
          color?: string | null
          company_id: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          label: string
          sort_order?: number | null
          value: string
        }
        Update: {
          catalog_type?: string
          color?: string | null
          company_id?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          label?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          client_name: string
          company_id: string
          contact_name: string | null
          created_at: string
          id: string
          logo_url: string | null
          notes: string | null
          primary_email: string | null
          primary_phone: string | null
          service_type: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          client_name: string
          company_id: string
          contact_name?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          notes?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          service_type?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          client_name?: string
          company_id?: string
          contact_name?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          notes?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          service_type?: string | null
          updated_at?: string
          website?: string | null
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
          billing_type: string | null
          brand_color: string | null
          created_at: string
          enable_network_index: boolean | null
          id: string
          industry: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          network_base_path: string | null
          plan_id: string | null
          service_types: string[] | null
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_type?: string | null
          brand_color?: string | null
          created_at?: string
          enable_network_index?: boolean | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          network_base_path?: string | null
          plan_id?: string | null
          service_types?: string[] | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_type?: string | null
          brand_color?: string | null
          created_at?: string
          enable_network_index?: boolean | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          network_base_path?: string | null
          plan_id?: string | null
          service_types?: string[] | null
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      installations: {
        Row: {
          client: string
          company_id: string | null
          created_at: string
          id: string
          location: string | null
          notes: string | null
          photos: string[] | null
          project: string | null
          project_id: string | null
          scheduled_date: string | null
          status: string | null
          team: string | null
          user_id: string
        }
        Insert: {
          client: string
          company_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          photos?: string[] | null
          project?: string | null
          project_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          team?: string | null
          user_id: string
        }
        Update: {
          client?: string
          company_id?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          photos?: string[] | null
          project?: string | null
          project_id?: string | null
          scheduled_date?: string | null
          status?: string | null
          team?: string | null
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
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          services: string[] | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          services?: string[] | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          contact?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          services?: string[] | null
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
      integrations: {
        Row: {
          access_token: string | null
          company_id: string
          connected_at: string | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          provider: string
          realm_id: string | null
          refresh_token: string | null
          sync_log: Json | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          company_id: string
          connected_at?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          realm_id?: string | null
          refresh_token?: string | null
          sync_log?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          company_id?: string
          connected_at?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          realm_id?: string | null
          refresh_token?: string | null
          sync_log?: Json | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_company_id_fkey"
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
          created_at: string
          created_by_user_id: string | null
          email: string
          expires_at: string
          id: string
          role: string | null
          token: string
          used: boolean | null
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string
          created_by_user_id?: string | null
          email: string
          expires_at?: string
          id?: string
          role?: string | null
          token?: string
          used?: boolean | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string
          created_by_user_id?: string | null
          email?: string
          expires_at?: string
          id?: string
          role?: string | null
          token?: string
          used?: boolean | null
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
          created_at: string
          created_by_user_id: string | null
          deleted_at: string | null
          email: string | null
          id: string
          location: string | null
          logo_url: string | null
          name: string
          notes: string | null
          phone: string | null
          project_id: string | null
          service: string | null
          source: string | null
          status: string | null
          user_id: string
          value: string | null
          website: string | null
        }
        Insert: {
          assigned_to_user_id?: string | null
          client_id?: string | null
          company?: string | null
          company_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          project_id?: string | null
          service?: string | null
          source?: string | null
          status?: string | null
          user_id: string
          value?: string | null
          website?: string | null
        }
        Update: {
          assigned_to_user_id?: string | null
          client_id?: string | null
          company?: string | null
          company_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          location?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          project_id?: string | null
          service?: string | null
          source?: string | null
          status?: string | null
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
      notifications: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      operation_templates: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          product_type: string
          steps: Json
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          product_type: string
          steps?: Json
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          product_type?: string
          steps?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operation_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
          currency: string | null
          id: string
          method: string
          note: string | null
          paid_at: string
          proposal_id: string
          status: string | null
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          id?: string
          method: string
          note?: string | null
          paid_at?: string
          proposal_id: string
          status?: string | null
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string | null
          id?: string
          method?: string
          note?: string | null
          paid_at?: string
          proposal_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
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
          created_at: string
          description: string | null
          features: Json | null
          id: string
          name: string
          price: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          name: string
          price?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          name?: string
          price?: number | null
        }
        Relationships: []
      }
      platform_audit_logs: {
        Row: {
          action_type: string
          actor_id: string
          created_at: string
          details: Json | null
          id: string
          target_name: string | null
        }
        Insert: {
          action_type: string
          actor_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_name?: string | null
        }
        Update: {
          action_type?: string
          actor_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_name?: string | null
        }
        Relationships: []
      }
      production_orders: {
        Row: {
          annotations: Json | null
          assigned_to_user_id: string | null
          backs_material_spec: string | null
          blueprint_url: string | null
          client: string
          client_id: string | null
          company_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          end_date: string | null
          estimated_delivery: string | null
          face_material_spec: string | null
          id: string
          installer_company_id: string | null
          led_mfg_spec: string | null
          materials: Json | null
          notes: string | null
          owner_user_id: string | null
          power_supply_spec: string | null
          priority: string | null
          product_type: string | null
          progress: number | null
          project: string | null
          project_id: string | null
          project_name: string | null
          proposal_id: string | null
          qc_checklist: Json | null
          responsible_staff: Json | null
          returns_material_spec: string | null
          site_address: string | null
          start_date: string | null
          status: string | null
          technical_details: Json | null
          trim_cap_spec: string | null
          user_id: string
          wo_number: string | null
        }
        Insert: {
          annotations?: Json | null
          assigned_to_user_id?: string | null
          backs_material_spec?: string | null
          blueprint_url?: string | null
          client: string
          client_id?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          end_date?: string | null
          estimated_delivery?: string | null
          face_material_spec?: string | null
          id?: string
          installer_company_id?: string | null
          led_mfg_spec?: string | null
          materials?: Json | null
          notes?: string | null
          owner_user_id?: string | null
          power_supply_spec?: string | null
          priority?: string | null
          product_type?: string | null
          progress?: number | null
          project?: string | null
          project_id?: string | null
          project_name?: string | null
          proposal_id?: string | null
          qc_checklist?: Json | null
          responsible_staff?: Json | null
          returns_material_spec?: string | null
          site_address?: string | null
          start_date?: string | null
          status?: string | null
          technical_details?: Json | null
          trim_cap_spec?: string | null
          user_id: string
          wo_number?: string | null
        }
        Update: {
          annotations?: Json | null
          assigned_to_user_id?: string | null
          backs_material_spec?: string | null
          blueprint_url?: string | null
          client?: string
          client_id?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          end_date?: string | null
          estimated_delivery?: string | null
          face_material_spec?: string | null
          id?: string
          installer_company_id?: string | null
          led_mfg_spec?: string | null
          materials?: Json | null
          notes?: string | null
          owner_user_id?: string | null
          power_supply_spec?: string | null
          priority?: string | null
          product_type?: string | null
          progress?: number | null
          project?: string | null
          project_id?: string | null
          project_name?: string | null
          proposal_id?: string | null
          qc_checklist?: Json | null
          responsible_staff?: Json | null
          returns_material_spec?: string | null
          site_address?: string | null
          start_date?: string | null
          status?: string | null
          technical_details?: Json | null
          trim_cap_spec?: string | null
          user_id?: string
          wo_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_installer_company_id_fkey"
            columns: ["installer_company_id"]
            isOneToOne: false
            referencedRelation: "installer_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      production_steps: {
        Row: {
          assigned_name: string | null
          assigned_to: string | null
          company_id: string
          completed_at: string | null
          created_at: string | null
          department: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          name: string
          production_order_id: string
          sort_order: number
          started_at: string | null
          status: string
          tip: string | null
        }
        Insert: {
          assigned_name?: string | null
          assigned_to?: string | null
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name: string
          production_order_id: string
          sort_order?: number
          started_at?: string | null
          status?: string
          tip?: string | null
        }
        Update: {
          assigned_name?: string | null
          assigned_to?: string | null
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          name?: string
          production_order_id?: string
          sort_order?: number
          started_at?: string | null
          status?: string
          tip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_steps_production_order_id_fkey"
            columns: ["production_order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean | null
          language_preference: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          language_preference?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          language_preference?: string | null
          updated_at?: string
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
          client_id: string | null
          company_id: string
          created_at: string
          folder_full_path: string | null
          folder_relative_path: string | null
          id: string
          install_address: string | null
          owner_user_id: string | null
          project_name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          client_id?: string | null
          company_id: string
          created_at?: string
          folder_full_path?: string | null
          folder_relative_path?: string | null
          id?: string
          install_address?: string | null
          owner_user_id?: string | null
          project_name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to_user_id?: string | null
          client_id?: string | null
          company_id?: string
          created_at?: string
          folder_full_path?: string | null
          folder_relative_path?: string | null
          id?: string
          install_address?: string | null
          owner_user_id?: string | null
          project_name?: string
          status?: string | null
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
          approval_token: string | null
          approved_at: string | null
          approved_total: number | null
          client: string
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          lead_id: string | null
          mockup_url: string | null
          owner_user_id: string | null
          project: string | null
          sent_date: string | null
          sent_method: string | null
          signature_data: string | null
          signer_ip: string | null
          signer_name: string | null
          signer_user_agent: string | null
          status: string | null
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          approval_token?: string | null
          approved_at?: string | null
          approved_total?: number | null
          client: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          mockup_url?: string | null
          owner_user_id?: string | null
          project?: string | null
          sent_date?: string | null
          sent_method?: string | null
          signature_data?: string | null
          signer_ip?: string | null
          signer_name?: string | null
          signer_user_agent?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          approval_token?: string | null
          approved_at?: string | null
          approved_total?: number | null
          client?: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string | null
          mockup_url?: string | null
          owner_user_id?: string | null
          project?: string | null
          sent_date?: string | null
          sent_method?: string | null
          signature_data?: string | null
          signer_ip?: string | null
          signer_name?: string | null
          signer_user_agent?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
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
        ]
      }
      purchases: {
        Row: {
          access_token: string
          company_id: string | null
          created_at: string
          id: string
          plan_id: string | null
          purchaser_email: string
          status: string | null
        }
        Insert: {
          access_token?: string
          company_id?: string | null
          created_at?: string
          id?: string
          plan_id?: string | null
          purchaser_email: string
          status?: string | null
        }
        Update: {
          access_token?: string
          company_id?: string | null
          created_at?: string
          id?: string
          plan_id?: string | null
          purchaser_email?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_allocations: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          installation_id: string | null
          member_id: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          installation_id?: string | null
          member_id?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          installation_id?: string | null
          member_id?: string | null
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
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          role_id: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          role_id?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_roles: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          permissions: Json | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
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
      user_settings: {
        Row: {
          brand_color: string | null
          brand_logo: string | null
          created_at: string
          glass_effect: boolean | null
          id: string
          theme: string | null
          user_id: string
        }
        Insert: {
          brand_color?: string | null
          brand_logo?: string | null
          created_at?: string
          glass_effect?: boolean | null
          id?: string
          theme?: string | null
          user_id: string
        }
        Update: {
          brand_color?: string | null
          brand_logo?: string | null
          created_at?: string
          glass_effect?: boolean | null
          id?: string
          theme?: string | null
          user_id?: string
        }
        Relationships: []
      }
      worker_stats: {
        Row: {
          company_id: string
          id: string
          last_activity_date: string | null
          level: number | null
          level_title: string | null
          streak_days: number | null
          tasks_today: number | null
          tasks_total: number | null
          tasks_week: number | null
          updated_at: string | null
          user_id: string
          xp_today: number | null
          xp_total: number | null
        }
        Insert: {
          company_id: string
          id?: string
          last_activity_date?: string | null
          level?: number | null
          level_title?: string | null
          streak_days?: number | null
          tasks_today?: number | null
          tasks_total?: number | null
          tasks_week?: number | null
          updated_at?: string | null
          user_id: string
          xp_today?: number | null
          xp_total?: number | null
        }
        Update: {
          company_id?: string
          id?: string
          last_activity_date?: string | null
          level?: number | null
          level_title?: string | null
          streak_days?: number | null
          tasks_today?: number | null
          tasks_total?: number | null
          tasks_week?: number | null
          updated_at?: string | null
          user_id?: string
          xp_today?: number | null
          xp_total?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_company: {
        Args: {
          p_brand_color: string
          p_industry: string
          p_logo_url: string
          p_name: string
          p_plan_id?: string
          p_user_id: string
        }
        Returns: {
          billing_type: string | null
          brand_color: string | null
          created_at: string
          enable_network_index: boolean | null
          id: string
          industry: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          network_base_path: string | null
          plan_id: string | null
          service_types: string[] | null
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "companies"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_invitation_by_token: {
        Args: { p_token: string }
        Returns: {
          accepted_at: string
          company_id: string
          email: string
          expires_at: string
          id: string
          role: string
          token: string
        }[]
      }
      get_my_company_id: { Args: never; Returns: string }
      get_my_company_id_safe: { Args: never; Returns: string }
      get_platform_health: { Args: never; Returns: Json }
      get_weekly_report: { Args: { p_company_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      manter_bd_ativo: { Args: never; Returns: undefined }
      recalc_project_progress: {
        Args: { p_project_id: string }
        Returns: undefined
      }
      validate_purchase_by_token: {
        Args: { p_access_token: string }
        Returns: {
          id: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "superadmin"
        | "admin"
        | "sales"
        | "operations"
        | "member"
        | "viewer"
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
        "superadmin",
        "admin",
        "sales",
        "operations",
        "member",
        "viewer",
      ],
    },
  },
} as const
