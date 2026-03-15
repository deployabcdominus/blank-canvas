import { useCompany } from "@/hooks/useCompany";

export type PlanTier = "start" | "pro" | "elite";

export interface PlanAccess {
  planTier: PlanTier;
  planLabel: string;
  access_portal: boolean;
  access_previews: boolean;
  access_advanced_fields: boolean;
  access_audit: boolean;
  access_subcontractors: boolean;
  access_api: boolean;
  /** Returns the minimum plan needed for a given feature */
  requiredPlan: (feature: keyof Omit<PlanAccess, "planTier" | "planLabel" | "requiredPlan" | "canAccess">) => PlanTier;
  /** Quick check */
  canAccess: (feature: keyof Omit<PlanAccess, "planTier" | "planLabel" | "requiredPlan" | "canAccess">) => boolean;
}

const PLAN_MATRIX: Record<PlanTier, Omit<PlanAccess, "planTier" | "planLabel" | "requiredPlan" | "canAccess">> = {
  start: {
    access_portal: false,
    access_previews: false,
    access_advanced_fields: false,
    access_audit: false,
    access_subcontractors: false,
    access_api: false,
  },
  pro: {
    access_portal: true,
    access_previews: true,
    access_advanced_fields: false,
    access_audit: false,
    access_subcontractors: false,
    access_api: false,
  },
  elite: {
    access_portal: true,
    access_previews: true,
    access_advanced_fields: true,
    access_audit: true,
    access_subcontractors: true,
    access_api: true,
  },
};

const FEATURE_MIN_PLAN: Record<string, PlanTier> = {
  access_portal: "pro",
  access_previews: "pro",
  access_advanced_fields: "elite",
  access_audit: "elite",
  access_subcontractors: "elite",
  access_api: "elite",
};

const PLAN_LABELS: Record<PlanTier, string> = {
  start: "Start",
  pro: "Pro",
  elite: "Elite",
};

function resolveTier(planId: string | null | undefined): PlanTier {
  if (!planId) return "start";
  const lower = planId.toLowerCase();
  if (lower.includes("elite")) return "elite";
  if (lower.includes("pro")) return "pro";
  return "start";
}

export function usePlanAccess(): PlanAccess {
  const { company } = useCompany();
  const planTier = resolveTier(company?.plan_id);
  const matrix = PLAN_MATRIX[planTier];

  return {
    ...matrix,
    planTier,
    planLabel: PLAN_LABELS[planTier],
    requiredPlan: (feature) => FEATURE_MIN_PLAN[feature] as PlanTier ?? "elite",
    canAccess: (feature) => matrix[feature] ?? false,
  };
}
