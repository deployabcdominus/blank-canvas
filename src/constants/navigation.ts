import {
  LayoutDashboard, Users, FileText, ClipboardList, MapPin,
  Building, UserCog, Settings, Contact, FolderKanban,
  DollarSign, Globe, ServerCog, Activity, BarChart3, Package
} from "lucide-react";
import type { AppRole } from "@/hooks/useUserRole";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  labelKey?: "projects" | "leads" | "workOrders" | "installation" | "installerCompanies" | "inventory";
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
  groupLabel: "CRM & Sales",
  icon: Users,
  items: [
    { icon: Users, label: "Leads", labelKey: "leads", path: "/leads", roles: ['admin', 'sales', 'member'] },
    { icon: FileText, label: "Proposals", path: "/proposals", roles: ['admin', 'sales', 'member'] },
    { icon: Contact, label: "Accounts", path: "/clients", roles: ['admin', 'sales', 'operations', 'member'] },
  ],
};

export const productionGroup: NavGroup = {
  groupLabel: "Production",
  icon: FolderKanban,
  items: [
    { icon: ClipboardList, label: "Work Orders", labelKey: "workOrders", path: "/work-orders", roles: ['admin', 'operations', 'viewer'] },
    { icon: Building, label: "Partners", labelKey: "installerCompanies", path: "/installer-companies", roles: ['admin', 'operations'] },
    { icon: Package, label: "Inventory", path: "/inventory", roles: ["admin", "operations"] },
  ],
};

export const adminGroup: NavGroup = {
  groupLabel: "Administration",
  icon: DollarSign,
  items: [
    { icon: DollarSign, label: "Payments", path: "/payments", roles: ['admin', 'sales'] },
    { icon: BarChart3, label: "Reports", path: "/reports", roles: ['admin'] },
    { icon: Activity, label: "Audit Logs", path: "/audit-log", roles: ['admin'] },
    { icon: UserCog, label: "Team Management", path: "/team-management", roles: ['admin'] },
    { icon: Activity, label: "Pilot", path: "/pilot", roles: ['superadmin'] },
  ],
};

export const utilityItems: NavItem[] = [
  { icon: Settings, label: "Settings", path: "/settings", roles: ['admin'] },
];

// ── All tenant groups (ordered) ──
export const tenantGroups: NavGroup[] = [principalGroup, crmGroup, productionGroup, adminGroup];

