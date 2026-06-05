import { WorkOrder as ProductionOrder } from "@/types/domain";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Printer, Share2, CheckCircle } from "lucide-react";
import { useT } from "@/i18n/LanguageContext";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  "Materiales Pedidos": "bg-lavender/20 text-lavender border-lavender/30",
  "En Producción": "bg-soft-blue/20 text-soft-blue border-soft-blue/30",
  "Control de Calidad": "bg-pale-pink/20 text-pale-pink border-pale-pink/30",
  "Producido": "bg-mint/20 text-mint border-mint/30",
};

interface Props {
  orders: ProductionOrder[];
  onOpen?: (order: ProductionOrder) => void;
  onMarkBuilt?: (id: string) => void;
}

export function ProductionTableView({ orders, onOpen, onMarkBuilt }: Props) {
  const t = useT();
  const STATUS_LABELS: Record<string, string> = {
    "Materiales Pedidos": t.production.filters.status.materialsOrdered,
    "En Producción": t.production.filters.status.inProduction,
    "Control de Calidad": t.production.filters.status.qualityControl,
    "Producido": t.production.filters.status.produced,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="glass-card rounded-2xl overflow-hidden border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs font-medium text-muted-foreground">{t.production.tableView.client}</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">{t.production.tableView.project}</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">{t.production.tableView.status}</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-center">{t.production.tableView.materials}</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-center">{t.production.tableView.progress}</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">{t.production.tableView.startDate}</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">{t.production.tableView.estimatedDate}</TableHead>
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
                    {STATUS_LABELS[order.status] || order.status}
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
                        <Eye className="w-3.5 h-3.5 mr-2" /> {t.production.tableView.actions.open}
                      </DropdownMenuItem>
                      <DropdownMenuItem><Printer className="w-3.5 h-3.5 mr-2" /> {t.production.tableView.actions.print}</DropdownMenuItem>
                      <DropdownMenuItem><Share2 className="w-3.5 h-3.5 mr-2" /> {t.production.tableView.actions.share}</DropdownMenuItem>
                      {order.status === "Control de Calidad" && onMarkBuilt && (
                        <DropdownMenuItem onClick={e => { e.stopPropagation(); onMarkBuilt(order.id); }}>
                          <CheckCircle className="w-3.5 h-3.5 mr-2" /> {t.production.tableView.actions.markProduced}
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
