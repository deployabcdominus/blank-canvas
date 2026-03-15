import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { BrandLogo } from "@/components/BrandLogo";
import brandLogoSrc from "@/assets/brand-logo.png";
import { pricingPlans, benefitsData, stepsData } from "@/constants/landingPageData";
import {
  ArrowRight,
  Check,
  LogIn,
  Zap,
  Clock,
  Users,
  Target,
  FileText,
  Wrench,
  Building,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  CalendarCheck,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Scroll-reveal wrapper ─── */
const Reveal = ({
  children,
  className = "",
  delay = 0,
}: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Animated price display ─── */
const AnimatedPrice = ({ value }: { value: number }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="text-4xl font-bold inline-block"
    >
      ${value}
    </motion.span>
  </AnimatePresence>
);

/* ─── Mini UI Mockup: Leads Chart ─── */
const LeadsChartMockup = () => (
  <div className="w-full">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold text-white/70">Leads esta semana</span>
      <span className="text-xs font-bold text-orange-400">+23%</span>
    </div>
    <div className="flex items-end gap-1.5 h-20">
      {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm bg-gradient-to-t from-orange-500/80 to-orange-400/40"
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 * i, duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
    <div className="flex justify-between mt-1.5">
      {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
        <span key={d} className="text-[9px] text-white/30 flex-1 text-center">{d}</span>
      ))}
    </div>
  </div>
);

/* ─── Mini UI Mockup: Proposal Card ─── */
const ProposalMockup = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-white/70">Propuesta #1082</span>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/25">
        Pendiente
      </span>
    </div>
    <div>
      <p className="text-[11px] text-white/40">Cliente: Rotulados Express</p>
      <p className="text-lg font-bold text-white mt-0.5">$12,400 <span className="text-[11px] text-white/30 font-normal">MXN</span></p>
    </div>
    <div className="flex gap-2">
      <button className="flex-1 flex items-center justify-center gap-1 text-[10px] font-medium py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
        <ThumbsUp className="w-3 h-3" /> Aprobar
      </button>
      <button className="flex-1 flex items-center justify-center gap-1 text-[10px] font-medium py-1.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/25">
        <ThumbsDown className="w-3 h-3" /> Rechazar
      </button>
    </div>
  </div>
);

