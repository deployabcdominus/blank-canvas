import { useState, useMemo, lazy, Suspense } from "react";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { HudPipeline } from "@/components/dashboard/HudPipeline";
import { useLeadsQuery } from "@/hooks/queries/useLeadsQuery";
import { useProposalsQuery } from "@/hooks/queries/useProposalsQuery";
import { useWorkOrdersQuery } from "@/hooks/queries/useWorkOrdersQuery";
import { useInstallationsQuery } from "@/hooks/queries/useInstallationsQuery";
import { usePaymentsQuery } from "@/hooks/queries/usePaymentsQuery";
import { useUserRole } from "@/hooks/useUserRole";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { useDashboardToasts } from "@/hooks/useDashboardToasts";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { Users, ClipboardList, MapPin, CheckCircle2, AlertTriangle, Loader2, DollarSign, TrendingUp } from "lucide-react";
import { GracePeriodBanner } from "@/components/GracePeriodBanner";
import { AttentionNeededPanel } from "@/components/dashboard/AttentionNeededPanel";
import { SignFlowDashboardView } from "@/components/dashboard/SignFlowDashboardView";
// Lazy-loaded heavy components
const RevenueChart = lazy(() => import("@/components/dashboard/RevenueChart").then(m => ({ default: m.RevenueChart })));
const WorkOrdersRadial = lazy(() => import("@/components/dashboard/WorkOrdersRadial").then(m => ({ default: m.WorkOrdersRadial })));
const GeoHeatmap = lazy(() => import("@/components/dashboard/GeoHeatmap").then(m => ({ default: m.GeoHeatmap })));
const AiBriefing = lazy(() => import("@/components/dashboard/AiBriefing").then(m => ({ default: m.AiBriefing })));
const TeamActivityWidget = lazy(() => import("@/components/dashboard/TeamActivityWidget").then(m => ({ default: m.TeamActivityWidget })));
const WeeklyReport = lazy(() => import("@/components/dashboard/WeeklyReport").then(m => ({ default: m.WeeklyReport })));
const WidgetLoader = () => (<div className="flex items-center justify-center min-h-[200px] w-full bg-card/40 backdrop-blur-xl border border-border/50 rounded-2xl animate-pulse">
    <Loader2 className="w-6 h-6 text-primary/40 animate-spin"/>
  </div>);
