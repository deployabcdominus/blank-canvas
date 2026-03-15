import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CompanyData {
  id: string;
  name: string;
  logo_url: string | null;
  brand_color: string | null;
  enable_network_index: boolean;
  network_base_path: string | null;
  service_types: string[] | null;
  industry: string | null;
  plan_id: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  subscription_end_date: string | null;
}

export function useCompany() {
  const { user } = useAuth();
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompany = useCallback(async () => {
    if (!user) {
      setCompany(null);
      setLoading(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.company_id) {
        const { data: companyData } = await (supabase as any)
          .from('companies')
          .select('id, name, logo_url, brand_color, enable_network_index, network_base_path, service_types, industry, plan_id')
          .eq('id', profile.company_id)
          .maybeSingle();

        setCompany(companyData as CompanyData | null);
      } else {
        setCompany(null);
      }
    } catch (e) {
      console.error('Error loading company:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const updateCompanyName = async (newName: string) => {
    if (!company) throw new Error('No company found');
    
    const { error } = await supabase
      .from('companies')
      .update({ name: newName })
      .eq('id', company.id);

    if (error) {
      if (error.message?.includes('row-level security')) {
        throw new Error('Solo el administrador puede cambiar el nombre de la empresa.');
      }
      throw error;
    }

    setCompany(prev => prev ? { ...prev, name: newName } : null);
  };

  const updateCompanySettings = async (updates: { enable_network_index?: boolean; network_base_path?: string | null; service_types?: string[] }) => {
    if (!company) throw new Error('No company found');
    const { error } = await supabase.from('companies').update(updates as any).eq('id', company.id);
    if (error) throw error;
    setCompany(prev => prev ? { ...prev, ...updates } : null);
  };

  return { company, loading, updateCompanyName, updateCompanySettings, refetch: fetchCompany };
}
