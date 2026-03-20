import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/contexts/WorkOrdersContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal, Eye, Printer, QrCode, Calendar, User, Hash,
  CheckCircle, ShieldCheck, Trash2,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  "Pendiente":          { bg: "bg-zinc-500/15", text: "text-zinc-400", label: "Pending" },
  "En Progreso":        { bg: "bg-blue-500/15", text: "text-blue-400", label: "In Production" },
  "Control de Calidad": { bg: "bg-amber-500/15", text: "text-amber-400", label: "QC" },
  "Completada":         { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Ready" },
  "installed":          { bg: "bg-violet-500/15", text: "text-violet-400", label: "Installed" },
};

interface Props {
  order: WorkOrder;
  index: number;
  assigneeName?: string;
  onOpen?: (order: WorkOrder) => void;
  onGeneratePOI?: (order: WorkOrder) => void;
  onPrintSheet?: (order: WorkOrder) => void;
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export function WorkOrderCard({
  order, index, assigneeName, onOpen, onGeneratePOI, onPrintSheet, onDelete, canDelete = false,
}: Props) {
  const statusKey = order.poi_token_used ? "installed" : order.status;
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG["Pendiente"];
  const woLabel = order.wo_number || order.id.slice(0, 8).toUpperCase();
  const deliveryDate = order.estimatedDelivery || order.estimatedCompletion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      onClick={() => onOpen?.(order)}
      className="rounded-xl p-5 cursor-pointer transition-all duration-200 group"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(139,92,246,0.2)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)";
        e.currentTarget.style.background = "rgba(139,92,246,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(139,92,246,0.2)";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground truncate">{order.client}</h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {order.product_type || order.project_name || order.project || "—"}
          </p>
        </div>
        <Badge className={`${status.bg} ${status.text} border-0 text-[10px] shrink-0`}>
          {status.label}
        </Badge>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${order.progress}%`, background: "#8b5cf6" }}
          />
        </div>
        <span className="text-xs font-medium text-muted-foreground w-8 text-right">{order.progress}%</span>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3 flex-wrap">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {deliveryDate || <span className="italic">No date set</span>}
        </span>
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {assigneeName || <span className="italic">Unassigned</span>}
        </span>
        <span className="flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {woLabel}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {order.poi_token_used && (
            <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[9px] gap-1">
              <CheckCircle className="w-2.5 h-2.5" />
              Installation Documented
            </Badge>
          )}
          {order.qc_signature_url && (
            <Badge className="bg-violet-500/15 text-violet-400 border-0 text-[9px] gap-1">
              <ShieldCheck className="w-2.5 h-2.5" />
              QC Signed
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen?.(order); }}>
              <Eye className="w-3.5 h-3.5 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onGeneratePOI?.(order); }}>
              <QrCode className="w-3.5 h-3.5 mr-2" /> Generate POI Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPrintSheet?.(order); }}>
              <Printer className="w-3.5 h-3.5 mr-2" /> Print Production Sheet
            </DropdownMenuItem>
            {canDelete && onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(order.id); }} className="text-destructive focus:text-destructive">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
