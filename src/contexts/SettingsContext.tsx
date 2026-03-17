import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface AppSettings {
  theme: 'dark';
  glassEffect: boolean;
}

// Fixed branding - cannot be changed by users
export const FIXED_BRANDING = {
  appName: 'Sign Flow',
  appTagline: 'Gestión de Operaciones',
  brandLogo: '/src/assets/brand-logo.png'
} as const;

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  glassEffect: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Always enforce dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Load settings from Supabase (only glassEffect is user-configurable)
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setSettings(defaultSettings);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('id, user_id, theme, brand_logo, brand_color, glass_effect')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings({
            theme: 'dark', // Always dark
            glassEffect: data.glass_effect ?? defaultSettings.glassEffect,
          });
        } else {
          setSettings(defaultSettings);
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  // Apply glass effect changes
  useEffect(() => {
    const body = document.body;
    if (settings.glassEffect) {
      body.classList.remove('no-glass');
    } else {
      body.classList.add('no-glass');
    }
  }, [settings.glassEffect]);

  const updateSettings = async (updates: Partial<AppSettings>) => {
    // Ignore theme changes — always dark
    const newSettings = { ...settings, ...updates, theme: 'dark' as const };
    setSettings(newSettings);

    if (user) {
      try {
        await supabase
          .from('user_settings')
          .update({
            theme: 'dark',
            glass_effect: newSettings.glassEffect,
          })
          .eq('user_id', user.id);
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error updating settings:', error);
      }
    }
  };

  const resetToDefaults = async () => {
    setSettings(defaultSettings);
    
    if (user) {
      try {
        await supabase
          .from('user_settings')
          .update({
            theme: 'dark',
            glass_effect: defaultSettings.glassEffect,
          })
          .eq('user_id', user.id);
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error resetting settings:', error);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      resetToDefaults
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
