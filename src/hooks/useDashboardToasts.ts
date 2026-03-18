import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

/**
 * Listens for new leads (INSERT) and approved proposals (UPDATE→Aprobada)
 * and fires premium Violet toasts with direct links.
 */
export function useDashboardToasts() {
  const { companyId } = useUserRole();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel(`dashboard-toasts-${companyId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads", filter: `company_id=eq.${companyId}` },
        (payload: any) => {
          if (!mounted.current) return;
          const lead = payload.new;
          toast("📥 Nuevo Lead", {
            description: `${lead.name}${lead.company ? ` — ${lead.company}` : ""}`,
            action: {
              label: "Ver Lead",
              onClick: () => window.location.assign("/leads"),
            },
            duration: 5000,
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "proposals", filter: `company_id=eq.${companyId}` },
        (payload: any) => {
          if (!mounted.current) return;
          const proposal = payload.new;
          if (proposal.status === "Aprobada") {
            toast.success("🚀 ¡Propuesta Aprobada!", {
              description: `${proposal.client}${proposal.project ? ` — ${proposal.project}` : ""}`,
              action: {
                label: "Ver Propuesta",
                onClick: () => window.location.assign("/proposals"),
              },
              duration: 6000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId]);
}
