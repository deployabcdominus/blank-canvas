import {
  LayoutDashboard, Users, FileText, ClipboardList, MapPin,
  Building, UserCog, Settings, Contact, FolderKanban,
  DollarSign, Globe, ServerCog
} from "lucide-react";
import type { AppRole } from "@/hooks/useUserRole";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
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
  { icon: Settings, label: "Settings", path: "/settings" },
];

// ── Tenant items ──
export const mainItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Contact, label: "Clientes", path: "/clients" },
  { icon: FolderKanban, label: "Proyectos", path: "/projects" },
  { icon: Users, label: "Leads", path: "/leads" },
  { icon: FileText, label: "Propuestas", path: "/proposals" },
  { icon: DollarSign, label: "Pagos", path: "/payments" },
];

export const operationGroup: NavGroup = {
  groupLabel: "Operación",
  icon: ClipboardList,
  items: [
    { icon: ClipboardList, label: "Órdenes de Trabajo", path: "/work-orders" },
    { icon: MapPin, label: "Instalación", path: "/installation" },
  ],
};

export const adminItems: NavItem[] = [
  { icon: Building, label: "Empresas Instaladoras", path: "/installer-companies", roles: ['admin'] },
  { icon: UserCog, label: "Gestión de equipo", path: "/team-management", roles: ['admin'] },
  { icon: Settings, label: "Configuración", path: "/settings", roles: ['admin'] },
];
