import { useEffect, useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarIcon, CheckCircle, Loader2, Pencil, Trash2, Plus, X,
  Package, Wrench, ClipboardList, MapPin, Factory,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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

const STATUS_MAP: Record<string, { color: string; icon: React.ReactNode }> = {
  "Pendiente": { color: "bg-lavender text-lavender-foreground", icon: <Package className="w-3.5 h-3.5" /> },
  "En Progreso": { color: "bg-soft-blue text-soft-blue-foreground", icon: <Wrench className="w-3.5 h-3.5" /> },
  "Control de Calidad": { color: "bg-pale-pink text-pale-pink-foreground", icon: <ClipboardList className="w-3.5 h-3.5" /> },
  "Completada": { color: "bg-mint text-mint-foreground", icon: <CheckCircle className="w-3.5 h-3.5" /> },
};

const COMPLETED_STATUS_VALUES = ["completada", "completado", "completed", "done"];

export function EditWorkOrderModal({ order, isOpen, onClose, startInEditMode = false }: EditWorkOrderModalProps) {
  const { updateOrder, deleteOrder } = useWorkOrders();
  const { isAdmin, companyId } = useUserRole();
  const { items: statuses } = useCatalog("order_status");
  const { toast } = useToast();

  const [editing, setEditing] = useState(startInEditMode);
  const [saving, setSaving] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);

  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState<Date | undefined>(undefined);
  const [assignedToUserId, setAssignedToUserId] = useState<string>("none");
  const [installerCompanyId, setInstallerCompanyId] = useState<string>("none");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("media");
  const [blueprintUrl, setBlueprintUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [technicalDetails, setTechnicalDetails] = useState<TechnicalDetails>({});
  const [materials, setMaterials] = useState<Array<{ item: string; quantity: string; status: string }>>([]);

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
    setPriority(order.priority || "media");
    setBlueprintUrl(order.blueprintUrl || null);
    setAnnotations(Array.isArray(order.annotations) ? order.annotations : []);
    setTechnicalDetails(order.technicalDetails || {});
    setMaterials(Array.isArray(order.materials) ? [...order.materials] : []);
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
    setMaterials(prev => [...prev, { item: "", quantity: "", status: "pendiente" }]);
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
        notes, priority, blueprintUrl, annotations, technicalDetails,
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

  const handleComplete = async () => {
    if (!order) return;
    try {
      await updateOrder(order.id, { status: "Completada", progress: 100 });
      toast({ title: "Orden completada" });
      setConfirmComplete(false);
      onClose();
    } catch (error) {
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
    } catch (error) {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  const handleClose = () => { setEditing(false); onClose(); };

  if (!order) return null;

  const statusCfg = STATUS_MAP[status] || STATUS_MAP["Pendiente"];
  const fieldClass = "min-h-[44px]";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden p-0 bg-zinc-950/90 backdrop-blur-2xl border-border/20">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/20">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">{client}</h2>
              <p className="text-sm text-muted-foreground truncate mt-0.5">{project}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className={`${statusCfg.color} text-xs gap-1`}>
                {statusCfg.icon} {status}
              </Badge>
              {!editing && isAdmin && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="text-xs border-border/40 text-muted-foreground hover:text-foreground">
                  <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
                </Button>
              )}
            </div>
          </div>

          {/* Body: Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 max-h-[calc(90vh-140px)] overflow-y-auto">
            {/* LEFT: Project Details */}
            <div className="p-6 space-y-5 lg:border-r border-border/20">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Detalles del Proyecto
              </h3>

              <div>
                <Label className="text-xs text-muted-foreground">Cliente</Label>
                {editing ? (
                  <Input value={client} onChange={(e) => setClient(e.target.value)} className={fieldClass} />
                ) : (
                  <p className="text-sm text-foreground mt-1 font-medium">{client || "—"}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Proyecto / Descripción</Label>
                {editing ? (
                  <Input value={project} onChange={(e) => setProject(e.target.value)} className={fieldClass} />
                ) : (
                  <p className="text-sm text-foreground mt-1">{project || "—"}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Estado</Label>
                  {editing ? (
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
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
                  <Label className="text-xs text-muted-foreground">Prioridad</Label>
                  {editing ? (
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-foreground mt-1 capitalize">{priority}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Progreso — {progress}%</Label>
                {editing ? (
                  <Slider value={[progress]} onValueChange={(v) => setProgress(v[0])} max={100} step={5} className="mt-2" />
                ) : (
                  <div className="mt-2 h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div className="h-full rounded-full bg-primary/60" style={{ width: `${progress}%` }} />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Fecha estimada de entrega</Label>
                {editing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !estimatedDeliveryDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Operario asignado</Label>
                  {editing ? (
                    <Select value={assignedToUserId} onValueChange={setAssignedToUserId}>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {operators.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-foreground mt-1">{operators.find((o) => o.id === assignedToUserId)?.name || "Sin asignar"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Subcontratista</Label>
                  {editing ? (
                    <Select value={installerCompanyId} onValueChange={setInstallerCompanyId}>
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
                        {installers.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-foreground mt-1">{installers.find((i) => i.id === installerCompanyId)?.name || "Sin asignar"}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Notas internas</Label>
                {editing ? (
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas..." className="min-h-[80px] resize-none" />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">{notes || "Sin notas"}</p>
                )}
              </div>
            </div>

            {/* RIGHT: Materials, Technical, Blueprint */}
            <div className="p-6 space-y-5">
              {/* Materials Section */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                  <Factory className="w-3.5 h-3.5" /> Gestión de Materiales
                </h3>
                <div className="space-y-2">
                  {materials.map((mat, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/10 border border-border/10">
                      {editing ? (
                        <>
                          <Input
                            value={mat.item}
                            onChange={(e) => updateMaterial(i, "item", e.target.value)}
                            placeholder="Material"
                            className="flex-1 h-8 text-xs"
                          />
                          <Input
                            value={mat.quantity}
                            onChange={(e) => updateMaterial(i, "quantity", e.target.value)}
                            placeholder="Cant."
                            className="w-20 h-8 text-xs"
                          />
                          <Select value={mat.status} onValueChange={(v) => updateMaterial(i, "status", v)}>
                            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="pedido">Pedido</SelectItem>
                              <SelectItem value="recibido">Recibido</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeMaterial(i)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm flex-1 truncate">{mat.item || "—"}</span>
                          <span className="text-xs text-muted-foreground">{mat.quantity}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">{mat.status}</Badge>
                        </>
                      )}
                    </div>
                  ))}
                  {materials.length === 0 && !editing && (
                    <p className="text-xs text-muted-foreground py-3 text-center">Sin materiales registrados</p>
                  )}
                  {editing && (
                    <Button variant="outline" size="sm" onClick={addMaterial} className="w-full text-xs border-dashed border-border/40 text-muted-foreground hover:text-foreground">
                      <Plus className="w-3.5 h-3.5 mr-1.5" /> Agregar Material
                    </Button>
                  )}
                </div>
              </div>

              {/* Technical Sheet */}
              <div className="pt-3 border-t border-border/20">
                <TechnicalSheet value={technicalDetails} onChange={setTechnicalDetails} readOnly={!editing} />
              </div>

              {/* Blueprint Annotator */}
              <div className="pt-3 border-t border-border/20">
                <BlueprintAnnotator
                  imageUrl={blueprintUrl}
                  annotations={annotations}
                  onChange={(a) => setAnnotations(a)}
                  onImageUpload={handleBlueprintUpload}
                  readOnly={!editing}
                />
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-border/20 bg-zinc-950/80 backdrop-blur-xl">
            <div className="flex gap-2">
              {!isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-muted-foreground border-border/40 hover:text-foreground"
                  onClick={() => setConfirmComplete(true)}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Completar
                </Button>
              )}
              {editing && isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Eliminar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {editing && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving} className="text-xs text-muted-foreground border-border/40">
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs btn-violet">
                    {saving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Guardando...</> : "Guardar cambios"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta orden de producción?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente la orden de "{order.client}". Esta acción no se puede deshacer y todos los datos asociados (materiales, plano, ficha técnica) se perderán.
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
