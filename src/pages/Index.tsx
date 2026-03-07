import { useRef, useEffect, useState } from "react";
import { motion, useInView, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { BrandLogo } from "@/components/BrandLogo";
import brandLogoSrc from "@/assets/brand-logo.png";
import { pricingPlans, benefitsData, stepsData } from "@/constants/landingPageData";
import {
  ArrowRight,
  Check,
  ChevronRight,
  LogIn,
  Link2,
  Zap,
  Clock,
  Users,
  Instagram,
  Twitter,
  Linkedin } from
"lucide-react";
import { Button } from "@/components/ui/button";

/* ─── Scroll-reveal wrapper ─── */
const Reveal = ({
  children,
  className = "",
  delay = 0




}: {children: React.ReactNode;className?: string;delay?: number;}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>

      {children}
    </motion.div>);

};

/* ─── Mouse-tracking parallax container ─── */
const useMouseParallax = (strength = 15) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 50, damping: 20 });
  const springY = useSpring(y, { stiffness: 50, damping: 20 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / rect.width * strength);
    y.set((e.clientY - centerY) / rect.height * strength);
  };

  const handleLeave = () => {x.set(0);y.set(0);};

  return { springX, springY, handleMouse, handleLeave };
};

/* ─── Hero image with scroll parallax + hover ─── */
const HeroImage = ({ src, alt }: {src: string;alt: string;}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  return (
    <motion.div
      ref={ref}
      className="overflow-hidden rounded-3xl bg-[hsl(228,18%,14%)] group relative ring-1 ring-[hsl(228,14%,24%)] shadow-[inset_0_2px_8px_hsl(0,0%,0%,0.3)]"
      whileHover={{ scale: 1.03, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}>

      <motion.img
        src={src}
        alt={alt}
        style={{ y }}
        className="w-full h-full object-cover scale-110 transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:brightness-110 group-hover:contrast-[1.05]"
        loading="lazy" />

      {/* Dark unifying overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(228,20%,5%)]/40 via-transparent to-[hsl(228,20%,5%)]/15 pointer-events-none" />

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[350ms] pointer-events-none"
      style={{ boxShadow: "inset 0 0 40px hsl(225 80% 56% / 0.15)" }} />
    </motion.div>);

};

/* ─── Animated step line ─── */
const StepLine = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <div ref={ref} className="hidden md:block absolute top-14 -right-6 w-12">
      <motion.div
        className="h-[2px] bg-gradient-to-r from-[hsl(225,80%,56%)]/40 to-transparent origin-left"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />

      <ChevronRight className="w-4 h-4 text-[hsl(225,80%,56%)]/30 absolute -right-1 -top-[7px]" />
    </div>);

};

/* ─── Animated price display ─── */
const AnimatedPrice = ({ value }: {value: number;}) =>
<AnimatePresence mode="wait">
    <motion.span
    key={value}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    className="text-4xl font-bold inline-block">

      ${value}
    </motion.span>
  </AnimatePresence>;


const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const { springX, springY, handleMouse, handleLeave } = useMouseParallax(12);

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

  const heroImages = [
  { src: "https://images.unsplash.com/photo-1563520239648-a24e51d4b570?w=600&h=450&fit=crop&auto=format&q=85", alt: "CNC router precision cutting" },
  { src: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=450&fit=crop&auto=format&q=85", alt: "Vinyl wrap application close-up" },
  { src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=450&fit=crop&auto=format&q=85", alt: "Channel letter fabrication with sparks" },
  { src: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=450&fit=crop&auto=format&q=85", alt: "Professional signage installation at height" }];


  return (
    <PageTransition>
      <div className="min-h-screen bg-[hsl(228,20%,7%)] text-[hsl(0,0%,96%)] overflow-x-hidden scroll-smooth landing-dark">

        {/* ═══════════ HEADER ═══════════ */}
        <header
          className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ?
          "bg-[hsl(228,20%,7%)]/85 backdrop-blur-2xl shadow-[0_1px_0_hsl(228,14%,18%/0.6)]" :
          "bg-transparent"}`
          }>

          <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
            <a href="/" className="flex items-center gap-[3px] sm:gap-[4px] md:gap-[4px] py-2 min-h-[44px]" aria-label="Sign Flow - Inicio">
              <div className="flex-shrink-0 w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] md:w-[44px] md:h-[44px] overflow-hidden m-0 p-0">
                <img
                  src={brandLogoSrc}
                  alt="Sign Flow"
                  className="block w-full h-full object-contain scale-[1.14] sm:scale-[1.16] md:scale-[1.18]"
                  draggable={false} />
              </div>
              <span className="font-semibold tracking-[-0.01em] leading-none text-[16px] sm:text-[18px] md:text-[20px] text-[#EDEFF5] translate-y-[0.5px] m-0 p-0">
                Sign Flow
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-[hsl(228,10%,55%)]">
              {[
              { label: "Funciones", id: "benefits" },
              { label: "Cómo funciona", id: "how" },
              { label: "Precios", id: "pricing" }].
              map((item) =>
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="relative hover:text-white transition-colors duration-300 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[hsl(225,80%,56%)] hover:after:w-full after:transition-all after:duration-300">

                  {item.label}
                </button>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-[hsl(228,10%,55%)] hover:text-white hover:bg-white/5">

                <LogIn className="w-4 h-4 mr-1.5" />
                Ingresar
              </Button>
              <Button
                size="sm"
                onClick={() => scrollTo("pricing")}
                className="bg-[hsl(225,80%,56%)] text-white hover:bg-[hsl(225,80%,50%)] rounded-full px-5 text-sm font-medium shadow-lg shadow-[hsl(225,80%,56%)]/20 transition-all duration-300 hover:shadow-[hsl(225,80%,56%)]/40 hover:scale-[1.03]">

                Elegir Plan
              </Button>
            </div>
          </div>
        </header>

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative pt-28 pb-20 sm:pt-32 sm:pb-28 md:pt-40 md:pb-36 px-5">
          {/* Multi-layer background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px"
            }} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,hsl(225,80%,56%,0.15),transparent_70%)]" />
          </div>

          {/* Animated gradient orbs */}
          <motion.div
            className="absolute top-16 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(225 80% 56% / 0.14) 0%, hsl(260 70% 58% / 0.07) 50%, transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

          <motion.div
            className="absolute top-40 left-[30%] w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(260 70% 58% / 0.08) 0%, transparent 70%)" }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />


          <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
            {/* Left */}
            <div className="order-2 md:order-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>

                {/* Badge — glass effect */}
                <motion.span
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[hsl(225,80%,70%)] mb-5 px-4 py-2 rounded-full border border-[hsl(225,80%,56%)]/25 bg-[hsl(225,80%,56%)]/[0.08] backdrop-blur-md shadow-[0_4px_24px_hsl(225,80%,56%,0.1)]"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}>

                  <Zap className="w-3.5 h-3.5" />
                  Plataforma de gestión de operaciones
                </motion.span>

                <h1 className="text-[2rem] sm:text-[2.6rem] md:text-[3rem] lg:text-[3.6rem] font-bold leading-[1.08] tracking-[-0.025em] mb-6 max-w-[520px] mx-auto md:mx-0">
                  Controla tu operación,{" "}
                  <span className="block mt-1 bg-gradient-to-r from-[#00D2FF] via-[#7C6BFF] to-[#A259FF] bg-clip-text text-transparent">
                    de lead a entrega.
                  </span>
                </h1>

                <p className="text-[15px] sm:text-lg md:text-[19px] font-medium text-[hsl(228,12%,72%)] leading-[1.65] max-w-lg mx-auto md:mx-0 mb-8">
                  Leads, propuestas, producción e instalación en un solo flujo.
                  Hecho para talleres de rotulación, wrapping y fabricación.
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      size="lg"
                      onClick={() => scrollTo("pricing")}
                      className="relative bg-[hsl(225,80%,56%)] text-white hover:bg-[hsl(225,80%,52%)] rounded-full px-9 text-base font-semibold shadow-[0_8px_32px_hsl(225,80%,56%,0.35)] transition-all duration-300 hover:shadow-[0_16px_48px_hsl(225,80%,56%,0.5)]">

                      Elegir Plan
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => scrollTo("how")}
                      className="rounded-full px-9 text-base font-medium border-[hsl(228,14%,20%)] text-[hsl(228,10%,60%)] hover:text-white hover:border-[hsl(225,80%,56%)]/30 hover:bg-[hsl(225,80%,56%)]/[0.06] bg-transparent transition-all duration-400">

                      Ver Demo
                    </Button>
                  </motion.div>
                </div>

                <motion.button
                  onClick={() => navigate("/invite")}
                  className="mt-5 flex items-center justify-center md:justify-start gap-1.5 text-sm text-[hsl(228,10%,38%)] hover:text-[hsl(225,80%,70%)] transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}>

                  <Link2 className="w-3.5 h-3.5" />
                  ¿Te invitaron a un equipo? Unirse con link
                </motion.button>
              </motion.div>
            </div>

            {/* Right — hero visual with mouse parallax */}
            <motion.div
              className="order-1 md:order-2 relative"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              onMouseMove={handleMouse}
              onMouseLeave={handleLeave}>

              {/* Cobalt glow behind grid */}
              <div className="absolute -inset-16 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,hsl(225,80%,50%,0.1),transparent_70%)] pointer-events-none blur-2xl" />

              <motion.div
                style={{ x: springX, y: springY }}
                className="relative aspect-[4/3] md:scale-[1.08] rounded-3xl overflow-hidden border border-[hsl(228,14%,22%)]/60 bg-[hsl(228,18%,10%)]/60 backdrop-blur-sm shadow-[0_32px_80px_-12px_hsl(225,80%,56%,0.18),0_0_0_1px_hsl(228,14%,20%,0.4),inset_0_1px_0_hsl(0,0%,100%,0.03)]">

                <div className="absolute inset-2.5 sm:inset-3 grid grid-cols-2 grid-rows-2 gap-2.5 sm:gap-3">
                  {heroImages.map((img, i) =>
                  <HeroImage key={i} src={img.src} alt={img.alt} />
                  )}
                </div>

                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(228,20%,7%)]/70 via-transparent to-[hsl(228,20%,7%)]/20 pointer-events-none" />
                {/* Inner glow */}
                <div className="absolute inset-0 shadow-[inset_0_0_60px_hsl(225,80%,56%,0.04)] pointer-events-none rounded-2xl" />
              </motion.div>

              {/* Floating badge */}
              <motion.div
                className="absolute -bottom-6 left-6 rounded-2xl shadow-[0_20px_60px_-8px_hsl(0,0%,0%,0.6)] border border-[hsl(228,14%,22%)]/40 ring-1 ring-white/[0.06] bg-[hsl(228,18%,9%)]/80 backdrop-blur-[16px] px-6 py-4 flex items-center gap-4"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>

                <div className="w-10 h-10 rounded-full bg-[hsl(225,80%,56%)]/15 flex items-center justify-center shadow-[0_0_12px_hsl(225,80%,56%,0.15)]">
                  <Check className="w-4.5 h-4.5 text-[hsl(225,80%,65%)]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold leading-tight text-[hsl(0,0%,94%)]">Listo para producción</p>
                  <p className="text-[11px] text-[hsl(228,10%,48%)] mt-0.5">Orden #1247 completada</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════ TRUST BAR ═══════════ */}
        <Reveal>
          <section className="py-10 border-y border-[hsl(228,14%,12%)]">
            <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-x-14 gap-y-2">
              {[
              { label: "Setup en minutos", icon: Clock },
              { label: "Workflow completo", icon: Zap },
              { label: "Multi-equipo", icon: Users }].
              map(({ label, icon: Icon }) =>
              <div key={label} className="flex flex-col items-center gap-2.5 p-6 group">
                  <Icon className="w-5 h-5 text-[hsl(225,80%,60%)] group-hover:text-[hsl(225,80%,70%)] transition-colors duration-300" />
                  <span className="text-sm font-medium text-[hsl(228,10%,48%)] group-hover:text-[hsl(228,10%,65%)] transition-colors duration-300">{label}</span>
                </div>
              )}
            </div>
          </section>
        </Reveal>

        {/* ═══════════ BENEFITS — slightly lighter depth ═══════════ */}
        <section id="benefits" className="py-24 md:py-32 lg:py-40 px-5 relative">
          <div className="absolute inset-0 bg-[hsl(228,20%,9%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,hsl(225,80%,56%,0.04),transparent)] pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(225,80%,56%)]/10 to-transparent" />

          <div className="max-w-6xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-16 lg:mb-20">
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[hsl(225,80%,65%)] mb-4 px-3 py-1 rounded-full border border-[hsl(225,80%,56%)]/15 bg-[hsl(225,80%,56%)]/[0.05]">
                  ¿Por qué Sign Flow?
                </span>
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-bold tracking-tight leading-[1.2]">
                   Todo lo que tu taller necesita
                 </h2>
                <p className="mt-4 text-[hsl(228,10%,52%)] max-w-xl mx-auto text-sm sm:text-base">
                  Diseñado específicamente para el flujo de trabajo de fabricación e instalación de señalética.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {benefitsData.map((b, i) => {
                const Icon = b.icon;
                return (
                  <Reveal key={b.title} delay={i * 0.08}>
                    <motion.div
                      whileHover={{ y: -6, transition: { duration: 0.5, ease: "easeOut" } }}
                      className="group relative p-6 sm:p-8 rounded-2xl border border-[hsl(228,14%,18%)]/50 bg-gradient-to-b from-[hsl(228,18%,13%)] to-[hsl(228,20%,8%)] backdrop-blur-sm hover:border-[hsl(225,80%,56%)]/20 hover:shadow-[0_16px_48px_-12px_hsl(225,80%,56%,0.12)] transition-all duration-500">

                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(225,80%,56%)]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-[hsl(225,80%,56%)]/[0.08] border border-[hsl(225,80%,56%)]/10 flex items-center justify-center mb-5 group-hover:bg-[hsl(225,80%,56%)]/[0.12] group-hover:border-[hsl(225,80%,56%)]/20 group-hover:shadow-[0_0_20px_hsl(225,80%,56%,0.2)] transition-all duration-500">
                          <Icon className="w-5 h-5 text-[hsl(225,80%,62%)] group-hover:text-[hsl(225,80%,72%)] drop-shadow-[0_0_6px_hsl(225,80%,56%,0.4)] transition-all duration-500" />
                        </div>
                        <h3 className="text-[15px] font-semibold mb-2 text-[hsl(0,0%,93%)]">{b.title}</h3>
                        <p className="text-sm leading-relaxed text-[hsl(228,10%,55%)]">{b.description}</p>
                      </div>
                    </motion.div>
                  </Reveal>);

              })}
            </div>
          </div>
        </section>

        {/* ═══════════ HOW IT WORKS — darkest section ═══════════ */}
        <section id="how" className="py-24 md:py-32 lg:py-40 px-5 relative">
          <div className="absolute inset-0 bg-[hsl(228,24%,4%)] pointer-events-none" />
          <div className="absolute inset-0 blueprint-pattern opacity-40 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(228,20%,7%)]/80 via-transparent to-[hsl(228,20%,7%)]/80 pointer-events-none" />
          {/* Top separator */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(225,80%,56%)]/8 to-transparent" />

          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-14 lg:mb-20">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[hsl(225,80%,65%)] mb-3 block">
                  Cómo funciona
                </span>
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-bold tracking-tight leading-[1.2]">
                   3 pasos. Cero complicaciones.
                 </h2>
              </div>
            </Reveal>

            {/* Horizontal connecting line (desktop) */}
            <div className="hidden md:block absolute top-[calc(50%+40px)] left-[16%] right-[16%] h-px">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-[hsl(225,80%,56%)]/20 to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stepsData.map((s, i) =>
              <Reveal key={s.step} delay={i * 0.15}>
                  <motion.div
                  whileHover={{
                    scale: 1.03,
                    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
                  }}
                  className="group relative text-center md:text-left p-6 sm:p-8 rounded-2xl border border-transparent hover:border-[hsl(225,80%,56%)]/15 hover:bg-[hsl(228,18%,8%)]/70 transition-all duration-500">

                    <span className="text-[5rem] sm:text-[6rem] md:text-[7rem] font-black leading-none block mb-3 bg-gradient-to-b from-[hsl(225,80%,56%)]/[0.2] to-transparent bg-clip-text text-transparent group-hover:from-[hsl(225,80%,56%)]/[0.35] group-hover:to-transparent transition-all duration-500 select-none"
                      style={{ maskImage: "linear-gradient(to bottom, white 40%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, white 40%, transparent 100%)" }}>
                      {s.step}
                    </span>

                    {/* Animated underline */}
                    <motion.div
                    className="h-[2px] w-16 mx-auto md:mx-0 mb-5 bg-gradient-to-r from-[hsl(225,80%,56%)]/50 to-transparent origin-left"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }} />


                    <h3 className="text-base sm:text-lg font-semibold mb-2 text-[hsl(0,0%,93%)]">{s.title}</h3>
                    <p className="text-sm text-[hsl(228,10%,52%)] leading-relaxed">{s.description}</p>

                    {i < 2 && <StepLine />}
                  </motion.div>
                </Reveal>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════ SOCIAL PROOF — mid depth ═══════════ */}
        <section className="py-24 md:py-32 lg:py-40 px-5 relative">
          <div className="absolute inset-0 bg-[hsl(228,20%,8%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,hsl(260,70%,58%,0.03),transparent)] pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(228,14%,18%)]/40 to-transparent" />

          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-14">
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-bold tracking-tight leading-[1.2]">
                   Hecho para equipos reales
                 </h2>
                <p className="mt-4 text-[hsl(228,10%,50%)]">
                  Diseñado en colaboración con equipos de operaciones.
                </p>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
              { quote: "Por fin un sistema que entiende nuestro flujo de trabajo. No es otro CRM genérico.", name: "Carlos M.", role: "Owner — Studio" },
              { quote: "Pasamos de hojas de cálculo a tener todo organizado en una semana. El onboarding es inmediato.", name: "María R.", role: "Operations Manager" },
              { quote: "Mi equipo reporta desde el campo. Las fotos de evidencia me ahorran llamadas.", name: "David L.", role: "Project Manager" }].
              map((t, i) =>
              <Reveal key={t.name} delay={i * 0.1}>
                  <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.5 } }}
                  className="p-6 sm:p-8 rounded-2xl border border-[hsl(228,14%,16%)]/50 bg-gradient-to-b from-[hsl(228,18%,12%)] to-[hsl(228,20%,7%)] backdrop-blur-sm hover:border-[hsl(225,80%,56%)]/12 hover:shadow-[0_8px_32px_-8px_hsl(225,80%,56%,0.06)] transition-all duration-500">

                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, j) =>
                    <div key={j} className="w-1.5 h-1.5 rounded-full bg-[hsl(225,80%,56%)]/40" />
                    )}
                    </div>
                    <p className="text-sm text-[hsl(228,10%,62%)] leading-relaxed mb-7 italic">"{t.quote}"</p>
                    <div className="border-t border-[hsl(228,14%,14%)] pt-4">
                      <p className="text-sm font-semibold text-[hsl(0,0%,90%)]">{t.name}</p>
                      <p className="text-xs text-[hsl(228,10%,42%)] mt-0.5">{t.role}</p>
                    </div>
                  </motion.div>
                </Reveal>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════ PRICING — dark with vertical gradient ═══════════ */}
        <section id="pricing" className="py-24 md:py-32 lg:py-40 px-5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(228,22%,5%)] via-[hsl(228,22%,6%)] to-[hsl(228,24%,4%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_30%,hsl(225,80%,56%,0.05),transparent)] pointer-events-none" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(225,80%,56%)]/10 to-transparent" />

          <div className="max-w-5xl mx-auto relative">
            <Reveal>
              <div className="text-center mb-10">
                <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[hsl(225,80%,65%)] mb-3 block">
                  Precios simples
                </span>
                <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3rem] font-bold tracking-tight leading-[1.2]">
                   Elige tu plan y empieza hoy
                 </h2>
                <p className="mt-4 text-[hsl(228,10%,48%)]">Sin contratos. Cancela cuando quieras.</p>
              </div>
            </Reveal>

            {/* Monthly/Annual Toggle */}
            <Reveal delay={0.1}>
              <div className="flex items-center justify-center gap-4 mb-14">
                <span className={`text-sm font-medium transition-colors duration-300 ${!isAnnual ? "text-white" : "text-[hsl(228,10%,40%)]"}`}>
                  Mensual
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative w-14 h-[30px] rounded-full transition-all duration-400 ${
                  isAnnual ?
                  "bg-[hsl(225,80%,56%)] shadow-[0_0_20px_hsl(225,80%,56%,0.3)]" :
                  "bg-[hsl(228,14%,20%)]"}`
                  }
                  aria-label="Toggle annual billing">

                  <motion.div
                    className="absolute top-[3px] w-6 h-6 rounded-full bg-white shadow-md"
                    animate={{ left: isAnnual ? "calc(100% - 27px)" : "3px" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }} />

                </button>
                <span className={`text-sm font-medium transition-colors duration-300 ${isAnnual ? "text-white" : "text-[hsl(228,10%,40%)]"}`}>
                  Anual
                </span>
                <AnimatePresence>
                  {isAnnual &&
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8, x: -8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -8 }}
                    className="text-xs font-semibold text-[hsl(160,70%,55%)] bg-[hsl(160,70%,55%)]/10 border border-[hsl(160,70%,55%)]/20 px-2.5 py-1 rounded-full">

                      -20%
                    </motion.span>
                  }
                </AnimatePresence>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {pricingPlans.map((plan, i) => {
                const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
                return (
                  <Reveal key={plan.plan} delay={i * 0.12}>
                    <motion.div
                      whileHover={{ y: -8, transition: { duration: 0.5, ease: "easeOut" } }}
                      className={`relative flex flex-col p-6 sm:p-8 rounded-2xl transition-all duration-500 ${
                      plan.recommended ?
                      "border border-[hsl(225,80%,56%)]/30 bg-gradient-to-b from-[hsl(228,18%,13%)] to-[hsl(228,20%,7%)] backdrop-blur-sm shadow-[0_24px_64px_-16px_hsl(225,80%,56%,0.25),0_0_0_1px_hsl(225,80%,56%,0.1),0_0_80px_-20px_hsl(225,80%,56%,0.12)] md:scale-[1.06]" :
                      "border border-[hsl(228,14%,16%)]/40 bg-gradient-to-b from-[hsl(228,18%,11%)] to-[hsl(228,20%,7%)] backdrop-blur-sm opacity-90 hover:opacity-100 hover:border-[hsl(228,14%,22%)] hover:shadow-[0_16px_48px_-12px_hsl(0,0%,0%,0.3)]"}`
                      }>

                      {/* Animated glow ring for recommended */}
                      {plan.recommended &&
                      <motion.div
                        className="absolute -inset-[1px] rounded-2xl pointer-events-none"
                        style={{
                          background: "linear-gradient(135deg, hsl(225 80% 56% / 0.25), hsl(260 70% 58% / 0.12), hsl(225 80% 56% / 0.25))",
                          backgroundSize: "200% 200%"
                        }}
                        animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />

                      }

                      {plan.recommended &&
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[hsl(225,80%,56%)] to-[hsl(260,70%,58%)] text-white text-[11px] font-semibold px-5 py-1.5 rounded-full shadow-[0_8px_24px_hsl(225,80%,56%,0.35)]">
                          Recomendado
                        </span>
                      }

                      <div className="relative">
                        <h3 className="text-lg font-semibold mb-1">{plan.plan}</h3>
                        {plan.recommended &&
                        <p className="text-[11px] text-[hsl(225,80%,65%)] mb-2">Más elegido por talleres en crecimiento</p>
                        }
                        <div className="flex items-baseline gap-1 mb-1">
                          <AnimatedPrice value={price} />
                          <span className="text-sm text-[hsl(228,10%,40%)]">/mes</span>
                        </div>
                        {isAnnual &&
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="text-xs text-[hsl(228,10%,42%)] mb-5">

                            Facturado anualmente · <span className="line-through text-[hsl(228,10%,30%)]">${plan.priceMonthly}/mes</span>
                          </motion.p>
                        }
                        {!isAnnual && <div className="mb-5" />}

                        <ul className="space-y-3.5 mb-9 flex-1">
                          {plan.features.map((f, fi) =>
                          <motion.li
                            key={f}
                            className="flex items-start gap-2.5 text-sm text-[hsl(228,10%,54%)]"
                            initial={{ opacity: 0, x: -8 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 + fi * 0.05 }}>

                              <Check className="w-4 h-4 text-[hsl(225,80%,60%)] mt-0.5 flex-shrink-0" />
                              {f}
                            </motion.li>
                          )}
                        </ul>

                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                          <Button
                            onClick={() => handlePlanSelect(plan.plan)}
                            className={`w-full rounded-2xl font-medium transition-all duration-500 ${
                            plan.recommended ?
                            "bg-[hsl(225,80%,56%)] text-white hover:bg-[hsl(225,80%,52%)] shadow-[0_8px_32px_hsl(225,80%,56%,0.3)] hover:shadow-[0_16px_48px_hsl(225,80%,56%,0.5)]" :
                            "bg-white/[0.04] text-white hover:bg-white/[0.08] border border-[hsl(228,14%,20%)] hover:border-[hsl(228,14%,28%)]"}`
                            }>

                            Elegir {plan.plan}
                            <ArrowRight className="w-4 h-4 ml-1.5" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </Reveal>);

              })}
            </div>
          </div>
        </section>

        {/* ═══════════ FINAL CTA — deepest section ═══════════ */}
        <section className="py-28 md:py-36 lg:py-44 px-5 relative overflow-hidden">
          <div className="absolute inset-0 blueprint-pattern opacity-30 pointer-events-none" />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(135deg, hsl(228 24% 4%), hsl(225 30% 8%), hsl(260 20% 6%), hsl(228 24% 4%))", backgroundSize: "400% 400%" }}
            animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />

          {/* Bright glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[hsl(225,80%,56%)]/[0.1] rounded-full blur-[140px] pointer-events-none" />
          {/* Top separator with glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[hsl(225,80%,56%)]/15 to-transparent" />

          <Reveal>
            <div className="relative max-w-3xl mx-auto text-center">
              <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[3.25rem] font-bold leading-[1.25] tracking-[-0.01em] mb-5">
                ¿Listo para ordenar{" "}
                <span className="block sm:inline">tu producción?</span>
              </h2>
              <p className="text-base sm:text-lg text-[hsl(228,10%,52%)] mb-10 max-w-xl mx-auto leading-relaxed">
                Deja de perder tiempo con hojas de cálculo. Sign Flow organiza tu taller desde el primer día.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{ boxShadow: ["0 0 0 0 hsl(225 80% 56% / 0)", "0 0 0 10px hsl(225 80% 56% / 0.06)", "0 0 0 0 hsl(225 80% 56% / 0)"] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-full">

                  <Button
                    size="lg"
                    onClick={() => scrollTo("pricing")}
                    className="bg-[hsl(225,80%,56%)] text-white hover:bg-[hsl(225,80%,52%)] rounded-full px-10 text-base font-semibold shadow-[0_12px_40px_hsl(225,80%,56%,0.35)] hover:shadow-[0_16px_48px_hsl(225,80%,56%,0.55)] transition-all duration-300">

                    Elegir Plan
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => scrollTo("how")}
                    className="rounded-full px-10 text-base font-medium border-[hsl(228,14%,20%)] text-[hsl(228,10%,60%)] hover:text-white hover:border-[hsl(225,80%,56%)]/30 hover:bg-[hsl(225,80%,56%)]/[0.06] bg-transparent transition-all duration-300">

                    Ver Demo
                  </Button>
                </motion.div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="border-t border-[hsl(228,14%,10%)] py-10 sm:py-12 px-5 relative" role="contentinfo">
          <div className="absolute inset-0 bg-[hsl(228,24%,3%)] pointer-events-none" />
          <div className="relative max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <BrandLogo size={24} showText variant="iconWithText" textClassName="text-sm text-[hsl(228,10%,40%)]" />
            </div>
            <p className="text-xs text-[hsl(228,10%,32%)]">© {new Date().getFullYear()} Sign Flow. Todos los derechos reservados.</p>
            <nav className="flex items-center gap-6 text-xs text-[hsl(228,10%,35%)]">
              <a href="#" className="hover:text-[hsl(228,10%,65%)] transition-colors duration-500">Privacidad</a>
              <a href="#" className="hover:text-[hsl(228,10%,65%)] transition-colors duration-500">Términos</a>
              <a href="#" className="hover:text-[hsl(228,10%,65%)] transition-colors duration-500">Soporte</a>
            </nav>

            <div className="flex items-center gap-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) =>
              <a
                key={i}
                href="#"
                className="w-8 h-8 rounded-full border border-[hsl(228,14%,14%)] flex items-center justify-center text-[hsl(228,10%,30%)] hover:text-[hsl(228,10%,65%)] hover:border-[hsl(228,14%,22%)] transition-all duration-500">

                  <Icon className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>);

};

export default Index;