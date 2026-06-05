import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentsService, PaymentInsert } from '@/services/payments.service';
import { mapPaymentRow } from '@/lib/mappings';
import { toast } from 'sonner';

export const usePaymentsQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ['payments', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await PaymentsService.getAll(companyId);
      if (error) throw error;
      return (data || []).map(mapPaymentRow);
    },
    enabled: !!companyId,
  });

  const createPaymentMutation = useMutation({
    mutationFn: (newPayment: PaymentInsert) => PaymentsService.create(newPayment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', companyId] });
      queryClient.invalidateQueries({ queryKey: ['proposals', companyId] });
      toast.success('Pago registrado correctamente');
    },
    onError: (error: any) => {
      toast.error('Error al registrar el pago: ' + error.message);
    },
  });

  const deletePaymentMutation = useMutation({
    mutationFn: (id: string) => PaymentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', companyId] });
      queryClient.invalidateQueries({ queryKey: ['proposals', companyId] });
      toast.success('Pago eliminado');
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
    deletePaymentMutation,
  };
};