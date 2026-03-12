import { useCompany } from "@/hooks/useCompany";

export interface IndustryLabels {
  projects: string;
  leads: string;
  workOrders: string;
  installation: string;
  installerCompanies: string;
  operationGroup: string;
}

const DEFAULT_LABELS: IndustryLabels = {
  projects: "Proyectos",
  leads: "Leads",
  workOrders: "Órdenes de Servicio",
  installation: "Ejecuciones",
  installerCompanies: "Subcontratistas",
  operationGroup: "Operación",
};

const INDUSTRY_LABELS: Record<string, Partial<IndustryLabels>> = {
  "Eventos / Hospitality": {
    projects: "Eventos",
    leads: "Oportunidades",
    workOrders: "Logística",
    installation: "Montaje",
  },
  "Construcción / Contratistas": {
    projects: "Obras",
    leads: "Oportunidades",
    workOrders: "Órdenes de Trabajo",
    installation: "Ejecución en Campo",
  },
  "Diseño / Creativos": {
    leads: "Oportunidades",
    workOrders: "Briefings",
    installation: "Entrega",
    installerCompanies: "Colaboradores",
  },
  "Retail / Tiendas": {
    projects: "Campañas",
    leads: "Oportunidades",
    workOrders: "Pedidos",
    installation: "Distribución",
  },
};

export function useIndustryLabels(): IndustryLabels {
  const { company } = useCompany();
  const industry = company?.industry ?? null;

  if (!industry || !INDUSTRY_LABELS[industry]) {
    return DEFAULT_LABELS;
  }

  return { ...DEFAULT_LABELS, ...INDUSTRY_LABELS[industry] };
}

/** Standalone function for use outside React components */
export function getIndustryLabels(industry: string | null | undefined): IndustryLabels {
  if (!industry || !INDUSTRY_LABELS[industry]) {
    return DEFAULT_LABELS;
  }
  return { ...DEFAULT_LABELS, ...INDUSTRY_LABELS[industry] };
}
