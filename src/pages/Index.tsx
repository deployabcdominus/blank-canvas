import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import brandLogoSrc from "@/assets/brand-logo.png";
import {
  ArrowRight,
  Check,
  Star,
  Sparkles,
  BarChart3,
  FileText,
  Wrench,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Data ─── */
const featureTabs = [
  { id: "dashboard", label: "Dashboard ejecutivo", icon: BarChart3, description: "KPIs en tiempo real, AI briefing diario y pipeline completo en una sola vista." },
  { id: "leads", label: "Leads y propuestas", icon: FileText, description: "Pipeline visual para leads, propuestas en PDF con tu marca y seguimiento automático." },
  { id: "production", label: "Producción e instalación", icon: Wrench, description: "Órdenes de trabajo con estados, asignación de equipos y evidencia fotográfica." },
  { id: "team", label: "Gestión de equipo", icon: Users, description: "Roles y permisos por función. Admin, comercial, operaciones — cada quien ve lo que necesita." },
];

const problemSolution = [
  { before: "Leads perdidos en el chat", after: "Pipeline visual con seguimiento" },
  { before: "Propuestas en Word sin control", after: "PDF profesional con un clic" },
  { before: "Órdenes por WhatsApp", after: "Órdenes con estado en tiempo real" },
  { before: "Fotos en el teléfono", after: "Evidencias en la nube por proyecto" },
  { before: "Sin idea del estado financiero", after: "Dashboard con ingresos en vivo" },
];

const steps = [
  { num: "01", title: "Captura el lead", description: "El cliente llega por referido, Instagram o tu web. Lo registras en segundos con toda su info." },
  { num: "02", title: "Cotiza y produce", description: "Genera propuesta con PDF profesional. Al aprobarla se crea la orden de producción automáticamente." },
  { num: "03", title: "Instala y cobra", description: "Tu equipo recibe la orden. Suben evidencias. El cliente recibe notificación. Tú cobras." },
];

const testimonials = [
  { text: "Antes perdíamos leads por no darles seguimiento a tiempo. Ahora el dashboard nos avisa qué está caliente y qué hay que atender hoy.", name: "Carlos M.", role: "Director", company: "SignMakers Miami", initials: "CM", color: "#5B6AF2" },
  { text: "Las propuestas en PDF con nuestro logo cambiaron cómo nos perciben los clientes. Cerramos 30% más en el primer mes.", name: "Elena R.", role: "Gerente Comercial", company: "VisualCorp CDMX", initials: "ER", color: "#8B5CF6" },
  { text: "Por fin puedo saber dónde está cada instalación sin llamar a nadie. El mapa en tiempo real vale solo el precio del plan.", name: "David L.", role: "Operaciones", company: "BrandSpace Bogotá", initials: "DL", color: "#A78BFA" },
];

const plans = [
  { name: "Starter", priceMonthly: 49, priceAnnual: 39, features: ["Hasta 3 usuarios", "Leads y propuestas", "Órdenes de servicio", "Soporte por email"], cta: "Elegir Starter", highlighted: false },
  { name: "Professional", priceMonthly: 99, priceAnnual: 79, features: ["Hasta 10 usuarios", "Todo de Starter", "AI Briefing diario", "PDF de propuestas", "Reportes avanzados"], cta: "Elegir Professional", highlighted: true },
  { name: "Enterprise", priceMonthly: 199, priceAnnual: 159, features: ["Usuarios ilimitados", "Todo de Professional", "Onboarding dedicado", "SLA garantizado"], cta: "Contactar ventas", highlighted: false },
];

/* ─── Component ─── */
const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

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
      <div
        className="min-h-screen overflow-x-hidden scroll-smooth"
        style={{
          background: "#000",
          color: "#F5F5F7",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif",
        }}
      >
        {/* ═══════ NAVBAR ═══════ */}
        <header
          className="fixed top-0 inset-x-0 z-50 transition-all duration-300 h-16"
          style={{
            background: "rgba(0,0,0,0.72)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            borderBottom: scrolled
              ? "1px solid rgba(255,255,255,0.10)"
              : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-full">
            <a href="/" className="flex items-center gap-1.5" aria-label="Sign Flow">
              <img src={brandLogoSrc} alt="" className="w-8 h-8 object-contain" draggable={false} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: "#F5F5F7" }}>
                Sign Flow
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#A1A1A6" }}>
              {[
                { label: "Características", id: "features" },
                { label: "Precios", id: "pricing" },
                { label: "Demo", id: "how" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="transition-colors duration-200 hover:text-[#F5F5F7]"
                  style={{ fontSize: 13, letterSpacing: "0.01em" }}
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
                className="hover:bg-transparent"
                style={{ color: "#A1A1A6" }}
              >
                Iniciar sesión
              </Button>
              <button
                onClick={() => scrollTo("pricing")}
                  style={{
                    background: "#5B6AF2",
                    color: "#fff",
                    borderRadius: 980,
                    height: 34,
                    padding: "0 18px",
                    fontWeight: 600,
                    fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  transition: "opacity 150ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Elegir Plan →
              </button>
            </div>
          </div>
        </header>

        {/* ═══════ HERO ═══════ */}
        <section
          className="relative pt-32 pb-10 sm:pt-36 md:pt-44 px-5"
          style={{
            background: "radial-gradient(ellipse 100% 60% at 50% -10%, rgba(91,106,242,0.25), transparent 70%)",
          }}
        >
          <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-8 px-4 py-2 rounded-full"
              style={{
                color: "#6B7AF8",
                border: "1px solid rgba(91,106,242,0.40)",
                background: "rgba(91,106,242,0.10)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Diseñado para agencias de señalética
            </motion.span>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(56px, 9vw, 88px)",
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                color: "#F5F5F7",
                marginBottom: 10,
              }}
            >
              Gestiona tu agencia
              <br />
              de señalética.
            </motion.h1>

            {/* Shimmer line */}
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "clamp(56px, 9vw, 88px)",
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                display: "block",
                marginBottom: 28,
                background: "linear-gradient(135deg, #818CF8, #A78BFA, #C084FC, #818CF8)",
                backgroundSize: "300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "landing-shimmer 5s ease infinite",
              }}
            >
              Sin el caos.
            </motion.span>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ color: "#A1A1A6", fontSize: 19, lineHeight: 1.6, maxWidth: 520, marginBottom: 36 }}
            >
              Leads, propuestas, producción e instalaciones en un solo flujo.
              Tu equipo siempre alineado, tus clientes siempre informados.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 mb-6"
            >
              <button
                onClick={() => scrollTo("pricing")}
                style={{
                  background: "#5B6AF2",
                  color: "#fff",
                  borderRadius: 980,
                  height: 48,
                  padding: "0 28px",
                  fontWeight: 600,
                  fontSize: 16,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(91,106,242,0.40)",
                  transition: "transform 150ms, opacity 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Empezar gratis →
              </button>
              <button
                onClick={() => scrollTo("how")}
                style={{
                  background: "transparent",
                  color: "#F5F5F7",
                  borderRadius: 980,
                  height: 48,
                  padding: "0 28px",
                  fontWeight: 600,
                  fontSize: 16,
                  border: "1px solid rgba(255,255,255,0.18)",
                  cursor: "pointer",
                  transition: "background 150ms",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                Ver demo
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center gap-2 text-[13px] mb-16"
              style={{ color: "#6E6E73" }}
            >
              <div className="flex" style={{ color: "#FF9F0A" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span>Usado por agencias en Miami · CDMX · Bogotá · Madrid</span>
            </motion.div>

            {/* Dashboard screenshot */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-5xl mx-auto"
              style={{
                perspective: 1400,
              }}
            >
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  overflow: "hidden",
                  transform: "perspective(1400px) rotateX(8deg)",
                  boxShadow: "0 0 120px rgba(91,106,242,0.20)",
                }}
              >
                <img
                  src="/screenshots/dashboard.png"
                  alt="Sign Flow — Centro de Control"
                  style={{ width: "100%", display: "block" }}
                  loading="eager"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════ LOGOS ═══════ */}
        <section
          className="py-10"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <p
              className="uppercase tracking-[0.08em] mb-3"
              style={{ color: "#3A3A3C", fontSize: 13 }}
            >
              Confiado por agencias en:
            </p>
            <p style={{ color: "#3A3A3C", fontSize: 13, letterSpacing: "0.08em" }}>
              MIAMI &nbsp;·&nbsp; CIUDAD DE MÉXICO &nbsp;·&nbsp; BOGOTÁ &nbsp;·&nbsp; BUENOS AIRES &nbsp;·&nbsp; MADRID
            </p>
          </div>
        </section>

        {/* ═══════ PROBLEMA / SOLUCIÓN ═══════ */}
        <section className="py-32 sm:py-40 px-5">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <h2
                className="text-center mb-16"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(1.8rem, 3.5vw, 2.625rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: "#F5F5F7",
                }}
              >
                Tu agencia merece más que
                <br />
                hojas de cálculo y WhatsApps.
              </h2>
            </Reveal>

            <div>
              {problemSolution.map((row, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div
                    className="grid grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-center py-6 px-4 rounded-lg transition-colors duration-200"
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <p className="text-base line-through" style={{ color: "#FF453A" }}>
                      {row.before}
                    </p>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: "#5B6AF2" }} />
                    <p className="text-base font-semibold" style={{ color: "#F5F5F7" }}>
                      {row.after}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ FEATURE SHOWCASE ═══════ */}
        <section id="features" className="py-32 sm:py-40 px-5" style={{ background: "#000" }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2
                className="text-center mb-4"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(1.8rem, 3.5vw, 2.625rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: "#F5F5F7",
                }}
              >
                Todo lo que necesitas,
                <br />
                nada que no usarás.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex flex-wrap justify-center gap-2 mt-10 mb-12">
                {featureTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
                      style={{
                        background: isActive ? "rgba(91,106,242,0.15)" : "transparent",
                        border: isActive
                          ? "1px solid rgba(91,106,242,0.40)"
                          : "1px solid rgba(255,255,255,0.10)",
                        color: isActive ? "#6B7AF8" : "#6E6E73",
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <AnimatePresence mode="wait">
              {featureTabs
                .filter((t) => t.id === activeTab)
                .map((tab) => (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                  >
                    <div
                      className="mx-auto max-w-4xl overflow-hidden"
                      style={{
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 16,
                      }}
                    >
                      <img src="/screenshots/dashboard.png" alt={tab.label} style={{ width: "100%", display: "block" }} loading="lazy" />
                    </div>
                    <p className="mt-6 text-base max-w-lg mx-auto" style={{ color: "#A1A1A6" }}>
                      {tab.description}
                    </p>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </section>

        {/* ═══════ CÓMO FUNCIONA ═══════ */}
        <section id="how" className="py-32 sm:py-40 px-5" style={{ background: "#0A0A0A" }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2
                className="text-center mb-20"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(1.8rem, 3.5vw, 2.625rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: "#F5F5F7",
                }}
              >
                De lead a entrega
                <br />
                en 3 pasos.
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {steps.map((step, i) => (
                <Reveal key={step.num} delay={i * 0.08}>
                  <div
                    className="relative"
                    style={{
                      borderTop: i > 0 ? undefined : undefined,
                      paddingTop: 0,
                    }}
                  >
                    {/* Dashed divider on mobile between steps */}
                    {i > 0 && (
                      <div
                        className="md:hidden mb-8"
                        style={{ borderTop: "1px dashed rgba(255,255,255,0.10)" }}
                      />
                    )}
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 80,
                        fontWeight: 800,
                        lineHeight: 1,
                        background: "linear-gradient(135deg, #5B6AF2, #A78BFA)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        opacity: 0.4,
                        display: "block",
                        marginBottom: 12,
                      }}
                    >
                      {step.num}
                    </span>
                    <h3
                      className="mb-3"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#F5F5F7",
                      }}
                    >
                      {step.title}
                    </h3>
                    <p style={{ color: "#A1A1A6", fontSize: 15, lineHeight: 1.65 }}>
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ TESTIMONIOS ═══════ */}
        <section className="py-32 sm:py-40 px-5" style={{ background: "#000" }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2
                className="text-center mb-16"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(1.8rem, 3.5vw, 2.625rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: "#F5F5F7",
                }}
              >
                Agencias que ya ordenaron
                <br />
                su operación.
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div
                    className="h-full flex flex-col transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 16,
                      padding: 36,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "rgba(91,106,242,0.30)";
                      e.currentTarget.style.boxShadow = "0 0 40px rgba(91,106,242,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="flex mb-4" style={{ color: "#FF9F0A" }}>
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="flex-1 mb-5" style={{ color: "#A1A1A6", fontStyle: "italic", fontSize: 15, lineHeight: 1.8 }}>
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: t.color }}
                      >
                        {t.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#F5F5F7" }}>{t.name}</p>
                        <p className="text-xs" style={{ color: "#6E6E73" }}>
                          {t.role}, {t.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ PRECIOS ═══════ */}
        <section id="pricing" className="py-24 sm:py-32 px-5" style={{ background: "#0A0A0A" }}>
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2
                className="text-center mb-2"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(1.8rem, 3.5vw, 2.625rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: "#F5F5F7",
                }}
              >
                Elige tu plan.
              </h2>
              <p className="text-center mb-12" style={{ color: "#6E6E73", fontSize: 17 }}>
                Sin contratos. Cancela cuando quieras.
              </p>
            </Reveal>

            {/* Toggle */}
            <Reveal delay={0.1}>
              <div className="flex items-center justify-center gap-3 mb-14">
                <span className="text-sm font-medium" style={{ color: !isAnnual ? "#F5F5F7" : "#6E6E73" }}>
                  Mensual
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="relative w-12 h-7 rounded-full transition-colors duration-200"
                  style={{ background: isAnnual ? "#5B6AF2" : "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                    style={{ transform: isAnnual ? "translateX(24px)" : "translateX(4px)" }}
                  />
                </button>
                <span className="text-sm font-medium" style={{ color: isAnnual ? "#F5F5F7" : "#6E6E73" }}>
                  Anual
                </span>
                {isAnnual && (
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ color: "#6B7AF8", background: "rgba(91,106,242,0.20)" }}
                  >
                    Ahorra 20%
                  </span>
                )}
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, i) => (
                <Reveal key={plan.name} delay={i * 0.08}>
                  <div
                    className="h-full flex flex-col relative"
                    style={{
                      background: plan.highlighted
                        ? "rgba(91,106,242,0.08)"
                        : "rgba(255,255,255,0.04)",
                      border: plan.highlighted
                        ? "1px solid rgba(91,106,242,0.40)"
                        : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 20,
                      padding: 32,
                      boxShadow: plan.highlighted
                        ? "0 0 60px rgba(91,106,242,0.12)"
                        : "none",
                    }}
                  >
                    {plan.highlighted && (
                      <span
                        className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full"
                        style={{ background: "rgba(91,106,242,0.20)", color: "#6B7AF8" }}
                      >
                        Más popular
                      </span>
                    )}

                    <h3
                      className="mb-4"
                      style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: "#F5F5F7" }}
                    >
                      {plan.name}
                    </h3>

                    <div className="mb-6">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isAnnual ? "a" : "m"}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                          style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 48,
                            fontWeight: 700,
                            color: "#F5F5F7",
                            display: "inline-block",
                          }}
                        >
                          ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                        </motion.span>
                      </AnimatePresence>
                      <span style={{ color: "#6E6E73", fontSize: 16, marginLeft: 4 }}>/mes</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5 text-sm" style={{ color: "#A1A1A6" }}>
                          <Check className="w-4 h-4 flex-shrink-0" style={{ color: "#32D74B" }} />
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePlanSelect(plan.name)}
                      style={{
                        width: "100%",
                        height: 44,
                        borderRadius: 980,
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: "pointer",
                        transition: "all 150ms",
                        ...(plan.highlighted
                          ? {
                              background: "#5B6AF2",
                              color: "#fff",
                              border: "none",
                              boxShadow: "0 4px 20px rgba(91,106,242,0.40)",
                            }
                          : {
                              background: "transparent",
                              color: "#F5F5F7",
                              border: "1px solid rgba(255,255,255,0.18)",
                            }),
                      }}
                      onMouseEnter={(e) => {
                        if (plan.highlighted) {
                          e.currentTarget.style.transform = "translateY(-1px)";
                        } else {
                          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (plan.highlighted) {
                          e.currentTarget.style.transform = "translateY(0)";
                        } else {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm" style={{ color: "#6E6E73" }}>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" style={{ color: "#32D74B" }} /> 14 días gratis
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" style={{ color: "#32D74B" }} /> Sin tarjeta
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4" style={{ color: "#32D74B" }} /> Cancela cuando quieras
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════ CTA FINAL ═══════ */}
        <section
          className="relative py-24 sm:py-32 px-5"
          style={{
            background: "linear-gradient(180deg, #000000 0%, #0D0D1A 100%)",
            borderTop: "1px solid rgba(91,106,242,0.20)",
          }}
        >
          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(91,106,242,0.12), transparent)",
            }}
          />
          <div className="relative max-w-3xl mx-auto text-center">
            <Reveal>
              <h2
                className="mb-4"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "clamp(1.8rem, 4vw, 3rem)",
                  fontWeight: 700,
                  color: "#F5F5F7",
                }}
              >
                ¿Listo para ordenar tu agencia?
              </h2>
              <p className="mb-10" style={{ color: "#6E6E73", fontSize: 18 }}>
                Empieza gratis hoy. Tu equipo lo agradecerá.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => scrollTo("pricing")}
                  style={{
                    background: "#5B6AF2",
                    color: "#fff",
                    borderRadius: 980,
                    height: 48,
                    padding: "0 28px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(91,106,242,0.40)",
                    transition: "transform 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  Empezar gratis →
                </button>
                <button
                  onClick={() => navigate("/register")}
                  style={{
                    background: "transparent",
                    color: "#F5F5F7",
                    borderRadius: 980,
                    height: 48,
                    padding: "0 28px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "1px solid rgba(255,255,255,0.18)",
                    cursor: "pointer",
                    transition: "background 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  Hablar con ventas
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════ FOOTER ═══════ */}
        <footer
          className="py-16 px-5"
          style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-1.5 mb-3">
                <img src={brandLogoSrc} alt="" className="w-7 h-7 object-contain" />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: "#F5F5F7" }}>
                  Sign Flow
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#6E6E73" }}>
                Gestión integral para agencias de señalética.
              </p>
            </div>

            {[
              {
                title: "Producto",
                links: [
                  { label: "Características", action: () => scrollTo("features") },
                  { label: "Precios", action: () => scrollTo("pricing") },
                  { label: "Demo", action: () => scrollTo("how") },
                ],
              },
              {
                title: "Empresa",
                links: [
                  { label: "Sobre nosotros", action: () => {} },
                  { label: "Blog", action: () => {} },
                  { label: "Contacto", action: () => {} },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacidad", action: () => {} },
                  { label: "Términos", action: () => {} },
                  { label: "Cookies", action: () => {} },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-4" style={{ color: "#F5F5F7" }}>{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={link.action}
                        className="text-sm transition-colors"
                        style={{ color: "#6E6E73" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#F5F5F7"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#6E6E73"; }}
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="max-w-6xl mx-auto pt-6 text-center"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs" style={{ color: "#6E6E73" }}>
              © 2026 Sign Flow · signflowapp.com · Todos los derechos reservados
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
