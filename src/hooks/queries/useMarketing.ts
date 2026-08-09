import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MarketingCampaign, ReferralProgram } from "@/types/marketing";

export const useMarketing = (companyId: string | null) => {
  const campaigns = useQuery({
    queryKey: ['marketing-campaigns', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('marketing_campaigns' as any)
        .select('*')
        .eq('company_id', companyId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as MarketingCampaign[];
    },
    enabled: !!companyId
  });

  const referralPrograms = useQuery({
    queryKey: ['referral-programs', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      const { data, error } = await supabase
        .from('referral_programs' as any)
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'active');
      
      if (error) throw error;
      return (data || []) as unknown as ReferralProgram[];
    },
    enabled: !!companyId
  });

  return {
    campaigns: campaigns.data || [],
    isLoadingCampaigns: campaigns.isLoading,
    referralPrograms: referralPrograms.data || [],
    isLoadingReferrals: referralPrograms.isLoading
  };
};
