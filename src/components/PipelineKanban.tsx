import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";
import { useBreakpoint } from "@/hooks/use-mobile";
import { Lead } from "@/contexts/LeadsContext";
import { Proposal } from "@/contexts/ProposalsContext";
import { WorkOrder } from "@/contexts/WorkOrdersContext";
import { Installation } from "@/contexts/InstallationsContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Users, FileText, ClipboardList, MapPin, CheckCircle2 
} from "lucide-react";

// -- Types --

export type KanbanColumn = 
  | "leads" 
  | "propuesta" 
  | "work-orders" 
  | "entrega" 
  | "completado";

export interface PipelineCard {
  id: string;
  column: KanbanColumn;
  company: string;
  project: string;
  service: string;
  status: string;
  value?: number;
  logoUrl?: string;
  daysAgo: number;
  navigateTo: string;
}

interface PipelineKanbanProps {
  leads: Lead[];
  proposals: Proposal[];
  orders: WorkOrder[];
  installations: Installation[];
  activeFilter: KanbanColumn | null;
}

// -- Helpers --

type ColumnDef = { key: KanbanColumn; label: string; icon: React.ElementType; bgClass: string; iconClass: string; borderAccent: string };

function daysAgoFromDate(dateStr?: string | null): number {
  if (!dateStr) return 0;
  try {
    return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000));
  } catch {
    return 0;
  }
}

const statusBadgeColor = (column: KanbanColumn) => {
  switch (column) {
    case "leads": return "bg-mint/20 text-mint-foreground border-mint/30";
    case "propuesta": return "bg-soft-blue/20 text-soft-blue-foreground border-soft-blue/30";
    case "work-orders": return "bg-lavender/20 text-lavender-foreground border-lavender/30";
    case "entrega": return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 border-amber-200/40";
    case "completado": return "bg-pale-pink/20 text-pale-pink-foreground border-pale-pink/30";
  }
};

// -- Component --

