import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/contexts/WorkOrdersContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal, Eye, Printer, QrCode, Calendar, User, Wrench,
  CheckCircle, ShieldCheck, Trash2,
} from "lucide-react";
import { format } from "date-fns";

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  "Pendiente":          { bg: "bg-zinc-500/20", text: "text-zinc-400", label: "Pending" },
  "En Progreso":        { bg: "bg-blue-500/20", text: "text-blue-400", label: "In Production" },
  "Control de Calidad": { bg: "bg-amber-500/20", text: "text-amber-400", label: "QC" },
  "Completada":         { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "Ready" },
  "installed":          { bg: "bg-violet-500/20", text: "text-white", label: "Installed" },
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

function formatDelivery(date: string | null | undefined): string | null {
  if (!date) return null;
  try {
    return format(new Date(date), "MMM dd, yyyy");
  } catch {
    return date;
  }
}

export function WorkOrderCard({
  order, index, assigneeName, onOpen, onGeneratePOI, onPrintSheet, onDelete, canDelete = false,
}: Props) {
  const statusKey = order.poi_token_used ? "installed" : order.status;
  const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG["Pendiente"];
  const woLabel = order.wo_number || `WO-${order.id.slice(0, 8).toUpperCase()}`;
  const deliveryDate = order.estimatedDelivery || order.estimatedCompletion;
  const formattedDelivery = formatDelivery(deliveryDate);
  const progress = order.progress ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      onClick={() => onOpen?.(order)}
      className="rounded-xl cursor-pointer transition-all duration-200 group flex flex-col"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: 12,
        padding: 20,
        gap: 12,
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
      {/* Row 1: Header — Client + Status */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-white truncate min-w-0 flex-1">{order.client}</h3>
        <Badge className={`${status.bg} ${status.text} border-0 text-[10px] shrink-0 font-semibold`}>
          {status.label}
        </Badge>
      </div>

      {/* Row 2: Subtitle — Type + WO# */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-zinc-400 truncate min-w-0 flex-1">
          {order.product_type || order.project_name || order.project || "—"}
        </p>
        <span className="text-xs text-zinc-500 font-mono shrink-0">{woLabel}</span>
      </div>

      {/* Row 3: Progress bar */}
      <div className="flex items-center gap-3">
        <div
          className="flex-1 overflow-hidden"
          style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progress}%`, background: "#8b5cf6", borderRadius: 3 }}
          />
        </div>
        <span className="text-xs font-medium shrink-0" style={{ color: "#a78bfa" }}>
          {progress}%
        </span>
      </div>

      {/* Row 4: Info row */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        <span className="flex items-center gap-1.5" style={{ color: formattedDelivery ? "#9ca3af" : "#4b5563" }}>
          <Calendar className="w-3.5 h-3.5" />
          {formattedDelivery || "No date"}
        </span>
        <span className="flex items-center gap-1.5" style={{ color: assigneeName ? "#9ca3af" : "#4b5563" }}>
          <User className="w-3.5 h-3.5" />
          {assigneeName || "Unassigned"}
        </span>
        {order.product_type && (
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Wrench className="w-3.5 h-3.5" />
            {order.product_type}
          </span>
        )}
      </div>

      {/* Row 5: Special badges + Menu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          {order.qc_signature_url && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={{ background: "rgba(88,28,135,0.4)", color: "#c4b5fd" }}
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              QC Signed
            </span>
          )}
          {order.poi_token_used && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
              style={{ background: "rgba(6,78,59,0.5)", color: "#6ee7b7" }}
            >
              <CheckCircle className="w-2.5 h-2.5" />
              Installed
            </span>
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
