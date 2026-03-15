import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Installation } from "@/contexts/InstallationsContext";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import { batchGeocode } from "@/hooks/useGeocoding";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ── Custom orange glow marker via SVG data-URI ── */
const createGlowIcon = (isActive: boolean) => {
  const color = isActive ? "#f97316" : "#71717a";
  const glow = isActive ? "rgba(249,115,22,0.45)" : "rgba(113,113,122,0.2)";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="14" fill="${glow}" opacity="0.35">
        <animate attributeName="r" values="10;14;10" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.45;0.15;0.45" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="16" cy="16" r="6" fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: "leaflet-glow-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

/* ── Map auto-fit bounds ── */
function FitBounds({ points }: { points: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [points, map]);
  return null;
}

/* ── Status helpers ── */
const statusLabel = (s: string) =>
  s === "Completed" ? "Completada" : s === "In Progress" ? "En Progreso" : "Agendada";
const statusColor = (s: string) =>
  s === "Completed"
    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : s === "In Progress"
    ? "bg-primary/20 text-primary border-primary/30"
    : "bg-amber-500/20 text-amber-400 border-amber-500/30";

interface GeoHeatmapProps {
  installations: Installation[];
}

export const GeoHeatmap = ({ installations }: GeoHeatmapProps) => {
  const navigate = useNavigate();
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
        installations.slice(0, 30),
        inst => inst.address || undefined
      );
      if (!cancelled) { setGeoMap(results); setGeocoding(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [installations]);

  const markers = useMemo(() => {
    return Array.from(geoMap.entries()).map(([id, coords]) => {
      const inst = installations.find(i => i.id === id);
      return { id, lat: coords.lat, lng: coords.lng, installation: inst };
    }).filter(m => m.installation);
  }, [geoMap, installations]);

  const points = useMemo(() => markers.map(m => ({ lat: m.lat, lng: m.lng })), [markers]);

  const defaultCenter: [number, number] = [19.4326, -99.1332]; // Mexico City fallback

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-2xl p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-zinc-950/50 relative overflow-hidden col-span-1 lg:col-span-2"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-[0.08em]">
            Mapa de Instalaciones
          </h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            {activeCount} activas · {completedCount} completadas
          </p>
        </div>
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <MapPin className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      {/* Map container */}
      <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-white/[0.04]">
        {geocoding && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-zinc-950/60 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Cargando ubicaciones…</p>
            </div>
          </div>
        )}

        {!geocoding && markers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4 z-[1000]">
            <div className="absolute inset-0 empty-state-pattern opacity-30" />
            <MapPin size={24} className="text-zinc-600" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-400">Sin ubicaciones registradas</p>
            <p className="text-xs text-zinc-600">
              Agrega direcciones a tus instalaciones para verlas en el mapa
            </p>
          </div>
        )}

        <MapContainer
          center={defaultCenter}
          zoom={5}
          className="w-full h-full"
          zoomControl={false}
          attributionControl={false}
          style={{ background: "#09090b" }}
        >
          {/* Dark tile layer — CartoDB Dark Matter */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          />
          {/* Minimal labels layer on top */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.35}
          />

          <FitBounds points={points} />

          {markers.map(m => {
            const inst = m.installation!;
            const isActive = inst.status !== "Completed";
            return (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={createGlowIcon(isActive)}
              >
                <Popup className="glass-popup" maxWidth={280} minWidth={240}>
                  <div className="flex flex-col gap-2.5">
                    {/* Client & Project */}
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">
                        {inst.client}
                      </p>
                      {inst.project && (
                        <p className="text-xs text-zinc-400 mt-0.5">{inst.project}</p>
                      )}
                    </div>

                    {/* Status badge */}
                    <Badge
                      className={`w-fit text-[10px] px-2 py-0.5 border ${statusColor(inst.status)}`}
                    >
                      {statusLabel(inst.status)}
                    </Badge>

                    {/* Address */}
                    {inst.address && (
                      <p className="text-[11px] text-zinc-500 leading-snug">{inst.address}</p>
                    )}

                    {/* Navigate button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full h-8 text-xs text-primary hover:bg-primary/10 border border-primary/20 mt-1"
                      onClick={() => navigate("/installation")}
                    >
                      <ExternalLink className="w-3 h-3 mr-1.5" />
                      Ver Proyecto
                    </Button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </motion.div>
  );
};
