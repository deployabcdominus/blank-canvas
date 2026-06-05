import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientsService, ClientInsert, ClientUpdate } from '@/services/clients.service';
import { toast } from 'sonner';
import { mapClientRow } from '@/lib/mappings';
import { Client } from '@/types/domain';

export const useClientsQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ['clients', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await ClientsService.getAll(companyId);
      if (error) throw error;
      return (data || []).map(mapClientRow);
    },
    enabled: !!companyId,
  });

  const createClientMutation = useMutation({
    mutationFn: (newClient: ClientInsert) => ClientsService.create(newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', companyId] });
      toast.success('Cliente creado correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al crear el cliente: ' + error.message);
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ClientUpdate }) => 
      ClientsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', companyId] });
      toast.success('Cliente actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el cliente: ' + error.message);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: string) => ClientsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', companyId] });
      toast.success('Cliente eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error('Error al eliminar el cliente: ' + error.message);
    },
  });

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    clientsQuery,
    createClientMutation,
    updateClientMutation,
    deleteClientMutation,
  };
};