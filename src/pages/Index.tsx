import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import brandLogoSrc from "@/assets/brand-logo.png";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  MapPin,
  Users,
  Activity,
  BarChart3 } from
"lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger } from
"@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";

/* ─── Shimmer overlay for premium hover ─── */
const ShimmerOverlay = () =>
<div className="absolute inset-0 -z-0 overflow-hidden rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
    <div
    className="absolute inset-0"
    style={{
      background:
      "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)",
      backgroundSize: "200% 100%",
      animation: "shimmer-sweep 2s ease-in-out infinite"
    }} />
  
  </div>;


/* ─── Scroll-reveal wrapper ─── */
const Reveal = ({
  children,
  className = "",
  delay = 0




}: {children: React.ReactNode;className?: string;delay?: number;}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      
      {children}
    </motion.div>);

};

/* ─── Animated price ─── */
const AnimatedPrice = ({ value }: {value: number;}) =>
<AnimatePresence mode="wait">
    <motion.span
    key={value}
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -14 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="text-5xl font-extrabold inline-block tracking-tight">
    
      ${value}
    </motion.span>
  </AnimatePresence>;


/* ─── Section Badge (Violet) ─── */
const SectionBadge = ({ icon: Icon, label }: {icon: any;label: string;}) =>
<span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-400/70 mb-6 px-3.5 py-1.5 rounded-full border border-purple-500/15 bg-purple-500/[0.06]">
    <Icon className="w-3.5 h-3.5" />
    {label}
  </span>;


