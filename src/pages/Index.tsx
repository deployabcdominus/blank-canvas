import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Zap, BarChart2, FileText, Users, Shield, Clock, TrendingUp } from "lucide-react";

const O = "#FF5722";
const O2 = "#FF7043";
const O3 = "rgba(255,87,34,0.15)";
const O4 = "rgba(255,87,34,0.08)";
const BG = "#111318";
const BG2 = "#16181F";
const BG3 = "#1E2028";
const CARD = "#1A1D26";
const BORDER = "rgba(255,87,34,0.18)";
const BORDER2 = "rgba(255,255,255,0.06)";
const WHITE = "#F5F5F7";
const MUTED = "#9A9DB0";
const DIM = "#5A5D70";

const glow = `0 0 32px rgba(255,87,34,0.35), 0 4px 16px rgba(255,87,34,0.20)`;
const glowSm = `0 0 18px rgba(255,87,34,0.25)`;
const cardShadow = `0 4px 24px rgba(0,0,0,0.40)`;

const s: Record<string, React.CSSProperties> = {
  page: { background: BG, color: WHITE, fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif", WebkitFontSmoothing: "antialiased", overflowX: "hidden" },
  nav: { position: "sticky" as const, top: 0, zIndex: 100, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 56px", background: "rgba(17,19,24,0.92)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${BORDER2}` },
  logo: { display: "flex", alignItems: "center", gap: 10, fontSize: 18, fontWeight: 800, color: WHITE, letterSpacing: "-0.02em" },
  logoIcon: { width: 32, height: 32, background: O, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: glowSm },
  navLinks: { display: "flex", gap: 32 },
  navLink: { fontSize: 13, color: MUTED, textDecoration: "none", letterSpacing: "0.01em", transition: "color 150ms" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 6, background: O, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", boxShadow: glow, border: "none", cursor: "pointer", transition: "all 180ms ease" },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 6, border: `1px solid rgba(255,255,255,0.15)`, color: WHITE, fontWeight: 600, fontSize: 14, textDecoration: "none", background: "transparent", cursor: "pointer" },
  btnLg: { padding: "14px 32px", fontSize: 16, borderRadius: 8 },
};

function HexGrid() {
  return (
    <svg width="480" height="360" viewBox="0 0 480 360" style={{ position: "absolute", right: -40, top: -20, opacity: 0.9 }}>
      <defs>
        <radialGradient id="og" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF5722" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#FF5722" stopOpacity="0"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <g transform="translate(240,180)" filter="url(#glow)">
        {[-120,-80,-40,0,40,80,120].map(x => (
          <line key={`h${x}`} x1={x} y1="-80" x2={x-60} y2="40" stroke="rgba(255,87,34,0.15)" strokeWidth="0.5"/>
        ))}
        {[-120,-80,-40,0,40,80,120].map(x => (
          <line key={`v${x}`} x1={x} y1="-80" x2={x+60} y2="40" stroke="rgba(255,87,34,0.15)" strokeWidth="0.5"/>
        ))}
        <ellipse cx="0" cy="40" rx="140" ry="24" fill="rgba(255,87,34,0.06)" stroke="rgba(255,87,34,0.20)" strokeWidth="1"/>
        <rect x="-18" y="-60" width="36" height="100" rx="4" fill={BG3} stroke={O} strokeWidth="1"/>
        <rect x="-18" y="-60" width="36" height="20" rx="4" fill={O}/>
        <ellipse cx="0" cy="-60" rx="30" ry="8" fill="url(#og)" opacity="0.8"/>
        {[[-100,-20],[-80,10],[80,-30],[100,5],[-60,-50],[60,-45]].map(([nx,ny],i) => (
          <g key={i} transform={`translate(${nx},${ny})`}>
            <ellipse rx="18" ry="6" cy="12" fill="rgba(255,87,34,0.08)" stroke="rgba(255,87,34,0.15)" strokeWidth="0.5"/>
            <rect x="-10" y="-12" width="20" height="24" rx="3" fill={BG3} stroke="rgba(255,87,34,0.30)" strokeWidth="0.8"/>
            <rect x="-10" y="-12" width="20" height="7" rx="3" fill="rgba(255,87,34,0.20)"/>
            <circle cy="-6" r="2" fill={O} opacity="0.8"/>
          </g>
        ))}
        {[[-100,-20],[-80,10],[80,-30],[100,5]].map(([nx,ny],i) => (
          <line key={`c${i}`} x1={nx*0.4} y1={ny*0.4} x2={nx*0.9} y2={ny*0.9} stroke={O} strokeWidth="0.6" strokeDasharray="3 3" opacity="0.4"/>
        ))}
      </g>
    </svg>
  );
}

function StatCard({ icon, val, label, color = O }: { icon: React.ReactNode; val: string; label: string; color?: string }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, boxShadow: cardShadow }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: O4, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: WHITE, lineHeight: 1 }}>{val}</div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 3 }}>{label}</div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 14, padding: "28px 24px", textAlign: "center", transition: "all 200ms ease", cursor: "default" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px rgba(255,87,34,0.12)`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER2; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: O4, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", color: O, margin: "0 auto 16px", fontSize: 22 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: WHITE, margin: "0 0 10px" }}>{title}</h3>
      <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: 0 }}>{desc}</p>
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={s.page}>

      {/* NAV */}
      <nav style={{ ...s.nav, background: scrolled ? "rgba(17,19,24,0.96)" : "rgba(17,19,24,0.60)", borderBottomColor: scrolled ? BORDER2 : "transparent" }}>
        <div style={s.logo}>
          <div style={s.logoIcon}>⚡</div>
          Sign Flow
        </div>
        <div style={s.navLinks}>
          {["Características","Precios","Demo","Blog"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={s.navLink}
              onMouseEnter={e => (e.target as HTMLElement).style.color = WHITE}
              onMouseLeave={e => (e.target as HTMLElement).style.color = MUTED}>{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/login" style={s.btnGhost}>Iniciar sesión</Link>
          <Link to="/access" style={s.btnPrimary}>Empezar gratis →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "100px 56px 80px", position: "relative", overflow: "hidden", minHeight: 600, background: `linear-gradient(135deg, ${BG} 0%, #141620 100%)` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,87,34,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,87,34,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -100, right: 200, width: 400, height: 400, background: "radial-gradient(circle, rgba(255,87,34,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: 60, position: "relative" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 4, background: O4, border: `1px solid ${BORDER}`, fontSize: 12, color: O, fontWeight: 600, marginBottom: 24, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>
              ⚡ Plataforma operacional para PYMEs
            </div>
            <h1 style={{ fontSize: "clamp(36px,4.5vw,58px)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 20px", color: WHITE }}>
              Gestiona tu negocio<br />
              <span style={{ color: O, textShadow: `0 0 40px rgba(255,87,34,0.50)` }}>de punta a punta.</span>
            </h1>
            <p style={{ fontSize: 17, color: MUTED, lineHeight: 1.7, margin: "0 0 36px", maxWidth: 460 }}>
              Desde el primer lead hasta el cobro final. Sign Flow conecta ventas, producción e instalaciones en un solo flujo para cualquier PYME.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, marginBottom: 40 }}>
              <Link to="/access" style={{ ...s.btnPrimary, ...s.btnLg }}>
                Empezar gratis — 14 días <ArrowRight size={16} />
              </Link>
              <a href="#demo" style={{ ...s.btnGhost, ...s.btnLg }}>Ver demo</a>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" as const }}>
              {["Sin tarjeta de crédito","Cancela cuando quieras","Setup en 5 minutos"].map(t => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: MUTED }}>
                  <Check size={13} style={{ color: O }} />{t}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative", height: 360 }}>
            <HexGrid />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: BG2, borderTop: `1px solid ${BORDER2}`, borderBottom: `1px solid ${BORDER2}`, padding: "40px 56px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          <StatCard icon={<Users size={20}/>} val="500+" label="Negocios activos" />
          <StatCard icon={<TrendingUp size={20}/>} val="$2.4M" label="Procesado este mes" />
          <StatCard icon={<Zap size={20}/>} val="98%" label="Uptime garantizado" />
          <StatCard icon={<Clock size={20}/>} val="3 min" label="Setup promedio" />
        </div>
      </section>

      {/* PROBLEMA / SOLUCIÓN */}
      <section style={{ padding: "100px 56px", background: BG }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontSize: 12, color: O, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.10em", marginBottom: 12 }}>¿Por qué Sign Flow?</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", color: WHITE, margin: "0 0 14px" }}>
              Tu negocio merece más que<br /><span style={{ color: O }}>WhatsApps y Excel.</span>
            </h2>
            <p style={{ fontSize: 16, color: MUTED, maxWidth: 500, margin: "0 auto" }}>Cada día que operas sin sistema pierdes tiempo, dinero y clientes.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0 }}>
            <div style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: "14px 0 0 14px", padding: "28px 32px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: DIM, textTransform: "uppercase" as const, letterSpacing: "0.10em", marginBottom: 16 }}>Sin Sign Flow</div>
              {["Leads perdidos en el chat","Cotizaciones en Word","Órdenes por voz","Fotos en el celular","Sin control financiero"].map((t,i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${BORDER2}` : "none" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF453A", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: MUTED, textDecoration: "line-through" }}>{t}</span>
                </div>
              ))}
            </div>
            <div style={{ background: O, width: 48, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 22, color: "#fff", fontWeight: 700 }}>→</span>
            </div>
            <div style={{ background: `linear-gradient(135deg, ${CARD}, #1F2235)`, border: `1px solid ${BORDER}`, borderRadius: "0 14px 14px 0", padding: "28px 32px", boxShadow: `0 0 40px rgba(255,87,34,0.08)` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: O, textTransform: "uppercase" as const, letterSpacing: "0.10em", marginBottom: 16 }}>Con Sign Flow</div>
              {["Pipeline visual en tiempo real","PDF profesional con un clic","Órdenes asignadas con estado","Evidencias en la nube","Dashboard financiero en vivo"].map((t,i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${BORDER}` : "none" }}>
                  <Check size={14} style={{ color: O, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: WHITE, fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="demo" style={{ padding: "100px 56px", background: BG2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: O, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.10em", marginBottom: 12 }}>Características</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", color: WHITE, margin: 0 }}>
              Todo en uno. <span style={{ color: O }}>Sin complicaciones.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            <FeatureCard icon={<BarChart2 size={22}/>} title="Dashboard ejecutivo" desc="KPIs en tiempo real + briefing de IA cada mañana. Sabes exactamente qué atender antes de abrir el primer mensaje." />
            <FeatureCard icon={<FileText size={22}/>} title="Leads y propuestas" desc="Captura leads, genera propuestas en PDF con tu logo y cierra más rápido con seguimiento automático." />
            <FeatureCard icon={<Zap size={22}/>} title="Producción e instalación" desc="Órdenes automáticas al aprobar propuestas. Tu equipo sabe qué hacer y cuándo. Sin llamadas." />
            <FeatureCard icon={<TrendingUp size={22}/>} title="Control financiero" desc="Ve exactamente cuánto entra, cuánto está pendiente y cuál es tu pipeline de ingresos para el mes." />
            <FeatureCard icon={<Users size={22}/>} title="Gestión de equipo" desc="5 roles con permisos granulares. Cada miembro ve exactamente lo que necesita para su trabajo." />
            <FeatureCard icon={<Shield size={22}/>} title="Seguro y confiable" desc="RLS en Supabase, datos aislados por empresa y acceso protegido por roles. Tu información solo la ves tú." />
          </div>
        </div>
      </section>

      {/* 3 PASOS */}
      <section style={{ padding: "100px 56px", background: BG, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,87,34,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,87,34,0.025) 1px, transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, color: O, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.10em", marginBottom: 12 }}>Cómo funciona</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", color: WHITE, margin: 0 }}>
              Del contacto al cobro<br /><span style={{ color: O }}>en 3 pasos.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, position: "relative" }}>
            <div style={{ position: "absolute", top: 36, left: "16.5%", right: "16.5%", height: 2, background: `linear-gradient(90deg, ${O}, ${O2}, ${O})`, opacity: 0.4, zIndex: 0 }} />
            {[
              { n: "01", t: "Captura y convierte", d: "Registra cada lead con su info y servicio. Genera propuestas PDF con tu logo. Cierra más con seguimiento automático." },
              { n: "02", t: "Produce y coordina", d: "Al aprobar la propuesta se crea la orden automáticamente. Tu equipo recibe asignación en su app al instante." },
              { n: "03", t: "Entrega y cobra", d: "El equipo sube evidencias desde campo. El cliente recibe notificación. Tú ves el ingreso en el dashboard." },
            ].map((step, i) => (
              <div key={i} style={{ padding: "0 32px", textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: i === 1 ? O : CARD, border: `2px solid ${O}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: i === 1 ? glow : "none", fontSize: 22, fontWeight: 900, color: i === 1 ? "#fff" : O }}>
                  {step.n}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: WHITE, margin: "0 0 12px" }}>{step.t}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7, margin: 0 }}>{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section style={{ padding: "100px 56px", background: BG2 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: O, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.10em", marginBottom: 12 }}>Testimonios</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", color: WHITE, margin: 0 }}>
              Negocios que ya <span style={{ color: O }}>ordenaron su operación.</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { i: "CM", n: "Carlos M.", r: "Director · Taller de señalética, Miami", t: "Antes perdíamos leads por no dar seguimiento a tiempo. Ahora el dashboard me avisa qué está caliente cada mañana." },
              { i: "ER", n: "Elena R.", r: "Gerente · Empresa de instalaciones, CDMX", t: "Mandamos propuestas en PDF con nuestro logo desde el celular. Los clientes lo perciben diferente y cerramos 30% más." },
              { i: "DL", n: "David L.", r: "Operaciones · Servicios de campo, Bogotá", t: "Coordinamos 8 técnicos sin un solo WhatsApp de confusión. Cada uno sabe su orden del día al entrar a la app." },
            ].map((p, i) => (
              <div key={i} style={{ background: CARD, border: `1px solid ${BORDER2}`, borderRadius: 14, padding: 28, transition: "all 200ms" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px rgba(255,87,34,0.10)`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER2; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {[...Array(5)].map((_,j) => <span key={j} style={{ color: O, fontSize: 14 }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, color: MUTED, fontStyle: "italic", lineHeight: 1.75, margin: "0 0 20px" }}>"{p.t}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: O4, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: O, flexShrink: 0 }}>{p.i}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: WHITE }}>{p.n}</div>
                    <div style={{ fontSize: 11, color: DIM }}>{p.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" style={{ padding: "100px 56px", background: BG }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ fontSize: 12, color: O, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.10em", marginBottom: 12 }}>Precios</div>
            <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, letterSpacing: "-0.03em", color: WHITE, margin: "0 0 12px" }}>Elige tu plan.</h2>
            <p style={{ fontSize: 16, color: MUTED }}>Sin contratos. Sin sorpresas. Cancela cuando quieras.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { name: "Starter", price: 49, features: ["Hasta 3 usuarios","Leads y propuestas","Órdenes de servicio","Soporte por email"], hi: false },
              { name: "Professional", price: 99, features: ["Hasta 10 usuarios","Todo de Starter","AI Briefing diario","PDF de propuestas","Reportes avanzados"], hi: true },
              { name: "Enterprise", price: 199, features: ["Usuarios ilimitados","Todo de Professional","Onboarding dedicado","SLA garantizado"], hi: false },
            ].map((plan, i) => (
              <div key={i} style={{ background: plan.hi ? `linear-gradient(135deg, #1F2035, #252840)` : CARD, border: `1px solid ${plan.hi ? O : BORDER2}`, borderRadius: 16, padding: 32, position: "relative", boxShadow: plan.hi ? `0 0 60px rgba(255,87,34,0.15)` : cardShadow }}>
                {plan.hi && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: O, borderRadius: 4, padding: "4px 16px", fontSize: 11, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", boxShadow: glowSm }}>
                    MÁS POPULAR
                  </div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.hi ? O : MUTED, marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 52, fontWeight: 900, color: WHITE, lineHeight: 1, letterSpacing: "-0.03em" }}>${plan.price}</span>
                  <span style={{ fontSize: 15, color: DIM }}>/mes</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: MUTED }}>
                      <Check size={14} style={{ color: O, flexShrink: 0 }} />{f}
                    </div>
                  ))}
                </div>
                <Link to="/access" style={{ display: "block", textAlign: "center", padding: "12px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none", background: plan.hi ? O : "transparent", color: plan.hi ? "#fff" : WHITE, border: plan.hi ? "none" : `1px solid rgba(255,255,255,0.15)`, boxShadow: plan.hi ? glow : "none" }}>
                  {plan.hi ? "Elegir Professional →" : plan.name === "Enterprise" ? "Contactar ventas" : "Elegir Starter"}
                </Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 13, color: DIM, marginTop: 24 }}>
            ✓ 14 días gratis &nbsp;·&nbsp; ✓ Sin tarjeta de crédito &nbsp;·&nbsp; ✓ Cancela cuando quieras
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "120px 56px", textAlign: "center", background: `linear-gradient(135deg, ${BG} 0%, #16111A 100%)`, borderTop: `1px solid ${BORDER}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(255,87,34,0.12), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,87,34,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,87,34,0.03) 1px, transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 12, color: O, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.10em", marginBottom: 20 }}>⚡ Empieza hoy</div>
          <h2 style={{ fontSize: "clamp(36px,5vw,64px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, margin: "0 0 16px", color: WHITE }}>
            ¿Listo para ordenar<br /><span style={{ color: O, textShadow: `0 0 40px rgba(255,87,34,0.50)` }}>tu negocio?</span>
          </h2>
          <p style={{ fontSize: 18, color: MUTED, margin: "0 0 40px" }}>Empieza gratis hoy. Tu equipo lo notará mañana.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" as const }}>
            <Link to="/access" style={{ ...s.btnPrimary, ...s.btnLg, fontSize: 16 }}>
              Empezar gratis — 14 días <ArrowRight size={16} />
            </Link>
            <a href="mailto:hello@mail.signflowapp.com" style={{ ...s.btnGhost, ...s.btnLg, fontSize: 16 }}>
              Hablar con ventas
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0D0F14", borderTop: `1px solid ${BORDER2}`, padding: "48px 56px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ ...s.logo, marginBottom: 12, fontSize: 16 }}>
                <div style={{ ...s.logoIcon, width: 28, height: 28, fontSize: 14 }}>⚡</div>
                Sign Flow
              </div>
              <div style={{ fontSize: 13, color: DIM, lineHeight: 1.7 }}>La plataforma operacional para negocios que venden y entregan productos o servicios.</div>
            </div>
            {[
              { title: "Producto", links: ["Características","Precios","Demo","Changelog"] },
              { title: "Empresa", links: ["Sobre nosotros","Blog","Contacto"] },
              { title: "Legal", links: ["Privacidad","Términos","Cookies"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 11, fontWeight: 700, color: O, textTransform: "uppercase" as const, letterSpacing: "0.12em", marginBottom: 14 }}>{col.title}</div>
                {col.links.map(l => <a key={l} href="#" style={{ display: "block", fontSize: 13, color: DIM, textDecoration: "none", marginBottom: 9, transition: "color 150ms" }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = WHITE}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = DIM}>{l}</a>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER2}`, paddingTop: 20, display: "flex", justifyContent: "space-between", fontSize: 12, color: DIM }}>
            <span>© 2026 Sign Flow · signflowapp.com</span>
            <span>Todos los derechos reservados</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
