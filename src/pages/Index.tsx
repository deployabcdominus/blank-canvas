import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import brandLogoSrc from "@/assets/brand-logo.png";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowRight,
  Check,
  LogIn,
  Zap,
  Target,
  FileText,
  Building,
  TrendingUp,
  Star,
  Sparkles,
  ChevronRight,
  Factory,
  Shield,
  CheckCircle2,
  CircleDot,
  BadgeCheck,
  Camera,
  Monitor,
  Thermometer,
  Signpost,
  Wrench,
  ClipboardCheck,
  PenTool,
  WifiOff,
  ChevronDown,
  Twitter,
  Instagram,
  Linkedin,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";

/* ─── Shimmer overlay for premium hover ─── */
const ShimmerOverlay = () => (
  <div className="absolute inset-0 -z-0 overflow-hidden rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)",
        backgroundSize: "200% 100%",
        animation: "shimmer-sweep 2s ease-in-out infinite",
      }}
    />
  </div>
);

/* ─── Scroll-reveal wrapper ─── */
const Reveal = ({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
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
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="text-5xl font-extrabold inline-block tracking-tight"
    >
      ${value}
    </motion.span>
  </AnimatePresence>
);

/* ─── Section Badge ─── */
const SectionBadge = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-400/60 mb-6 px-3.5 py-1.5 rounded-full border border-orange-500/10 bg-orange-500/[0.04]">
    <Icon className="w-3.5 h-3.5" />
    {label}
  </span>
);

