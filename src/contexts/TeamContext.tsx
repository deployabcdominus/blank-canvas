import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface PermissionFlags {
  canViewDashboard: boolean;
  canManageLeads: boolean;
  canManageProposals: boolean;
  canManageProduction: boolean;
  canManageInstallations: boolean;
  canManageTeam: boolean;
  canManageInstallerCompanies: boolean;
  canViewReports: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: PermissionFlags;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  companyId: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Installation {
  id: string;
  client: string;
  project: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
}

export interface Allocation {
  id: string;
  installationId: string;
  memberId: string;
  assignedAt: string;
}

interface TeamContextType {
  roles: Role[];
  addRole: (role: Omit<Role, 'id'>) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  members: TeamMember[];
  addMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteMember: (id: string) => void;
  installations: Installation[];
  addInstallation: (installation: Omit<Installation, 'id'>) => void;
  updateInstallation: (id: string, updates: Partial<Installation>) => void;
  deleteInstallation: (id: string) => void;
  allocations: Allocation[];
  allocateMember: (installationId: string, memberId: string) => void;
  deallocateMember: (installationId: string, memberId: string) => void;
  getMembersForInstallation: (installationId: string) => TeamMember[];
  getInstallationsForMember: (memberId: string) => Installation[];
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

const defaultPermissions: PermissionFlags = {
  canViewDashboard: false,
  canManageLeads: false,
  canManageProposals: false,
  canManageProduction: false,
  canManageInstallations: false,
  canManageTeam: false,
  canManageInstallerCompanies: false,
  canViewReports: false,
};

const defaultRolesData: Omit<Role, 'id'>[] = [
  {
    name: "Administrador",
    description: "Acesso completo ao sistema",
    permissions: {
      canViewDashboard: true, canManageLeads: true, canManageProposals: true,
      canManageProduction: true, canManageInstallations: true, canManageTeam: true,
      canManageInstallerCompanies: true, canViewReports: true,
    }
  },
  {
    name: "Supervisor",
    description: "Gerencia operações e equipe",
    permissions: {
      canViewDashboard: true, canManageLeads: true, canManageProposals: true,
      canManageProduction: true, canManageInstallations: true, canManageTeam: false,
      canManageInstallerCompanies: false, canViewReports: true,
    }
  },
  {
    name: "Instalador",
    description: "Acesso limitado às instalações",
    permissions: {
      canViewDashboard: true, canManageLeads: false, canManageProposals: false,
      canManageProduction: false, canManageInstallations: true, canManageTeam: false,
      canManageInstallerCompanies: false, canViewReports: false,
    }
  }
];

export const TeamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [installations, setInstallations] = useState<Installation[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('company_id').eq('id', user.id).maybeSingle();
    return data?.company_id || null;
  }, [user]);

  // Load data from Supabase
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load roles (RLS now filters by company_id)
        const { data: rolesData, error: rolesError } = await supabase
          .from('team_roles')
          .select('*');

        if (rolesError) throw rolesError;

        if (rolesData && rolesData.length > 0) {
          setRoles(rolesData.map(r => ({
            id: r.id,
            name: r.name || '',
            description: r.description || '',
            permissions: (r.permissions as unknown as PermissionFlags) || defaultPermissions,
          })));
        } else {
          // Seed default roles
          const companyId = await getCompanyId();
          const inserts = defaultRolesData.map(r => ({
            user_id: user.id,
            company_id: companyId,
            name: r.name,
            description: r.description,
            permissions: r.permissions as unknown as Record<string, boolean>,
          }));
          const { data: seeded } = await supabase
            .from('team_roles')
            .insert(inserts as any)
            .select();
          if (seeded) {
            setRoles(seeded.map(r => ({
              id: r.id,
              name: r.name || '',
              description: r.description || '',
              permissions: (r.permissions as unknown as PermissionFlags) || defaultPermissions,
            })));
          }
        }

        // Load members
        const { data: membersData } = await supabase
          .from('team_members')
          .select('*');

        if (membersData) {
          setMembers(membersData.map(m => ({
            id: m.id,
            name: m.name || '',
            role: m.role_id || '',
            companyId: m.company_id || '',
            phone: m.phone || '',
            email: m.email || '',
            createdAt: m.created_at || '',
          })));
        }

        // Load installations for allocation (from main installations table)
        const { data: installData } = await supabase
          .from('installations')
          .select('*');

        if (installData) {
          setInstallations(installData.map(i => ({
            id: i.id,
            client: i.client || '',
            project: i.project || '',
            status: (i.status as Installation['status']) || 'Scheduled',
            address: i.location || '',
            scheduledDate: i.scheduled_date || '',
            scheduledTime: (i as any).scheduled_time || '',
            notes: i.notes || undefined,
          })));
        }

        // Load allocations
        const { data: allocData } = await supabase
          .from('team_allocations')
          .select('*');

        if (allocData) {
          setAllocations(allocData.map(a => ({
            id: a.id,
            installationId: a.installation_id || '',
            memberId: a.member_id || '',
            assignedAt: a.created_at || '',
          })));
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error loading team data:', error);
      }
    };

    loadData();
  }, [user]);

  // Role management
  const addRole = async (role: Omit<Role, 'id'>) => {
    if (!user) return;
    const companyId = await getCompanyId();
    const { data, error } = await supabase
      .from('team_roles')
      .insert({
        user_id: user.id,
        company_id: companyId,
        name: role.name,
        description: role.description,
        permissions: role.permissions as unknown as Record<string, boolean>,
      } as any)
      .select()
      .single();

    if (error) { if (import.meta.env.DEV) console.error('Error adding role:', error); return; }
    if (data) {
      setRoles(prev => [...prev, {
        id: data.id, name: data.name || '', description: data.description || '',
        permissions: (data.permissions as unknown as PermissionFlags) || defaultPermissions,
      }]);
    }
  };

  const updateRole = async (id: string, updates: Partial<Role>) => {
    if (!user) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.permissions !== undefined) dbUpdates.permissions = updates.permissions;

    const { error } = await supabase
      .from('team_roles')
      .update(dbUpdates)
      .eq('id', id);

    if (error) { if (import.meta.env.DEV) console.error('Error updating role:', error); return; }
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRole = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('team_roles')
      .delete()
      .eq('id', id);

    if (error) { if (import.meta.env.DEV) console.error('Error deleting role:', error); return; }
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  // Member management
  const addMember = async (member: Omit<TeamMember, 'id' | 'createdAt'>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        user_id: user.id,
        name: member.name,
        role_id: member.role || null,
        company_id: member.companyId || null,
        phone: member.phone,
        email: member.email,
      })
      .select()
      .single();

    if (error) { if (import.meta.env.DEV) console.error('Error adding member:', error); return; }
    if (data) {
      setMembers(prev => [...prev, {
        id: data.id, name: data.name || '', role: data.role_id || '',
        companyId: data.company_id || '', phone: data.phone || '',
        email: data.email || '', createdAt: data.created_at || '',
      }]);
    }
  };

  const updateMember = async (id: string, updates: Partial<TeamMember>) => {
    if (!user) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.role !== undefined) dbUpdates.role_id = updates.role;
    if (updates.companyId !== undefined) dbUpdates.company_id = updates.companyId;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.email !== undefined) dbUpdates.email = updates.email;

    const { error } = await supabase
      .from('team_members')
      .update(dbUpdates)
      .eq('id', id);

    if (error) { if (import.meta.env.DEV) console.error('Error updating member:', error); return; }
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMember = async (id: string) => {
    if (!user) return;
    // Delete allocations for this member first
    await supabase
      .from('team_allocations')
      .delete()
      .eq('member_id', id);

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) { if (import.meta.env.DEV) console.error('Error deleting member:', error); return; }
    setMembers(prev => prev.filter(m => m.id !== id));
    setAllocations(prev => prev.filter(a => a.memberId !== id));
  };

  // Installation management (reads from installations table, managed by InstallationsContext)
  const addInstallation = (_installation: Omit<Installation, 'id'>) => {
    // Installations are managed via InstallationsContext
  };

  const updateInstallation = (_id: string, _updates: Partial<Installation>) => {
    // Installations are managed via InstallationsContext
  };

  const deleteInstallation = (_id: string) => {
    // Installations are managed via InstallationsContext
  };

  // Allocation management
  const allocateMember = async (installationId: string, memberId: string) => {
    if (!user) return;
    const exists = allocations.some(
      a => a.installationId === installationId && a.memberId === memberId
    );
    if (exists) return;

    const companyId = await getCompanyId();
    const { data, error } = await supabase
      .from('team_allocations')
      .insert({
        user_id: user.id,
        company_id: companyId,
        installation_id: installationId,
        member_id: memberId,
      })
      .select()
      .single();

    if (error) { if (import.meta.env.DEV) console.error('Error allocating member:', error); return; }
    if (data) {
      setAllocations(prev => [...prev, {
        id: data.id,
        installationId: data.installation_id || '',
        memberId: data.member_id || '',
        assignedAt: data.created_at || '',
      }]);
    }
  };

  const deallocateMember = async (installationId: string, memberId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('team_allocations')
      .delete()
      .eq('installation_id', installationId)
      .eq('member_id', memberId);

    if (error) { if (import.meta.env.DEV) console.error('Error deallocating member:', error); return; }
    setAllocations(prev => prev.filter(
      a => !(a.installationId === installationId && a.memberId === memberId)
    ));
  };

  const getMembersForInstallation = (installationId: string): TeamMember[] => {
    const memberIds = allocations
      .filter(a => a.installationId === installationId)
      .map(a => a.memberId);
    return members.filter(m => memberIds.includes(m.id));
  };

  const getInstallationsForMember = (memberId: string): Installation[] => {
    const installationIds = allocations
      .filter(a => a.memberId === memberId)
      .map(a => a.installationId);
    return installations.filter(i => installationIds.includes(i.id));
  };

  return (
    <TeamContext.Provider value={{
      roles, addRole, updateRole, deleteRole,
      members, addMember, updateMember, deleteMember,
      installations, addInstallation, updateInstallation, deleteInstallation,
      allocations, allocateMember, deallocateMember,
      getMembersForInstallation, getInstallationsForMember,
    }}>
      {children}
    </TeamContext.Provider>
  );
};
