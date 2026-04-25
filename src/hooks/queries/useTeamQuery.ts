import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export const useTeamQuery = (companyId: string | null) => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['company-users', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'list-company-users', companyId },
      });
      if (error) throw error;
      return (data.users || []) as CompanyUser[];
    },
    enabled: !!companyId,
  });

  const invitationsQuery = useQuery({
    queryKey: ['company-invitations', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('invitations')
        .select('id, email, role, token, expires_at, accepted_at, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Invitation[];
    },
    enabled: !!companyId,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'toggle-active', userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users', companyId] });
      toast.success('Estado actualizado');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar estado: ' + error.message);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'update-role', userId, role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users', companyId] });
      toast.success('Rol actualizado');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar rol: ' + error.message);
    },
  });

  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'remove-from-company', userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users', companyId] });
      toast.success('Usuario removido');
    },
    onError: (error: any) => {
      toast.error('Error al remover usuario: ' + error.message);
    },
  });

  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-invitations', companyId] });
      toast.success('Invitación eliminada');
    },
    onError: (error: any) => {
      toast.error('Error al eliminar invitación: ' + error.message);
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!companyId) return;
      
      // Delete accepted invitations
      const { error: err1 } = await supabase
        .from('invitations')
        .delete()
        .eq('company_id', companyId)
        .not('accepted_at', 'is', null);

      // Delete expired invitations (accepted_at is null but expired)
      const { error: err2 } = await supabase
        .from('invitations')
        .delete()
        .eq('company_id', companyId)
        .is('accepted_at', null)
        .lt('expires_at', new Date().toISOString());

      if (err1) throw err1;
      if (err2) throw err2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-invitations', companyId] });
      toast.success('Historial limpiado');
    },
    onError: (error: any) => {
      toast.error('Error al limpiar historial: ' + error.message);
    },
  });

  return {
    users: usersQuery.data || [],
    isLoadingUsers: usersQuery.isLoading,
    invitations: invitationsQuery.data || [],
    isLoadingInvitations: invitationsQuery.isLoading,
    toggleActiveMutation,
    updateRoleMutation,
    removeUserMutation,
    revokeInvitationMutation,
    clearHistoryMutation,
  };
};