/* ═══════════════════════════════════════════════════════ */
/*     FLOATING DASHBOARD (HERO MOCKUP)                    */
/* ═══════════════════════════════════════════════════════ */
const FloatingDashboard = () => (
  <div className="relative w-full max-w-5xl mx-auto" style={{ perspective: "1400px" }}>
    {/* Deep orange glow behind mockup */}
    <div className="absolute -inset-32 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(249,115,22,0.08),transparent_60%)] pointer-events-none" />

    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 3 }}
      transition={{ duration: 1.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-[20px] border border-orange-500/[0.08] bg-[#0a0a0a]/90 backdrop-blur-2xl overflow-hidden"
      style={{
        boxShadow:
          "0 4px 8px rgba(0,0,0,0.3), 0 16px 40px rgba(0,0,0,0.5), 0 48px 120px -20px rgba(0,0,0,0.7), 0 0 80px -20px rgba(249,115,22,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.04]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/50" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/50" />
        </div>
        <div className="ml-4 flex-1 h-5 rounded-md bg-white/[0.025] max-w-[220px]" />
      </div>

      {/* Content */}
      <div className="p-5 grid grid-cols-4 gap-3 min-h-[260px] sm:min-h-[320px]">
        {[
          { label: "Leads activos", value: "127", trend: "+18%", accent: "text-orange-400/60" },
          { label: "Propuestas enviadas", value: "43", trend: "+24%", accent: "text-cyan-400/50" },
          { label: "En producción", value: "18", trend: "—", accent: "text-orange-400/50" },
          { label: "Completados", value: "89", trend: "+12%", accent: "text-emerald-400/50" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
            className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-3 hover:border-orange-500/10 transition-colors duration-500"
          >
            <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-medium">{kpi.label}</p>
            <p className="text-xl font-bold text-white/80 mt-1">{kpi.value}</p>
            <p className={`text-[9px] font-semibold mt-0.5 ${kpi.accent}`}>{kpi.trend}</p>
          </motion.div>
        ))}

        {/* Chart */}
        <div className="col-span-3 rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 mt-1">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Flujo de conversión</span>
            <span className="text-[9px] text-emerald-400/50 bg-emerald-500/[0.06] px-2 py-0.5 rounded-full font-bold">+34%</span>
          </div>
          <div className="flex items-end gap-[3px] h-[80px]">
            {[30, 45, 38, 62, 55, 78, 65, 85, 72, 92, 80, 95].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-sm"
                style={{ background: `linear-gradient(to top, rgba(249,115,22,0.5), rgba(249,115,22,${0.05 + i * 0.03}))` }}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: 1.2 + i * 0.06, duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="col-span-1 rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 mt-1 space-y-2">
          <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider block mb-1">Actividad</span>
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
              <a.icon className="w-3 h-3 text-zinc-600 flex-shrink-0" />
              <span className="text-[8px] text-zinc-500 truncate">{a.text}</span>
              <span className="text-[7px] text-zinc-700 ml-auto flex-shrink-0">{a.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>

    {/* Floating proposal card */}
    <motion.div
      initial={{ opacity: 0, x: -50, y: 30 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 1.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="absolute -left-4 sm:-left-10 bottom-6 sm:bottom-10 w-[200px] sm:w-[240px] rounded-2xl border border-orange-500/[0.08] bg-[#0c0c0c]/90 backdrop-blur-2xl p-4 z-20"
      style={{
        boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 32px 80px -8px rgba(0,0,0,0.7), 0 0 30px -10px rgba(249,115,22,0.06), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-md bg-white/[0.03] flex items-center justify-center">
          <FileText className="w-3 h-3 text-zinc-500" />
        </div>
        <span className="text-[10px] font-semibold text-zinc-500">Propuesta #2847</span>
      </div>
      <p className="text-lg font-bold text-white/85 mb-2">$28,500</p>
      <div className="flex gap-1.5">
        <button className="flex-1 flex items-center justify-center gap-1 text-[9px] font-semibold py-1.5 rounded-lg bg-emerald-500/8 text-emerald-400/60 border border-emerald-500/10">
          <ThumbsUp className="w-2.5 h-2.5" /> Aprobar
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 text-[9px] font-semibold py-1.5 rounded-lg bg-red-500/[0.04] text-red-400/50 border border-red-500/8">
          <ThumbsDown className="w-2.5 h-2.5" /> Rechazar
        </button>
      </div>
    </motion.div>

    {/* Floating status card */}
    <motion.div
      initial={{ opacity: 0, x: 50, y: 30 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 1.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="absolute -right-4 sm:-right-10 bottom-14 sm:bottom-18 w-[180px] sm:w-[220px] rounded-2xl border border-orange-500/[0.06] bg-[#0c0c0c]/90 backdrop-blur-2xl p-4 z-20"
      style={{
        boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 32px 80px -8px rgba(0,0,0,0.7), 0 0 30px -10px rgba(249,115,22,0.04), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400/50 animate-pulse" />
        <span className="text-[10px] font-semibold text-zinc-500">Ejecución en vivo</span>
      </div>
      {[
        { label: "Corte", pct: 100 },
        { label: "Armado", pct: 75 },
        { label: "QA", pct: 30 },
      ].map((s) => (
        <div key={s.label} className="mb-1.5">
          <div className="flex justify-between text-[8px] text-zinc-500 mb-0.5">
            <span>{s.label}</span>
            <span>{s.pct}%</span>
          </div>
          <div className="h-1 rounded-full bg-white/[0.03] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-600/60 to-orange-400/30"
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

/* ═══════════════════════════════════════════════════════ */
/*              INDUSTRIES DATA                            */
/* ═══════════════════════════════════════════════════════ */
const industries = [
  {
    icon: Monitor,
    title: "Servicios IT",
    desc: "Gestiona tickets, instalaciones de infraestructura y soporte técnico en campo.",
    example: "De Tickets → a Órdenes de Instalación",
    accent: "from-blue-500/20 to-cyan-500/10",
    borderHover: "hover:border-blue-500/20",
    iconColor: "text-blue-400/60 group-hover:text-blue-400",
  },
  {
    icon: Thermometer,
    title: "Climatización / HVAC",
    desc: "Controla mantenimientos preventivos, instalaciones y certificaciones de equipos.",
    example: "De Cotización → a Certificación de Entrega",
    accent: "from-orange-500/20 to-red-500/10",
    borderHover: "hover:border-orange-500/20",
    iconColor: "text-orange-400/60 group-hover:text-orange-400",
  },
  {
    icon: Signpost,
    title: "Señalética / Rotulación",
    desc: "Desde el diseño del arte hasta la producción e instalación del proyecto.",
    example: "De Mockup → a Foto de Instalación",
    accent: "from-purple-500/20 to-pink-500/10",
    borderHover: "hover:border-purple-500/20",
    iconColor: "text-purple-400/60 group-hover:text-purple-400",
  },
  {
    icon: Wrench,
    title: "Mantenimiento",
    desc: "Programa servicios recurrentes, asigna técnicos y documenta intervenciones.",
    example: "De Reporte → a Orden de Servicio Completada",
    accent: "from-emerald-500/20 to-teal-500/10",
    borderHover: "hover:border-emerald-500/20",
    iconColor: "text-emerald-400/60 group-hover:text-emerald-400",
  },
];

/* ═══════════════════════════════════════════════════════ */
/*              FEATURE SHOWCASE DATA                      */
/* ═══════════════════════════════════════════════════════ */
const crownFeatures = [
  {
    icon: ClipboardCheck,
    title: "Ficha Técnica Inteligente",
    desc: "Genera fichas técnicas detalladas con materiales, medidas, anotaciones en plano y asignación de equipos. Todo en un solo lugar.",
    badge: null,
  },
  {
    icon: PenTool,
    title: "Portal de Firma Digital",
    desc: "Envía propuestas profesionales con link de aprobación. Tu cliente firma digitalmente desde cualquier dispositivo con validez legal.",
    badge: "Pro",
  },
  {
    icon: WifiOff,
    title: "Modo Offline Crítico",
    desc: "Tu equipo en campo captura fotos, actualiza estados y registra avances sin conexión. Se sincroniza automáticamente al reconectar.",
    badge: "Elite",
  },
];

/* ═══════════════════════════════════════════════════════ */
/*              PRICING PLANS                              */
/* ═══════════════════════════════════════════════════════ */
const plans = [
  {
    key: "start" as const,
    name: "Start",
    priceMonthly: 29,
    priceAnnual: 23,
    features: [
      "Hasta 50 leads activos",
      "1 usuario administrador",
      "Pipeline básico de órdenes",
      "Gestión de entregas",
      "Soporte por email",
    ],
    recommended: false,
  },
  {
    key: "pro" as const,
    name: "Pro",
    priceMonthly: 79,
    priceAnnual: 63,
    features: [
      "Leads ilimitados",
      "Hasta 5 usuarios",
      "Portal de firma digital",
      "Roles y permisos por equipo",
      "Evidencia fotográfica",
      "Soporte prioritario",
    ],
    recommended: true,
  },
  {
    key: "elite" as const,
    name: "Elite",
    priceMonthly: 149,
    priceAnnual: 119,
    features: [
      "Todo lo de Pro",
      "Usuarios ilimitados",
      "Ficha técnica avanzada",
      "Modo offline",
      "API & integraciones",
      "Onboarding dedicado",
      "Soporte 24/7",
    ],
    recommended: false,
  },
];

/* ═══════════════════════════════════════════════════════ */
/*              FAQ DATA                                   */
/* ═══════════════════════════════════════════════════════ */
const faqItems = [
  {
    q: "¿Necesito conocimientos técnicos para usar Sign Flow?",
    a: "No. La plataforma está diseñada para que cualquier equipo, sin importar su nivel técnico, pueda configurar su flujo de trabajo en menos de 3 minutos. Sin código, sin complicaciones.",
  },
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí. Puedes actualizar o reducir tu plan en cualquier momento desde tu panel de configuración. Los cambios se aplican de inmediato y el cobro se prorratea automáticamente.",
  },
  {
    q: "¿Mis datos están seguros?",
    a: "Absolutamente. Usamos cifrado de extremo a extremo, autenticación segura y políticas de aislamiento de datos (RLS) a nivel de base de datos. Cada empresa solo puede ver sus propios datos.",
  },
  {
    q: "¿Funciona en dispositivos móviles?",
    a: "Sí. Sign Flow está optimizado para funcionar como una app nativa en cualquier dispositivo. Tu equipo de campo puede usarlo desde su celular o tablet sin instalar nada.",
  },
  {
    q: "¿Ofrecen periodo de prueba?",
    a: "Sí. Todos los planes incluyen un periodo de prueba gratuito. Puedes comenzar sin tarjeta de crédito y explorar todas las funciones antes de comprometerte.",
  },
  {
    q: "¿Qué pasa si necesito más de lo que ofrece el plan Elite?",
    a: "Contáctanos directamente. Ofrecemos planes Enterprise personalizados con integraciones dedicadas, SLAs garantizados y onboarding a medida para grandes organizaciones.",
  },
];

/* ═══════════════════════════════════════════════════════ */
/*                       MAIN PAGE                        */
/* ═══════════════════════════════════════════════════════ */
const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCheckout = async (tierKey: "start" | "pro" | "elite") => {
    setLoadingPlan(tierKey);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/register");
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: STRIPE_TIERS[tierKey].price_id },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PageTransition>
      <div className="noise-bg min-h-screen bg-[#050505] text-[#e4e4e7] overflow-x-hidden scroll-smooth selection:bg-orange-500/15 selection:text-white">
        <style>{`
          @keyframes shimmer-sweep {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes laser-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(249,115,22,0.2), 0 0 40px rgba(249,115,22,0.1); }
            50% { box-shadow: 0 0 30px rgba(249,115,22,0.35), 0 0 60px rgba(249,115,22,0.15); }
          }
        `}</style>

        {/* ── Background layers ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1400px] h-[900px] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.04),transparent_50%)]" />
          <div className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.02),transparent_60%)]" />
          <div className="absolute top-[60%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.015),transparent_60%)]" />
        </div>

        {/* ═══════════ HEADER ═══════════ */}
        <header
          className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
            scrolled
              ? "bg-[#050505]/85 backdrop-blur-2xl border-b border-orange-500/[0.04]"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between px-5 lg:px-8 py-4">
            <a href="/" className="flex items-center gap-1.5 py-2 min-h-[44px]" aria-label="Sign Flow - Inicio">
              <div className="flex-shrink-0 w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] md:w-[44px] md:h-[44px] overflow-hidden">
                <img src={brandLogoSrc} alt="Sign Flow" className="block w-full h-full object-contain scale-[1.15]" draggable={false} />
              </div>
              <span className="font-bold tracking-[-0.03em] text-[17px] sm:text-[19px] md:text-[21px] text-zinc-100">Sign Flow</span>
            </a>

            <nav className="hidden md:flex items-center gap-10 text-[13px] font-medium text-zinc-500">
              {[
                { label: "Industrias", id: "industries" },
                { label: "Funciones", id: "features" },
                { label: "Precios", id: "pricing" },
                { label: "FAQ", id: "faq" },
              ].map((item) => (
                <button key={item.id} onClick={() => scrollTo(item.id)} className="relative hover:text-zinc-200 transition-colors duration-300">
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] text-[13px]">
                <LogIn className="w-4 h-4 mr-1.5" />
                Ingresar
              </Button>
              <Button
                size="sm"
                onClick={() => scrollTo("pricing")}
                className="bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 rounded-full px-5 text-[13px] font-semibold shadow-[0_2px_8px_rgba(249,115,22,0.15)] transition-all duration-300 hover:shadow-[0_4px_16px_rgba(249,115,22,0.25)]"
              >
                Comienza ahora
              </Button>
            </div>
          </div>
        </header>

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative pt-36 pb-8 sm:pt-44 sm:pb-12 md:pt-52 md:pb-16 lg:pt-56 lg:pb-20 px-5">
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto mb-24 lg:mb-28">
              <motion.div
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.span
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-400/60 mb-8 px-4 py-2 rounded-full border border-orange-500/10 bg-orange-500/[0.04]"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Plataforma de gestión operativa
                </motion.span>

                <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3.2rem] lg:text-[4.2rem] font-extrabold leading-[1.04] tracking-[-0.045em] mb-8 text-white">
                  La plataforma que entiende
                  <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-orange-300 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    {" "}tu lenguaje.
                  </span>
                </h1>

                <p className="text-[15px] sm:text-lg md:text-xl font-normal text-zinc-400 leading-[1.75] max-w-2xl mx-auto mb-14">
                  Ya seas una empresa de IT, HVAC o Señalética, configuramos tu
                  flujo de trabajo en 3 minutos. Sin código, sin complicaciones.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      size="lg"
                      onClick={() => navigate("/register")}
                      className="relative overflow-hidden bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 rounded-full px-10 text-base font-semibold transition-all duration-300 group"
                      style={{ animation: "laser-glow 3s ease-in-out infinite" }}
                    >
                      <span className="relative z-10 flex items-center">
                        Empieza Gratis Ahora
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </span>
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer-sweep 1.8s ease-in-out infinite",
                        }}
                      />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => scrollTo("industries")}
                      className="rounded-full px-10 text-base font-medium border-white/[0.05] text-zinc-400 hover:text-zinc-200 hover:border-orange-500/10 bg-transparent transition-all duration-300"
                    >
                      Ver cómo funciona
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <FloatingDashboard />
          </div>
        </section>

        <div className="h-20 sm:h-28" />

        {/* ═══════════ TRUST BAR ═══════════ */}
        <Reveal>
          <section className="pt-28 pb-16 border-y border-orange-500/[0.04]">
            <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-20 gap-y-6">
              {[
                { value: "500+", label: "Negocios activos" },
                { value: "2M+", label: "Órdenes procesadas" },
                { value: "99.9%", label: "Uptime garantizado" },
                { value: "4.9★", label: "Satisfacción cliente" },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col items-center gap-1.5 p-4">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-200">{value}</span>
                  <span className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ═══════════ INDUSTRIES GRID ═══════════ */}
        <section id="industries" className="py-36 md:py-44 lg:py-52 px-5 relative">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-20">
                <SectionBadge icon={Building} label="Industrias" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold tracking-[-0.035em] leading-[1.08] lg:text-5xl text-white">
                  Tu industria, tu lenguaje,
                  <br className="hidden sm:block" /> tu flujo de trabajo
                </h2>
                <p className="mt-7 text-zinc-400 max-w-lg mx-auto text-[15px]">
                  Se adapta automáticamente a tu sector con etiquetas, estados y procesos personalizados.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {industries.map((ind, i) => {
                const Icon = ind.icon;
                return (
                  <Reveal key={ind.title} delay={i * 0.1}>
                    <motion.div
                      whileHover={{ y: -6 }}
                      className={`group relative flex flex-col p-8 rounded-2xl border border-white/[0.04] ${ind.borderHover} bg-zinc-950/50 backdrop-blur-sm transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden`}
                    >
                      <ShimmerOverlay />
                      {/* Gradient accent on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${ind.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-white/[0.06] bg-white/[0.02] group-hover:bg-white/[0.04] transition-all duration-500">
                          <Icon className={`w-5 h-5 transition-all duration-500 ${ind.iconColor}`} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 tracking-[-0.01em]">{ind.title}</h3>
                        <p className="text-[13px] text-zinc-400 leading-relaxed mb-5">{ind.desc}</p>

                        {/* Example label that appears on hover */}
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center gap-2 text-[11px] text-orange-400/70 bg-orange-500/[0.04] border border-orange-500/10 px-3 py-2 rounded-lg"
                        >
                          <ArrowRight className="w-3 h-3" />
                          {ind.example}
                        </motion.div>
                      </div>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ FEATURE SHOWCASE ═══════════ */}
        <section id="features" className="py-36 md:py-44 lg:py-52 px-5 relative">
          <div className="absolute inset-0 bg-[#030303] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_35%_at_50%_0%,rgba(249,115,22,0.025),transparent)] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-20">
                <SectionBadge icon={Zap} label="Funciones estrella" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold tracking-[-0.035em] leading-[1.08] lg:text-5xl text-white">
                  Las 3 joyas de la corona
                </h2>
                <p className="mt-7 text-zinc-400 max-w-lg mx-auto text-[15px]">
                  Funciones que transforman tu operación y te dan ventaja competitiva real.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
              {crownFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={f.title} delay={i * 0.12}>
                    <motion.div
                      whileHover={{ y: -6, borderColor: "rgba(249,115,22,0.12)" }}
                      className="group relative flex flex-col p-8 sm:p-9 rounded-2xl border border-white/[0.04] bg-zinc-950/50 backdrop-blur-sm transition-all duration-500 h-full hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]"
                    >
                      <ShimmerOverlay />
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-orange-500/[0.08] bg-orange-500/[0.03] group-hover:border-orange-500/20 group-hover:bg-orange-500/[0.06] transition-all duration-500">
                            <Icon className="w-5 h-5 text-orange-400/50 group-hover:text-orange-400/80 transition-all duration-500" />
                          </div>
                          {f.badge && (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-orange-400/70 bg-orange-500/[0.06] border border-orange-500/15 px-2.5 py-1 rounded-full">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-[17px] font-bold text-white mb-3 tracking-[-0.01em]">{f.title}</h3>
                        <p className="text-[13px] text-zinc-400 leading-[1.8] flex-1">{f.desc}</p>
                      </div>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ PRICING ═══════════ */}
        <section id="pricing" className="py-36 md:py-44 lg:py-52 px-5 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(249,115,22,0.025),transparent_60%)] pointer-events-none" />

          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-14">
                <SectionBadge icon={Zap} label="Precios" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold tracking-[-0.035em] leading-[1.08] lg:text-5xl text-white">
                  Invierte en tu crecimiento
                  <br className="hidden sm:block" /> y eficiencia
                </h2>
                <p className="mt-7 text-zinc-400 text-[15px]">
                  Sin contratos. Sin sorpresas. Cancela cuando quieras.
                </p>
              </div>
            </Reveal>

            {/* Toggle */}
            <Reveal delay={0.1}>
              <div className="flex items-center justify-center gap-4 mb-20">
                <span className={`text-sm font-medium transition-colors duration-300 ${!isAnnual ? "text-zinc-200" : "text-zinc-500"}`}>
                  Mensual
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative w-14 h-[30px] rounded-full transition-all duration-400 ${
                    isAnnual
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-[0_0_12px_rgba(249,115,22,0.15)]"
                      : "bg-zinc-800"
                  }`}
                  aria-label="Toggle annual billing"
                >
                  <motion.div
                    className="absolute top-[3px] w-6 h-6 rounded-full bg-white shadow-lg"
                    animate={{ left: isAnnual ? "calc(100% - 27px)" : "3px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className={`text-sm font-medium transition-colors duration-300 ${isAnnual ? "text-zinc-200" : "text-zinc-500"}`}>
                  Anual
                </span>
                <AnimatePresence>
                  {isAnnual && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8, x: -8 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: -8 }}
                      className="text-xs font-bold text-emerald-400/70 bg-emerald-500/[0.04] border border-emerald-500/10 px-3 py-1 rounded-full"
                    >
                      Ahorra 20%
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-start">
              {plans.map((plan, i) => {
                const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
                return (
                  <Reveal key={plan.key} delay={i * 0.1}>
                    <motion.div
                      whileHover={{ y: -6 }}
                      className={`group relative flex flex-col rounded-2xl transition-all duration-500 ${
                        plan.recommended
                          ? "border-2 border-orange-500/25 bg-[#0a0a0a] md:scale-[1.04] shadow-[0_0_40px_-10px_rgba(249,115,22,0.08)]"
                          : "border border-white/[0.04] bg-[#0a0a0a] opacity-80 hover:opacity-100"
                      }`}
                    >
                      <ShimmerOverlay />

                      {plan.recommended && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                          <span className="bg-gradient-to-b from-orange-500 to-orange-600 text-white text-[10px] font-bold px-5 py-1.5 rounded-full shadow-[0_2px_10px_rgba(249,115,22,0.25)] flex items-center gap-1.5">
                            <Star className="w-3 h-3 fill-current" />
                            Más Popular
                          </span>
                        </div>
                      )}

                      <div className="relative z-10 p-8 sm:p-9">
                        <h3 className="text-xl font-bold mb-1 tracking-[-0.01em] text-white">{plan.name}</h3>
                        {plan.recommended && (
                          <p className="text-[11px] text-orange-400/40 font-medium mb-4">Elegido por negocios en crecimiento</p>
                        )}
                        {!plan.recommended && <div className="mb-4" />}

                        <div className="flex items-baseline gap-1.5 mb-1">
                          <AnimatedPrice value={price} />
                          <span className="text-sm text-zinc-600 font-medium">/mes</span>
                        </div>
                        {isAnnual && (
                          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-[11px] text-zinc-600 mb-7">
                            Facturado anualmente · <span className="line-through text-zinc-700">${plan.priceMonthly}/mes</span>
                          </motion.p>
                        )}
                        {!isAnnual && <div className="mb-7" />}

                        <ul className="space-y-4 mb-10">
                          {plan.features.map((f, fi) => (
                            <motion.li
                              key={f}
                              className="flex items-start gap-3 text-[13px] text-zinc-400"
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.2 + fi * 0.04 }}
                            >
                              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.recommended ? "text-orange-400/60" : "text-zinc-600"}`} />
                              {f}
                            </motion.li>
                          ))}
                        </ul>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                          <Button
                            onClick={() => handleCheckout(plan.key)}
                            disabled={loadingPlan === plan.key}
                            className={`relative overflow-hidden w-full rounded-xl h-12 font-semibold text-[14px] transition-all duration-500 group/btn ${
                              plan.recommended
                                ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 shadow-[0_2px_12px_rgba(249,115,22,0.15)] hover:shadow-[0_4px_20px_rgba(249,115,22,0.25)]"
                                : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-white/[0.04] hover:border-orange-500/10"
                            }`}
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              {loadingPlan === plan.key ? "Procesando..." : `Elegir ${plan.name}`}
                              {loadingPlan !== plan.key && <ChevronRight className="w-4 h-4 ml-1" />}
                            </span>
                            <div
                              className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
                              style={{
                                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
                                backgroundSize: "200% 100%",
                                animation: "shimmer-sweep 1.8s ease-in-out infinite",
                              }}
                            />
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

        {/* ═══════════ FAQ ═══════════ */}
        <section id="faq" className="py-36 md:py-44 lg:py-52 px-5 relative">
          <div className="absolute inset-0 bg-[#030303] pointer-events-none" />

          <div className="max-w-3xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-16">
                <SectionBadge icon={Shield} label="Preguntas frecuentes" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold tracking-[-0.035em] leading-[1.08] lg:text-5xl text-white">
                  ¿Tienes dudas?
                </h2>
                <p className="mt-7 text-zinc-400 text-[15px]">
                  Aquí respondemos las preguntas más comunes.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="rounded-2xl border border-white/[0.04] bg-zinc-950/50 backdrop-blur-sm px-6 py-1 data-[state=open]:border-orange-500/10 transition-colors duration-300"
                  >
                    <AccordionTrigger className="text-[15px] font-semibold text-zinc-200 hover:text-white hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[14px] text-zinc-400 leading-[1.8] pb-5">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* ═══════════ FINAL CTA ═══════════ */}
        <section className="py-40 md:py-48 lg:py-56 px-5 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,rgba(249,115,22,0.04),transparent_55%)] blur-[40px]" />
          </div>

          <Reveal>
            <div className="relative max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-14 h-14 rounded-2xl bg-orange-500/[0.04] border border-orange-500/10 flex items-center justify-center mx-auto mb-10"
              >
                <Zap className="w-7 h-7 text-orange-400/60" />
              </motion.div>

              <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-extrabold leading-[1.1] tracking-[-0.035em] mb-7 text-white">
                ¿Listo para optimizar tu
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-orange-300 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {" "}operación y escalar
                </span>
                <br className="hidden sm:block" />
                tus resultados?
              </h2>
              <p className="text-base sm:text-lg text-zinc-400 mb-14 max-w-xl mx-auto leading-relaxed">
                Únete a cientos de negocios que ya controlan su operación de punta a punta con Sign Flow.
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                <Button
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="relative overflow-hidden bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 rounded-full px-10 h-14 text-base font-semibold transition-all duration-300 group"
                  style={{ animation: "laser-glow 3s ease-in-out infinite" }}
                >
                  <span className="relative z-10 flex items-center">
                    Empieza Gratis Ahora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer-sweep 1.8s ease-in-out infinite",
                    }}
                  />
                </Button>
              </motion.div>
              <p className="mt-7 text-[12px] text-zinc-600 flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Sin tarjeta de crédito · Configuración en 3 minutos
              </p>
            </div>
          </Reveal>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="border-t border-orange-500/[0.04] py-16 sm:py-20 px-5 relative" role="contentinfo">
          <div className="absolute inset-0 bg-[#020202] pointer-events-none" />
          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-14">
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 overflow-hidden flex-shrink-0">
                    <img src={brandLogoSrc} alt="Sign Flow" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-bold text-lg tracking-[-0.02em] text-zinc-300">Sign Flow</span>
                </div>
                <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[250px]">
                  La plataforma integral de gestión operativa para negocios de servicios y proyectos.
                </p>
              </div>
              {[
                { title: "Producto", links: ["Funciones", "Precios", "Integraciones", "Actualizaciones"] },
                { title: "Empresa", links: ["Nosotros", "Blog", "Contacto", "Carreras"] },
                { title: "Legal", links: ["Términos de Servicio", "Política de Privacidad", "Cookies", "Soporte"] },
              ].map((col) => (
                <div key={col.title}>
                  <h4 className="text-[12px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-5">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((item) => (
                      <li key={item}>
                        <a href="#" className="text-[13px] text-zinc-600 hover:text-orange-400/60 transition-colors duration-300">{item}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-white/[0.025] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[12px] text-zinc-700">© {new Date().getFullYear()} Sign Flow. Todos los derechos reservados.</p>
              <div className="flex items-center gap-3">
                {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-9 h-9 rounded-full border border-white/[0.03] flex items-center justify-center text-zinc-600 hover:text-orange-400/60 hover:border-orange-500/10 transition-all duration-300"
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
