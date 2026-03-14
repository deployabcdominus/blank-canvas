import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div style={{ background: "#000", color: "#F5F5F7", fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif", WebkitFontSmoothing: "antialiased", overflowX: "hidden" }}>

      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", background: scrolled ? "rgba(0,0,0,0.90)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none", transition: "all 300ms ease" }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#F5F5F7", letterSpacing: "-0.01em" }}>Sign Flow</span>
        <div style={{ display: "flex", gap: 28 }}>
          {["Características","Precios","Demo"].map(l => <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 13, color: "#6E6E73", textDecoration: "none", letterSpacing: "0.01em" }}>{l}</a>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/login" style={{ fontSize: 13, color: "#6E6E73", textDecoration: "none" }}>Iniciar sesión</Link>
          <Link to="/access" style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: "#5B6AF2", padding: "7px 18px", borderRadius: 980, textDecoration: "none" }}>Elegir Plan →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "120px 48px 80px", textAlign: "center", background: "radial-gradient(ellipse 90% 50% at 50% -5%,rgba(91,106,242,0.20),transparent 65%)" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 980, background: "rgba(91,106,242,0.10)", border: "1px solid rgba(91,106,242,0.30)", fontSize: 12, color: "#8B9CF8", marginBottom: 28 }}>
          <span style={{ color: "#5B6AF2" }}>✦</span> Diseñado para agencias de señalética
        </div>
        <h1 style={{ fontSize: "clamp(52px,8vw,80px)", fontWeight: 800, lineHeight: 1.0, letterSpacing: "-0.04em", margin: "0 0 20px", color: "#F5F5F7" }}>
          Gestiona tu agencia<br />de señalética<br />
          <span style={{ background: "linear-gradient(135deg,#818CF8,#A78BFA,#C084FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>sin caos.</span>
        </h1>
        <p style={{ fontSize: 19, color: "#A1A1A6", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 36px" }}>
          Leads, propuestas, producción e instalaciones en un solo flujo.<br />Tu equipo alineado. Tus clientes informados.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
          <Link to="/access" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 980, background: "#5B6AF2", color: "#fff", fontWeight: 600, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 24px rgba(91,106,242,0.40)" }}>Empezar gratis →</Link>
          <a href="#demo" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 980, border: "1px solid rgba(255,255,255,0.14)", color: "#F5F5F7", fontSize: 15, textDecoration: "none" }}>Ver demo</a>
        </div>
        <p style={{ fontSize: 13, color: "#6E6E73", marginBottom: 60 }}>
          <span style={{ color: "#FF9F0A" }}>★★★★★</span> Usado por agencias en Miami · CDMX · Bogotá · Madrid
        </p>

        {/* BROWSER MOCKUP */}
        <div style={{ maxWidth: 860, margin: "0 auto", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 0 1px rgba(255,255,255,0.05),0 40px 120px rgba(0,0,0,0.80),0 0 80px rgba(91,106,242,0.12)", transform: "perspective(1400px) rotateX(5deg)", transformOrigin: "top center" }}>
          <div style={{ background: "#111", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["#FF453A","#FF9F0A","#32D74B"].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "4px 12px", fontSize: 11, color: "#6E6E73", textAlign: "center" }}>signflowapp.com/dashboard</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#32D74B" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#32D74B" }} />En vivo
            </div>
          </div>
          <img src="/screenshots/dashboard.png" alt="Sign Flow Dashboard" style={{ width: "100%", display: "block" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <div style={{ padding: "24px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "#3A3A3C", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Confiado por agencias en</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, fontSize: 13, color: "#4A4A4A" }}>
          {["Miami","Ciudad de México","Bogotá","Buenos Aires","Madrid"].map(c => <span key={c}>{c}</span>)}
        </div>
      </div>

      {/* PROBLEMA / SOLUCIÓN */}
      <section style={{ padding: "120px 48px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", textAlign: "center", lineHeight: 1.05, marginBottom: 60 }}>
            Tu agencia merece más que<br /><span style={{ color: "#6E6E73" }}>hojas de cálculo y WhatsApps.</span>
          </h2>
          {[
            ["Leads perdidos en el chat","Pipeline visual con seguimiento"],
            ["Propuestas en Word sin control","PDF profesional con un clic"],
            ["Órdenes por WhatsApp","Órdenes con estado en tiempo real"],
            ["Fotos en el teléfono","Evidencias en la nube por proyecto"],
            ["Sin idea del estado financiero","Dashboard con ingresos en vivo"],
          ].map(([before, after], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", alignItems: "center", padding: "22px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <span style={{ fontSize: 15, color: "#FF453A", textDecoration: "line-through" }}>{before}</span>
              <span style={{ color: "#5B6AF2", fontSize: 20, textAlign: "center" }}>→</span>
              <span style={{ fontSize: 15, color: "#F5F5F7", fontWeight: 600 }}>{after}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="demo" style={{ padding: "120px 48px", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 8 }}>Todo lo que necesitas,</h2>
          <p style={{ fontSize: 18, color: "#6E6E73", textAlign: "center", marginBottom: 40 }}>nada que no usarás.</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 32 }}>
            {["Dashboard ejecutivo","Leads y propuestas","Producción e instalación","Gestión de equipo"].map((tab, i) => (
              <div key={tab} style={{ padding: "8px 18px", borderRadius: 980, fontSize: 13, fontWeight: 500, cursor: "pointer", border: i === 0 ? "1px solid rgba(91,106,242,0.40)" : "1px solid rgba(255,255,255,0.10)", background: i === 0 ? "rgba(91,106,242,0.15)" : "transparent", color: i === 0 ? "#8B9CF8" : "#6E6E73" }}>{tab}</div>
            ))}
          </div>
          <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ padding: "28px 36px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: "#F5F5F7", marginBottom: 8 }}>Todo tu negocio en una pantalla.</h3>
              <p style={{ fontSize: 15, color: "#A1A1A6", lineHeight: 1.6, margin: 0 }}>KPIs en tiempo real, briefing de IA cada mañana y pipeline visual. Sabes exactamente qué atender antes de abrir el primer WhatsApp.</p>
            </div>
            <img src="/screenshots/dashboard.png" alt="Dashboard Sign Flow" style={{ width: "100%", display: "block" }}
              onError={(e) => { (e.target as HTMLImageElement).style.height = "240px"; (e.target as HTMLImageElement).style.background = "#050505"; }} />
          </div>
        </div>
      </section>

      {/* 3 PASOS */}
      <section style={{ padding: "120px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 8 }}>De lead a entrega</h2>
          <p style={{ fontSize: 18, color: "#6E6E73", textAlign: "center", marginBottom: 72 }}>en 3 pasos.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
            {[
              { n: "01", t: "Captura el lead", d: "El cliente llega por referido, Instagram o tu web. Lo registras en segundos con toda su info y el servicio que necesita." },
              { n: "02", t: "Cotiza y produce", d: "Genera propuesta con PDF profesional. Al aprobarla se crea la orden de producción automáticamente." },
              { n: "03", t: "Instala y cobra", d: "Tu equipo recibe la orden. Suben evidencias. El cliente recibe notificación. Tú cobras." },
            ].map((s, i) => (
              <div key={i} style={{ padding: "0 40px", borderRight: i < 2 ? "1px dashed rgba(255,255,255,0.08)" : "none" }}>
                <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg,#5B6AF2,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", opacity: 0.45, marginBottom: 16 }}>{s.n}</div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: "#F5F5F7", marginBottom: 10 }}>{s.t}</h3>
                <p style={{ fontSize: 14, color: "#6E6E73", lineHeight: 1.7, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section style={{ padding: "120px 48px", background: "rgba(255,255,255,0.015)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 8 }}>Agencias que ya ordenaron</h2>
          <p style={{ fontSize: 18, color: "#6E6E73", textAlign: "center", marginBottom: 56 }}>su operación.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { i: "CM", n: "Carlos M.", r: "Director · SignMakers Miami", t: "\"Antes perdíamos leads por no dar seguimiento. Ahora el dashboard nos avisa qué está caliente y qué atender hoy.\"" },
              { i: "ER", n: "Elena R.", r: "Gerente · VisualCorp CDMX", t: "\"Las propuestas en PDF con nuestro logo cambiaron cómo nos perciben. Cerramos 30% más en el primer mes.\"" },
              { i: "DL", n: "David L.", r: "Operaciones · BrandSpace Bogotá", t: "\"Por fin sé dónde está cada instalación sin llamar a nadie. El mapa en tiempo real vale solo el precio del plan.\"" },
            ].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 28 }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {[...Array(5)].map((_,j) => <span key={j} style={{ color: "#FF9F0A", fontSize: 13 }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, color: "#A1A1A6", fontStyle: "italic", lineHeight: 1.75, margin: "0 0 20px" }}>{p.t}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(91,106,242,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#8B9CF8", flexShrink: 0 }}>{p.i}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F5F5F7" }}>{p.n}</div>
                    <div style={{ fontSize: 11, color: "#6E6E73" }}>{p.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRECIOS */}
      <section id="precios" style={{ padding: "120px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(32px,5vw,48px)", fontWeight: 800, letterSpacing: "-0.03em", textAlign: "center", marginBottom: 8 }}>Elige tu plan.</h2>
          <p style={{ fontSize: 18, color: "#6E6E73", textAlign: "center", marginBottom: 48 }}>Sin contratos. Cancela cuando quieras.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {[
              { name: "Starter", price: 49, features: ["Hasta 3 usuarios","Leads y propuestas","Órdenes de servicio","Soporte por email"], cta: "Elegir Starter", h: false },
              { name: "Professional", price: 99, features: ["Hasta 10 usuarios","Todo de Starter","AI Briefing diario","PDF de propuestas","Reportes avanzados"], cta: "Elegir Professional →", h: true },
              { name: "Enterprise", price: 199, features: ["Usuarios ilimitados","Todo de Professional","Onboarding dedicado","SLA garantizado"], cta: "Contactar ventas", h: false },
            ].map((plan, i) => (
              <div key={i} style={{ background: plan.h ? "rgba(91,106,242,0.07)" : "rgba(255,255,255,0.03)", border: plan.h ? "1px solid rgba(91,106,242,0.40)" : "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: 32, position: "relative", boxShadow: plan.h ? "0 0 80px rgba(91,106,242,0.10)" : "none" }}>
                {plan.h && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "rgba(91,106,242,0.25)", border: "1px solid rgba(91,106,242,0.45)", borderRadius: 980, padding: "3px 14px", fontSize: 11, fontWeight: 700, color: "#8B9CF8", whiteSpace: "nowrap" }}>Más popular</div>}
                <div style={{ fontSize: 13, fontWeight: 600, color: "#A1A1A6", marginBottom: 10 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, color: "#F5F5F7", lineHeight: 1, letterSpacing: "-0.02em" }}>${plan.price}</span>
                  <span style={{ fontSize: 14, color: "#6E6E73" }}>/mes</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#A1A1A6" }}>
                      <span style={{ color: "#32D74B", fontSize: 12, flexShrink: 0 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <Link to="/access" style={{ display: "block", textAlign: "center", padding: 11, borderRadius: 10, fontWeight: 600, fontSize: 13, textDecoration: "none", background: plan.h ? "#5B6AF2" : "transparent", color: plan.h ? "#fff" : "#F5F5F7", border: plan.h ? "none" : "1px solid rgba(255,255,255,0.14)", boxShadow: plan.h ? "0 4px 20px rgba(91,106,242,0.35)" : "none" }}>{plan.cta}</Link>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: "#6E6E73", marginTop: 20 }}>✓ 14 días gratis &nbsp;·&nbsp; ✓ Sin tarjeta de crédito &nbsp;·&nbsp; ✓ Cancela cuando quieras</p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: "140px 48px", textAlign: "center", background: "linear-gradient(180deg,#000 0%,#080810 100%)", borderTop: "1px solid rgba(91,106,242,0.12)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 90% at 50% 110%,rgba(91,106,242,0.14),transparent 70%)", pointerEvents: "none" }} />
        <h2 style={{ fontSize: "clamp(40px,6vw,68px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 16, position: "relative" }}>¿Listo para ordenar<br />tu agencia?</h2>
        <p style={{ color: "#6E6E73", fontSize: 18, marginBottom: 40, position: "relative" }}>Empieza gratis hoy. Tu equipo lo agradecerá.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", position: "relative" }}>
          <Link to="/access" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", borderRadius: 980, textDecoration: "none", background: "#5B6AF2", color: "#fff", fontWeight: 600, fontSize: 16, boxShadow: "0 4px 32px rgba(91,106,242,0.45)" }}>Empezar gratis →</Link>
          <a href="mailto:hello@mail.signflowapp.com" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", borderRadius: 980, textDecoration: "none", background: "transparent", color: "#F5F5F7", fontWeight: 500, fontSize: 16, border: "1px solid rgba(255,255,255,0.15)" }}>Hablar con ventas</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#000", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 48px 28px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#F5F5F7", marginBottom: 8 }}>Sign Flow</div>
              <div style={{ fontSize: 13, color: "#6E6E73", lineHeight: 1.6 }}>La plataforma de gestión operacional para agencias de señalética.</div>
            </div>
            {[
              { title: "Producto", links: ["Características","Precios","Demo"] },
              { title: "Empresa", links: ["Sobre nosotros","Blog","Contacto"] },
              { title: "Legal", links: ["Privacidad","Términos","Cookies"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6E6E73", textTransform: "uppercase" as const, letterSpacing: "0.10em", marginBottom: 14 }}>{col.title}</div>
                {col.links.map(l => <a key={l} href="#" style={{ display: "block", fontSize: 13, color: "#6E6E73", textDecoration: "none", marginBottom: 10 }}>{l}</a>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20, display: "flex", justifyContent: "space-between", fontSize: 12, color: "#3A3A3C" }}>
            <span>© 2026 Sign Flow · signflowapp.com</span>
            <span>Todos los derechos reservados</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
