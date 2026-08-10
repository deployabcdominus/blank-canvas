import { useState, useEffect, useMemo, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LeadsService } from "@/services/leads.service";
import { ProposalsService } from "@/services/proposals.service";
import { WorkOrdersService } from "@/services/work-orders.service";
import { ClientsService } from "@/services/clients.service";
import { mapLeadRow, mapProposalRow, mapWorkOrderRow, mapClientRow } from "@/lib/mappings";
import type { IndustryLabels } from "@/hooks/useIndustryLabels";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIndustryLabels } from "@/hooks/useIndustryLabels";
import { useLanguage } from "@/i18n/LanguageContext";
import { useCompany } from "@/hooks/useCompany";
import { FIXED_BRANDING } from "@/contexts/SettingsContext";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Shield, Settings, ChevronRight, Recycle } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  platformItems, tenantGroups, utilityItems,
  type NavItem, type NavGroup,
} from "@/constants/navigation";

export const Sidebar = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { role, isSuperadmin, isAdmin, loading: roleLoading } = useUserRole();
  const { avatarUrl } = useAvatarUrl();
  const { fullName, email, initials } = useUserProfile();
  const industryLabels = useIndustryLabels();
  const { t } = useLanguage();
  const { company } = useCompany();
  const companyId = company?.id || null;

  const localizedGroups = useMemo(() => {
    let groups = tenantGroups.map((g, i) => ({
      ...g,
      groupLabel: i === 0 ? t.nav.principal
        : i === 1 ? t.nav.crmSales
        : i === 2 ? t.nav.production
        : t.nav.administration,
    }));
    
    if (isAdmin && groups[3]) {
      const recycleItem = {
        path: "/leads/recycle-bin",
        label: t.leads.recycleBin,
        icon: Recycle,
        roles: ["admin", "superadmin"],
      } as any;
      groups = groups.map((g, idx) => idx === 3 ? { ...g, items: [...g.items, recycleItem] } : g);
    }
    return groups;
  }, [t.nav, isAdmin]);

  if (roleLoading) return null;

  return createPortal(
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 bottom-0 z-[100] hidden md:flex flex-col border-r border-white/[0.04] bg-zinc-950/80 backdrop-blur-3xl w-[72px] lg:w-[280px] p-4 lg:p-6 shadow-2xl transition-all duration-300 isolate h-[100dvh]"
      role="navigation"
      aria-label="Menu lateral principal"
    >
      {/* Logo Section */}
      <div className="mb-8 lg:mb-10 flex-shrink-0 flex justify-center lg:justify-start">
        <div className="hidden lg:block w-full">
          <BrandLogo size={36} showText variant="iconWithText" textClassName="text-xl font-bold tracking-tight text-white" />
        </div>
        <div className="lg:hidden">
          <BrandLogo size={32} variant="iconOnly" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-none space-y-6 lg:space-y-8 pr-1">
      {isSuperadmin ? (
        <SidebarPlatformNav
          items={platformItems}
          location={location}
          industryLabels={industryLabels}
          platformLabel={t.nav.platform}
          companyId={companyId}
          t={t}
        />
      ) : (
        <SidebarTenantNav
          groups={localizedGroups}
          utilityItems={utilityItems}
          location={location}
          role={role}
          industryLabels={industryLabels}
          isAdmin={isAdmin}
          adjustmentsLabel={t.nav.adjustments}
          companyId={companyId}
          t={t}
        />
      )}
      </div>

      {/* Footer Section: Plan & User */}
      <div className="mt-auto space-y-6">
        {/* Plan Upgrade Card (Ref Image Reference) */}
        {!isSuperadmin && isAdmin && (
          <div className="hidden lg:block p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
              <Shield size={40} className="text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Pro Plan</span>
              </div>
              <p className="text-[12px] text-zinc-400 mb-3 leading-relaxed">
                Unlock full automation and unlimited leads.
              </p>
              <button 
                onClick={() => navigate("/settings?tab=billing")}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-white text-[12px] font-semibold transition-colors border border-white/[0.05]"
              >
                Manage Plan
              </button>
            </div>
          </div>
        )}

        <SidebarUserFooter
          avatarUrl={avatarUrl}
          fullName={fullName}
          email={email}
          initials={initials}
          isSuperadmin={isSuperadmin}
          isAdmin={isAdmin}
          onLogout={async () => { await signOut(); navigate("/login"); }}
          onNavigate={navigate}
          profileLabel={t.nav.profile}
          settingsLabel={t.nav.settings}
          logoutLabel={t.nav.logout}
        />
      </div>
    </motion.aside>,
    document.body
  );
});

