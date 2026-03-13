import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  clearLeads: () => Promise<void>;
  loading: boolean;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};

interface LeadsProviderProps {
  children: ReactNode;
}

export const LeadsProvider: React.FC<LeadsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Load leads from Supabase when user changes
  useEffect(() => {
    const loadLeads = async () => {
      if (!user) {
        setLeads([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (import.meta.env.DEV) console.error('Error loading leads:', error);
      } else {
        // Transform data to match the Lead interface
        const transformedLeads: Lead[] = data.map(item => ({
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
          website: item.website || undefined,
          logoUrl: (item as any).logo_url || undefined,
          companyId: (item as any).company_id || undefined,
          createdByUserId: (item as any).created_by_user_id || undefined,
          assignedToUserId: (item as any).assigned_to_user_id || undefined,
          clientId: (item as any).client_id || undefined,
          projectId: (item as any).project_id || undefined,
        }));
        setLeads(transformedLeads);
      }
      setLoading(false);
    };

    loadLeads();
  }, [user]);

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
      const newLead: Lead = {
        id: data.id,
        name: data.name,
        company: data.company || '',
        service: data.service || '',
        status: data.status || 'Nuevo',
        contact: {
          phone: data.phone || '',
          email: data.email || '',
          location: data.location || ''
        },
        value: data.value || '',
        daysAgo: 0,
        website: data.website || undefined,
        logoUrl: (data as any).logo_url || undefined,
        companyId: (data as any).company_id || undefined,
        createdByUserId: (data as any).created_by_user_id || undefined,
        assignedToUserId: (data as any).assigned_to_user_id || undefined,
      };
      setLeads(prev => [newLead, ...prev]);
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
    if ((updates as any).clientId !== undefined) dbUpdates.client_id = (updates as any).clientId;
    if ((updates as any).projectId !== undefined) dbUpdates.project_id = (updates as any).projectId;
    if (updates.contact) {
      if (updates.contact.phone !== undefined) dbUpdates.phone = updates.contact.phone;
      if (updates.contact.email !== undefined) dbUpdates.email = updates.contact.email;
      if (updates.contact.location !== undefined) dbUpdates.location = updates.contact.location;
    }

    const { error } = await supabase.from('leads').update(dbUpdates).eq('id', id);
    if (error) throw error;
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
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

  const clearLeads = async () => {
    if (!user) return;

    const companyId = await getCompanyId();
    const filterCol = companyId ? 'company_id' : 'user_id';
    const filterVal = companyId || user.id;

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq(filterCol, filterVal);

    if (error) {
      if (import.meta.env.DEV) console.error('Error clearing leads:', error);
      throw error;
    }

    setLeads([]);
  };

  return (
    <LeadsContext.Provider value={{ leads, setLeads, addLead, updateLead, assignLead, clearLeads, loading }}>
      {children}
    </LeadsContext.Provider>
  );
};