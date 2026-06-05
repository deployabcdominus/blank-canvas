import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeDashboard() {
  const { companyId } = useUserRole();
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['leads', companyId] });
      queryClient.invalidateQueries({ queryKey: ['proposals', companyId] });
      queryClient.invalidateQueries({ queryKey: ['work-orders', companyId] });
      queryClient.invalidateQueries({ queryKey: ['installations', companyId] });
      queryClient.invalidateQueries({ queryKey: ['payments', companyId] });
      queryClient.invalidateQueries({ queryKey: ['projects', companyId] });
    }, 500);
  }, [queryClient, companyId]);

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