const Dashboard = () => {
    const [activeFilter, setActiveFilter] = useState(null);
    const { canViewFinancials, canViewOperations, isAdmin, isSuperadmin, companyId, loading: roleLoading } = useUserRole();
    const { t } = useLanguage();
    const profile = useUserProfile();
    useRealtimeDashboard();
    useDashboardToasts();
    const hasNoCompany = !roleLoading && !companyId && !isSuperadmin;
    const { leads } = useLeadsQuery(companyId);
    const { proposals } = useProposalsQuery(companyId);
    const { orders } = useWorkOrdersQuery(companyId);
    const { installations } = useInstallationsQuery(companyId);
    const { payments } = usePaymentsQuery(companyId);
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
        const totalEstimatedRevenueVal = proposals.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
        const approvedProposalValueVal = proposals.filter((p) => p.status === "Aprobada").reduce((acc, p) => acc + (Number(p.value) || 0), 0);
        const pendingBalanceVal = orders.reduce((acc, o) => acc + (Number(o.final_balance_due) || 0), 0);
        return [
            { key: "leads", label: t.dashboard.activeLeads, desc: `${leadsFollowUpCount} ${t.dashboard.leadsFollowUp}`, value: activeLeadsCount, icon: Users, accent: "hud-indigo", delta: 0, sparkline: [0, 0, 0, 0, 0, 0, 0] },
            { key: "production", label: t.dashboard.activeLeads, desc: `${inProductionCount} ${t.dashboard.ordersActive}`, value: inProductionCount, icon: ClipboardList, accent: "hud-amber", delta: 0, sparkline: [0, 0, 0, 0, 1, 0, 1] },
            { key: "install", label: t.dashboard.readyToInstall, desc: `${readyForInstallCount} ${t.dashboard.pendingSchedule}`, value: readyForInstallCount, icon: MapPin, accent: "hud-cyan", delta: 0, sparkline: [0, 0, 0, 0, 0, 0, 0] },
            { key: "closed", label: t.dashboard.closedMtd, desc: t.dashboard.successfullyCompleted, value: closedThisMonthCount, icon: CheckCircle2, accent: "hud-green", delta: 0, sparkline: [0, 0, 0, 0, 0, 0, 0] },
            { key: "revenue", label: t.dashboard.totalEstimated, desc: t.dashboard.pipelineValue, value: totalEstimatedRevenueVal, icon: TrendingUp, accent: "hud-indigo", isCurrency: true },
            { key: "approved", label: t.dashboard.approvedValue, desc: t.dashboard.bookedBusiness, value: approvedProposalValueVal, icon: CheckCircle2, accent: "hud-green", isCurrency: true },
            { key: "balance", label: t.dashboard.pendingBalance, desc: t.dashboard.awaitingPayment, value: pendingBalanceVal, icon: DollarSign, accent: "hud-amber", isCurrency: true },
            { key: "pending", label: t.dashboard.acceptancePending, desc: t.dashboard.awaitingClient, value: waitingForAcceptanceCount, icon: ClipboardList, accent: "hud-cyan" },
        ];
    }, [leads, orders, proposals, t]);
    const handleKpiClick = (key) => {
        setActiveFilter(prev => (prev === key ? null : key));
    };
    const showFinancials = canViewFinancials;
    return (<PageTransition effect="zoom-in">
      <ResponsiveLayout>
        {/* Incomplete profile banner */}
        {hasNoCompany && (<div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl px-5 py-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0"/>
            <div>
              <p className="text-sm font-semibold text-amber-300">{t.dashboard.noCompanyTitle}</p>
              <p className="text-xs text-amber-400/80">{t.dashboard.noCompanyDesc}</p>
            </div>
          </div>)}
        <GracePeriodBanner />

        {/* New SignFlow Dashboard View */}
        <SignFlowDashboardView leads={leads} proposals={proposals} orders={orders} installations={installations} payments={payments} userName={profile?.fullName || "User"} t={t}/>

        {/* Keeping existing functional components below the new hero/feature grid for deep analytics */}
        <div className="mt-8 space-y-8">
          {isAdmin && (<Suspense fallback={<div className="h-32 w-full animate-pulse bg-muted/20 rounded-xl mb-6"/>}>
              <AiBriefing />
            </Suspense>)}

          <AttentionNeededPanel leads={leads} proposals={proposals} orders={orders} installations={installations}/>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            <Suspense fallback={<WidgetLoader />}>
              {showFinancials && <RevenueChart proposals={proposals} payments={payments}/>}
            </Suspense>
            <Suspense fallback={<WidgetLoader />}>
              {canViewOperations && <WorkOrdersRadial orders={orders}/>}
            </Suspense>
            <Suspense fallback={<WidgetLoader />}>
              <GeoHeatmap installations={installations}/>
            </Suspense>
          </div>

          {isAdmin && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Suspense fallback={<WidgetLoader />}>
                <WeeklyReport />
              </Suspense>
              <Suspense fallback={<WidgetLoader />}>
                <TeamActivityWidget />
              </Suspense>
            </div>)}

          <div>
            <h2 className="text-xl font-black mb-6 px-1 text-white tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"/>
              {t.nav.production} Pipeline
            </h2>
            <HudPipeline leads={leads} proposals={proposals} orders={orders} installations={installations} activeFilter={activeFilter}/>
          </div>
        </div>
      </ResponsiveLayout>
    </PageTransition>);
};
export default Dashboard;
