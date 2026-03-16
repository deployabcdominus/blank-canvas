import { useCompany } from "@/hooks/useCompany";
import { useLanguage } from "@/i18n/LanguageContext";
import { getIndustryLabels, type IndustryLabels } from "@/lib/industry_config";

export type { IndustryLabels };

export function useIndustryLabels(): IndustryLabels {
  const { company } = useCompany();
  const { locale } = useLanguage();
  return getIndustryLabels(company?.industry ?? null, locale);
}

/** Standalone function for use outside React components */
export { getIndustryLabels };
