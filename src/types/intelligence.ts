export interface ProjectCost {
  id: string;
  company_id: string;
  work_order_id?: string;
  category: 'material' | 'labor' | 'overhead' | 'other';
  item_name: string;
  estimated_cost: number;
  actual_cost: number;
  currency: string;
  notes?: string;
  created_at: string;
}

export interface ProfitAnalysis {
  id: string;
  company_id: string;
  work_order_id: string;
  total_revenue: number;
  total_estimated_costs: number;
  total_actual_costs: number;
  estimated_margin_percent: number;
  actual_margin_percent: number;
  profitability_score: number;
  efficiency_rating: number;
  last_analyzed_at: string;
}

export interface PriceBaseline {
  id: string;
  company_id: string;
  service_type: string;
  complexity_level: 'low' | 'medium' | 'high' | 'expert';
  avg_material_cost: number;
  avg_labor_hours: number;
  recommended_margin: number;
  data_points_count: number;
  last_updated_at: string;
}
