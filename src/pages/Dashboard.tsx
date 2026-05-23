import { useState, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";

import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { HudCard } from "@/components/dashboard/HudCard";
import { HudPipeline } from "@/components/dashboard/HudPipeline";
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
import { isThisMonth, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Users, ClipboardList, MapPin, CheckCircle2, AlertTriangle, Loader2, DollarSign, TrendingUp } from "lucide-react";
import { GracePeriodBanner } from "@/components/GracePeriodBanner";
import { AttentionNeededPanel } from "@/components/dashboard/AttentionNeededPanel";

// Lazy-loaded heavy components
const RevenueChart = lazy(() => import("@/components/dashboard/RevenueChart").then(m => ({ default: m.RevenueChart })));
const WorkOrdersRadial = lazy(() => import("@/components/dashboard/WorkOrdersRadial").then(m => ({ default: m.WorkOrdersRadial })));
const GeoHeatmap = lazy(() => import("@/components/dashboard/GeoHeatmap").then(m => ({ default: m.GeoHeatmap })));
const AiBriefing = lazy(() => import("@/components/dashboard/AiBriefing").then(m => ({ default: m.AiBriefing })));
const TeamActivityWidget = lazy(() => import("@/components/dashboard/TeamActivityWidget").then(m => ({ default: m.TeamActivityWidget })));
const WeeklyReport = lazy(() => import("@/components/dashboard/WeeklyReport").then(m => ({ default: m.WeeklyReport })));

const WidgetLoader = () => (
  <div className="flex items-center justify-center min-h-[200px] w-full bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl animate-pulse">
    <Loader2 className="w-6 h-6 text-primary/40 animate-spin" />
  </div>
);



const Dashboard = () => {
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


  const stats = useMemo(() => {
    const activeLeadsCount = leads.filter(l => l.status !== "Convertido" && l.status !== "Perdido").length;
    const leadsFollowUpCount = leads.filter(l => l.followUpRequired).length;
    const inProductionCount = orders.filter(o => ["En Producción", "En Progreso", "In Production"].includes(o.status || o.internal_status)).length;
    const readyForInstallCount = orders.filter(o => o.status === "Completada" || o.internal_status === "Ready for Install").length;
    const waitingForAcceptanceCount = orders.filter(o => o.closing_status === "Waiting for Client Acceptance").length;
    
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const closedThisMonthCount = orders.filter(o => o.closing_status === "Closed" && o.closed_at && isWithinInterval(new Date(o.closed_at), { start, end })).length;

    const totalEstimatedRevenueVal = proposals.reduce((acc: number, p: any) => acc + (Number(p.value) || 0), 0);
    const approvedProposalValueVal = proposals.filter((p: any) => p.status === "Aprobada").reduce((acc: number, p: any) => acc + (Number(p.value) || 0), 0);
    const pendingBalanceVal = orders.reduce((acc: number, o: any) => acc + (Number(o.final_balance_due) || 0), 0);

    return [
      { key: "leads" as KanbanColumn, label: t.dashboard.activeLeads, desc: `${leadsFollowUpCount} need follow-up`, value: activeLeadsCount, icon: Users, accent: "hud-indigo", delta: 0, sparkline: [0, 0, 0, 0, 0, 0, 0] },
      { key: "production" as KanbanColumn, label: "In Production", desc: `${inProductionCount} orders active`, value: inProductionCount, icon: ClipboardList, accent: "hud-amber", delta: 0, sparkline: [0, 0, 0, 0, 1, 0, 1] },
      { key: "install" as KanbanColumn, label: "Ready to Install", desc: `${readyForInstallCount} pending schedule`, value: readyForInstallCount, icon: MapPin, accent: "hud-cyan", delta: 0, sparkline: [0, 0, 0, 0, 0, 0, 0] },
      { key: "closed" as KanbanColumn, label: "Closed MTD", desc: "Successfully completed", value: closedThisMonthCount, icon: CheckCircle2, accent: "hud-green", delta: 0, sparkline: [0, 0, 0, 0, 0, 0, 0] },
      { key: "revenue" as any, label: "Total Estimated", desc: "Pipeline value", value: totalEstimatedRevenueVal, icon: TrendingUp, accent: "hud-indigo", isCurrency: true },
      { key: "approved" as any, label: "Approved Value", desc: "Booked business", value: approvedProposalValueVal, icon: CheckCircle2, accent: "hud-green", isCurrency: true },
      { key: "balance" as any, label: "Pending Balance", desc: "Awaiting payment", value: pendingBalanceVal, icon: DollarSign, accent: "hud-amber", isCurrency: true },
      { key: "pending" as any, label: "Acceptance Pending", desc: "Awaiting client", value: waitingForAcceptanceCount, icon: ClipboardList, accent: "hud-cyan" },
    ];
  }, [leads, orders, proposals, t]);

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
        

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-4 md:mb-6 flex items-end justify-between">
          <div>
            <h1 className="font-bold text-xl md:text-2xl text-foreground">{t.dashboard.controlCenter}</h1>
            <p className="text-muted-foreground text-[10px] md:text-sm">
              {showFinancials ? t.dashboard.executiveView : t.dashboard.operativeView}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground">{t.common.live}</span>
          </div>
        </motion.div>

        {isAdmin && (
          <Suspense fallback={<div className="h-32 w-full animate-pulse bg-muted/20 rounded-xl mb-6" />}>
            <AiBriefing />
          </Suspense>
        )}

        <AttentionNeededPanel leads={leads} proposals={proposals} orders={orders} installations={installations} />



        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-10">
          {stats.map((stat, index) => (
            <HudCard key={stat.key} label={stat.label} desc={hasNoCompany ? t.dashboard.noAccess : stat.desc} value={stat.value} isCurrency={(stat as any).isCurrency} icon={hasNoCompany ? AlertTriangle : stat.icon} isActive={activeFilter === stat.key} onClick={() => handleKpiClick(stat.key)} index={index} accentClass={stat.accent} noAccess={hasNoCompany} delta={stat.delta} sparkline={stat.sparkline} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-6 md:mb-10">
          <Suspense fallback={<WidgetLoader />}>
            {showFinancials && <RevenueChart proposals={proposals} payments={payments} />}
          </Suspense>
          <Suspense fallback={<WidgetLoader />}>
            {canViewOperations && <WorkOrdersRadial orders={orders} />}
          </Suspense>
          <Suspense fallback={<WidgetLoader />}>
            <GeoHeatmap installations={installations} />
          </Suspense>

        </div>


        {isAdmin && (
          <Suspense fallback={<WidgetLoader />}>
            <WeeklyReport />
          </Suspense>
        )}


        {isAdmin && (
          <div className="mb-8">
            <Suspense fallback={<WidgetLoader />}>
              <TeamActivityWidget />
            </Suspense>
          </div>

        )}

        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4 px-1">{t.nav.production} Pipeline</h2>
          <HudPipeline leads={leads} proposals={proposals} orders={orders} installations={installations} activeFilter={activeFilter} />
        </div>
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default Dashboard;
