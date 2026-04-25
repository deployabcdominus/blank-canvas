import { supabase } from '@/integrations/supabase/client';

export type AuditAction = 'creado' | 'editado' | 'eliminado' | 'cambio_estado' | 'aprobado' | 'asignado' | 'enviado';
export type AuditEntityType = 'lead' | 'cliente' | 'propuesta' | 'pago' | 'proyecto' | 'orden_produccion' | 'ejecucion' | 'equipo';

interface LogAuditParams {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  entityLabel?: string;
  details?: Record<string, any>;
}

// Memory cache for user profile to avoid redundant DB calls on every log
let cachedProfile: { company_id: string; full_name: string | null; user_id: string } | null = null;

/**
 * Standalone audit logger — call from anywhere without hooks.
 * Silently fails to avoid blocking business logic.
 */
export async function logAudit({ action, entityType, entityId, entityLabel, details }: LogAuditParams) {
  try {
    let profile = cachedProfile;

    if (!profile) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('company_id, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (!dbProfile?.company_id) return;

      profile = {
        company_id: dbProfile.company_id,
        full_name: dbProfile.full_name,
        user_id: user.id
      };
      cachedProfile = profile;
    }

    await supabase.from('audit_logs').insert({
      company_id: profile.company_id,
      user_id: profile.user_id,
      user_name: profile.full_name || 'Usuario',
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      entity_label: entityLabel || null,
      details: details || {},
    });
  } catch (err) {
    if (import.meta.env.DEV) console.error('Audit log error:', err);
  }
}
