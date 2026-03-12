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
import {
  Plus, Package, Search, Zap, X, Minus, Printer, Copy, Share2,
  ChevronDown, ChevronUp, Check,
} from "lucide-react";
import { useProposals } from "@/contexts/ProposalsContext";
import { useWorkOrders, WorkOrder } from "@/contexts/WorkOrdersContext";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { useServiceTypes } from "@/hooks/useServiceTypes";
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

// ── Materials database (will become tenant-configurable in Phase 3) ──
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
      <DialogContent className="w-[95vw] max-w-[800px] max-h-[90vh] p-0 bg-background/90 backdrop-blur-2xl border border-border/30 flex flex-col">
        <div className="px-6 py-4 border-b border-border/20 flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold">Orden de Servicio</DialogTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyText} className="gap-1.5 text-xs">
              <Copy className="w-3.5 h-3.5" /> WhatsApp
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div ref={printRef} className="px-8 py-6 space-y-6 print-order">
            <div className="flex justify-between items-start border-b border-border/20 pb-4">
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
                  <tr className="border-b border-border/30">
                    <th className="text-left py-2 text-muted-foreground font-medium">Recurso</th>
                    <th className="text-center py-2 text-muted-foreground font-medium w-20">Cant.</th>
                    <th className="text-center py-2 text-muted-foreground font-medium w-16">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {order.materials.map((m: OrderMaterial) => (
                    <tr key={m.id} className="border-b border-border/10">
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
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${c.checked ? 'bg-primary border-primary' : 'border-border/40'}`}>
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
// MAIN MODAL
// ══════════════════════════════════════════════
export const NewWorkOrderModal: React.FC<NewWorkOrderModalProps> = ({ isOpen, onClose }) => {
  const { proposals } = useProposals();
  const { addOrder } = useWorkOrders();
  const { toast } = useToast();
  const serviceTypes = useServiceTypes();

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

  const buildOrderData = () => {
    let clientName = customClient;
    if (selectedClientId) {
      const p = sentProposals.find(p => p.id === selectedClientId);
      clientName = p?.client || customClient;
    }
    return {
      client: clientName,
      project: projectName,
      serviceType,
      priority,
      targetDate,
      width, height, depth, notes, folderPath,
      materials: selectedMaterials,
      checklist,
    };
  };

  const validate = () => {
    if (!buildOrderData().client) { toast({ title: "Error", description: "Ingrese un cliente.", variant: "destructive" }); return false; }
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
      projectId: null,
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
  };

  if (showPrint && printOrder) {
    return <PrintView order={printOrder} onClose={() => { setShowPrint(false); setPrintOrder(null); onClose(); }} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => { resetForm(); onClose(); }}>
      <DialogContent className="w-[95vw] max-w-[760px] max-h-[85vh] p-0 gap-0 bg-background/85 backdrop-blur-2xl border border-border/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="shrink-0 px-6 py-4 border-b border-border/20 bg-background/60 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Nueva Orden de Servicio</DialogTitle>
              <p className="text-xs text-muted-foreground">Modo rápido</p>
            </div>
          </div>
          {selectedMaterials.length > 0 && (
            <Badge className="bg-primary/15 text-primary border border-primary/20 text-xs">
              {selectedMaterials.length} recursos
            </Badge>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-5 space-y-6">

            <section className="space-y-3">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Datos esenciales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Cliente *</Label>
                  {sentProposals.length > 0 ? (
                    <Select value={selectedClientId} onValueChange={(v) => { setSelectedClientId(v); setCustomClient(''); }}>
                      <SelectTrigger className="bg-muted/30 border-border/20 h-9 text-sm">
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
                  ) : (
                    <Input value={customClient} onChange={e => setCustomClient(e.target.value)} placeholder="Nombre del cliente" className="bg-muted/30 border-border/20 h-9 text-sm" />
                  )}
                  {sentProposals.length > 0 && (
                    <Input value={customClient} onChange={e => { setCustomClient(e.target.value); setSelectedClientId(''); }} placeholder="O escribir nombre directo" className="bg-muted/20 border-border/10 h-8 text-xs" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Proyecto *</Label>
                  <Input value={projectName} onChange={e => setProjectName(e.target.value)} placeholder="Nombre del proyecto" className="bg-muted/30 border-border/20 h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo de servicio</Label>
                  <Select value={serviceType} onValueChange={setServiceType}>
                    <SelectTrigger className="bg-muted/30 border-border/20 h-9 text-sm">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <DateField label="Fecha objetivo" value={targetDate} onChange={setTargetDate} minDate={new Date()} compact />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs">Prioridad:</Label>
                <button
                  onClick={() => setPriority(p => p === 'Normal' ? 'Urgente' : 'Normal')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    priority === 'Urgente'
                      ? 'bg-destructive/15 text-destructive border-destructive/30'
                      : 'bg-muted/30 text-muted-foreground border-border/20 hover:bg-muted/50'
                  }`}
                >
                  {priority === 'Urgente' && <Zap className="w-3 h-3 inline mr-1" />}
                  {priority}
                </button>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Recursos</h3>
              <div>
                <p className="text-xs text-muted-foreground mb-2">⚡ Recursos frecuentes — clic para agregar</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {frequentMaterials.map(mat => {
                    const sel = isSelected(mat.id);
                    return (
                      <button
                        key={mat.id}
                        onClick={() => sel ? removeMaterial(mat.id) : addMaterial(mat)}
                        className={`flex items-center justify-between px-2.5 py-2 rounded-lg border text-left text-xs transition-all ${
                          sel ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/20 border-border/15 text-foreground/80 hover:bg-muted/40'
                        }`}
                      >
                        <span className="truncate pr-1">{mat.name}</span>
                        {sel ? <Check className="w-3.5 h-3.5 shrink-0 text-primary" /> : <Plus className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <button onClick={() => setShowAllMaterials(!showAllMaterials)} className="text-xs text-primary hover:underline flex items-center gap-1">
                  {showAllMaterials ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showAllMaterials ? 'Ocultar catálogo completo' : 'Buscar otros recursos'}
                </button>
                <AnimatePresence>
                  {showAllMaterials && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden space-y-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input value={materialSearch} onChange={e => setMaterialSearch(e.target.value)} placeholder="Buscar recurso..." className="pl-8 bg-muted/30 border-border/20 h-8 text-xs" />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => setActiveCategoryFilter(null)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${!activeCategoryFilter ? 'bg-primary/15 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/15 hover:bg-muted/40'}`}>Todos</button>
                        {CATEGORIES.map(cat => (
                          <button key={cat} onClick={() => setActiveCategoryFilter(activeCategoryFilter === cat ? null : cat)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${activeCategoryFilter === cat ? 'bg-primary/15 text-primary border-primary/20' : 'bg-muted/20 text-muted-foreground border-border/15 hover:bg-muted/40'}`}>{cat}</button>
                        ))}
                      </div>
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                        {filteredExtended.map(mat => {
                          const sel = isSelected(mat.id);
                          return (
                            <div key={mat.id} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${sel ? 'bg-primary/5' : 'hover:bg-muted/20'}`}>
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
              </div>
              <div className="flex gap-2">
                <Input value={customMaterialName} onChange={e => setCustomMaterialName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomMaterial()} placeholder="Recurso personalizado..." className="bg-muted/20 border-border/15 h-8 text-xs flex-1" />
                <Button size="sm" variant="outline" onClick={addCustomMaterial} className="h-8 px-3 text-xs" disabled={!customMaterialName.trim()}>
                  <Plus className="w-3 h-3 mr-1" /> Agregar
                </Button>
              </div>
              {selectedMaterials.length > 0 && (
                <div className="space-y-1.5 p-3 rounded-xl bg-muted/10 border border-border/15">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Seleccionados ({selectedMaterials.length})</p>
                  {selectedMaterials.map(mat => (
                    <motion.div key={mat.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="flex items-center gap-2 py-1">
                      <button onClick={() => removeMaterial(mat.id)} className="text-muted-foreground hover:text-destructive transition-colors"><X className="w-3.5 h-3.5" /></button>
                      <span className="text-xs flex-1 truncate">{mat.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQuantity(mat.id, mat.quantity - 1)} className="w-6 h-6 rounded bg-muted/30 flex items-center justify-center hover:bg-muted/50"><Minus className="w-3 h-3" /></button>
                        <Input type="number" min={1} value={mat.quantity} onChange={e => updateQuantity(mat.id, parseInt(e.target.value) || 1)} className="w-14 h-6 text-center text-xs bg-muted/20 border-border/15 p-0" />
                        <button onClick={() => updateQuantity(mat.id, mat.quantity + 1)} className="w-6 h-6 rounded bg-muted/30 flex items-center justify-center hover:bg-muted/50"><Plus className="w-3 h-3" /></button>
                        <span className="text-[10px] text-muted-foreground w-6">{mat.unit}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Detalles técnicos</h3>
              <div>
                <Label className="text-xs mb-1.5 block">Medidas (pulgadas)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={width} onChange={e => setWidth(e.target.value)} placeholder="Ancho" className="bg-muted/30 border-border/20 h-8 text-xs" />
                  <Input value={height} onChange={e => setHeight(e.target.value)} placeholder="Alto" className="bg-muted/30 border-border/20 h-8 text-xs" />
                  <Input value={depth} onChange={e => setDepth(e.target.value)} placeholder="Prof." className="bg-muted/30 border-border/20 h-8 text-xs" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notas</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Instrucciones, observaciones..." className="bg-muted/30 border-border/20 min-h-[60px] resize-none text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Carpeta de red</Label>
                <Input value={folderPath} onChange={e => setFolderPath(e.target.value)} placeholder="\\server\Projects\..." className="bg-muted/20 border-border/15 h-8 text-xs font-mono" />
              </div>
              <div>
                <Label className="text-xs mb-2 block">Checklist rápido</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {checklist.map(item => (
                    <button key={item.key} onClick={() => toggleChecklist(item.key)} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs transition-colors ${item.checked ? 'bg-primary/10 border-primary/25 text-primary' : 'bg-muted/15 border-border/15 text-foreground/70 hover:bg-muted/30'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${item.checked ? 'bg-primary border-primary' : 'border-border/40'}`}>
                        {item.checked && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="shrink-0 px-6 py-3 border-t border-border/20 bg-background/60 backdrop-blur-xl flex flex-col-reverse sm:flex-row sm:items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => { resetForm(); onClose(); }} className="text-xs sm:mr-auto">Cancelar</Button>
          <Button variant="outline" size="sm" onClick={() => createOrder(true)} className="text-xs gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Crear y Ver
          </Button>
          <Button size="sm" onClick={() => createOrder(false)} className="text-xs gap-1.5 bg-primary">
            <Plus className="w-3.5 h-3.5" /> Crear Orden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