export const PipelineKanban = ({ leads, proposals, orders, installations, activeFilter }: PipelineKanbanProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === "mobile";

  const COLUMNS = useMemo<ColumnDef[]>(() => [
    { key: "leads", label: t.pipelineKanban.cols.leads, icon: Users, bgClass: "bg-mint/20", iconClass: "text-mint-foreground", borderAccent: "border-l-mint-foreground/50" },
    { key: "propuesta", label: t.pipelineKanban.cols.propuesta, icon: FileText, bgClass: "bg-soft-blue/20", iconClass: "text-soft-blue-foreground", borderAccent: "border-l-soft-blue-foreground/50" },
    { key: "work-orders", label: t.pipelineKanban.cols.orders, icon: ClipboardList, bgClass: "bg-lavender/20", iconClass: "text-lavender-foreground", borderAccent: "border-l-lavender-foreground/50" },
    { key: "entrega", label: t.pipelineKanban.cols.entrega, icon: MapPin, bgClass: "bg-amber-50 dark:bg-amber-900/20", iconClass: "text-amber-700 dark:text-amber-300", borderAccent: "border-l-amber-600/50" },
    { key: "completado", label: t.pipelineKanban.cols.completado, icon: CheckCircle2, bgClass: "bg-pale-pink/20", iconClass: "text-pale-pink-foreground", borderAccent: "border-l-pale-pink-foreground/50" },
  ], [t]);

  const cards = useMemo(() => {
    const result: PipelineCard[] = [];
    const leadsWithProposal = new Set(proposals.map(p => p.leadId).filter(Boolean));
    const orderProjects = new Set(orders.map(o => o.project));
    const instProjects = new Set(installations.map(i => i.project));

    leads.forEach(l => {
      if (l.status === "Convertido" || l.status === "Perdido") return;
      if (leadsWithProposal.has(l.id)) return;
      result.push({
        id: `lead-${l.id}`, column: "leads", company: l.company || l.name,
        project: l.service || t.pipelineKanban.noService, service: l.service,
        status: l.status, value: l.value ? parseFloat(l.value.replace(/[^\d.]/g, "")) || undefined : undefined,
        logoUrl: l.logoUrl, daysAgo: l.daysAgo, navigateTo: "/leads",
      });
    });

    proposals.forEach(p => {
      if (orderProjects.has(p.project) || instProjects.has(p.project) || p.status === "Rechazada") return;
      result.push({
        id: `proposal-${p.id}`, column: "propuesta", company: p.client,
        project: p.project, service: "", status: p.status, value: p.value,
        logoUrl: p.lead?.logoUrl || undefined, daysAgo: daysAgoFromDate(p.createdAt),
        navigateTo: `/proposals`,
      });
    });

    orders.forEach(o => {
      if (o.status === "Completada" && instProjects.has(o.project)) return;
      result.push({
        id: `order-${o.id}`, column: "work-orders", company: o.client,
        project: o.project, service: o.serviceType || "", status: o.status,
        value: undefined, daysAgo: daysAgoFromDate(o.startDate),
        navigateTo: "/work-orders",
      });
    });

    installations.forEach(i => {
      const col: KanbanColumn = i.status === "Completed" ? "completado" : "entrega";
      result.push({
        id: `install-${i.id}`, column: col, company: i.client,
        project: i.project, service: "",
        status: i.status === "Scheduled" ? t.pipelineKanban.installStatus.scheduled : i.status === "In Progress" ? t.pipelineKanban.installStatus.inProgress : t.pipelineKanban.installStatus.completed,
        value: undefined, daysAgo: daysAgoFromDate(i.scheduledDate),
        navigateTo: "/installation",
      });
    });

    return result;
  }, [leads, proposals, orders, installations]);

  const columnsToShow = activeFilter ? COLUMNS.filter(c => c.key === activeFilter) : COLUMNS;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t.pipelineKanban.title}</h2>
        {activeFilter && (
          <span className="text-xs text-muted-foreground">
            {t.pipelineKanban.filtering} {COLUMNS.find(c => c.key === activeFilter)?.label}
          </span>
        )}
      </div>
      <div className={`${isMobile ? 'overflow-x-auto -mx-4 px-4 pb-4' : ''}`}>
        <div className={`flex gap-4 ${isMobile ? 'min-w-[800px]' : ''}`}>
          {columnsToShow.map((col) => {
            const colCards = cards.filter(c => c.column === col.key);
            return (
              <KanbanColumnView key={col.key} column={col} cards={colCards} onCardClick={(card) => navigate(card.navigateTo)} isMobile={isMobile} />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// -- Column --
interface KanbanColumnViewProps {
  column: ColumnDef;
  cards: PipelineCard[];
  onCardClick: (card: PipelineCard) => void;
  isMobile: boolean;
}

const KanbanColumnView = ({ column, cards, onCardClick, isMobile }: KanbanColumnViewProps) => {
  const { t } = useLanguage();
  const Icon = column.icon;
  return (
    <div className="flex-1 min-w-[200px]">
      <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border-l-4 ${column.borderAccent} ${column.bgClass}`}>
        <Icon className={`w-4 h-4 ${column.iconClass}`} />
        <span className="font-semibold text-sm text-foreground">{column.label}</span>
        <span className={`ml-auto text-xs font-bold ${column.iconClass}`}>{cards.length}</span>
      </div>
      <div className="space-y-2 min-h-[120px]">
        {cards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground/50 text-xs">{t.pipelineKanban.noProjects}</div>
        ) : (
          cards.map((card, idx) => (
            <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05, duration: 0.3 }} onClick={() => onCardClick(card)} className="glass-card p-3 rounded-xl cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-start gap-2.5">
                <Avatar className="w-8 h-8 flex-shrink-0 mt-0.5">
                  {card.logoUrl ? <AvatarImage src={card.logoUrl} alt={card.company} /> : null}
                  <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">{card.company.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">{card.company}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{card.project}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusBadgeColor(card.column)}`}>{card.status}</span>
                {card.value != null && card.value > 0 && (
                  <span className="text-[10px] font-bold text-foreground/70">${card.value.toLocaleString("es-MX")}</span>
                )}
                <span className="ml-auto text-[10px] text-muted-foreground">{card.daysAgo === 0 ? t.pipelineKanban.today : t.pipelineKanban.daysAgo.replace("{{n}}", String(card.daysAgo))}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
