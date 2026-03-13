import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/contexts/WorkOrdersContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Package, Wrench, AlertTriangle, CheckCircle, Clock,
  MoreHorizontal, Eye, Printer, Share2, Calendar, Pencil,
} from "lucide-react";

const STATUS_MAP: Record<string, { color: string; icon: React.ReactNode }> = {
  "Pendiente": { color: "bg-lavender text-lavender-foreground", icon: <Package className="w-3 h-3" /> },
  "En Progreso": { color: "bg-soft-blue text-soft-blue-foreground", icon: <Wrench className="w-3 h-3" /> },
  "Control de Calidad": { color: "bg-pale-pink text-pale-pink-foreground", icon: <AlertTriangle className="w-3 h-3" /> },
  "Completada": { color: "bg-mint text-mint-foreground", icon: <CheckCircle className="w-3 h-3" /> },
};

interface Props {
  order: WorkOrder;
  index: number;
  onOpen?: (order: WorkOrder) => void;
  onMarkBuilt?: (id: string) => void;
}

export function WorkOrderCompactCard({ order, index, onOpen, onMarkBuilt }: Props) {
  const status = STATUS_MAP[order.status] || { color: "bg-muted text-muted-foreground", icon: <Clock className="w-3 h-3" /> };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="glass-card p-4 hover:glow-lavender transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold truncate">{order.client}</h3>
          <p className="text-xs text-muted-foreground truncate">{order.project}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpen?.(order)}>
              <Eye className="w-3.5 h-3.5 mr-2" /> Abrir
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Printer className="w-3.5 h-3.5 mr-2" /> Imprimir
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="w-3.5 h-3.5 mr-2" /> Compartir
            </DropdownMenuItem>
            {order.status === "Control de Calidad" && onMarkBuilt && (
              <DropdownMenuItem onClick={() => onMarkBuilt(order.id)}>
                <CheckCircle className="w-3.5 h-3.5 mr-2" /> Marcar Completada
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`${status.color} text-[10px] gap-1`}>
          {status.icon}
          {order.status}
        </Badge>
        {order.estimatedCompletion && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {order.estimatedCompletion}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{order.materials.length} recursos</span>
        <span className="font-medium">{order.progress}%</span>
      </div>

      <div className="h-1 rounded-full bg-muted/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary/60 transition-all"
          style={{ width: `${order.progress}%` }}
        />
      </div>
    </motion.div>
  );
}
