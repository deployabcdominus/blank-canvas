
import { useState } from 'react';
import { Proposal } from '@/types/domain';
import { toast } from 'sonner';
import { logAudit } from '@/lib/audit';

export const useProposalActions = (
  companyId: string | null,
  proposals: Proposal[],
  mutations: {
    createProposalMutation: any;
    updateProposalMutation: any;
    deleteProposalMutation: any;
  },
  dependencies: {
    addOrder: any;
    addClient: any;
    refreshClients: any;
    updateLead: any;
    leads: any[];
    clients: any[];
    t: any;
  }
) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [paymentProposal, setPaymentProposal] = useState<Proposal | null>(null);

  const { addOrder, addClient, refreshClients, updateLead, leads, clients, t } = dependencies;

  const handleAdd = async (data: any) => { 
    if (!companyId) return;
    await mutations.createProposalMutation.mutateAsync({ ...data, company_id: companyId }); 
    setIsAddOpen(false);
  };

  const handleEdit = async (data: any) => {
    const { id, ...rest } = data;
    const previousProposal = proposals.find(p => p.id === id);
    await mutations.updateProposalMutation.mutateAsync({ id, updates: rest });

    const wasJustApproved = (rest.status === 'Aprobada' && previousProposal?.status !== 'Aprobada') || 
                            (rest.approvedForProduction === true && !previousProposal?.approvedForProduction);

    if (wasJustApproved) {
      let clientId: string | null = null;
      const clientName = rest.client || previousProposal?.client || '';

      const leadId = previousProposal?.leadId;
      if (leadId) {
        const lead = leads.find(l => l.id === leadId);
        if (lead?.clientId) {
          clientId = lead.clientId;
        } else if (lead) {
          const existing = clients.find(c => c.clientName === (lead.company || lead.name));
          if (existing) {
            clientId = existing.id;
          } else {
            try {
              const newClient = await addClient({
                clientName: lead.company || lead.name || clientName,
                contactName: lead.name || null,
                primaryEmail: lead.contact.email || null,
                primaryPhone: lead.contact.phone || null,
                address: lead.contact.location || null,
                website: lead.website || null,
                serviceType: lead.service || null,
                notes: lead.notes || null,
                logoUrl: lead.logoUrl || null,
              });
              clientId = newClient.id;
            } catch (e) {
              console.error('Error auto-creating client:', e);
            }
          }
          if (clientId) {
            try {
              await updateLead(leadId, { status: 'Convertido', clientId } as any);
            } catch (e) {
              console.error('Error updating lead:', e);
            }
          }
        }
      }

      if (!clientId && clientName) {
        const existing = clients.find(c => c.clientName === clientName);
        if (existing) {
          clientId = existing.id;
        } else {
          try {
            const newClient = await addClient({ clientName, contactName: null, primaryEmail: null, primaryPhone: null, address: null, website: null, serviceType: null, notes: null, logoUrl: null });
            clientId = newClient.id;
          } catch (e) {
            console.error('Error auto-creating client:', e);
          }
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      
      const approvalMethod = rest.adminOverrideApproval ? 'admin_override' : 'standard';
      
      await addOrder({
        client: clientName,
        project: rest.project || previousProposal?.project || '',
        serviceType: rest.project || previousProposal?.project || '',
        status: "Pendiente",
        progress: 0,
        materials: [],
        startDate: today,
        estimatedCompletion: endDate.toISOString().split('T')[0],
        projectId: null,
        notes: rest.sentNotes || t.proposals.toasts.autoOrderNote,
        priority: 'media',
        proposalId: id,
      });
      
      logAudit({
        action: 'aprobado',
        entityType: 'propuesta',
        entityId: id,
        entityLabel: clientName,
        details: { 
          method: approvalMethod, 
          auto_work_order: true, 
          auto_client: !!clientId,
          override_reason: rest.adminOverrideReason 
        },
      });

      await refreshClients();
      toast.success(`${t.proposals.toasts.clientAndOrderCreated} "${clientName}"`);
    } else {
      toast.success(t.proposals.toasts.updated);
    }
    setEditingProposal(null);
    setIsEditOpen(false);
  };

  const handleDelete = async (id: string) => { 
    await mutations.deleteProposalMutation.mutateAsync(id); 
    toast.success(t.proposals.toasts.deleted); 
  };

  const handleCreateOrder = async (proposal: Proposal) => {
    if (proposal.hasOrder) {
      toast.error(t.proposals.toasts.orderExists);
      return;
    }
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(); endDate.setDate(endDate.getDate() + 7);
    await addOrder({
      client: proposal.client, project: proposal.project, serviceType: proposal.project,
      status: "Pendiente", progress: 0, materials: [],
      startDate: today, estimatedCompletion: endDate.toISOString().split('T')[0],
      projectId: null, notes: null, priority: 'media',
      proposalId: proposal.id,
    });
    toast.success(`${t.proposals.toasts.orderCreated} "${proposal.client}"`);
  };

  return {
    isAddOpen, setIsAddOpen,
    isEditOpen, setIsEditOpen,
    isPaymentOpen, setIsPaymentOpen,
    editingProposal, setEditingProposal,
    paymentProposal, setPaymentProposal,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCreateOrder
  };
};
