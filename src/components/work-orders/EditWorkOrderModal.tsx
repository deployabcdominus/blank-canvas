import { useEffect, useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, CheckCircle, Loader2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCatalog } from "@/hooks/useCatalog";
import { useWorkOrders, WorkOrder } from "@/contexts/WorkOrdersContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BlueprintAnnotator, type Annotation } from "./BlueprintAnnotator";

interface EditWorkOrderModalProps {
  order: WorkOrder | null;
  isOpen: boolean;
  onClose: () => void;
  startInEditMode?: boolean;
}

interface OperatorOption {
  id: string;
  name: string;
}

interface InstallerOption {
  id: string;
  name: string;
}

const PRIORITY_OPTIONS = [
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "urgente", label: "Urgente" },
];

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

            return {
              id: profile.id,
              name: profile.full_name || `Usuario ${profile.id.slice(0, 8)}`,
            } as OperatorOption;
          })
        );

        setOperators(roleChecks.filter(Boolean) as OperatorOption[]);
        setInstallers((installersResult.data || []).map((i) => ({ id: i.id, name: i.name })));
      } catch (error) {
        console.error("Error loading work order edit options:", error);
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
    if (error) { toast({ title: "Error al subir imagen", variant: "destructive" }); console.error(error); return; }
    const { data: urlData } = supabase.storage.from("work-order-blueprints").getPublicUrl(path);
    const url = urlData.publicUrl + "?t=" + Date.now();
    setBlueprintUrl(url);
    await updateOrder(order.id, { blueprintUrl: url });
  }, [order, updateOrder, toast]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);

    try {
      const estimatedDelivery = estimatedDeliveryDate ? format(estimatedDeliveryDate, "yyyy-MM-dd") : "";

      await updateOrder(order.id, {
        client,
        project,
        status,
        progress,
        estimatedCompletion: estimatedDelivery,
        estimatedDelivery,
        assignedToUserId: assignedToUserId === "none" ? null : assignedToUserId,
        installerCompanyId: installerCompanyId === "none" ? null : installerCompanyId,
        notes,
        priority,
        blueprintUrl,
        annotations,
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
      console.error(error);
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
      console.error(error);
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  const handleClose = () => {
    setEditing(false);
    onClose();
  };

  if (!order) return null;

  const fieldClass = "min-h-[44px]";

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-[520px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="text-lg font-semibold truncate">
                {`Editar Orden — ${order.client}`}
              </SheetTitle>
              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <Label>Título de la orden</Label>
              {editing ? (
                <Input value={client} onChange={(e) => setClient(e.target.value)} className={fieldClass} />
              ) : (
                <p className="text-sm text-foreground mt-1">{client || "—"}</p>
              )}
            </div>

            <div>
              <Label>Descripción</Label>
              {editing ? (
                <Input value={project} onChange={(e) => setProject(e.target.value)} className={fieldClass} />
              ) : (
                <p className="text-sm text-foreground mt-1">{project || "—"}</p>
              )}
            </div>

            <div>
              <Label>Estado</Label>
              {editing ? (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.length > 0 ? (
                      statuses.map((s) => (
                        <SelectItem key={s.value} value={s.label}>
                          {s.label}
                        </SelectItem>
                      ))
                    ) : (
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
                <p className="text-sm text-foreground mt-1">{status || "—"}</p>
              )}
            </div>

            <div>
              <Label>Progreso — {progress}%</Label>
              {editing ? (
                <Slider value={[progress]} onValueChange={(v) => setProgress(v[0])} max={100} step={5} className="mt-2" />
              ) : (
                <div className="mt-2 h-2 rounded-full bg-muted/30 overflow-hidden">
                  <div className="h-full rounded-full bg-primary/60" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>

            <div>
              <Label>Fecha estimada de entrega</Label>
              {editing ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !estimatedDeliveryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {estimatedDeliveryDate ? format(estimatedDeliveryDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={estimatedDeliveryDate}
                      onSelect={setEstimatedDeliveryDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="text-sm text-foreground mt-1">
                  {estimatedDeliveryDate ? format(estimatedDeliveryDate, "PPP", { locale: es }) : "—"}
                </p>
              )}
            </div>

            <div>
              <Label>Operario asignado</Label>
              {editing ? (
                <Select value={assignedToUserId} onValueChange={setAssignedToUserId}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar operario"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {operators.map((operator) => (
                      <SelectItem key={operator.id} value={operator.id}>
                        {operator.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-foreground mt-1">
                  {operators.find((o) => o.id === assignedToUserId)?.name || "Sin asignar"}
                </p>
              )}
            </div>

            <div>
              <Label>Subcontratista asignado</Label>
              {editing ? (
                <Select value={installerCompanyId} onValueChange={setInstallerCompanyId}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder={loadingOptions ? "Cargando..." : "Seleccionar subcontratista"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin asignar</SelectItem>
                    {installers.map((installer) => (
                      <SelectItem key={installer.id} value={installer.id}>
                        {installer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-foreground mt-1">
                  {installers.find((i) => i.id === installerCompanyId)?.name || "Sin asignar"}
                </p>
              )}
            </div>

            <div>
              <Label>Prioridad</Label>
              {editing ? (
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-foreground mt-1 capitalize">{priority || "media"}</p>
              )}
            </div>

            <div>
              <Label>Notas internas</Label>
              {editing ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas sobre esta orden..."
                  className="min-h-[90px] resize-none"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{notes || "Sin notas"}</p>
              )}
            </div>

            {/* Blueprint Annotator */}
            <div className="pt-2 border-t border-border/20">
              <BlueprintAnnotator
                imageUrl={blueprintUrl}
                annotations={annotations}
                onChange={(newAnnotations) => setAnnotations(newAnnotations)}
                onImageUpload={handleBlueprintUpload}
                readOnly={!editing}
              />
            </div>

            {editing && (
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditing(false)} className={fieldClass} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className={cn("flex-1", fieldClass)} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </div>
            )}

            {!isCompleted && (
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full text-mint border-mint/40 hover:bg-mint/10 hover:text-mint"
                  onClick={() => setConfirmComplete(true)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Marcar como completada
                </Button>
              </div>
            )}

            {editing && isAdmin && (
              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar orden
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta orden?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente la orden "{order.client}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmComplete} onOpenChange={setConfirmComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmas que esta orden está completada?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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
