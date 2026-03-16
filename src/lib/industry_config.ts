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

const DEFAULT_LABELS: Record<string, IndustryLabels> = {
  en: {
    projects: "Projects",
    leads: "Leads",
    workOrders: "Work Orders",
    installation: "Field Services",
    installerCompanies: "Partners",
    operationGroup: "Operations",
    labelProject: "Project",
    labelUnit: "Specifications",
    production: "Production",
  },
  es: {
    projects: "Proyectos",
    leads: "Leads",
    workOrders: "Órdenes de Servicio",
    installation: "Ejecuciones",
    installerCompanies: "Subcontratistas",
    operationGroup: "Operación",
    labelProject: "Proyecto",
    labelUnit: "Medidas",
    production: "Producción",
  },
};

const INDUSTRY_LABELS: Record<string, Record<string, Partial<IndustryLabels>>> = {
  "Señalética y Publicidad": {
    es: {
      projects: "Rótulos / Proyectos",
      leads: "Oportunidades",
      workOrders: "Órdenes de Producción",
      installation: "Instalación",
      labelProject: "Rótulo / Proyecto",
      labelUnit: "Medidas (L × A)",
      production: "Producción",
    },
    en: {
      projects: "Signs / Projects",
      leads: "Opportunities",
      workOrders: "Production Orders",
      installation: "Installation",
      labelProject: "Sign / Project",
      labelUnit: "Dimensions (L × W)",
      production: "Production",
    },
  },
  "Climatización y HVAC": {
    es: {
      projects: "Instalaciones",
      leads: "Solicitudes",
      workOrders: "Órdenes de Servicio",
      installation: "Visita Técnica",
      labelProject: "Instalación",
      labelUnit: "BTU / Capacidad",
      production: "Mantenimiento",
      installerCompanies: "Técnicos",
    },
    en: {
      projects: "Installations",
      leads: "Requests",
      workOrders: "Service Orders",
      installation: "Site Visit",
      labelProject: "Installation",
      labelUnit: "BTU / Capacity",
      production: "Maintenance",
      installerCompanies: "Technicians",
    },
  },
  "Servicios IT y Software": {
    es: {
      projects: "Tickets",
      leads: "Solicitudes",
      workOrders: "Órdenes de Soporte",
      installation: "Implementación",
      labelProject: "Ticket",
      labelUnit: "SLA",
      production: "Soporte",
      installerCompanies: "Proveedores",
    },
    en: {
      projects: "Tickets",
      leads: "Requests",
      workOrders: "Support Orders",
      installation: "Deployment",
      labelProject: "Ticket",
      labelUnit: "SLA",
      production: "Support",
      installerCompanies: "Vendors",
    },
  },
  "Mantenimiento y Reformas": {
    es: {
      projects: "Obras",
      leads: "Oportunidades",
      workOrders: "Órdenes de Trabajo",
      installation: "Ejecución en Campo",
      labelProject: "Obra / Proyecto",
      labelUnit: "Medidas (L × A × P)",
      production: "Ejecución",
      installerCompanies: "Subcontratistas",
    },
    en: {
      projects: "Jobs",
      leads: "Opportunities",
      workOrders: "Work Orders",
      installation: "Field Execution",
      labelProject: "Job / Project",
      labelUnit: "Dimensions (L × W × D)",
      production: "Execution",
      installerCompanies: "Subcontractors",
    },
  },
  // Legacy support (fallback to es only)
  "Field Service / Instalaciones": {
    es: { projects: "Instalaciones", workOrders: "Órdenes de Servicio", installation: "Visita Técnica", labelProject: "Instalación", labelUnit: "BTU / Capacidad" },
    en: { projects: "Installations", workOrders: "Service Orders", installation: "Site Visit", labelProject: "Installation", labelUnit: "BTU / Capacity" },
  },
  "Impresión / Producción": {
    es: { projects: "Rótulos / Proyectos", workOrders: "Órdenes de Producción", installation: "Instalación", labelProject: "Rótulo / Proyecto", labelUnit: "Medidas (L × A)" },
    en: { projects: "Signs / Projects", workOrders: "Production Orders", installation: "Installation", labelProject: "Sign / Project", labelUnit: "Dimensions (L × W)" },
  },
  "Diseño / Creativos": {
    es: { leads: "Oportunidades", workOrders: "Briefings", installation: "Entrega", installerCompanies: "Colaboradores", labelProject: "Proyecto", labelUnit: "Especificaciones" },
    en: { leads: "Opportunities", workOrders: "Briefings", installation: "Delivery", installerCompanies: "Collaborators", labelProject: "Project", labelUnit: "Specifications" },
  },
  "Construcción / Contratistas": {
    es: { projects: "Obras", leads: "Oportunidades", workOrders: "Órdenes de Trabajo", installation: "Ejecución en Campo", labelProject: "Obra", labelUnit: "Medidas (L × A × P)" },
    en: { projects: "Jobs", leads: "Opportunities", workOrders: "Work Orders", installation: "Field Execution", labelProject: "Job", labelUnit: "Dimensions (L × W × D)" },
  },
  "Eventos / Hospitality": {
    es: { projects: "Eventos", leads: "Oportunidades", workOrders: "Logística", installation: "Montaje", labelProject: "Evento", labelUnit: "Capacidad / Asistentes" },
    en: { projects: "Events", leads: "Opportunities", workOrders: "Logistics", installation: "Setup", labelProject: "Event", labelUnit: "Capacity / Attendees" },
  },
  "Retail / Tiendas": {
    es: { projects: "Campañas", leads: "Oportunidades", workOrders: "Pedidos", installation: "Distribución", labelProject: "Campaña", labelUnit: "SKU / Unidades" },
    en: { projects: "Campaigns", leads: "Opportunities", workOrders: "Orders", installation: "Distribution", labelProject: "Campaign", labelUnit: "SKU / Units" },
  },
};

export function getIndustryLabels(industry: string | null | undefined, locale: string = "en"): IndustryLabels {
  const lang = locale === "es" ? "es" : "en";
  const defaults = DEFAULT_LABELS[lang] || DEFAULT_LABELS.en;
  if (!industry || !INDUSTRY_LABELS[industry]) {
    return defaults;
  }
  const overrides = INDUSTRY_LABELS[industry][lang] || INDUSTRY_LABELS[industry].es || {};
  return { ...defaults, ...overrides };
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
