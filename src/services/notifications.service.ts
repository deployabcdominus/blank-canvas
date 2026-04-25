import { supabase } from '@/integrations/supabase/client';
import { logAudit } from '@/lib/audit';

export type NotificationType = 'lead_assigned' | 'proposal_approved' | 'work_order_ready' | 'system_alert';

interface CreateNotificationParams {
  userId: string;
  companyId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

export const NotificationsService = {
  async create({ userId, companyId, title, message, type, link }: CreateNotificationParams) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          company_id: companyId,
          title,
          message,
          type,
          link: link || null,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating notification:', err);
      return null;
    }
  },

  async markAsRead(id: string) {
    return await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  },

  async markAllAsRead(userId: string) {
    return await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  }
};