/* ─── Mini UI Mockup: Installation Status ─── */
const InstallationMockup = () => (
  <div className="space-y-3">
    <span className="text-xs font-semibold text-white/70">Instalación en campo</span>
    {[
      { label: "Preparación", pct: 100, color: "bg-emerald-500" },
      { label: "Instalación", pct: 65, color: "bg-orange-500" },
      { label: "Verificación", pct: 0, color: "bg-white/20" },
    ].map((s) => (
      <div key={s.label} className="space-y-1">
        <div className="flex justify-between text-[10px]">
          <span className="text-white/50">{s.label}</span>
          <span className="text-white/40">{s.pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${s.color}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${s.pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    ))}
  </div>
);

/* ─── Business Flow Step ─── */
const flowSteps = [
  { icon: Target, label: "Lead", desc: "Captura la oportunidad" },
  { icon: FileText, label: "Propuesta", desc: "Envía y aprueba" },
  { icon: Wrench, label: "Orden de Trabajo", desc: "Produce y coordina" },
  { icon: Building, label: "Instalación", desc: "Ejecuta y entrega" },
];

const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handlePlanSelect = (plan: string) => {
    localStorage.setItem("selectedPlan", plan);
    localStorage.setItem("selectedBilling", isAnnual ? "annual" : "monthly");
    navigate("/checkout");
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#050505] text-[#F5F5F7] overflow-x-hidden scroll-smooth">

        {/* ═══════════ HEADER ═══════════ */}
        <header
          className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
            scrolled
              ? "bg-[#050505]/85 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.06)]"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
            <a href="/" className="flex items-center gap-1 py-2 min-h-[44px]" aria-label="Sign Flow - Inicio">
              <div className="flex-shrink-0 w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] md:w-[44px] md:h-[44px] overflow-hidden">
                <img src={brandLogoSrc} alt="Sign Flow" className="block w-full h-full object-contain scale-[1.15]" draggable={false} />
              </div>
              <span className="font-semibold tracking-[-0.02em] text-[16px] sm:text-[18px] md:text-[20px] text-[#F5F5F7]">
                Sign Flow
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-white/40">
              {[
                { label: "Funciones", id: "benefits" },
                { label: "Flujo", id: "flow" },
                { label: "Precios", id: "pricing" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="relative hover:text-white transition-colors duration-300 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-orange-500 hover:after:w-full after:transition-all after:duration-300"
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-white/40 hover:text-white hover:bg-white/5"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Ingresar
              </Button>
              <Button
                size="sm"
                onClick={() => scrollTo("pricing")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-full px-5 text-sm font-medium shadow-[0_8px_24px_rgba(249,115,22,0.3)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(249,115,22,0.45)] hover:scale-[1.03]"
              >
                Elegir Plan
              </Button>
            </div>
          </div>
        </header>

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 md:pt-44 md:pb-36 px-5">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.06),transparent_70%)]" />
            <div className="absolute top-40 right-[20%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(249,115,22,0.03),transparent_70%)]" />
          </div>

          <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left */}
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                <motion.span
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400 mb-5 px-4 py-2 rounded-full border border-orange-500/25 bg-orange-500/[0.08] backdrop-blur-md"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Plataforma de gestión de operaciones
                </motion.span>

                <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3rem] lg:text-[3.6rem] font-extrabold leading-[1.06] tracking-[-0.03em] mb-6 max-w-[540px] mx-auto lg:mx-0">
                  Controla tu operación,{" "}
                  <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    de lead a entrega.
                  </span>
                </h1>

                <p className="text-[15px] sm:text-lg md:text-[19px] font-medium text-white/50 leading-[1.65] max-w-lg mx-auto lg:mx-0 mb-8">
                  Leads, propuestas, producción y ejecución en un solo flujo. Hecho para negocios de servicios que quieren crecer.
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      size="lg"
                      onClick={() => scrollTo("pricing")}
                      className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-full px-9 text-base font-semibold shadow-[0_8px_32px_rgba(249,115,22,0.35)] transition-all duration-300 hover:shadow-[0_16px_48px_rgba(249,115,22,0.5)]"
                    >
                      Comenzar Ahora
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => scrollTo("flow")}
                      className="rounded-full px-9 text-base font-medium border-white/10 text-white/50 hover:text-white hover:border-orange-500/30 hover:bg-orange-500/[0.06] bg-transparent transition-all duration-300"
                    >
                      Ver Demo
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right — UI Mockup Grid */}
            <motion.div
              className="order-1 lg:order-2 relative"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute -inset-16 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(249,115,22,0.08),transparent_70%)] pointer-events-none blur-2xl" />

              <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
                {/* Leads chart */}
                <motion.div
                  whileHover={{ y: -4, borderColor: "rgba(249,115,22,0.4)" }}
                  className="col-span-2 p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-300"
                >
                  <LeadsChartMockup />
                </motion.div>
                {/* Proposal */}
                <motion.div
                  whileHover={{ y: -4, borderColor: "rgba(249,115,22,0.4)" }}
                  className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-300"
                >
                  <ProposalMockup />
                </motion.div>
                {/* Installation */}
                <motion.div
                  whileHover={{ y: -4, borderColor: "rgba(249,115,22,0.4)" }}
                  className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm transition-all duration-300"
                >
                  <InstallationMockup />
                </motion.div>
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-5 left-4 sm:left-6 rounded-2xl shadow-[0_20px_60px_-8px_rgba(0,0,0,0.8)] border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-xl px-5 py-3 flex items-center gap-3"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.7 }}
              >
                <div className="w-9 h-9 rounded-full bg-orange-500/15 flex items-center justify-center">
                  <Check className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white">Orden #1247 completada</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Hace 2 minutos</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════ TRUST BAR ═══════════ */}
        <Reveal>
          <section className="py-10 border-y border-white/[0.04]">
            <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-14 gap-y-2">
              {[
                { label: "Setup en minutos", icon: Clock },
                { label: "Workflow completo", icon: Zap },
                { label: "Multi-equipo", icon: Users },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center gap-2.5 p-6 group">
                  <Icon className="w-5 h-5 text-orange-500 group-hover:text-orange-400 transition-colors duration-300" />
                  <span className="text-sm font-medium text-white/30 group-hover:text-white/50 transition-colors duration-300">{label}</span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ═══════════ BENEFITS — Bento Grid ═══════════ */}
        <section id="benefits" className="py-24 md:py-32 lg:py-40 px-5 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(249,115,22,0.04),transparent)] pointer-events-none" />

          <div className="max-w-6xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-16 lg:mb-20">
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400 mb-4 px-3 py-1 rounded-full border border-orange-500/15 bg-orange-500/[0.05]">
                  ¿Por qué Sign Flow?
                </span>
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-extrabold tracking-[-0.02em] leading-[1.15]">
                  Todo lo que tu taller necesita
                </h2>
                <p className="mt-4 text-white/35 max-w-xl mx-auto text-sm sm:text-base">
                  Diseñado específicamente para el flujo de trabajo de fabricación e instalación.
                </p>
              </div>
            </Reveal>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefitsData.map((b, i) => {
                const Icon = b.icon;
                return (
                  <Reveal key={b.title} delay={i * 0.07}>
                    <motion.div
                      whileHover={{ y: -4, borderColor: "rgba(249,115,22,0.35)" }}
                      className="group relative p-6 sm:p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:shadow-[0_16px_48px_-12px_rgba(249,115,22,0.1)] transition-all duration-500"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-orange-500/[0.08] border border-orange-500/10 flex items-center justify-center mb-5 group-hover:bg-orange-500/[0.12] group-hover:border-orange-500/25 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-500">
                          <Icon className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-all duration-500" />
                        </div>
                        <h3 className="text-[15px] font-semibold mb-2 text-white/90">{b.title}</h3>
                        <p className="text-sm leading-relaxed text-white/40">{b.description}</p>
                      </div>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ BUSINESS FLOW ═══════════ */}
        <section id="flow" className="py-24 md:py-32 lg:py-40 px-5 relative">
          <div className="absolute inset-0 bg-[#030303] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(249,115,22,0.03),transparent)] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-16">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400 mb-3 block">
                  Ciclo de negocio
                </span>
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-extrabold tracking-[-0.02em] leading-[1.15]">
                  De lead a entrega, sin fricciones.
                </h2>
              </div>
            </Reveal>

            {/* Flow steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {/* Connecting line (desktop) */}
              <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] z-0">
                <motion.div
                  className="h-[2px] bg-gradient-to-r from-transparent via-orange-500/30 to-transparent"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              {flowSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <Reveal key={step.label} delay={i * 0.12}>
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl border border-white/[0.06] hover:border-orange-500/25 bg-white/[0.02] hover:bg-white/[0.03] transition-all duration-500"
                    >
                      <motion.div
                        className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center mb-4"
                        whileInView={{ boxShadow: "0 0 24px rgba(249,115,22,0.2)" }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.15 }}
                      >
                        <Icon className="w-6 h-6 text-orange-400" />
                      </motion.div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-orange-500/60 mb-1">
                        Paso {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-base font-semibold text-white/90 mb-1">{step.label}</h3>
                      <p className="text-xs text-white/35">{step.desc}</p>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS ═══════════ */}
        <section id="how" className="py-24 md:py-32 lg:py-40 px-5 relative">
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "linear-gradient(rgba(249,115,22,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />

          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-14 lg:mb-20">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400 mb-3 block">
                  Cómo funciona
                </span>
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-extrabold tracking-[-0.02em] leading-[1.15]">
                  3 pasos. Cero complicaciones.
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stepsData.map((s, i) => (
                <Reveal key={s.step} delay={i * 0.15}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    className="group relative text-center md:text-left p-6 sm:p-8 rounded-2xl border border-transparent hover:border-orange-500/15 hover:bg-white/[0.02] transition-all duration-500"
                  >
                    <span
                      className="text-[5rem] sm:text-[6rem] md:text-[7rem] font-black leading-none block mb-3 bg-gradient-to-b from-orange-500/20 to-transparent bg-clip-text text-transparent select-none"
                      style={{ maskImage: "linear-gradient(to bottom, white 40%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, white 40%, transparent 100%)" }}
                    >
                      {s.step}
                    </span>
                    <motion.div
                      className="h-[2px] w-16 mx-auto md:mx-0 mb-5 bg-gradient-to-r from-orange-500/50 to-transparent origin-left"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
                    />
                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-white/90">{s.title}</h3>
                    <p className="text-sm text-white/40 leading-relaxed">{s.description}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ SOCIAL PROOF ═══════════ */}
        <section className="py-24 md:py-32 lg:py-40 px-5 relative">
          <div className="absolute inset-0 bg-[#030303] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-14">
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-extrabold tracking-[-0.02em] leading-[1.15]">
                  Hecho para equipos reales
                </h2>
                <p className="mt-4 text-white/35">Diseñado en colaboración con equipos de operaciones.</p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { quote: "Por fin un sistema que entiende nuestro flujo de trabajo. No es otro CRM genérico.", name: "Carlos M.", role: "Owner — Studio" },
                { quote: "Pasamos de hojas de cálculo a tener todo organizado en una semana. El onboarding es inmediato.", name: "María R.", role: "Operations Manager" },
                { quote: "Mi equipo reporta desde el campo. Las fotos de evidencia me ahorran llamadas.", name: "David L.", role: "Project Manager" },
              ].map((t, i) => (
                <Reveal key={t.name} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="p-6 sm:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-orange-500/15 transition-all duration-500"
                  >
                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="w-1.5 h-1.5 rounded-full bg-orange-500/50" />
                      ))}
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed mb-7 italic">"{t.quote}"</p>
                    <div className="border-t border-white/[0.06] pt-4">
                      <p className="text-sm font-semibold text-white/85">{t.name}</p>
                      <p className="text-xs text-white/30 mt-0.5">{t.role}</p>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ PRICING ═══════════ */}
        <section id="pricing" className="py-24 md:py-32 lg:py-40 px-5 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_30%,rgba(249,115,22,0.04),transparent)] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-10">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-orange-400 mb-3 block">
                  Precios simples
                </span>
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-extrabold tracking-[-0.02em] leading-[1.15]">
                  Elige tu plan y empieza hoy
                </h2>
                <p className="mt-4 text-white/35">Sin contratos. Cancela cuando quieras.</p>
              </div>
            </Reveal>

            {/* Toggle */}
            <Reveal delay={0.1}>
              <div className="flex items-center justify-center gap-4 mb-14">
                <span className={`text-sm font-medium transition-colors duration-300 ${!isAnnual ? "text-white" : "text-white/30"}`}>Mensual</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative w-14 h-[30px] rounded-full transition-all duration-400 ${
                    isAnnual ? "bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]" : "bg-white/10"
                  }`}
                  aria-label="Toggle annual billing"
                >
                  <motion.div
                    className="absolute top-[3px] w-6 h-6 rounded-full bg-white shadow-md"
                    animate={{ left: isAnnual ? "calc(100% - 27px)" : "3px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className={`text-sm font-medium transition-colors duration-300 ${isAnnual ? "text-white" : "text-white/30"}`}>Anual</span>
                <AnimatePresence>
                  {isAnnual && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8, x: -8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -8 }}
                      className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full"
                    >
                      -20%
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {pricingPlans.map((plan, i) => {
                const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
                return (
                  <Reveal key={plan.plan} delay={i * 0.12}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      className={`relative flex flex-col p-6 sm:p-8 rounded-2xl transition-all duration-500 ${
                        plan.recommended
                          ? "border border-orange-500/30 bg-white/[0.03] backdrop-blur-sm shadow-[0_0_60px_-12px_rgba(249,115,22,0.2),0_24px_64px_-16px_rgba(249,115,22,0.15)] md:scale-[1.06]"
                          : "border border-white/[0.06] bg-white/[0.02] opacity-90 hover:opacity-100 hover:border-white/10"
                      }`}
                    >
                      {/* Animated glow for recommended */}
                      {plan.recommended && (
                        <motion.div
                          className="absolute -inset-[1px] rounded-2xl pointer-events-none"
                          style={{
                            background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,146,60,0.1), rgba(249,115,22,0.2))",
                            backgroundSize: "200% 200%",
                          }}
                          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        />
                      )}

                      {plan.recommended && (
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[11px] font-semibold px-5 py-1.5 rounded-full shadow-[0_8px_24px_rgba(249,115,22,0.35)]">
                          Más Popular
                        </span>
                      )}

                      <div className="relative">
                        <h3 className="text-lg font-semibold mb-1">{plan.plan}</h3>
                        {plan.recommended && (
                          <p className="text-[11px] text-orange-400/70 mb-2">Más elegido por talleres en crecimiento</p>
                        )}
                        <div className="flex items-baseline gap-1 mb-1">
                          <AnimatedPrice value={price} />
                          <span className="text-sm text-white/25">/mes</span>
                        </div>
                        {isAnnual && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-xs text-white/25 mb-5">
                            Facturado anualmente · <span className="line-through text-white/15">${plan.priceMonthly}/mes</span>
                          </motion.p>
                        )}
                        {!isAnnual && <div className="mb-5" />}

                        <ul className="space-y-3.5 mb-9 flex-1">
                          {plan.features.map((f, fi) => (
                            <motion.li
                              key={f}
                              className="flex items-start gap-2.5 text-sm text-white/45"
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3 + fi * 0.05 }}
                            >
                              <Check className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                              {f}
                            </motion.li>
                          ))}
                        </ul>

                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Button
                            onClick={() => handlePlanSelect(plan.plan)}
                            className={`w-full rounded-2xl font-medium transition-all duration-500 ${
                              plan.recommended
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-[0_8px_32px_rgba(249,115,22,0.3)] hover:shadow-[0_16px_48px_rgba(249,115,22,0.5)]"
                                : "bg-white/[0.04] text-white hover:bg-white/[0.08] border border-white/10 hover:border-white/15"
                            }`}
                          >
                            Elegir {plan.plan}
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ FINAL CTA ═══════════ */}
        <section className="py-28 md:py-36 lg:py-44 px-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#030303] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(249,115,22,0.08),transparent_70%)] pointer-events-none blur-[100px]" />

          <Reveal>
            <div className="relative max-w-3xl mx-auto text-center">
              <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3.25rem] font-extrabold leading-[1.2] tracking-[-0.02em] mb-5">
                ¿Listo para ordenar{" "}
                <span className="block sm:inline bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">tu producción?</span>
              </h2>
              <p className="text-base sm:text-lg text-white/40 mb-10 max-w-xl mx-auto leading-relaxed">
                Deja de perder tiempo con hojas de cálculo. Sign Flow organiza tu taller desde el primer día.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{ boxShadow: ["0 0 0 0 rgba(249,115,22,0)", "0 0 0 10px rgba(249,115,22,0.06)", "0 0 0 0 rgba(249,115,22,0)"] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-full"
                >
                  <Button
                    size="lg"
                    onClick={() => scrollTo("pricing")}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-full px-10 text-base font-semibold shadow-[0_12px_40px_rgba(249,115,22,0.35)] hover:shadow-[0_16px_48px_rgba(249,115,22,0.55)] transition-all duration-300"
                  >
                    Elegir Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="border-t border-white/[0.04] py-10 sm:py-12 px-5 relative" role="contentinfo">
          <div className="absolute inset-0 bg-[#020202] pointer-events-none" />
          <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <BrandLogo size={24} showText variant="iconWithText" textClassName="text-sm text-white/30" />
            </div>
            <p className="text-xs text-white/20">© {new Date().getFullYear()} Sign Flow. Todos los derechos reservados.</p>
            <nav className="flex items-center gap-6 text-xs text-white/25">
              <a href="#" className="hover:text-white/50 transition-colors duration-300">Privacidad</a>
              <a href="#" className="hover:text-white/50 transition-colors duration-300">Términos</a>
              <a href="#" className="hover:text-white/50 transition-colors duration-300">Soporte</a>
            </nav>
            <div className="flex items-center gap-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full border border-white/[0.06] flex items-center justify-center text-white/20 hover:text-orange-400 hover:border-orange-500/25 transition-all duration-300"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
