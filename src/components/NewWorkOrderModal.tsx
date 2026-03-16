import React, { useState, useMemo, useCallback, useRef } from 'react';
import { DateField } from "@/components/ui/date-field";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus, Package, Search, Zap, X, Minus, Printer, Copy, Share2,
  ChevronDown, ChevronUp, Check, Upload, Maximize2, Save,
  ClipboardList, Factory, StickyNote, Ruler, Calendar,
} from "lucide-react";
import { useProposals } from "@/contexts/ProposalsContext";
import { useWorkOrders, WorkOrder } from "@/contexts/WorkOrdersContext";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { useCatalog } from "@/hooks/useCatalog";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──
interface NewWorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderMaterial {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  isCustom?: boolean;
}

// ── Materials database ──
const MATERIALS_DB = [
  { id: 'f1',  name: 'Vinilo adhesivo',          category: 'Vinyl',      unit: 'ft²', frequent: true },
  { id: 'f2',  name: 'Paneles ACM',              category: 'Aluminio',   unit: 'pza', frequent: true },
  { id: 'f3',  name: 'Cintas LED',               category: 'LED',        unit: 'mts', frequent: true },
  { id: 'f4',  name: 'Módulos LED',              category: 'LED',        unit: 'pza', frequent: true },
  { id: 'f5',  name: 'Fuente de alimentación',   category: 'LED',        unit: 'pza', frequent: true },
  { id: 'f6',  name: 'Chapas acrílicas',         category: 'Acrílico',   unit: 'ft²', frequent: true },
  { id: 'f7',  name: 'Perfiles de aluminio',     category: 'Aluminio',   unit: 'mts', frequent: true },
  { id: 'f8',  name: 'Letras corpóreas',         category: 'Acrílico',   unit: 'set', frequent: true },
  { id: 'f9',  name: 'Impresión digital',        category: 'Impresión',  unit: 'ft²', frequent: true },
  { id: 'f10', name: 'Tornillos y anclajes',     category: 'Tornillería', unit: 'kit', frequent: true },
  { id: 'f11', name: 'Laminación',               category: 'Impresión',  unit: 'ft²', frequent: true },
  { id: 'f12', name: 'Soportes de fijación',     category: 'Aluminio',   unit: 'pza', frequent: true },
  { id: 'e1',  name: 'PVC expandido',            category: 'Acrílico',   unit: 'ft²', frequent: false },
  { id: 'e2',  name: 'Policarbonato',            category: 'Acrílico',   unit: 'ft²', frequent: false },
  { id: 'e3',  name: 'Chapas acero galvanizado', category: 'Aluminio',   unit: 'ft²', frequent: false },
  { id: 'e4',  name: 'Postes metálicos',         category: 'Aluminio',   unit: 'pza', frequent: false },
  { id: 'e5',  name: 'Controladores LED',        category: 'LED',        unit: 'pza', frequent: false },
  { id: 'e6',  name: 'Remaches',                 category: 'Tornillería', unit: 'kit', frequent: false },
  { id: 'e7',  name: 'Tacos y anclajes pesados', category: 'Tornillería', unit: 'kit', frequent: false },
  { id: 'e8',  name: 'Abrazaderas',              category: 'Tornillería', unit: 'pza', frequent: false },
  { id: 'e9',  name: 'Vinilo reflectivo',        category: 'Vinyl',      unit: 'ft²', frequent: false },
  { id: 'e10', name: 'Vinilo perforado',         category: 'Vinyl',      unit: 'ft²', frequent: false },
  { id: 'e11', name: 'Neón flex LED',            category: 'LED',        unit: 'mts', frequent: false },
  { id: 'e12', name: 'Pintura automotriz',       category: 'Otros',      unit: 'gal', frequent: false },
  { id: 'e13', name: 'Silicón/sellador',         category: 'Otros',      unit: 'tubo', frequent: false },
  { id: 'e14', name: 'Cableado eléctrico',       category: 'LED',        unit: 'mts', frequent: false },
  { id: 'e15', name: 'Transformador',            category: 'LED',        unit: 'pza', frequent: false },
];

const CATEGORIES = ['Vinyl', 'Acrílico', 'Aluminio', 'LED', 'Tornillería', 'Impresión', 'Otros'] as const;

