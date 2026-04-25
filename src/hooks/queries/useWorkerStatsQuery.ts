import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWorkerStatsQuery = (userId: string | undefined, companyId: string | null) => {
  return useQuery({
    queryKey: ['worker-stats', userId, companyId],
    queryFn: async () => {
      if (!userId || !companyId) return null;
      const { data, error } = await supabase
        .from('worker_stats' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!userId && !!companyId,
  });
};
