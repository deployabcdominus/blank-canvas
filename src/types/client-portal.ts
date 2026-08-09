export interface ClientPortalSettings {
  id: string;
  company_id: string;
  portal_subdomain: string;
  portal_name: string;
  custom_theme: {
    primary_color: string;
    logo_url?: string;
    favicon_url?: string;
  };
  is_active: boolean;
  allow_self_registration: boolean;
  require_approval: boolean;
  created_at: string;
}

export interface ClientCollaboration {
  id: string;
  project_id: string;
  client_user_id: string;
  role: 'viewer' | 'collaborator';
  permissions: string[];
  created_at: string;
}
