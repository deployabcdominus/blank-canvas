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
    { name: "Completado", value: pct, fill: "#5B6AF2" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="dash-card p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] font-bold text-foreground">Órdenes de Servicio</h3>
        <div className="p-2 rounded-xl bg-lavender/10 border border-lavender/20">
          <Target className="w-5 h-5 text-lavender" />
        </div>
      </div>

      <div className="relative h-[180px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={chartData} startAngle={90} endAngle={-270} barSize={12}>
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: "hsl(var(--border))" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-extrabold text-foreground">{pct}%</span>
          <span className="text-xs text-muted-foreground">completado</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="text-center flex flex-col items-center">
          <p className="text-[22px] font-bold" style={{ color: "#16A34A" }}>{stats.completed}</p>
          <p className="text-[11px] text-muted-foreground">Completadas</p>
        </div>
        <div className="text-center flex flex-col items-center border-x" style={{ borderColor: 'rgba(99, 115, 165, 0.15)' }}>
          <p className="text-[22px] font-bold" style={{ color: "#D97706" }}>{stats.inProgress}</p>
          <p className="text-[11px] text-muted-foreground">En curso</p>
        </div>
        <div className="text-center flex flex-col items-center">
          <p className="text-[22px] font-bold" style={{ color: "#DC2626" }}>{stats.pending}</p>
          <p className="text-[11px] text-muted-foreground">Pendientes</p>
        </div>
      </div>
    </motion.div>
  );
};
