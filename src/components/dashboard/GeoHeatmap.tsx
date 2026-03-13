import { useMemo } from "react";
import { motion } from "framer-motion";
import { Installation } from "@/contexts/InstallationsContext";
import { MapPin } from "lucide-react";

interface GeoHeatmapProps {
  installations: Installation[];
}

export const GeoHeatmap = ({ installations }: GeoHeatmapProps) => {
  const activeCount = installations.filter(i => i.status !== "Completed").length;
  const completedCount = installations.filter(i => i.status === "Completed").length;

  const dots = useMemo(() => {
    return installations.slice(0, 20).map((inst, i) => {
      let h = 0;
      const idStr = String(inst.id);
      for (let j = 0; j < idStr.length; j++) h = idStr.charCodeAt(j) + ((h << 5) - h);
      const x = 15 + (Math.abs(h) % 70);
      const y = 15 + (Math.abs(h >> 8) % 65);
      const isActive = inst.status !== "Completed";
      return { x, y, isActive, id: inst.id, size: isActive ? 6 : 4, i };
    });
  }, [installations]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="dash-card p-5 relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-bold text-foreground">Mapa de Instalaciones</h3>
          <p className="text-xs text-muted-foreground">{activeCount} activas · {completedCount} completadas</p>
        </div>
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="relative w-full h-[200px] rounded-xl overflow-hidden bg-secondary/50 dark:bg-card/50">
        {/* Grid pattern */}
        <div className="absolute inset-0 empty-state-pattern opacity-50" />

        {/* Radar circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-40 h-40 rounded-full border border-primary/10" />
          <div className="absolute w-24 h-24 rounded-full border border-primary/5" />
          <div className="absolute w-56 h-56 rounded-full border border-primary/5" />
        </div>

        {/* Dots */}
        {dots.map(dot => (
          <motion.div
            key={dot.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 + dot.i * 0.04, type: "spring" }}
            className="absolute rounded-full"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: dot.size * 2,
              height: dot.size * 2,
              background: dot.isActive ? "hsl(var(--primary))" : "hsl(var(--lavender) / 0.6)",
              boxShadow: dot.isActive
                ? "0 0 12px 2px hsl(var(--primary) / 0.4)"
                : "0 0 8px 1px hsl(var(--lavender) / 0.3)",
            }}
          />
        ))}

        {dots.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm italic">Sin instalaciones registradas</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
