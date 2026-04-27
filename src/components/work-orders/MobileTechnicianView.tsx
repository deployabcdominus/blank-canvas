import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useCompany } from "@/hooks/useCompany";
import { useIndustryLabels } from "@/hooks/useIndustryLabels";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FeatureGuard } from "@/components/FeatureGuard";
import { toast } from "@/hooks/use-toast";
import {
  ClipboardList, FileText, Camera, Play, CheckCircle2, ArrowLeft,
  Ruler, ArrowUpDown, Box, Thermometer, Wind, Gauge, Server,
  Clock, Shield, Monitor, Wrench, Hammer, X, Image as ImageIcon,
  ChevronRight, Loader2
} from "lucide-react";

/* ── Industry field definitions (mirrored from TechnicalSheet) ── */
interface FieldDef {
  key: string;
  label: string;
  icon: React.ElementType;
  type: "number" | "text" | "select" | "checkbox";
  placeholder?: string;
  unit?: string;
  options?: string[];
}

const INDUSTRY_FIELDS: Record<string, FieldDef[]> = {
  "Señalética y Publicidad": [
    { key: "largo", label: "Largo", icon: Ruler, type: "number", placeholder: "0.00", unit: "m" },
    { key: "ancho", label: "Ancho", icon: ArrowUpDown, type: "number", placeholder: "0.00", unit: "m" },
    { key: "profundidad", label: "Profundidad", icon: Box, type: "number", placeholder: "0.00", unit: "m" },
    { key: "material", label: "Material", icon: Hammer, type: "text", placeholder: "Ej: Acrílico, ACM" },
  ],
  "Climatización y HVAC": [
    { key: "capacidad_btu", label: "Capacidad", icon: Thermometer, type: "number", placeholder: "0", unit: "BTU" },
    { key: "toneladas", label: "Toneladas", icon: Gauge, type: "number", placeholder: "0.0", unit: "TON" },
    { key: "presion", label: "Presión", icon: Wind, type: "number", placeholder: "0", unit: "PSI" },
    { key: "refrigerante", label: "Refrigerante", icon: Thermometer, type: "select", options: ["R-22", "R-410A", "R-32", "R-134a", "Otro"] },
    { key: "check_fuga", label: "Sin fugas detectadas", icon: Shield, type: "checkbox" },
    { key: "check_voltaje", label: "Voltaje verificado", icon: Shield, type: "checkbox" },
  ],
  "Servicios IT y Software": [
    { key: "hardware_specs", label: "Hardware", icon: Server, type: "text", placeholder: "Ej: Dell R740" },
    { key: "sla", label: "SLA", icon: Clock, type: "select", options: ["4h", "8h", "24h", "48h", "Best Effort"] },
    { key: "prioridad_tecnica", label: "Prioridad", icon: Shield, type: "select", options: ["P1 - Crítica", "P2 - Alta", "P3 - Media", "P4 - Baja"] },
    { key: "sistema_operativo", label: "S.O.", icon: Monitor, type: "text", placeholder: "Ej: Windows Server 2022" },
  ],
  "Mantenimiento y Reformas": [
    { key: "largo", label: "Largo", icon: Ruler, type: "number", placeholder: "0.00", unit: "m" },
    { key: "ancho", label: "Ancho", icon: ArrowUpDown, type: "number", placeholder: "0.00", unit: "m" },
    { key: "profundidad", label: "Profundidad", icon: Box, type: "number", placeholder: "0.00", unit: "m" },
    { key: "tipo_trabajo", label: "Tipo", icon: Wrench, type: "select", options: ["Plomería", "Electricidad", "Albañilería", "Pintura", "Carpintería", "Otro"] },
    { key: "check_seguridad", label: "Área segura para trabajar", icon: Shield, type: "checkbox" },
    { key: "check_herramienta", label: "Herramientas verificadas", icon: Shield, type: "checkbox" },
  ],
};

const DEFAULT_FIELDS: FieldDef[] = [
  { key: "especificacion", label: "Especificación", icon: Wrench, type: "text", placeholder: "Detalle técnico" },
  { key: "cantidad", label: "Cantidad", icon: Box, type: "number", placeholder: "0" },
];

type MobileTab = "task" | "details" | "photos";

interface OrderData {
  id: string;
  client: string;
  project: string;
  status: string;
  progress: number;
  priority: string;
  notes: string;
  technical_details: Record<string, any>;
  estimated_delivery: string | null;
  photos?: string[];
}

