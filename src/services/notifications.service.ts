import { supabase } from "@/integrations/supabase/client";

export interface CreateNotificationParams {
  userId: string;
  type: "success" | "info" | "warning" | "alert" | "payment" | "order" | "proposal";
  title: string;
  message: string;
  link?: string;
}

export const notificationsService = {
  /** Create a notification for a user */
  async create({ userId, type, title, message, link }: CreateNotificationParams) {
    const { error } = await (supabase as any)
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        link: link || null,
        is_read: false,
      });

    if (error) {
      console.error("Error creating notification:", error);
      return { success: false, error };
    }
    return { success: true };
  },

  /** Mark a specific notification as read */
  async markAsRead(id: string) {
    const { error } = await (supabase as any)
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error };
    }
    return { success: true };
  },

  /** Mark all notifications for a user as read */
  async markAllAsRead(userId: string) {
    const { error } = await (supabase as any)
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return { success: false, error };
    }
    return { success: true };
  }
};
