import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentsService, PaymentInsert, PaymentUpdate } from '@/services/payments.service';
import { toast } from 'sonner';
import { PaymentMethod, PaymentStatus } from '@/contexts/PaymentsContext';

export const usePaymentsQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ['payments', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await PaymentsService.getAll(companyId);
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        proposalId: item.proposal_id,
        amount: Number(item.amount),
        currency: item.currency,
        method: item.method as PaymentMethod,
        status: item.status as PaymentStatus,
        paidAt: item.paid_at,
        note: item.note,
        createdAt: item.created_at,
        companyId: item.company_id,
        createdBy: item.created_by,
      }));
    },
    enabled: !!companyId,
  });

  const createPaymentMutation = useMutation({
    mutationFn: (newPayment: PaymentInsert) => PaymentsService.create(newPayment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', companyId] });
      toast.success('Pago registrado correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al registrar el pago: ' + error.message);
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PaymentUpdate }) => 
      PaymentsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', companyId] });
      toast.success('Pago actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar el pago: ' + error.message);
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => PaymentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', companyId] });
      toast.success('Pago eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar el pago: ' + error.message);
    },
  });

  return {
    payments: paymentsQuery.data || [],
    isLoading: paymentsQuery.isLoading,
    paymentsQuery,
    createPaymentMutation,
    updatePaymentMutation,
    deletePaymentMutation,
  };
};
