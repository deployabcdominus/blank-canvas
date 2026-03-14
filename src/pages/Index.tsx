import { useRef, useEffect, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import brandLogoSrc from "@/assets/brand-logo.png";
import dashboardPreview from "@/assets/dashboard-preview.png";
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

/* ─── Feature tabs data ─── */
const featureTabs = [
  { id: "dashboard", label: "Dashboard ejecutivo", icon: BarChart3, description: "KPIs en tiempo real, AI briefing diario y pipeline completo en una sola vista." },
  { id: "leads", label: "Leads y propuestas", icon: FileText, description: "Pipeline visual para leads, propuestas en PDF con tu marca y seguimiento automático." },
  { id: "production", label: "Producción e instalación", icon: Wrench, description: "Órdenes de trabajo con estados, asignación de equipos y evidencia fotográfica." },
  { id: "team", label: "Gestión de equipo", icon: Users, description: "Roles y permisos por función. Admin, comercial, operaciones — cada quien ve lo que necesita." },
];

/* ─── Problem/Solution rows ─── */
const problemSolution = [
  { before: "Leads perdidos en el chat", after: "Pipeline visual con seguimiento" },
  { before: "Propuestas en Word sin control", after: "Propuestas profesionales en PDF con un clic" },
  { before: "Órdenes por WhatsApp", after: "Órdenes asignadas con estado en tiempo real" },
  { before: "Fotos de instalación en el teléfono", after: "Evidencias en la nube, por proyecto" },
  { before: "Sin idea del estado financiero", after: "Dashboard con ingresos y pipeline en vivo" },
];

/* ─── Steps data ─── */
const steps = [
  { num: "01", title: "Captura el lead", description: "El cliente llega por Instagram, referido o tu web. Lo registras en segundos con toda su info y el servicio que necesita." },
  { num: "02", title: "Cotiza y produce", description: "Genera la propuesta con PDF profesional. Al aprobarla, se crea la orden de producción automáticamente." },
  { num: "03", title: "Instala y cobra", description: "Tu equipo recibe la orden en su celular. Suben fotos de la instalación. El cliente recibe notificación. Tú cobras." },
];

/* ─── Testimonials ─── */
const testimonials = [
  { text: "Antes perdíamos leads por no darles seguimiento a tiempo. Ahora el dashboard nos avisa qué está caliente y qué hay que atender hoy.", name: "Carlos M.", role: "Director", company: "SignMakers Miami", initials: "CM", color: "bg-[#5B6AF2]" },
  { text: "Las propuestas en PDF con nuestro logo cambiaron cómo nos perciben los clientes. Cerramos 30% más en el primer mes.", name: "Elena R.", role: "Gerente Comercial", company: "VisualCorp CDMX", initials: "ER", color: "bg-[#8B5CF6]" },
  { text: "Por fin puedo saber dónde está cada instalación sin llamar a nadie. El mapa en tiempo real vale solo el precio del plan.", name: "David L.", role: "Operaciones", company: "BrandSpace Bogotá", initials: "DL", color: "bg-[#EC4899]" },
];

/* ─── Pricing plans ─── */
const plans = [
  { name: "Starter", priceMonthly: 49, priceAnnual: 39, features: ["Hasta 3 usuarios", "Leads y propuestas", "Órdenes de servicio", "Soporte por email"], cta: "Elegir Starter", highlighted: false },
  { name: "Professional", priceMonthly: 99, priceAnnual: 79, features: ["Hasta 10 usuarios", "Todo de Starter", "AI Briefing diario", "PDF de propuestas", "Reportes avanzados"], cta: "Elegir Professional →", highlighted: true },
  { name: "Enterprise", priceMonthly: 199, priceAnnual: 159, features: ["Usuarios ilimitados", "Todo de Professional", "Onboarding dedicado", "SLA garantizado"], cta: "Contactar ventas", highlighted: false },
];

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
      <div className="min-h-screen bg-black text-[#F5F5F7] overflow-x-hidden scroll-smooth" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif" }}>
        {/* ═══════ S1 — NAVBAR ═══════ */}
        <header
          className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 h-16 ${
            scrolled
              ? "bg-black/85 backdrop-blur-xl border-b border-white/[0.06]"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-full">
            <a href="/" className="flex items-center gap-1.5" aria-label="Sign Flow">
              <img src={brandLogoSrc} alt="Sign Flow" className="w-9 h-9 object-contain" draggable={false} />
              <span className="font-bold text-lg text-[#F5F5F7]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Sign Flow
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6E6E73]">
              {[
                { label: "Características", id: "features" },
                { label: "Precios", id: "pricing" },
                { label: "Demo", id: "how" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="hover:text-[#F5F5F7] transition-colors duration-200"
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
                className="text-[#A1A1A6] hover:text-[#F5F5F7] hover:bg-transparent"
              >
                Iniciar sesión
              </Button>
              <Button
                size="sm"
                onClick={() => scrollTo("pricing")}
                className="text-white rounded-[10px] px-5 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #5B6AF2, #8B5CF6)" }}
              >
                Elegir Plan →
              </Button>
            </div>
          </div>
        </header>

        {/* ═══════ S2 — HERO ═══════ */}
        <section className="pt-28 pb-16 sm:pt-32 sm:pb-20 md:pt-40 md:pb-28 px-5">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-center lg:text-left"
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#5B6AF2] mb-5 px-4 py-2 rounded-full border border-[#5B6AF2]/25 bg-[#5B6AF2]/10">
                <Sparkles className="w-3.5 h-3.5" />
                Diseñado para agencias de señalética
              </span>

              <h1
                className="text-[2.2rem] sm:text-[2.8rem] md:text-[3.2rem] lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-6"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Gestiona tu agencia
                <br />
                de señalética{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #5B6AF2, #8B5CF6)" }}
                >
                  sin caos.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#A1A1A6] leading-relaxed max-w-[480px] mx-auto lg:mx-0 mb-8">
                Leads, propuestas, producción e instalaciones en un solo flujo.
                Tu equipo siempre alineado, tus clientes siempre informados.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-5">
                <Button
                  size="lg"
                  onClick={() => scrollTo("pricing")}
                  className="text-white rounded-xl h-12 px-7 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #5B6AF2, #8B5CF6)" }}
                >
                  Empezar gratis →
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => scrollTo("how")}
                  className="rounded-xl h-12 px-7 text-base font-medium border-white/10 text-[#A1A1A6] hover:bg-white/[0.04] bg-transparent"
                >
                  Ver demo
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-[13px] text-[#6E6E73]">
                <div className="flex text-[#FBBF24]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="ml-1">Usado por +50 agencias en Miami y LATAM</span>
              </div>
            </motion.div>

            {/* Right — Dashboard preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div
                className="rounded-2xl overflow-hidden border border-white/[0.08]"
                style={{
                  boxShadow: "0 24px 80px rgba(91,106,242,0.15)",
                  transform: "perspective(1200px) rotateY(-5deg) rotateX(2deg)",
                }}
              >
                <div className="bg-[#0A0A0A] border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27CA40]" />
                  </div>
                  <div className="flex-1 bg-white/[0.06] rounded-md px-3 py-1 text-[11px] text-[#6E6E73] text-center border border-white/[0.06]">
                    signflowapp.com
                  </div>
                </div>
                <img src={dashboardPreview} alt="Sign Flow Dashboard" className="w-full block" loading="eager" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════ S3 — SOCIAL PROOF BAR ═══════ */}
        <section className="bg-white/[0.02] py-8 border-y border-white/[0.06]">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-[#6E6E73] mb-3">Confiado por agencias en:</p>
            <p className="text-sm font-medium text-[#A1A1A6]">
              Miami · Ciudad de México · Bogotá · Buenos Aires · Madrid
            </p>
          </div>
        </section>

        {/* ═══════ S4 — PROBLEMA / SOLUCIÓN ═══════ */}
        <section className="py-20 sm:py-28 px-5">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-14 leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Tu agencia merece más que
                <br />
                hojas de cálculo y WhatsApps.
              </h2>
            </Reveal>

            <div className="space-y-0">
              {problemSolution.map((row, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-center py-5 border-b border-white/[0.06] last:border-0 group hover:bg-white/[0.02] px-4 rounded-lg transition-colors">
                    <p className="text-sm sm:text-base text-[#FF453A]/70 line-through">
                      {row.before}
                    </p>
                    <ArrowRight className="w-4 h-4 text-[#5B6AF2] flex-shrink-0" />
                    <p className="text-sm sm:text-base font-semibold text-[#F5F5F7]">
                      {row.after}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ S5 — FEATURE SHOWCASE ═══════ */}
        <section id="features" className="bg-white/[0.02] py-20 sm:py-28 px-5">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Todo lo que necesitas,
                <br />
                nada que no usarás.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex flex-wrap justify-center gap-2 mt-10 mb-10">
                {featureTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "text-white shadow-md"
                          : "bg-white/[0.04] text-[#6E6E73] border border-white/[0.08] hover:border-[#5B6AF2]/30 hover:text-[#A1A1A6]"
                      }`}
                      style={isActive ? { background: "linear-gradient(135deg, #5B6AF2, #8B5CF6)" } : {}}
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
                      className="rounded-2xl overflow-hidden border border-white/[0.08] mx-auto max-w-4xl"
                      style={{ boxShadow: "0 4px 24px rgba(91,106,242,0.08)" }}
                    >
                      <img src={dashboardPreview} alt={tab.label} className="w-full block" loading="lazy" />
                    </div>
                    <p className="text-[#A1A1A6] mt-6 text-base max-w-lg mx-auto">
                      {tab.description}
                    </p>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </section>

        {/* ═══════ S6 — CÓMO FUNCIONA ═══════ */}
        <section id="how" className="py-20 sm:py-28 px-5">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-16 leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                De lead a entrega en 3 pasos.
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {steps.map((step, i) => (
                <Reveal key={step.num} delay={i * 0.15}>
                  <div className="text-center md:text-left">
                    <span
                      className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent mb-4 block"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        backgroundImage: "linear-gradient(135deg, #5B6AF2, #8B5CF6)",
                      }}
                    >
                      {step.num}
                    </span>
                    <h3 className="text-xl font-bold mb-3 text-[#F5F5F7]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {step.title}
                    </h3>
                    <p className="text-[#A1A1A6] leading-relaxed text-[15px]">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ S7 — TESTIMONIOS ═══════ */}
        <section className="bg-white/[0.02] py-20 sm:py-28 px-5">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-14 leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Agencias que ya ordenaron
                <br />
                su operación.
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <Reveal key={i} delay={i * 0.12}>
                  <div
                    className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.08] h-full flex flex-col"
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.30)" }}
                  >
                    <div className="flex text-[#FBBF24] mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-[#A1A1A6] italic leading-relaxed text-[15px] flex-1 mb-5">
                      "{t.text}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold`}
                      >
                        {t.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#F5F5F7]">{t.name}</p>
                        <p className="text-xs text-[#6E6E73]">
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

        {/* ═══════ S8 — PRECIOS ═══════ */}
        <section id="pricing" className="py-20 sm:py-28 px-5">
          <div className="max-w-5xl mx-auto">
            <Reveal>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Elige tu plan y empieza hoy.
              </h2>
              <p className="text-center text-[#A1A1A6] mb-10">
                Sin contratos. Cancela cuando quieras.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="flex items-center justify-center gap-3 mb-12">
                <span className={`text-sm font-medium ${!isAnnual ? "text-[#F5F5F7]" : "text-[#6E6E73]"}`}>
                  Mensual
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    isAnnual ? "bg-[#5B6AF2]" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      isAnnual ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${isAnnual ? "text-[#F5F5F7]" : "text-[#6E6E73]"}`}>
                  Anual
                </span>
                {isAnnual && (
                  <span className="text-xs font-semibold text-[#5B6AF2] bg-[#5B6AF2]/10 px-2.5 py-1 rounded-full border border-[#5B6AF2]/25">
                    Ahorra 20%
                  </span>
                )}
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, i) => (
                <Reveal key={plan.name} delay={i * 0.1}>
                  <div
                    className={`rounded-2xl p-6 sm:p-8 border h-full flex flex-col relative ${
                      plan.highlighted
                        ? "border-[#5B6AF2] border-2 bg-white/[0.04]"
                        : "border-white/[0.08] bg-white/[0.02]"
                    }`}
                    style={{
                      boxShadow: plan.highlighted
                        ? "0 8px 40px rgba(91,106,242,0.12)"
                        : "0 4px 24px rgba(0,0,0,0.20)",
                    }}
                  >
                    {plan.highlighted && (
                      <span
                        className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-4 py-1 rounded-full"
                        style={{ background: "linear-gradient(135deg, #5B6AF2, #8B5CF6)" }}
                      >
                        Más popular
                      </span>
                    )}

                    <h3 className="text-lg font-bold text-[#F5F5F7] mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {plan.name}
                    </h3>

                    <div className="mb-6">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isAnnual ? "annual" : "monthly"}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="text-4xl font-bold text-[#F5F5F7] inline-block"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-[#6E6E73] text-sm ml-1">/mes</span>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2.5 text-sm text-[#A1A1A6]">
                          <Check className="w-4 h-4 text-[#5B6AF2] flex-shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handlePlanSelect(plan.name)}
                      className={`w-full rounded-xl h-11 font-semibold transition-all duration-200 ${
                        plan.highlighted
                          ? "text-white shadow-md hover:shadow-lg"
                          : "bg-transparent text-[#A1A1A6] border border-white/10 hover:border-[#5B6AF2]/30 hover:text-[#F5F5F7]"
                      }`}
                      style={
                        plan.highlighted
                          ? { background: "linear-gradient(135deg, #5B6AF2, #8B5CF6)" }
                          : {}
                      }
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-[#A1A1A6]">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#5B6AF2]" /> Prueba gratis 14 días
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#5B6AF2]" /> Sin tarjeta de crédito
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#5B6AF2]" /> Cancela cuando quieras
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════ S9 — CTA FINAL ═══════ */}
        <section
          className="py-20 sm:py-28 px-5"
          style={{ background: "linear-gradient(135deg, #5B6AF2 0%, #8B5CF6 100%)" }}
        >
          <div className="max-w-3xl mx-auto text-center">
            <Reveal>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                ¿Listo para ordenar tu agencia?
              </h2>
              <p className="text-white/80 text-lg mb-10">
                Empieza gratis hoy. Tu equipo lo agradecerá.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => scrollTo("pricing")}
                  className="bg-white text-[#5B6AF2] hover:bg-white/90 rounded-xl h-12 px-8 text-base font-semibold shadow-lg"
                >
                  Empezar gratis →
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/register")}
                  className="rounded-xl h-12 px-8 text-base font-medium border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  Hablar con ventas
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ═══════ S10 — FOOTER ═══════ */}
        <footer className="bg-black border-t border-white/[0.06] py-16 px-5">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-1.5 mb-3">
                <img src={brandLogoSrc} alt="Sign Flow" className="w-7 h-7 object-contain" />
                <span className="font-bold text-[#F5F5F7]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Sign Flow
                </span>
              </div>
              <p className="text-sm text-[#6E6E73] leading-relaxed">
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
                <h4 className="font-semibold text-sm text-[#F5F5F7] mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={link.action}
                        className="text-sm text-[#6E6E73] hover:text-[#5B6AF2] transition-colors"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="max-w-6xl mx-auto border-t border-white/[0.06] pt-6 text-center">
            <p className="text-xs text-[#6E6E73]">
              © 2026 Sign Flow · signflowapp.com · Todos los derechos reservados
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