const CHECKLIST_ITEMS = [
  { key: 'design', label: 'Diseño aprobado' },
  { key: 'material', label: 'Material listo' },
  { key: 'cutting', label: 'Corte/CNC' },
  { key: 'assembly', label: 'Ensamble' },
  { key: 'finishing', label: 'Acabado' },
  { key: 'qc', label: 'QC' },
];

// ── Print View Component ──
const PrintView = ({ order, onClose }: { order: any; onClose: () => void }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = () => window.print();

  const handleCopyText = () => {
    const lines = [
      `📋 ORDEN DE SERVICIO`,
      `Cliente: ${order.client}`,
      `Proyecto: ${order.project}`,
      `Fecha: ${new Date().toLocaleDateString('es-ES')}`,
      `Prioridad: ${order.priority}`,
      '',
      '📦 RECURSOS:',
      ...order.materials.map((m: OrderMaterial) => `  • ${m.name} — ${m.quantity} ${m.unit}`),
      '',
      order.width || order.height ? `📐 MEDIDAS: ${order.width || '-'}" × ${order.height || '-'}" × ${order.depth || '-'}"` : '',
      order.notes ? `📝 NOTAS: ${order.notes}` : '',
      '',
      '✅ CHECKLIST:',
      ...order.checklist.map((c: any) => `  ${c.checked ? '☑' : '☐'} ${c.label}`),
    ].filter(Boolean).join('\n');
    navigator.clipboard.writeText(lines);
    sonnerToast.success('Resumen copiado al portapapeles');
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] p-0 bg-background/90 backdrop-blur-2xl border border-white/[0.08] flex flex-col">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold">Orden de Servicio</DialogTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyText} className="gap-1.5 text-xs border-white/[0.1]">
              <Copy className="w-3.5 h-3.5" /> WhatsApp
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div ref={printRef} className="px-8 py-6 space-y-6 print-order">
            <div className="flex justify-between items-start border-b border-white/[0.06] pb-4">
              <div>
                <h2 className="text-xl font-bold">Orden de Servicio</h2>
                <p className="text-sm text-muted-foreground">Fecha: {new Date().toLocaleDateString('es-ES')}</p>
              </div>
              <Badge className={order.priority === 'Urgente' ? 'bg-destructive/20 text-destructive' : 'bg-muted'}>
                {order.priority}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cliente</p>
                <p className="font-semibold">{order.client}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Proyecto</p>
                <p className="font-semibold">{order.project}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Servicio</p>
                <p>{order.serviceType}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fecha objetivo</p>
                <p>{order.targetDate || '—'}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Recursos</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left py-2 text-muted-foreground font-medium">Recurso</th>
                    <th className="text-center py-2 text-muted-foreground font-medium w-20">Cant.</th>
                    <th className="text-center py-2 text-muted-foreground font-medium w-16">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {order.materials.map((m: OrderMaterial) => (
                    <tr key={m.id} className="border-b border-white/[0.04]">
                      <td className="py-2">{m.name}</td>
                      <td className="py-2 text-center font-medium">{m.quantity}</td>
                      <td className="py-2 text-center text-muted-foreground">{m.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(order.width || order.height) && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Medidas</h3>
                <p>{order.width || '—'}" × {order.height || '—'}" × {order.depth || '—'}" (pulgadas)</p>
              </div>
            )}
            {order.notes && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2">Notas</h3>
                <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Checklist</h3>
              <div className="grid grid-cols-3 gap-2">
                {order.checklist.map((c: any) => (
                  <div key={c.key} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${c.checked ? 'bg-primary border-primary' : 'border-white/[0.15]'}`}>
                      {c.checked && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// ══════════════════════════════════════════════
// MAIN MODAL — Workflow-first Wide Canvas
// ══════════════════════════════════════════════
export const NewWorkOrderModal: React.FC<NewWorkOrderModalProps> = ({ isOpen, onClose }) => {
  const { proposals } = useProposals();
  const { addOrder } = useWorkOrders();
  const { toast } = useToast();
  const serviceTypes = useServiceTypes();
  const { items: catalogServices } = useCatalog("lead_service");
  const resolvedServices = catalogServices.length > 0 ? catalogServices.map(s => s.label) : serviceTypes;

  const [selectedClientId, setSelectedClientId] = useState('');
  const [customClient, setCustomClient] = useState('');
  const [projectName, setProjectName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'Urgente'>('Normal');

  const [selectedMaterials, setSelectedMaterials] = useState<OrderMaterial[]>([]);
  const [materialSearch, setMaterialSearch] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [customMaterialName, setCustomMaterialName] = useState('');
  const [showAllMaterials, setShowAllMaterials] = useState(false);

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [depth, setDepth] = useState('');
  const [notes, setNotes] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [checklist, setChecklist] = useState(CHECKLIST_ITEMS.map(c => ({ ...c, checked: false })));

  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
  const [blueprintPreview, setBlueprintPreview] = useState<string | null>(null);
  const [blueprintFullscreen, setBlueprintFullscreen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPrint, setShowPrint] = useState(false);
  const [printOrder, setPrintOrder] = useState<any>(null);

  const sentProposals = proposals.filter(p => p.status === 'Aprobada' || p.status === 'Enviada externamente');
  const frequentMaterials = MATERIALS_DB.filter(m => m.frequent);

  const filteredExtended = useMemo(() => {
    let list = MATERIALS_DB;
    if (materialSearch) {
      const q = materialSearch.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q));
    }
    if (activeCategoryFilter) {
      list = list.filter(m => m.category === activeCategoryFilter);
    }
    return list;
  }, [materialSearch, activeCategoryFilter]);

  const isSelected = useCallback((id: string) => selectedMaterials.some(m => m.id === id), [selectedMaterials]);

  const addMaterial = useCallback((mat: typeof MATERIALS_DB[0]) => {
    if (isSelected(mat.id)) return;
    setSelectedMaterials(prev => [...prev, { ...mat, quantity: 1 }]);
  }, [isSelected]);

  const removeMaterial = useCallback((id: string) => {
    setSelectedMaterials(prev => prev.filter(m => m.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    setSelectedMaterials(prev => prev.map(m => m.id === id ? { ...m, quantity: Math.max(1, qty) } : m));
  }, []);

  const addCustomMaterial = () => {
    if (!customMaterialName.trim()) return;
    const id = `custom-${Date.now()}`;
    setSelectedMaterials(prev => [...prev, { id, name: customMaterialName.trim(), category: 'Otros', unit: 'pza', quantity: 1, isCustom: true }]);
    setCustomMaterialName('');
  };

  const toggleChecklist = (key: string) => {
    setChecklist(prev => prev.map(c => c.key === key ? { ...c, checked: !c.checked } : c));
  };

  const handleBlueprintDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setBlueprintFile(file);
      setBlueprintPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleBlueprintSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBlueprintFile(file);
      setBlueprintPreview(URL.createObjectURL(file));
    }
  }, []);

  const clientName = useMemo(() => {
    if (selectedClientId) {
      const p = sentProposals.find(p => p.id === selectedClientId);
      return p?.client || customClient;
    }
    return customClient;
  }, [selectedClientId, sentProposals, customClient]);

  const buildOrderData = () => ({
    client: clientName,
    project: projectName,
    serviceType,
    priority,
    targetDate,
    width, height, depth, notes, folderPath,
    materials: selectedMaterials,
    checklist,
  });

  const validate = () => {
    if (!clientName) { toast({ title: "Error", description: "Ingrese un cliente.", variant: "destructive" }); return false; }
    if (!projectName) { toast({ title: "Error", description: "Ingrese el nombre del proyecto.", variant: "destructive" }); return false; }
    if (selectedMaterials.length === 0) { toast({ title: "Error", description: "Agregue al menos un recurso.", variant: "destructive" }); return false; }
    return true;
  };

  const createOrder = async (andView: boolean = false) => {
    if (!validate()) return;
    const data = buildOrderData();

    await addOrder({
      client: data.client,
      project: data.project,
      serviceType: data.serviceType || '',
      status: "Pendiente",
      progress: 0,
      materials: data.materials.map(m => ({ item: m.name, quantity: String(m.quantity), status: 'Pendiente' })),
      startDate: new Date().toISOString().split('T')[0],
      estimatedCompletion: data.targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      projectId: null, notes: data.notes || null, priority: data.priority === 'Urgente' ? 'urgente' : 'media',
    });

    sonnerToast.success(`Orden creada para "${data.client}"`);

    if (andView) {
      setPrintOrder(data);
      setShowPrint(true);
    }
    resetForm();
    if (!andView) onClose();
  };

  const resetForm = () => {
    setSelectedClientId(''); setCustomClient(''); setProjectName('');
    setServiceType(''); setTargetDate(''); setPriority('Normal');
    setSelectedMaterials([]); setMaterialSearch(''); setActiveCategoryFilter(null);
    setCustomMaterialName(''); setShowAllMaterials(false);
    setWidth(''); setHeight(''); setDepth(''); setNotes(''); setFolderPath('');
    setChecklist(CHECKLIST_ITEMS.map(c => ({ ...c, checked: false })));
    setBlueprintFile(null); setBlueprintPreview(null);
  };

  if (showPrint && printOrder) {
    return <PrintView order={printOrder} onClose={() => { setShowPrint(false); setPrintOrder(null); onClose(); }} />;
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => { resetForm(); onClose(); }}>
        <DialogContent className="w-[96vw] max-w-6xl max-h-[92vh] p-0 gap-0 bg-zinc-950/95 saturate-150 backdrop-blur-3xl border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* ══ STICKY HEADER ══ */}
          <div className="shrink-0 px-6 py-4 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl z-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-lg font-bold tracking-tight text-zinc-100 truncate">
                    {clientName || 'Nueva Orden de Servicio'}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground truncate">
                    {projectName || 'Configura el contexto del proyecto y las especificaciones técnicas'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selectedMaterials.length > 0 && (
                  <Badge className="bg-primary/15 text-primary border border-primary/20 text-xs">
                    {selectedMaterials.length} recursos
                  </Badge>
                )}
                {priority === 'Urgente' && (
                  <Badge className="bg-destructive/15 text-destructive border border-destructive/20 text-xs gap-1">
                    <Zap className="w-3 h-3" /> Urgente
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* ══ TWO-PANEL BODY ══ */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden min-h-0">

            {/* ── LEFT PANEL: Project Context ── */}
            <div className="overflow-y-auto lg:border-r border-white/[0.06] p-6 space-y-5">
              <div>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                  <ClipboardList className="w-3.5 h-3.5" /> Contexto del Proyecto
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Empresa / Cliente *</Label>
                    {sentProposals.length > 0 ? (
                      <Select value={selectedClientId} onValueChange={(v) => { setSelectedClientId(v); setCustomClient(''); }}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] h-9 text-sm">
                          <SelectValue placeholder="Seleccionar cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {sentProposals.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              <span className="font-medium">{p.client}</span>
                              <span className="text-muted-foreground ml-1 text-xs">— {p.project}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                    <Input
                      value={customClient}
                      onChange={e => { setCustomClient(e.target.value); setSelectedClientId(''); }}
                      placeholder={sentProposals.length > 0 ? "O escribir nombre directo" : "Nombre del cliente"}
                      className="bg-white/[0.03] border-white/[0.08] h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Proyecto *</Label>
                    <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Nombre del proyecto" className="bg-white/[0.03] border-white/[0.08] h-9 text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Tipo de servicio</Label>
                      <Select value={serviceType} onValueChange={setServiceType}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] h-9 text-sm">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {resolvedServices.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <DateField label="Fecha objetivo" value={targetDate} onChange={setTargetDate} minDate={new Date()} compact />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Prioridad:</Label>
                    <button
                      onClick={() => setPriority(p => p === 'Normal' ? 'Urgente' : 'Normal')}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                        priority === 'Urgente'
                          ? 'bg-destructive/15 text-destructive border-destructive/30'
                          : 'bg-white/[0.03] text-muted-foreground border-white/[0.1] hover:bg-white/[0.06]'
                      }`}
                    >
                      {priority === 'Urgente' && <Zap className="w-3 h-3 inline mr-1" />}
                      {priority}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/[0.06]" />

              {/* Notes */}
              <div>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                  <StickyNote className="w-3.5 h-3.5" /> Notas del Proyecto
                </h3>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instrucciones, observaciones..." className="bg-white/[0.03] border-white/[0.08] min-h-[80px] resize-none text-sm" />
              </div>

              <div className="border-t border-white/[0.06]" />

              {/* Checklist */}
              <div>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Checklist rápido</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {checklist.map(item => (
                    <button key={item.key} onClick={() => toggleChecklist(item.key)} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs transition-colors ${item.checked ? 'bg-primary/10 border-primary/25 text-primary' : 'bg-white/[0.02] border-white/[0.08] text-muted-foreground hover:bg-white/[0.05]'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${item.checked ? 'bg-primary border-primary' : 'border-white/[0.15]'}`}>
                        {item.checked && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Folder path */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Carpeta de red</Label>
                <Input value={folderPath} onChange={e => setFolderPath(e.target.value)} placeholder="\\server\Projects\..." className="bg-white/[0.02] border-white/[0.06] h-8 text-xs font-mono" />
              </div>
            </div>

            {/* ── RIGHT PANEL: Technical Specs ── */}
            <div className="overflow-y-auto p-6 space-y-5">

              {/* Blueprint Drop Zone */}
              <div>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                  <Maximize2 className="w-3.5 h-3.5" /> Plano de Fabricación
                </h3>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleBlueprintSelect} />
                {blueprintPreview ? (
                  <div className="relative rounded-xl border border-white/[0.08] overflow-hidden bg-zinc-900/50 group">
                    <img src={blueprintPreview} alt="Plano" className="w-full h-48 object-contain" />
                    <div className="absolute inset-0 bg-zinc-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setBlueprintFullscreen(true)}
                        className="text-xs border-white/[0.15] bg-zinc-950/70 backdrop-blur-sm h-8">
                        <Maximize2 className="w-3 h-3 mr-1.5" /> Pantalla completa
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setBlueprintFile(null); setBlueprintPreview(null); }}
                        className="text-xs border-white/[0.15] bg-zinc-950/70 backdrop-blur-sm h-8 text-destructive">
                        <X className="w-3 h-3 mr-1.5" /> Quitar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleBlueprintDrop}
                    className="rounded-xl border-2 border-dashed border-white/[0.1] h-40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/30 hover:bg-primary/[0.02] transition-colors"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Arrastra o haz clic para subir</p>
                    <p className="text-[10px] text-muted-foreground/60">DXF, PNG, JPG, PDF</p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/[0.06]" />

              {/* Dimensions */}
              <div>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                  <Ruler className="w-3.5 h-3.5" /> Medidas (pulgadas)
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={width} onChange={e => setWidth(e.target.value)} placeholder="Ancho" className="bg-white/[0.03] border-white/[0.08] h-8 text-xs" />
                  <Input value={height} onChange={e => setHeight(e.target.value)} placeholder="Alto" className="bg-white/[0.03] border-white/[0.08] h-8 text-xs" />
                  <Input value={depth} onChange={e => setDepth(e.target.value)} placeholder="Prof." className="bg-white/[0.03] border-white/[0.08] h-8 text-xs" />
                </div>
              </div>

              <div className="border-t border-white/[0.06]" />

              {/* Material Builder */}
              <div>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                  <Factory className="w-3.5 h-3.5" /> Constructor de Materiales
                </h3>

                {/* Quick-add frequent materials as cards */}
                <p className="text-[10px] text-muted-foreground mb-2">⚡ Clic para agregar</p>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {frequentMaterials.map(mat => {
                    const sel = isSelected(mat.id);
                    return (
                      <button
                        key={mat.id}
                        onClick={() => sel ? removeMaterial(mat.id) : addMaterial(mat)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-left text-xs transition-all ${
                          sel ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/[0.02] border-white/[0.08] text-foreground/80 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="truncate pr-1">{mat.name}</span>
                        {sel ? <Check className="w-3.5 h-3.5 shrink-0 text-primary" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
                      </button>
                    );
                  })}
                </div>

                {/* Extended catalog toggle */}
                <button onClick={() => setShowAllMaterials(!showAllMaterials)} className="text-xs text-primary hover:underline flex items-center gap-1 mb-2">
                  {showAllMaterials ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showAllMaterials ? 'Ocultar catálogo' : 'Buscar otros recursos'}
                </button>
                <AnimatePresence>
                  {showAllMaterials && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2 mb-3">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input value={materialSearch} onChange={e => setMaterialSearch(e.target.value)} placeholder="Buscar recurso..." className="pl-8 bg-white/[0.03] border-white/[0.08] h-8 text-xs" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => setActiveCategoryFilter(null)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${!activeCategoryFilter ? 'bg-primary/15 text-primary border-primary/20' : 'bg-white/[0.03] text-muted-foreground border-white/[0.08] hover:bg-white/[0.06]'}`}>Todos</button>
                        {CATEGORIES.map(cat => (
                          <button key={cat} onClick={() => setActiveCategoryFilter(activeCategoryFilter === cat ? null : cat)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${activeCategoryFilter === cat ? 'bg-primary/15 text-primary border-primary/20' : 'bg-white/[0.03] text-muted-foreground border-white/[0.08] hover:bg-white/[0.06]'}`}>{cat}</button>
                        ))}
                      </div>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {filteredExtended.map(mat => {
                          const sel = isSelected(mat.id);
                          return (
                            <div key={mat.id} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${sel ? 'bg-primary/5' : 'hover:bg-white/[0.03]'}`}>
                              <div className="flex items-center gap-2">
                                <Checkbox checked={sel} onCheckedChange={() => sel ? removeMaterial(mat.id) : addMaterial(mat)} className="w-3.5 h-3.5" />
                                <span>{mat.name}</span>
                                <span className="text-muted-foreground">({mat.unit})</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Custom material quick-add */}
                <div className="flex gap-2 mb-3">
                  <Input value={customMaterialName} onChange={e => setCustomMaterialName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomMaterial()} placeholder="Material personalizado..." className="bg-white/[0.02] border-white/[0.06] h-8 text-xs flex-1" />
                  <Button size="sm" variant="outline" onClick={addCustomMaterial} className="h-8 px-3 text-xs border-white/[0.1]" disabled={!customMaterialName.trim()}>
                    <Plus className="w-3 h-3 mr-1" /> Agregar
                  </Button>
                </div>

                {/* Selected materials as block cards */}
                {selectedMaterials.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Seleccionados ({selectedMaterials.length})</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {selectedMaterials.map(mat => (
                        <motion.div
                          key={mat.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.02]"
                        >
                          <button onClick={() => removeMaterial(mat.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs flex-1 truncate font-medium">{mat.name}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => updateQuantity(mat.id, mat.quantity - 1)} className="w-6 h-6 rounded bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08]">
                              <Minus className="w-3 h-3" />
                            </button>
                            <Input type="number" min={1} value={mat.quantity} onChange={e => updateQuantity(mat.id, parseInt(e.target.value) || 1)} className="w-12 h-6 text-center text-xs bg-white/[0.03] border-white/[0.08] p-0" />
                            <button onClick={() => updateQuantity(mat.id, mat.quantity + 1)} className="w-6 h-6 rounded bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.08]">
                              <Plus className="w-3 h-3" />
                            </button>
                            <span className="text-[10px] text-muted-foreground w-6">{mat.unit}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══ STICKY FOOTER ══ */}
          <div className="shrink-0 px-6 py-3 border-t border-white/[0.06] bg-zinc-950/90 backdrop-blur-xl flex flex-col-reverse sm:flex-row sm:items-center gap-2 z-10">
            <Button variant="ghost" size="sm" onClick={() => { resetForm(); onClose(); }} className="text-xs sm:mr-auto text-muted-foreground hover:text-foreground">
              Cancelar
            </Button>
            <Button variant="outline" size="sm" onClick={() => createOrder(true)} className="text-xs gap-1.5 border-white/[0.1] text-muted-foreground hover:text-foreground">
              <Printer className="w-3.5 h-3.5" /> Crear y Ver
            </Button>
            <Button size="sm" onClick={() => createOrder(false)} className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="w-3.5 h-3.5" /> Enviar a Producción
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blueprint Fullscreen Preview */}
      <Dialog open={blueprintFullscreen} onOpenChange={setBlueprintFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-2 bg-zinc-950/98 backdrop-blur-2xl border-white/[0.08]">
          {blueprintPreview && (
            <img src={blueprintPreview} alt="Plano de fabricación" className="w-full h-full object-contain rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
