import { useMemo } from "react";
import { motion } from "framer-motion";
import { Payment } from "@/contexts/PaymentsContext";
import { DollarSign, TrendingUp, Clock, CreditCard } from "lucide-react";

interface Props {
  payments: Payment[];
}

export const PaymentsKPIBar = ({ payments }: Props) => {
  const stats = useMemo(() => {
    const received = payments.filter(p => p.status === "received");
    const pending = payments.filter(p => p.status === "pending");
    const totalReceived = received.reduce((s, p) => s + p.amount, 0);
    const totalPending = pending.reduce((s, p) => s + p.amount, 0);

    // This month
    const now = new Date();
    const thisMonth = received.filter(p => {
      const d = new Date(p.paidAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const monthTotal = thisMonth.reduce((s, p) => s + p.amount, 0);

    return { totalReceived, totalPending, monthTotal, count: payments.length };
  }, [payments]);

  const kpis = [
    { label: "Total Cobrado", value: `$${stats.totalReceived.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "text-green-400" },
    { label: "Este Mes", value: `$${stats.monthTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-primary" },
    { label: "Pendiente", value: `$${stats.totalPending.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: Clock, color: "text-amber-400" },
    { label: "Total Pagos", value: stats.count.toString(), icon: CreditCard, color: "text-muted-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="glass-card p-4 flex items-center gap-3"
        >
          <div className={`p-2 rounded-lg bg-muted/30 ${kpi.color}`}>
            <kpi.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
            <p className="text-lg font-bold">{kpi.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
