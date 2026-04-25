import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AppSettings {
  theme: 'dark';
  glassEffect: boolean;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  glassEffect: true,
};

export const useUserSettingsQuery = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['user-settings', userId],
    queryFn: async () => {
      if (!userId) return defaultSettings;

      const { data, error } = await supabase
        .from('user_settings')
        .select('id, user_id, theme, brand_logo, brand_color, glass_effect')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          theme: 'dark' as const,
          glassEffect: data.glass_effect ?? defaultSettings.glassEffect,
        };
      }
      return defaultSettings;
    },
    enabled: !!userId,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<AppSettings>) => {
      if (!userId) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_settings')
        .update({
          theme: 'dark',
          glass_effect: updates.glassEffect,
        })
        .eq('user_id', userId);

      if (error) throw error;
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', userId] });
      toast.success('Configuración actualizada');
    },
    onError: (error: any) => {
      toast.error('Error al actualizar configuración: ' + error.message);
    },
  });

  return {
    settings: settingsQuery.data || defaultSettings,
    isLoading: settingsQuery.isLoading,
    updateSettingsMutation,
    resetToDefaultsMutation: useMutation({
      mutationFn: async () => {
        if (!userId) throw new Error('Not authenticated');
        const { error } = await supabase
          .from('user_settings')
          .update({
            theme: 'dark',
            glass_effect: defaultSettings.glassEffect,
          })
          .eq('user_id', userId);
        if (error) throw error;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['user-settings', userId] });
        toast.success('Configuración restablecida');
      },
    }),
  };
};
