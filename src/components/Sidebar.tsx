import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useBreakpoint } from "@/hooks/use-mobile";
import type { IndustryLabels } from "@/hooks/useIndustryLabels";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIndustryLabels } from "@/hooks/useIndustryLabels";
import { useLanguage } from "@/i18n/LanguageContext";
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
import { LogOut, User, Shield, Settings, ChevronRight } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  platformItems, tenantGroups, utilityItems,
  type NavItem, type NavGroup,
} from "@/constants/navigation";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const { signOut } = useAuth();
  const { role, isSuperadmin, isAdmin, loading: roleLoading } = useUserRole();
  const { avatarUrl } = useAvatarUrl();
  const { fullName, email, initials } = useUserProfile();
  const industryLabels = useIndustryLabels();
  const { t } = useLanguage();

  if (breakpoint === "mobile") return null;
  if (roleLoading) return null;

  const isTablet = breakpoint === "tablet";

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed left-0 top-0 h-screen z-10 flex flex-col border-r border-white/[0.04] bg-zinc-950/40 backdrop-blur-xl ${
        isTablet ? "w-[72px] px-2 py-4" : "w-[260px] px-4 py-5"
      }`}
      style={{ letterSpacing: "-0.01em" }}
      role="navigation"
      aria-label="Menu lateral principal"
    >
      {/* Logo */}
      {!isTablet ? (
        <div className="mb-7 flex-shrink-0 px-1">
          <BrandLogo size={38} showText variant="iconWithText" textClassName="text-lg font-semibold tracking-tight" />
          <p className="text-[10px] text-zinc-500 mt-1.5 uppercase tracking-[0.08em] font-medium">
            {isSuperadmin ? "Platform Admin" : FIXED_BRANDING.appTagline}
          </p>
        </div>
      ) : (
        <div className="mb-5 flex-shrink-0 flex justify-center">
          <BrandLogo size={32} />
        </div>
      )}

      {/* Build i18n-aware groups */}
      {(() => {
        const localizedGroups = tenantGroups.map((g, i) => ({
          ...g,
          groupLabel: i === 0 ? t.nav.principal
            : i === 1 ? t.nav.crmSales
            : i === 2 ? t.nav.production
            : t.nav.administration,
        }));
        return isSuperadmin ? (
          <SidebarPlatformNav
            items={platformItems}
            isTablet={isTablet}
            location={location}
            industryLabels={industryLabels}
            platformLabel={t.nav.platform}
          />
        ) : (
          <SidebarTenantNav
            groups={localizedGroups}
            utilityItems={utilityItems}
            isTablet={isTablet}
            location={location}
            role={role}
            industryLabels={industryLabels}
            isAdmin={isAdmin}
            adjustmentsLabel={t.nav.adjustments}
          />
        );
      })()}

      {/* User footer */}
      <SidebarUserFooter
        isTablet={isTablet}
        avatarUrl={avatarUrl}
        fullName={fullName}
        email={email}
        initials={initials}
        isSuperadmin={isSuperadmin}
        isAdmin={isAdmin}
        onLogout={async () => { await signOut(); navigate("/login"); }}
        onNavigate={navigate}
      />
    </motion.aside>
  );
};

/* ─── Helpers ─── */

const isActivePath = (location: { pathname: string; search: string }, path: string) =>
  location.pathname + location.search === path || location.pathname === path;

const getLabel = (item: NavItem, industryLabels: IndustryLabels) => {
  if (item.labelKey && industryLabels[item.labelKey]) return industryLabels[item.labelKey];
  return item.label;
};

const canSee = (item: NavItem, role: string | null) => {
  if (!item.roles) return true;
  if (!role) return false;
  return item.roles.includes(role as any);
};

/* ─── Nav Item (Apple pill style) ─── */

function SidebarNavItem({ item, isTablet, location, industryLabels }: {
  item: NavItem; isTablet: boolean;
  location: { pathname: string; search: string };
  industryLabels: IndustryLabels;
}) {
  const active = isActivePath(location, item.path);
  const label = getLabel(item, industryLabels);
  return (
    <NavLink
      to={item.path}
      className={`group relative flex items-center transition-all duration-200 ${
        isTablet
          ? "justify-center rounded-xl p-2.5"
          : "gap-3 rounded-lg px-3 py-2"
      } ${
        active
          ? "bg-white/[0.03] border border-white/[0.08] text-white font-medium"
          : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
      }`}
      title={isTablet ? label : undefined}
      aria-current={active ? "page" : undefined}
    >
      {/* Floating orange indicator */}
      {active && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute left-1 top-[22%] bottom-[22%] w-[2.5px] rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        />
      )}
      <item.icon
        className={`flex-shrink-0 ${active ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}
        size={18}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {!isTablet && (
        <span className={`text-sm leading-tight ${active ? "font-medium" : "font-normal"}`}>
          {label}
        </span>
      )}
    </NavLink>
  );
}

/* ─── Collapsible Group ─── */

