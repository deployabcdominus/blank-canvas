import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { resolveCompanyId } from "@/lib/resolve-company";

export interface Installation {
  id: string;
  client: string;
  project: string;
  status: "Scheduled" | "In Progress" | "Completed";
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  technician: string;
  notes: string;
  projectId: string | null;
}

interface InstallationsContextType {
  installations: Installation[];
  loading: boolean;
  addInstallation: (installation: Omit<Installation, "id">) => Promise<void>;
  updateInstallation: (id: string, updates: Partial<Installation>) => Promise<void>;
  deleteInstallation: (id: string) => Promise<void>;
  clearInstallations: () => Promise<void>;
  refreshInstallations: () => Promise<void>;
}

const InstallationsContext = createContext<InstallationsContextType | undefined>(undefined);

export const useInstallations = () => {
  const context = useContext(InstallationsContext);
  if (context === undefined) {
    throw new Error("useInstallations must be used within an InstallationsProvider");
  }
  return context;
};

const mapRow = (row: any): Installation => {
  // Parse scheduled_date into date and time parts
  let scheduledDate = '';
  let scheduledTime = '';
  if (row.scheduled_date) {
    const d = new Date(row.scheduled_date);
    scheduledDate = d.toISOString().split('T')[0];
    scheduledTime = d.toTimeString().slice(0, 5);
  }
  return {
    id: row.id,
    client: row.client,
    project: row.project,
    status: row.status === 'Agendada' ? 'Scheduled' :
            row.status === 'En Progreso' ? 'In Progress' :
            row.status === 'Completada' ? 'Completed' :
            (row.status || 'Scheduled') as Installation['status'],
    address: row.location || '',
    scheduledDate,
    scheduledTime,
    technician: row.team || '',
    notes: row.notes || '',
    projectId: row.project_id || null,
  };
};

export const InstallationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [loading, setLoading] = useState(true);

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    return resolveCompanyId(user.id);
  }, [user]);

  const fetchInstallations = useCallback(async () => {
    if (!user) { setInstallations([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from('installations')
      .select('id, client, project, status, location, scheduled_date, team, notes, project_id')
      .order('scheduled_date', { ascending: false });
    if (error) console.error('Error loading installations:', error);
    else setInstallations((data || []).map(mapRow));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchInstallations(); }, [fetchInstallations]);

  const addInstallation = async (installation: Omit<Installation, "id">) => {
    if (!user) throw new Error('Not authenticated');
    const companyId = await getCompanyId();
    // Combine date + time into a single timestamp
    let scheduledDateTime: string | null = null;
    if (installation.scheduledDate) {
      scheduledDateTime = `${installation.scheduledDate}T${installation.scheduledTime || '00:00'}:00`;
    }
    const { error } = await supabase.from('installations').insert({
      user_id: user.id,
      company_id: companyId,
      client: installation.client,
      project: installation.project,
      status: installation.status,
      location: installation.address,
      scheduled_date: scheduledDateTime,
      team: installation.technician,
      notes: installation.notes,
      project_id: installation.projectId || null,
    });
    if (error) throw error;
    await fetchInstallations();
  };

  const updateInstallation = async (id: string, updates: Partial<Installation>) => {
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.client !== undefined) dbUpdates.client = updates.client;
    if (updates.project !== undefined) dbUpdates.project = updates.project;
    if (updates.address !== undefined) dbUpdates.location = updates.address;
    if (updates.technician !== undefined) dbUpdates.team = updates.technician;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.scheduledDate !== undefined || updates.scheduledTime !== undefined) {
      // Need to reconstruct the full timestamp
      const current = installations.find(i => i.id === id);
      const date = updates.scheduledDate ?? current?.scheduledDate ?? '';
      const time = updates.scheduledTime ?? current?.scheduledTime ?? '00:00';
      if (date) dbUpdates.scheduled_date = `${date}T${time}:00`;
    }
    const { error } = await supabase.from('installations').update(dbUpdates).eq('id', id);
    if (error) throw error;
    setInstallations(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteInstallation = async (id: string) => {
    const { error } = await supabase.from('installations').delete().eq('id', id);
    if (error) throw error;
    setInstallations(prev => prev.filter(i => i.id !== id));
  };

  const clearInstallations = async () => {
    if (!user) return;
    const companyId = await getCompanyId();
    const filterCol = companyId ? 'company_id' : 'user_id';
    const filterVal = companyId || user.id;
    const { error } = await supabase.from('installations').delete().eq(filterCol, filterVal);
    if (error) throw error;
    setInstallations([]);
  };

  return (
    <InstallationsContext.Provider
      value={{
        installations,
        loading,
        addInstallation,
        updateInstallation,
        deleteInstallation,
        clearInstallations,
        refreshInstallations: fetchInstallations,
      }}
    >
      {children}
    </InstallationsContext.Provider>
  );
};
