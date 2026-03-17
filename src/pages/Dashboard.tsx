import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useBreakpoint } from "@/hooks/use-mobile";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { HudCard } from "@/components/dashboard/HudCard";
import { HudPipeline } from "@/components/dashboard/HudPipeline";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { WorkOrdersRadial } from "@/components/dashboard/WorkOrdersRadial";
import { GeoHeatmap } from "@/components/dashboard/GeoHeatmap";
import { AiBriefing } from "@/components/dashboard/AiBriefing";
import { TeamActivityWidget } from "@/components/dashboard/TeamActivityWidget";
import { KanbanColumn } from "@/components/PipelineKanban";
import { useLeads } from "@/contexts/LeadsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { useWorkOrders } from "@/contexts/WorkOrdersContext";
import { useInstallations } from "@/contexts/InstallationsContext";
import { usePayments } from "@/contexts/PaymentsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { useLanguage } from "@/i18n/LanguageContext";
import { isThisMonth } from "date-fns";
import { Users, ClipboardList, MapPin, CheckCircle2 } from "lucide-react";
import { GracePeriodBanner } from "@/components/GracePeriodBanner";
import { WeeklyReport } from "@/components/dashboard/WeeklyReport";

const Dashboard = () => {
  const breakpoint = useBreakpoint();
  const [activeFilter, setActiveFilter] = useState<KanbanColumn | null>(null);
  const { canViewFinancials, canViewOperations, isAdmin, loading: roleLoading } = useUserRole();
  const { t } = useLanguage();
  useRealtimeDashboard();

  const { leads } = useLeads();
  const { proposals } = useProposals();
  const { orders } = useWorkOrders();
  const { installations } = useInstallations();
  const { payments } = usePayments();

  const isMobile = breakpoint === "mobile";
  const isTablet = breakpoint === "tablet";

  const stats = useMemo(() => {
    const activeLeads = leads.filter(l => l.status !== "Convertido" && l.status !== "Perdido").length;
    const inProgress = orders.filter(o => o.status === "En Progreso").length;
    const awaitingDelivery = installations.filter(i => i.status === "Scheduled").length;
    const completedThisMonth = installations.filter(i => {
      if (i.status === "Completed" && i.scheduledDate) {
        try { return isThisMonth(new Date(i.scheduledDate)); } catch { return false; }
      }
      return false;
    }).length;

    return [
      { key: "leads" as KanbanColumn, label: t.dashboard.activeLeads, desc: t.dashboard.noProposal, value: activeLeads, icon: Users, accent: "hud-indigo" },
      { key: "work-orders" as KanbanColumn, label: t.dashboard.inProgress, desc: t.dashboard.ordersInProgress, value: inProgress, icon: ClipboardList, accent: "hud-amber" },
      { key: "entrega" as KanbanColumn, label: t.dashboard.awaitingDelivery, desc: t.dashboard.scheduledPending, value: awaitingDelivery, icon: MapPin, accent: "hud-cyan" },
      { key: "completado" as KanbanColumn, label: t.dashboard.completed, desc: t.dashboard.thisMonth, value: completedThisMonth, icon: CheckCircle2, accent: "hud-green" },
    ];
  }, [leads, orders, installations, t]);

  const handleKpiClick = (key: KanbanColumn) => {
    setActiveFilter(prev => (prev === key ? null : key));
  };

  const showFinancials = canViewFinancials;

  return (
    <PageTransition>
      <ResponsiveLayout>
        <GracePeriodBanner />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-bold text-2xl text-foreground">{t.dashboard.controlCenter}</h1>
            <p className="text-muted-foreground text-sm">
              {showFinancials ? t.dashboard.executiveView : t.dashboard.operativeView}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-muted-foreground">{t.common.live}</span>
          </div>
        </motion.div>

        {isAdmin && <AiBriefing />}

        <div className={`grid gap-5 mb-10 ${isMobile ? "grid-cols-2" : isTablet ? "grid-cols-2" : "grid-cols-4"}`}>
          {stats.map((stat, index) => (
            <HudCard key={stat.key} label={stat.label} desc={stat.desc} value={stat.value} icon={stat.icon} isActive={activeFilter === stat.key} onClick={() => handleKpiClick(stat.key)} index={index} accentClass={stat.accent} />
          ))}
        </div>

        <div className={`grid gap-5 mb-10 ${isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"}`}>
          {showFinancials && <RevenueChart proposals={proposals} payments={payments} />}
          {canViewOperations && <WorkOrdersRadial orders={orders} />}
          <GeoHeatmap installations={installations} />
        </div>

        {isAdmin && <WeeklyReport />}

        {isAdmin && (
          <div className="mb-8">
            <TeamActivityWidget />
          </div>
        )}

        <HudPipeline leads={leads} proposals={proposals} orders={orders} installations={installations} activeFilter={activeFilter} />
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default Dashboard;
