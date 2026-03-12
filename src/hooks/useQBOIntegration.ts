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
    // Disabled – coming soon
    return;
  };

  const syncNow = async () => {
    // Disabled – coming soon
    return;
  };

  const disconnect = async () => {
    // Disabled – coming soon
    return;
  };

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
