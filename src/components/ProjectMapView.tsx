import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects, Project } from "@/contexts/ProjectsContext";
import { useInstallations } from "@/contexts/InstallationsContext";
import { usePayments } from "@/contexts/PaymentsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapPin, Layers, Filter, ChevronDown, ChevronUp,
  Building2, DollarSign, BarChart3, Shield, Calendar, AlertTriangle,
} from "lucide-react";
import { batchGeocode } from "@/hooks/useGeocoding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addYears, format, isPast } from "date-fns";

// ── Status config ──
const STATUS_COLORS: Record<string, { fill: string; stroke: string; label: string; glow: string }> = {
  Lead:         { fill: "#6B7280", stroke: "#9CA3AF", label: "Lead",         glow: "rgba(107,114,128,0.4)" },
  Proposal:     { fill: "#6B7280", stroke: "#9CA3AF", label: "Propuesta",    glow: "rgba(107,114,128,0.4)" },
  Production:   { fill: "#F59E0B", stroke: "#FBBF24", label: "Producción",   glow: "rgba(245,158,11,0.5)" },
  Installation: { fill: "#F59E0B", stroke: "#FBBF24", label: "Instalación",  glow: "rgba(245,158,11,0.5)" },
  Completed:    { fill: "#10B981", stroke: "#34D399", label: "Instalado",    glow: "rgba(16,185,129,0.5)" },
  Maintenance:  { fill: "#EF4444", stroke: "#F87171", label: "Mantenimiento",glow: "rgba(239,68,68,0.5)" },
};

const getStatusCfg = (status: string) => STATUS_COLORS[status] || STATUS_COLORS.Lead;

// addressToLatLng removed — now using real geocoding via Nominatim

function getMunicipality(address: string): string {
  const lower = (address || "").toLowerCase();
  if (lower.includes("miami beach")) return "Miami Beach";
  if (lower.includes("miami-dade") || lower.includes("dade")) return "Miami-Dade";
  if (lower.includes("miami")) return "Miami";
  return "Otro";
}

function getProjectType(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("monument")) return "Monument";
  if (lower.includes("wall")) return "Wall Sign";
  if (lower.includes("channel")) return "Channel Letters";
  if (lower.includes("led")) return "LED";
  if (lower.includes("banner")) return "Banner";
  return "Otro";
}

function BoundsTracker({ onBoundsChange }: { onBoundsChange: (bounds: LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => onBoundsChange(map.getBounds()),
    zoomend: () => onBoundsChange(map.getBounds()),
  });
  useEffect(() => { onBoundsChange(map.getBounds()); }, []);
  return null;
}

function ComplianceInfo({ address, installDate }: { address: string; installDate?: string }) {
  const municipality = getMunicipality(address);
  const needsPermit = municipality === "Miami-Dade" || municipality === "Miami";
  const warrantyEnd = installDate ? addYears(new Date(installDate), 2) : null;
  const warrantyExpired = warrantyEnd ? isPast(warrantyEnd) : false;

  return (
    <div className="mt-3 pt-3 border-t border-border/20 space-y-2">
      <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider flex items-center gap-1">
        <Shield className="w-3 h-3" /> Cumplimiento Normativo
      </p>
      <div className="flex items-start gap-2">
        <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${needsPermit ? "text-amber-400" : "text-green-400"}`} />
        <p className="text-xs text-white/70">
          {needsPermit
            ? `Requiere permisos especiales de ${municipality} County`
            : "No requiere permisos especiales en esta jurisdicción"}
        </p>
      </div>
      {warrantyEnd && (
        <div className="flex items-start gap-2">
          <Calendar className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${warrantyExpired ? "text-destructive" : "text-green-400"}`} />
          <p className="text-xs text-white/70">
            Garantía: {warrantyExpired ? "Expirada" : "Vigente"} — {format(warrantyEnd, "dd/MM/yyyy")}
          </p>
        </div>
      )}
    </div>
  );
}

