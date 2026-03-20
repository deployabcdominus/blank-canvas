import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import {
  ChevronLeft, Pencil, Printer, QrCode, Calendar, User, Save,
  CheckCircle, ShieldCheck, Circle, Loader2, Clock, X, Wrench,
  Upload, Maximize2, Plus, Trash2, ChevronRight, ChevronLeftIcon,
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useWorkOrders, type WorkOrder } from "@/contexts/WorkOrdersContext";
import { useProductionSteps } from "@/hooks/useProductionSteps";
import { useUserRole } from "@/hooks/useUserRole";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QCSignaturePad } from "@/components/work-orders/QCSignaturePad";
import { ProductionSheetModal } from "@/components/work-orders/ProductionSheetModal";

/* ── Status config ── */
const STATUS_OPTIONS = [
  { value: "Pendiente", label: "Pending", bg: "bg-zinc-500/20", text: "text-zinc-400" },
  { value: "En Progreso", label: "In Production", bg: "bg-blue-500/20", text: "text-blue-400" },
  { value: "Control de Calidad", label: "QC", bg: "bg-amber-500/20", text: "text-amber-400" },
  { value: "Completada", label: "Ready", bg: "bg-emerald-500/20", text: "text-emerald-400" },
  { value: "Instalado", label: "Installed", bg: "bg-violet-500/20", text: "text-white" },
];

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  baja:   { label: "Low",    color: "bg-zinc-500/20 text-zinc-400" },
  media:  { label: "Medium", color: "bg-blue-500/20 text-blue-400" },
  alta:   { label: "High",   color: "bg-amber-500/20 text-amber-400" },
  urgente:{ label: "Urgent", color: "bg-red-500/20 text-red-400" },
};

const MATERIAL_FIELDS = [
  { key: "face_material_spec", label: "FACE" },
  { key: "returns_material_spec", label: "RETURNS" },
  { key: "backs_material_spec", label: "BACKS" },
  { key: "trim_cap_spec", label: "TRIM CAP" },
  { key: "led_mfg_spec", label: "LEDs" },
  { key: "power_supply_spec", label: "POWER SUPPLY" },
] as const;

const QC_ITEMS = [
  { key: "design_verified", label: "Design & Dimensions Verified" },
  { key: "material_specs_confirmed", label: "Material Specs Confirmed" },
  { key: "wiring_test_passed", label: "Wiring / Load Test Passed" },
  { key: "final_sign_cleaned", label: "Final Sign Cleaned & Inspected" },
] as const;

