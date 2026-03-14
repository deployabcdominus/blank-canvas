import { supabase } from "@/integrations/supabase/client";

export function useEmail() {
  async function sendEmail(type: string, to: string, data: Record<string, string>) {
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: { type, to, data },
      });
      if (error) console.error("Email send failed:", error);
    } catch (err) {
      console.error("Email send failed:", err);
    }
  }

  return {
    sendInvitationEmail: (to: string, data: {
      inviterName: string;
      companyName: string;
      logoUrl: string;
      roleName: string;
      inviteUrl: string;
    }) => sendEmail("invitation", to, data),

    sendOrderStatusEmail: (to: string, data: {
      orderTitle: string;
      newStatus: string;
      companyName: string;
      notes?: string;
    }) => sendEmail("order_status", to, { ...data, notes: data.notes ?? "" }),

    sendProposalEmail: (to: string, data: {
      proposalTitle: string;
      companyName: string;
      amount: string;
      dueDate?: string;
      notes?: string;
    }) => sendEmail("proposal_sent", to, { ...data, dueDate: data.dueDate ?? "", notes: data.notes ?? "" }),
  };
}
