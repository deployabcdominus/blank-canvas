import { useCompany } from "@/hooks/useCompany";
import { getIndustryLabels, type IndustryLabels } from "@/lib/industry_config";

export type { IndustryLabels };

export function useIndustryLabels(): IndustryLabels {
  const { company } = useCompany();
  return getIndustryLabels(company?.industry ?? null);
}

/** Standalone function for use outside React components */
export { getIndustryLabels };
