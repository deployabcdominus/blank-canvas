import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/i18n/LanguageContext";
import { FIXED_BRANDING } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, Menu } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export const Header = ({ onMenuToggle }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';
  const { signOut } = useAuth();
  const { fullName, email, initials } = useUserProfile();
  const { t } = useLanguage();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-3 md:p-4 mb-6"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {onMenuToggle && (
            <Button variant="ghost" size="icon" onClick={onMenuToggle}
              className="md:hidden hover:bg-white/10 h-11 w-11 shrink-0"
              aria-label="Abrir menú de navegación">
              <Menu className="w-5 h-5" />
            </Button>
          )}
          {isDashboard && (
            <div className="hidden md:block">
              <h1 className="font-bold text-2xl truncate">{t.dashboard.welcomeBack}, {fullName.split(' ')[0]}!</h1>
              <p className="text-muted-foreground text-sm">{t.dashboard.projectsToday}</p>
            </div>
          )}
          <h1 className="md:hidden text-lg font-bold truncate">{FIXED_BRANDING.appName}</h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="glass-card p-0 h-11 w-11" aria-label="Menú del usuario">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-soft-blue text-soft-blue-foreground font-semibold">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-white/20 w-56 z-50" sideOffset={5}>
              <div className="p-2">
                <p className="font-medium truncate">{fullName}</p>
                <p className="text-sm text-muted-foreground truncate">{email}</p>
              </div>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem onClick={() => navigate('/settings?tab=perfil')} className="hover:bg-white/10 min-h-[44px]">
                <User className="w-4 h-4 mr-2" /> {t.nav.profile}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-white/10 min-h-[44px]">
                <Settings className="w-4 h-4 mr-2" /> {t.nav.settings}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem onClick={handleLogout} className="hover:bg-white/10 text-destructive min-h-[44px]">
                <LogOut className="w-4 h-4 mr-2" /> {t.nav.logout}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};
