import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIndustryLabels } from "@/hooks/useIndustryLabels";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, X, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  platformItems, tenantGroups, utilityItems,
  type NavItem, type NavGroup,
} from "@/constants/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { role, isSuperadmin, isAdmin } = useUserRole();
  const { avatarUrl } = useAvatarUrl();
  const { fullName, email, initials } = useUserProfile();
  const industryLabels = useIndustryLabels();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
    onClose();
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

  const renderNavItem = (item: NavItem, index: number) => {
    const active = isActive(item.path);
    const label = getLabel(item);
    return (
      <motion.div
        key={item.path}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.03 * index, duration: 0.2 }}
      >
        <NavLink
          to={item.path}
          onClick={onClose}
          className={`relative flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-lg transition-colors ${
            active
              ? "text-foreground font-semibold bg-primary/[0.06]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
          aria-current={active ? "page" : undefined}
        >
          {active && (
            <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-full bg-primary" />
          )}
          <item.icon className="w-4 h-4" aria-hidden="true" />
          <span className="text-[13px]">{label}</span>
        </NavLink>
      </motion.div>
    );
  };

  const renderGroup = (group: NavGroup, startIndex: number) => {
    const visibleItems = group.items.filter(canSee);
    if (visibleItems.length === 0) return null;
    return (
      <div key={group.groupLabel} className="space-y-0.5">
        <p className="px-4 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 select-none">
          {group.groupLabel}
        </p>
        {visibleItems.map((item, i) => renderNavItem(item, startIndex + i))}
      </div>
    );
  };

  let idx = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed left-0 top-0 w-80 h-full sidebar-premium z-50 p-5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <BrandLogo size={36} showText variant="iconWithText" textClassName="text-xl" />
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted/30 rounded-xl" aria-label="Cerrar menú">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto min-h-0 px-1 space-y-5" role="navigation" aria-label="Menú principal">
              {isSuperadmin ? (
                <>
                  <p className="px-4 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
                    Plataforma
                  </p>
                  {platformItems.map((item, i) => renderNavItem(item, i))}
                </>
              ) : (
                <>
                  {tenantGroups.map((group) => {
                    const el = renderGroup(group, idx);
                    idx += group.items.length;
                    return el;
                  })}
                </>
              )}
            </nav>

            {/* Utilities */}
            {!isSuperadmin && utilityItems.filter(canSee).length > 0 && (
              <div className="px-1 pt-3 mt-2 border-t border-border/10 space-y-0.5">
                <p className="px-4 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/40 select-none">
                  Utilidades
                </p>
                {utilityItems.filter(canSee).map((item, i) => renderNavItem(item, 20 + i))}
              </div>
            )}

            {/* User footer */}
            <div className="flex-shrink-0 mt-3 rounded-xl p-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] w-full rounded-lg hover:bg-muted/30 transition-colors" aria-label="Menú del usuario">
                    <Avatar className="w-8 h-8 ring-1 ring-primary/20">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[11px]">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <span className="font-semibold text-[13px] block leading-tight text-foreground">{fullName.split(" ")[0]}</span>
                      <span className="text-[10px] text-muted-foreground/60 leading-tight">{isSuperadmin ? "Superadmin" : email}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="glass-card w-56 z-[60]" sideOffset={8}>
                  <div className="p-2">
                    <p className="font-semibold">{fullName}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    {isSuperadmin && (
                      <Badge variant="outline" className="mt-1 text-xs border-primary/30 text-primary">
                        <Shield className="w-3 h-3 mr-1" /> Superadmin
                      </Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { navigate("/settings?tab=perfil"); onClose(); }} className="min-h-[44px]">
                    <User className="w-4 h-4 mr-2" /> Perfil
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => { navigate("/settings"); onClose(); }} className="min-h-[44px]">
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
