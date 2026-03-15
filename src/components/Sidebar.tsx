import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useBreakpoint } from "@/hooks/use-mobile";
import type { IndustryLabels } from "@/hooks/useIndustryLabels";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIndustryLabels } from "@/hooks/useIndustryLabels";
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

  if (breakpoint === "mobile") return null;
  if (roleLoading) return null;

  const isTablet = breakpoint === "tablet";

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed left-0 top-0 sidebar-premium h-screen z-10 flex flex-col ${
        isTablet ? "w-20 p-2" : "w-60 p-2.5"
      }`}
      role="navigation"
      aria-label="Menu lateral principal"
    >
      {/* Logo */}
      {!isTablet ? (
        <div className="mb-4 flex-shrink-0 px-2.5">
          <BrandLogo size={36} showText variant="iconWithText" textClassName="text-lg font-bold" />
          <p className="text-[9px] text-muted-foreground/50 mt-1 uppercase tracking-[0.06em] font-medium">
            {isSuperadmin ? "Platform Admin" : FIXED_BRANDING.appTagline}
          </p>
        </div>
      ) : (
        <div className="mb-3 flex-shrink-0 flex justify-center">
          <BrandLogo size={32} />
        </div>
      )}

      {isSuperadmin ? (
        <SidebarPlatformNav
          items={platformItems}
          isTablet={isTablet}
          location={location}
          industryLabels={industryLabels}
        />
      ) : (
        <SidebarTenantNav
          groups={tenantGroups}
          utilityItems={utilityItems}
          isTablet={isTablet}
          location={location}
          role={role}
          industryLabels={industryLabels}
          isAdmin={isAdmin}
        />
      )}

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

const isActive = (location: { pathname: string; search: string }, path: string) =>
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

/* ─── Nav Item ─── */

function SidebarNavItem({ item, isTablet, location, industryLabels }: {
  item: NavItem; isTablet: boolean;
  location: { pathname: string; search: string };
  industryLabels: IndustryLabels;
}) {
  const active = isActive(location, item.path);
  const label = getLabel(item, industryLabels);
  return (
    <NavLink
      to={item.path}
      className={`group relative flex items-center rounded-md transition-colors duration-150 ${
        isTablet ? "justify-center p-2" : "gap-2.5 px-2.5 py-1.5"
      } ${
        active
          ? "text-foreground font-semibold bg-primary/[0.06]"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
      }`}
      title={isTablet ? label : undefined}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      {!isTablet && <span className="text-[13px] leading-tight">{label}</span>}
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
      <div className="space-y-0.5">
        {visibleItems.map(item => (
          <SidebarNavItem key={item.path} item={item} isTablet location={location} industryLabels={industryLabels} />
        ))}
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full px-2.5 py-1 group cursor-pointer select-none">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
          {group.groupLabel}
        </span>
        <ChevronRight className={`w-3 h-3 text-muted-foreground/40 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-0.5 mt-0.5"
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
  industryLabels: Record<string, string>;
}) {
  return (
    <nav className="flex-1 overflow-y-auto space-y-0.5 min-h-0 px-1">
      {!isTablet && (
        <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
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
  role: string | null; industryLabels: Record<string, string>; isAdmin: boolean;
}) {
  // Find which group contains the active route
  const activeGroupIdx = groups.findIndex(g =>
    g.items.some(i => isActive(location, i.path))
  );
  const [openGroup, setOpenGroup] = useState<number>(activeGroupIdx >= 0 ? activeGroupIdx : 0);

  // Sync open group when route changes
  useEffect(() => {
    const idx = groups.findIndex(g => g.items.some(i => isActive(location, i.path)));
    if (idx >= 0) setOpenGroup(idx);
  }, [location.pathname, location.search]);

  const visibleUtils = utils.filter(i => canSee(i, role));

  // First group (Principal/Dashboard) is always expanded as standalone
  const [principalGroup, ...collapsibleGroups] = groups;
  const principalItems = principalGroup.items.filter(i => canSee(i, role));

  return (
    <>
      <nav className="flex-1 min-h-0 px-1 space-y-1.5 overflow-y-auto scrollbar-none">
        {/* Dashboard — always visible */}
        {principalItems.length > 0 && (
          <div className="space-y-0.5">
            {!isTablet && (
              <p className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 select-none">
                {principalGroup.groupLabel}
              </p>
            )}
            {principalItems.map(item => (
              <SidebarNavItem key={item.path} item={item} isTablet={isTablet} location={location} industryLabels={industryLabels} />
            ))}
          </div>
        )}

        {/* Collapsible groups — only one open at a time */}
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
        <div className="px-1 pt-2 mt-1 border-t border-border/10 space-y-0.5">
          {!isTablet && (
            <p className="px-2.5 pb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/40 select-none">
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

/* ─── User Footer ─── */

function SidebarUserFooter({ isTablet, avatarUrl, fullName, email, initials, isSuperadmin, isAdmin, onLogout, onNavigate }: {
  isTablet: boolean; avatarUrl: string | null; fullName: string; email: string;
  initials: string; isSuperadmin: boolean; isAdmin: boolean;
  onLogout: () => void; onNavigate: (path: string) => void;
}) {
  return (
    <div className="flex-shrink-0 mt-1.5 space-y-0.5">
      <div className={`flex ${isTablet ? "justify-center" : "px-1.5"} py-0.5`}>
        <NotificationBell />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center rounded-lg transition-colors hover:bg-muted/30 w-full ${
              isTablet ? "justify-center p-2" : "gap-2.5 px-2 py-1.5"
            }`}
            title={isTablet ? "Mi Perfil" : undefined}
            aria-label="Menú del usuario"
          >
            <Avatar className="w-7 h-7 flex-shrink-0 ring-1 ring-primary/20">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!isTablet && (
              <div className="text-left min-w-0">
                <span className="font-semibold text-[12px] block leading-tight truncate text-foreground">
                  {fullName.split(" ")[0]}
                </span>
                <span className="text-[9px] text-muted-foreground/60 leading-tight truncate block">
                  {isSuperadmin ? "Superadmin" : email}
                </span>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="right" className="glass-card w-56 z-50" sideOffset={8}>
          <div className="p-2">
            <p className="font-semibold text-foreground">{fullName}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            {isSuperadmin && (
              <Badge variant="outline" className="mt-1 text-xs border-primary/30 text-primary font-bold">
                <Shield className="w-3 h-3 mr-1" />
                Superadmin
              </Badge>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onNavigate("/settings?tab=perfil")} className="min-h-[40px]">
            <User className="w-4 h-4 mr-2" /> Perfil
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => onNavigate("/settings")} className="min-h-[40px]">
              <Settings className="w-4 h-4 mr-2" /> Configuración
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-destructive min-h-[40px]">
            <LogOut className="w-4 h-4 mr-2" /> Salir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
