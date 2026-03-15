import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ScrollText, Trash2, Plus, RefreshCw, Shield, UserCog, Building2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AuditEntry {
  id: string;
  actor_id: string;
  action_type: string;
  target_name: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  USER_DELETED:       { label: "Usuario eliminado",  color: "bg-red-500/20 text-red-400 border-red-500/30",        icon: Trash2 },
  USER_CREATED:       { label: "Usuario creado",     color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: Plus },
  USER_TOGGLED:       { label: "Estado cambiado",    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",  icon: UserCog },
  ROLE_CHANGED:       { label: "Rol cambiado",       color: "bg-blue-500/20 text-blue-400 border-blue-500/30",     icon: Shield },
  PASSWORD_RESET:     { label: "Contraseña reseteada", color: "bg-violet-500/20 text-violet-400 border-violet-500/30", icon: RefreshCw },
  COMPANY_CREATED:    { label: "Empresa creada",     color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: Building2 },
  COMPANY_DELETED:    { label: "Empresa eliminada",  color: "bg-red-500/20 text-red-400 border-red-500/30",        icon: Trash2 },
  COMPANY_UPDATED:    { label: "Empresa editada",    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",  icon: Building2 },
  BULK_ACTION:        { label: "Acción masiva",      color: "bg-primary/20 text-primary border-primary/30",        icon: UserCog },
};

const getActionCfg = (action: string) =>
  ACTION_CONFIG[action] || { label: action, color: "bg-muted text-muted-foreground border-border", icon: ScrollText };

export function SuperadminAuditLogs() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("platform_audit_logs" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error && data) setLogs(data as unknown as AuditEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (l.target_name || "").toLowerCase().includes(q) ||
      (l.action_type || "").toLowerCase().includes(q) ||
      JSON.stringify(l.details || {}).toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="glass pl-10 w-80"
          />
        </div>
        <p className="text-xs text-muted-foreground">{filtered.length} registros</p>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="w-[180px]">Fecha / Hora</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Objetivo</TableHead>
              <TableHead>Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(log => {
              const cfg = getActionCfg(log.action_type);
              const Icon = cfg.icon;
              return (
                <TableRow key={log.id} className="border-border/10 hover:bg-muted/20">
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] gap-1 ${cfg.color}`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{log.target_name || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {loading && (
          <div className="p-8 text-center">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Cargando logs…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-12 text-center">
            <ScrollText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">Sin registros de auditoría</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Las acciones de la plataforma aparecerán aquí.</p>
          </div>
        )}
      </div>
    </div>
  );
}
