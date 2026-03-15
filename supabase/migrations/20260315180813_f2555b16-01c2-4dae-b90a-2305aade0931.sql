
-- Production steps per order
CREATE TABLE production_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  production_order_id UUID NOT NULL REFERENCES production_orders(id) ON DELETE CASCADE,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tip TEXT,
  assigned_to UUID,
  assigned_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  sort_order INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE production_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view steps"
ON production_steps FOR SELECT TO authenticated
USING (company_id = get_my_company_id());

CREATE POLICY "Assigned user or admin can update steps"
ON production_steps FOR UPDATE TO authenticated
USING (
  company_id = get_my_company_id()
  AND (assigned_to = auth.uid() OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations'))
);

CREATE POLICY "Admin or operations can insert steps"
ON production_steps FOR INSERT TO authenticated
WITH CHECK (
  company_id = get_my_company_id()
  AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'operations'))
);

CREATE POLICY "Only admins can delete steps"
ON production_steps FOR DELETE TO authenticated
USING (
  company_id = get_my_company_id()
  AND has_role(auth.uid(), 'admin')
);

-- Worker XP and gamification stats
CREATE TABLE worker_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  xp_total INTEGER DEFAULT 0,
  xp_today INTEGER DEFAULT 0,
  tasks_today INTEGER DEFAULT 0,
  tasks_week INTEGER DEFAULT 0,
  tasks_total INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  level INTEGER DEFAULT 1,
  level_title TEXT DEFAULT 'Aprendiz',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, company_id)
);

ALTER TABLE worker_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view stats"
ON worker_stats FOR SELECT TO authenticated
USING (company_id = get_my_company_id());

CREATE POLICY "Users can insert own stats"
ON worker_stats FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND company_id = get_my_company_id());

CREATE POLICY "Users can update own stats"
ON worker_stats FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND company_id = get_my_company_id());

-- Indexes
CREATE INDEX idx_production_steps_order ON production_steps(production_order_id);
CREATE INDEX idx_production_steps_assigned ON production_steps(assigned_to);
CREATE INDEX idx_worker_stats_company ON worker_stats(company_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE production_steps;
ALTER PUBLICATION supabase_realtime ADD TABLE worker_stats;
