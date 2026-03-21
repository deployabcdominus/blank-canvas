import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  MapPin, Phone, Mail, Wrench, Shield, User,
  CheckSquare, Square, ClipboardCheck, AlertCircle, FileText,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
// Removed useCompany hook; company will be loaded directly from Supabase

/* ── Constants ── */
const STAFF_ROLES = [
  { key: "pm", label: "Project Manager" },
  { key: "cnc", label: "CNC Cutting" },
  { key: "fabrication", label: "Fabrication" },
  { key: "wiring", label: "Wiring / LEDs" },
  { key: "qc", label: "Quality Control" },
] as const;

const QC_ITEMS = [
  { key: "design_verified", label: "Design & Dimensions Verified" },
  { key: "material_specs_confirmed", label: "Material Specs Confirmed" },
  { key: "wiring_test_passed", label: "Wiring / Load Test Passed" },
  { key: "final_sign_cleaned", label: "Final Sign Cleaned & Inspected" },
] as const;

const MATERIAL_FIELDS = [
  { key: "face_material_spec", label: "FACE" },
  { key: "returns_material_spec", label: "RETURNS" },
  { key: "backs_material_spec", label: "BACKS" },
  { key: "trim_cap_spec", label: "TRIM CAP" },
  { key: "led_mfg_spec", label: "LEDs" },
  { key: "power_supply_spec", label: "POWER SUPPLY" },
] as const;

const STATUS_MAP: Record<string, string> = {
  "Pendiente": "PENDING",
  "En Progreso": "IN PRODUCTION",
  "Control de Calidad": "QC",
  "Completada": "READY",
};

