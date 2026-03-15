import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useBreakpoint } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIndustryLabels } from "@/hooks/useIndustryLabels";
import { FIXED_BRANDING } from "@/contexts/SettingsContext";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Shield, Settings } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
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

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const canSee = (item: NavItem) => {
    if (!item.roles) return true;
    if (!role) return false;
    return item.roles.includes(role);
  };

  const getLabel = (item: NavItem) => {
    if (item.labelKey && industryLabels[item.labelKey]) {
      return industryLabels[item.labelKey];
    }
    return item.label;
  };

  const isActive = (path: string) =>
    location.pathname + location.search === path || location.pathname === path;

  // ── Nav item renderer ──
  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.path);
    const label = getLabel(item);
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={`group relative flex items-center rounded-lg transition-colors duration-200 min-h-[40px] ${
          isTablet ? "justify-center p-2.5" : "gap-3 px-3 py-2"
        } ${
          active
            ? "text-foreground font-semibold bg-primary/[0.06]"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
        }`}
        title={isTablet ? label : undefined}
        aria-current={active ? "page" : undefined}
      >
        {/* Active indicator — thin orange left bar */}
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
  };

  // ── Group renderer ──
  const renderGroup = (group: NavGroup) => {
    const visibleItems = group.items.filter(canSee);
    if (visibleItems.length === 0) return null;
    return (
      <div key={group.groupLabel} className="space-y-0.5">
        {!isTablet && (
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 select-none">
            {group.groupLabel}
          </p>
        )}
        {visibleItems.map(renderNavItem)}
      </div>
    );
  };

  // ── Platform nav (superadmin) ──
  const renderPlatformNav = () => (
    <nav className="flex-1 overflow-y-auto space-y-1 min-h-0 px-1.5">
      {!isTablet && (
        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
          Plataforma
        </p>
      )}
      {platformItems.map(renderNavItem)}
    </nav>
  );

  // ── Tenant nav ──
  const renderTenantNav = () => {
    const visibleUtilities = utilityItems.filter(canSee);

    return (
      <>
        <nav className="flex-1 overflow-y-auto min-h-0 px-1.5 space-y-5">
          {tenantGroups.map(renderGroup)}
        </nav>

        {/* Utility section — pinned at bottom above user */}
        {visibleUtilities.length > 0 && (
          <div className="px-1.5 pt-3 mt-2 border-t border-border/10 space-y-0.5">
            {!isTablet && (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/40 select-none">
                Utilidades
              </p>
            )}
            {visibleUtilities.map(renderNavItem)}
          </div>
        )}
      </>
    );
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed left-0 top-0 sidebar-premium h-screen z-10 flex flex-col ${
        isTablet ? "w-20 p-3" : "w-60 p-3"
      }`}
      role="navigation"
      aria-label="Menu lateral principal"
    >
      {/* Logo */}
      {!isTablet ? (
        <div className="mb-6 flex-shrink-0 px-2">
          <BrandLogo size={40} showText variant="iconWithText" textClassName="text-xl font-bold" />
          <p className="text-[10px] text-muted-foreground/50 mt-1.5 uppercase tracking-[0.06em] font-medium">
            {isSuperadmin ? "Platform Admin" : FIXED_BRANDING.appTagline}
          </p>
        </div>
      ) : (
        <div className="mb-5 flex-shrink-0 flex justify-center">
          <BrandLogo size={36} />
        </div>
      )}

      {isSuperadmin ? renderPlatformNav() : renderTenantNav()}

      {/* User footer */}
      <div className="flex-shrink-0 mt-3 space-y-1">
        <div className={`flex ${isTablet ? "justify-center" : "px-2"} py-0.5`}>
          <NotificationBell />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex items-center rounded-lg transition-colors hover:bg-muted/30 w-full min-h-[44px] ${
                isTablet ? "justify-center p-2.5" : "gap-3 px-2.5 py-2"
              }`}
              title={isTablet ? "Mi Perfil" : undefined}
              aria-label="Menú del usuario"
            >
              <Avatar className="w-8 h-8 flex-shrink-0 ring-1 ring-primary/20">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[11px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!isTablet && (
                <div className="text-left min-w-0">
                  <span className="font-semibold text-[13px] block leading-tight truncate text-foreground">
                    {fullName.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 leading-tight truncate block">
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
            <DropdownMenuItem onClick={() => navigate("/settings?tab=perfil")} className="min-h-[44px]">
              <User className="w-4 h-4 mr-2" /> Perfil
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate("/settings")} className="min-h-[44px]">
                <Settings className="w-4 h-4 mr-2" /> Configuración
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive min-h-[44px]">
              <LogOut className="w-4 h-4 mr-2" /> Salir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
};
