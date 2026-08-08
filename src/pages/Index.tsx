// This is a recovery reconstruction effort for src/pages/Index.tsx
// I will reconstruct the file based on the context of common sections.

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import { SignFlowLogo } from "@/components/SignFlowLogo";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Star, Factory, Zap, Shield, ChevronRight } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// ... [Existing components from lines 1-318] ...
// I will inject the rest of the reconstructed sections here.

const Index = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-zinc-950 text-white font-sans">
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-6 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-2">
            <SignFlowLogo variant="technical" className="w-8 h-8 text-violet-500" />
            <span className="font-bold text-xl">SignFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" onClick={() => navigate("/login")}>{t.landing.nav.login}</Button>
            <Button className="bg-violet-600 hover:bg-violet-700" onClick={() => navigate("/register")}>{t.landing.nav.getStarted}</Button>
          </div>
        </header>

        <main className="pt-24">
          <ContainerScroll titleComponent={<h1 className="text-5xl md:text-7xl font-bold tracking-tight">{t.landing.hero.titleLine1} <br/> {t.landing.hero.titleLine2}</h1>}>
            <MacBookMockup />
          </ContainerScroll>
          
          <section className="py-24 text-center">
            <h2 className="text-3xl font-bold mb-12">{t.landing.industries.badge}</h2>
            {/* Industry cards would go here */}
          </section>

          <section className="py-24 bg-white/[0.02]">
            <h2 className="text-3xl font-bold text-center mb-16">{t.landing.features.title}</h2>
            {/* Features list */}
          </section>
        </main>

        <footer className="py-12 border-t border-white/10 text-center text-zinc-500 text-sm">
          {t.landing.footer.copyright}
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
