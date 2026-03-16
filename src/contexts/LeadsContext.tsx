import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logAudit } from '@/lib/audit';

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

const mapRow = (item: any): Lead => ({
  id: item.id,
  name: item.name,
  company: item.company || '',
  service: item.service || '',
  status: item.status || 'Nuevo',
  contact: {
    phone: item.phone || '',
    email: item.email || '',
    location: item.location || ''
  },
  value: item.value || '',
  daysAgo: Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)),
  source: item.source || undefined,
  notes: item.notes || undefined,
  website: item.website || undefined,
  logoUrl: item.logo_url || undefined,
  companyId: item.company_id || undefined,
  createdByUserId: item.created_by_user_id || undefined,
  assignedToUserId: item.assigned_to_user_id || undefined,
  clientId: item.client_id || undefined,
  projectId: item.project_id || undefined,
});

interface LeadsProviderProps {
  children: ReactNode;
}

export const LeadsProvider: React.FC<LeadsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  const fetchPage = useCallback(async (pageNum: number, append = false) => {
    if (!user) { setLeads([]); setLoading(false); return; }
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from('leads')
      .select('id, name, company, service, status, phone, email, location, value, source, notes, website, logo_url, company_id, created_by_user_id, assigned_to_user_id, client_id, project_id, created_at', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(from, to);

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

  // Fetch user's company_id for multi-tenant inserts
  const getCompanyId = async (): Promise<string | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .maybeSingle();
    return data?.company_id || null;
  };

  const addLead = async (lead: Omit<Lead, 'id'>) => {
    if (!user) return;

    const companyId = await getCompanyId();

    const { data, error } = await supabase
      .from('leads')
      .insert({
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
      } as any)
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) console.error('Error adding lead:', error);
      throw error;
    }

    if (data) {
      const newLead = mapRow(data);
      setLeads(prev => [newLead, ...prev]);
      setTotalCount(prev => prev + 1);
      logAudit({ action: 'creado', entityType: 'lead', entityId: newLead.id, entityLabel: newLead.name });
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

    const { error } = await supabase.from('leads').update(dbUpdates).eq('id', id);
    if (error) throw error;
    const lead = leads.find(l => l.id === id);
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    const auditAction = updates.status ? 'cambio_estado' as const : 'editado' as const;
    logAudit({ action: auditAction, entityType: 'lead', entityId: id, entityLabel: lead?.name, details: updates.status ? { before: lead?.status, after: updates.status } : dbUpdates });
  };

  const assignLead = async (leadId: string, assignedToUserId: string | null) => {
    if (!user) return;
    const { error } = await supabase
      .from('leads')
      .update({ assigned_to_user_id: assignedToUserId } as any)
      .eq('id', leadId);
    if (error) throw error;
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, assignedToUserId: assignedToUserId || undefined } : l));
  };

  const deleteLead = async (id: string) => {
    if (!user) return;
    const lead = leads.find(l => l.id === id);
    const { error } = await supabase.from('leads').update({ deleted_at: new Date().toISOString() } as any).eq('id', id);
    if (error) throw error;
    setLeads(prev => prev.filter(l => l.id !== id));
    setTotalCount(prev => prev - 1);
    logAudit({ action: 'eliminado', entityType: 'lead', entityId: id, entityLabel: lead?.name });
  };

  const deleteLeads = async (ids: string[]) => {
    if (!user || ids.length === 0) return;
    const { error } = await supabase.from('leads').update({ deleted_at: new Date().toISOString() } as any).in('id', ids);
    if (error) throw error;
    setLeads(prev => prev.filter(l => !ids.includes(l.id)));
    setTotalCount(prev => prev - ids.length);
    logAudit({ action: 'eliminado', entityType: 'lead', entityId: ids[0], entityLabel: `${ids.length} leads`, details: { count: ids.length } });
  };

  const clearLeads = async () => {
    if (!user) return;
    const companyId = await getCompanyId();
    const filterCol = companyId ? 'company_id' : 'user_id';
    const filterVal = companyId || user.id;

    const { error } = await supabase
      .from('leads')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq(filterCol, filterVal)
      .is('deleted_at', null);

    if (error) throw error;
    setLeads([]);
    setTotalCount(0);
  };

  const restoreLead = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('leads').update({ deleted_at: null } as any).eq('id', id);
    if (error) throw error;
    // Refresh to pick it up
    await refreshLeadsInternal();
  };

  const permanentDeleteLead = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw error;
  };

  const fetchDeletedLeads = async (): Promise<Lead[]> => {
    const { data, error } = await supabase
      .from('leads')
      .select('id, name, company, service, status, phone, email, location, value, source, notes, website, logo_url, company_id, created_by_user_id, assigned_to_user_id, client_id, project_id, created_at, deleted_at')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapRow);
  };

  const refreshLeadsInternal = useCallback(async () => {
    setPage(0);
    await fetchPage(0);
  }, [fetchPage]);

  const refreshLeads = refreshLeadsInternal;

  return (
    <LeadsContext.Provider value={{ leads, setLeads, addLead, updateLead, assignLead, deleteLead, deleteLeads, clearLeads, restoreLead, permanentDeleteLead, fetchDeletedLeads, refreshLeads, loading, totalCount, hasMore, loadMore }}>
      {children}
    </LeadsContext.Provider>
  );
};
