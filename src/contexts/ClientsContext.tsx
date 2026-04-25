import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveCompanyId } from '@/lib/resolve-company';
import { ClientsService, ClientRow, ClientUpdate } from '@/services/clients.service';

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

const mapRow = (row: ClientRow): Client => ({
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
    const companyId = await getCompanyId();
    if (!companyId) return;

    const { data, error } = await ClientsService.getAll(companyId);
    if (error) console.error('Error loading clients:', error);
    else setClients((data || []).map(mapRow));
    setLoading(false);
  }, [user, getCompanyId]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>): Promise<Client> => {
    const companyId = await getCompanyId();
    if (!companyId) throw new Error('No company found');
    
    const { data, error } = await ClientsService.create({
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
    });
    
    if (error) throw error;
    const newClient = mapRow(data);
    setClients(prev => [...prev, newClient].sort((a, b) => a.clientName.localeCompare(b.clientName)));
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
    
    const { error } = await ClientsService.update(id, dbUpdates);
    if (error) throw error;
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = async (id: string) => {
    const { error } = await ClientsService.delete(id);
    if (error) {
      if (error.message?.includes('proyectos activos')) {
        throw new Error('No se puede eliminar: este cliente tiene proyectos activos. Complete o cancele los proyectos primero.');
      }
      throw error;
    }
    setClients(prev => prev.filter(c => c.id !== id));
  };

  return (
    <ClientsContext.Provider value={{ clients, loading, addClient, updateClient, deleteClient, refreshClients: fetchClients }}>
      {children}
    </ClientsContext.Provider>
  );
};
