import {
  LayoutDashboard, Users, FileText, ClipboardList, MapPin,
  Building, UserCog, Settings, Contact, FolderKanban,
  DollarSign, Globe, ServerCog, Activity
} from "lucide-react";
import type { AppRole } from "@/hooks/useUserRole";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  labelKey?: "projects" | "leads" | "workOrders" | "installation" | "installerCompanies";
  path: string;
  roles?: AppRole[];
}

export interface NavGroup {
  groupLabel: string;
  icon: LucideIcon;
  roles?: AppRole[];
  items: NavItem[];
}

// ── Platform items (superadmin only) ──
export const platformItems: NavItem[] = [
  { icon: Globe, label: "Overview", path: "/superadmin?tab=overview" },
  { icon: Building, label: "Companies", path: "/superadmin?tab=companies" },
  { icon: Users, label: "Users", path: "/superadmin?tab=users" },
  { icon: ServerCog, label: "Provisioning", path: "/superadmin?tab=provisioning" },
  { icon: Settings, label: "Settings", path: "/superadmin/settings" },
];

// ── Tenant groups ──

export const principalGroup: NavGroup = {
  groupLabel: "Principal",
  icon: LayoutDashboard,
  items: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  ],
};

export const crmGroup: NavGroup = {
  groupLabel: "CRM & Ventas",
  icon: Users,
  items: [
    { icon: Users, label: "Leads", labelKey: "leads", path: "/leads", roles: ['admin', 'sales', 'member'] },
    { icon: FileText, label: "Propuestas", path: "/proposals", roles: ['admin', 'sales', 'member'] },
    { icon: Contact, label: "Clientes", path: "/clients", roles: ['admin', 'sales', 'operations', 'member'] },
  ],
};

export const productionGroup: NavGroup = {
  groupLabel: "Producción",
  icon: FolderKanban,
  items: [
    { icon: ClipboardList, label: "Work Orders", labelKey: "workOrders", path: "/work-orders", roles: ['admin', 'operations', 'viewer'] },
    { icon: Building, label: "Partners", labelKey: "installerCompanies", path: "/installer-companies", roles: ['admin', 'operations'] },
  ],
};

export const adminGroup: NavGroup = {
  groupLabel: "Administración",
  icon: DollarSign,
  items: [
    { icon: DollarSign, label: "Pagos", path: "/payments", roles: ['admin', 'sales'] },
    { icon: UserCog, label: "Gestión de equipo", path: "/team-management", roles: ['admin'] },
  ],
};

export const utilityItems: NavItem[] = [
  { icon: Activity, label: "Auditoría", path: "/audit-log", roles: ['admin'] },
  { icon: Settings, label: "Configuración", path: "/settings", roles: ['admin'] },
];

// ── All tenant groups (ordered) ──
export const tenantGroups: NavGroup[] = [principalGroup, crmGroup, productionGroup, adminGroup];

// ── Backward compat (keep old exports so nothing breaks) ──
export const mainItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Contact, label: "Clientes", path: "/clients", roles: ['admin', 'sales', 'operations', 'member'] },
  { icon: ClipboardList, label: "Work Orders", labelKey: "workOrders", path: "/work-orders", roles: ['admin', 'operations', 'viewer'] },
  { icon: Users, label: "Leads", labelKey: "leads", path: "/leads", roles: ['admin', 'sales', 'member'] },
  { icon: FileText, label: "Propuestas", path: "/proposals", roles: ['admin', 'sales', 'member'] },
  { icon: DollarSign, label: "Pagos", path: "/payments", roles: ['admin', 'sales'] },
];

export const operationGroup: NavGroup = {
  groupLabel: "Operación",
  icon: ClipboardList,
  items: [
    { icon: ClipboardList, label: "Órdenes de Servicio", labelKey: "workOrders", path: "/work-orders", roles: ['admin', 'operations', 'viewer'] },
    { icon: MapPin, label: "Ejecuciones", labelKey: "installation", path: "/installation", roles: ['admin', 'operations', 'viewer'] },
  ],
};

export const adminItems: NavItem[] = [
  { icon: Building, label: "Subcontratistas", labelKey: "installerCompanies", path: "/installer-companies", roles: ['admin', 'operations'] },
  { icon: Activity, label: "Auditoría", path: "/audit-log", roles: ['admin'] },
  { icon: UserCog, label: "Gestión de equipo", path: "/team-management", roles: ['admin'] },
  { icon: Settings, label: "Configuración", path: "/settings", roles: ['admin'] },
];
