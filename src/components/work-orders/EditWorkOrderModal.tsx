import { useEffect, useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon, CheckCircle, Loader2, Pencil, Trash2, Plus, X,
  Package, Wrench, ClipboardList, MapPin, Factory, ChevronDown,
  StickyNote, Maximize2, User, Building2, Save, FileDown, FileText,
} from "lucide-react";
import { generateProductionPDF } from "@/lib/generate-production-pdf";
import { ProductionSheetModal } from "./ProductionSheetModal";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCatalog } from "@/hooks/useCatalog";
import { useWorkOrders, WorkOrder } from "@/contexts/WorkOrdersContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BlueprintAnnotator, type Annotation } from "./BlueprintAnnotator";
import { TechnicalSheet, type TechnicalDetails } from "./TechnicalSheet";
import LiveProductionTimeline from "@/components/production/LiveProductionTimeline";
import { useOperationTemplates } from "@/hooks/useOperationTemplates";

interface EditWorkOrderModalProps {
  order: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  startInEditMode?: boolean;
}

interface OperatorOption { id: string; name: string; }
interface InstallerOption { id: string; name: string; }

const PRIORITY_OPTIONS = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

const PRIORITY_COLORS: Record<string, string> = {
  baja: "text-muted-foreground",
  media: "text-foreground",
  alta: "text-amber-400",
  urgente: "text-red-400",
};

