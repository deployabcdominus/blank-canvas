import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logAudit } from '@/lib/audit';

export type ProposalStatus = 'Borrador' | 'Enviada externamente' | 'Aprobada' | 'Rechazada';
export type SentMethod = 'Gmail' | 'WhatsApp' | 'PDF físico' | 'Otro';

export interface ProposalLead {
  name: string;
  company: string;
  logoUrl: string | null;
}

export interface Proposal {
  id: string;
  client: string;
  project: string;
  value: number;
  description: string;
  status: ProposalStatus;
  sentDate: string | null;
  sentMethod: SentMethod | null;
  createdAt: string;
  updatedAt: string | null;
  leadId: string | null;
  lead: ProposalLead | null;
  approvedTotal: number | null;
  approvedAt: string | null;
  approvalToken: string | null;
  mockupUrl: string | null;
  hasOrder: boolean;
}

interface ProposalsContextType {
  proposals: Proposal[];
  loading: boolean;
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'approvalToken'>) => Promise<void>;
  updateProposal: (id: string, proposal: Partial<Proposal>) => Promise<void>;
  deleteProposal: (id: string) => Promise<void>;
  refreshProposals: () => Promise<void>;
}

const ProposalsContext = createContext<ProposalsContextType | undefined>(undefined);

export const useProposals = () => {
  const context = useContext(ProposalsContext);
  if (!context) {
    throw new Error('useProposals must be used within a ProposalsProvider');
  }
  return context;
};

const mapRow = (row: any, orderProposalIds: Set<string>): Proposal => ({
  id: row.id,
  client: row.client,
  project: row.project,
  value: Number(row.value),
  description: row.description || '',
  status: row.status as ProposalStatus,
  sentDate: row.sent_date,
  sentMethod: row.sent_method as SentMethod | null,
  createdAt: row.created_at,
  updatedAt: row.updated_at || null,
  leadId: row.lead_id || null,
  lead: row.leads ? {
    name: row.leads.name,
    company: row.leads.company || '',
    logoUrl: row.leads.logo_url || null,
  } : null,
  approvedTotal: row.approved_total != null ? Number(row.approved_total) : null,
  approvedAt: row.approved_at || null,
  approvalToken: row.approval_token || null,
  mockupUrl: row.mockup_url || null,
  hasOrder: orderProposalIds.has(row.id),
});

export const ProposalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    if (!user) { setProposals([]); setLoading(false); return; }
    try {
      const { data, error } = await (supabase
        .from('proposals')
        .select('*, leads(name, company, logo_url)')
        .order('created_at', { ascending: false }) as any);
      if (error) throw error;
      setProposals((data || []).map(mapRow));
    } catch (e) {
      console.error('Error fetching proposals:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user]);

  const getCompanyId = async (): Promise<string | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .maybeSingle();
    return data?.company_id || null;
  };

  const addProposal = async (proposal: Omit<Proposal, 'id' | 'createdAt' | 'approvalToken'>) => {
    if (!user) return;
    const companyId = await getCompanyId();
    const { error } = await supabase.from('proposals').insert({
      user_id: user.id,
      company_id: companyId,
      owner_user_id: user.id,
      client: proposal.client,
      project: proposal.project,
      value: proposal.value,
      description: proposal.description,
      status: proposal.status,
      sent_date: proposal.sentDate,
      sent_method: proposal.sentMethod,
      lead_id: proposal.leadId || null,
    } as any);
    if (error) throw error;
    await fetchProposals();
    logAudit({ action: 'creado', entityType: 'propuesta', entityLabel: proposal.client });
  };

  const updateProposal = async (id: string, updates: Partial<Proposal>) => {
    if (!user) return;
    const dbUpdates: any = {};
    if (updates.client !== undefined) dbUpdates.client = updates.client;
    if (updates.project !== undefined) dbUpdates.project = updates.project;
    if (updates.value !== undefined) dbUpdates.value = updates.value;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.sentDate !== undefined) dbUpdates.sent_date = updates.sentDate;
    if (updates.sentMethod !== undefined) dbUpdates.sent_method = updates.sentMethod;

    const { error } = await supabase.from('proposals').update(dbUpdates).eq('id', id);
    if (error) throw error;
    const prop = proposals.find(p => p.id === id);
    const auditAction = updates.status === 'Aprobada' ? 'aprobado' as const : updates.status ? 'cambio_estado' as const : 'editado' as const;
    logAudit({ action: auditAction, entityType: 'propuesta', entityId: id, entityLabel: prop?.client, details: updates.status ? { before: prop?.status, after: updates.status } : dbUpdates });
    await fetchProposals();
  };

  const deleteProposal = async (id: string) => {
    if (!user) return;
    const prop = proposals.find(p => p.id === id);
    const { error } = await supabase.from('proposals').delete().eq('id', id);
    if (error) throw error;
    logAudit({ action: 'eliminado', entityType: 'propuesta', entityId: id, entityLabel: prop?.client });
    await fetchProposals();
  };

  return (
    <ProposalsContext.Provider value={{ proposals, loading, addProposal, updateProposal, deleteProposal, refreshProposals: fetchProposals }}>
      {children}
    </ProposalsContext.Provider>
  );
};
