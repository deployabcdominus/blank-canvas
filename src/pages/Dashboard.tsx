import { useState, useMemo } from "react";
import { motion } from "framer-motion";

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
import { useDashboardToasts } from "@/hooks/useDashboardToasts";
import { useLanguage } from "@/i18n/LanguageContext";
import { isThisMonth } from "date-fns";
import { Users, ClipboardList, MapPin, CheckCircle2, AlertTriangle } from "lucide-react";
import { GracePeriodBanner } from "@/components/GracePeriodBanner";
import { WeeklyReport } from "@/components/dashboard/WeeklyReport";

const Dashboard = () => {
  const breakpoint = useBreakpoint();
  const [activeFilter, setActiveFilter] = useState<KanbanColumn | null>(null);
  const { canViewFinancials, canViewOperations, isAdmin, isSuperadmin, companyId, loading: roleLoading } = useUserRole();
  const { t } = useLanguage();
  useRealtimeDashboard();
  useDashboardToasts();

  const hasNoCompany = !roleLoading && !companyId && !isSuperadmin;

  const { leads } = useLeads();
  const { proposals } = useProposals();
  const { orders } = useWorkOrders();
  const { installations } = useInstallations();
  const { payments } = usePayments();

  const isMobile = breakpoint === "mobile";
  const isTablet = breakpoint === "tablet";

  const stats = useMemo(() => {
    const activeLeads = leads.filter(l => l.status !== "Convertido" && l.status !== "Perdido").length;
    const inProgress = orders.filter(o => ["Pendiente", "En Producción", "QC", "En Progreso"].includes(o.status)).length;
    const awaitingDelivery = orders.filter(o => o.status === "Listo").length;
    const completedThisMonth = orders.filter(o => {
      if (o.status === "Instalado" && o.startDate) {
        try { return isThisMonth(new Date(o.startDate)); } catch { return false; }
      }
      return false;
    }).length;

    return [
      { key: "leads" as KanbanColumn, label: t.dashboard.activeLeads, desc: t.dashboard.noProposal, value: activeLeads, icon: Users, accent: "hud-indigo", delta: 0, sparkline: [0, 0, 0, 0, 0, 0, 0] },
      { key: "work-orders" as KanbanColumn, label: t.dashboard.inProgress, desc: t.dashboard.ordersInProgress, value: inProgress, icon: ClipboardList, accent: "hud-amber", delta: 100, sparkline: [0, 0, 0, 0, 1, 0, 1] },
      { key: "entrega" as KanbanColumn, label: t.dashboard.awaitingDelivery, desc: t.dashboard.scheduledPending, value: awaitingDelivery, icon: MapPin, accent: "hud-cyan", delta: 0, sparkline: [0, 0, 0, 0, 0, 0, 0] },
      { key: "completado" as KanbanColumn, label: t.dashboard.completed, desc: t.dashboard.thisMonth, value: completedThisMonth, icon: CheckCircle2, accent: "hud-green", delta: 0, sparkline: [0, 0, 0, 0, 0, 0, 0] },
    ];
  }, [leads, orders, t]);

  const handleKpiClick = (key: KanbanColumn) => {
    setActiveFilter(prev => (prev === key ? null : key));
  };

  const showFinancials = canViewFinancials;

  return (
    <PageTransition>
      <ResponsiveLayout>
        {/* Incomplete profile banner */}
        {hasNoCompany && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl px-5 py-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">{t.dashboard.noCompanyTitle}</p>
              <p className="text-xs text-amber-400/80">{t.dashboard.noCompanyDesc}</p>
            </div>
          </div>
        )}
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

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-10">
          {stats.map((stat, index) => (
            <HudCard key={stat.key} label={stat.label} desc={hasNoCompany ? t.dashboard.noAccess : stat.desc} value={stat.value} icon={hasNoCompany ? AlertTriangle : stat.icon} isActive={activeFilter === stat.key} onClick={() => handleKpiClick(stat.key)} index={index} accentClass={stat.accent} noAccess={hasNoCompany} delta={stat.delta} sparkline={stat.sparkline} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-10">
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
