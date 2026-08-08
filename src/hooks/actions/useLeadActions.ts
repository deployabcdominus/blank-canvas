
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lead } from '@/types/domain';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';

export const useLeadActions = (
  leads: Lead[],
  companyId: string | null,
  user: any,
  mutations: {
    createLeadMutation: any;
    deleteLeadMutation: any;
    deleteLeadsMutation: any;
    clearLeadsMutation: any;
  },
  addProposal: any
) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignLeadId, setAssignLeadId] = useState<string | null>(null);
  const [assignCurrentUser, setAssignCurrentUser] = useState<string | null>(null);
  const [convertLeadId, setConvertLeadId] = useState<string | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editLeadMode, setEditLeadMode] = useState(false);

  const handleAddLead = async (leadData: any) => {
    try {
      if (!companyId || !user) return;
      await mutations.createLeadMutation.mutateAsync({
        user_id: user.id,
        company_id: companyId,
        created_by_user_id: user.id,
        name: leadData.name,
        company: leadData.company,
        service: leadData.signType,
        status: "Nuevo",
        phone: leadData.phone,
        email: leadData.email,
        location: leadData.address,
        value: "Por definir",
        website: leadData.website,
        logo_url: leadData.logoUrl,
      });
      setIsAddLeadModalOpen(false);
    } catch {
      toast({ title: t.leads.toasts.saveError, description: t.leads.toasts.saveErrorDesc, variant: "destructive" });
    }
  };

  const handleAdvanceToProposal = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (lead.status === 'Convertido' || lead.clientId) {
      toast({ title: t.leads.toasts.alreadyConverted, description: t.leads.toasts.alreadyConvertedDesc, variant: "destructive" });
      return;
    }

    await addProposal({
      client: lead.name,
      project: lead.service,
      value: parseFloat(lead.value.replace(/[^0-9.]/g, '')) || 0,
      description: `Propuesta creada a partir del lead: ${lead.name}`,
      status: "Borrador",
      sentDate: null,
      sentMethod: null,
      updatedAt: null,
      leadId: lead.id,
      lead: null,
      approvedTotal: null,
      approvedAt: null,
      mockupUrl: null,
    });

    toast({ title: t.leads.toasts.proposalCreated, description: t.leads.toasts.proposalCreatedDesc });
    setTimeout(() => navigate('/proposals'), 1000);
  };

  const handleClearLeads = async () => {
    if (!companyId) return;
    try {
      await mutations.clearLeadsMutation.mutateAsync(companyId);
      setIsConfirmClearOpen(false);
      setSelectedIds(new Set());
      toast({ title: t.leads.toasts.cleared, description: t.leads.toasts.clearedDesc });
    } catch {
      toast({ title: t.leads.toasts.clearError, description: t.leads.toasts.clearErrorDesc, variant: "destructive" });
    }
  };

  const handleConfirmDeleteSingle = async () => {
    if (!deleteTargetId) return;
    try {
      await mutations.deleteLeadMutation.mutateAsync(deleteTargetId);
      setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteTargetId); return n; });
      toast({ title: t.leads.toasts.deleted, description: t.leads.toasts.deletedDesc });
    } catch {
      toast({ title: t.leads.toasts.deleteError, description: t.leads.toasts.deleteErrorDesc, variant: "destructive" });
    }
    setDeleteTargetId(null);
    setIsConfirmDeleteOpen(false);
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      await mutations.deleteLeadsMutation.mutateAsync(Array.from(selectedIds));
      toast({ title: `${selectedIds.size} ${t.leads.toasts.selectedDeleted}`, description: t.leads.toasts.selectedDeletedDesc });
      setSelectedIds(new Set());
    } catch {
      toast({ title: t.leads.toasts.deleteError, description: t.leads.toasts.clearErrorDesc, variant: "destructive" });
    }
  };

  const handleSelect = (leadId: string, checked: boolean) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      if (checked) n.add(leadId); else n.delete(leadId);
      return n;
    });
  };

  return {
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    selectedIds,
    setSelectedIds,
    isAddLeadModalOpen,
    setIsAddLeadModalOpen,
    isConfirmClearOpen,
    setIsConfirmClearOpen,
    isConfirmDeleteOpen,
    setIsConfirmDeleteOpen,
    deleteTargetId,
    setDeleteTargetId,
    isAssignModalOpen,
    setIsAssignModalOpen,
    assignLeadId,
    setAssignLeadId,
    assignCurrentUser,
    setAssignCurrentUser,
    convertLeadId,
    setConvertLeadId,
    editLead,
    setEditLead,
    editLeadMode,
    setEditLeadMode,
    handleAddLead,
    handleAdvanceToProposal,
    handleClearLeads,
    handleConfirmDeleteSingle,
    handleDeleteSelected,
    handleSelect
  };
};
