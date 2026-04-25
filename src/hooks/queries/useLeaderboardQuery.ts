import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

export const useLeaderboardQuery = () => {
  const { companyId } = useUserRole();

  return useQuery({
    queryKey: ['worker-leaderboard', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('worker_stats' as any)
        .select('user_id, full_name, level, level_title, tasks_week, streak_days')
        .eq('company_id', companyId)
        .order('tasks_week', { ascending: false })
        .limit(5);

      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!companyId,
  });
};
