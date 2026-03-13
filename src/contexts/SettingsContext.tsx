import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface AppSettings {
  theme: 'light' | 'dark';
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

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('sf-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  }
  return 'light';
};

const defaultSettings: AppSettings = {
  theme: getInitialTheme(),
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

  // Load settings from Supabase
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
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings({
            theme: (data.theme as 'light' | 'dark') || defaultSettings.theme,
            glassEffect: data.glass_effect ?? defaultSettings.glassEffect,
          });
        } else {
          // If no data exists, use default settings
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

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('sf-theme', settings.theme);
  }, [settings.theme]);

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
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    if (user) {
      try {
        await supabase
          .from('user_settings')
          .update({
            theme: newSettings.theme,
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
            theme: defaultSettings.theme,
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
