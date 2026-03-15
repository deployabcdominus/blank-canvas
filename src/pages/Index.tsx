import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import brandLogoSrc from "@/assets/brand-logo.png";
import { pricingPlans } from "@/constants/landingPageData";
import {
  ArrowRight,
  Check,
  LogIn,
  Zap,
  Target,
  FileText,
  Wrench,
  Building,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  DollarSign,
  Star,
  Quote,
  Instagram,
  Twitter,
  Linkedin,
  Sparkles,
  ChevronRight,
  Factory,
  Receipt,
  PieChart,
  Shield,
  Layers,
  XCircle,
  CheckCircle2,
  ArrowDown,
  Activity,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Scroll-reveal wrapper ─── */
const Reveal = ({
  children,
  className = "",
  delay = 0,
}: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Animated price ─── */
const AnimatedPrice = ({ value }: { value: number }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="text-5xl font-extrabold inline-block tracking-tight"
    >
      ${value}
    </motion.span>
  </AnimatePresence>
);

/* ─── Section Badge ─── */
const SectionBadge = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-400 mb-5 px-4 py-1.5 rounded-full border border-orange-500/15 bg-orange-500/[0.05]">
    <Icon className="w-3.5 h-3.5" />
    {label}
  </span>
);

/* ─── Floating Dashboard Mockup ─── */
const FloatingDashboard = () => (
  <div className="relative w-full max-w-5xl mx-auto" style={{ perspective: "1200px" }}>
    {/* Background glow */}
    <div className="absolute -inset-20 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(249,115,22,0.1),transparent_70%)] pointer-events-none blur-3xl" />

    {/* Main dashboard */}
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 2 }}
      transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-xl overflow-hidden shadow-[0_32px_100px_-20px_rgba(0,0,0,0.8)]"
    >
      {/* Titlebar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="ml-4 flex-1 h-5 rounded-md bg-white/[0.04] max-w-[200px]" />
      </div>

      {/* Dashboard content */}
      <div className="p-5 grid grid-cols-4 gap-3 min-h-[260px] sm:min-h-[320px]">
        {/* KPI cards row */}
        {[
          { label: "Leads activos", value: "127", trend: "+18%", color: "orange" },
          { label: "Propuestas enviadas", value: "43", trend: "+24%", color: "cyan" },
          { label: "En producción", value: "18", trend: "—", color: "orange" },
          { label: "Completados", value: "89", trend: "+12%", color: "emerald" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
          >
            <p className="text-[9px] text-white/25 uppercase tracking-wider font-medium">{kpi.label}</p>
            <p className="text-xl font-bold text-white/90 mt-1">{kpi.value}</p>
            <p className={`text-[9px] font-semibold mt-0.5 ${kpi.color === "emerald" ? "text-emerald-400" : kpi.color === "cyan" ? "text-cyan-400" : "text-orange-400"}`}>{kpi.trend}</p>
          </motion.div>
        ))}

        {/* Chart area */}
        <div className="col-span-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 mt-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">Flujo de conversión</span>
            <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">+34%</span>
          </div>
          <div className="flex items-end gap-[3px] h-[80px]">
            {[30, 45, 38, 62, 55, 78, 65, 85, 72, 92, 80, 95].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-sm"
                style={{ background: `linear-gradient(to top, rgba(249,115,22,0.7), rgba(249,115,22,${0.15 + i * 0.04}))` }}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 1.2 + i * 0.06, duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </div>
        </div>

        {/* Activity sidebar */}
        <div className="col-span-1 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 mt-1 space-y-2">
          <span className="text-[9px] text-white/25 font-semibold uppercase tracking-wider block mb-1">Actividad</span>
          {[
            { icon: Target, text: "Nuevo lead", time: "2m" },
            { icon: FileText, text: "Propuesta aprobada", time: "8m" },
            { icon: Factory, text: "Orden en progreso", time: "15m" },
            { icon: CheckCircle2, text: "Entrega completada", time: "1h" },
          ].map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <a.icon className="w-3 h-3 text-orange-400/60 flex-shrink-0" />
              <span className="text-[8px] text-white/30 truncate">{a.text}</span>
              <span className="text-[7px] text-white/15 ml-auto flex-shrink-0">{a.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>

    {/* Floating proposal card */}
    <motion.div
      initial={{ opacity: 0, x: -40, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 1.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="absolute -left-4 sm:-left-8 bottom-8 sm:bottom-12 w-[200px] sm:w-[240px] rounded-2xl border border-white/[0.1] bg-[#0a0a0a]/95 backdrop-blur-xl p-4 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.9)] z-20"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-md bg-cyan-500/20 flex items-center justify-center">
          <FileText className="w-3 h-3 text-cyan-400" />
        </div>
        <span className="text-[10px] font-semibold text-white/50">Propuesta #2847</span>
      </div>
      <p className="text-lg font-bold text-white mb-2">$28,500</p>
      <div className="flex gap-1.5">
        <button className="flex-1 flex items-center justify-center gap-1 text-[9px] font-semibold py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          <ThumbsUp className="w-2.5 h-2.5" /> Aprobar
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 text-[9px] font-semibold py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/15">
          <ThumbsDown className="w-2.5 h-2.5" /> Rechazar
        </button>
      </div>
    </motion.div>

    {/* Floating status card */}
    <motion.div
      initial={{ opacity: 0, x: 40, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 1.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="absolute -right-4 sm:-right-8 bottom-16 sm:bottom-20 w-[180px] sm:w-[220px] rounded-2xl border border-white/[0.1] bg-[#0a0a0a]/95 backdrop-blur-xl p-4 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.9)] z-20"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[10px] font-semibold text-white/50">Ejecución en vivo</span>
      </div>
      {[
        { label: "Corte", pct: 100 },
        { label: "Armado", pct: 75 },
        { label: "QA", pct: 30 },
      ].map((s) => (
        <div key={s.label} className="mb-1.5">
          <div className="flex justify-between text-[8px] text-white/30 mb-0.5">
            <span>{s.label}</span>
            <span>{s.pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${s.pct}%` }}
              transition={{ delay: 2 + Math.random() * 0.3, duration: 0.8 }}
            />
          </div>
        </div>
      ))}
    </motion.div>
  </div>
);

/* ─── Bento Features ─── */
const bentoFeatures = [
  {
    icon: Target,
    title: "Captura de Leads",
    description: "Pipeline inteligente con scoring automático. Cada oportunidad clasificada, puntuada y lista para convertir.",
    span: "lg:col-span-2",
  },
  {
    icon: FileText,
    title: "Propuestas Digitales",
    description: "Cotizaciones profesionales con aprobación en un click. Historial completo por cliente y proyecto.",
    span: "",
  },
  {
    icon: Factory,
    title: "Órdenes de Ejecución",
    description: "Control total de producción: tareas, tiempos, materiales y asignación de equipos en tiempo real.",
    span: "",
  },
  {
    icon: Building,
    title: "Entregas en Campo",
    description: "Agenda equipos, supervisa avances y documenta entregas con evidencia fotográfica desde cualquier sitio.",
    span: "lg:col-span-2",
  },
  {
    icon: Receipt,
    title: "Facturación y Cobranza",
    description: "Registra pagos, controla facturas pendientes y mantén visibilidad completa de tu flujo de caja.",
    span: "",
  },
  {
    icon: PieChart,
    title: "Análisis y Reportes",
    description: "Dashboard con KPIs en tiempo real. Métricas de conversión, producción y rentabilidad por proyecto.",
    span: "",
  },
  {
    icon: Users,
    title: "Multi-equipo & Permisos",
    description: "Admin, comercial, operaciones. Cada rol ve exactamente lo que necesita. Control de acceso granular.",
    span: "lg:col-span-2",
  },
];

/* ─── Flow Steps ─── */
const flowSteps = [
  { icon: Target, label: "Lead", desc: "Captura cada oportunidad con datos completos y seguimiento automático desde el primer contacto." },
  { icon: FileText, label: "Propuesta Digital", desc: "Genera cotizaciones profesionales, envía y obtén aprobación digital al instante." },
  { icon: Factory, label: "Orden de Ejecución", desc: "Coordina la producción con órdenes detalladas, materiales y asignación de equipo." },
  { icon: CheckCircle2, label: "Finalización", desc: "Entrega en campo, evidencia fotográfica, facturación y cierre del ciclo completo." },
];

/* ─── Before vs After ─── */
const comparisonItems = [
  { before: "Leads en hojas de cálculo", after: "Pipeline visual con scoring automático" },
  { before: "Propuestas por email y WhatsApp", after: "Cotizaciones digitales con aprobación en 1 click" },
  { before: "Órdenes en libretas y grupos", after: "Gestión de producción con seguimiento en tiempo real" },
  { before: "Entregas sin documentar", after: "Evidencia fotográfica y tracking GPS" },
  { before: "Cobranza manual y desordenada", after: "Facturación integrada y flujo de caja visible" },
];

/* ─── Testimonials ─── */
const testimonials = [
  {
    quote: "Sign Flow transformó nuestra operación. Pasamos de perder 3 de cada 10 proyectos a cerrar el 85% de nuestras propuestas. El ROI fue inmediato.",
    name: "Carlos Mendoza",
    role: "Director de Operaciones",
    company: "Grupo Industrial CM",
    avatar: "CM",
    result: "+85% tasa de cierre",
  },
  {
    quote: "Mi equipo de 12 personas trabaja sincronizado por primera vez. La evidencia fotográfica eliminó las disputas con clientes y el tiempo de facturación bajó un 60%.",
    name: "María Rodríguez",
    role: "Gerente de Proyectos",
    company: "Solutions MR",
    avatar: "MR",
    result: "-60% tiempo de facturación",
  },
  {
    quote: "Antes usábamos 5 herramientas distintas. Ahora todo está en Sign Flow. El ahorro en licencias pagó la suscripción en el primer mes.",
    name: "David López",
    role: "Fundador & CEO",
    company: "DL Tech Solutions",
    avatar: "DL",
    result: "5 herramientas → 1 plataforma",
  },
];

/* ═══════════════════════════════════════════════════════ */
/*                       MAIN PAGE                        */
/* ═══════════════════════════════════════════════════════ */

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
      <div className="min-h-screen bg-[#050505] text-[#F5F5F7] overflow-x-hidden scroll-smooth selection:bg-orange-500/30 selection:text-white">
        {/* Background grid + radial glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[900px] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.045),transparent_60%)]" />
          <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(6,182,212,0.02),transparent_70%)]" />
        </div>

        {/* ═══════════ HEADER ═══════════ */}
        <header
          className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
            scrolled
              ? "bg-[#050505]/90 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.4)]"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between px-5 lg:px-8 py-4">
            <a href="/" className="flex items-center gap-1.5 py-2 min-h-[44px]" aria-label="Sign Flow - Inicio">
              <div className="flex-shrink-0 w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] md:w-[44px] md:h-[44px] overflow-hidden">
                <img src={brandLogoSrc} alt="Sign Flow" className="block w-full h-full object-contain scale-[1.15]" draggable={false} />
              </div>
              <span className="font-bold tracking-[-0.03em] text-[17px] sm:text-[19px] md:text-[21px] text-[#F5F5F7]">
                Sign Flow
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-10 text-[13px] font-medium text-white/30">
              {[
                { label: "Funciones", id: "features" },
                { label: "Flujo", id: "flow" },
                { label: "Testimonios", id: "testimonials" },
                { label: "Precios", id: "pricing" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="relative hover:text-white/80 transition-colors duration-300 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-orange-500 after:to-orange-400 hover:after:w-full after:transition-all after:duration-300"
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
                className="text-white/30 hover:text-white hover:bg-white/5 text-[13px]"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                Ingresar
              </Button>
              <Button
                size="sm"
                onClick={() => scrollTo("pricing")}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-full px-5 text-[13px] font-semibold shadow-[0_8px_24px_rgba(249,115,22,0.25)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(249,115,22,0.4)] hover:scale-[1.03]"
              >
                Comienza tu transformación
              </Button>
            </div>
          </div>
        </header>

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative pt-32 pb-8 sm:pt-40 sm:pb-12 md:pt-48 md:pb-16 lg:pt-52 lg:pb-20 px-5">
          <div className="relative max-w-7xl mx-auto">
            {/* Hero text */}
            <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-24">
              <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                <motion.span
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-400 mb-7 px-4 py-2 rounded-full border border-orange-500/20 bg-orange-500/[0.06] backdrop-blur-md"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Plataforma de gestión operativa
                </motion.span>

                <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[4.2rem] xl:text-[4.8rem] font-extrabold leading-[1.04] tracking-[-0.04em] mb-7">
                  Optimiza tu ciclo operativo{" "}
                  <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    de punta a punta.
                  </span>
                </h1>

                <p className="text-[15px] sm:text-lg md:text-xl font-normal text-white/35 leading-[1.7] max-w-2xl mx-auto mb-12">
                  La plataforma definitiva para gestionar leads, automatizar propuestas y supervisar la ejecución en tiempo real. Todo en un solo flujo, sin fricciones.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      size="lg"
                      onClick={() => scrollTo("pricing")}
                      className="relative bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-full px-10 text-base font-semibold shadow-[0_8px_32px_rgba(249,115,22,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300 hover:shadow-[0_16px_48px_rgba(249,115,22,0.5)]"
                    >
                      Comienza tu transformación
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => scrollTo("flow")}
                      className="rounded-full px-10 text-base font-medium border-white/10 text-white/40 hover:text-white hover:border-orange-500/30 hover:bg-orange-500/[0.06] bg-transparent transition-all duration-300"
                    >
                      Ver cómo funciona
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Floating Dashboard Mockup */}
            <FloatingDashboard />
          </div>
        </section>

        {/* Spacer for floating cards */}
        <div className="h-16 sm:h-20" />

        {/* ═══════════ TRUST BAR ═══════════ */}
        <Reveal>
          <section className="pt-24 pb-12 border-y border-white/[0.04]">
            <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-16 gap-y-4">
              {[
                { value: "500+", label: "Negocios activos" },
                { value: "2M+", label: "Órdenes procesadas" },
                { value: "99.9%", label: "Uptime garantizado" },
                { value: "4.9★", label: "Satisfacción cliente" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-4 group">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white/90 group-hover:text-orange-400 transition-colors duration-500">{value}</span>
                  <span className="text-[11px] font-medium text-white/20 group-hover:text-white/40 transition-colors duration-500 uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ═══════════ FEATURES — BENTO GRID ═══════════ */}
        <section id="features" className="py-28 md:py-36 lg:py-44 px-5 relative">
          <div className="max-w-6xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-20">
                <SectionBadge icon={Layers} label="Módulos" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3.2rem] font-extrabold tracking-[-0.03em] leading-[1.1]">
                  Todo lo que tu negocio necesita
                </h2>
                <p className="mt-6 text-white/25 max-w-xl mx-auto text-[15px] sm:text-base leading-relaxed">
                  Cada módulo diseñado para el flujo real de operaciones, producción y entrega de proyectos.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {bentoFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={f.title} delay={i * 0.06} className={f.span}>
                    <motion.div
                      whileHover={{ y: -6, borderColor: "rgba(249,115,22,0.35)" }}
                      className="group relative h-full p-7 sm:p-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm transition-all duration-500 hover:shadow-[0_20px_60px_-12px_rgba(249,115,22,0.1)]"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/[0.08] border border-orange-500/15 flex items-center justify-center mb-5 group-hover:shadow-[0_0_24px_rgba(249,115,22,0.2)] transition-all duration-500">
                          <Icon className="w-5 h-5 text-orange-400 transition-all duration-500" />
                        </div>
                        <h3 className="text-[16px] font-bold mb-2.5 text-white/90 tracking-[-0.01em]">{f.title}</h3>
                        <p className="text-sm leading-[1.7] text-white/30">{f.description}</p>
                      </div>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ PROCESS FLOW ═══════════ */}
        <section id="flow" className="py-28 md:py-36 lg:py-44 px-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#030303] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(249,115,22,0.03),transparent)] pointer-events-none" />

          <div className="max-w-6xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-20">
                <SectionBadge icon={Activity} label="Ciclo de negocio" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3.2rem] font-extrabold tracking-[-0.03em] leading-[1.1]">
                  Un flujo diseñado para la eficiencia
                </h2>
                <p className="mt-6 text-white/25 max-w-lg mx-auto text-[15px]">
                  Cada etapa conectada, cada paso visible. Captura → Cotización → Producción → Entrega.
                </p>
              </div>
            </Reveal>

            {/* Flow Timeline */}
            <div className="relative">
              {/* Connecting line (desktop) */}
              <div className="hidden lg:block absolute top-[100px] left-[10%] right-[10%] z-0">
                <motion.div
                  className="h-[2px] rounded-full"
                  style={{ background: "linear-gradient(90deg, rgba(249,115,22,0.6), rgba(249,115,22,0.2), rgba(249,115,22,0.6), rgba(249,115,22,0.3))" }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
                {flowSteps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <Reveal key={step.label} delay={i * 0.15}>
                      <motion.div
                        whileHover={{ y: -8 }}
                        className="flex flex-col items-center text-center p-7 rounded-2xl border border-white/[0.06] hover:border-orange-500/25 bg-white/[0.015] hover:bg-white/[0.03] transition-all duration-500 group"
                      >
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/15 mb-3">
                          Paso {String(i + 1).padStart(2, "0")}
                        </span>
                        <motion.div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border bg-orange-500/[0.08] border-orange-500/15"
                          whileInView={{ boxShadow: "0 0 32px rgba(249,115,22,0.25)" }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + i * 0.15 }}
                        >
                          <Icon className="w-7 h-7 text-orange-400" />
                        </motion.div>
                        <motion.div
                          className="w-3 h-3 rounded-full mb-4 bg-orange-500"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.8 + i * 0.15, type: "spring", stiffness: 400 }}
                        />
                        <h3 className="text-lg font-bold text-white/90 mb-2 tracking-[-0.01em]">{step.label}</h3>
                        <p className="text-[13px] text-white/25 leading-relaxed">{step.desc}</p>
                      </motion.div>
                    </Reveal>
                  );
                })}
              </div>
            </div>

            {/* ─── BEFORE vs AFTER ─── */}
            <Reveal>
              <div className="mt-24 lg:mt-32 max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.02em]">Antes vs. Después</h3>
                  <p className="text-white/20 text-sm mt-2">De procesos manuales a un sistema integrado</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* BEFORE column */}
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-white/20" />
                      </div>
                      <span className="text-sm font-bold text-white/30 uppercase tracking-wider">Antes</span>
                    </div>
                    {comparisonItems.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3 text-[13px] text-white/20 py-2 border-b border-white/[0.03] last:border-0"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10 flex-shrink-0" />
                        {item.before}
                      </motion.div>
                    ))}
                  </div>

                  {/* AFTER column */}
                  <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.03] p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-orange-400" />
                      </div>
                      <span className="text-sm font-bold text-orange-400/80 uppercase tracking-wider">Con Sign Flow</span>
                    </div>
                    {comparisonItems.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center gap-3 text-[13px] text-orange-300/50 py-2 border-b border-orange-500/[0.08] last:border-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400/60 flex-shrink-0" />
                        {item.after}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════════ TESTIMONIALS ═══════════ */}
        <section id="testimonials" className="py-28 md:py-36 lg:py-44 px-5 relative">
          <div className="max-w-6xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-20">
                <SectionBadge icon={Quote} label="Testimonios" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-extrabold tracking-[-0.03em] leading-[1.1] max-w-3xl mx-auto">
                  Lo que dicen los líderes que gestionan sus operaciones con nosotros
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.12}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="group relative flex flex-col p-7 sm:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-orange-500/15 transition-all duration-500 h-full"
                  >
                    <Quote className="w-8 h-8 text-orange-500/15 mb-5" />
                    <div className="inline-flex self-start items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-3 py-1 rounded-full mb-5">
                      <TrendingUp className="w-3 h-3" />
                      {t.result}
                    </div>
                    <p className="text-[14px] text-white/40 leading-[1.75] mb-8 flex-1">"{t.quote}"</p>
                    <div className="border-t border-white/[0.06] pt-5 flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-white/10 flex items-center justify-center text-sm font-bold text-white/70 flex-shrink-0">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-white/85">{t.name}</p>
                        <p className="text-[11px] text-white/25 mt-0.5">{t.role}</p>
                        <p className="text-[11px] text-orange-400/50 font-medium">{t.company}</p>
                      </div>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ PRICING ═══════════ */}
        <section id="pricing" className="py-28 md:py-36 lg:py-44 px-5 relative">
          <div className="absolute inset-0 bg-[#030303] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_30%,rgba(249,115,22,0.035),transparent)] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-12">
                <SectionBadge icon={Zap} label="Precios transparentes" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3.2rem] font-extrabold tracking-[-0.03em] leading-[1.1]">
                  Invierte en tu crecimiento<br className="hidden sm:block" /> y eficiencia
                </h2>
                <p className="mt-6 text-white/25 text-[15px]">Sin contratos. Sin sorpresas. Cancela cuando quieras.</p>
              </div>
            </Reveal>

            {/* Toggle */}
            <Reveal delay={0.1}>
              <div className="flex items-center justify-center gap-4 mb-16">
                <span className={`text-sm font-medium transition-colors duration-300 ${!isAnnual ? "text-white" : "text-white/25"}`}>Mensual</span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative w-14 h-[30px] rounded-full transition-all duration-400 ${
                    isAnnual ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-[0_0_24px_rgba(249,115,22,0.35)]" : "bg-white/10"
                  }`}
                  aria-label="Toggle annual billing"
                >
                  <motion.div
                    className="absolute top-[3px] w-6 h-6 rounded-full bg-white shadow-lg"
                    animate={{ left: isAnnual ? "calc(100% - 27px)" : "3px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className={`text-sm font-medium transition-colors duration-300 ${isAnnual ? "text-white" : "text-white/25"}`}>Anual</span>
                <AnimatePresence>
                  {isAnnual && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8, x: -8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -8 }}
                      className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full"
                    >
                      Ahorra 20%
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-start">
              {pricingPlans.map((plan, i) => {
                const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
                return (
                  <Reveal key={plan.plan} delay={i * 0.12}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      className={`relative flex flex-col rounded-2xl transition-all duration-500 ${
                        plan.recommended
                          ? "border-2 border-orange-500/40 bg-white/[0.03] backdrop-blur-sm shadow-[0_0_80px_-12px_rgba(249,115,22,0.25),0_32px_80px_-16px_rgba(249,115,22,0.15)] md:scale-[1.05]"
                          : "border border-white/[0.06] bg-white/[0.015] opacity-90 hover:opacity-100 hover:border-white/10"
                      }`}
                    >
                      {plan.recommended && (
                        <motion.div
                          className="absolute -inset-[2px] rounded-2xl pointer-events-none -z-10"
                          style={{
                            background: "conic-gradient(from 0deg, rgba(249,115,22,0.3), rgba(251,146,60,0.08), rgba(249,115,22,0.3), rgba(251,146,60,0.08), rgba(249,115,22,0.3))",
                          }}
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                      )}

                      {plan.recommended && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                          <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[11px] font-bold px-6 py-1.5 rounded-full shadow-[0_8px_32px_rgba(249,115,22,0.4)] flex items-center gap-1.5">
                            <Star className="w-3 h-3 fill-current" />
                            Más Popular
                          </span>
                        </div>
                      )}

                      <div className="relative p-7 sm:p-8">
                        <h3 className="text-xl font-bold mb-1 tracking-[-0.01em]">{plan.plan}</h3>
                        {plan.recommended && (
                          <p className="text-[11px] text-orange-400/60 font-medium mb-3">Elegido por negocios en crecimiento</p>
                        )}
                        {!plan.recommended && <div className="mb-3" />}

                        <div className="flex items-baseline gap-1.5 mb-1">
                          <AnimatedPrice value={price} />
                          <span className="text-sm text-white/20 font-medium">/mes</span>
                        </div>
                        {isAnnual && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-[11px] text-white/20 mb-6">
                            Facturado anualmente · <span className="line-through text-white/10">${plan.priceMonthly}/mes</span>
                          </motion.p>
                        )}
                        {!isAnnual && <div className="mb-6" />}

                        <ul className="space-y-3.5 mb-9">
                          {plan.features.map((f, fi) => (
                            <motion.li
                              key={f}
                              className="flex items-start gap-3 text-[13px] text-white/40"
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.3 + fi * 0.05 }}
                            >
                              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.recommended ? "text-orange-400" : "text-white/20"}`} />
                              {f}
                            </motion.li>
                          ))}
                        </ul>

                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Button
                            onClick={() => handlePlanSelect(plan.plan)}
                            className={`w-full rounded-xl h-12 font-semibold text-[14px] transition-all duration-500 ${
                              plan.recommended
                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-[0_8px_32px_rgba(249,115,22,0.3)] hover:shadow-[0_16px_48px_rgba(249,115,22,0.5)]"
                                : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08] border border-white/10 hover:border-white/15"
                            }`}
                          >
                            Elegir {plan.plan}
                            <ChevronRight className="w-4 h-4 ml-1" />
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
        <section className="py-32 md:py-40 lg:py-48 px-5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse,rgba(249,115,22,0.08),transparent_65%)] blur-[80px]" />
          </div>

          <Reveal>
            <div className="relative max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-8"
              >
                <Zap className="w-8 h-8 text-orange-400" />
              </motion.div>

              <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3.2rem] font-extrabold leading-[1.12] tracking-[-0.03em] mb-6">
                ¿Listo para optimizar tu<br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  producción y aumentar
                </span>
                <br className="hidden sm:block" />
                tus beneficios?
              </h2>
              <p className="text-base sm:text-lg text-white/30 mb-12 max-w-xl mx-auto leading-relaxed">
                Únete a cientos de negocios que ya controlan su operación de punta a punta con Sign Flow.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(249,115,22,0)",
                      "0 0 0 12px rgba(249,115,22,0.06)",
                      "0 0 0 0 rgba(249,115,22,0)",
                    ],
                  }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-full"
                >
                  <Button
                    size="lg"
                    onClick={() => scrollTo("pricing")}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 rounded-full px-10 h-14 text-base font-semibold shadow-[0_12px_48px_rgba(249,115,22,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_16px_56px_rgba(249,115,22,0.55)] transition-all duration-300"
                  >
                    Comienza tu transformación
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </div>
              <p className="mt-6 text-[12px] text-white/15 flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Sin tarjeta de crédito · Configuración en 5 minutos
              </p>
            </div>
          </Reveal>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="border-t border-white/[0.04] py-14 sm:py-16 px-5 relative" role="contentinfo">
          <div className="absolute inset-0 bg-[#020202] pointer-events-none" />
          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 overflow-hidden flex-shrink-0">
                    <img src={brandLogoSrc} alt="Sign Flow" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-bold text-lg tracking-[-0.02em] text-white/80">Sign Flow</span>
                </div>
                <p className="text-[13px] text-white/20 leading-relaxed max-w-[250px]">
                  La plataforma integral de gestión operativa para negocios de servicios y proyectos.
                </p>
              </div>
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-[0.15em] text-white/30 mb-4">Producto</h4>
                <ul className="space-y-2.5">
                  {["Funciones", "Precios", "Integraciones", "Actualizaciones"].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-[13px] text-white/20 hover:text-white/50 transition-colors duration-300">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-[0.15em] text-white/30 mb-4">Empresa</h4>
                <ul className="space-y-2.5">
                  {["Nosotros", "Blog", "Contacto", "Carreras"].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-[13px] text-white/20 hover:text-white/50 transition-colors duration-300">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-[0.15em] text-white/30 mb-4">Legal</h4>
                <ul className="space-y-2.5">
                  {["Privacidad", "Términos", "Cookies", "Soporte"].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-[13px] text-white/20 hover:text-white/50 transition-colors duration-300">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[12px] text-white/15">© {new Date().getFullYear()} Sign Flow. Todos los derechos reservados.</p>
              <div className="flex items-center gap-3">
                {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full border border-white/[0.06] flex items-center justify-center text-white/15 hover:text-orange-400 hover:border-orange-500/25 hover:bg-orange-500/[0.06] transition-all duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