/* ═══════════════════════════════════════════════════════ */
/*     MACBOOK PRO MOCKUP (HERO)                           */
/* ═══════════════════════════════════════════════════════ */
const MacBookMockup = () =>
<div className="relative w-full max-w-5xl mx-auto" style={{ perspective: "1600px" }}>
    {/* Deep violet glow behind mockup */}
    <div className="absolute -inset-40 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(124,58,237,0.12),transparent_60%)] pointer-events-none" />

    <motion.div
    initial={{ opacity: 0, y: 70, rotateX: 12 }}
    animate={{ opacity: 1, y: 0, rotateX: 4 }}
    transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="relative">
    
      {/* MacBook Lid / Screen */}
      <div
      className="relative rounded-t-[16px] border border-white/[0.08] bg-zinc-900/80 overflow-hidden"
      style={{
        boxShadow:
        "0 4px 8px rgba(0,0,0,0.4), 0 20px 50px rgba(0,0,0,0.6), 0 60px 140px -20px rgba(0,0,0,0.8), 0 0 100px -30px rgba(124,58,237,0.12), inset 0 1px 0 rgba(255,255,255,0.05)",
        aspectRatio: "16/9"
      }}>
      
        {/* Screen bezel */}
        <div className="absolute inset-[6px] sm:inset-[10px] rounded-[8px] overflow-hidden bg-zinc-950">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900/90 border-b border-white/[0.04]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/60" />
            </div>
            <div className="ml-3 flex-1 h-5 rounded-md bg-white/[0.03] max-w-[200px] flex items-center px-3">
              <span className="text-[8px] text-zinc-600 font-medium">app.signflow.io/dashboard</span>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-3 sm:p-4 flex gap-3 h-[calc(100%-36px)]">
            {/* Sidebar mini */}
            <div className="hidden sm:flex flex-col w-[120px] flex-shrink-0 bg-white/[0.015] rounded-lg border border-white/[0.04] p-2.5 gap-1.5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center">
                  <Zap className="w-3 h-3 text-violet-400" />
                </div>
                <span className="text-[8px] font-bold text-zinc-300">SignFlow</span>
              </div>
              {["Dashboard", "Órdenes", "Técnicos", "Clientes", "Mapa"].map((item, i) =>
            <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[7px] font-medium ${i === 0 ? "bg-violet-500/10 text-violet-300 border border-violet-500/15" : "text-zinc-600"}`}>
                  {[BarChart3, ClipboardCheck, Users, Building, MapPin][i] && (() => {
                const Icon = [BarChart3, ClipboardCheck, Users, Building, MapPin][i];
                return <Icon className="w-2.5 h-2.5 flex-shrink-0" />;
              })()}
                  {item}
                </div>
            )}
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col gap-2.5 overflow-hidden">
              {/* KPI row */}
              <div className="grid grid-cols-4 gap-2">
                {[
              { label: "Órdenes activas", value: "42", trend: "+12%", color: "text-violet-400", badge: null },
              { label: "Técnicos en campo", value: "18", trend: "En servicio", color: "text-emerald-400", badge: null },
              { label: "SLA Crítico", value: "3", trend: "Urgente", color: "text-orange-400", badge: "bg-orange-500/15 border-orange-500/20 text-orange-400" },
              { label: "Ingresos mes", value: "$184K", trend: "+23%", color: "text-cyan-400", badge: null }].
              map((kpi, i) =>
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.08, duration: 0.4 }}
                className={`rounded-lg border p-2.5 transition-colors ${kpi.badge ? `${kpi.badge}` : "border-white/[0.04] bg-white/[0.015] hover:border-violet-500/12"}`}>
                
                    <p className="text-[7px] text-zinc-600 uppercase tracking-wider font-medium">{kpi.label}</p>
                    <p className="text-base sm:text-lg font-bold text-white/85 mt-0.5 leading-none">{kpi.value}</p>
                    <p className={`text-[7px] font-semibold mt-0.5 ${kpi.color} opacity-60`}>{kpi.trend}</p>
                  </motion.div>
              )}
              </div>

              {/* Charts row */}
              <div className="flex-1 grid grid-cols-3 gap-2 min-h-0">
                {/* Bar chart — Órdenes de trabajo */}
                <div className="col-span-2 rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider">Órdenes de trabajo</span>
                    <span className="text-[7px] text-emerald-400/60 bg-emerald-500/[0.06] px-1.5 py-0.5 rounded font-bold">+34%</span>
                  </div>
                  <div className="flex-1 flex items-end gap-[3px]">
                    {[28, 45, 35, 62, 50, 78, 60, 88, 70, 95, 82, 100].map((h, i) =>
                  <motion.div
                    key={i}
                    className="flex-1 rounded-sm"
                    style={{
                      background: `linear-gradient(to top, rgba(124,58,237,0.7), rgba(168,85,247,${0.08 + i * 0.025}))`
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: 1.2 + i * 0.05, duration: 0.5, ease: "easeOut" }} />

                  )}
                  </div>
                </div>

                {/* Technician list */}
                <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] p-3 flex flex-col">
                  <span className="text-[8px] text-zinc-500 font-semibold uppercase tracking-wider mb-2">Técnicos activos</span>
                  <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                    {[
                  { name: "C. López", status: "En ruta", color: "bg-emerald-400" },
                  { name: "M. García", status: "En sitio", color: "bg-violet-400" },
                  { name: "R. Torres", status: "SLA ⚠", color: "bg-orange-400" },
                  { name: "A. Méndez", status: "Libre", color: "bg-zinc-500" }].
                  map((tech, i) =>
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + i * 0.08 }}
                    className="flex items-center gap-2 px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.03]">
                    
                        <div className={`w-1.5 h-1.5 rounded-full ${tech.color} flex-shrink-0`} />
                        <span className="text-[7px] text-zinc-400 font-medium truncate">{tech.name}</span>
                        <span className="text-[6px] text-zinc-600 ml-auto flex-shrink-0">{tech.status}</span>
                      </motion.div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Camera notch */}
        <div className="absolute top-[1px] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-800 border border-zinc-700/30 z-10" />
      </div>

      {/* MacBook Base / Hinge */}
      <div className="relative">
        <div className="w-[103%] -ml-[1.5%] h-[10px] bg-gradient-to-b from-zinc-700/40 to-zinc-800/60 rounded-b-[4px]" />
        <div className="w-[70%] mx-auto h-[4px] bg-zinc-700/20 rounded-b-xl" />
      </div>
    </motion.div>

    {/* Reflection below MacBook */}
    <div
    className="w-[85%] mx-auto h-20 mt-2 opacity-20"
    style={{
      background: "linear-gradient(to bottom, rgba(124,58,237,0.08), transparent 80%)",
      filter: "blur(12px)",
      transform: "scaleY(-0.5)"
    }} />
  
  </div>;


/* ═══════════════════════════════════════════════════════ */
/*     TRUSTED BY LOGOS                                    */
/* ═══════════════════════════════════════════════════════ */
const trustedLogos = [
{ name: "TechServ IT", icon: Monitor },
{ name: "AirControl HVAC", icon: Thermometer },
{ name: "VisualSign Co.", icon: Signpost },
{ name: "BuildPro", icon: Building },
{ name: "MaintainX", icon: Wrench }];


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
  borderHover: "hover:border-violet-500/25",
  iconColor: "text-blue-400/60 group-hover:text-blue-400"
},
{
  icon: Thermometer,
  title: "Climatización / HVAC",
  desc: "Controla mantenimientos preventivos, instalaciones y certificaciones de equipos.",
  example: "De Cotización → a Certificación de Entrega",
  accent: "from-orange-500/20 to-red-500/10",
  borderHover: "hover:border-violet-500/25",
  iconColor: "text-orange-400/60 group-hover:text-orange-400"
},
{
  icon: Signpost,
  title: "Señalética / Rotulación",
  desc: "Desde el diseño del arte hasta la producción e instalación del proyecto.",
  example: "De Mockup → a Foto de Instalación",
  accent: "from-purple-500/20 to-pink-500/10",
  borderHover: "hover:border-violet-500/25",
  iconColor: "text-purple-400/60 group-hover:text-purple-400"
},
{
  icon: Wrench,
  title: "Mantenimiento",
  desc: "Programa servicios recurrentes, asigna técnicos y documenta intervenciones.",
  example: "De Reporte → a Orden de Servicio Completada",
  accent: "from-emerald-500/20 to-teal-500/10",
  borderHover: "hover:border-violet-500/25",
  iconColor: "text-emerald-400/60 group-hover:text-emerald-400"
}];


/* ═══════════════════════════════════════════════════════ */
/*              FEATURE SHOWCASE DATA                      */
/* ═══════════════════════════════════════════════════════ */
const crownFeatures = [
{
  icon: ClipboardCheck,
  title: "Ficha Técnica Inteligente",
  desc: "Genera fichas técnicas detalladas con materiales, medidas, anotaciones en plano y asignación de equipos. Todo en un solo lugar.",
  badge: null
},
{
  icon: PenTool,
  title: "Portal de Firma Digital",
  desc: "Envía propuestas profesionales con link de aprobación. Tu cliente firma digitalmente desde cualquier dispositivo con validez legal.",
  badge: "Pro"
},
{
  icon: WifiOff,
  title: "Modo Offline Crítico",
  desc: "Tu equipo en campo captura fotos, actualiza estados y registra avances sin conexión. Se sincroniza automáticamente al reconectar.",
  badge: "Elite"
}];


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
  "Soporte por email"],

  recommended: false
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
  "Soporte prioritario"],

  recommended: true
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
  "Soporte 24/7"],

  recommended: false
}];


/* ═══════════════════════════════════════════════════════ */
/*              FAQ DATA                                   */
/* ═══════════════════════════════════════════════════════ */
const faqItems = [
{
  q: "¿Necesito conocimientos técnicos para usar Sign Flow?",
  a: "No. La plataforma está diseñada para que cualquier equipo, sin importar su nivel técnico, pueda configurar su flujo de trabajo en menos de 3 minutos. Sin código, sin complicaciones."
},
{
  q: "¿Puedo cambiar de plan en cualquier momento?",
  a: "Sí. Puedes actualizar o reducir tu plan en cualquier momento desde tu panel de configuración. Los cambios se aplican de inmediato y el cobro se prorratea automáticamente."
},
{
  q: "¿Mis datos están seguros?",
  a: "Absolutamente. Usamos cifrado de extremo a extremo, autenticación segura y políticas de aislamiento de datos (RLS) a nivel de base de datos. Cada empresa solo puede ver sus propios datos."
},
{
  q: "¿Funciona en dispositivos móviles?",
  a: "Sí. Sign Flow está optimizado para funcionar como una app nativa en cualquier dispositivo. Tu equipo de campo puede usarlo desde su celular o tablet sin instalar nada."
},
{
  q: "¿Ofrecen periodo de prueba?",
  a: "Sí. Todos los planes incluyen un periodo de prueba gratuito. Puedes comenzar sin tarjeta de crédito y explorar todas las funciones antes de comprometerte."
},
{
  q: "¿Qué pasa si necesito más de lo que ofrece el plan Elite?",
  a: "Contáctanos directamente. Ofrecemos planes Enterprise personalizados con integraciones dedicadas, SLAs garantizados y onboarding a medida para grandes organizaciones."
}];


/* ═══════════════════════════════════════════════════════ */
/*                       MAIN PAGE                        */
/* ═══════════════════════════════════════════════════════ */
const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
        navigate(`/register?plan=${tierKey}`);
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: STRIPE_TIERS[tierKey].price_id }
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
      <div className="noise-bg min-h-screen bg-zinc-950 text-zinc-200 overflow-x-hidden scroll-smooth selection:bg-purple-500/20 selection:text-white">
        <style>{`
          @keyframes shimmer-sweep {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes neon-pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.15), 0 0 80px rgba(139,92,246,0.05); }
            50% { box-shadow: 0 0 30px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.25), 0 0 100px rgba(139,92,246,0.08); }
          }
          @keyframes violet-glow-card {
            0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.06), 0 0 40px rgba(139,92,246,0.03); }
            50% { box-shadow: 0 0 30px rgba(139,92,246,0.12), 0 0 60px rgba(139,92,246,0.06); }
          }
        `}</style>

        {/* ── Background layers — 3-blob lighting system ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {/* Subtle grid texture for depth */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "64px 64px"
            }} />
          
          {/* Blob 1 — Electric Violet — top-left */}
          <div
            className="absolute -top-[25%] -left-[15%] w-[1000px] h-[1000px] opacity-[0.18]"
            style={{
              background: "radial-gradient(ellipse at center, #7c3aed, transparent 55%)",
              filter: "blur(180px)"
            }} />
          
          {/* Blob 2 — Fuchsia Neon — bottom-right */}
          <div
            className="absolute -bottom-[25%] -right-[15%] w-[900px] h-[900px] opacity-[0.18]"
            style={{
              background: "radial-gradient(ellipse at center, #d946ef, transparent 55%)",
              filter: "blur(180px)"
            }} />
          
          {/* Blob 3 — Orange Laser (very subtle) — center behind mockup */}
          <div
            className="absolute top-[35%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] opacity-[0.06]"
            style={{
              background: "radial-gradient(ellipse at center, #f97316, transparent 55%)",
              filter: "blur(180px)"
            }} />
          
        </div>

        {/* ═══════════ HEADER — Floating Glass Navbar ═══════════ */}
        <header
          className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ?
          "bg-zinc-950/30 backdrop-blur-2xl border-b border-white/[0.05]" :
          "bg-transparent"}`
          }>
          
          <div className="max-w-7xl mx-auto flex items-center justify-between px-5 lg:px-8 py-3">
            <a href="/" className="flex items-center gap-1.5 py-2 min-h-[44px]" aria-label="SignFlow - Inicio">
              <div className="flex-shrink-0 w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] md:w-[44px] md:h-[44px] overflow-hidden">
                <img src={brandLogoSrc} alt="SignFlow" className="block w-full h-full object-contain scale-[1.15]" draggable={false} />
              </div>
              <span className="font-bold tracking-[-0.03em] text-[17px] sm:text-[19px] md:text-[21px] text-zinc-100">SignFlow</span>
            </a>

            <nav className="hidden md:flex items-center gap-10 text-[13px] font-medium text-zinc-500">
              {[
              { label: "Industrias", id: "industries" },
              { label: "Precios", id: "pricing" },
              { label: "Demo", id: "features" }].
              map((item) =>
              <button key={item.id} onClick={() => scrollTo(item.id)} className="relative hover:text-zinc-200 transition-colors duration-300">
                  {item.label}
                </button>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {user ?
              <Button
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-full px-5 text-[13px] font-semibold shadow-[0_2px_16px_rgba(139,92,246,0.3)] transition-all duration-300 hover:shadow-[0_4px_24px_rgba(139,92,246,0.4)]">
                
                  Ir al Dashboard
                </Button> :

              <>
                  <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] text-[13px] border border-white/[0.06] rounded-full px-5">
                  
                    Login
                  </Button>
                  <Button
                  size="sm"
                  onClick={() => scrollTo("pricing")}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 rounded-full px-5 text-[13px] font-semibold shadow-[0_2px_16px_rgba(139,92,246,0.3)] transition-all duration-300 hover:shadow-[0_4px_24px_rgba(139,92,246,0.4)]">
                  
                    Prueba Gratis
                  </Button>
                </>
              }
            </div>
          </div>
        </header>

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative pt-36 pb-8 sm:pt-44 sm:pb-12 md:pt-52 md:pb-16 lg:pt-56 lg:pb-20 px-5">
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto mb-20 lg:mb-24">
              <motion.div
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
                
                <motion.span
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-purple-400/70 mb-8 px-4 py-2 rounded-full border border-purple-500/15 bg-purple-500/[0.06]"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}>
                  
                  <Sparkles className="w-3.5 h-3.5" />
                  Gestión multi-industria
                </motion.span>

                <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3.4rem] lg:text-[4rem] xl:text-6xl font-black leading-[1.02] tracking-tighter mb-8">
                  <span className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                    La plataforma para líderes
                  </span>
                  <br />
                  <span className="bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
                    de industria.
                  </span>
                </h1>

                <p className="text-[15px] sm:text-lg md:text-xl font-normal text-zinc-400 leading-[1.75] max-w-2xl mx-auto mb-14">
                  Gestión de IT, HVAC y Señalética en una sola interfaz inteligente. Personalización total, eficiencia absoluta.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      size="lg"
                      onClick={() => scrollTo("pricing")}
                      className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 rounded-full px-10 h-14 text-base font-semibold transition-all duration-300 group shadow-[0_4px_30px_rgba(139,92,246,0.35)] hover:shadow-[0_6px_50px_rgba(139,92,246,0.6)]">
                      
                      <span className="relative z-10 flex items-center">
                        Empezar Prueba Pro
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </span>
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer-sweep 1.8s ease-in-out infinite"
                        }} />
                      
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => scrollTo("industries")}
                      className="rounded-full px-10 h-14 text-base font-medium border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-purple-500/15 bg-transparent transition-all duration-300">
                      
                      Ver cómo funciona
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <MacBookMockup />

            {/* ── Trusted By ── */}
            <Reveal delay={0.2}>
              <div className="mt-20 sm:mt-28">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-600 mb-8">
                  Empresas que confían en SignFlow
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-40">
                  {trustedLogos.map((logo) => {
                    const Icon = logo.icon;
                    return (
                      <div key={logo.name} className="flex items-center gap-2 text-zinc-500">
                        <Icon className="w-4 h-4" />
                        <span className="text-[13px] font-semibold tracking-tight">{logo.name}</span>
                      </div>);

                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <div className="h-12 sm:h-20" />

        {/* ═══════════ INDUSTRIES GRID ═══════════ */}
        <section id="industries" className="py-36 md:py-44 lg:py-52 px-5 relative">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center mb-20">
                <SectionBadge icon={Building} label="Industrias" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold tracking-[-0.035em] leading-[1.08] lg:text-5xl">
                  <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                    Tu industria, tu lenguaje,
                  </span>
                  <br className="hidden sm:block" />
                  <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                    tu flujo de trabajo
                  </span>
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
                      className={`group relative flex flex-col p-8 rounded-3xl border border-white/[0.08] ${ind.borderHover} bg-white/[0.03] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden`}>
                      
                      <ShimmerOverlay />
                      {/* Gradient accent on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${ind.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                      <div className="relative z-10">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-white/[0.08] bg-white/[0.03] group-hover:bg-white/[0.06] transition-all duration-500">
                          <Icon className={`w-5 h-5 transition-all duration-500 ${ind.iconColor}`} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 tracking-[-0.01em]">{ind.title}</h3>
                        <p className="text-[13px] text-zinc-400 leading-relaxed mb-5">{ind.desc}</p>

                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                          className="flex items-center gap-2 text-[11px] text-purple-400/70 bg-purple-500/[0.06] border border-purple-500/12 px-3 py-2 rounded-lg">
                          
                          <ArrowRight className="w-3 h-3" />
                          {ind.example}
                        </motion.div>
                      </div>
                    </motion.div>
                  </Reveal>);

              })}
            </div>
          </div>
        </section>

        {/* ═══════════ FEATURE SHOWCASE ═══════════ */}
        <section id="features" className="py-36 md:py-44 lg:py-52 px-5 relative">
          <div className="absolute inset-0 bg-zinc-950/50 pointer-events-none" />

          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-20">
                <SectionBadge icon={Zap} label="Funciones estrella" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold tracking-[-0.035em] leading-[1.08] lg:text-5xl">
                  <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                    Las 3 joyas de la corona
                  </span>
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
                      whileHover={{ y: -6, borderColor: "rgba(139,92,246,0.25)" }}
                      className="group relative flex flex-col p-8 sm:p-9 rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl transition-all duration-500 h-full hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
                      
                      <ShimmerOverlay />
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-purple-500/[0.12] bg-purple-500/[0.05] group-hover:border-purple-500/25 group-hover:bg-purple-500/[0.08] transition-all duration-500">
                            <Icon className="w-5 h-5 text-purple-400/50 group-hover:text-purple-400/80 transition-all duration-500" />
                          </div>
                          {f.badge &&
                          <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400/70 bg-purple-500/[0.08] border border-purple-500/20 px-2.5 py-1 rounded-full">
                              {f.badge}
                            </span>
                          }
                        </div>
                        <h3 className="text-[17px] font-bold text-white mb-3 tracking-[-0.01em]">{f.title}</h3>
                        <p className="text-[13px] text-zinc-400 leading-[1.8] flex-1">{f.desc}</p>
                      </div>
                    </motion.div>
                  </Reveal>);

              })}
            </div>
          </div>
        </section>

        {/* ═══════════ PRICING ═══════════ */}
        <section id="pricing" className="py-36 md:py-44 lg:py-52 px-5 relative">
          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-14">
                <SectionBadge icon={Zap} label="Precios" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold tracking-[-0.035em] leading-[1.08] lg:text-5xl">
                  <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                    Invierte en tu crecimiento
                  </span>
                  <br className="hidden sm:block" />
                  <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                    y eficiencia
                  </span>
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
                  isAnnual ?
                  "bg-gradient-to-r from-violet-500 to-purple-600 shadow-[0_0_12px_rgba(139,92,246,0.2)]" :
                  "bg-zinc-800"}`
                  }
                  aria-label="Toggle annual billing">
                  
                  <motion.div
                    className="absolute top-[3px] w-6 h-6 rounded-full bg-white shadow-lg"
                    animate={{ left: isAnnual ? "calc(100% - 27px)" : "3px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                  
                </button>
                <span className={`text-sm font-medium transition-colors duration-300 ${isAnnual ? "text-zinc-200" : "text-zinc-500"}`}>
                  Anual
                </span>
                <AnimatePresence>
                  {isAnnual &&
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8, x: -8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -8 }}
                    className="text-xs font-bold text-emerald-400/70 bg-emerald-500/[0.06] border border-emerald-500/12 px-3 py-1 rounded-full">
                    
                      Ahorra 20%
                    </motion.span>
                  }
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
                      className={`group relative flex flex-col rounded-3xl transition-all duration-500 ${
                      plan.recommended ?
                      "border-2 border-purple-500/30 bg-white/[0.04] backdrop-blur-2xl md:scale-[1.04]" :
                      "border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl opacity-80 hover:opacity-100"}`
                      }
                      style={plan.recommended ? { animation: "violet-glow-card 4s ease-in-out infinite" } : {}}>
                      
                      <ShimmerOverlay />

                      {plan.recommended &&
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                          <span className="bg-gradient-to-b from-violet-500 to-purple-600 text-white text-[10px] font-bold px-5 py-1.5 rounded-full shadow-[0_2px_16px_rgba(139,92,246,0.3)] flex items-center gap-1.5">
                            <Star className="w-3 h-3 fill-current" />
                            Más Popular
                          </span>
                        </div>
                      }

                      <div className="relative z-10 p-8 sm:p-9">
                        <h3 className="text-xl font-bold mb-1 tracking-[-0.01em] text-white">{plan.name}</h3>
                        {plan.recommended &&
                        <p className="text-[11px] text-purple-400/50 font-medium mb-4">Elegido por negocios en crecimiento</p>
                        }
                        {!plan.recommended && <div className="mb-4" />}

                        <div className="flex items-baseline gap-1.5 mb-1">
                          <AnimatedPrice value={price} />
                          <span className="text-sm text-zinc-600 font-medium">/mes</span>
                        </div>
                        {isAnnual &&
                        <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-[11px] text-zinc-600 mb-7">
                            Facturado anualmente · <span className="line-through text-zinc-700">${plan.priceMonthly}/mes</span>
                          </motion.p>
                        }
                        {!isAnnual && <div className="mb-7" />}

                        <ul className="space-y-4 mb-10">
                          {plan.features.map((f, fi) =>
                          <motion.li
                            key={f}
                            className="flex items-start gap-3 text-[13px] text-zinc-400"
                            initial={{ opacity: 0, x: -8 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + fi * 0.04 }}>
                            
                              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.recommended ? "text-purple-400/60" : "text-zinc-600"}`} />
                              {f}
                            </motion.li>
                          )}
                        </ul>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                          <Button
                            onClick={() => handleCheckout(plan.key)}
                            disabled={loadingPlan === plan.key}
                            className={`relative overflow-hidden w-full rounded-xl h-12 font-semibold text-[14px] transition-all duration-500 group/btn ${
                            plan.recommended ?
                            "bg-violet-600 text-white hover:bg-violet-700 shadow-[0_2px_16px_rgba(139,92,246,0.2)] hover:shadow-[0_4px_24px_rgba(139,92,246,0.3)]" :
                            "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-white/[0.06] hover:border-purple-500/15"}`
                            }>
                            
                            <span className="relative z-10 flex items-center justify-center">
                              {loadingPlan === plan.key ? "Procesando..." : `Elegir ${plan.name}`}
                              {loadingPlan !== plan.key && <ChevronRight className="w-4 h-4 ml-1" />}
                            </span>
                            <div
                              className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
                              style={{
                                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)",
                                backgroundSize: "200% 100%",
                                animation: "shimmer-sweep 1.8s ease-in-out infinite"
                              }} />
                            
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </Reveal>);

              })}
            </div>
          </div>
        </section>

        {/* ═══════════ FAQ ═══════════ */}
        <section id="faq" className="py-36 md:py-44 lg:py-52 px-5 relative">
          <div className="max-w-3xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-16">
                <SectionBadge icon={Shield} label="Preguntas frecuentes" />
                <h2 className="text-[1.75rem] sm:text-[2.25rem] font-extrabold tracking-[-0.035em] leading-[1.08] lg:text-5xl">
                  <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                    ¿Tienes dudas?
                  </span>
                </h2>
                <p className="mt-7 text-zinc-400 text-[15px]">
                  Aquí respondemos las preguntas más comunes.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <Accordion type="single" collapsible className="space-y-3">
                {faqItems.map((item, i) =>
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl px-6 py-1 data-[state=open]:border-purple-500/15 transition-colors duration-300">
                  
                    <AccordionTrigger className="text-[15px] font-semibold text-zinc-200 hover:text-white hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-[14px] text-zinc-400 leading-[1.8] pb-5">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* ═══════════ FINAL CTA ═══════════ */}
        <section className="py-40 md:py-48 lg:py-56 px-5 relative overflow-hidden">
          <Reveal>
            <div className="relative max-w-3xl mx-auto text-center rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-12 sm:p-16">
              {/* Inner violet glow */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse, rgba(139,92,246,0.06), transparent 60%)",
                  filter: "blur(60px)"
                }} />
              

              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-14 h-14 rounded-2xl bg-purple-500/[0.08] border border-purple-500/15 flex items-center justify-center mx-auto mb-10 relative z-10">
                
                <Zap className="w-7 h-7 text-purple-400/60" />
              </motion.div>

              <h2 className="relative z-10 text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-extrabold leading-[1.1] tracking-[-0.035em] mb-7">
                <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                  ¿Listo para optimizar tu
                </span>
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-violet-300 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                  {" "}operación y escalar
                </span>
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                  tus resultados?
                </span>
              </h2>
              <p className="relative z-10 text-base sm:text-lg text-zinc-400 mb-14 max-w-xl mx-auto leading-relaxed">
                Únete a cientos de negocios que ya controlan su operación de punta a punta con Sign Flow.
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block relative z-10">
                <Button
                  size="lg"
                  onClick={() => scrollTo("pricing")}
                  className="relative overflow-hidden bg-violet-600 text-white hover:bg-violet-700 rounded-full px-10 h-14 text-base font-semibold transition-all duration-300 group"
                  style={{ animation: "neon-pulse 3s ease-in-out infinite" }}>
                  
                  <span className="relative z-10 flex items-center">
                    Empieza Gratis Ahora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer-sweep 1.8s ease-in-out infinite"
                    }} />
                  
                </Button>
              </motion.div>
              <p className="relative z-10 mt-7 text-[12px] text-zinc-600 flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                Sin tarjeta de crédito · Configuración en 3 minutos
              </p>
            </div>
          </Reveal>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="border-t border-white/[0.04] py-16 sm:py-20 px-5 relative" role="contentinfo">
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
              { title: "Legal", links: ["Términos de Servicio", "Política de Privacidad", "Cookies", "Soporte"] }].
              map((col) =>
              <div key={col.title}>
                  <h4 className="text-[12px] font-bold uppercase tracking-[0.15em] text-zinc-500 mb-5">{col.title}</h4>
                  <ul className="space-y-3">
                    {col.links.map((item) =>
                  <li key={item}>
                        <a href="#" className="text-[13px] text-zinc-600 hover:text-purple-400/60 transition-colors duration-300">{item}</a>
                      </li>
                  )}
                  </ul>
                </div>
              )}
            </div>
            <div className="border-t border-white/[0.03] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[12px] text-zinc-700">© {new Date().getFullYear()} Sign Flow. Todos los derechos reservados.</p>
              <div className="flex items-center gap-3">
                {[Twitter, Instagram, Linkedin].map((Icon, i) =>
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-white/[0.05] flex items-center justify-center text-zinc-600 hover:text-purple-400/60 hover:border-purple-500/15 transition-all duration-300">
                  
                    <Icon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>);

};

export default Index;