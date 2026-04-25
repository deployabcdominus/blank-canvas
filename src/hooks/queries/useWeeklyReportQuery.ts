import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WeekMetrics {
  new_leads: number;
  converted: number;
  revenue: number;
  lost_value: number;
  closed_orders: number;
}

export interface ReportData {
  current: WeekMetrics;
  previous: WeekMetrics;
  period_start: string;
  period_end: string;
}

export const useWeeklyReportQuery = (companyId: string | null, isAdmin: boolean) => {
  return useQuery({
    queryKey: ['weekly-report', companyId],
    queryFn: async () => {
      if (!companyId || !isAdmin) return null;
      
      const { data, error } = await supabase.rpc("get_weekly_report", {
        p_company_id: companyId,
      });
      
      if (error) throw error;
      return data as unknown as ReportData;
    },
    enabled: !!companyId && isAdmin,
  });
};
