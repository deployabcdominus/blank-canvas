import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveCompanyId } from '@/lib/resolve-company';
import { LeadsService, LeadRow } from '@/services/leads.service';

export interface Lead {
  id: string;
  name: string;
  company: string;
  service: string;
  status: string;
  contact: {
    phone: string;
    email: string;
    location: string;
  };
  value: string;
  daysAgo: number;
  source?: string;
  notes?: string;
  website?: string;
  logoUrl?: string;
  companyId?: string;
  createdByUserId?: string;
  assignedToUserId?: string;
  clientId?: string;
  projectId?: string;
  /** Resolved client name (from clients table when linked) */
  resolvedName?: string;
  resolvedCompany?: string;
}

interface LeadsContextType {
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Omit<Lead, 'id'>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  assignLead: (leadId: string, assignedToUserId: string | null) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  deleteLeads: (ids: string[]) => Promise<void>;
  clearLeads: () => Promise<void>;
  restoreLead: (id: string) => Promise<void>;
  permanentDeleteLead: (id: string) => Promise<void>;
  fetchDeletedLeads: () => Promise<Lead[]>;
  refreshLeads: () => Promise<void>;
  loading: boolean;
  totalCount: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};

const PAGE_SIZE = 500;

const mapRow = (item: any): Lead => {
  // When a lead is linked to a client, client data is the source of truth
  const client = item.clients;
  const hasClient = !!client && !!item.client_id;

  return {
    id: item.id,
    name: hasClient ? (client.contact_name || client.client_name || item.name) : item.name,
    company: hasClient ? (client.client_name || item.company || '') : (item.company || ''),
    service: item.service || '',
    status: item.status || 'Nuevo',
    contact: {
      phone: hasClient ? (client.primary_phone || item.phone || '') : (item.phone || ''),
      email: hasClient ? (client.primary_email || item.email || '') : (item.email || ''),
      location: hasClient ? (client.address || item.location || '') : (item.location || ''),
    },
    value: item.value || '',
    daysAgo: Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)),
    source: item.source || undefined,
    notes: item.notes || undefined,
    website: hasClient ? (client.website || item.website || undefined) : (item.website || undefined),
    logoUrl: hasClient ? (client.logo_url || item.logo_url || undefined) : (item.logo_url || undefined),
    companyId: item.company_id || undefined,
    createdByUserId: item.created_by_user_id || undefined,
    assignedToUserId: item.assigned_to_user_id || undefined,
    clientId: item.client_id || undefined,
    projectId: item.project_id || undefined,
    resolvedName: hasClient ? (client.contact_name || client.client_name) : undefined,
    resolvedCompany: hasClient ? client.client_name : undefined,
  };
};

interface LeadsProviderProps {
  children: ReactNode;
}

export const LeadsProvider: React.FC<LeadsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  const getCompanyId = async (): Promise<string | null> => {
    if (!user) return null;
    return resolveCompanyId(user.id);
  };

  const fetchPage = useCallback(async (pageNum: number, append = false) => {
    if (!user) { setLeads([]); setLoading(false); return; }
    
    const companyId = await getCompanyId();
    if (!companyId) {
      setLeads([]);
      setLoading(false);
      return;
    }

    const { data, error, count } = await LeadsService.getAll(companyId, pageNum, PAGE_SIZE);

    if (error) {
      if (import.meta.env.DEV) console.error('Error loading leads:', error);
    } else {
      const mapped = (data || []).map(mapRow);
      setLeads(prev => append ? [...prev, ...mapped] : mapped);
      if (count !== null) setTotalCount(count);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    setPage(0);
    fetchPage(0);
  }, [user, fetchPage]);

  const hasMore = leads.length < totalCount;

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchPage(nextPage, true);
  }, [page, fetchPage]);

  const addLead = async (lead: Omit<Lead, 'id'>) => {
    if (!user) return;

    const companyId = await getCompanyId();
    if (!companyId) return;

    const { data, error } = await LeadsService.create({
      user_id: user.id,
      company_id: companyId,
      created_by_user_id: user.id,
      name: lead.name,
      company: lead.company,
      service: lead.service,
      status: lead.status,
      phone: lead.contact.phone,
      email: lead.contact.email,
      location: lead.contact.location,
      value: lead.value,
      website: lead.website,
      logo_url: lead.logoUrl
    });

    if (error) {
      if (import.meta.env.DEV) console.error('Error adding lead:', error);
      throw error;
    }

    if (data) {
      const newLead = mapRow(data);
      setLeads(prev => [newLead, ...prev]);
      setTotalCount(prev => prev + 1);
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    if (!user) return;
    
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.company !== undefined) dbUpdates.company = updates.company;
    if (updates.service !== undefined) dbUpdates.service = updates.service;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.value !== undefined) dbUpdates.value = updates.value;
    if (updates.source !== undefined) dbUpdates.source = updates.source;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
    if ((updates as any).clientId !== undefined) dbUpdates.client_id = (updates as any).clientId;
    if ((updates as any).projectId !== undefined) dbUpdates.project_id = (updates as any).projectId;
    
    if (updates.contact) {
      if (updates.contact.phone !== undefined) dbUpdates.phone = updates.contact.phone;
      if (updates.contact.email !== undefined) dbUpdates.email = updates.contact.email;
      if (updates.contact.location !== undefined) dbUpdates.location = updates.contact.location;
    }

    const { error } = await LeadsService.update(id, dbUpdates);
    if (error) throw error;
    
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const assignLead = async (leadId: string, assignedToUserId: string | null) => {
    if (!user) return;
    const { error } = await LeadsService.update(leadId, { assigned_to_user_id: assignedToUserId });
    if (error) throw error;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedToUserId: assignedToUserId || undefined } : l));
  };

  const deleteLead = async (id: string) => {
    if (!user) return;
    const { error } = await LeadsService.softDelete(id);
    if (error) throw error;
    setLeads(prev => prev.filter(l => l.id !== id));
    setTotalCount(prev => prev - 1);
  };

  const deleteLeads = async (ids: string[]) => {
    if (!user || ids.length === 0) return;
    const { error } = await LeadsService.softDeleteBatch(ids);
    if (error) throw error;
    setLeads(prev => prev.filter(l => !ids.includes(l.id)));
    setTotalCount(prev => prev - ids.length);
  };

  const clearLeads = async () => {
    if (!user) return;
    const companyId = await getCompanyId();
    if (!companyId) return;

    const { error } = await LeadsService.clearAll(companyId);

    if (error) throw error;
    setLeads([]);
    setTotalCount(0);
  };

  const restoreLead = async (id: string) => {
    if (!user) return;
    const { error } = await LeadsService.restore(id);
    if (error) throw error;
    await refreshLeads();
  };

  const permanentDeleteLead = async (id: string) => {
    if (!user) return;
    const { error } = await LeadsService.permanentDelete(id);
    if (error) throw error;
  };

  const fetchDeletedLeads = async (): Promise<Lead[]> => {
    const companyId = await getCompanyId();
    if (!companyId) return [];

    const { data, error } = await LeadsService.getDeleted(companyId);
    if (error) throw error;
    return (data || []).map(mapRow);
  };

  const refreshLeads = useCallback(async () => {
    setPage(0);
    await fetchPage(0);
  }, [fetchPage]);

  return (
    <LeadsContext.Provider value={{ leads, setLeads, addLead, updateLead, assignLead, deleteLead, deleteLeads, clearLeads, restoreLead, permanentDeleteLead, fetchDeletedLeads, refreshLeads, loading, totalCount, hasMore, loadMore }}>
      {children}
    </LeadsContext.Provider>
  );
};
