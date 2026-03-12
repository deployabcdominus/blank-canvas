import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from './useCompany';
import { useToast } from './use-toast';

interface QBOIntegration {
  id: string;
  company_id: string;
  provider: string;
  realm_id: string | null;
  connected_at: string | null;
  last_sync_at: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  sync_log: any;
}

export function useQBOIntegration() {
  const { company } = useCompany();
  const { toast } = useToast();
  const [integration, setIntegration] = useState<QBOIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const companyId = company?.id;
  const isConnected = !!integration?.connected_at;

  const fetchIntegration = useCallback(async () => {
    if (!companyId) {
      setIntegration(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('company_id', companyId)
        .eq('provider', 'quickbooks')
        .maybeSingle();

      if (error) throw error;
      setIntegration(data as QBOIntegration | null);
    } catch (e) {
      if (import.meta.env.DEV) console.error('Error loading QBO integration:', e);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchIntegration();
  }, [fetchIntegration]);

  // Realtime subscription
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('qbo-integration-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'integrations',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          fetchIntegration();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, fetchIntegration]);

  const connectQBO = async () => {
    if (!companyId) return;
    const edgeFunctionUrl = `https://qsedjxegavrwomflakjq.supabase.co/functions/v1/qbo-auth/connect?company_id=${companyId}`;
    window.location.href = edgeFunctionUrl;
  };
  }, [companyId]);

  const syncNow = useCallback(async () => {
    if (!companyId) return;
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('qbo-sync', {
        body: { action: 'sync_all', company_id: companyId },
      });

      if (error) throw error;

      toast({
        title: 'Sincronización completada',
        description: 'Los datos de QuickBooks se sincronizaron correctamente.',
      });
    } catch (e: any) {
      toast({
        title: 'Error de sincronización',
        description: e.message || 'No se pudo sincronizar con QuickBooks.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [companyId, toast]);

  const disconnect = useCallback(async () => {
    if (!companyId || !integration) return;
    try {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', integration.id);

      if (error) throw error;

      setIntegration(null);
      toast({
        title: 'QuickBooks desconectado',
        description: 'La integración fue eliminada correctamente.',
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || 'No se pudo desconectar QuickBooks.',
        variant: 'destructive',
      });
    }
  }, [companyId, integration, toast]);

  return {
    integration,
    isConnected,
    isLoading,
    isSyncing,
    connectQBO,
    syncNow,
    disconnect,
  };
}