Sidebar.displayName = "Sidebar";


/* ─── Helpers ─── */

const isActivePath = (location: { pathname: string; search: string }, path: string) =>
  location.pathname + location.search === path || location.pathname === path;

const getLabel = (item: NavItem, industryLabels: IndustryLabels, t: any) => {
  if (item.labelKey && industryLabels[item.labelKey]) return industryLabels[item.labelKey];
  
  // Localized fallbacks for hardcoded labels in constants/navigation.ts
  const navKeys: Record<string, string> = {
    "Dashboard": t.nav.dashboard,
    "Leads": t.nav.leads,
    "Proposals": t.nav.proposals,
    "Accounts": t.nav.accounts,
    "Work Orders": t.nav.workOrders,
    "Partners": t.nav.subcontractors,
    "Inventory": t.nav.inventory,
    "Payments": t.nav.payments,
    "Reports": t.nav.reports || t.landing.reports.title,
    "Audit Logs": t.nav.auditLog,
    "Team Management": t.nav.teamManagement,
    "Pilot": "Pilot",
    "Overview": t.nav.platform || "Overview",
    "Companies": t.nav.accounts || "Companies",
    "Users": t.nav.teamManagement || "Users",
    "Provisioning": "Provisioning",
    "Settings": t.nav.settings,
  };

  return navKeys[item.label] || item.label;
};

const canSee = (item: NavItem, role: string | null) => {
  if (!item.roles) return true;
  if (!role) return false;
  return item.roles.includes(role as any);
};

/* ─── Nav Item ─── */

const SidebarNavItem = memo(({ item, location, industryLabels, companyId, t }: {
  item: NavItem;
  location: { pathname: string; search: string };
  industryLabels: IndustryLabels;
  companyId: string | null;
  t: any;
}) => {
  const queryClient = useQueryClient();

  const handleMouseEnter = useCallback(() => {
    if (!companyId) return;

    // Smart prefetching based on route
    if (item.path === "/leads") {
      queryClient.prefetchQuery({
        queryKey: ["leads", companyId],
        queryFn: async () => {
          const { data } = await LeadsService.getAll(companyId);
          return (data || []).map(mapLeadRow);
        },
      });
    } else if (item.path === "/proposals") {
      queryClient.prefetchQuery({
        queryKey: ["proposals", companyId],
        queryFn: async () => {
          const res = await ProposalsService.getAll(companyId);
          const orderProposalIds = new Set<string>((res.orders || []).map(o => o.proposal_id).filter((id): id is string => !!id));
          return {
            proposals: (res.proposals || []).map(p => mapProposalRow(p, orderProposalIds)),
            orders: res.orders || []
          };
        },
      });
    } else if (item.path === "/work-orders") {
      queryClient.prefetchQuery({
        queryKey: ["work-orders", companyId],
        queryFn: async () => {
          const { data } = await WorkOrdersService.getAll(companyId);
          return (data || []).map(mapWorkOrderRow);
        },
      });
    } else if (item.path === "/clients") {
      queryClient.prefetchQuery({
        queryKey: ["clients", companyId],
        queryFn: async () => {
          const { data } = await ClientsService.getAll(companyId);
          return (data || []).map(mapClientRow);
        },
      });
    }
  }, [item.path, companyId, queryClient]);

  const active = isActivePath(location, item.path);
  const label = getLabel(item, industryLabels, t);
  return (
    <NavLink
      to={item.path}
      onMouseEnter={handleMouseEnter}
      className={({ isActive }) => `group relative flex items-center transition-all duration-300 justify-center lg:justify-start rounded-2xl lg:rounded-xl p-2.5 lg:px-4 lg:py-3 ${
        isActive
          ? "bg-primary/10 border border-primary/20 text-white font-semibold shadow-[0_0_20px_rgba(139,92,246,0.15)]"
          : "border border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]"
      }`}
      title={label}
      aria-current={active ? "page" : undefined}
    >
      <item.icon
        className={`flex-shrink-0 transition-colors duration-300 ${active ? "text-primary" : "text-zinc-500 group-hover:text-zinc-300"}`}
        size={20}
        strokeWidth={active ? 2 : 1.5}
        aria-hidden="true"
      />
      <span className="hidden lg:block text-[14px] leading-tight ml-3.5 truncate">
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="sidebar-active-dot"
          className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary hidden lg:block"
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        />
      )}
    </NavLink>
  );
});

