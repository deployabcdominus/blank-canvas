import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProductionStepsByOrderQuery = (orderId: string) => {
  return useQuery({
    queryKey: ['production-steps', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const { data, error } = await supabase
        .from('production_steps' as any)
        .select(`
          *,
          profiles (full_name)
        `)
        .eq('production_order_id', orderId)
        .order('sort_order');
      if (error) throw error;
      
      return (data || []).map((s: any) => ({
        ...s,
        assigned_name: s.profiles?.full_name || null
      }));
    },
    enabled: !!orderId,
  });
};
