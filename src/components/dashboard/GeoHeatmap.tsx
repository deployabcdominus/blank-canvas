import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Installation } from "@/contexts/InstallationsContext";
import { MapPin } from "lucide-react";
import { batchGeocode } from "@/hooks/useGeocoding";

interface GeoHeatmapProps {
  installations: Installation[];
}

export const GeoHeatmap = ({ installations }: GeoHeatmapProps) => {
  const activeCount = installations.filter(i => i.status !== "Completed").length;
  const completedCount = installations.filter(i => i.status === "Completed").length;

  const [geocoding, setGeocoding] = useState(false);
  const [geoMap, setGeoMap] = useState<Map<string, { lat: number; lng: number }>>(new Map());

  useEffect(() => {
    if (!installations.length) { setGeoMap(new Map()); return; }

    let cancelled = false;
    async function load() {
      setGeocoding(true);
      const results = await batchGeocode(
        installations.slice(0, 20),
        inst => inst.address || undefined
      );
      if (!cancelled) {
        setGeoMap(results);
        setGeocoding(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [installations]);

  const dots = useMemo(() => {
    const points = Array.from(geoMap.entries()).map(([id, coords]) => {
      const inst = installations.find(i => i.id === id);
      return { id, lat: coords.lat, lng: coords.lng, isActive: inst?.status !== "Completed" };
    });

    if (points.length === 0) return [];

    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;

    return points.map((p, i) => ({
      id: p.id,
      x: 10 + ((p.lng - minLng) / lngRange) * 80,
      y: 10 + ((maxLat - p.lat) / latRange) * 75,
      isActive: p.isActive,
      size: p.isActive ? 6 : 4,
      i,
    }));
  }, [geoMap, installations]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-2xl p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-zinc-950/50 shimmer-hover relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-[0.08em]">Mapa de Instalaciones</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{activeCount} activas · {completedCount} completadas</p>
        </div>
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <MapPin className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <div className="relative w-full h-[200px] rounded-xl overflow-hidden bg-white/[0.02]">
        {/* Grid pattern */}
        <div className="absolute inset-0 empty-state-pattern opacity-30" />

        {/* Radar circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-40 h-40 rounded-full border border-white/[0.04]" />
          <div className="absolute w-24 h-24 rounded-full border border-white/[0.03]" />
          <div className="absolute w-56 h-56 rounded-full border border-white/[0.03]" />
        </div>

        {geocoding && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-500">Cargando ubicaciones...</p>
            </div>
          </div>
        )}

        {!geocoding && dots.map(dot => (
          <motion.div
            key={dot.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + dot.i * 0.04, type: "spring" }}
            className="absolute rounded-full"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: dot.size * 2,
              height: dot.size * 2,
              background: dot.isActive ? "hsl(var(--primary))" : "rgba(161,161,170,0.4)",
              boxShadow: dot.isActive
                ? "0 0 12px 2px hsl(var(--primary) / 0.4)"
                : "0 0 8px 1px rgba(161,161,170,0.2)",
            }}
          />
        ))}

        {!geocoding && dots.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4">
            <MapPin size={24} className="text-zinc-600" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-400">Sin ubicaciones registradas</p>
            <p className="text-xs text-zinc-600">
              Agrega direcciones a tus instalaciones para verlas en el mapa
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
