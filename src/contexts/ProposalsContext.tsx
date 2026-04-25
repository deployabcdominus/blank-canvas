import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveCompanyId } from '@/lib/resolve-company';
import { ProposalsService, ProposalRow, ProposalUpdate } from '@/services/proposals.service';

export type ProposalStatus = 'Borrador' | 'Enviada externamente' | 'Aprobada' | 'Rechazada';
export type SentMethod = 'Gmail' | 'WhatsApp' | 'PDF físico' | 'Otro';

export interface ProposalLead {
  name: string;
  company: string;
  logoUrl: string | null;
  /** Client data when lead is linked to a client */
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
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
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'approvalToken' | 'hasOrder'>) => Promise<void>;
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

type ProposalWithRelations = ProposalRow & {
  leads?: {
    name: string;
    company: string | null;
    logo_url: string | null;
    clients?: {
      client_name: string;
      contact_name: string | null;
      logo_url: string | null;
      primary_phone: string | null;
      primary_email: string | null;
    } | null;
  } | null;
};

const mapRow = (row: ProposalWithRelations, orderProposalIds: Set<string>): Proposal => {
  const leadData = row.leads;
  const clientData = leadData?.clients;
  // If the lead is linked to a client, use client data as source of truth
  const resolvedClient = clientData
    ? clientData.client_name || row.client
    : row.client;

  return {
    id: row.id,
    client: resolvedClient,
    project: row.project,
    value: Number(row.value),
    description: row.description || '',
    status: row.status as ProposalStatus,
    sentDate: row.sent_date,
    sentMethod: row.sent_method as SentMethod | null,
    createdAt: row.created_at,
    updatedAt: row.updated_at || null,
    leadId: row.lead_id || null,
    lead: leadData ? {
      name: clientData?.contact_name || clientData?.client_name || leadData.name,
      company: clientData?.client_name || leadData.company || '',
      logoUrl: clientData?.logo_url || leadData.logo_url || null,
      clientName: clientData?.client_name || undefined,
      clientPhone: clientData?.primary_phone || undefined,
      clientEmail: clientData?.primary_email || undefined,
    } : null,
    approvedTotal: row.approved_total != null ? Number(row.approved_total) : null,
    approvedAt: row.approved_at || null,
    approvalToken: row.approval_token || null,
    mockupUrl: row.mockup_url || null,
    hasOrder: orderProposalIds.has(row.id),
  };
};

export const ProposalsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    if (!user) { setProposals([]); setLoading(false); return; }
    try {
      const companyId = await resolveCompanyId(user.id);
      if (!companyId) return;

      const { proposals: rawProposals, orders, error } = await ProposalsService.getAll(companyId);
      
      if (error) throw error;
      
      const orderProposalIds = new Set<string>(
        (orders || []).map(o => o.proposal_id).filter((id): id is string => !!id)
      );
      
      setProposals((rawProposals || []).map(r => mapRow(r as ProposalWithRelations, orderProposalIds)));
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
    return resolveCompanyId(user.id);
  };

  const addProposal = async (proposal: Omit<Proposal, 'id' | 'createdAt' | 'approvalToken' | 'hasOrder'>) => {
    if (!user) return;
    const companyId = await getCompanyId();
    if (!companyId) return;

    const { error } = await ProposalsService.create({
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
    });

    if (error) throw error;
    await fetchProposals();
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

    const { error } = await ProposalsService.update(id, dbUpdates);
    if (error) throw error;
    await fetchProposals();
  };

  const deleteProposal = async (id: string) => {
    if (!user) return;
    const { error } = await ProposalsService.delete(id);
    if (error) throw error;
    await fetchProposals();
  };

  return (
    <ProposalsContext.Provider value={{ proposals, loading, addProposal, updateProposal, deleteProposal, refreshProposals: fetchProposals }}>
      {children}
    </ProposalsContext.Provider>
  );
};
