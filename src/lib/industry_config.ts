import { Printer, Snowflake, Monitor, Hammer, type LucideIcon } from "lucide-react";

/* ── Industry Definitions ── */
export interface IndustryOption {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
}

export const INDUSTRIES: IndustryOption[] = [
  {
    id: "Señalética y Publicidad",
    icon: Printer,
    label: "Señalética y Publicidad",
    description: "Rótulos, impresión gran formato, instalación publicitaria",
  },
  {
    id: "Climatización y HVAC",
    icon: Snowflake,
    label: "Climatización y HVAC",
    description: "Aire acondicionado, refrigeración, mantenimiento preventivo",
  },
  {
    id: "Servicios IT y Software",
    icon: Monitor,
    label: "Servicios IT y Software",
    description: "Soporte técnico, desarrollo, infraestructura TI",
  },
  {
    id: "Mantenimiento y Reformas",
    icon: Hammer,
    label: "Mantenimiento y Reformas",
    description: "Remodelaciones, reparaciones, contratistas generales",
  },
];

/* ── Dynamic Label Dictionary ── */
export interface IndustryLabels {
  projects: string;
  leads: string;
  workOrders: string;
  installation: string;
  installerCompanies: string;
  operationGroup: string;
  labelProject: string;
  labelUnit: string;
  production: string;
}

const DEFAULT_LABELS: IndustryLabels = {
  projects: "Proyectos",
  leads: "Leads",
  workOrders: "Órdenes de Servicio",
  installation: "Ejecuciones",
  installerCompanies: "Subcontratistas",
  operationGroup: "Operación",
  labelProject: "Proyecto",
  labelUnit: "Medidas",
  production: "Producción",
};

const INDUSTRY_LABELS: Record<string, Partial<IndustryLabels>> = {
  "Señalética y Publicidad": {
    projects: "Rótulos / Proyectos",
    leads: "Oportunidades",
    workOrders: "Órdenes de Producción",
    installation: "Instalación",
    labelProject: "Rótulo / Proyecto",
    labelUnit: "Medidas (L × A)",
    production: "Producción",
  },
  "Climatización y HVAC": {
    projects: "Instalaciones",
    leads: "Solicitudes",
    workOrders: "Órdenes de Servicio",
    installation: "Visita Técnica",
    labelProject: "Instalación",
    labelUnit: "BTU / Capacidad",
    production: "Mantenimiento",
    installerCompanies: "Técnicos",
  },
  "Servicios IT y Software": {
    projects: "Tickets",
    leads: "Solicitudes",
    workOrders: "Órdenes de Soporte",
    installation: "Implementación",
    labelProject: "Ticket",
    labelUnit: "SLA",
    production: "Soporte",
    installerCompanies: "Proveedores",
  },
  "Mantenimiento y Reformas": {
    projects: "Obras",
    leads: "Oportunidades",
    workOrders: "Órdenes de Trabajo",
    installation: "Ejecución en Campo",
    labelProject: "Obra / Proyecto",
    labelUnit: "Medidas (L × A × P)",
    production: "Ejecución",
    installerCompanies: "Subcontratistas",
  },
  // Legacy support
  "Field Service / Instalaciones": {
    projects: "Instalaciones",
    workOrders: "Órdenes de Servicio",
    installation: "Visita Técnica",
    labelProject: "Instalación",
    labelUnit: "BTU / Capacidad",
  },
  "Impresión / Producción": {
    projects: "Rótulos / Proyectos",
    workOrders: "Órdenes de Producción",
    installation: "Instalación",
    labelProject: "Rótulo / Proyecto",
    labelUnit: "Medidas (L × A)",
  },
  "Diseño / Creativos": {
    leads: "Oportunidades",
    workOrders: "Briefings",
    installation: "Entrega",
    installerCompanies: "Colaboradores",
    labelProject: "Proyecto",
    labelUnit: "Especificaciones",
  },
  "Construcción / Contratistas": {
    projects: "Obras",
    leads: "Oportunidades",
    workOrders: "Órdenes de Trabajo",
    installation: "Ejecución en Campo",
    labelProject: "Obra",
    labelUnit: "Medidas (L × A × P)",
  },
  "Eventos / Hospitality": {
    projects: "Eventos",
    leads: "Oportunidades",
    workOrders: "Logística",
    installation: "Montaje",
    labelProject: "Evento",
    labelUnit: "Capacidad / Asistentes",
  },
  "Retail / Tiendas": {
    projects: "Campañas",
    leads: "Oportunidades",
    workOrders: "Pedidos",
    installation: "Distribución",
    labelProject: "Campaña",
    labelUnit: "SKU / Unidades",
  },
};

