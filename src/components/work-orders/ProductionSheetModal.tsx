import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  X, Printer, Save, Loader2, CheckSquare, Square, User,
  QrCode, MapPin, Phone, Mail, Wrench, Shield, ClipboardCheck,
  FileText, AlertCircle,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useWorkOrders, type WorkOrder } from "@/contexts/WorkOrdersContext";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { generateProductionSheetPDF } from "@/lib/generate-production-sheet-pdf";

/* ── Types ── */
interface StaffEntry {
  user_id: string | null;
  name: string;
  is_verified: boolean;
  status: "pending" | "in_progress" | "done" | "verified";
}

interface ResponsibleStaff {
  pm: StaffEntry;
  cnc: StaffEntry;
  fabrication: StaffEntry;
  wiring: StaffEntry;
  qc: StaffEntry;
}

interface QCChecklist {
  design_verified: boolean;
  material_specs_confirmed: boolean;
  wiring_test_passed: boolean;
  final_sign_cleaned: boolean;
  qc_signature: string;
  qc_date: string | null;
}

interface MaterialSpecs {
  face_material_spec: string;
  returns_material_spec: string;
  backs_material_spec: string;
  trim_cap_spec: string;
  led_mfg_spec: string;
  power_supply_spec: string;
}

interface ProductionSheetModalProps {
  order: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

const STAFF_ROLES = [
  { key: "pm", label: "Project Manager", icon: User },
  { key: "cnc", label: "CNC Cutting", icon: Wrench },
  { key: "fabrication", label: "Fabrication", icon: Wrench },
  { key: "wiring", label: "Wiring / LEDs", icon: Wrench },
  { key: "qc", label: "Quality Control", icon: Shield },
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

const STATUS_COLORS: Record<string, string> = {
  "Pendiente": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "En Progreso": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "Control de Calidad": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Completada": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const defaultStaff: ResponsibleStaff = {
  pm: { user_id: null, name: "", is_verified: false, status: "pending" },
  cnc: { user_id: null, name: "", is_verified: false, status: "pending" },
  fabrication: { user_id: null, name: "", is_verified: false, status: "pending" },
  wiring: { user_id: null, name: "", is_verified: false, status: "pending" },
  qc: { user_id: null, name: "", is_verified: false, status: "pending" },
};

const defaultQC: QCChecklist = {
  design_verified: false,
  material_specs_confirmed: false,
  wiring_test_passed: false,
  final_sign_cleaned: false,
  qc_signature: "",
  qc_date: null,
};

const defaultMaterialSpecs: MaterialSpecs = {
  face_material_spec: "",
  returns_material_spec: "",
  backs_material_spec: "",
  trim_cap_spec: "",
  led_mfg_spec: "",
  power_supply_spec: "",
};

export function ProductionSheetModal({ order, isOpen, onClose }: ProductionSheetModalProps) {
  const { updateOrder } = useWorkOrders();
  const { companyId } = useUserRole();
  const { toast } = useToast();
  const sheetRef = useRef<HTMLDivElement>(null);

  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [operators, setOperators] = useState<Array<{ id: string; name: string }>>([]);

  // Form state
  const [materialSpecs, setMaterialSpecs] = useState<MaterialSpecs>(defaultMaterialSpecs);
  const [staff, setStaff] = useState<ResponsibleStaff>(defaultStaff);
  const [qcChecklist, setQcChecklist] = useState<QCChecklist>(defaultQC);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [projectName, setProjectName] = useState("");

  // Load operators
  useEffect(() => {
    if (!isOpen || !companyId) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", companyId);
      setOperators((data || []).map(p => ({ id: p.id, name: p.full_name || `User ${p.id.slice(0, 6)}` })));
    };
    load();
  }, [isOpen, companyId]);

  // Initialize from order
  useEffect(() => {
    if (!order) return;
    const raw = order as any;
    setMaterialSpecs({
      face_material_spec: raw.face_material_spec || "",
      returns_material_spec: raw.returns_material_spec || "",
      backs_material_spec: raw.backs_material_spec || "",
      trim_cap_spec: raw.trim_cap_spec || "",
      led_mfg_spec: raw.led_mfg_spec || "",
      power_supply_spec: raw.power_supply_spec || "",
    });
    setStaff(raw.responsible_staff || defaultStaff);
    setQcChecklist(raw.qc_checklist || defaultQC);
    setContactName(raw.contact_name || "");
    setContactPhone(raw.contact_phone || "");
    setContactEmail(raw.contact_email || "");
    setSiteAddress(raw.site_address || "");
    setProjectName(raw.project_name || order.project || "");
  }, [order]);

  const woNumber = useMemo(() => {
    if (!order) return "";
    return (order as any).wo_number || `WO-${order.id.slice(0, 8).toUpperCase()}`;
  }, [order]);

  const allQcPassed = useMemo(() => {
    return qcChecklist.design_verified &&
      qcChecklist.material_specs_confirmed &&
      qcChecklist.wiring_test_passed &&
      qcChecklist.final_sign_cleaned;
  }, [qcChecklist]);

  const handleSave = useCallback(async () => {
    if (!order) return;
    setSaving(true);
    try {
      // Direct DB update for new columns not in the context mapper
      const { error } = await supabase.from("production_orders").update({
        face_material_spec: materialSpecs.face_material_spec,
        returns_material_spec: materialSpecs.returns_material_spec,
        backs_material_spec: materialSpecs.backs_material_spec,
        trim_cap_spec: materialSpecs.trim_cap_spec,
        led_mfg_spec: materialSpecs.led_mfg_spec,
        power_supply_spec: materialSpecs.power_supply_spec,
        responsible_staff: staff as any,
        qc_checklist: qcChecklist as any,
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        site_address: siteAddress,
        project_name: projectName,
        wo_number: woNumber,
      } as any).eq("id", order.id);

      if (error) throw error;
      toast({ title: "Hoja de producción guardada" });
    } catch (e: any) {
      toast({ title: "Error al guardar", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [order, materialSpecs, staff, qcChecklist, contactName, contactPhone, contactEmail, siteAddress, projectName, woNumber, toast]);

  const handlePrint = useCallback(async () => {
    if (!order) return;
    setPrinting(true);
    try {
      await generateProductionSheetPDF({
        woNumber,
        client: order.client,
        project: projectName || order.project,
        status: order.status,
        progress: order.progress,
        createdAt: order.startDate,
        estimatedDelivery: order.estimatedDelivery || order.estimatedCompletion,
        contactName,
        contactPhone,
        contactEmail,
        siteAddress,
        materialSpecs: materialSpecs as unknown as Record<string, string>,
        staff: staff as unknown as Record<string, any>,
        qcChecklist: qcChecklist as unknown as Record<string, boolean | string | null>,
        blueprintUrl: order.blueprintUrl || null,
        annotations: order.annotations || [],
      });
      toast({ title: "PDF generado", description: "La hoja de producción fue descargada." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error al generar PDF", variant: "destructive" });
    } finally {
      setPrinting(false);
    }
  }, [order, woNumber, projectName, contactName, contactPhone, contactEmail, siteAddress, materialSpecs, staff, qcChecklist, toast]);

  const updateStaffField = useCallback((role: string, field: string, value: any) => {
    setStaff(prev => ({
      ...prev,
      [role]: { ...prev[role as keyof ResponsibleStaff], [field]: value },
    }));
  }, []);

  const toggleQC = useCallback((key: string) => {
    setQcChecklist(prev => ({ ...prev, [key]: !prev[key as keyof QCChecklist] }));
  }, []);

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[1200px] max-h-[95vh] p-0 gap-0 bg-zinc-900/95 backdrop-blur-2xl border-white/[0.08] rounded-2xl flex flex-col overflow-hidden">

        {/* ── A4 Paper simulation ── */}
        <div className="flex-1 overflow-auto p-4 sm:p-6" style={{ background: "hsl(240 5% 12%)" }}>
          <div
            ref={sheetRef}
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
              {/* Left: Company info */}
              <div style={{ flex: "0 0 30%" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.02em" }}>
                  THE SIGN SPACE CORP.
                </div>
                <div style={{ fontSize: 9, color: "#666", marginTop: 2 }}>
                  <div className="flex items-center gap-1"><MapPin size={9} /> Kendall, FL 33186</div>
                  <div className="flex items-center gap-1"><Phone size={9} /> (305) 555-0199</div>
                  <div className="flex items-center gap-1"><Mail size={9} /> info@thesignspace.com</div>
                </div>
              </div>

              {/* Center: Title */}
              <div style={{ flex: "0 0 40%", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.08em", color: "#1a1a2e" }}>
                  WORK ORDER
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#555", letterSpacing: "0.05em" }}>
                  PRODUCTION SHEET
                </div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>
                  {woNumber}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#333", marginTop: 2 }}>
                  {projectName || order.project || "—"}
                </div>
              </div>

              {/* Right: Status & dates */}
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
                  {order.status.toUpperCase()}
                </Badge>
                <div style={{ fontSize: 9, color: "#666", marginTop: 6 }}>
                  <div>Created: {order.startDate ? format(new Date(order.startDate), "MMM dd, yyyy") : "—"}</div>
                  <div>Install: {order.estimatedDelivery || order.estimatedCompletion
                    ? format(new Date((order.estimatedDelivery || order.estimatedCompletion)!), "MMM dd, yyyy")
                    : "—"}</div>
                </div>
                <div style={{ marginTop: 6 }}>
                  <QrCode size={40} strokeWidth={1} className="ml-auto" style={{ color: "#ccc" }} />
                </div>
              </div>
            </div>

            {/* Separator */}
            <div style={{ height: 2, background: "linear-gradient(90deg, #7c3aed, #a855f7, #7c3aed)", borderRadius: 1, marginBottom: 10 }} />

            {/* ═══ MOCKUP AREA ═══ */}
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              {/* Blueprint container — 60% width */}
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
                {order.blueprintUrl ? (
                  <img
                    src={order.blueprintUrl}
                    alt="Technical drawing"
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "#bbb", padding: 40 }}>
                    <FileText size={32} strokeWidth={1} />
                    <div style={{ fontSize: 10, marginTop: 8 }}>No technical drawing uploaded</div>
                  </div>
                )}
                {/* Annotations overlay indicators */}
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

              {/* Right side info panels — 40% */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Project Details */}
                <div style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: "8px 10px" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
                    Project Details
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: "3px 6px", fontSize: 10 }}>
                    <span style={{ fontWeight: 600, color: "#555" }}>Client:</span>
                    <span style={{ fontWeight: 700, color: "#1a1a2e" }}>{order.client}</span>
                    <span style={{ fontWeight: 600, color: "#555" }}>Site:</span>
                    <Input
                      value={siteAddress}
                      onChange={e => setSiteAddress(e.target.value)}
                      className="h-5 text-[10px] border-zinc-300 bg-transparent px-1 py-0 rounded-sm text-zinc-900"
                      placeholder="Installation address"
                    />
                    <span style={{ fontWeight: 600, color: "#555" }}>Contact:</span>
                    <Input
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      className="h-5 text-[10px] border-zinc-300 bg-transparent px-1 py-0 rounded-sm text-zinc-900"
                      placeholder="Contact name"
                    />
                    <span style={{ fontWeight: 600, color: "#555" }}>Phone:</span>
                    <Input
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      className="h-5 text-[10px] border-zinc-300 bg-transparent px-1 py-0 rounded-sm text-zinc-900"
                      placeholder="Phone"
                    />
                    <span style={{ fontWeight: 600, color: "#555" }}>Email:</span>
                    <Input
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      className="h-5 text-[10px] border-zinc-300 bg-transparent px-1 py-0 rounded-sm text-zinc-900"
                      placeholder="Email"
                    />
                  </div>
                </div>

                {/* Material Specs */}
                <div style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: "8px 10px", flex: 1 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
                    Technical Specifications / Materials
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {MATERIAL_FIELDS.map(f => (
                      <div key={f.key} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 4, alignItems: "center" }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: "#444" }}>{f.label}:</span>
                        <Input
                          value={materialSpecs[f.key as keyof MaterialSpecs]}
                          onChange={e => setMaterialSpecs(prev => ({ ...prev, [f.key]: e.target.value }))}
                          className="h-5 text-[9px] border-zinc-300 bg-transparent px-1 py-0 rounded-sm text-zinc-900"
                          placeholder={f.key === "face_material_spec" ? "e.g. 3/16\" Chemcast Acrylic - Red 2447" : "Specification..."}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ BOTTOM GRID: Staff + QC ═══ */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {/* Responsible Staff */}
              <div style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
                  Responsible Staff
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {STAFF_ROLES.map(({ key, label }) => {
                    const entry = staff[key as keyof ResponsibleStaff];
                    return (
                      <div key={key} style={{ display: "grid", gridTemplateColumns: "100px 1fr 70px 24px", gap: 4, alignItems: "center" }}>
                        <span style={{ fontSize: 9, fontWeight: 600, color: "#555" }}>{label}:</span>
                        <Select
                          value={entry.user_id || "none"}
                          onValueChange={v => {
                            const op = operators.find(o => o.id === v);
                            updateStaffField(key, "user_id", v === "none" ? null : v);
                            updateStaffField(key, "name", op?.name || "");
                          }}
                        >
                          <SelectTrigger className="h-5 text-[9px] border-zinc-300 bg-transparent px-1 py-0 rounded-sm text-zinc-900">
                            <SelectValue placeholder="Assign..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">—</SelectItem>
                            {operators.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select
                          value={entry.status}
                          onValueChange={v => updateStaffField(key, "status", v)}
                        >
                          <SelectTrigger className="h-5 text-[8px] border-zinc-300 bg-transparent px-1 py-0 rounded-sm text-zinc-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() => updateStaffField(key, "is_verified", !entry.is_verified)}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {entry.is_verified
                            ? <CheckSquare size={14} style={{ color: "#16a34a" }} />
                            : <Square size={14} style={{ color: "#999" }} />
                          }
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* QC Checklist */}
              <div style={{ border: "1px solid #e5e5e5", borderRadius: 6, padding: "8px 10px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", letterSpacing: "0.08em", marginBottom: 6, textTransform: "uppercase" }}>
                  QC Checklist
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {QC_ITEMS.map(item => (
                    <button
                      key={item.key}
                      onClick={() => toggleQC(item.key)}
                      className="flex items-center gap-2 text-left"
                      style={{ fontSize: 10 }}
                    >
                      {qcChecklist[item.key as keyof QCChecklist]
                        ? <CheckSquare size={14} style={{ color: "#16a34a" }} />
                        : <Square size={14} style={{ color: "#999" }} />
                      }
                      <span style={{
                        color: qcChecklist[item.key as keyof QCChecklist] ? "#16a34a" : "#333",
                        textDecoration: qcChecklist[item.key as keyof QCChecklist] ? "line-through" : "none",
                        fontWeight: 500,
                      }}>
                        {item.label}
                      </span>
                    </button>
                  ))}

                  {/* Signature */}
                  <div style={{ marginTop: 6, borderTop: "1px solid #eee", paddingTop: 6 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 9, fontWeight: 600, color: "#555" }}>Signature:</span>
                      <Input
                        value={qcChecklist.qc_signature}
                        onChange={e => setQcChecklist(prev => ({ ...prev, qc_signature: e.target.value }))}
                        className="h-5 text-[10px] border-zinc-300 bg-transparent px-1 py-0 rounded-sm text-zinc-900"
                        placeholder="QC Inspector name"
                      />
                      <span style={{ fontSize: 9, fontWeight: 600, color: "#555" }}>Date:</span>
                      <Input
                        type="date"
                        value={qcChecklist.qc_date || ""}
                        onChange={e => setQcChecklist(prev => ({ ...prev, qc_date: e.target.value }))}
                        className="h-5 text-[10px] border-zinc-300 bg-transparent px-1 py-0 rounded-sm text-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Status indicator */}
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

        {/* ── Footer Actions (outside paper) ── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-white/[0.06] bg-zinc-950/90 backdrop-blur-md">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs border-white/[0.1] text-muted-foreground h-8">
            <X className="w-3.5 h-3.5 mr-1.5" /> Close
          </Button>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
              Save Changes
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              disabled={printing}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "white",
              }}
              className="text-xs h-8 hover:opacity-90"
            >
              {printing ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Printer className="w-3.5 h-3.5 mr-1.5" />}
              Print Production Sheet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
