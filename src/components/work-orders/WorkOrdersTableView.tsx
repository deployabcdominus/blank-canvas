import { WorkOrder } from "@/contexts/WorkOrdersContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Printer, Share2, CheckCircle } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  "Pendiente": "bg-lavender/20 text-lavender border-lavender/30",
  "En Progreso": "bg-soft-blue/20 text-soft-blue border-soft-blue/30",
  "Control de Calidad": "bg-pale-pink/20 text-pale-pink border-pale-pink/30",
  "Completada": "bg-mint/20 text-mint border-mint/30",
};

interface Props {
  orders: WorkOrder[];
  onOpen?: (order: WorkOrder) => void;
  onMarkBuilt?: (id: string) => void;
}

export function WorkOrdersTableView({ orders, onOpen, onMarkBuilt }: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="glass-card rounded-2xl overflow-hidden border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs font-medium text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Proyecto</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Estado</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-center">Recursos</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-center">Progreso</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">F. Inicio</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">F. Estimada</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(order => (
              <TableRow key={order.id} className="group border-border/30 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => onOpen?.(order)}>
                <TableCell className="text-sm font-medium">{order.client}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{order.project}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[order.status] || ""}`}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="text-xs px-2 py-0">{order.materials.length}</Badge>
                </TableCell>
                <TableCell className="text-center text-xs">{order.progress}%</TableCell>
                <TableCell className="text-xs text-muted-foreground">{order.startDate}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{order.estimatedCompletion}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); onOpen?.(order); }}>
                        <Eye className="w-3.5 h-3.5 mr-2" /> Abrir
                      </DropdownMenuItem>
                      <DropdownMenuItem><Printer className="w-3.5 h-3.5 mr-2" /> Imprimir</DropdownMenuItem>
                      <DropdownMenuItem><Share2 className="w-3.5 h-3.5 mr-2" /> Compartir</DropdownMenuItem>
                      {order.status === "Control de Calidad" && onMarkBuilt && (
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); onMarkBuilt(order.id); }}>
                          <CheckCircle className="w-3.5 h-3.5 mr-2" /> Marcar Completada
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
