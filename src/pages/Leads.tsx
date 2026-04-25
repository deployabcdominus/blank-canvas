import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBreakpoint } from "@/hooks/use-mobile";
import { Lead } from "@/contexts/LeadsContext";
import { useLeadsQuery } from "@/hooks/queries/useLeadsQuery";
import { useProposals } from "@/contexts/ProposalsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PlanLimitBanner } from "@/components/PlanLimitBanner";
import { useLanguage } from "@/i18n/LanguageContext";
import { PageTransition } from "@/components/PageTransition";
import { Sidebar } from "@/components/Sidebar";

import { MobileMenu } from "@/components/MobileMenu";
import { Button } from "@/components/ui/button";
import { AddLeadModal } from "@/components/AddLeadModal";
import { EditLeadModal } from "@/components/EditLeadModal";
import { AssignLeadModal } from "@/components/AssignLeadModal";
import { ConvertLeadModal } from "@/components/ConvertLeadModal";
import { LeadsKPIBar } from "@/components/LeadsKPIBar";
import { LeadCard } from "@/components/LeadCard";
import { Plus, Search, X, Trash2, UserPlus, Menu, XCircle, Recycle } from "lucide-react";
import { FIXED_BRANDING } from "@/contexts/SettingsContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Leads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const breakpoint = useBreakpoint();
  const { companyId, isAdmin, isComercial, canEdit, canManageLeads, isViewer } = useUserRole();
  const { leads, isLoading, createLeadMutation, deleteLeadMutation, deleteLeadsMutation, clearLeadsMutation } = useLeadsQuery(companyId);
  const { proposals, addProposal } = useProposals();
  const limits = usePlanLimits();

  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  const [searchTerm, setSearchTerm] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("todos");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const sidebarWidth = isMobile ? 0 : isTablet ? 80 : 256;

  const handleAddLead = async (leadData: any) => {
    try {
      if (!companyId || !user) return;
      await createLeadMutation.mutateAsync({
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

  const handleViewProposal = (proposalId: string) => {
    navigate('/proposals');
  };

  const handleAssignLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    setAssignLeadId(leadId);
    setAssignCurrentUser(lead?.assignedToUserId || null);
    setIsAssignModalOpen(true);
  };

  const handleClearLeads = async () => {
    if (!companyId) return;
    try {
      await clearLeadsMutation.mutateAsync(companyId);
      setIsConfirmClearOpen(false);
      setSelectedIds(new Set());
      toast({ title: t.leads.toasts.cleared, description: t.leads.toasts.clearedDesc });
    } catch {
      toast({ title: t.leads.toasts.clearError, description: t.leads.toasts.clearErrorDesc, variant: "destructive" });
    }
  };

  const handleDeleteSingle = (leadId: string) => {
    setDeleteTargetId(leadId);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDeleteSingle = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteLeadMutation.mutateAsync(deleteTargetId);
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
      await deleteLeadsMutation.mutateAsync(Array.from(selectedIds));
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

  const filteredLeads = leads.filter(lead => {
    if (ownershipFilter === "mios" && lead.createdByUserId !== user?.id) return false;
    if (ownershipFilter === "asignados" && lead.assignedToUserId !== user?.id) return false;
    if (ownershipFilter === "sin_asignar" && lead.assignedToUserId) return false;

    const s = searchTerm.toLowerCase().trim();
    if (!s) return true;
    return (
      lead.name.toLowerCase().includes(s) ||
      lead.company.toLowerCase().includes(s) ||
      lead.service.toLowerCase().includes(s) ||
      lead.status.toLowerCase().includes(s) ||
      lead.contact.phone.toLowerCase().includes(s) ||
      lead.contact.email.toLowerCase().includes(s) ||
      lead.contact.location.toLowerCase().includes(s)
    );
  });

  return (
    <PageTransition>
      <div className="flex min-h-screen">
        <Sidebar />
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        <main
          className={`flex-1 transition-all duration-300 ${isMobile ? 'p-4' : 'p-6'} ${selectedIds.size > 0 ? 'pb-24' : ''}`}
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          {isMobile && (
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="hover:bg-white/10 min-h-[44px] min-w-[44px]" aria-label={t.leads.openMenuAriaLabel}>
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold">{FIXED_BRANDING.appName}</h1>
            </div>
          )}

          {/* Title */}
          <div className={`mb-6 ${isMobile ? 'text-center' : ''}`}>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-1`}>Leads</h1>
            <p className="text-muted-foreground text-sm">{t.leads.subtitle}</p>
          </div>

          {/* KPIs */}
          <LeadsKPIBar leads={leads} proposals={proposals} isMobile={isMobile} />

          {/* Search + Filters + Actions */}
          <div className={`flex items-center gap-4 mb-6 ${isMobile ? 'flex-col' : 'justify-between'}`}>
            <div className={`flex items-center gap-3 ${isMobile ? 'w-full flex-col' : ''}`}>
              <div className={`relative ${isMobile ? 'w-full' : 'w-72'}`}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.leads.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-10 h-10"
                  aria-label={t.leads.searchAriaLabel}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={t.leads.clearSearchAriaLabel}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Role-based ownership filter */}
              <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
                <SelectTrigger className={`h-10 ${isMobile ? 'w-full' : 'w-44'}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">{t.leads.filterAll}</SelectItem>
                  {isComercial && (
                    <>
                      <SelectItem value="mios">{t.leads.filterMine}</SelectItem>
                      <SelectItem value="asignados">{t.leads.filterAssignedToMe}</SelectItem>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <SelectItem value="mios">{t.leads.filterCreatedByMe}</SelectItem>
                      <SelectItem value="sin_asignar">{t.leads.filterUnassigned}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
              {isAdmin && (
                <Button
                  onClick={() => navigate('/leads/recycle-bin')}
                  variant="outline"
                  className={`min-h-[44px] border-violet-500/20 text-violet-400 hover:bg-violet-500/10 ${isMobile ? '' : ''}`}
                  title={t.leads.recycleBinTitle}
                >
                  <Recycle className="w-4 h-4" />
                  {!isMobile && <span className="ml-2">{t.leads.recycleBin}</span>}
                </Button>
              )}
              {leads.length > 0 && isAdmin && (
                <Button
                  onClick={() => setIsConfirmClearOpen(true)}
                  variant="outline"
                  className={`min-h-[44px] ${isMobile ? 'flex-1' : ''}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> {t.leads.clearButton}
                </Button>
              )}
              {canEdit && (
                <Button
                  onClick={() => setIsAddLeadModalOpen(true)}
                  disabled={limits.leads.isAtLimit}
                  title={limits.leads.isAtLimit ? t.leads.limitReached : undefined}
                  className={`btn-glass bg-mint text-mint-foreground hover:bg-mint-hover min-h-[44px] ${isMobile ? 'flex-1' : ''}`}
                >
                  <Plus className="w-4 h-4 mr-2" /> {t.leads.addLead}
                </Button>
              )}
            </div>
          </div>

          <PlanLimitBanner entity="leads" />

          {/* Cards */}
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? `${t.leads.emptySearch} "${searchTerm}"` : t.leads.emptyDefault}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? t.leads.emptySearchHint : t.leads.emptyDefaultHint}
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm("")} variant="outline" className="mr-2">{t.leads.clearSearch}</Button>
              )}
              {canEdit && (
                <Button onClick={() => setIsAddLeadModalOpen(true)} className="btn-glass bg-mint text-mint-foreground hover:bg-mint-hover">
                  <Plus className="w-4 h-4 mr-2" /> {t.leads.addLead}
                </Button>
              )}
            </div>
          ) : (
            <div className={`grid gap-5 ${
              isMobile ? 'grid-cols-1' :
              isTablet ? 'grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {filteredLeads.map((lead, index) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  proposals={proposals}
                  index={index}
                  isMobile={isMobile}
                  selected={selectedIds.has(lead.id)}
                  onSelect={isAdmin ? handleSelect : undefined}
                  onAdvance={canEdit ? handleAdvanceToProposal : (leadId) => {}}
                  onAssign={canManageLeads ? handleAssignLead : undefined}
                  onConvert={canEdit ? (leadId) => setConvertLeadId(leadId) : undefined}
                  onEdit={canEdit ? (l) => { setEditLead(l); setEditLeadMode(true); } : undefined}
                  onDelete={isAdmin ? handleDeleteSingle : undefined}
                  onCardClick={(l) => { setEditLead(l); setEditLeadMode(false); }}
                  onViewProposal={handleViewProposal}
                />
              ))}
            </div>
          )}

          {/* Floating Bulk Action Bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && isAdmin && (
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/[0.08] bg-zinc-900/90 backdrop-blur-xl shadow-2xl"
              >
                <span className="text-sm font-medium text-zinc-300">
                  {selectedIds.size} {t.leads.selectedCount}{selectedIds.size > 1 ? 's' : ''}
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {t.leads.deleteSelection}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-zinc-400 hover:text-zinc-100"
                  onClick={() => setSelectedIds(new Set())}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" /> {t.leads.deselect}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AddLeadModal isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} onAddLead={handleAddLead} />

          <EditLeadModal
            lead={editLead}
            isOpen={!!editLead}
            onClose={() => setEditLead(null)}
            startInEditMode={editLeadMode}
          />

          <AssignLeadModal
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            leadId={assignLeadId}
            currentAssignee={assignCurrentUser}
          />

          <ConvertLeadModal
            isOpen={!!convertLeadId}
            onClose={() => setConvertLeadId(null)}
            lead={leads.find(l => l.id === convertLeadId) || null}
          />

          {/* Clear All Confirmation - Glassmorphism */}
          <AlertDialog open={isConfirmClearOpen} onOpenChange={setIsConfirmClearOpen}>
            <AlertDialogContent className="bg-zinc-900/80 backdrop-blur-2xl border-white/[0.08] shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg">⚠️ {t.leads.clearAllTitle}</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  {t.leads.clearAllDesc} ({leads.length})
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-zinc-700 text-zinc-300">{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearLeads} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t.leads.clearAllConfirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Single Delete Confirmation */}
          <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
            <AlertDialogContent className="bg-zinc-900/80 backdrop-blur-2xl border-white/[0.08] shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>{t.leads.deleteTitle}</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  {t.leads.deleteDesc}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-zinc-700 text-zinc-300">{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDeleteSingle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t.common.delete}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </PageTransition>
  );
};

export default Leads;