export function getIndustryLabels(industry: string | null | undefined): IndustryLabels {
  if (!industry || !INDUSTRY_LABELS[industry]) {
    return DEFAULT_LABELS;
  }
  return { ...DEFAULT_LABELS, ...INDUSTRY_LABELS[industry] };
}

/* ── Default Services per Industry ── */
export const DEFAULT_SERVICES_BY_INDUSTRY: Record<string, string[]> = {
  "Señalética y Publicidad": ["Fabricación", "Instalación", "Mantenimiento", "Diseño"],
  "Climatización y HVAC": ["Instalación", "Mantenimiento Preventivo", "Reparación", "Diagnóstico"],
  "Servicios IT y Software": ["Soporte Técnico", "Implementación", "Consultoría", "Desarrollo"],
  "Mantenimiento y Reformas": ["Remodelación", "Reparación", "Mantenimiento", "Obra Civil"],
  // Legacy
  "Field Service / Instalaciones": ["Instalación", "Mantenimiento", "Reparación"],
  "Impresión / Producción": ["Fabricación", "Instalación", "Mantenimiento", "Diseño"],
  "Diseño / Creativos": ["Diseño Gráfico", "Branding", "Producción"],
  "Construcción / Contratistas": ["Obra Civil", "Remodelación", "Mantenimiento"],
  "Eventos / Hospitality": ["Producción", "Montaje", "Decoración"],
  "Retail / Tiendas": ["Venta", "Instalación", "Servicio Postventa"],
};

/* ── Plan Feature Gates ── */
export type PlanType = "start" | "pro" | "elite";

export interface PlanFeatures {
  clientPortal: boolean;
  mockupEngine: boolean;
  blueprintAnnotations: boolean;
  auditLogs: boolean;
  customDictionaries: boolean;
  unlimitedFields: boolean;
  subcontractors: boolean;
  apiAccess: boolean;
  dailyBackup: boolean;
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  start: {
    clientPortal: false,
    mockupEngine: false,
    blueprintAnnotations: false,
    auditLogs: false,
    customDictionaries: false,
    unlimitedFields: false,
    subcontractors: false,
    apiAccess: false,
    dailyBackup: false,
  },
  pro: {
    clientPortal: true,
    mockupEngine: true,
    blueprintAnnotations: false,
    auditLogs: false,
    customDictionaries: true,
    unlimitedFields: false,
    subcontractors: false,
    apiAccess: false,
    dailyBackup: true,
  },
  elite: {
    clientPortal: true,
    mockupEngine: true,
    blueprintAnnotations: true,
    auditLogs: true,
    customDictionaries: true,
    unlimitedFields: true,
    subcontractors: true,
    apiAccess: true,
    dailyBackup: true,
  },
};

export function getPlanFeatures(planId: string | null | undefined): PlanFeatures {
  if (!planId) return PLAN_FEATURES.start;
  const lower = planId.toLowerCase();
  if (lower.includes("elite")) return PLAN_FEATURES.elite;
  if (lower.includes("pro")) return PLAN_FEATURES.pro;
  return PLAN_FEATURES.start;
}
