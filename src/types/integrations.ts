export interface ApiKey {
  id: string;
  company_id: string;
  user_id: string;
  key_name: string;
  key_prefix: string;
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface WebhookEndpoint {
  id: string;
  company_id: string;
  url: string;
  description?: string;
  events: string[];
  is_active: boolean;
  created_at: string;
}

export interface Integration {
  id: string;
  company_id: string;
  provider: 'quickbooks' | 'stripe' | 'slack' | 'zapier' | string;
  config: any;
  status: 'connected' | 'disconnected' | 'error';
  last_sync_at?: string;
  created_at: string;
}
