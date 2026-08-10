export interface Region {
  id: string;
  company_id: string;
  name: string;
  code: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
}

export interface RegionSettings {
  id: string;
  region_id: string;
  currency_code: string;
  date_format: string;
  language_code: string;
}

export interface ScalingMetrics {
  total_regions: number;
  active_nodes: number;
  latency_ms: number;
  uptime_percentage: number;
}
