-- Phase 9: Predictive Intelligence and Margin Optimization
-- Tables for cost analysis, profit tracking and predictive price suggestions

-- 1. Project Costs Tracking
CREATE TABLE public.project_costs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE,
    category text NOT NULL, -- 'material', 'labor', 'overhead', 'other'
    item_name text NOT NULL,
    estimated_cost decimal(12,2) DEFAULT 0,
    actual_cost decimal(12,2) DEFAULT 0,
    currency text DEFAULT 'USD',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Profit Analysis (Digital Twin for Profitability)
CREATE TABLE public.profit_analysis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    work_order_id uuid REFERENCES public.work_orders(id) ON DELETE CASCADE UNIQUE,
    total_revenue decimal(12,2) DEFAULT 0,
    total_estimated_costs decimal(12,2) DEFAULT 0,
    total_actual_costs decimal(12,2) DEFAULT 0,
    estimated_margin_percent decimal(5,2),
    actual_margin_percent decimal(5,2),
    profitability_score integer CHECK (profitability_score >= 0 AND profitability_score <= 100),
    efficiency_rating decimal(3,2), -- 1.0 being expected, >1.0 better than expected
    last_analyzed_at timestamptz DEFAULT now()
);

-- 3. Predictive Pricing Models (Historical baselines)
CREATE TABLE public.predictive_price_baselines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    service_type text NOT NULL,
    complexity_level text NOT NULL, -- 'low', 'medium', 'high', 'expert'
    avg_material_cost decimal(12,2),
    avg_labor_hours decimal(8,2),
    recommended_margin decimal(5,2),
    data_points_count integer DEFAULT 0,
    last_updated_at timestamptz DEFAULT now(),
    UNIQUE(company_id, service_type, complexity_level)
);

-- RLS Enablement
ALTER TABLE public.project_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_price_baselines ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_costs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profit_analysis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.predictive_price_baselines TO authenticated;

GRANT ALL ON public.project_costs TO service_role;
GRANT ALL ON public.profit_analysis TO service_role;
GRANT ALL ON public.predictive_price_baselines TO service_role;

-- Policies
CREATE POLICY "Users can manage costs of their own company"
ON public.project_costs
FOR ALL
TO authenticated
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage profit analysis of their own company"
ON public.profit_analysis
FOR ALL
TO authenticated
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage price baselines of their own company"
ON public.predictive_price_baselines
FOR ALL
TO authenticated
USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Indexes for performance
CREATE INDEX idx_project_costs_company ON public.project_costs(company_id);
CREATE INDEX idx_project_costs_work_order ON public.project_costs(work_order_id);
CREATE INDEX idx_profit_analysis_company ON public.profit_analysis(company_id);
CREATE INDEX idx_predictive_baselines_company ON public.predictive_price_baselines(company_id);
