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

      // Payments received this month
      const monthPayments = payments.filter(p => {
        if (p.status !== 'received' || !p.paidAt) return false;
        try {
          return isWithinInterval(new Date(p.paidAt), { start, end });
        } catch { return false; }
      });
      const received = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      // Proposals created this month (for context)
      const monthProposals = proposals.filter(p => {
        if (!p.createdAt) return false;
        try {
          return isWithinInterval(new Date(p.createdAt), { start, end });
        } catch { return false; }
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

  // Pending = sum of (approvedTotal - paid) for approved proposals
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
      className="rounded-2xl border p-5 backdrop-blur-[24px]"
      style={{
        background: "rgba(15,18,30,0.55)",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white/80">Flujo de Ingresos</h3>
          <p className="text-2xl font-bold text-white/90 mt-1">
            ${totalReceived.toLocaleString("es-MX")}
          </p>
          <p className="text-[11px] text-white/40">Cobrado total</p>
        </div>
        <div className="text-right space-y-1">
          <div className="p-2 rounded-xl inline-flex" style={{ background: "rgba(0,210,255,0.1)", border: "1px solid rgba(0,210,255,0.2)" }}>
            <TrendingUp className="w-4 h-4" style={{ color: "#00D2FF" }} />
          </div>
          {pendingBalance > 0 && (
            <div className="flex items-center gap-1 text-[11px] text-amber-400">
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
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D2FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00D2FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A259FF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#A259FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{
                background: "rgba(15,18,30,0.9)",
                border: "1px solid rgba(0,210,255,0.3)",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
                color: "#fff",
                fontSize: 12,
              }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString("es-MX")}`,
                name === "cobrado" ? "Cobrado" : "Propuesto"
              ]}
            />
            <Area type="monotone" dataKey="cobrado" stroke="#00D2FF" strokeWidth={2} fill="url(#cyanGrad)" dot={false} />
            <Area type="monotone" dataKey="propuesto" stroke="#A259FF" strokeWidth={2} fill="url(#violetGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#00D2FF" }} />
          <span className="text-[11px] text-white/50">Cobrado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#A259FF" }} />
          <span className="text-[11px] text-white/50">Propuesto</span>
        </div>
      </div>
    </motion.div>
  );
};
