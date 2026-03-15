import { Client } from "@/contexts/ClientsContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientAvatar } from "./ClientAvatar";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_COLORS: Record<string, string> = {
  Lead: 'bg-soft-blue/20 text-soft-blue border-soft-blue/30',
  Proposal: 'bg-lavender/20 text-lavender border-lavender/30',
  Production: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Installation: 'bg-pale-pink/20 text-pale-pink border-pale-pink/30',
  Completed: 'bg-mint/20 text-mint border-mint/30',
};

interface ClientTableViewProps {
  clients: Client[];
  clientStats: Record<string, { total: number; byStatus: Record<string, number>; latestDate: string | null }>;
  isAdmin: boolean;
  onEdit?: (c: Client) => void;
  onDelete?: (id: string) => void;
}

export function ClientTableView({ clients, clientStats, isAdmin, onEdit, onDelete }: ClientTableViewProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="glass-card rounded-2xl overflow-hidden border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs font-medium text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Contacto</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-center">Proyectos</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Estado</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Última Actividad</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => {
              const stats = clientStats[c.id];
              const projectCount = stats?.total || 0;
              const statusEntries = stats ? Object.entries(stats.byStatus) : [];
              const latestDate = stats?.latestDate;

              return (
                <TableRow
                  key={c.id}
                  className="group border-border/30 hover:bg-accent/30 transition-colors cursor-pointer"
                  onClick={() => onEdit?.(c)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ClientAvatar name={c.clientName} logoUrl={c.logoUrl} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{c.clientName}</p>
                        {c.notes && <p className="text-[11px] text-muted-foreground/60 truncate max-w-[180px]">{c.notes}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-xs text-muted-foreground">
                      {c.primaryEmail && <p className="truncate max-w-[180px]">{c.primaryEmail}</p>}
                      {c.primaryPhone && <p>{c.primaryPhone}</p>}
                      {!c.primaryEmail && !c.primaryPhone && <p className="italic">—</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs font-semibold px-2 py-0">{projectCount}</Badge>
                  </TableCell>
                  <TableCell>
                    {statusEntries.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {statusEntries.slice(0, 3).map(([status, count]) => (
                          <Badge key={status} variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[status] || ''}`}>
                            {count} {status}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/50 italic">Sin actividad</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {latestDate
                        ? formatDistanceToNow(new Date(latestDate), { addSuffix: true, locale: es })
                        : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(c); }}>
                          <Pencil className="w-3.5 h-3.5 mr-2" /> Editar
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}>
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