const SECTION_TITLE = "text-[11px] font-semibold tracking-widest uppercase mb-4";
const SECTION_TITLE_COLOR = { color: "rgba(139,92,246,0.8)" };
const CARD_STYLE = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(139,92,246,0.15)",
  borderRadius: 12,
  padding: 24,
};

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mb-4 ${className}`} style={CARD_STYLE}>
      {children}
    </div>
  );
}

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrder, refreshOrders } = useWorkOrders();
  const { companyId, canEdit } = useUserRole();
  const { company } = useCompany();

  const order = useMemo(() => orders.find(o => o.id === id), [orders, id]);
  const { steps, loading: stepsLoading, startStep, completeStep, progress: stepsProgress } = useProductionSteps(id);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);

  // Notes auto-save
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);

  // QC state
  const [qcChecklist, setQcChecklist] = useState<Record<string, boolean>>({});
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [qcSignerName, setQcSignerName] = useState<string | null>(null);
  const [qcSignedAt, setQcSignedAt] = useState<string | null>(null);

  // POI photos
  const [poiPhotos, setPoiPhotos] = useState<Array<{ id: string; public_url: string | null; uploaded_by_name: string | null }>>([]);

  // Production sheet modal
  const [sheetOpen, setSheetOpen] = useState(false);

  // Profile lookup for assignee
  const [assigneeName, setAssigneeName] = useState<string | null>(null);

  // Operators for step assignment
  const [operators, setOperators] = useState<Array<{ id: string; name: string }>>([]);

  // Design workspace state
  const [designNotes, setDesignNotes] = useState("");
  const [designNotesSaved, setDesignNotesSaved] = useState(false);
  const [mockupUploading, setMockupUploading] = useState(false);
  const [additionalMockupUploading, setAdditionalMockupUploading] = useState(false);
  const [fullscreenImg, setFullscreenImg] = useState<{ url: string; index: number } | null>(null);
  const mockupInputRef = useRef<HTMLInputElement>(null);
  const additionalMockupInputRef = useRef<HTMLInputElement>(null);

  // Load order data into local state
  useEffect(() => {
    if (!order) return;
    const raw = order as any;
    setNotes(order.notes || "");
    setQcChecklist({
      design_verified: raw.qc_checklist?.design_verified || false,
      material_specs_confirmed: raw.qc_checklist?.material_specs_confirmed || false,
      wiring_test_passed: raw.qc_checklist?.wiring_test_passed || false,
      final_sign_cleaned: raw.qc_checklist?.final_sign_cleaned || false,
    });
    setSignatureUrl(raw.qc_signature_url || null);
    setQcSignerName(raw.qc_signer_name || null);
    setQcSignedAt(raw.qc_signed_at || null);
    setDesignNotes(raw.design_notes || "");
  }, [order]);

  // Load assignee name
  useEffect(() => {
    if (!order?.assignedToUserId) { setAssigneeName(null); return; }
    supabase.from("profiles").select("full_name").eq("id", order.assignedToUserId).maybeSingle()
      .then(({ data }) => setAssigneeName(data?.full_name || null));
  }, [order?.assignedToUserId]);

  // Load operators
  useEffect(() => {
    if (!companyId) return;
    supabase.from("profiles").select("id, full_name").eq("company_id", companyId)
      .then(({ data }) => setOperators((data || []).map(p => ({ id: p.id, name: p.full_name || `User ${p.id.slice(0, 6)}` }))));
  }, [companyId]);

  // Load POI photos
  useEffect(() => {
    if (!id) return;
    supabase.from("poi_photos").select("id, public_url, uploaded_by_name")
      .eq("production_order_id", id).order("uploaded_at", { ascending: true })
      .then(({ data }) => setPoiPhotos(data || []));
  }, [id]);

  // Status change
  const handleStatusChange = useCallback(async (newStatus: string) => {
    if (!order) return;
    try {
      await updateOrder(order.id, { status: newStatus });
      toast.success(`Status changed to ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}`);
    } catch { toast.error("Failed to update status"); }
  }, [order, updateOrder]);

  // Notes auto-save
  const handleNotesBlur = useCallback(async () => {
    if (!order || notes === (order.notes || "")) return;
    try {
      await supabase.from("production_orders").update({ notes } as any).eq("id", order.id);
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch { toast.error("Failed to save notes"); }
  }, [order, notes]);

  // Edit mode helpers
  const enterEdit = useCallback(() => {
    if (!order) return;
    const raw = order as any;
    setEditFields({
      client: order.client || "",
      project_name: raw.project_name || order.project || "",
      estimated_delivery: order.estimatedDelivery || "",
      priority: order.priority || "media",
      site_address: raw.site_address || "",
      contact_name: raw.contact_name || "",
      contact_phone: raw.contact_phone || "",
      contact_email: raw.contact_email || "",
    });
    setEditMode(true);
  }, [order]);

  const saveEdit = useCallback(async () => {
    if (!order) return;
    setEditSaving(true);
    try {
      await supabase.from("production_orders").update({
        client: editFields.client,
        project_name: editFields.project_name,
        estimated_delivery: editFields.estimated_delivery || null,
        priority: editFields.priority,
        site_address: editFields.site_address,
        contact_name: editFields.contact_name,
        contact_phone: editFields.contact_phone,
        contact_email: editFields.contact_email,
      } as any).eq("id", order.id);
      toast.success("Work order updated");
      setEditMode(false);
      refreshOrders();
    } catch { toast.error("Failed to save"); }
    setEditSaving(false);
  }, [order, editFields, refreshOrders]);

  // QC toggle
  const toggleQc = useCallback(async (key: string) => {
    if (!order) return;
    const updated = { ...qcChecklist, [key]: !qcChecklist[key] };
    setQcChecklist(updated);
    await supabase.from("production_orders").update({
      qc_checklist: { ...updated, qc_signature: "", qc_date: null },
    } as any).eq("id", order.id);
  }, [order, qcChecklist]);

  // POI link
  const generatePOI = useCallback(async () => {
    if (!order) return;
    const token = crypto.randomUUID();
    const exp = new Date(); exp.setHours(exp.getHours() + 72);
    await supabase.from("production_orders").update({
      poi_token: token, poi_token_exp: exp.toISOString(), poi_token_used: false,
    } as any).eq("id", order.id);
    const url = `${window.location.origin}/poi/${order.id}?token=${token}`;
    await navigator.clipboard.writeText(url);
    toast.success("POI link copied — valid 72 hours");
  }, [order]);

  const allQcPassed = useMemo(() =>
    qcChecklist.design_verified && qcChecklist.material_specs_confirmed &&
    qcChecklist.wiring_test_passed && qcChecklist.final_sign_cleaned,
  [qcChecklist]);

  // Design notes auto-save
  const handleDesignNotesBlur = useCallback(async () => {
    if (!order) return;
    const raw = order as any;
    if (designNotes === (raw.design_notes || "")) return;
    try {
      await supabase.from("production_orders").update({ design_notes: designNotes } as any).eq("id", order.id);
      setDesignNotesSaved(true);
      setTimeout(() => setDesignNotesSaved(false), 2000);
    } catch { toast.error("Failed to save design notes"); }
  }, [order, designNotes]);

  // Mockup upload
  const handleMockupUpload = useCallback(async (file: File) => {
    if (!order || !companyId) return;
    setMockupUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${companyId}/${order.id}/mockup-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("work-order-blueprints").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("work-order-blueprints").getPublicUrl(path);
      await supabase.from("production_orders").update({ blueprint_url: urlData.publicUrl } as any).eq("id", order.id);
      toast.success("Mockup uploaded");
      refreshOrders();
    } catch (e: any) { toast.error(e.message || "Upload failed"); }
    setMockupUploading(false);
  }, [order, companyId, refreshOrders]);

  // Additional mockup upload
  const handleAdditionalMockupUpload = useCallback(async (file: File) => {
    if (!order || !companyId) return;
    setAdditionalMockupUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${companyId}/${order.id}/extra-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("work-order-blueprints").upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from("work-order-blueprints").getPublicUrl(path);
      const raw = order as any;
      const existing: string[] = Array.isArray(raw.mockup_urls) ? raw.mockup_urls : [];
      const updated = [...existing, urlData.publicUrl];
      await supabase.from("production_orders").update({ mockup_urls: updated } as any).eq("id", order.id);
      toast.success("Additional mockup added");
      refreshOrders();
    } catch (e: any) { toast.error(e.message || "Upload failed"); }
    setAdditionalMockupUploading(false);
  }, [order, companyId, refreshOrders]);

  // Remove additional mockup
  const removeAdditionalMockup = useCallback(async (urlToRemove: string) => {
    if (!order) return;
    const raw = order as any;
    const existing: string[] = Array.isArray(raw.mockup_urls) ? raw.mockup_urls : [];
    const updated = existing.filter(u => u !== urlToRemove);
    await supabase.from("production_orders").update({ mockup_urls: updated } as any).eq("id", order.id);
    toast.success("Mockup removed");
    refreshOrders();
  }, [order, refreshOrders]);

  // All images for fullscreen navigation
  const allImages = useMemo(() => {
    if (!order) return [];
    const raw = order as any;
    const imgs: string[] = [];
    if (raw.blueprint_url) imgs.push(raw.blueprint_url);
    if (Array.isArray(raw.mockup_urls)) imgs.push(...raw.mockup_urls);
    return imgs;
  }, [order]);

  if (!order) {
    return (
      <PageTransition><ResponsiveLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading work order...
        </div>
      </ResponsiveLayout></PageTransition>
    );
  }

  const raw = order as any;
  const woNumber = raw.wo_number || `WO-${order.id.slice(0, 8).toUpperCase()}`;
  const statusKey = order.poi_token_used ? "Instalado" : order.status;
  const currentStatus = STATUS_OPTIONS.find(s => s.value === statusKey) || STATUS_OPTIONS[0];
  const progress = stepsProgress || order.progress || 0;
  const priorityInfo = PRIORITY_CONFIG[order.priority || "media"] || PRIORITY_CONFIG.media;
  const responsibleStaff = raw.responsible_staff;

  const fmtDate = (d: string | null | undefined) => {
    if (!d) return null;
    try { return format(new Date(d), "MMM dd, yyyy"); } catch { return d; }
  };

  return (
    <PageTransition>
      <ResponsiveLayout>
        <div className="p-0 lg:p-0">
          {/* ═══ HEADER ═══ */}
          <Breadcrumb className="mb-3">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/work-orders" className="flex items-center gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" /> Work Orders
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>{order.client}</BreadcrumbPage></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage className="font-mono text-xs">{woNumber}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{order.client}</h1>
              <p className="text-sm text-muted-foreground">
                {raw.product_type || raw.project_name || order.project || "—"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80 ${currentStatus.bg} ${currentStatus.text}`}>
                    {currentStatus.label}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {STATUS_OPTIONS.map(s => (
                    <DropdownMenuItem key={s.value} onClick={() => handleStatusChange(s.value)}>
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {!editMode ? (
                <Button variant="outline" size="sm" onClick={enterEdit} className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                  <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                </Button>
              ) : (
                <>
                  <Button size="sm" onClick={saveEdit} disabled={editSaving} className="bg-violet-600 hover:bg-violet-700 text-white">
                    {editSaving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                    <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)} className="text-muted-foreground">
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / PDF
              </Button>
              <Button variant="outline" size="sm" onClick={generatePOI} className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10">
                <QrCode className="w-3.5 h-3.5 mr-1.5" /> POI Link
              </Button>
            </div>
          </div>

          <div className="border-t mb-6" style={{ borderColor: "rgba(255,255,255,0.05)" }} />

          {/* ═══ 2-COLUMN LAYOUT ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* LEFT COL – 60% (3/5) */}
            <div className="lg:col-span-3 space-y-4">

              {/* ═══ DESIGN WORKSPACE ═══ */}
              <SectionCard>
                <div className="mb-1">
                  <h2 className={SECTION_TITLE} style={SECTION_TITLE_COLOR}>Design Workspace</h2>
                  <p className="text-xs text-muted-foreground -mt-3 mb-4">Mockup, blueprint & reference files</p>
                </div>

                {/* Main mockup area */}
                {raw.blueprint_url ? (
                  <div className="relative group mb-4">
                    <div className="rounded-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.3)" }}>
                      <img
                        src={raw.blueprint_url}
                        alt="Mockup"
                        className="w-full object-contain cursor-pointer"
                        style={{ maxHeight: 400 }}
                        onClick={() => setFullscreenImg({ url: raw.blueprint_url, index: 0 })}
                      />
                    </div>
                    <Badge className="absolute top-3 left-3 bg-violet-500/30 text-violet-200 border-0 text-[10px]">Mockup</Badge>
                    <button
                      onClick={() => setFullscreenImg({ url: raw.blueprint_url, index: 0 })}
                      className="absolute top-3 right-3 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.6)" }}
                    >
                      <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                    {canEdit && (
                      <Button variant="outline" size="sm" className="mt-2 text-xs text-muted-foreground" onClick={() => mockupInputRef.current?.click()}>
                        Replace mockup
                      </Button>
                    )}
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center gap-3 cursor-pointer mb-4"
                    style={{ border: "2px dashed rgba(139,92,246,0.3)", borderRadius: 8, height: 200 }}
                    onClick={() => mockupInputRef.current?.click()}
                  >
                    {mockupUploading ? (
                      <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#8b5cf6" }} />
                    ) : (
                      <>
                        <Upload className="w-10 h-10" style={{ color: "#8b5cf6" }} />
                        <p className="text-sm text-foreground font-medium">Upload mockup or render</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, PDF · Max 10MB</p>
                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs">Browse files</Button>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={mockupInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleMockupUpload(f); e.target.value = ""; }}
                />

                {/* 2 columns: additional mockups + design notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Additional mockups */}
                  <div>
                    <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-2">Additional Mockups</p>
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      {(Array.isArray(raw.mockup_urls) ? raw.mockup_urls : []).map((url: string, i: number) => (
                        <div key={i} className="relative group/thumb">
                          <img
                            src={url}
                            alt={`Mockup ${i + 1}`}
                            className="w-full h-16 object-cover rounded cursor-pointer border border-white/[0.08]"
                            onClick={() => setFullscreenImg({ url, index: (raw.blueprint_url ? i + 1 : i) })}
                          />
                          {canEdit && (
                            <button
                              onClick={() => removeAdditionalMockup(url)}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                              style={{ background: "rgba(239,68,68,0.9)" }}
                            >
                              <X className="w-2.5 h-2.5 text-white" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {canEdit && (
                      <>
                        <button
                          onClick={() => additionalMockupInputRef.current?.click()}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
                          style={{ border: "1px dashed rgba(139,92,246,0.25)" }}
                          disabled={additionalMockupUploading}
                        >
                          {additionalMockupUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          Add mockup
                        </button>
                        <input
                          ref={additionalMockupInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleAdditionalMockupUpload(f); e.target.value = ""; }}
                        />
                      </>
                    )}
                  </div>

                  {/* Design notes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Design Notes</p>
                      {designNotesSaved && <span className="text-[10px] font-medium" style={{ color: "#4ade80" }}>Saved ✓</span>}
                    </div>
                    <Textarea
                      value={designNotes}
                      onChange={e => setDesignNotes(e.target.value)}
                      onBlur={handleDesignNotesBlur}
                      placeholder="Notes for the production team..."
                      className="min-h-[100px] text-xs"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  {raw.blueprint_url ? (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-[10px]">Mockup ready</Badge>
                  ) : (
                    <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px]">No mockup uploaded</Badge>
                  )}
                  <button
                    onClick={() => setSheetOpen(true)}
                    className="text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: "rgba(139,92,246,0.8)" }}
                  >
                    View in Production Sheet →
                  </button>
                </div>
              </SectionCard>

              {/* Progress & Timeline */}
              <SectionCard>
                <h2 className={SECTION_TITLE} style={SECTION_TITLE_COLOR}>Production Progress</h2>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1 overflow-hidden" style={{ height: 10, borderRadius: 5, background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full transition-all duration-500" style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #7c3aed, #8b5cf6)",
                      borderRadius: 5,
                    }} />
                  </div>
                  <span className="text-xl font-bold shrink-0" style={{ color: "#a78bfa" }}>{progress}%</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Created: {fmtDate(order.startDate) || "—"}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Delivery: {fmtDate(order.estimatedDelivery || order.estimatedCompletion) || "No date"}</span>
                </div>
              </SectionCard>

              {/* Production Steps */}
              <SectionCard>
                <h2 className={SECTION_TITLE} style={SECTION_TITLE_COLOR}>Production Steps</h2>
                {stepsLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading steps...
                  </div>
                ) : steps.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No production steps configured for this order.</p>
                ) : (
                  <div className="space-y-1">
                    {steps.map(step => {
                      const isDone = step.status === "completed";
                      const isActive = step.status === "in_progress";
                      return (
                        <div key={step.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors hover:bg-white/[0.02]" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                          {/* Icon */}
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#22c55e" }} />
                          ) : isActive ? (
                            <Loader2 className="w-4 h-4 shrink-0 animate-spin" style={{ color: "#3b82f6" }} />
                          ) : (
                            <Circle className="w-4 h-4 shrink-0 text-zinc-600" />
                          )}
                          {/* Name */}
                          <span className={`flex-1 text-sm ${isDone ? "line-through opacity-50" : "text-foreground"}`}>
                            {step.name}
                          </span>
                          {/* Badge */}
                          <Badge variant="outline" className={`text-[10px] ${isDone ? "border-emerald-500/30 text-emerald-400" : isActive ? "border-blue-500/30 text-blue-400" : "border-zinc-700 text-zinc-500"}`}>
                            {isDone ? "Done" : isActive ? "In Progress" : "Pending"}
                          </Badge>
                          {/* Assignee */}
                          {step.assigned_name && (
                            <span className="text-xs text-muted-foreground hidden sm:inline">{step.assigned_name}</span>
                          )}
                          {/* Duration */}
                          {isDone && step.duration_minutes != null && (
                            <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {step.duration_minutes}m
                            </span>
                          )}
                          {/* Actions */}
                          {canEdit && !isDone && (
                            <Button
                              variant="ghost" size="sm"
                              className="h-6 text-[10px] px-2"
                              onClick={() => isActive ? completeStep(step.id) : startStep(step.id)}
                            >
                              {isActive ? "Complete" : "Start"}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              {/* QC Checklist */}
              <SectionCard>
                <h2 className={SECTION_TITLE} style={SECTION_TITLE_COLOR}>Quality Control</h2>
                <div className="space-y-2 mb-4">
                  {QC_ITEMS.map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                      <input
                        type="checkbox"
                        checked={!!qcChecklist[item.key]}
                        onChange={() => toggleQc(item.key)}
                        className="w-4 h-4 rounded accent-violet-500"
                      />
                      <span className={`text-sm ${qcChecklist[item.key] ? "text-foreground" : "text-muted-foreground"}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>

                {allQcPassed && !signatureUrl && (
                  <div className="px-3 py-2 rounded-lg mb-3" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <p className="text-xs font-medium" style={{ color: "#4ade80" }}>✓ All checks passed — Ready for QC Signature</p>
                  </div>
                )}

                {signatureUrl ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-violet-500/20 text-violet-300 border-0 text-xs">QC Approved</Badge>
                      <span className="text-xs text-muted-foreground">
                        Signed by {qcSignerName || "Inspector"} · {fmtDate(qcSignedAt)}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-2 inline-block">
                      <img src={signatureUrl} alt="QC Signature" className="h-12 object-contain" />
                    </div>
                  </div>
                ) : (
                  <QCSignaturePad
                    orderId={order.id}
                    companyId={companyId}
                    allQcPassed={allQcPassed}
                    existingSignatureUrl={null}
                    inspectorName=""
                    onSignatureSaved={(url, name, at) => {
                      setSignatureUrl(url);
                      setQcSignerName(name);
                      setQcSignedAt(at);
                      refreshOrders();
                    }}
                  />
                )}
              </SectionCard>

              {/* Installation Photos */}
              <SectionCard>
                <h2 className={SECTION_TITLE} style={SECTION_TITLE_COLOR}>Installation Photos</h2>
                {order.poi_token_used && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-0 text-xs mb-3">Installation Documented</Badge>
                )}
                {poiPhotos.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-3">No photos yet. Share the POI link with the installer.</p>
                    <Button variant="outline" size="sm" onClick={generatePOI} className="border-violet-500/30 text-violet-400">
                      <QrCode className="w-3.5 h-3.5 mr-1.5" /> Generate POI Link
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {poiPhotos.map(photo => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.public_url || ""}
                          alt="Installation"
                          className="w-full h-24 object-cover rounded-lg border border-white/[0.08]"
                        />
                        {photo.uploaded_by_name && (
                          <span className="absolute bottom-1 left-1 text-[8px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                            {photo.uploaded_by_name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            {/* RIGHT COL – 40% (2/5) */}
            <div className="lg:col-span-2 space-y-4">

              {/* Project Details — sticky */}
              <SectionCard className="lg:sticky lg:top-5">
                <h2 className={SECTION_TITLE} style={SECTION_TITLE_COLOR}>Project Details</h2>
                <div className="space-y-3">
                  {editMode ? (
                    <>
                      <Field label="Client"><Input value={editFields.client} onChange={e => setEditFields(p => ({ ...p, client: e.target.value }))} /></Field>
                      <Field label="Project"><Input value={editFields.project_name} onChange={e => setEditFields(p => ({ ...p, project_name: e.target.value }))} /></Field>
                      <Field label="WO Number"><span className="font-mono text-sm text-foreground">{woNumber}</span></Field>
                      <Field label="Priority">
                        <Select value={editFields.priority} onValueChange={v => setEditFields(p => ({ ...p, priority: v }))}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Delivery Date"><Input type="date" value={editFields.estimated_delivery} onChange={e => setEditFields(p => ({ ...p, estimated_delivery: e.target.value }))} /></Field>
                      <div className="border-t pt-3 mt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }} />
                      <Field label="Site Address"><Input value={editFields.site_address} onChange={e => setEditFields(p => ({ ...p, site_address: e.target.value }))} /></Field>
                      <Field label="Contact"><Input value={editFields.contact_name} onChange={e => setEditFields(p => ({ ...p, contact_name: e.target.value }))} /></Field>
                      <Field label="Phone"><Input value={editFields.contact_phone} onChange={e => setEditFields(p => ({ ...p, contact_phone: e.target.value }))} /></Field>
                      <Field label="Email"><Input value={editFields.contact_email} onChange={e => setEditFields(p => ({ ...p, contact_email: e.target.value }))} /></Field>
                    </>
                  ) : (
                    <>
                      <ReadField label="Client" value={order.client} />
                      <ReadField label="Project" value={raw.project_name || order.project} />
                      <ReadField label="WO Number" value={woNumber} mono />
                      <ReadField label="Priority">
                        <Badge className={`${priorityInfo.color} border-0 text-[10px]`}>{priorityInfo.label}</Badge>
                      </ReadField>
                      <ReadField label="Delivery" value={fmtDate(order.estimatedDelivery || order.estimatedCompletion) || "No date set"} dim={!order.estimatedDelivery && !order.estimatedCompletion} />
                      <ReadField label="Assignee" value={assigneeName || "Unassigned"} dim={!assigneeName} />
                      <div className="border-t pt-3 mt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }} />
                      <ReadField label="Site Address" value={raw.site_address || "—"} dim={!raw.site_address} />
                      <ReadField label="Contact" value={raw.contact_name || "—"} dim={!raw.contact_name} />
                      <ReadField label="Phone" value={raw.contact_phone || "—"} dim={!raw.contact_phone} />
                      <ReadField label="Email" value={raw.contact_email || "—"} dim={!raw.contact_email} />
                    </>
                  )}
                </div>
              </SectionCard>

              {/* Material Specs */}
              <SectionCard>
                <h2 className={SECTION_TITLE} style={SECTION_TITLE_COLOR}>Material Specs</h2>
                <div className="grid grid-cols-2 gap-3">
                  {MATERIAL_FIELDS.map(f => (
                    <div key={f.key}>
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1">{f.label}</p>
                      <p className={`text-sm ${raw[f.key] ? "text-foreground" : "text-zinc-600"}`}>
                        {raw[f.key] || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Team */}
              {responsibleStaff && (
                <SectionCard>
                  <h2 className={SECTION_TITLE} style={SECTION_TITLE_COLOR}>Team</h2>
                  <div className="space-y-2">
                    {Object.entries(responsibleStaff).map(([role, entry]: [string, any]) => {
                      if (!entry?.name) return null;
                      return (
                        <div key={role} className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                            {entry.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{entry.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{role}</p>
                          </div>
                          {order.assignedToUserId && entry.user_id === order.assignedToUserId && (
                            <Badge className="bg-violet-500/20 text-violet-300 border-0 text-[9px]">Owner</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              )}

              {/* Notes */}
              <SectionCard>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={SECTION_TITLE} style={{ ...SECTION_TITLE_COLOR, marginBottom: 0 }}>Notes</h2>
                  {notesSaved && <span className="text-xs font-medium" style={{ color: "#4ade80" }}>Saved</span>}
                </div>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  placeholder="Add notes about this work order..."
                  className="min-h-[100px] text-sm"
                />
              </SectionCard>
            </div>
          </div>
        </div>

        {/* Production Sheet modal — reuse existing */}
        <ProductionSheetModal
          order={sheetOpen ? order : null}
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onRefreshOrder={refreshOrders}
        />

        {/* Fullscreen image viewer */}
        {fullscreenImg && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.92)" }}
            onClick={() => setFullscreenImg(null)}
            onKeyDown={e => {
              if (e.key === "Escape") setFullscreenImg(null);
              if (e.key === "ArrowRight" && fullscreenImg.index < allImages.length - 1)
                setFullscreenImg({ url: allImages[fullscreenImg.index + 1], index: fullscreenImg.index + 1 });
              if (e.key === "ArrowLeft" && fullscreenImg.index > 0)
                setFullscreenImg({ url: allImages[fullscreenImg.index - 1], index: fullscreenImg.index - 1 });
            }}
            tabIndex={0}
            ref={el => el?.focus()}
          >
            <button className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors" onClick={() => setFullscreenImg(null)}>
              <X className="w-6 h-6 text-white" />
            </button>
            {allImages.length > 1 && fullscreenImg.index > 0 && (
              <button
                className="absolute left-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                onClick={e => { e.stopPropagation(); setFullscreenImg({ url: allImages[fullscreenImg.index - 1], index: fullscreenImg.index - 1 }); }}
              >
                <ChevronLeftIcon className="w-8 h-8 text-white" />
              </button>
            )}
            {allImages.length > 1 && fullscreenImg.index < allImages.length - 1 && (
              <button
                className="absolute right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                onClick={e => { e.stopPropagation(); setFullscreenImg({ url: allImages[fullscreenImg.index + 1], index: fullscreenImg.index + 1 }); }}
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}
            <img
              src={fullscreenImg.url}
              alt="Fullscreen mockup"
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}
      </ResponsiveLayout>
    </PageTransition>
  );
}

/* ── Helper components ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-1">{label}</p>
      {children}
    </div>
  );
}

function ReadField({ label, value, mono, dim, children }: { label: string; value?: string; mono?: boolean; dim?: boolean; children?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground shrink-0">{label}</p>
      {children || (
        <p className={`text-sm text-right truncate ${mono ? "font-mono" : ""} ${dim ? "text-zinc-600" : "text-foreground"}`}>
          {value}
        </p>
      )}
    </div>
  );
}