export const ProjectMapView = () => {
  const { projects } = useProjects();
  const { installations } = useInstallations();
  const { payments } = usePayments();
  const { proposals } = useProposals();

  const [bounds, setBounds] = useState<LatLngBounds | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterMunicipality, setFilterMunicipality] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [geocodedCoords, setGeocodedCoords] = useState<Map<string, { lat: number; lng: number }>>(new Map());
  const [geocoding, setGeocoding] = useState(false);

  const handleBoundsChange = useCallback((b: LatLngBounds) => setBounds(b), []);

  // Geocode project addresses
  useEffect(() => {
    if (!projects.length) return;
    let cancelled = false;
    async function load() {
      setGeocoding(true);
      const results = await batchGeocode(projects, p => p.installAddress || undefined);
      if (!cancelled) {
        setGeocodedCoords(results);
        setGeocoding(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [projects]);

  const enrichedProjects = useMemo(() =>
    projects
      .filter(p => geocodedCoords.has(p.id))
      .map(p => {
        const coords = geocodedCoords.get(p.id)!;
        return {
          ...p,
          coords: [coords.lat, coords.lng] as [number, number],
          municipality: getMunicipality(p.installAddress),
          projectType: getProjectType(p.projectName),
        };
      })
  , [projects, geocodedCoords]);

  const filtered = useMemo(() =>
    enrichedProjects.filter(p => {
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (filterMunicipality !== "all" && p.municipality !== filterMunicipality) return false;
      if (filterType !== "all" && p.projectType !== filterType) return false;
      return true;
    })
  , [enrichedProjects, filterStatus, filterMunicipality, filterType]);

  const visibleProjects = useMemo(() => {
    if (!bounds) return filtered;
    return filtered.filter(p => bounds.contains(p.coords as [number, number]));
  }, [filtered, bounds]);

  const stats = useMemo(() => {
    const totalValue = visibleProjects.reduce((sum, p) => {
      const prop = proposals.find(pr => pr.project === p.projectName && pr.status === "Aprobada");
      return sum + (prop?.value || 0);
    }, 0);
    const totalPaid = visibleProjects.reduce((sum, p) => {
      const prop = proposals.find(pr => pr.project === p.projectName);
      if (!prop) return sum;
      return sum + payments.filter(pay => pay.proposalId === prop.id && pay.status === "received").reduce((s, pay) => s + pay.amount, 0);
    }, 0);
    const byType: Record<string, number> = {};
    visibleProjects.forEach(p => { byType[p.projectType] = (byType[p.projectType] || 0) + 1; });
    const byStatus: Record<string, number> = {};
    visibleProjects.forEach(p => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });
    return { total: visibleProjects.length, totalValue, totalPaid, byType, byStatus };
  }, [visibleProjects, proposals, payments]);

  const getInstallDate = (project: Project): string | undefined => {
    const inst = installations.find(i => i.project === project.projectName);
    return inst?.scheduledDate || undefined;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] rounded-xl overflow-hidden border border-border/20">
      {/* Filters bar */}
      <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between shrink-0 bg-background/50">
        <p className="text-sm text-muted-foreground">Vista geográfica de proyectos</p>
        <Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)} className="gap-2">
          <Filter className="w-4 h-4" />
          Filtros
          {filtersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border/20"
          >
            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Estado</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-muted/30 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(STATUS_COLORS).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Municipio</Label>
                <Select value={filterMunicipality} onValueChange={setFilterMunicipality}>
                  <SelectTrigger className="bg-muted/30 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Miami">Miami</SelectItem>
                    <SelectItem value="Miami-Dade">Miami-Dade</SelectItem>
                    <SelectItem value="Miami Beach">Miami Beach</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-muted/30 h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Monument">Monument</SelectItem>
                    <SelectItem value="Wall Sign">Wall Sign</SelectItem>
                    <SelectItem value="Channel Letters">Channel Letters</SelectItem>
                    <SelectItem value="LED">LED</SelectItem>
                    <SelectItem value="Banner">Banner</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map + Stats */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <style>{`
            .leaflet-container { background: #0a0e1a !important; }
            .leaflet-control-zoom a { background: rgba(15,18,30,0.85) !important; color: #fff !important; border-color: rgba(255,255,255,0.1) !important; }
            .leaflet-popup-content-wrapper { background: rgba(15,18,30,0.92) !important; color: #fff !important; border: 1px solid rgba(255,255,255,0.1) !important; border-radius: 16px !important; backdrop-filter: blur(24px); }
            .leaflet-popup-tip { background: rgba(15,18,30,0.92) !important; }
            .leaflet-popup-close-button { color: rgba(255,255,255,0.5) !important; }
          `}</style>
          <MapContainer center={[25.7617, -80.1918]} zoom={11} className="w-full h-full z-0" zoomControl={true}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://carto.com/">CARTO</a>' />
            <BoundsTracker onBoundsChange={handleBoundsChange} />
            {filtered.map(project => {
              const cfg = getStatusCfg(project.status);
              return (
                <CircleMarker
                  key={project.id}
                  center={project.coords as [number, number]}
                  radius={8}
                  pathOptions={{ fillColor: cfg.fill, color: cfg.stroke, weight: 2, opacity: 0.9, fillOpacity: 0.7 }}
                >
                  <Popup maxWidth={320}>
                    <div className="min-w-[260px]">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-sm text-white/90">{project.projectName}</p>
                          <p className="text-xs text-white/50">{project.clientName || "Sin cliente"}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: cfg.fill + "30", color: cfg.stroke }}>{cfg.label}</span>
                      </div>
                      <div className="space-y-1 text-xs text-white/60">
                        <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{project.installAddress || "Sin dirección"}</p>
                        <p className="flex items-center gap-1.5"><Layers className="w-3 h-3" />Tipo: {project.projectType}</p>
                        <p className="flex items-center gap-1.5"><Building2 className="w-3 h-3" />Municipio: {project.municipality}</p>
                      </div>
                      <ComplianceInfo address={project.installAddress} installDate={getInstallDate(project)} />
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-xl backdrop-blur-2xl border border-border/20" style={{ background: "rgba(15,18,30,0.8)" }}>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-semibold">Leyenda</p>
            <div className="space-y-1.5">
              {Object.entries(STATUS_COLORS).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: cfg.fill, boxShadow: `0 0 6px ${cfg.glow}` }} />
                  <span className="text-[11px] text-white/60">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="w-72 border-l border-border/20 flex flex-col overflow-hidden hidden lg:flex" style={{ background: "rgba(15,18,30,0.6)", backdropFilter: "blur(24px)" }}>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Área visible</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl border border-border/20" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[11px] text-white/40">Proyectos</p>
                    <p className="text-xl font-bold text-white/90">{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-border/20" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[11px] text-white/40">Facturado</p>
                    <p className="text-lg font-bold text-white/90">${stats.totalValue.toLocaleString("en-US")}</p>
                  </div>
                </div>
                {stats.totalPaid > 0 && (
                  <div className="mt-2 p-3 rounded-xl border border-border/20" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="flex justify-between text-xs">
                      <span className="text-white/40">Cobrado</span>
                      <span className="text-green-400 font-semibold">${stats.totalPaid.toLocaleString("en-US")}</span>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Por estado</h3>
                <div className="space-y-2">
                  {Object.entries(stats.byStatus).map(([status, count]) => {
                    const cfg = getStatusCfg(status);
                    return (
                      <div key={status} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/10" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.fill, boxShadow: `0 0 6px ${cfg.glow}` }} />
                          <span className="text-xs text-white/70">{cfg.label}</span>
                        </div>
                        <span className="text-xs font-bold text-white/80">{count}</span>
                      </div>
                    );
                  })}
                  {Object.keys(stats.byStatus).length === 0 && <p className="text-xs text-white/30 text-center py-4">Sin proyectos en esta área</p>}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" /> Por tipo
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/10" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <span className="text-xs text-white/70">{type}</span>
                      <Badge variant="secondary" className="text-[10px] px-2 py-0">{count}</Badge>
                    </div>
                  ))}
                  {Object.keys(stats.byType).length === 0 && <p className="text-xs text-white/30 text-center py-4">Sin datos</p>}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