SidebarNavItem.displayName = "SidebarNavItem";


/* ─── Collapsible Group ─── */

const SidebarCollapsibleGroup = memo(({ group, isOpen, onToggle, location, role, industryLabels, companyId, t }: {
  group: NavGroup; isOpen: boolean; onToggle: () => void;
  location: { pathname: string; search: string };
  role: string | null; industryLabels: IndustryLabels;
  companyId: string | null;
  t: any;
}) => {

  const visibleItems = group.items.filter(i => canSee(i, role));
  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="hidden lg:block">
        <Collapsible open={isOpen} onOpenChange={onToggle}>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 group cursor-pointer select-none rounded-xl hover:bg-white/[0.02] transition-colors">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 group-hover:text-zinc-400 transition-colors">
              {group.groupLabel}
            </span>
            <ChevronRight
              className={`text-zinc-700 transition-transform duration-200 group-hover:text-zinc-500 ${isOpen ? "rotate-90" : ""}`}
              size={14}
              strokeWidth={2.5}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-0.5 mt-1"
                >
                  {visibleItems.map(item => (
                    <SidebarNavItem key={item.path} item={item} location={location} industryLabels={industryLabels} companyId={companyId} t={t} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="lg:hidden space-y-1">
        {visibleItems.map(item => (
          <SidebarNavItem key={item.path} item={item} location={location} industryLabels={industryLabels} companyId={companyId} t={t} />
        ))}
      </div>
    </div>
  );
});

SidebarCollapsibleGroup.displayName = "SidebarCollapsibleGroup";


/* ─── Platform Nav ─── */

function SidebarPlatformNav({ items, location, industryLabels, platformLabel, companyId, t }: {
  items: NavItem[];
  location: { pathname: string; search: string };
  industryLabels: IndustryLabels;
  platformLabel?: string;
  companyId: string | null;
  t: any;
}) {
  return (
    <nav className="space-y-1 min-h-0">
      <p className="hidden lg:block px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">
        {platformLabel || "Platform"}
      </p>
      {items.map(item => (
        <SidebarNavItem key={item.path} item={item} location={location} industryLabels={industryLabels} companyId={companyId} t={t} />
      ))}
    </nav>
  );
}

/* ─── Tenant Nav ─── */

function SidebarTenantNav({ groups, utilityItems: utils, location, role, industryLabels, isAdmin, adjustmentsLabel, companyId, t }: {
  groups: NavGroup[]; utilityItems: NavItem[];
  location: { pathname: string; search: string };
  role: string | null; industryLabels: IndustryLabels; isAdmin: boolean;
  adjustmentsLabel?: string;
  companyId: string | null;
  t: any;
}) {
  const activeGroupIdx = groups.findIndex(g =>
    g.items.some(i => isActivePath(location, i.path))
  );
  const [openGroup, setOpenGroup] = useState<number>(activeGroupIdx >= 0 ? activeGroupIdx : 0);

  useEffect(() => {
    const idx = groups.findIndex(g => g.items.some(i => isActivePath(location, i.path)));
    if (idx >= 0) setOpenGroup(idx);
  }, [location.pathname, location.search]);

  const visibleUtils = utils.filter(i => canSee(i, role));
  const [principalGroup, ...collapsibleGroups] = groups;
  const principalItems = principalGroup.items.filter(i => canSee(i, role));

  return (
    <>
      <nav className="min-h-0 space-y-3 lg:space-y-4">
        {principalItems.length > 0 && (
          <div className="space-y-1">
            <p className="hidden lg:block px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 select-none">
              {principalGroup.groupLabel}
            </p>
            {principalItems.map(item => (
              <SidebarNavItem key={item.path} item={item} location={location} industryLabels={industryLabels} companyId={companyId} t={t} />
            ))}
          </div>
        )}

        {collapsibleGroups.map((group, idx) => (
          <SidebarCollapsibleGroup
            key={group.groupLabel}
            group={group}
            isOpen={openGroup === idx + 1}
            onToggle={() => setOpenGroup(openGroup === idx + 1 ? -1 : idx + 1)}
            location={location}
            role={role}
            industryLabels={industryLabels}
            companyId={companyId}
            t={t}
          />
        ))}
      </nav>

      {visibleUtils.length > 0 && (
        <div className="pt-3 mt-2 border-t border-white/[0.04] space-y-0.5">
          <p className="hidden lg:block px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-600 select-none">
            {adjustmentsLabel || "Settings"}
          </p>
          {visibleUtils.map(item => (
            <SidebarNavItem key={item.path} item={item} location={location} industryLabels={industryLabels} companyId={companyId} t={t} />
          ))}
        </div>
      )}
    </>
  );
}

/* ─── User Footer ─── */

function SidebarUserFooter({ avatarUrl, fullName, email, initials, isSuperadmin, isAdmin, onLogout, onNavigate, profileLabel, settingsLabel, logoutLabel }: {
  avatarUrl: string | null; fullName: string; email: string;
  initials: string; isSuperadmin: boolean; isAdmin: boolean;
  onLogout: () => void; onNavigate: (path: string) => void;
  profileLabel?: string; settingsLabel?: string; logoutLabel?: string;
}) {
  return (
    <div className="flex-shrink-0 mt-3 pt-3 border-t border-white/[0.04] space-y-1.5">
      <div className="flex items-center justify-between lg:justify-start lg:gap-3 lg:px-1">
        <NotificationBell />
        <LanguageSwitcher className="h-9" />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center rounded-xl transition-all duration-200 hover:bg-white/[0.03] w-full justify-center lg:justify-start lg:gap-3 lg:px-2.5 lg:py-2.5 p-2"
            title="Mi Perfil"
            aria-label="Menú del usuario"
          >
            <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-primary/25 ring-offset-1 ring-offset-zinc-950">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <span className="font-medium text-[13px] block leading-tight truncate text-white">
                {fullName.split(" ")[0]}
              </span>
              <span className="text-[11px] text-zinc-500 leading-tight truncate block">
                {isSuperadmin ? "Superadmin" : email}
              </span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right" className="glass-card w-56 z-50" sideOffset={8}>
          <div className="p-2.5">
            <p className="font-semibold text-white">{fullName}</p>
            <p className="text-sm text-zinc-400">{email}</p>
            {isSuperadmin && (
              <Badge variant="outline" className="mt-1.5 text-xs border-primary/30 text-primary font-bold">
                <Shield className="w-3 h-3 mr-1" />
                Superadmin
              </Badge>
            )}
          </div>
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem onClick={() => onNavigate("/settings?tab=perfil")} className="min-h-[40px] text-zinc-300 hover:text-white">
            <User className="w-4 h-4 mr-2" /> {profileLabel || "Profile"}
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => onNavigate("/settings")} className="min-h-[40px] text-zinc-300 hover:text-white">
              <Settings className="w-4 h-4 mr-2" /> {settingsLabel || "Settings"}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem onClick={onLogout} className="text-red-400 hover:text-red-300 min-h-[40px]">
            <LogOut className="w-4 h-4 mr-2" /> {logoutLabel || "Sign Out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
