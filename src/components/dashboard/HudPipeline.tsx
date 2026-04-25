import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lead } from "@/contexts/LeadsContext";
import { Proposal } from "@/contexts/ProposalsContext";
import { WorkOrder } from "@/contexts/WorkOrdersContext";
import { Installation } from "@/contexts/InstallationsContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, FileText, ClipboardList, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";
import { KanbanColumn } from "@/components/PipelineKanban";
import { useLanguage } from "@/i18n/LanguageContext";

interface HudPipelineProps {
  leads: Lead[];
  proposals: Proposal[];
  orders: WorkOrder[];
  installations: Installation[];
  activeFilter: KanbanColumn | null;
}

interface PipelineItem {
  id: string;
  column: KanbanColumn;
  company: string;
  project: string;
  status: string;
  value?: number;
  logoUrl?: string;
  daysAgo: number;
  navigateTo: string;
  health: "green" | "yellow" | "red";
}

const COL_KEYS = [
  { key: "leads" as KanbanColumn, icon: Users, accentVar: "--primary" },
  { key: "propuesta" as KanbanColumn, icon: FileText, accentVar: "--color-warning" },
  { key: "work-orders" as KanbanColumn, icon: ClipboardList, accentVar: "--color-info" },
  { key: "entrega" as KanbanColumn, icon: MapPin, accentVar: "--primary" },
  { key: "completado" as KanbanColumn, icon: CheckCircle2, accentVar: "--color-success" },
];

function daysAgo(dateStr?: string | null): number {
  if (!dateStr) return 0;
  try { return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)); }
  catch { return 0; }
}

function getHealth(d: number): "green" | "yellow" | "red" {
  if (d <= 3) return "green";
  if (d <= 7) return "yellow";
  return "red";
}

const healthColor = { green: "hsl(var(--color-success))", yellow: "hsl(var(--color-warning))", red: "hsl(var(--color-danger))" };

export const HudPipeline = ({ leads, proposals, orders, installations, activeFilter }: HudPipelineProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const tc = t.hudPipeline;

  const COLS = [
    { key: "leads" as KanbanColumn, label: "Leads", icon: Users, accentVar: "--primary" },
    { key: "propuesta" as KanbanColumn, label: tc.cols.proposal, icon: FileText, accentVar: "--color-warning" },
    { key: "work-orders" as KanbanColumn, label: tc.cols.orders, icon: ClipboardList, accentVar: "--color-info" },
    { key: "entrega" as KanbanColumn, label: tc.cols.delivery, icon: MapPin, accentVar: "--primary" },
    { key: "completado" as KanbanColumn, label: tc.cols.completed, icon: CheckCircle2, accentVar: "--color-success" },
  ];

  const cards = useMemo(() => {
    const result: PipelineItem[] = [];
    const leadsWithProposal = new Set(proposals.map(p => p.leadId).filter(Boolean));
    const orderProjects = new Set(orders.map(o => o.project));
    const instProjects = new Set(installations.map(i => i.project));

    leads.forEach(l => {
      if (l.status === "Convertido" || l.status === "Perdido") return;
      if (leadsWithProposal.has(l.id)) return;
      const d = l.daysAgo;
      result.push({ id: `l-${l.id}`, column: "leads", company: l.company || l.name, project: l.service || "—", status: l.status, value: l.value ? parseFloat(l.value.replace(/[^\d.]/g, "")) || undefined : undefined, logoUrl: l.logoUrl, daysAgo: d, navigateTo: "/leads", health: getHealth(d) });
    });

    proposals.forEach(p => {
      if (orderProjects.has(p.project) || instProjects.has(p.project) || p.status === "Rechazada") return;
      const d = daysAgo(p.createdAt);
      result.push({ id: `p-${p.id}`, column: "propuesta", company: p.client, project: p.project, status: p.status, value: p.value, daysAgo: d, navigateTo: "/proposals", health: getHealth(d) });
    });

    orders.forEach(o => {
      if (o.status === "Completada" && instProjects.has(o.project)) return;
      const d = daysAgo(o.startDate);
      result.push({ id: `o-${o.id}`, column: "work-orders", company: o.client, project: o.project, status: o.status, daysAgo: d, navigateTo: "/work-orders", health: getHealth(d) });
    });

    installations.forEach(i => {
      const col: KanbanColumn = i.status === "Completed" ? "completado" : "entrega";
      const d = daysAgo(i.scheduledDate);
      result.push({ id: `i-${i.id}`, column: col, company: i.client, project: i.project, status: i.status === "Scheduled" ? tc.installStatus.scheduled : i.status === "In Progress" ? tc.installStatus.inProgress : tc.installStatus.completed, daysAgo: d, navigateTo: "/installation", health: col === "completado" ? "green" : getHealth(d) });
    });

    return result;
  }, [leads, proposals, orders, installations]);

  const visibleCols = activeFilter ? COLS.filter(c => c.key === activeFilter) : COLS;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base md:text-lg font-bold text-foreground">{tc.title}</h2>
        {activeFilter && <span className="text-[10px] md:text-xs text-muted-foreground">{tc.filtering}: {COLS.find(c => c.key === activeFilter)?.label}</span>}
      </div>

      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
        <AnimatePresence mode="popLayout">
          {visibleCols.map(col => {
            const colCards = cards.filter(c => c.column === col.key);
            const Icon = col.icon;
            const accentColor = `hsl(var(${col.accentVar}))`;
            return (
              <motion.div key={col.key} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 min-w-[200px]">
                <div
                  className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl border"
                  style={{
                    background: `hsl(var(${col.accentVar}) / 0.08)`,
                    borderColor: `hsl(var(${col.accentVar}) / 0.20)`,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <span className="font-semibold text-xs text-foreground/70">{col.label}</span>
                  <span className="ml-auto text-xs font-bold" style={{ color: accentColor }}>{colCards.length}</span>
                </div>
                <div className="space-y-2 min-h-[100px]">
                  {colCards.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-xs">{tc.noProjects}</div>
                  ) : (
                    colCards.map((card, idx) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => navigate(card.navigateTo)}
                        className="dash-card p-3 cursor-pointer card-interactive group"
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-1.5 flex-shrink-0">
                            <div className="w-2 h-2 rounded-full" style={{ background: healthColor[card.health], boxShadow: `0 0 6px ${healthColor[card.health]}60` }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">{card.company}</p>
                            <p className="text-xs text-muted-foreground truncate">{card.project}</p>
                          </div>
                          {card.logoUrl && (
                            <Avatar className="w-6 h-6 flex-shrink-0">
                              <AvatarImage src={card.logoUrl} />
                              <AvatarFallback className="bg-primary/10 text-primary text-[8px]">{card.company.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded border"
                            style={{
                              background: `hsl(var(${col.accentVar}) / 0.10)`,
                              borderColor: `hsl(var(${col.accentVar}) / 0.20)`,
                              color: accentColor,
                            }}
                          >
                            {card.status}
                          </span>
                          {card.value != null && card.value > 0 && <span className="text-[10px] font-bold text-muted-foreground">${card.value.toLocaleString("es-MX")}</span>}
                          <span className="ml-auto text-[10px] text-muted-foreground/60">{card.daysAgo === 0 ? tc.today : `${card.daysAgo}d`}</span>
                          {card.health === "red" && <AlertTriangle className="w-3 h-3" style={{ color: "hsl(var(--color-danger))" }} />}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
