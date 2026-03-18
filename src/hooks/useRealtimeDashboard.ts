import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useLeads } from "@/contexts/LeadsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { useWorkOrders } from "@/contexts/WorkOrdersContext";
import { useInstallations } from "@/contexts/InstallationsContext";
import { usePayments } from "@/contexts/PaymentsContext";

export function useRealtimeDashboard() {
  const { companyId } = useUserRole();
  const { refreshLeads } = useLeads();
  const { refreshProposals } = useProposals();
  const { refreshOrders } = useWorkOrders();
  const { refreshInstallations } = useInstallations();
  const { refreshPayments } = usePayments();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      refreshLeads();
      refreshProposals();
      refreshOrders();
      refreshInstallations();
      refreshPayments();
    }, 500);
  }, [refreshLeads, refreshProposals, refreshOrders, refreshInstallations, refreshPayments]);

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`dashboard-realtime-${companyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "leads", filter: `company_id=eq.${companyId}` }, handleChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "production_orders", filter: `company_id=eq.${companyId}` }, handleChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "proposals", filter: `company_id=eq.${companyId}` }, handleChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments", filter: `company_id=eq.${companyId}` }, handleChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "installations", filter: `company_id=eq.${companyId}` }, handleChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects", filter: `company_id=eq.${companyId}` }, handleChange)
      .on("postgres_changes", { event: "*", schema: "public", table: "production_steps" }, handleChange)
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [companyId, handleChange]);
}
