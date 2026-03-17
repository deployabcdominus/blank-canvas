import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Activity, Search, X, CalendarIcon, Filter, Eye,
  Plus, Pencil, Trash2, ArrowRightLeft, CheckCircle2, UserPlus, Send,
} from "lucide-react";

interface AuditEntry {
  id: string;
  company_id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  details: Record<string, any>;
  created_at: string;
}

const ACTION_META: Record<string, { icon: typeof Plus; color: string; label: string }> = {
  creado: { icon: Plus, color: 'text-emerald-400', label: 'Creado' },
  editado: { icon: Pencil, color: 'text-primary', label: 'Editado' },
  eliminado: { icon: Trash2, color: 'text-red-400', label: 'Eliminado' },
  cambio_estado: { icon: ArrowRightLeft, color: 'text-sky-400', label: 'Cambio de estado' },
  aprobado: { icon: CheckCircle2, color: 'text-emerald-400', label: 'Aprobado' },
  asignado: { icon: UserPlus, color: 'text-amber-400', label: 'Asignado' },
  enviado: { icon: Send, color: 'text-sky-400', label: 'Enviado' },
};

const ENTITY_LABELS: Record<string, string> = {
  lead: 'Lead',
  cliente: 'Cliente',
  propuesta: 'Propuesta',
  pago: 'Pago',
  proyecto: 'Proyecto',
  orden_produccion: 'Orden de Producción',
  ejecucion: 'Ejecución',
  equipo: 'Equipo',
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function AuditLog() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    let query = (supabase as any)
      .from('audit_logs')
      .select('id, entity_type, action, entity_label, user_name, details, created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (dateFrom) query = query.gte('created_at', dateFrom.toISOString());
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }

    const { data, error } = await query;
    if (error) {
      if (import.meta.env.DEV) console.error('Audit logs error:', error);
    }
    setEntries((data || []) as AuditEntry[]);
    setLoading(false);
  }, [user, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = useMemo(() => {
    let result = entries;
    if (actionFilter !== 'all') result = result.filter(e => e.action === actionFilter);
    if (entityFilter !== 'all') result = result.filter(e => e.entity_type === entityFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(e =>
        e.user_name.toLowerCase().includes(s) ||
        (e.entity_label || '').toLowerCase().includes(s)
      );
    }
    return result;
  }, [entries, actionFilter, entityFilter, search]);

  const clearFilters = () => {
    setSearch('');
    setActionFilter('all');
    setEntityFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasFilters = search || actionFilter !== 'all' || entityFilter !== 'all' || dateFrom || dateTo;

  const buildDescription = (e: AuditEntry) => {
    const entity = ENTITY_LABELS[e.entity_type] || e.entity_type;
    const label = e.entity_label ? ` "${e.entity_label}"` : '';
    const actionLabel = ACTION_META[e.action]?.label || e.action;
    return `${actionLabel} ${entity.toLowerCase()}${label}`;
  };

  return (
    <ResponsiveLayout title="Auditoría" subtitle="Registro de actividad del equipo" icon={Activity}>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por usuario o entidad..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-10" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las acciones</SelectItem>
            {Object.entries(ACTION_META).map(([key, meta]) => (
              <SelectItem key={key} value={key}>{meta.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Entidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las entidades</SelectItem>
            {Object.entries(ENTITY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[140px] justify-start text-left text-sm", !dateFrom && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "dd/MM/yy") : "Desde"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-[140px] justify-start text-left text-sm", !dateTo && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "dd/MM/yy") : "Hasta"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4 mr-1" /> Limpiar
          </Button>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
        <span>{filtered.length} evento{filtered.length !== 1 ? 's' : ''}</span>
        {hasFilters && <Badge variant="outline" className="text-xs border-primary/30 text-primary">Filtrado</Badge>}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-start">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Activity className="w-12 h-12 text-primary/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin actividad registrada</h3>
          <p className="text-sm text-muted-foreground">Los eventos aparecerán aquí cuando el equipo realice acciones.</p>
        </div>
      ) : (
        <ScrollArea className="scroll-fade-y" style={{ maxHeight: 'calc(100vh - 320px)' }}>
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.06]" />

            <AnimatePresence>
              {filtered.map((entry, i) => {
                const meta = ACTION_META[entry.action] || { icon: Activity, color: 'text-zinc-400', label: entry.action };
                const ActionIcon = meta.icon;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3), duration: 0.3 }}
                    className="relative flex items-start gap-4 pb-6 group cursor-pointer"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[-17px] top-3 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background z-10" />

                    {/* Avatar */}
                    <Avatar className="w-10 h-10 ring-2 ring-white/[0.06] shrink-0">
                      <AvatarFallback className="bg-zinc-800 text-zinc-300 text-xs font-semibold">
                        {getInitials(entry.user_name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0 glass-card rounded-xl p-4 border border-white/[0.06] group-hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <p className="text-sm">
                            <span className="font-semibold text-foreground">{entry.user_name}</span>
                            <span className="text-muted-foreground"> {buildDescription(entry).toLowerCase()}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border-white/[0.06]", meta.color)}>
                            <ActionIcon className="w-3 h-3 mr-1" />
                            {meta.label}
                          </Badge>
                          <Eye className="w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true, locale: es })}
                        {' · '}
                        {format(new Date(entry.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedEntry} onOpenChange={open => { if (!open) setSelectedEntry(null); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Detalle del evento
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-white/[0.06]">
                  <AvatarFallback className="bg-zinc-800 text-zinc-300 font-semibold">
                    {getInitials(selectedEntry.user_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{selectedEntry.user_name}</p>
                  <p className="text-xs text-zinc-500">
                    {format(new Date(selectedEntry.created_at), "dd MMMM yyyy, HH:mm:ss", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Acción</p>
                  <p className="text-sm font-medium">{ACTION_META[selectedEntry.action]?.label || selectedEntry.action}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Entidad</p>
                  <p className="text-sm font-medium">{ENTITY_LABELS[selectedEntry.entity_type] || selectedEntry.entity_type}</p>
                </div>
              </div>

              {selectedEntry.entity_label && (
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Registro</p>
                  <p className="text-sm font-medium">{selectedEntry.entity_label}</p>
                </div>
              )}

              {selectedEntry.details && Object.keys(selectedEntry.details).length > 0 && (
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/[0.06]">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">Cambios</p>
                  <div className="space-y-2">
                    {Object.entries(selectedEntry.details).map(([key, value]) => {
                      if (key === 'before' || key === 'after') return null;
                      return (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-zinc-400">{key}</span>
                          <span className="text-foreground font-medium">{String(value)}</span>
                        </div>
                      );
                    })}
                    {selectedEntry.details.before && selectedEntry.details.after && (
                      <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-white/[0.04]">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-red-400/70 mb-1">Antes</p>
                          <pre className="text-[11px] text-zinc-400 whitespace-pre-wrap break-all">
                            {typeof selectedEntry.details.before === 'string'
                              ? selectedEntry.details.before
                              : JSON.stringify(selectedEntry.details.before, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-emerald-400/70 mb-1">Después</p>
                          <pre className="text-[11px] text-zinc-400 whitespace-pre-wrap break-all">
                            {typeof selectedEntry.details.after === 'string'
                              ? selectedEntry.details.after
                              : JSON.stringify(selectedEntry.details.after, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ResponsiveLayout>
  );
}
