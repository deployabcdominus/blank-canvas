import { useMemo } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Proposal } from "@/contexts/ProposalsContext";
import { Payment } from "@/contexts/PaymentsContext";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp, AlertCircle } from "lucide-react";

interface RevenueChartProps {
  proposals: Proposal[];
  payments?: Payment[];
}

export const RevenueChart = ({ proposals, payments = [] }: RevenueChartProps) => {
  const data = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const monthPayments = payments.filter(p => {
        if (p.status !== 'received' || !p.paidAt) return false;
        try { return isWithinInterval(new Date(p.paidAt), { start, end }); }
        catch { return false; }
      });
      const received = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      const monthProposals = proposals.filter(p => {
        if (!p.createdAt) return false;
        try { return isWithinInterval(new Date(p.createdAt), { start, end }); }
        catch { return false; }
      });
      const proposed = monthProposals.reduce((sum, p) => sum + (p.value || 0), 0);

      months.push({
        name: format(date, "MMM", { locale: es }),
        cobrado: received,
        propuesto: proposed,
      });
    }
    return months;
  }, [proposals, payments]);

  const totalReceived = payments.filter(p => p.status === 'received').reduce((s, p) => s + p.amount, 0);

  const pendingBalance = useMemo(() => {
    const approved = proposals.filter(p => p.status === 'Aprobada');
    return approved.reduce((sum, p) => {
      const total = p.approvedTotal ?? p.value;
      const paid = payments
        .filter(pay => pay.proposalId === p.id && pay.status === 'received')
        .reduce((s, pay) => s + pay.amount, 0);
      return sum + Math.max(0, total - paid);
    }, 0);
  }, [proposals, payments]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="rounded-xl border border-white/[0.06] p-5 shimmer-hover"
      style={{ background: "#0a0a0a" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-bold text-foreground">Flujo de Ingresos</h3>
          <p className="text-[28px] font-extrabold text-foreground mt-1">
            ${totalReceived.toLocaleString("es-MX")}
          </p>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Cobrado total</p>
        </div>
        <div className="text-right space-y-1">
          <div className="p-2 rounded-xl inline-flex bg-primary/10 border border-primary/20">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          {pendingBalance > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-amber-500">
              <AlertCircle className="w-3 h-3" />
              Pendiente: ${pendingBalance.toLocaleString("es-MX")}
            </div>
          )}
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(25, 95%, 53%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(36, 91%, 44%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(36, 91%, 44%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(0, 0%, 45%)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                background: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                color: "#f2f2f2",
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString("es-MX")}`,
                name === "cobrado" ? "Cobrado" : "Propuesto"
              ]}
            />
            <Area type="monotone" dataKey="cobrado" stroke="hsl(25, 95%, 53%)" strokeWidth={2.5} fill="url(#orangeGrad)" dot={false} />
            <Area type="monotone" dataKey="propuesto" stroke="hsl(36, 91%, 50%)" strokeWidth={2} fill="url(#amberGrad)" dot={false} strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="text-xs text-zinc-500">Cobrado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "hsl(36, 91%, 50%)" }} />
          <span className="text-xs text-zinc-500">Propuesto</span>
        </div>
      </div>
    </motion.div>
  );
};
