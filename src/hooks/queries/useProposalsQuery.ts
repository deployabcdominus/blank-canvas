
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProposalsService, ProposalInsert, ProposalUpdate } from '@/services/proposals.service';
import { toast } from 'sonner';
import { mapProposalRow } from '@/lib/mappings';
import { Proposal } from '@/types/domain';

export const useProposalsQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const proposalsQuery = useQuery({
    queryKey: ['proposals', companyId],
    queryFn: async () => {
      if (!companyId) return { proposals: [] as Proposal[], orders: [] };
      const res = await ProposalsService.getAll(companyId);
      if (res.error) throw res.error;
      
      const orderProposalIds = new Set<string>(
        (res.orders || []).map(o => o.proposal_id).filter((id): id is string => !!id)
      );

      return {
        proposals: (res.proposals || []).map(p => mapProposalRow(p, orderProposalIds)),
        orders: res.orders || []
      };
    },
    enabled: !!companyId,
  });

  const createProposalMutation = useMutation({
    mutationFn: (newProposal: ProposalInsert) => ProposalsService.create(newProposal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', companyId] });
      toast.success('Propuesta creada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al crear la propuesta: ' + error.message);
    },
  });

  const updateProposalMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ProposalUpdate }) => 
      ProposalsService.update(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['proposals', companyId] });
      const previous = queryClient.getQueryData(['proposals', companyId]);
      queryClient.setQueryData(['proposals', companyId], (old: any | undefined) => {
        if (!old) return old;
        return {
          ...old,
          proposals: old.proposals.map((p: any) => p.id === id ? { ...p, ...updates } : p)
        };
      });
      return { previous };
    },
    onError: (error: any, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['proposals', companyId], context.previous);
      }
      toast.error('Error al actualizar la propuesta: ' + error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', companyId] });
    },
    onSuccess: () => {
      toast.success('Propuesta actualizada correctamente');
    },
  });

  const deleteProposalMutation = useMutation({
    mutationFn: (id: string) => ProposalsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', companyId] });
      toast.success('Propuesta eliminada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar la propuesta: ' + error.message);
    },
  });

  return {
    proposals: proposalsQuery.data?.proposals || [],
    orders: proposalsQuery.data?.orders || [],
    isLoading: proposalsQuery.isLoading,
    proposalsQuery,
    createProposalMutation,
    updateProposalMutation,
    deleteProposalMutation,
  };
};