const STATUS_MAP: Record<string, { color: string; icon: React.ReactNode }> = {
  "Pendiente": { color: "bg-lavender text-lavender-foreground", icon: <Package className="w-3.5 h-3.5" /> },
  "En Progreso": { color: "bg-soft-blue text-soft-blue-foreground", icon: <Wrench className="w-3.5 h-3.5" /> },
  "Control de Calidad": { color: "bg-pale-pink text-pale-pink-foreground", icon: <ClipboardList className="w-3.5 h-3.5" /> },
  "Completada": { color: "bg-mint text-mint-foreground", icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

const COMPLETED_STATUS_VALUES = ["completada", "completado", "completed", "done"];

/* ── Collapsible Section ── */
function Section({ title, icon, defaultOpen = true, children }: {
  title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 group">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          {icon} {title}
        </span>
        <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function EditWorkOrderModal({ order, isOpen, onClose, startInEditMode = false }: EditWorkOrderModalProps) {
  const { updateOrder, deleteOrder } = useWorkOrders();
  const { isAdmin, companyId } = useUserRole();
  const { items: statuses } = useCatalog("order_status");
  const { toast } = useToast();
  const { templates, applyTemplate } = useOperationTemplates();

  const [editing, setEditing] = useState(startInEditMode);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [blueprintFullscreen, setBlueprintFullscreen] = useState(false);
  const [showProductionSheet, setShowProductionSheet] = useState(false);

  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<Date | undefined>(undefined);
  const [assignedToUserId, setAssignedToUserId] = useState<string>("none");
  const [installerCompanyId, setInstallerCompanyId] = useState<string>("none");
  const [notes, setNotes] = useState("");
  const [installerNotes, setInstallerNotes] = useState("");
  const [priority, setPriority] = useState("media");
  const [blueprintUrl, setBlueprintUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [technicalDetails, setTechnicalDetails] = useState<TechnicalDetails>({});
  const [materials, setMaterials] = useState<Array<{ item: string; quantity: string; measures: string; status: string }>>([]);

  const [operators, setOperators] = useState<OperatorOption[]>([]);
  const [installers, setInstallers] = useState<InstallerOption[]>([]);

  useEffect(() => {
    if (!order) return;
    setClient(order.client || "");
    setProject(order.project || "");
    setStatus(order.status || "Pendiente");
    setProgress(order.progress || 0);
    const dateValue = order.estimatedDelivery || order.estimatedCompletion;
    setEstimatedDeliveryDate(dateValue ? new Date(dateValue) : undefined);
    setAssignedToUserId(order.assignedToUserId || "none");
    setInstallerCompanyId(order.installerCompanyId || "none");
    setNotes(order.notes || "");
    setInstallerNotes(order.technicalDetails?.installerNotes as string || "");
    setPriority(order.priority || "media");
    setBlueprintUrl(order.blueprintUrl || null);
    setAnnotations(Array.isArray(order.annotations) ? order.annotations : []);
    setTechnicalDetails(order.technicalDetails || {});
    setMaterials(
      Array.isArray(order.materials)
        ? order.materials.map((m: any) => ({ item: m.item || "", quantity: m.quantity || "", measures: m.measures || "", status: m.status || "pendiente" }))
        : []
    );
    setEditing(startInEditMode);
  }, [order, startInEditMode]);

  useEffect(() => {
    if (!isOpen || !companyId) return;
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [profilesResult, installersResult] = await Promise.all([
          supabase.from("profiles").select("id, full_name").eq("company_id", companyId),
          supabase.from("installer_companies").select("id, name").eq("company_id", companyId).order("name"),
        ]);
        if (profilesResult.error) throw profilesResult.error;
        if (installersResult.error) throw installersResult.error;
        const profiles = profilesResult.data || [];
        const roleChecks = await Promise.all(
          profiles.map(async (profile) => {
            const [isOperations, isMember] = await Promise.all([
              supabase.rpc("has_role", { _user_id: profile.id, _role: "operations" }),
              supabase.rpc("has_role", { _user_id: profile.id, _role: "member" }),
            ]);
            if (isOperations.error || isMember.error) return null;
            if (!isOperations.data && !isMember.data) return null;
            return { id: profile.id, name: profile.full_name || `Usuario ${profile.id.slice(0, 8)}` } as OperatorOption;
          })
        );
        setOperators(roleChecks.filter(Boolean) as OperatorOption[]);
        setInstallers((installersResult.data || []).map((i) => ({ id: i.id, name: i.name })));
      } catch (error) {
        console.error("Error loading options:", error);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, [isOpen, companyId]);

  const isCompleted = useMemo(
    () => COMPLETED_STATUS_VALUES.includes((status || "").toLowerCase()),
    [status]
  );

  const handleBlueprintUpload = useCallback(async (file: File) => {
    if (!order) return;
    const ext = file.name.split(".").pop() || "png";
    const path = `${order.companyId || "unknown"}/${order.id}/blueprint.${ext}`;
    const { error } = await supabase.storage.from("work-order-blueprints").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Error al subir imagen", variant: "destructive" }); return; }
    const { data: urlData } = supabase.storage.from("work-order-blueprints").getPublicUrl(path);
    const url = urlData.publicUrl + "?t=" + Date.now();
    setBlueprintUrl(url);
    await updateOrder(order.id, { blueprintUrl: url });
  }, [order, updateOrder, toast]);

  const addMaterial = () => {
    setMaterials(prev => [...prev, { item: "", quantity: "", measures: "", status: "pendiente" }]);
  };

  const updateMaterial = (index: number, field: string, value: string) => {
    setMaterials(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const removeMaterial = (index: number) => {
    setMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      const estimatedDelivery = estimatedDeliveryDate ? format(estimatedDeliveryDate, "yyyy-MM-dd") : "";
      await updateOrder(order.id, {
        client, project, status, progress,
        estimatedCompletion: estimatedDelivery,
        estimatedDelivery,
        assignedToUserId: assignedToUserId === "none" ? null : assignedToUserId,
        installerCompanyId: installerCompanyId === "none" ? null : installerCompanyId,
        notes, priority, blueprintUrl, annotations,
        technicalDetails: { ...technicalDetails, installerNotes },
        materials: materials.filter(m => m.item.trim()),
      });
      toast({ title: "Orden actualizada" });
      setEditing(false);
      onClose();
    } catch (error) {
      console.error(error);
      toast({ title: "Error al actualizar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSaveTechnical = useCallback(async (details: TechnicalDetails) => {
    setTechnicalDetails(details);
    if (!order || !editing) return;
    try {
      await updateOrder(order.id, { technicalDetails: { ...details, installerNotes } });
    } catch {
      // silent — user will save explicitly if needed
    }
  }, [order, editing, installerNotes, updateOrder]);

  const handleComplete = async () => {
    if (!order) return;
    try {
      await updateOrder(order.id, { status: "Completada", progress: 100 });
      toast({ title: "Orden completada" });
      setConfirmComplete(false);
      onClose();
    } catch {
      toast({ title: "Error al completar", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    try {
      await deleteOrder(order.id);
      toast({ title: "Orden eliminada" });
      setConfirmDelete(false);
      onClose();
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  const handleDownloadPdf = async () => {
    if (!order) return;
    setGeneratingPdf(true);
    try {
      await generateProductionPDF({
        id: order.id,
        client,
        project,
        status,
        priority,
        progress,
        estimatedDelivery: order.estimatedDelivery || order.estimatedCompletion,
        startDate: order.startDate,
        notes,
        assignedOperator: operators.find(o => o.id === assignedToUserId)?.name || null,
        installerCompany: installers.find(i => i.id === installerCompanyId)?.name || null,
        blueprintUrl,
        materials,
        technicalDetails,
      });
      toast({ title: "PDF generado", description: "La hoja de producción fue descargada." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error al generar PDF", variant: "destructive" });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleClose = () => { setEditing(false); onClose(); };

  if (!order) return null;

  const statusCfg = STATUS_MAP[status] || STATUS_MAP["Pendiente"];
  const assignedOp = operators.find((o) => o.id === assignedToUserId);
  const assignedInst = installers.find((i) => i.id === installerCompanyId);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl w-[96vw] max-h-[90vh] p-0 gap-0 bg-zinc-950/95 backdrop-blur-2xl border-white/[0.08] rounded-2xl flex flex-col overflow-hidden">
          {/* ── STICKY HEADER ── */}
          <div className="shrink-0 px-6 pt-5 pb-4 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold tracking-tight text-zinc-100 truncate">{client}</h2>
                <p className="text-sm text-zinc-400 truncate mt-0.5">{project || "Sin descripción de proyecto"}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className={cn("text-[11px] gap-1 font-medium", statusCfg.color)}>
                  {statusCfg.icon} {status}
                </Badge>
                {!editing && isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}
                    className="text-xs border-white/[0.1] text-muted-foreground hover:text-foreground hover:border-white/[0.2] h-8">
                    <Pencil className="w-3 h-3 mr-1.5" /> Editar
                  </Button>
                )}
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-muted-foreground">Progreso</span>
                <span className="text-[11px] font-medium text-primary">{progress}%</span>
              </div>
              {editing ? (
                <Slider value={[progress]} onValueChange={(v) => setProgress(v[0])} max={100} step={5} className="mt-1" />
              ) : (
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
            {/* Quick selectors */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-white/[0.1]">
                  <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                    {assignedOp ? assignedOp.name.charAt(0).toUpperCase() : <User className="w-3 h-3" />}
                  </AvatarFallback>
                </Avatar>
                {editing ? (
                  <Select value={assignedToUserId} onValueChange={setAssignedToUserId}>
                    <SelectTrigger className="h-7 text-[11px] border-white/[0.08] w-36 bg-transparent">
                      <SelectValue placeholder={loadingOptions ? "..." : "Operario"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {operators.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-[11px] text-muted-foreground">{assignedOp?.name || "Sin operario"}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-white/[0.1]">
                  <AvatarFallback className="text-[10px] bg-accent/30 text-accent-foreground">
                    {assignedInst ? assignedInst.name.charAt(0).toUpperCase() : <Building2 className="w-3 h-3" />}
                  </AvatarFallback>
                </Avatar>
                {editing ? (
                  <Select value={installerCompanyId} onValueChange={setInstallerCompanyId}>
                    <SelectTrigger className="h-7 text-[11px] border-white/[0.08] w-36 bg-transparent">
                      <SelectValue placeholder={loadingOptions ? "..." : "Subcontratista"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {installers.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-[11px] text-muted-foreground">{assignedInst?.name || "Sin subcontratista"}</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Body: Two-column grid with smart scroll ── */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden min-h-0">

            {/* LEFT COLUMN */}
            <div className="overflow-y-auto p-6 space-y-4 lg:border-r border-white/[0.06]">
              <Section title="Detalles del Proyecto" icon={<MapPin className="w-3.5 h-3.5" />}>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Cliente</Label>
                  {editing ? (
                    <Input value={client} onChange={(e) => setClient(e.target.value)} className="h-9 mt-1 border-white/[0.08] bg-transparent" />
                  ) : (
                    <p className="text-sm text-foreground mt-1 font-medium">{client || "—"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Proyecto / Descripción</Label>
                  {editing ? (
                    <Input value={project} onChange={(e) => setProject(e.target.value)} className="h-9 mt-1 border-white/[0.08] bg-transparent" />
                  ) : (
                    <p className="text-sm text-foreground mt-1">{project || "—"}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Estado</Label>
                    {editing ? (
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-9 mt-1 border-white/[0.08] bg-transparent"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {statuses.length > 0 ? statuses.map((s) => (
                            <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>
                          )) : (
                            <>
                              <SelectItem value="Pendiente">Pendiente</SelectItem>
                              <SelectItem value="En Progreso">En Progreso</SelectItem>
                              <SelectItem value="Control de Calidad">Control de Calidad</SelectItem>
                              <SelectItem value="Completada">Completada</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-foreground mt-1">{status}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Prioridad</Label>
                    {editing ? (
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="h-9 mt-1 border-white/[0.08] bg-transparent"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className={cn("text-sm mt-1 capitalize font-medium", PRIORITY_COLORS[priority] || "text-foreground")}>{priority}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Fecha estimada de entrega</Label>
                  {editing ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 mt-1 border-white/[0.08] bg-transparent", !estimatedDeliveryDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                          {estimatedDeliveryDate ? format(estimatedDeliveryDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={estimatedDeliveryDate} onSelect={setEstimatedDeliveryDate} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-sm text-foreground mt-1">
                      {estimatedDeliveryDate ? format(estimatedDeliveryDate, "PPP", { locale: es }) : "—"}
                    </p>
                  )}
                </div>
              </Section>

              <div className="border-t border-white/[0.06]" />

              <Section title="Notas Internas" icon={<ClipboardList className="w-3.5 h-3.5" />}>
                {editing ? (
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas del proyecto..." className="min-h-[80px] resize-none border-white/[0.08] bg-transparent" />
                ) : (
                  <p className="text-sm text-muted-foreground">{notes || "Sin notas"}</p>
                )}
              </Section>

              <div className="border-t border-white/[0.06]" />

              <Section title="Notas para el Instalador" icon={<StickyNote className="w-3.5 h-3.5" />} defaultOpen={!!installerNotes}>
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  {editing ? (
                    <Textarea
                      value={installerNotes}
                      onChange={(e) => setInstallerNotes(e.target.value)}
                      placeholder="Instrucciones obligatorias para el instalador..."
                      className="min-h-[60px] resize-none border-amber-500/20 bg-transparent text-sm placeholder:text-amber-500/40"
                    />
                  ) : (
                    <p className="text-sm text-amber-200/80">{installerNotes || "Sin notas para el instalador"}</p>
                  )}
                </div>
              </Section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="overflow-y-auto p-6 space-y-4">
              {/* Blueprint / Design */}
              <Section title="Plano de Fabricación" icon={<Maximize2 className="w-3.5 h-3.5" />}>
                <div className="relative">
                  <BlueprintAnnotator
                    imageUrl={blueprintUrl}
                    annotations={annotations}
                    onChange={(a) => setAnnotations(a)}
                    onImageUpload={handleBlueprintUpload}
                    readOnly={!editing}
                  />
                  {blueprintUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2 h-7 text-[10px] border-white/[0.1] bg-zinc-950/70 backdrop-blur-sm hover:bg-zinc-900"
                      onClick={() => setBlueprintFullscreen(true)}
                    >
                      <Maximize2 className="w-3 h-3 mr-1" /> Pantalla completa
                    </Button>
                  )}
                </div>
              </Section>

              <div className="border-t border-white/[0.06]" />

              {/* Materials */}
              <Section title="Gestión de Materiales" icon={<Factory className="w-3.5 h-3.5" />}>
                <div className="rounded-lg border border-white/[0.06] overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr_80px_100px_32px] gap-2 px-3 py-2 bg-white/[0.02] text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <span>Material</span>
                    <span>Cant.</span>
                    <span>Medidas</span>
                    <span />
                  </div>
                  {materials.map((mat, i) => (
                    <div key={i} className="grid grid-cols-[1fr_80px_100px_32px] gap-2 px-3 py-1.5 border-t border-white/[0.04] items-center">
                      {editing ? (
                        <>
                          <Input value={mat.item} onChange={(e) => updateMaterial(i, "item", e.target.value)} placeholder="Material" className="h-7 text-xs border-white/[0.06] bg-transparent" />
                          <Input value={mat.quantity} onChange={(e) => updateMaterial(i, "quantity", e.target.value)} placeholder="0" className="h-7 text-xs border-white/[0.06] bg-transparent" />
                          <Input value={mat.measures || ""} onChange={(e) => updateMaterial(i, "measures", e.target.value)} placeholder="L×A" className="h-7 text-xs border-white/[0.06] bg-transparent" />
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeMaterial(i)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs truncate">{mat.item || "—"}</span>
                          <span className="text-xs text-muted-foreground">{mat.quantity || "—"}</span>
                          <span className="text-xs text-muted-foreground">{mat.measures || "—"}</span>
                          <span />
                        </>
                      )}
                    </div>
                  ))}
                  {materials.length === 0 && !editing && (
                    <p className="text-xs text-muted-foreground py-4 text-center border-t border-white/[0.04]">Sin materiales registrados</p>
                  )}
                  {editing && (
                    <button
                      onClick={addMaterial}
                      className="w-full py-2 text-xs text-muted-foreground hover:text-foreground border-t border-dashed border-white/[0.08] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Agregar material
                    </button>
                  )}
                </div>
              </Section>

              <div className="border-t border-white/[0.06]" />

              {/* Technical Sheet */}
              <Section title="Ficha Técnica" icon={<Wrench className="w-3.5 h-3.5" />} defaultOpen={false}>
                <TechnicalSheet value={technicalDetails} onChange={editing ? handleAutoSaveTechnical : setTechnicalDetails} readOnly={!editing} />
              </Section>

              <div className="border-t border-white/[0.06]" />

              {/* Live Production Timeline */}
              <Section title="Timeline de Producción" icon={<ClipboardList className="w-3.5 h-3.5" />}>
                {editing && templates.length > 0 && (
                  <div className="mb-3">
                    <Label className="text-[11px] text-muted-foreground mb-1 block">Aplicar plantilla de operaciones</Label>
                    <Select onValueChange={(v) => order && applyTemplate(order.id, v)}>
                      <SelectTrigger className="h-8 text-xs border-white/[0.08] bg-transparent">
                        <SelectValue placeholder="Seleccionar tipo de producto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.product_type}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {order && <LiveProductionTimeline orderId={order.id} />}
              </Section>
            </div>
          </div>

          {/* ── STICKY FOOTER ── */}
          <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-white/[0.06] bg-zinc-950/90 backdrop-blur-md z-10">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={generatingPdf}
                className="text-xs border-white/[0.1] text-muted-foreground hover:text-foreground h-8">
                {generatingPdf
                  ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generando...</>
                  : <><FileDown className="w-3.5 h-3.5 mr-1.5" /> Download Production Sheet</>}
              </Button>
              {!isCompleted && (
                <Button variant="outline" size="sm" onClick={() => setConfirmComplete(true)}
                  className="text-xs text-muted-foreground border-white/[0.1] hover:text-foreground h-8">
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Completar
                </Button>
              )}
              {editing && isAdmin && (
                <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)}
                  className="text-xs text-destructive border-destructive/20 hover:bg-destructive/10 h-8">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Eliminar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {editing && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}
                    className="text-xs text-muted-foreground border-white/[0.1] h-8">
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving}
                    className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                    {saving ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Guardando...</> : <><Save className="w-3 h-3 mr-1.5" /> Guardar cambios</>}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blueprint Fullscreen Preview */}
      <Dialog open={blueprintFullscreen} onOpenChange={setBlueprintFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-2 bg-zinc-950/98 backdrop-blur-2xl border-white/[0.08]">
          {blueprintUrl && (
            <img src={blueprintUrl} alt="Plano de fabricación" className="w-full h-full object-contain rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta orden de producción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente la orden de "{order.client}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Confirmation */}
      <AlertDialog open={confirmComplete} onOpenChange={setConfirmComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmas que esta orden está completada?</AlertDialogTitle>
            <AlertDialogDescription>El progreso se marcará al 100% y el estado cambiará a "Completada".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
