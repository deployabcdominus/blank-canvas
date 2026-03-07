import { useMemo } from "react";
import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { ProductionOrder } from "@/contexts/WorkOrdersContext";
import { Target } from "lucide-react";

interface ProductionRadialProps {
  orders: ProductionOrder[];
}

export const ProductionRadial = ({ orders }: ProductionRadialProps) => {
  const stats = useMemo(() => {
    const total = orders.length || 1;
    const completed = orders.filter(o => o.status === "Completada").length;
    const inProgress = orders.filter(o => o.status === "En Progreso").length;
    const pending = orders.filter(o => o.status !== "Completada" && o.status !== "En Progreso").length;
    return { total, completed, inProgress, pending };
  }, [orders]);

  const pct = Math.round((stats.completed / stats.total) * 100);

  const chartData = [
    { name: "Completado", value: pct, fill: "#00D2FF" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="rounded-2xl border p-5 backdrop-blur-[24px]"
      style={{
        background: "rgba(15,18,30,0.55)",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white/80">Producción Semanal</h3>
        <div className="p-2 rounded-xl" style={{ background: "rgba(162,89,255,0.1)", border: "1px solid rgba(162,89,255,0.2)" }}>
          <Target className="w-4 h-4" style={{ color: "#A259FF" }} />
        </div>
      </div>

      <div className="relative h-[180px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
            data={chartData} startAngle={90} endAngle={-270}
            barSize={12}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={6}
              background={{ fill: "rgba(255,255,255,0.05)" }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white/90">{pct}%</span>
          <span className="text-[10px] text-white/40">completado</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: "#00D2FF" }}>{stats.completed}</p>
          <p className="text-[10px] text-white/40">Producidos</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold" style={{ color: "#A259FF" }}>{stats.inProgress}</p>
          <p className="text-[10px] text-white/40">En curso</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white/60">{stats.pending}</p>
          <p className="text-[10px] text-white/40">Pendientes</p>
        </div>
      </div>
    </motion.div>
  );
};