export default function PrintPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const loadData = async () => {
      const { data: orderData } = await supabase
        .from("production_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
      setOrder(orderData);
      if (orderData?.company_id) {
        const { data: companyData } = await supabase
          .from("companies")
          .select("id, name, logo_url, brand_color")
          .eq("id", orderData.company_id)
          .maybeSingle();
        setCompany(companyData);
      }
      setLoading(false);
    };
    loadData();
  }, [orderId]);

  // Auto-print after render
  useEffect(() => {
    if (!order || loading) return;
    const timer = setTimeout(() => {
      window.print();
    }, 800);
    return () => clearTimeout(timer);
  }, [order, loading]);

  const woNumber = useMemo(() => {
    if (!order) return "";
    return order.wo_number || `WO-${order.id.slice(0, 8).toUpperCase()}`;
  }, [order]);

  const orderUrl = order ? `${window.location.origin}/work-orders?id=${order.id}` : "";

  const staff = order?.responsible_staff || {};
  const qc = order?.qc_checklist || {};
  const allQcPassed = qc.design_verified && qc.material_specs_confirmed && qc.wiring_test_passed && qc.final_sign_cleaned;

  const fmtDate = (d: string | null) => {
    if (!d) return "—";
    try { return format(new Date(d), "MMM dd, yyyy"); } catch { return d; }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "hsl(240 5% 12%)", color: "#999" }}>
        Loading production sheet...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "hsl(240 5% 12%)", color: "#999" }}>
        Work order not found.
      </div>
    );
  }

  return (
    <div style={{ background: "hsl(240 5% 12%)", minHeight: "100vh", padding: "24px" }}>
      <div
        data-print-sheet
        className="mx-auto bg-white text-zinc-900 shadow-2xl"
        style={{
          maxWidth: "1120px",
          aspectRatio: "297 / 210",
          padding: "24px 28px",
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: "11px",
          lineHeight: "1.4",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ═══ HEADER ═══ */}
        <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
          <div style={{ flex: "0 0 30%" }}>
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                style={{ maxHeight: 36, maxWidth: 140, objectFit: "contain", marginBottom: 4 }}
                crossOrigin="anonymous"
              />
            ) : (
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.02em" }}>
                {company?.name || "MY COMPANY"}
              </div>
            )}
            <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
              <div className="flex items-center gap-1"><MapPin size={9} /> {order.site_address || "—"}</div>
              <div className="flex items-center gap-1"><Phone size={9} /> {order.contact_phone || "—"}</div>
              <div className="flex items-center gap-1"><Mail size={9} /> {order.contact_email || "—"}</div>
            </div>
          </div>

          <div style={{ flex: "0 0 40%", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.08em", color: "#1a1a2e" }}>
              WORK ORDER
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#555", letterSpacing: "0.05em" }}>
              PRODUCTION SHEET
            </div>
            <div data-print-mono style={{ fontSize: 10, color: "#888", marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
              {woNumber}
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#333", marginTop: 2 }}>
              {order.project_name || order.project || "—"}
            </div>
          </div>

          <div style={{ flex: "0 0 30%", textAlign: "right" }}>
            <Badge
              className="inline-flex text-[10px] px-2 py-0.5 font-bold border"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "white",
                border: "none",
                borderRadius: 4,
              }}
            >
              {(STATUS_MAP[order.status] || order.status || "PENDING").toUpperCase()}
            </Badge>
            <div style={{ fontSize: 9, color: "#666", marginTop: 6 }}>
              <div>Created: {fmtDate(order.start_date || order.created_at)}</div>
              <div>Install: {fmtDate(order.estimated_delivery || order.end_date)}</div>
            </div>
            <div style={{ marginTop: 6 }} className="flex justify-end print-qr">
              <QRCodeSVG value={orderUrl} size={44} level="M" bgColor="transparent" fgColor="#333" />
            </div>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 2, background: "linear-gradient(90deg, #7c3aed, #a855f7, #7c3aed)", borderRadius: 1, marginBottom: 10 }} />

        {/* ═══ MOCKUP + DETAILS ═══ */}
        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
          <div
            style={{
              flex: "0 0 60%",
              border: "1px solid #e0e0e0",
              borderRadius: 6,
              overflow: "hidden",
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 200,
              maxHeight: 280,
              position: "relative",
            }}
          >
            {order.blueprint_url ? (
              <img
                src={order.blueprint_url}
                alt="Technical drawing"
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                crossOrigin="anonymous"
              />
            ) : (
              <div style={{ textAlign: "center", color: "#bbb", padding: 20 }}>
                <FileText size={32} strokeWidth={1} />
                <div style={{ fontSize: 10, marginTop: 8 }}>No technical drawing uploaded</div>
              </div>
            )}
            {(order.annotations || []).filter((a: any) => a.text).length > 0 && (
              <div style={{ position: "absolute", bottom: 4, left: 4, display: "flex", gap: 3, flexWrap: "wrap" }}>
                {(order.annotations || []).filter((a: any) => a.text).map((a: any, i: number) => (
                  <span key={i} style={{
                    fontSize: 8, background: "rgba(124,58,237,0.9)", color: "white",
                    padding: "1px 5px", borderRadius: 3, fontWeight: 600,
                  }}>
                    {a.text}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Project Details — read-only */}
            <div style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
                Project Details
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "3px 6px", fontSize: 10 }}>
                <span style={{ fontWeight: 600, color: "#555" }}>Client:</span>
                <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{order.client}</span>
                <span style={{ fontWeight: 600, color: "#555" }}>Site:</span>
                <span style={{ color: "#1a1a2e" }}>{order.site_address || "—"}</span>
                <span style={{ fontWeight: 600, color: "#555" }}>Contact:</span>
                <span style={{ color: "#1a1a2e" }}>{order.contact_name || "—"}</span>
                <span style={{ fontWeight: 600, color: "#555" }}>Phone:</span>
                <span style={{ color: "#1a1a2e" }}>{order.contact_phone || "—"}</span>
                <span style={{ fontWeight: 600, color: "#555" }}>Email:</span>
                <span style={{ color: "#1a1a2e" }}>{order.contact_email || "—"}</span>
              </div>
            </div>

            {/* Material Specs — read-only */}
            <div style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: "8px 10px", flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
                Technical Specifications / Materials
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {MATERIAL_FIELDS.map(f => (
                  <div key={f.key} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 4, alignItems: "center" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#444" }}>{f.label}:</span>
                    <span style={{ fontSize: 9, color: "#1a1a2e" }}>{(order as any)[f.key] || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ BOTTOM GRID: Staff + QC ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {/* Responsible Staff — read-only */}
          <div style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
              Responsible Staff
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {STAFF_ROLES.map(({ key, label }) => {
                const entry = staff[key] || { name: "", status: "pending", is_verified: false };
                return (
                  <div key={key} style={{ display: "grid", gridTemplateColumns: "100px 1fr 70px 20px", gap: 4, alignItems: "center", fontSize: 10 }}>
                    <span style={{ fontWeight: 600, color: "#555" }}>{label}:</span>
                    <span style={{ color: "#1a1a2e" }}>{entry.name || "—"}</span>
                    <span style={{ fontSize: 8, fontWeight: 600, color: entry.status === "done" || entry.status === "verified" ? "#16a34a" : "#888", textTransform: "uppercase" }}>
                      {entry.status}
                    </span>
                    {entry.is_verified
                      ? <CheckSquare size={12} style={{ color: "#16a34a" }} />
                      : <Square size={12} style={{ color: "#ccc" }} />
                    }
                  </div>
                );
              })}
            </div>
          </div>

          {/* QC Checklist — read-only */}
          <div style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: "8px 10px" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
              QC Checklist
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {QC_ITEMS.map(item => (
                <div key={item.key} className="flex items-center gap-2" style={{ fontSize: 10 }}>
                  {qc[item.key]
                    ? <CheckSquare size={14} style={{ color: "#16a34a" }} />
                    : <Square size={14} style={{ color: "#999" }} />
                  }
                  <span style={{
                    color: qc[item.key] ? "#16a34a" : "#333",
                    textDecoration: qc[item.key] ? "line-through" : "none",
                    fontWeight: 500,
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}

              {/* Signature display */}
              {order.qc_signature_url && (
                <div style={{ marginTop: 4 }}>
                  <img src={order.qc_signature_url} alt="QC Signature" style={{ height: 40, objectFit: "contain" }} crossOrigin="anonymous" />
                  <div style={{ fontSize: 9, color: "#555", fontStyle: "italic", marginTop: 2 }}>
                    Signed by {order.qc_signer_name || "Inspector"} · {order.qc_signed_at ? new Date(order.qc_signed_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                  </div>
                </div>
              )}

              {allQcPassed && (
                <div className="flex items-center gap-1.5" style={{ color: "#16a34a", fontSize: 10, fontWeight: 700, marginTop: 2 }}>
                  <ClipboardCheck size={14} /> ALL QC CHECKS PASSED
                </div>
              )}
              {!allQcPassed && (
                <div className="flex items-center gap-1.5" style={{ color: "#d97706", fontSize: 9, marginTop: 2 }}>
                  <AlertCircle size={12} /> Incomplete — order cannot be closed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer inside paper */}
        <div style={{
          position: "absolute", bottom: 12, left: 28, right: 28,
          display: "flex", justifyContent: "space-between",
          borderTop: "1px solid #e5e5e5", paddingTop: 6,
          fontSize: 8, color: "#999",
        }}>
          <span>Generated by Sign Flow — {format(new Date(), "MMM dd, yyyy HH:mm")}</span>
          <span>CONFIDENTIAL — {order.client}</span>
        </div>
      </div>
    </div>
  );
}
