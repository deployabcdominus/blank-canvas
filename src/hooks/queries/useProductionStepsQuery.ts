import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useProductionStepsQuery = (companyId: string | null, userId: string | undefined) => {
  const queryClient = useQueryClient();

  const stepsQuery = useQuery({
    queryKey: ['production-steps', companyId, userId],
    queryFn: async () => {
      if (!companyId) return [];

      let query = supabase
        .from('production_steps' as any)
        .select('*')
        .eq('company_id', companyId)
        .in('status', ['pending', 'in_progress'])
        .order('sort_order');

      if (userId) {
        query = query.eq('assigned_to', userId);
      }

      const { data: stepsData, error: stepsError } = await query;
      if (stepsError) throw stepsError;
      if (!stepsData || stepsData.length === 0) return [];

      const orderIds = [...new Set(stepsData.map((t: any) => t.production_order_id))];
      const { data: orders, error: ordersError } = await supabase
        .from('production_orders')
        .select('id, client, project, priority')
        .in('id', orderIds);
      
      if (ordersError) throw ordersError;
      
      const orderMap = new Map((orders || []).map(o => [o.id, o]));

      return stepsData.map((t: any) => ({
        ...t,
        order_client: orderMap.get(t.production_order_id)?.client ?? "",
        order_project: orderMap.get(t.production_order_id)?.project ?? "",
        order_priority: orderMap.get(t.production_order_id)?.priority ?? "media",
      }));
    },
    enabled: !!companyId,
  });

  const startTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from('production_steps' as any).update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      } as any).eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-steps', companyId, userId] });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, startedAt }: { taskId: string; startedAt: string | null }) => {
      const now = new Date().toISOString();
      const minutes = startedAt
        ? Math.round((Date.now() - new Date(startedAt).getTime()) / 60000) : 0;

      const { error } = await supabase.from('production_steps' as any).update({
        status: 'completed', completed_at: now, duration_minutes: minutes,
      } as any).eq('id', taskId);
      
      if (error) throw error;
      
      if (userId && companyId) {
        const { data: existing } = await supabase
          .from('worker_stats' as any).select('*')
          .eq('user_id', userId).eq('company_id', companyId).maybeSingle();
        const today = now.split('T')[0];
        const ex = existing as any;
        const isNewDay = ex?.last_activity_date !== today;
        
        const newXpTotal = (ex?.xp_total || 0) + 90;
        const newLevel = Math.min(6, Math.floor(newXpTotal / 500));
        
        const LEVEL_TITLES = ["Aprendiz", "Operario", "Técnico", "Especialista", "Experto", "Maestro", "Leyenda"];
        
        await supabase.from('worker_stats' as any).upsert({
          user_id: userId, company_id: companyId,
          xp_today: isNewDay ? 90 : (ex?.xp_today || 0) + 90,
          xp_total: newXpTotal,
          tasks_today: isNewDay ? 1 : (ex?.tasks_today || 0) + 1,
          tasks_week: (ex?.tasks_week || 0) + 1,
          tasks_total: (ex?.tasks_total || 0) + 1,
          streak_days: isNewDay ? (ex?.streak_days || 0) + 1 : (ex?.streak_days || 0),
          last_activity_date: today, level: newLevel,
          level_title: LEVEL_TITLES[newLevel], updated_at: now,
        } as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-steps', companyId, userId] });
      queryClient.invalidateQueries({ queryKey: ['worker-stats', userId] });
    },
  });

  return {
    steps: stepsQuery.data || [],
    isLoading: stepsQuery.isLoading,
    startTaskMutation,
    completeTaskMutation,
  };
};
