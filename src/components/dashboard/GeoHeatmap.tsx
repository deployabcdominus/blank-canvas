import { useMemo } from "react";
import { motion } from "framer-motion";
import { Installation } from "@/contexts/InstallationsContext";
import { MapPin } from "lucide-react";

interface GeoHeatmapProps {
  installations: Installation[];
}

/** Stylized dark "radar" heatmap — no external map library required */
export const GeoHeatmap = ({ installations }: GeoHeatmapProps) => {
  const activeCount = installations.filter(i => i.status !== "Completed").length;
  const completedCount = installations.filter(i => i.status === "Completed").length;

  // Generate deterministic dots from installation data
  const dots = useMemo(() => {
    return installations.slice(0, 20).map((inst, i) => {
      // Pseudo-random positions based on id hash
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
      className="rounded-2xl border p-5 backdrop-blur-[24px] relative overflow-hidden"
      style={{
        background: "rgba(15,18,30,0.55)",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white/80">Mapa de Instalaciones</h3>
          <p className="text-[11px] text-white/40">{activeCount} activas · {completedCount} completadas</p>
        </div>
        <div className="p-2 rounded-xl" style={{ background: "rgba(0,210,255,0.1)", border: "1px solid rgba(0,210,255,0.2)" }}>
          <MapPin className="w-4 h-4" style={{ color: "#00D2FF" }} />
        </div>
      </div>

      {/* Dark map canvas */}
      <div className="relative w-full h-[200px] rounded-xl overflow-hidden" style={{ background: "rgba(8,10,20,0.8)" }}>
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(0,210,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,255,0.03) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        {/* Radar sweep */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-40 h-40 rounded-full border border-cyan-500/10" />
          <div className="absolute w-24 h-24 rounded-full border border-cyan-500/5" />
          <div className="absolute w-56 h-56 rounded-full border border-cyan-500/5" />
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
              background: dot.isActive ? "#00D2FF" : "rgba(162,89,255,0.6)",
              boxShadow: dot.isActive
                ? "0 0 12px 2px rgba(0,210,255,0.4)"
                : "0 0 8px 1px rgba(162,89,255,0.3)",
            }}
          />
        ))}

        {/* Empty state */}
        {dots.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white/20 text-xs">Sin instalaciones registradas</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
