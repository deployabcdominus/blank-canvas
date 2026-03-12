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
import { KanbanColumn } from "@/components/PipelineKanban";
import { useLeads } from "@/contexts/LeadsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { useWorkOrders } from "@/contexts/WorkOrdersContext";
import { useInstallations } from "@/contexts/InstallationsContext";
import { usePayments } from "@/contexts/PaymentsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { isThisMonth } from "date-fns";
import { Users, ClipboardList, MapPin, CheckCircle2 } from "lucide-react";

const Dashboard = () => {
  const breakpoint = useBreakpoint();
  const [activeFilter, setActiveFilter] = useState<KanbanColumn | null>(null);
  const { canViewFinancials, canViewOperations, isAdmin, loading: roleLoading } = useUserRole();

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
      { key: "leads" as KanbanColumn, label: "Leads Activos", desc: "Sin propuesta asignada", value: activeLeads, icon: Users, accent: "hud-cyan" },
      { key: "work-orders" as KanbanColumn, label: "En Progreso", desc: "Órdenes en curso", value: inProgress, icon: ClipboardList, accent: "hud-violet" },
      { key: "entrega" as KanbanColumn, label: "Esperando Entrega", desc: "Agendadas pendientes", value: awaitingDelivery, icon: MapPin, accent: "hud-cyan" },
      { key: "completado" as KanbanColumn, label: "Completados", desc: "Este mes", value: completedThisMonth, icon: CheckCircle2, accent: "hud-violet" },
    ];
  }, [leads, orders, installations]);

  const handleKpiClick = (key: KanbanColumn) => {
    setActiveFilter(prev => (prev === key ? null : key));
  };

  const showFinancials = canViewFinancials;

  return (
    <PageTransition>
      <ResponsiveLayout>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
          <h1 className="font-bold text-2xl text-foreground">Centro de Control</h1>
          <p className="text-muted-foreground text-sm">
            {showFinancials ? "Vista ejecutiva · Datos en tiempo real" : "Vista operativa · Tus tareas de hoy"}
          </p>
        </motion.div>

        {isAdmin && <AiBriefing />}

        <div className={`grid gap-4 mb-8 ${isMobile ? "grid-cols-2" : isTablet ? "grid-cols-2" : "grid-cols-4"}`}>
          {stats.map((stat, index) => (
            <HudCard key={stat.key} label={stat.label} desc={stat.desc} value={stat.value} icon={stat.icon} isActive={activeFilter === stat.key} onClick={() => handleKpiClick(stat.key)} index={index} accentClass={stat.accent} />
          ))}
        </div>

        <div className={`grid gap-4 mb-8 ${isMobile ? "grid-cols-1" : showFinancials ? "grid-cols-3" : "grid-cols-2"}`}>
          {showFinancials && <RevenueChart proposals={proposals} payments={payments} />}
          {canViewOperations && <WorkOrdersRadial orders={orders} />}
          <GeoHeatmap installations={installations} />
        </div>

        <HudPipeline leads={leads} proposals={proposals} orders={orders} installations={installations} activeFilter={activeFilter} />
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default Dashboard;