function SidebarCollapsibleGroup({ group, isOpen, onToggle, isTablet, location, role, industryLabels }: {
  group: NavGroup; isOpen: boolean; onToggle: () => void;
  isTablet: boolean; location: { pathname: string; search: string };
  role: string | null; industryLabels: IndustryLabels;
}) {
  const visibleItems = group.items.filter(i => canSee(i, role));
  if (visibleItems.length === 0) return null;

  if (isTablet) {
    return (
      <div className="space-y-1">
        {visibleItems.map(item => (
          <SidebarNavItem key={item.path} item={item} isTablet location={location} industryLabels={industryLabels} />
        ))}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-1.5 group cursor-pointer select-none rounded-md hover:bg-white/[0.02] transition-colors">
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          {group.groupLabel}
        </span>
        <ChevronRight
          className={`text-zinc-600 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
          size={12}
          strokeWidth={2}
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
                <SidebarNavItem key={item.path} item={item} isTablet={false} location={location} industryLabels={industryLabels} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ─── Platform Nav (superadmin) ─── */

function SidebarPlatformNav({ items, isTablet, location, industryLabels }: {
  items: NavItem[]; isTablet: boolean;
  location: { pathname: string; search: string };
  industryLabels: IndustryLabels;
}) {
  return (
    <nav className="flex-1 overflow-y-auto scrollbar-none space-y-1 min-h-0">
      {!isTablet && (
        <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Plataforma
        </p>
      )}
      {items.map(item => (
        <SidebarNavItem key={item.path} item={item} isTablet={isTablet} location={location} industryLabels={industryLabels} />
      ))}
    </nav>
  );
}

/* ─── Tenant Nav (accordion) ─── */

function SidebarTenantNav({ groups, utilityItems: utils, isTablet, location, role, industryLabels, isAdmin }: {
  groups: NavGroup[]; utilityItems: NavItem[]; isTablet: boolean;
  location: { pathname: string; search: string };
  role: string | null; industryLabels: IndustryLabels; isAdmin: boolean;
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
      <nav className="flex-1 min-h-0 space-y-3 overflow-y-auto scrollbar-none">
        {/* Dashboard — always visible */}
        {principalItems.length > 0 && (
          <div className="space-y-1">
            {!isTablet && (
              <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 select-none">
                {principalGroup.groupLabel}
              </p>
            )}
            {principalItems.map(item => (
              <SidebarNavItem key={item.path} item={item} isTablet={isTablet} location={location} industryLabels={industryLabels} />
            ))}
          </div>
        )}

        {/* Collapsible groups */}
        {collapsibleGroups.map((group, idx) => (
          <SidebarCollapsibleGroup
            key={group.groupLabel}
            group={group}
            isOpen={openGroup === idx + 1}
            onToggle={() => setOpenGroup(openGroup === idx + 1 ? -1 : idx + 1)}
            isTablet={isTablet}
            location={location}
            role={role}
            industryLabels={industryLabels}
          />
        ))}
      </nav>

      {/* Utilities — pinned bottom */}
      {visibleUtils.length > 0 && (
        <div className="pt-3 mt-2 border-t border-white/[0.04] space-y-0.5">
          {!isTablet && (
            <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-600 select-none">
              Ajustes
            </p>
          )}
          {visibleUtils.map(item => (
            <SidebarNavItem key={item.path} item={item} isTablet={isTablet} location={location} industryLabels={industryLabels} />
          ))}
        </div>
      )}
    </>
  );
}

/* ─── User Footer (Premium) ─── */

function SidebarUserFooter({ isTablet, avatarUrl, fullName, email, initials, isSuperadmin, isAdmin, onLogout, onNavigate }: {
  isTablet: boolean; avatarUrl: string | null; fullName: string; email: string;
  initials: string; isSuperadmin: boolean; isAdmin: boolean;
  onLogout: () => void; onNavigate: (path: string) => void;
}) {
  return (
    <div className="flex-shrink-0 mt-3 pt-3 border-t border-white/[0.04] space-y-1.5">
      <div className={`flex ${isTablet ? "justify-center" : "px-1"}`}>
        <NotificationBell />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center rounded-xl transition-all duration-200 hover:bg-white/[0.03] w-full ${
              isTablet ? "justify-center p-2" : "gap-3 px-2.5 py-2.5"
            }`}
            title={isTablet ? "Mi Perfil" : undefined}
            aria-label="Menú del usuario"
          >
            <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-primary/25 ring-offset-1 ring-offset-zinc-950">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!isTablet && (
              <div className="text-left min-w-0 flex-1">
                <span className="font-medium text-[13px] block leading-tight truncate text-white">
                  {fullName.split(" ")[0]}
                </span>
                <span className="text-[11px] text-zinc-500 leading-tight truncate block">
                  {isSuperadmin ? "Superadmin" : email}
                </span>
              </div>
            )}
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
            <User className="w-4 h-4 mr-2" /> Perfil
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => onNavigate("/settings")} className="min-h-[40px] text-zinc-300 hover:text-white">
              <Settings className="w-4 h-4 mr-2" /> Configuración
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem onClick={onLogout} className="text-red-400 hover:text-red-300 min-h-[40px]">
            <LogOut className="w-4 h-4 mr-2" /> Salir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