export default function MobileTechnicianView() {
  const { user } = useAuth();
  const { companyId } = useUserRole();
  const { company } = useCompany();
  const labels = useIndustryLabels();
  const [tab, setTab] = useState<MobileTab>("task");
  const [orders, setOrders] = useState<OrderData[]>(() => {
    const saved = localStorage.getItem("cached_tech_orders");
    return saved ? JSON.parse(saved) : [];
  });
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem("tech_orders_last_sync"));
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [techDetails, setTechDetails] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const industry = company?.industry ?? null;
  const fields = (industry && INDUSTRY_FIELDS[industry]) ? INDUSTRY_FIELDS[industry] : DEFAULT_FIELDS;

  // Load assigned orders
  const loadOrders = useCallback(async () => {
    if (!user || !companyId) return;
    try {
      const { data } = await supabase
        .from("production_orders")
        .select("id, client, project, status, progress, priority, notes, technical_details, estimated_delivery")
        .eq("company_id", companyId)
        .or(`assigned_to_user_id.eq.${user.id},owner_user_id.eq.${user.id}`)
        .in("status", ["Pendiente", "En Progreso", "En Producción"])
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (data) {
        setOrders(data as any);
        const now = new Date().toISOString();
        localStorage.setItem("cached_tech_orders", JSON.stringify(data));
        localStorage.setItem("tech_orders_last_sync", now);
        setLastSync(now);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      toast({ title: "Modo Offline", description: "Mostrando datos guardados localmente." });
    }
  }, [user, companyId]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Realtime
  useEffect(() => {
    if (!companyId) return;
    const ch = supabase.channel("mobile-orders")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "production_orders" }, loadOrders)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [companyId, loadOrders]);

  const selectOrder = (order: OrderData) => {
    setSelectedOrder(order);
    setTechDetails(order.technical_details || {});
    setPhotos((order as any).photos || []);
    setTab("task");
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      const updates: any = { status: newStatus };
      if (newStatus === "Finalizada") updates.progress = 100;
      if (newStatus === "En Progreso") updates.start_date = new Date().toISOString();
      await supabase.from("production_orders").update(updates).eq("id", selectedOrder.id);
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus, ...updates } : null);
      toast({ title: newStatus === "Finalizada" ? "✅ Orden finalizada" : "▶️ Orden iniciada" });
      loadOrders();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveTechDetails = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    try {
      await (supabase as any).from("production_orders")
        .update({ technical_details: techDetails })
        .eq("id", selectedOrder.id);
      toast({ title: "Ficha técnica guardada" });
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrder || !companyId) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${companyId}/${selectedOrder.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("installation-photos").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("installation-photos").getPublicUrl(path);
      const newPhotos = [...photos, urlData.publicUrl];
      setPhotos(newPhotos);
      toast({ title: "📸 Foto subida" });
    } catch {
      toast({ title: "Error al subir foto", variant: "destructive" });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ── Order List ── */
  if (!selectedOrder) {
    return (
      <div className="min-h-screen bg-zinc-950 text-foreground">
        <div className="safe-top px-4 pt-6 pb-3">
          <h1 className="text-xl font-bold">Mis {labels.workOrders}</h1>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">Órdenes asignadas a ti</p>
            {lastSync && (
              <p className="text-[10px] text-muted-foreground/60 italic">
                Sinc: {new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
        <div className="px-4 space-y-3 pb-8">
          {orders.length === 0 && (
            <div className="text-center py-16">
              <ClipboardList className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No tienes órdenes asignadas</p>
            </div>
          )}
          {orders.map(o => (
            <motion.button
              key={o.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => selectOrder(o)}
              className="w-full text-left p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{o.project || o.client}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{o.client}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-[10px] ${
                    o.status === "En Progreso" ? "bg-orange-500/15 text-orange-400 border-orange-500/20" :
                    "bg-white/[0.06] text-muted-foreground border-white/[0.06]"
                  }`}>
                    {o.status}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Order Detail ── */
  const tabs: { id: MobileTab; label: string; icon: React.ElementType }[] = [
    { id: "task", label: "Mi Tarea", icon: ClipboardList },
    { id: "details", label: "Detalles", icon: FileText },
    { id: "photos", label: "Evidencia", icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col">
      {/* Top bar */}
      <div className="safe-top flex items-center gap-3 px-4 pt-5 pb-3">
        <button
          onClick={() => setSelectedOrder(null)}
          className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm truncate">{selectedOrder.project || selectedOrder.client}</p>
          <p className="text-xs text-muted-foreground truncate">{selectedOrder.client}</p>
        </div>
        <Badge variant="secondary" className="shrink-0 text-[10px] bg-white/[0.06] border-white/[0.06]">
          {selectedOrder.priority || "Media"}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-44">
        <AnimatePresence mode="wait">
          {/* ── Tab: My Task ── */}
          {tab === "task" && (
            <motion.div key="task" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-4 py-3">
              {/* Status card */}
              <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl">
                <p className="text-xs text-muted-foreground mb-1">Estado actual</p>
                <p className="text-lg font-bold">{selectedOrder.status}</p>
                {selectedOrder.estimated_delivery && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Entrega: {new Date(selectedOrder.estimated_delivery).toLocaleDateString("es")}
                  </p>
                )}
              </div>

              {/* Progress */}
              <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-semibold">{selectedOrder.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                    style={{ width: `${selectedOrder.progress}%` }}
                  />
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                  <p className="text-xs text-muted-foreground mb-1">Notas</p>
                  <p className="text-sm leading-relaxed">{selectedOrder.notes}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Tab: Details (Technical Sheet) ── */}
          {tab === "details" && (
            <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
                <h3 className="text-sm font-semibold">Ficha Técnica</h3>
              </div>

              {/* Dynamic fields — single column for mobile */}
              <div className="space-y-3">
                {fields.map((field) => {
                  const Icon = field.icon;
                  const val = techDetails[field.key] ?? "";

                  if (field.type === "checkbox") {
                    return (
                      <label
                        key={field.key}
                        className="flex items-center gap-3 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] active:bg-white/[0.06] cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!val}
                          onChange={(e) => setTechDetails(prev => ({ ...prev, [field.key]: e.target.checked }))}
                          className="w-6 h-6 rounded-lg accent-orange-500"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <Icon className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
                          <span className="text-sm">{field.label}</span>
                        </div>
                      </label>
                    );
                  }

                  return (
                    <div key={field.key} className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                      <Label className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <Icon className="w-3.5 h-3.5 text-orange-400" strokeWidth={1.5} />
                        {field.label}
                        {field.unit && <span className="opacity-60">({field.unit})</span>}
                      </Label>
                      {field.type === "select" ? (
                        <Select value={String(val)} onValueChange={v => setTechDetails(prev => ({ ...prev, [field.key]: v }))}>
                          <SelectTrigger className="h-11 text-base bg-white/[0.03] border-white/[0.08]">
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options || []).map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type}
                          inputMode={field.type === "number" ? "decimal" : "text"}
                          value={String(val)}
                          onChange={e => setTechDetails(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="h-11 text-base bg-white/[0.03] border-white/[0.08]"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={saveTechDetails}
                disabled={saving}
                className="w-full h-12 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-foreground font-medium"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar Ficha Técnica
              </Button>

              <FeatureGuard feature="access_advanced_fields" message="Personaliza los campos técnicos según tu negocio.">
                <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center">
                  <p className="text-xs text-muted-foreground">✨ Personalizar campos de ficha técnica</p>
                </div>
              </FeatureGuard>
            </motion.div>
          )}

          {/* ── Tab: Photos ── */}
          {tab === "photos" && (
            <motion.div key="photos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="space-y-4 py-3">
              <FeatureGuard feature="access_previews" message="El módulo de evidencia fotográfica está disponible en Plan Pro y superior.">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <Camera className="w-4 h-4 text-orange-400" strokeWidth={1.5} />
                      Evidencia Fotográfica
                    </h3>
                    <span className="text-xs text-muted-foreground">{photos.length} fotos</span>
                  </div>

                  {/* Gallery */}
                  {photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {photos.map((url, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="aspect-square rounded-2xl overflow-hidden border border-white/[0.06]"
                        >
                          <img
                            src={url}
                            alt={`Evidencia ${i + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/20 mb-3" />
                      <p className="text-sm text-muted-foreground">Sin evidencia aún</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Usa el botón de cámara para agregar fotos</p>
                    </div>
                  )}

                  {/* Hidden input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </FeatureGuard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Floating camera button (photos tab) ── */}
      {tab === "photos" && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingPhoto}
          className="fixed bottom-28 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-[0_4px_20px_rgba(251,146,60,0.4)] flex items-center justify-center active:scale-90 transition-transform"
        >
          {uploadingPhoto ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" strokeWidth={1.5} />
          )}
        </motion.button>
      )}

      {/* ── Status action bar ── */}
      <div className="fixed bottom-16 left-0 right-0 z-30 px-4 pb-2 pt-3 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent">
        {selectedOrder.status === "Pendiente" || selectedOrder.status === "pending" ? (
          <Button
            onClick={() => handleStatusChange("En Progreso")}
            disabled={saving}
            className="w-full h-14 rounded-2xl text-base font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_20px_rgba(16,185,129,0.3)] active:scale-[0.97] transition-transform"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            Iniciar Tarea
          </Button>
        ) : selectedOrder.status !== "Finalizada" ? (
          <Button
            onClick={() => handleStatusChange("Finalizada")}
            disabled={saving}
            className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-[0_4px_20px_rgba(251,146,60,0.35)] active:scale-[0.97] transition-transform"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
            Finalizar Orden
          </Button>
        ) : null}
      </div>

      {/* ── Bottom Navigation Bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-white/[0.06] safe-bottom">
        <div className="flex items-center justify-around h-16">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors ${
                  isActive ? "text-orange-400" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
