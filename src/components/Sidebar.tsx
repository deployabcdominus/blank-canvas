import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
import { LogOut, User, Shield, Settings, ChevronRight, Recycle } from "lucide-react";
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
  const { signOut } = useAuth();
  const { role, isSuperadmin, isAdmin, loading: roleLoading } = useUserRole();
  const { avatarUrl } = useAvatarUrl();
  const { fullName, email, initials } = useUserProfile();
  const industryLabels = useIndustryLabels();
  const { t } = useLanguage();

  if (roleLoading) return null;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 h-screen z-40 hidden md:flex flex-col border-r border-white/[0.04] bg-zinc-950/40 backdrop-blur-xl w-[72px] lg:w-[260px] px-2 lg:px-4 py-4 lg:py-5"
      style={{ letterSpacing: "-0.01em" }}
      role="navigation"
      aria-label="Menu lateral principal"
    >
      {/* Logo */}
      <div className="mb-5 lg:mb-7 flex-shrink-0 flex justify-center lg:justify-start lg:px-1">
        <div className="hidden lg:block">
          <BrandLogo size={38} showText variant="iconWithText" textClassName="text-lg font-semibold tracking-tight" />
          <p className="text-[10px] text-zinc-500 mt-1.5 uppercase tracking-[0.08em] font-medium">
            {isSuperadmin ? "Platform Admin" : FIXED_BRANDING.appTagline}
          </p>
        </div>
        <div className="lg:hidden">
          <BrandLogo size={32} />
        </div>
      </div>

      {/* Build i18n-aware groups */}
      {(() => {
        let localizedGroups = tenantGroups.map((g, i) => ({
          ...g,
          groupLabel: i === 0 ? t.nav.principal
            : i === 1 ? t.nav.crmSales
            : i === 2 ? t.nav.production
            : t.nav.administration,
        }));
        if (isAdmin && localizedGroups[3]) {
          const recycleItem = {
            path: "/leads/recycle-bin",
            label: "Papelera",
            icon: Recycle,
            roles: ["admin", "superadmin"],
          } as any;
          localizedGroups = localizedGroups.map((g, idx) => idx === 3 ? { ...g, items: [...g.items, recycleItem] } : g);
        }
        return isSuperadmin ? (
          <SidebarPlatformNav
            items={platformItems}
            location={location}
            industryLabels={industryLabels}
            platformLabel={t.nav.platform}
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
          />
        );
      })()}

      {/* User footer */}
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

/* ─── Nav Item ─── */

function SidebarNavItem({ item, location, industryLabels }: {
  item: NavItem;
  location: { pathname: string; search: string };
  industryLabels: IndustryLabels;
}) {
  const active = isActivePath(location, item.path);
  const label = getLabel(item, industryLabels);
  return (
    <NavLink
      to={item.path}
      className={`group relative flex items-center transition-all duration-200 justify-center lg:justify-start rounded-xl lg:rounded-lg p-2.5 lg:px-3 lg:py-2 ${
        active
          ? "bg-white/[0.03] border border-white/[0.08] text-white font-medium"
          : "border border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
      }`}
      title={label}
      aria-current={active ? "page" : undefined}
    >
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
      <span className="hidden lg:block text-sm leading-tight ml-3 truncate">
        {label}
      </span>
    </NavLink>
  );
}

/* ─── Collapsible Group ─── */

function SidebarCollapsibleGroup({ group, isOpen, onToggle, location, role, industryLabels }: {
  group: NavGroup; isOpen: boolean; onToggle: () => void;
  location: { pathname: string; search: string };
  role: string | null; industryLabels: IndustryLabels;
}) {
  const visibleItems = group.items.filter(i => canSee(i, role));
  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="hidden lg:block">
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
                    <SidebarNavItem key={item.path} item={item} location={location} industryLabels={industryLabels} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>
      </div>
      <div className="lg:hidden space-y-1">
        {visibleItems.map(item => (
          <SidebarNavItem key={item.path} item={item} location={location} industryLabels={industryLabels} />
        ))}
      </div>
    </div>
  );
}

/* ─── Platform Nav ─── */

function SidebarPlatformNav({ items, location, industryLabels, platformLabel }: {
  items: NavItem[];
  location: { pathname: string; search: string };
  industryLabels: IndustryLabels;
  platformLabel?: string;
}) {
  return (
    <nav className="flex-1 overflow-y-auto scrollbar-none space-y-1 min-h-0">
      <p className="hidden lg:block px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
        {platformLabel || "Platform"}
      </p>
      {items.map(item => (
        <SidebarNavItem key={item.path} item={item} location={location} industryLabels={industryLabels} />
      ))}
    </nav>
  );
}

/* ─── Tenant Nav ─── */

function SidebarTenantNav({ groups, utilityItems: utils, location, role, industryLabels, isAdmin, adjustmentsLabel }: {
  groups: NavGroup[]; utilityItems: NavItem[];
  location: { pathname: string; search: string };
  role: string | null; industryLabels: IndustryLabels; isAdmin: boolean;
  adjustmentsLabel?: string;
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
      <nav className="flex-1 min-h-0 space-y-3 lg:space-y-4 overflow-y-auto scrollbar-none">
        {principalItems.length > 0 && (
          <div className="space-y-1">
            <p className="hidden lg:block px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 select-none">
              {principalGroup.groupLabel}
            </p>
            {principalItems.map(item => (
              <SidebarNavItem key={item.path} item={item} location={location} industryLabels={industryLabels} />
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
          />
        ))}
      </nav>

      {visibleUtils.length > 0 && (
        <div className="pt-3 mt-2 border-t border-white/[0.04] space-y-0.5">
          <p className="hidden lg:block px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-600 select-none">
            {adjustmentsLabel || "Settings"}
          </p>
          {visibleUtils.map(item => (
            <SidebarNavItem key={item.path} item={item} location={location} industryLabels={industryLabels} />
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
      <div className="flex justify-center lg:justify-start lg:px-1">
        <NotificationBell />
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
