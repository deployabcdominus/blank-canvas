import { useCompany } from "@/hooks/useCompany";
import { getPlanFeatures, type PlanFeatures, type PlanType } from "@/lib/industry_config";

export function usePlanFeatures(): PlanFeatures & { planType: PlanType } {
  const { company } = useCompany();
  const features = getPlanFeatures(company?.plan_id ?? null);
  
  const planId = company?.plan_id?.toLowerCase() ?? "";
  let planType: PlanType = "start";
  if (planId.includes("elite")) planType = "elite";
  else if (planId.includes("pro")) planType = "pro";
  
  return { ...features, planType };
}
