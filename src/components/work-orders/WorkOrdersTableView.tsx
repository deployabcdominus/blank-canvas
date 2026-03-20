import { WorkOrder } from "@/contexts/WorkOrdersContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, QrCode, Printer, CheckCircle, Pencil, Trash2, ShieldCheck } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  "Pendiente":          { bg: "bg-zinc-500/15", text: "text-zinc-400", label: "Pending" },
  "En Progreso":        { bg: "bg-blue-500/15", text: "text-blue-400", label: "In Production" },
  "Control de Calidad": { bg: "bg-amber-500/15", text: "text-amber-400", label: "QC" },
  "Completada":         { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Ready" },
  "installed":          { bg: "bg-violet-500/15", text: "text-violet-400", label: "Installed" },
};

interface Props {
  orders: WorkOrder[];
  profileMap?: Record<string, string>;
  onOpen?: (order: WorkOrder) => void;
  onEdit?: (order: WorkOrder) => void;
  onMarkBuilt?: (id: string) => void;
  onDelete?: (id: string) => void;
  onGeneratePOI?: (order: WorkOrder) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function WorkOrdersTableView({ orders, profileMap = {}, onOpen, onEdit, onMarkBuilt, onDelete, onGeneratePOI, canEdit = true, canDelete = false }: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs font-medium text-muted-foreground">WO#</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Client</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Type</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-center">Progress</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Assigned</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Delivery</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(order => {
              const statusKey = order.poi_token_used ? "installed" : order.status;
              const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG["Pendiente"];
              const woLabel = order.wo_number || order.id.slice(0, 8).toUpperCase();
              const assignee = order.assignedToUserId ? profileMap[order.assignedToUserId] || "—" : "—";
              const delivery = order.estimatedDelivery || order.estimatedCompletion || "—";

              return (
                <TableRow key={order.id} className="group border-border/30 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => onOpen?.(order)}>
                  <TableCell className="text-xs font-mono text-muted-foreground">{woLabel}</TableCell>
                  <TableCell className="text-sm font-medium">{order.client}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{order.product_type || order.project || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge className={`${status.bg} ${status.text} border-0 text-[10px]`}>{status.label}</Badge>
                      {order.qc_signature_url && <ShieldCheck className="w-3 h-3 text-violet-400" />}
                      {order.poi_token_used && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center gap-1.5 justify-center">
                      <div className="w-16 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${order.progress}%`, background: "#8b5cf6" }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{order.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{assignee}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{delivery}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); onOpen?.(order); }}>
                          <Eye className="w-3.5 h-3.5 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); onGeneratePOI?.(order); }}>
                          <QrCode className="w-3.5 h-3.5 mr-2" /> Generate POI Link
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); onEdit?.(order); }}>
                            <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                          </DropdownMenuItem>
                        )}
                        {order.status === "Control de Calidad" && onMarkBuilt && (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); onMarkBuilt(order.id); }}>
                            <CheckCircle className="w-3.5 h-3.5 mr-2" /> Mark Complete
                          </DropdownMenuItem>
                        )}
                        {canDelete && onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); onDelete(order.id); }} className="text-destructive focus:text-destructive">
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </>
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
