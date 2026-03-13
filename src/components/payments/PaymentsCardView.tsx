import { motion } from "framer-motion";
import { Payment } from "@/contexts/PaymentsContext";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DollarSign, Trash2 } from "lucide-react";

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

export const PaymentsCardView = ({ payments, proposalMap, canDelete, onDelete }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {payments.map((p, i) => {
        const info = proposalMap.get(p.proposalId);
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card p-4 space-y-3 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{info?.client || "—"}</p>
                  <p className="text-xs text-muted-foreground">{info?.project || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {canDelete && (
                  <button
                    onClick={() => onDelete?.(p.id)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[p.status] || ""}`}>
                  {STATUS_LABELS[p.status] || p.status}
                </Badge>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{METHOD_LABELS[p.method] || p.method}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(p.paidAt), "dd MMM yyyy", { locale: es })}</p>
              </div>
              <p className="text-xl font-bold font-mono">
                ${p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>

            {p.note && (
              <p className="text-xs text-muted-foreground border-t border-border/20 pt-2 truncate">{p.note}</p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
