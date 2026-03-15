import { useMemo } from "react";
import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { WorkOrder } from "@/contexts/WorkOrdersContext";
import { Target } from "lucide-react";

interface WorkOrdersRadialProps {
  orders: WorkOrder[];
}

export const WorkOrdersRadial = ({ orders }: WorkOrdersRadialProps) => {
  const stats = useMemo(() => {
    const total = orders.length || 1;
    const completed = orders.filter(o => o.status === "Completada").length;
    const inProgress = orders.filter(o => o.status === "En Progreso").length;
    const pending = orders.filter(o => o.status !== "Completada" && o.status !== "En Progreso").length;
    return { total, completed, inProgress, pending };
  }, [orders]);

  const pct = Math.round((stats.completed / stats.total) * 100);

  const chartData = [
    { name: "Completado", value: pct, fill: "hsl(25, 95%, 53%)" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-2xl p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-zinc-950/50 shimmer-hover"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-[0.08em]">Órdenes de Servicio</h3>
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <Target className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <div className="relative h-[180px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={chartData} startAngle={90} endAngle={-270} barSize={12}>
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "rgba(255, 255, 255, 0.03)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-semibold text-white">{pct}%</span>
          <span className="text-xs text-zinc-500">completado</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="text-center flex flex-col items-center">
          <p className="text-[22px] font-semibold text-emerald-400">{stats.completed}</p>
          <p className="text-[11px] text-zinc-500">Completadas</p>
        </div>
        <div className="text-center flex flex-col items-center border-x border-white/[0.04]">
          <p className="text-[22px] font-semibold text-primary">{stats.inProgress}</p>
          <p className="text-[11px] text-zinc-500">En curso</p>
        </div>
        <div className="text-center flex flex-col items-center">
          <p className="text-[22px] font-semibold text-red-400">{stats.pending}</p>
          <p className="text-[11px] text-zinc-500">Pendientes</p>
        </div>
      </div>
    </motion.div>
  );
};
