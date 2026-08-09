export interface MarketingCampaign {
  id: string;
  company_id: string;
  name: string;
  type: 'email' | 'push' | 'sms' | 'referral';
  status: 'draft' | 'active' | 'completed';
  template_id?: string;
  targeting_criteria: any;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ReferralProgram {
  id: string;
  company_id: string;
  name: string;
  reward_type: 'discount' | 'credit' | 'gift';
  reward_value: number;
  status: 'active' | 'inactive';
  created_at: string;
}
