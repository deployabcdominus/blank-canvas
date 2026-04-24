import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProposalsService, ProposalInsert, ProposalUpdate } from '@/services/proposals.service';
import { toast } from 'sonner';

export const useProposalsQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const proposalsQuery = useQuery({
    queryKey: ['proposals', companyId],
    queryFn: async () => {
      if (!companyId) return { proposals: [], orders: [] };
      const res = await ProposalsService.getAll(companyId);
      if (res.error) throw res.error;
      return res;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals', companyId] });
      toast.success('Propuesta actualizada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar la propuesta: ' + error.message);
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
    proposalsData: proposalsQuery.data || { proposals: [], orders: [] },
    isLoading: proposalsQuery.isLoading,
    proposalsQuery,
    createProposalMutation,
    updateProposalMutation,
    deleteProposalMutation,
  };
};
