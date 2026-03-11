import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useUserProfile } from "@/hooks/useUserProfile";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, X, ChevronDown, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { platformItems, mainItems, operationGroup, adminItems, type NavItem } from "@/constants/navigation";

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

  const isOperationActive = operationGroup.items.some(i => location.pathname === i.path);
  const [operationOpen, setOperationOpen] = useState(isOperationActive);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    onClose();
  };

  const canSee = (item: NavItem) => {
    if (!item.roles) return true;
    if (!role) return false; // role not loaded yet → hide restricted items
    return item.roles.includes(role);
  };

  const renderNavItem = (item: NavItem, index: number) => {
    const isActive = location.pathname + location.search === item.path || location.pathname === item.path;
    return (
      <motion.div
        key={item.path}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.05 * index, duration: 0.25, ease: "easeOut" }}
      >
        <NavLink
          to={item.path}
          onClick={onClose}
          className={`sidebar-nav-item gap-3 px-4 py-4 min-h-[44px] ${isActive ? 'sidebar-nav-active' : ''}`}
          aria-current={isActive ? "page" : undefined}
        >
          <item.icon className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium text-sm">{item.label}</span>
        </NavLink>
      </motion.div>
    );
  };

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
            <div className="flex items-center justify-between mb-8 flex-shrink-0">
              <BrandLogo size={40} showText variant="iconWithText" textClassName="text-2xl" />
              <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10 rounded-xl" aria-label="Cerrar menú">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="space-y-1 flex-1 overflow-y-auto min-h-0 px-1" role="navigation" aria-label="Menú principal">
              {isSuperadmin ? (
                <>
                  <div className="px-3 py-2 mb-1"><span className="sidebar-section-label">Plataforma</span></div>
                  {platformItems.map((item, i) => renderNavItem(item, i))}
                </>
              ) : (
                <>
                  {mainItems.filter(canSee).map((item, i) => renderNavItem(item, i))}
                  {operationGroup.items.filter(canSee).length > 0 && (
                    <>
                      <div className="my-3 mx-2 border-t sidebar-divider" />
                      <Collapsible open={operationOpen} onOpenChange={setOperationOpen}>
                        <CollapsibleTrigger className="sidebar-nav-item gap-3 px-4 py-4 min-h-[44px] w-full">
                          <operationGroup.icon className="w-5 h-5" aria-hidden="true" />
                          <span className="font-medium text-sm flex-1 text-left">{operationGroup.groupLabel}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${operationOpen ? 'rotate-180' : ''}`} />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 space-y-1 mt-0.5">
                          {operationGroup.items.filter(canSee).map((item, i) => renderNavItem(item, i))}
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  )}
                  {adminItems.filter(canSee).length > 0 && (
                    <>
                      <div className="my-3 mx-2 border-t sidebar-divider" />
                      {adminItems.filter(canSee).map((item, i) => renderNavItem(item, i))}
                    </>
                  )}
                </>
              )}
            </nav>

            <div className="flex-shrink-0 mt-auto sidebar-footer-block rounded-xl p-2 space-y-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="sidebar-nav-item gap-3 px-3 py-3 min-h-[44px] w-full" aria-label="Menú del usuario">
                    <Avatar className="w-8 h-8 sidebar-avatar-ring">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <span className="font-medium text-sm block leading-tight text-foreground">{fullName.split(' ')[0]}</span>
                      <span className="text-xs text-muted-foreground leading-tight">{isSuperadmin ? 'Superadmin' : email}</span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="glass-card border-white/20 w-56 z-[60]" sideOffset={8}>
                  <div className="p-2">
                    <p className="font-medium">{fullName}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    {isSuperadmin && (
                      <Badge variant="outline" className="mt-1 text-xs border-primary/30 text-primary">
                        <Shield className="w-3 h-3 mr-1" /> Superadmin
                      </Badge>
                    )}
                  </div>
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem onClick={() => { navigate('/settings?tab=perfil'); onClose(); }} className="hover:bg-white/10 min-h-[44px]">
                    <User className="w-4 h-4 mr-2" /> Perfil
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => { navigate('/settings'); onClose(); }} className="hover:bg-white/10 min-h-[44px]">
                      <Settings className="w-4 h-4 mr-2" /> Configuración
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-white/20" />
                  <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/10 text-destructive min-h-[44px]">
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
