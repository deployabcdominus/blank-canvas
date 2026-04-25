import { useQuery } from '@tanstack/react-query';
import { AuditLogsService } from '@/services/audit-logs.service';

export const useAuditLogsQuery = (companyId?: string | null, limit?: number) => {
  return useQuery({
    queryKey: ['audit-logs', companyId, limit],
    queryFn: async () => {
      if (limit) {
        const { data, error } = await AuditLogsService.getRecent(limit);
        if (error) throw error;
        return data || [];
      }
      
      if (!companyId) return [];
      const { data, error } = await AuditLogsService.getAll(companyId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!limit || !!companyId,
  });
};
