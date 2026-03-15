import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

export type AuditAction = 'creado' | 'editado' | 'eliminado' | 'cambio_estado' | 'aprobado' | 'asignado' | 'enviado';
export type AuditEntityType = 'lead' | 'cliente' | 'propuesta' | 'pago' | 'proyecto' | 'orden_produccion' | 'ejecucion' | 'equipo';

interface LogAuditParams {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityLabel?: string;
  details?: Record<string, any>;
}

export function useAuditLog() {
  const { user } = useAuth();
  const { fullName } = useUserProfile();

  const logAudit = useCallback(async ({ action, entityType, entityId, entityLabel, details }: LogAuditParams) => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.company_id) return;

      await (supabase as any).from('audit_logs').insert({
        company_id: profile.company_id,
        user_id: user.id,
        user_name: fullName || user.email || 'Usuario',
        action,
        entity_type: entityType,
        entity_id: entityId || null,
        entity_label: entityLabel || null,
        details: details || {},
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error('Audit log error:', err);
    }
  }, [user, fullName]);

  return { logAudit };
}
