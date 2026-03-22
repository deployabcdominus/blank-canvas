import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

interface EntityLimit {
  current: number;
  max: number;
  isAtLimit: boolean;
  isNearLimit: boolean;
  isUnlimited: boolean;
}

interface PlanLimits {
  planName: string;
  work_orders: EntityLimit;
  leads: EntityLimit;
  users: EntityLimit;
  proposals: EntityLimit;
  loading: boolean;
}

export function usePlanLimits(): PlanLimits {
  const { companyId } = useUserRole();
  const [limits, setLimits] = useState<PlanLimits>({
    planName: "",
    work_orders: { current: 0, max: 0, isAtLimit: false, isNearLimit: false, isUnlimited: false },
    leads: { current: 0, max: 0, isAtLimit: false, isNearLimit: false, isUnlimited: false },
    users: { current: 0, max: 0, isAtLimit: false, isNearLimit: false, isUnlimited: false },
    proposals: { current: 0, max: 0, isAtLimit: false, isNearLimit: false, isUnlimited: false },
    loading: true,
  });

  useEffect(() => {
    if (!companyId) return;
    const load = async () => {
      const { data: company } = await supabase
        .from("companies")
        .select("plan_id")
        .eq("id", companyId)
        .single();

      const planName = company?.plan_id || "Inicial";

      const PLAN_ID_MAP: Record<string, string> = {
        "start": "Inicial",
        "pro": "Profesional",
        "elite": "Empresarial",
        "Inicial": "Inicial",
        "Profesional": "Profesional",
        "Empresarial": "Empresarial",
      };

      const resolvedPlanName = PLAN_ID_MAP[planName] || "Inicial";

      const { data: plan } = await supabase
        .from("plans")
        .select("features, name")
        .eq("name", resolvedPlanName)
        .single();

      const features = (plan?.features as any) || {};

      const [woRes, leadsRes, usersRes, propsRes] = await Promise.all([
        supabase.from("production_orders").select("id", { count: "exact" })
          .eq("company_id", companyId)
          .not("status", "in", '("Instalado","Cancelado")'),
        supabase.from("leads").select("id", { count: "exact" })
          .eq("company_id", companyId)
          .not("status", "in", '("Convertido","Perdido")')
          .is("deleted_at", null),
        supabase.from("profiles").select("id", { count: "exact" })
          .eq("company_id", companyId)
          .eq("is_active", true),
        supabase.from("proposals").select("id", { count: "exact" })
          .eq("company_id", companyId)
          .neq("status", "Rechazada"),
      ]);

      const makeLimit = (current: number, max: number): EntityLimit => {
        const isUnlimited = max === -1;
        return {
          current,
          max,
          isUnlimited,
          isAtLimit: !isUnlimited && current >= max,
          isNearLimit: !isUnlimited && current >= max * 0.8,
        };
      };

      setLimits({
        planName: plan?.name || planName,
        work_orders: makeLimit(woRes.count || 0, features.max_work_orders ?? 10),
        leads: makeLimit(leadsRes.count || 0, features.max_leads ?? 20),
        users: makeLimit(usersRes.count || 0, features.max_users ?? 3),
        proposals: makeLimit(propsRes.count || 0, features.max_proposals ?? 20),
        loading: false,
      });
    };
    load();
  }, [companyId]);

  return limits;
}
