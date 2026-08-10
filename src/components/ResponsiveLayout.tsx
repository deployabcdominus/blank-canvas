import { useState, ReactNode } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-background text-foreground selection:bg-primary/20 relative isolate overflow-x-hidden">
      <div className="hidden md:block shrink-0 w-[72px] lg:w-[260px] min-h-[100dvh]" aria-hidden="true" />
      <Sidebar />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      <main 
        className="flex-1 flex flex-col transition-all duration-300 p-3 sm:p-6 w-full max-w-full min-h-[100dvh] pt-4 md:pt-6 relative z-0"
      >
        <div className="md:hidden flex items-center gap-3 mb-4 sticky top-0 z-30 bg-background/80 backdrop-blur-md py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="hover:bg-white/10 h-11 w-11 shrink-0"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold truncate">{FIXED_BRANDING.appName}</h1>
        </div>


        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded z-50"
        >
          Saltar al contenido principal
        </a>

        <div id="main-content" className="flex-1 flex flex-col">
          {(title || subtitle) && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mb-8"
            >
              <div className="flex items-center gap-4 mb-1.5">
                {Icon && (
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                )}
                <div>
                  {title && <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h1>}
                  {subtitle && <p className="text-zinc-400 text-sm md:text-base mt-0.5">{subtitle}</p>}
                </div>
              </div>
            </motion.div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};
