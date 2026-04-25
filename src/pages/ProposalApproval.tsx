import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, FileText, AlertTriangle, Loader2, Eraser, Mail, ShieldCheck, Clock, User, PenTool } from "lucide-react";

interface ProposalPublic {
  id: string;
  client: string;
  project: string | null;
  value: number | null;
  description: string | null;
  status: string | null;
  approved_at: string | null;
  approval_token: string;
  company_id: string | null;
  mockup_url: string | null;
}

interface CompanyPublic {
  name: string;
  logo_url: string | null;
  brand_color: string | null;
}

type PageState = "loading" | "ready" | "already_approved" | "success" | "error" | "not_found";

const ProposalApproval = () => {
  const { proposalId } = useParams<{ proposalId: string }>();
  const [state, setState] = useState<PageState>("loading");
  const [proposal, setProposal] = useState<ProposalPublic | null>(null);
  const [company, setCompany] = useState<CompanyPublic | null>(null);
  const [signerName, setSignerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSignature, setShowSignature] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Fetch proposal + log first view
  useEffect(() => {
    if (!proposalId) { setState("not_found"); return; }

    (async () => {
      const { data, error } = await (supabase as any)
        .from("proposals")
        .select("id, client, project, value, description, status, approved_at, approval_token, company_id, mockup_url")
        .eq("approval_token", proposalId)
        .maybeSingle();

      if (error || !data) { setState("not_found"); return; }

      setProposal(data);

      if (data.approved_at || data.status === "Aprobada") {
        setState("already_approved");
      } else {
        setState("ready");
      }

      // Fetch company
      if (data.company_id) {
        const { data: comp } = await (supabase as any)
          .from("companies")
          .select("name, logo_url, brand_color")
          .eq("id", data.company_id)
          .maybeSingle();
        if (comp) setCompany(comp);

        try {
          await (supabase as any).from("audit_logs").insert({
            company_id: data.company_id,
            user_id: data.company_id,
            user_name: "Cliente externo",
            action: "visualizado",
            entity_type: "propuesta",
            entity_id: data.id,
            entity_label: data.client,
            details: { source: "public_link", first_view: true },
          });
        } catch {
          // Non-critical
        }
      }
    })();
  }, [proposalId]);

  // Canvas setup
  useEffect(() => {
    if (!showSignature) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "hsl(265 85% 60%)";
  }, [showSignature]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) return { x: (e as any).touches[0].clientX - rect.left, y: (e as any).touches[0].clientY - rect.top };
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    if ("touches" in e) {
      // Don't prevent default here to allow scroll if not drawing, 
      // but we handle touch-none in CSS to prevent scroll while drawing
    }
    isDrawingRef.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDraw = () => { isDrawingRef.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleApprove = useCallback(async () => {
    if (!proposal || !signerName.trim()) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const signatureData = hasSignature ? canvasRef.current?.toDataURL("image/png") : null;

      const { data, error } = await supabase.functions.invoke("approve-proposal", {
        body: {
          approvalToken: proposal.approval_token,
          signerName: signerName.trim(),
          signatureData,
        },
      });

      if (error) throw new Error(error.message || "Error al aprobar");
      if (data?.error) {
        if (data.alreadyApproved) { setState("already_approved"); return; }
        throw new Error(data.error);
      }

      setState("success");
    } catch (err: any) {
      setErrorMsg(err.message || "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  }, [proposal, signerName, hasSignature]);

  const formatCurrency = (v: number | null) =>
    v != null ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v) : "—";

  return (
    <Shell company={company}>
      <AnimatePresence mode="wait">
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-24 text-center"
          >
            <div className="relative">
              <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
              <Loader2 className="w-12 h-12 animate-spin text-primary absolute inset-0 [animation-duration:1.5s]" />
            </div>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Autenticando propuesta...</p>
          </motion.div>
        )}

        {(state === "not_found" || state === "error") && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 py-16 text-center glass-card p-8"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Enlace no válido</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Este documento puede haber sido eliminado o el enlace de acceso ha expirado por seguridad.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-semibold px-6 py-2.5 rounded-full border border-border/50 hover:bg-white/5 transition-colors"
            >
              Reintentar
            </button>
          </motion.div>
        )}

        {state === "already_approved" && (
          <motion.div
            key="already_approved"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 py-12 text-center glass-card p-8"
          >
            <div className="w-16 h-16 rounded-full bg-mint/10 flex items-center justify-center border border-mint/20">
              <CheckCircle2 className="w-8 h-8 text-mint" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Documento Aprobado</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Esta propuesta ya fue firmada y aprobada el {proposal?.approved_at ? new Date(proposal.approved_at).toLocaleDateString() : 'anteriormente'}.
              </p>
            </div>
          </motion.div>
        )}

        {state === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 py-12 text-center glass-card p-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-mint/5 to-transparent pointer-events-none" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-mint/15 flex items-center justify-center border border-mint/30 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]"
            >
              <CheckCircle2 className="w-12 h-12 text-mint" />
            </motion.div>
            <div className="space-y-3 z-10">
              <h2 className="text-2xl font-bold tracking-tight">¡Propuesta Formalizada!</h2>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
                Gracias, <strong>{signerName}</strong>. El equipo ha sido notificado. El proyecto inicia su fase operativa de inmediato.
              </p>
            </div>
          </motion.div>
        )}

        {state === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Visual Hero */}
            {proposal?.mockup_url ? (
              <div className="glass-card overflow-hidden group border-white/10">
                <div className="relative aspect-video sm:aspect-[21/9] bg-black/40">
                  <img
                    src={proposal.mockup_url}
                    alt="Mockup"
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/80">
                      Previsualización Final
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full opacity-50" />
            )}

            {/* Main Content Card */}
            <div className="glass-card p-8 space-y-8 relative border-white/10 overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <FileText size={120} />
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-primary/70 mb-1">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Certificado Oficial</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight leading-none text-white">
                    {proposal?.project || "Propuesta de Proyecto"}
                  </h2>
                  <p className="text-sm text-muted-foreground">ID de Propuesta: <code className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded">#{proposal?.id.split('-')[0]}</code></p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cliente</span>
                  <p className="font-semibold text-white/90">{proposal?.client}</p>
                </div>
                <div className="p-4 rounded-xl bg-primary/[0.04] border border-primary/10 space-y-1">
                  <span className="text-[10px] font-bold text-primary/70 uppercase tracking-wider">Inversión Total</span>
                  <p className="text-2xl font-black text-primary tracking-tight">
                    {formatCurrency(proposal?.value ?? null)}
                  </p>
                </div>
              </div>

              {proposal?.description && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Alcance y Términos</h4>
                  <div className="text-sm leading-relaxed text-muted-foreground/90 p-5 rounded-xl bg-white/[0.02] border border-white/5">
                    {proposal.description}
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-medium">Validez: 15 días</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-medium">Protocolo SSL/TLS</span>
                </div>
              </div>
            </div>

            {/* Floating Action Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => {
                  setShowSignature(true);
                  setTimeout(() => {
                    document.getElementById('signing-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="group relative overflow-hidden py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_-5px_rgba(var(--primary),0.4)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Aceptar y Proceder
                </span>
              </button>
              <a
                href={`mailto:${company?.name || ""}?subject=Consulta: ${proposal?.project || "Propuesta"}`}
                className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-bold text-sm transition-all hover:bg-white/10 hover:border-white/20 flex items-center justify-center gap-2"
              >
                <Mail size={18} /> Contactar Soporte
              </a>
            </div>

            {/* Signing Section */}
            {showSignature && (
              <motion.div
                id="signing-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 space-y-6 border-primary/20 bg-primary/[0.02]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-white">Protocolo de Firma Digital</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Representante Autorizado</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={signerName}
                        onChange={e => setSignerName(e.target.value)}
                        placeholder="Nombre completo del firmante"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rúbrica Digital</label>
                      {hasSignature && (
                        <button onClick={clearCanvas} className="text-[10px] flex items-center gap-1.5 text-muted-foreground hover:text-white transition-colors uppercase font-bold tracking-tighter">
                          <Eraser size={10} /> Limpiar
                        </button>
                      )}
                    </div>
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 group">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
                        className="w-full h-40 cursor-crosshair touch-none"
                      />
                      {!hasSignature && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 space-y-2">
                          <PenTool size={32} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Firme aquí</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleApprove}
                    disabled={submitting || !signerName.trim()}
                    className="w-full py-4 rounded-xl bg-white text-black font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-30 disabled:pointer-events-none shadow-xl"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <Loader2 className="w-4 h-4 animate-spin" /> Procesando Firma...
                      </span>
                    ) : "Confirmar Aprobación Legal"}
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-4">
                    Al proceder, usted confirma que tiene autoridad legal para aprobar este presupuesto. Su dirección IP y marca de tiempo serán registradas como prueba de consentimiento electrónico según la normativa vigente.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Shell>
  );
};

/* ── UI Components ── */
function Shell({ children, company }: { children: React.ReactNode; company?: CompanyPublic | null }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 selection:text-white py-12 px-4 sm:px-6">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="max-w-xl mx-auto relative z-10 space-y-12">
        {/* Header/Logo */}
        <header className="flex flex-col items-center gap-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-2xl bg-white/5 border border-white/10"
          >
            {company?.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="h-10 object-contain" />
            ) : (
              <h1 className="text-lg font-black tracking-tighter uppercase text-primary">
                {company?.name || "Sign Flow"}
              </h1>
            )}
          </motion.div>
          {!company?.logo_url && company?.name && (
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] ml-1.5">
              Portal de Aprobación
            </span>
          )}
        </header>

        <main>{children}</main>

        <footer className="text-center space-y-4 pt-8 border-t border-white/5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em]">
            Tecnología Segura por <span className="text-primary/60">Sign Flow Systems</span>
          </p>
          <div className="flex items-center justify-center gap-4">
            <ShieldCheck size={12} className="text-muted-foreground/30" />
            <div className="h-1 w-1 rounded-full bg-white/10" />
            <div className="text-[9px] text-muted-foreground/40 font-medium">Cumplimiento Legal eIDAS & ESIGN</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ProposalApproval;