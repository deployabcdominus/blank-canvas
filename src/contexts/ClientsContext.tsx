import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { logAudit } from '@/lib/audit';
import { resolveCompanyId } from '@/lib/resolve-company';

export interface Client {
  id: string;
  companyId: string;
  clientName: string;
  contactName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  address: string | null;
  website: string | null;
  serviceType: string | null;
  notes: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ClientsContextType {
  clients: Client[];
  loading: boolean;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Omit<Client, 'id' | 'companyId'>>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  refreshClients: () => Promise<void>;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export const useClients = () => {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error('useClients must be used within ClientsProvider');
  return ctx;
};

/** Safe version that returns empty defaults if used outside provider */
export const useClientsSafe = () => {
  const ctx = useContext(ClientsContext);
  return ctx ?? { clients: [], loading: false, addClient: async () => { throw new Error('No ClientsProvider'); }, updateClient: async () => {}, deleteClient: async () => {}, refreshClients: async () => {} } as ClientsContextType;
};

const mapRow = (row: any): Client => ({
  id: row.id,
  companyId: row.company_id,
  clientName: row.client_name,
  contactName: row.contact_name || null,
  primaryEmail: row.primary_email,
  primaryPhone: row.primary_phone,
  address: row.address || null,
  website: row.website || null,
  serviceType: row.service_type || null,
  notes: row.notes,
  logoUrl: row.logo_url ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const ClientsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    return resolveCompanyId(user.id);
  }, [user]);

  const fetchClients = useCallback(async () => {
    if (!user) { setClients([]); setLoading(false); return; }
    const { data, error } = await (supabase as any)
      .from('clients')
      .select('id, company_id, client_name, contact_name, primary_email, primary_phone, address, website, service_type, notes, logo_url, created_at, updated_at')
      .order('client_name', { ascending: true });
    if (error) console.error('Error loading clients:', error);
    else setClients((data || []).map(mapRow));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>): Promise<Client> => {
    const companyId = await getCompanyId();
    if (!companyId) throw new Error('No company found');
    const { data, error } = await (supabase as any)
      .from('clients')
      .insert({
        company_id: companyId,
        client_name: client.clientName,
        contact_name: client.contactName || '',
        primary_email: client.primaryEmail,
        primary_phone: client.primaryPhone,
        address: client.address || '',
        website: client.website || '',
        service_type: client.serviceType || '',
        notes: client.notes,
        logo_url: client.logoUrl,
      })
      .select()
      .single();
    if (error) throw error;
    const newClient = mapRow(data);
    setClients(prev => [...prev, newClient].sort((a, b) => a.clientName.localeCompare(b.clientName)));
    logAudit({ action: 'creado', entityType: 'cliente', entityId: newClient.id, entityLabel: newClient.clientName });
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'companyId'>>) => {
    const dbUpdates: any = {};
    if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
    if (updates.contactName !== undefined) dbUpdates.contact_name = updates.contactName;
    if (updates.primaryEmail !== undefined) dbUpdates.primary_email = updates.primaryEmail;
    if (updates.primaryPhone !== undefined) dbUpdates.primary_phone = updates.primaryPhone;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.website !== undefined) dbUpdates.website = updates.website;
    if (updates.serviceType !== undefined) dbUpdates.service_type = updates.serviceType;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
    const { error } = await (supabase as any).from('clients').update(dbUpdates).eq('id', id);
    if (error) throw error;
    const client = clients.find(c => c.id === id);
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    logAudit({ action: 'editado', entityType: 'cliente', entityId: id, entityLabel: client?.clientName, details: dbUpdates });
  };

  const deleteClient = async (id: string) => {
    const { error } = await (supabase as any).from('clients').delete().eq('id', id);
    if (error) throw error;
    const client = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    logAudit({ action: 'eliminado', entityType: 'cliente', entityId: id, entityLabel: client?.clientName });
  };

  return (
    <ClientsContext.Provider value={{ clients, loading, addClient, updateClient, deleteClient, refreshClients: fetchClients }}>
      {children}
    </ClientsContext.Provider>
  );
};
