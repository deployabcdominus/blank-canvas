import { useCompany } from '@/hooks/useCompany';

const DEFAULT_SERVICES = ['General'];

export function useServiceTypes(): string[] {
  const { company } = useCompany();

  if (!company) return DEFAULT_SERVICES;

  const raw = (company as any).service_types;
  if (Array.isArray(raw) && raw.length > 0) return raw;

  return DEFAULT_SERVICES;
}
