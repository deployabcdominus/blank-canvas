import { motion } from "framer-motion";
import { Payment } from "@/contexts/PaymentsContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2 } from "lucide-react";

const METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo", zelle: "Zelle", card: "Tarjeta",
  transfer: "Transferencia", check: "Cheque", other: "Otro",
};

const STATUS_COLORS: Record<string, string> = {
  received: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  refunded: "bg-red-500/20 text-red-400 border-red-500/30",
  void: "bg-muted text-muted-foreground border-border/30",
};

const STATUS_LABELS: Record<string, string> = {
  received: "Recibido", pending: "Pendiente", refunded: "Reembolsado", void: "Anulado",
};

interface Props {
  payments: Payment[];
  proposalMap: Map<string, { client: string; project: string }>;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}

export const PaymentsTableView = ({ payments, proposalMap, canDelete, onDelete }: Props) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/20">
            <TableHead>Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Proyecto</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Nota</TableHead>
            {canDelete && <TableHead className="w-10" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map(p => {
            const info = proposalMap.get(p.proposalId);
            return (
              <TableRow key={p.id} className="border-border/10 hover:bg-muted/20 group">
                <TableCell className="text-sm">
                  {format(new Date(p.paidAt), "dd MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell className="font-medium">{info?.client || "—"}</TableCell>
                <TableCell className="text-muted-foreground">{info?.project || "—"}</TableCell>
                <TableCell className="text-right font-mono font-semibold">
                  ${p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell>{METHOD_LABELS[p.method] || p.method}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_COLORS[p.status] || ""}>
                    {STATUS_LABELS[p.status] || p.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">
                  {p.note || "—"}
                </TableCell>
                {canDelete && (
                  <TableCell>
                    <button
                      onClick={() => onDelete?.(p.id)}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={13} />
                    </button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
};
