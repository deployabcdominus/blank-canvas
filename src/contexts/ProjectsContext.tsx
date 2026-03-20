import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { resolveCompanyId } from '@/lib/resolve-company';

export type ProjectStatus = 'Lead' | 'Proposal' | 'Production' | 'Installation' | 'Completed';

export interface Project {
  id: string;
  companyId: string;
  clientId: string;
  projectName: string;
  installAddress: string;
  status: ProjectStatus;
  ownerUserId: string;
  assignedToUserId: string | null;
  folderRelativePath: string | null;
  folderFullPath: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined
  clientName?: string;
}

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'clientName'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'companyId'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectsProvider');
  return ctx;
};

const mapRow = (row: any): Project => {
  // Source of truth: client name from joined clients table
  // Fallback: lead company name via leads join
  const clientName = row.clients?.client_name
    || row.leads?.[0]?.company
    || row.leads?.[0]?.name
    || undefined;

  return {
    id: row.id,
    companyId: row.company_id,
    clientId: row.client_id,
    projectName: row.project_name,
    installAddress: row.install_address || '',
    status: row.status || 'Lead',
    ownerUserId: row.owner_user_id,
    assignedToUserId: row.assigned_to_user_id,
    folderRelativePath: row.folder_relative_path,
    folderFullPath: row.folder_full_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    clientName,
  };
};

export const ProjectsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    return resolveCompanyId(user.id);
  }, [user]);

  const fetchProjects = useCallback(async () => {
    if (!user) { setProjects([]); setLoading(false); return; }
    const { data, error } = await (supabase as any)
      .from('projects')
      .select('id, company_id, client_id, project_name, install_address, status, owner_user_id, assigned_to_user_id, folder_relative_path, folder_full_path, created_at, updated_at, clients!projects_client_id_fkey(client_name), leads!leads_project_id_fkey(name, company)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) console.error('Error loading projects:', error);
    else setProjects((data || []).map(mapRow));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Realtime subscription for projects, clients, and proposals
  useEffect(() => {
    if (!user) return;
    const debounceRef = { current: null as ReturnType<typeof setTimeout> | null };

    const handleChange = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchProjects(), 500);
    };

    const channel = supabase
      .channel('projects-realtime')
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "projects" }, handleChange)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "clients" }, handleChange)
      .on("postgres_changes" as any, { event: "UPDATE", schema: "public", table: "proposals" }, handleChange)
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [user, fetchProjects]);

  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'clientName'>): Promise<Project> => {
    const companyId = await getCompanyId();
    if (!companyId) throw new Error('No company found');
    const { data, error } = await (supabase as any)
      .from('projects')
      .insert({
        company_id: companyId,
        client_id: project.clientId,
        project_name: project.projectName,
        install_address: project.installAddress,
        status: project.status,
        owner_user_id: project.ownerUserId,
        assigned_to_user_id: project.assignedToUserId,
        folder_relative_path: project.folderRelativePath,
        folder_full_path: project.folderFullPath,
      })
      .select('*, clients!projects_client_id_fkey(client_name)')
      .single();
    if (error) throw error;
    const newProject = mapRow(data);
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'companyId'>>) => {
    const dbUpdates: any = {};
    if (updates.projectName !== undefined) dbUpdates.project_name = updates.projectName;
    if (updates.installAddress !== undefined) dbUpdates.install_address = updates.installAddress;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.assignedToUserId !== undefined) dbUpdates.assigned_to_user_id = updates.assignedToUserId;
    if (updates.folderRelativePath !== undefined) dbUpdates.folder_relative_path = updates.folderRelativePath;
    if (updates.folderFullPath !== undefined) dbUpdates.folder_full_path = updates.folderFullPath;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
    const { error } = await (supabase as any).from('projects').update(dbUpdates).eq('id', id);
    if (error) throw error;
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = async (id: string) => {
    const { error } = await (supabase as any).from('projects').delete().eq('id', id);
    if (error) {
      if (error.message?.includes('órdenes de trabajo activas')) {
        throw new Error('No se puede eliminar: este proyecto tiene órdenes de trabajo activas. Complete o cancele las órdenes primero.');
      }
      throw error;
    }
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ProjectsContext.Provider value={{ projects, loading, addProject, updateProject, deleteProject, refreshProjects: fetchProjects }}>
      {children}
    </ProjectsContext.Provider>
  );
};
