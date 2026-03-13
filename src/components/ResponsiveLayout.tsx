import { useState, ReactNode } from "react";
import { useBreakpoint } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/Sidebar";
import { MobileMenu } from "@/components/MobileMenu";
import { motion } from "framer-motion";
import { LucideIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FIXED_BRANDING } from "@/contexts/SettingsContext";

interface ResponsiveLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
}

export const ResponsiveLayout = ({ children, title, subtitle, icon: Icon }: ResponsiveLayoutProps) => {
  const breakpoint = useBreakpoint();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const sidebarWidth = isMobile ? 0 : isTablet ? 80 : 256;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <main 
        className={`flex-1 transition-all duration-300 ${
          isMobile ? 'p-4 pt-3' : 'p-6'
        }`}
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        {isMobile && (
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="hover:bg-white/10 min-h-[44px] min-w-[44px]"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">{FIXED_BRANDING.appName}</h1>
          </div>
        )}

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50"
        >
          Saltar al contenido principal
        </a>

        <div id="main-content">
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-1">
                {Icon && <Icon className="w-7 h-7 text-primary" />}
                {title && <h1 className="text-2xl font-bold">{title}</h1>}
              </div>
              {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
            </motion.div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};
