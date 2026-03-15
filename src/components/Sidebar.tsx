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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, ChevronDown, Shield, Settings } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { platformItems, mainItems, operationGroup, adminItems, type NavItem } from "@/constants/navigation";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const { signOut } = useAuth();
  const { role, isSuperadmin, isAdmin, loading: roleLoading } = useUserRole();
  const { avatarUrl } = useAvatarUrl();
  const { fullName, email, initials } = useUserProfile();
  const industryLabels = useIndustryLabels();

  const isOperationActive = operationGroup.items.some(i => location.pathname === i.path);
  const [operationOpen, setOperationOpen] = useState(isOperationActive);
  
  if (breakpoint === 'mobile') return null;
  if (roleLoading) return null;

  const isTablet = breakpoint === 'tablet';

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
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

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname + location.search === item.path || location.pathname === item.path;
    const label = getLabel(item);
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={`sidebar-nav-item min-h-[44px] ${
          isTablet ? 'justify-center p-3' : 'gap-3 px-4 py-3'
        } ${isActive ? 'sidebar-nav-active' : ''}`}
        title={isTablet ? label : undefined}
        aria-current={isActive ? "page" : undefined}
      >
        <item.icon className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
        {!isTablet && <span className="font-medium text-sm">{label}</span>}
      </NavLink>
    );
  };

  const renderPlatformNav = () => (
    <nav className="flex-1 overflow-y-auto space-y-1 min-h-0 px-1">
      {!isTablet && (
        <div className="px-3 py-2 mb-2">
          <span className="sidebar-section-label">Plataforma</span>
        </div>
      )}
      {platformItems.map(item => renderNavItem(item))}
    </nav>
  );

  const renderTenantNav = () => {
    const visibleMainItems = mainItems.filter(canSee);
    const visibleOperationItems = operationGroup.items.filter(canSee);
    const visibleAdminItems = adminItems.filter(canSee);

    return (
      <nav className="flex-1 overflow-y-auto space-y-1 min-h-0 px-1">
        {visibleMainItems.map(item => renderNavItem(item))}
        {visibleOperationItems.length > 0 && (
          <>
            <div className="my-3 mx-2 border-t sidebar-divider" />
            {isTablet ? (
              visibleOperationItems.map(item => renderNavItem(item))
            ) : (
              <Collapsible open={operationOpen} onOpenChange={setOperationOpen}>
                <CollapsibleTrigger className="sidebar-nav-item gap-3 px-4 py-3 min-h-[44px] w-full">
                  <operationGroup.icon className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium text-sm flex-1 text-left">{operationGroup.groupLabel}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${operationOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-0.5 mt-0.5">
                  {visibleOperationItems.map(item => renderNavItem(item))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </>
        )}
        {visibleAdminItems.length > 0 && (
          <>
            <div className="my-3 mx-2 border-t sidebar-divider" />
            {visibleAdminItems.map(item => renderNavItem(item))}
          </>
        )}
      </nav>
    );
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed left-0 top-0 sidebar-premium h-screen z-10 flex flex-col ${
        isTablet ? 'w-20 p-3' : 'w-64 p-4'
      }`}
      role="navigation"
      aria-label="Menu lateral principal"
    >
      {!isTablet ? (
        <div className="mb-8 flex-shrink-0 px-2">
          <BrandLogo size={44} showText variant="iconWithText" textClassName="text-2xl font-bold" />
          <p className="text-[11px] text-muted-foreground mt-2 uppercase tracking-[0.04em] font-medium">
            {isSuperadmin ? 'Platform Admin' : FIXED_BRANDING.appTagline}
          </p>
        </div>
      ) : (
        <div className="mb-6 flex-shrink-0 flex justify-center">
          <BrandLogo size={40} />
        </div>
      )}

      {isSuperadmin ? renderPlatformNav() : renderTenantNav()}

      <div className="flex-shrink-0 mt-auto sidebar-footer-block space-y-1">
        <div className={`flex ${isTablet ? 'justify-center' : 'px-3'} py-1`}>
          <NotificationBell />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`sidebar-nav-item min-h-[44px] w-full ${
                isTablet ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
              }`}
              title={isTablet ? "Mi Perfil" : undefined}
              aria-label="Menú del usuario"
            >
              <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-primary/25">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                <AvatarFallback className="bg-primary/15 text-primary font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!isTablet && (
                <div className="text-left min-w-0">
                  <span className="font-semibold text-sm block leading-tight truncate text-foreground">{fullName.split(' ')[0]}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight truncate block">
                    {isSuperadmin ? 'Superadmin' : email}
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
            <DropdownMenuItem onClick={() => navigate('/settings?tab=perfil')} className="min-h-[44px]">
              <User className="w-4 h-4 mr-2" /> Perfil
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate('/settings')} className="min-h-[44px]">
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
