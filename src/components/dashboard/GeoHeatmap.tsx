import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Installation } from "@/contexts/InstallationsContext";
import { MapPin, ExternalLink, Loader2 } from "lucide-react";
import { batchGeocode } from "@/hooks/useGeocoding";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

/* ── Status helpers ── */
const statusLabel = (s: string, labels: { completed: string; inProgress: string; scheduled: string }) =>
  s === "Completed" ? labels.completed : s === "In Progress" ? labels.inProgress : labels.scheduled;
const statusBadge = (s: string) => {
  if (s === "Completed") return "background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.3)";
  if (s === "In Progress") return "background:rgba(249,115,22,0.2);color:#fb923c;border:1px solid rgba(249,115,22,0.3)";
  return "background:rgba(245,158,11,0.2);color:#fbbf24;border:1px solid rgba(245,158,11,0.3)";
};

interface GeoHeatmapProps {
  installations: Installation[];
}

export const GeoHeatmap = ({ installations }: GeoHeatmapProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const tc = t.geoHeatmap;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [19.4326, -99.1332],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png").addTo(map);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", { opacity: 0.35 }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (markers.length === 0) return;

    markers.forEach(m => {
      const inst = m.installation!;
      const isActive = inst.status !== "Completed";
      const color = isActive ? "#f97316" : "#71717a";
      const glow = isActive ? "rgba(249,115,22,0.45)" : "rgba(113,113,122,0.2)";

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="${glow}" opacity="0.35">
          <animate attributeName="r" values="10;14;10" dur="2.5s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.45;0.15;0.45" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="16" cy="16" r="6" fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
      </svg>`;

      const icon = L.divIcon({
        html: svg,
        className: "leaflet-glow-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const popupContent = `
        <div style="font-family:Inter,system-ui,sans-serif;">
          <p style="font-size:14px;font-weight:600;color:#fff;margin:0 0 2px;">${inst.client}</p>
          ${inst.project ? `<p style="font-size:12px;color:#a1a1aa;margin:0 0 8px;">${inst.project}</p>` : ""}
          <span style="display:inline-block;font-size:10px;padding:2px 8px;border-radius:999px;${statusBadge(inst.status)}">${statusLabel(inst.status, tc.installStatus)}</span>
          ${inst.address ? `<p style="font-size:11px;color:#71717a;margin:8px 0 0;line-height:1.4;">${inst.address}</p>` : ""}
          <button onclick="window.__signflow_nav_installation && window.__signflow_nav_installation()" style="width:100%;margin-top:10px;padding:6px 0;font-size:12px;color:#f97316;background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:8px;cursor:pointer;font-family:inherit;">
            ${tc.viewProject}
          </button>
        </div>`;

      const marker = L.marker([m.lat, m.lng], { icon })
        .bindPopup(popupContent, {
          className: "glass-popup",
          maxWidth: 280,
          minWidth: 220,
        })
        .addTo(map);

      marker.on("popupopen", () => {
        (window as any).__signflow_nav_installation = () => navigate("/installation");
      });

      markersRef.current.push(marker);
    });

    // Fit bounds
    const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [markers, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-2xl p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-zinc-950/50 relative overflow-hidden col-span-1 lg:col-span-2"
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-[0.08em]">{tc.title}</h3>
          <p className="text-xs text-muted-foreground/60 mt-0.5">{activeCount} {tc.active} · {completedCount} {tc.completedCount}</p>
        </div>
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
          <MapPin className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <div className="relative w-full h-[320px] rounded-xl overflow-hidden border border-white/[0.04]">
        {geocoding && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000] bg-zinc-950/60 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">{tc.loading}</p>
            </div>
          </div>
        )}

        {!geocoding && markers.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-4 z-[1000]">
            <div className="absolute inset-0 empty-state-pattern opacity-30" />
            <MapPin size={24} className="text-zinc-600" strokeWidth={1.5} />
            <p className="text-sm font-medium text-zinc-400">{tc.noLocations}</p>
            <p className="text-xs text-zinc-600">{tc.noLocationsHint}</p>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full" style={{ background: "#09090b" }} />
      </div>
    </motion.div>
  );
};
