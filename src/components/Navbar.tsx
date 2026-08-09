import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignFlowLogo } from "@/components/SignFlowLogo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { LogIn } from "lucide-react";

export const Navbar = ({ transparent = false }: { transparent?: boolean }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !transparent 
          ? "bg-black/80 backdrop-blur-md border-b border-white/10 py-4" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" aria-label="Sign Flow">
          <div className="w-10 h-10 p-2 glass-card border-primary/20 flex items-center justify-center transition-all group-hover:border-primary/40 rounded-xl">
            <SignFlowLogo variant="technical" className="w-full h-full text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Sign Flow</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="/#industries" className="text-[13px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95">{t.landing.nav.industries}</a>
          <a href="/#pricing" className="text-[13px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95">{t.landing.nav.pricing}</a>
          <a href="/#faq" className="text-[13px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all hover:scale-105 active:scale-95">{t.landing.nav.faq}</a>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Button 
            onClick={() => navigate("/login")} 
            className="group relative overflow-hidden rounded-full px-6 font-bold transition-all bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-105 active:scale-95 shadow-[0_0_20px_-5px_rgba(168,85,247,0.5)]"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {t.landing.nav.login}
          </Button>
        </div>
      </div>
    </header>
  );
};
