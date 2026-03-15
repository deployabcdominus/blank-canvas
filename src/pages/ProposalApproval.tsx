import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, FileText, AlertTriangle, Loader2, Eraser, Phone, Mail } from "lucide-react";

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

        // Log first view (fire & forget, uses service role via edge function not needed — use anon insert if policy allows, else skip)
        try {
          await (supabase as any).from("audit_logs").insert({
            company_id: data.company_id,
            user_id: data.company_id, // placeholder — external view
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
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "hsl(25 95% 53%)";
  }, [showSignature]);

  const getPos = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
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

  // ── Render states ──
  if (state === "loading") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(25 95% 53%)" }} />
          <p style={{ color: "hsl(0 0% 55%)" }}>Cargando propuesta...</p>
        </div>
      </Shell>
    );
  }

  if (state === "not_found" || state === "error") {
    return (
      <Shell>
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <AlertTriangle className="w-10 h-10" style={{ color: "hsl(0 72% 51%)" }} />
          <h2 className="text-lg font-semibold" style={{ color: "hsl(0 0% 95%)" }}>Propuesta no encontrada</h2>
          <p className="text-sm max-w-sm" style={{ color: "hsl(0 0% 55%)" }}>
            Este enlace puede ser inválido o haber expirado.
          </p>
        </div>
      </Shell>
    );
  }

  if (state === "already_approved") {
    return (
      <Shell company={company}>
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "hsl(142 72% 37% / 0.12)", border: "1px solid hsl(142 72% 37% / 0.3)" }}>
            <CheckCircle2 className="w-8 h-8" style={{ color: "hsl(142 72% 37%)" }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: "hsl(0 0% 95%)" }}>Propuesta ya aprobada</h2>
          <p className="text-sm max-w-sm" style={{ color: "hsl(0 0% 55%)" }}>
            Esta propuesta ya fue aprobada anteriormente.
          </p>
        </div>
      </Shell>
    );
  }

  if (state === "success") {
    return (
      <Shell company={company}>
        <div className="flex flex-col items-center gap-5 py-12 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: "hsl(142 72% 37% / 0.12)", border: "1px solid hsl(142 72% 37% / 0.3)" }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: "hsl(142 72% 37%)" }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "hsl(0 0% 95%)" }}>¡Propuesta aprobada!</h2>
          <p className="text-sm max-w-md leading-relaxed" style={{ color: "hsl(0 0% 65%)" }}>
            El equipo ha sido notificado y tu proyecto está ahora en fase de producción.
          </p>
        </div>
      </Shell>
    );
  }

  // ── Ready: Premium proposal landing page ──
  return (
    <Shell company={company}>
      {/* Hero Mockup */}
      {proposal?.mockup_url && (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 100% / 0.06)" }}>
          <img
            src={proposal.mockup_url}
            alt="Visualización del proyecto"
            className="w-full object-contain"
            style={{ maxHeight: 440, background: "hsl(0 0% 3%)" }}
          />
          <div className="px-4 py-2.5 text-center" style={{ background: "hsl(0 0% 5%)" }}>
            <p className="text-[11px] font-medium" style={{ color: "hsl(0 0% 40%)" }}>
              Visualización realista del proyecto
            </p>
          </div>
        </div>
      )}

      {/* Proposal details */}
      <div className="rounded-2xl p-6 space-y-5" style={{ background: "hsl(0 0% 5% / 0.8)", border: "1px solid hsl(0 0% 100% / 0.06)" }}>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "hsl(25 95% 53% / 0.12)" }}>
            <FileText className="w-5 h-5" style={{ color: "hsl(25 95% 53%)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "hsl(0 0% 40%)" }}>Propuesta Comercial</p>
            <h2 className="text-xl font-bold mt-1" style={{ color: "hsl(0 0% 95%)" }}>
              {proposal?.project || proposal?.client}
            </h2>
          </div>
        </div>

        {/* Cost table */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(0 0% 100% / 0.06)" }}>
          <div className="grid grid-cols-2">
            <CostRow label="Cliente" value={proposal?.client || "—"} />
            <CostRow label="Proyecto" value={proposal?.project || "—"} />
          </div>
          <div className="px-4 py-4 flex items-center justify-between" style={{ background: "hsl(25 95% 53% / 0.06)", borderTop: "1px solid hsl(25 95% 53% / 0.15)" }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "hsl(0 0% 55%)" }}>Total</span>
            <span className="text-2xl font-bold" style={{ color: "hsl(25 95% 53%)", fontFamily: "Georgia, serif" }}>
              {formatCurrency(proposal?.value ?? null)}
            </span>
          </div>
        </div>

        {proposal?.description && (
          <div className="rounded-xl p-4" style={{ background: "hsl(0 0% 100% / 0.02)", border: "1px solid hsl(0 0% 100% / 0.04)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "hsl(0 0% 40%)" }}>Detalles</p>
            <p className="text-sm leading-relaxed" style={{ color: "hsl(0 0% 65%)" }}>{proposal.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setShowSignature(true)}
          className="py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          style={{ background: "hsl(25 95% 53%)", color: "white" }}
        >
          <CheckCircle2 className="w-4 h-4" /> Aprobar Proyecto
        </button>
        <a
          href={`mailto:${company?.name || ""}?subject=Consulta sobre propuesta ${proposal?.project || ""}`}
          className="py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          style={{ background: "hsl(0 0% 100% / 0.04)", color: "hsl(0 0% 75%)", border: "1px solid hsl(0 0% 100% / 0.08)" }}
        >
          <Mail className="w-4 h-4" /> Contactar Asesor
        </a>
      </div>

      {/* Signature Modal */}
      {showSignature && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: "hsl(0 0% 5% / 0.8)", border: "1px solid hsl(0 0% 100% / 0.06)" }}>
          <h3 className="text-base font-semibold" style={{ color: "hsl(0 0% 95%)" }}>Firma de aprobación</h3>

          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: "hsl(0 0% 55%)" }}>Nombre completo *</label>
            <input
              type="text" value={signerName}
              onChange={e => setSignerName(e.target.value)}
              maxLength={100} placeholder="Ej: María García"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: "hsl(0 0% 5%)", border: "1px solid hsl(0 0% 100% / 0.08)", color: "hsl(0 0% 95%)" }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium" style={{ color: "hsl(0 0% 55%)" }}>Firma (opcional)</label>
              {hasSignature && (
                <button onClick={clearCanvas} className="text-xs flex items-center gap-1" style={{ color: "hsl(0 0% 45%)" }}>
                  <Eraser className="w-3 h-3" /> Limpiar
                </button>
              )}
            </div>
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
              className="w-full rounded-lg cursor-crosshair touch-none"
              style={{ height: 120, background: "hsl(0 0% 4%)", border: "1px dashed hsl(0 0% 100% / 0.1)" }}
            />
          </div>

          {errorMsg && <p className="text-xs font-medium" style={{ color: "hsl(0 72% 51%)" }}>{errorMsg}</p>}

          <button
            onClick={handleApprove}
            disabled={submitting || !signerName.trim()}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "hsl(25 95% 53%)", color: "white" }}
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</> : <><CheckCircle2 className="w-4 h-4" /> Firmar y Aprobar</>}
          </button>

          <p className="text-center text-xs leading-relaxed" style={{ color: "hsl(0 0% 35%)" }}>
            Al firmar, aceptas los términos. Se registrará tu IP y fecha como constancia legal.
          </p>
        </div>
      )}
    </Shell>
  );
};

/* ── Shell ── */
function Shell({ children, company }: { children: React.ReactNode; company?: CompanyPublic | null }) {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 sm:py-16" style={{ background: "hsl(0 0% 2%)" }}>
      <div className="mb-8">
        {company?.logo_url ? (
          <img src={company.logo_url} alt={company.name} className="h-12 object-contain" />
        ) : company?.name ? (
          <h1 className="text-xl font-bold" style={{ color: "hsl(25 95% 53%)" }}>{company.name}</h1>
        ) : (
          <div className="h-12" />
        )}
      </div>
      <div className="w-full max-w-lg space-y-5">{children}</div>
      <p className="mt-12 text-xs" style={{ color: "hsl(0 0% 25%)" }}>Powered by Sign Flow</p>
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid hsl(0 0% 100% / 0.04)" }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: "hsl(0 0% 40%)" }}>{label}</p>
      <p className="text-sm font-medium" style={{ color: "hsl(0 0% 80%)" }}>{value}</p>
    </div>
  );
}

export default ProposalApproval;
