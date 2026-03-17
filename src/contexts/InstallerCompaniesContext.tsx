import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { resolveCompanyId } from '@/lib/resolve-company';

export interface InstallerCompany {
  id: string;
  name: string;
  contact: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  // defaultPassword removed for security
  services?: string[];
}

interface InstallerCompaniesContextType {
  companies: InstallerCompany[];
  addCompany: (company: Omit<InstallerCompany, 'id'>) => Promise<void>;
  updateCompany: (id: string, updates: Partial<InstallerCompany>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  isLoading: boolean;
}

const InstallerCompaniesContext = createContext<InstallerCompaniesContextType | undefined>(undefined);

export const useInstallerCompanies = () => {
  const context = useContext(InstallerCompaniesContext);
  if (!context) {
    throw new Error('useInstallerCompanies must be used within an InstallerCompaniesProvider');
  }
  return context;
};

export const InstallerCompaniesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<InstallerCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCompanyId = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    return resolveCompanyId(user.id);
  }, [user]);

  // Load companies from Supabase
  useEffect(() => {
    const loadCompanies = async () => {
      if (!user) {
        setCompanies([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('installer_companies')
          .select('id, name, contact, email, logo_url, services');

        if (error) throw error;

        if (data) {
          setCompanies(data.map(company => ({
            id: company.id,
            name: company.name,
            contact: company.contact || '',
            phone: company.contact,
            email: company.email,
            logoUrl: company.logo_url,
            services: company.services,
          })));
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error loading companies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
  }, [user]);

  const addCompany = async (company: Omit<InstallerCompany, 'id'>) => {
    if (!user) return;
    const companyId = await getCompanyId();

    try {
      const { data, error } = await supabase
        .from('installer_companies')
        .insert({
          user_id: user.id,
          company_id: companyId,
          name: company.name,
          contact: company.contact,
          email: company.email,
          logo_url: company.logoUrl,
          services: company.services,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setCompanies([...companies, {
          id: data.id,
          name: data.name,
          contact: data.contact || '',
          phone: data.contact,
          email: data.email,
          logoUrl: data.logo_url,
          // defaultPassword intentionally not loaded
          services: data.services,
        }]);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error adding company:', error);
      throw error;
    }
  };

  const updateCompany = async (id: string, updates: Partial<InstallerCompany>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('installer_companies')
        .update({
          name: updates.name,
          contact: updates.contact,
          email: updates.email,
          logo_url: updates.logoUrl,
          services: updates.services,
        })
        .eq('id', id);

      if (error) throw error;

      setCompanies(companies.map(company =>
        company.id === id ? { ...company, ...updates } : company
      ));
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error updating company:', error);
      throw error;
    }
  };

  const deleteCompany = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('installer_companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCompanies(companies.filter(company => company.id !== id));
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error deleting company:', error);
      throw error;
    }
  };

  return (
    <InstallerCompaniesContext.Provider value={{
      companies,
      addCompany,
      updateCompany,
      deleteCompany,
      isLoading
    }}>
      {children}
    </InstallerCompaniesContext.Provider>
  );
};