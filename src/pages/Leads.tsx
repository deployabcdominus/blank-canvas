/**
 * Leads Page - Main CRM entry point.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBreakpoint } from "@/hooks/use-mobile";
import { Lead } from "@/types/domain";
import { useLeadsQuery } from "@/hooks/queries/useLeadsQuery";
import { useProposalsQuery } from "@/hooks/queries/useProposalsQuery";
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
import { Plus, Search, X, Trash2, Menu, XCircle, Recycle } from "lucide-react";
import { FIXED_BRANDING } from "@/contexts/SettingsContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ListCardSkeleton } from "@/components/ui/skeleton-card";
import { useLeadFilters } from "@/hooks/useLeadFilters";
import { useLeadActions } from "@/hooks/useLeadActions";

const Leads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const breakpoint = useBreakpoint();
  const { companyId, isAdmin, isComercial, canEdit, canManageLeads } = useUserRole();
  const { leads, isLoading, createLeadMutation, deleteLeadMutation, deleteLeadsMutation, clearLeadsMutation } = useLeadsQuery(companyId);
  const { proposals, createProposalMutation } = useProposalsQuery(companyId);
  const addProposal = (p: any) => createProposalMutation.mutateAsync(p);
  const limits = usePlanLimits();
  const { t } = useLanguage();

  const {
    searchTerm, setSearchTerm,
    ownershipFilter, setOwnershipFilter,
    filteredLeads
  } = useLeadFilters(leads, user?.id);

  const actions = useLeadActions(
    leads,
    companyId,
    user,
    { createLeadMutation, deleteLeadMutation, deleteLeadsMutation, clearLeadsMutation },
    addProposal
  );

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const sidebarWidth = isMobile ? 0 : isTablet ? 80 : 256;

  return (
    <PageTransition>
      <div className="flex min-h-screen">
        <Sidebar />
        <MobileMenu isOpen={actions.isMobileMenuOpen} onClose={() => actions.setIsMobileMenuOpen(false)} />

        <main
          className={`flex-1 transition-all duration-300 ${isMobile ? 'p-4' : 'p-6'} ${actions.selectedIds.size > 0 ? 'pb-24' : ''}`}
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          {isMobile && (
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => actions.setIsMobileMenuOpen(true)} className="hover:bg-white/10 min-h-[44px] min-w-[44px]" aria-label={t.leads.openMenuAriaLabel}>
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold">{FIXED_BRANDING.appName}</h1>
            </div>
          )}

          <div className={`mb-6 ${isMobile ? 'text-center' : ''}`}>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-1`}>Leads</h1>
            <p className="text-muted-foreground text-sm">{t.leads.subtitle}</p>
          </div>

          <LeadsKPIBar leads={leads} proposals={proposals} isMobile={isMobile} />

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
                  className={`min-h-[44px] border-violet-500/20 text-violet-400 hover:bg-violet-500/10`}
                  title={t.leads.recycleBinTitle}
                >
                  <Recycle className="w-4 h-4" />
                  {!isMobile && <span className="ml-2">{t.leads.recycleBin}</span>}
                </Button>
              )}
              {leads.length > 0 && isAdmin && (
                <Button
                  onClick={() => actions.setIsConfirmClearOpen(true)}
                  variant="outline"
                  className={`min-h-[44px] ${isMobile ? 'flex-1' : ''}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> {t.leads.clearButton}
                </Button>
              )}
              {canEdit && (
                <Button
                  onClick={() => actions.setIsAddLeadModalOpen(true)}
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
          
          {isLoading ? (
            <div className={`grid gap-5 ${
              isMobile ? 'grid-cols-1' :
              isTablet ? 'grid-cols-2' :
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <ListCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
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
                <Button onClick={() => actions.setIsAddLeadModalOpen(true)} className="btn-glass bg-mint text-mint-foreground hover:bg-mint-hover">
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
                  selected={actions.selectedIds.has(lead.id)}
                  onSelect={isAdmin ? actions.handleSelect : undefined}
                  onAdvance={canEdit ? actions.handleAdvanceToProposal : () => {}}
                  onAssign={canManageLeads ? (id) => {
                    actions.setAssignLeadId(id);
                    actions.setAssignCurrentUser(lead?.assignedToUserId || null);
                    actions.setIsAssignModalOpen(true);
                  } : undefined}
                  onConvert={canEdit ? (id) => actions.setConvertLeadId(id) : undefined}
                  onEdit={canEdit ? (l) => { actions.setEditLead(l); actions.setEditLeadMode(true); } : undefined}
                  onDelete={isAdmin ? (id) => { actions.setDeleteTargetId(id); actions.setIsConfirmDeleteOpen(true); } : undefined}
                  onCardClick={(l) => { actions.setEditLead(l); actions.setEditLeadMode(false); }}
                  onViewProposal={() => navigate('/proposals')}
                />
              ))}
            </div>
          )}

          <AnimatePresence>
            {actions.selectedIds.size > 0 && isAdmin && (
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/[0.08] bg-zinc-900/90 backdrop-blur-xl shadow-2xl"
              >
                <span className="text-sm font-medium text-zinc-300">
                  {actions.selectedIds.size} {t.leads.selectedCount}{actions.selectedIds.size > 1 ? 's' : ''}
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 text-xs"
                  onClick={actions.handleDeleteSelected}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {t.leads.deleteSelection}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs text-zinc-400 hover:text-zinc-100"
                  onClick={() => actions.setSelectedIds(new Set())}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" /> {t.leads.deselect}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AddLeadModal isOpen={actions.isAddLeadModalOpen} onClose={() => actions.setIsAddLeadModalOpen(false)} onAddLead={actions.handleAddLead} />

          <EditLeadModal
            lead={actions.editLead}
            isOpen={!!actions.editLead}
            onClose={() => actions.setEditLead(null)}
            startInEditMode={actions.editLeadMode}
          />

          <AssignLeadModal
            isOpen={actions.isAssignModalOpen}
            onClose={() => actions.setIsAssignModalOpen(false)}
            leadId={actions.assignLeadId}
            currentAssignee={actions.assignCurrentUser}
          />

          <ConvertLeadModal
            isOpen={!!actions.convertLeadId}
            onClose={() => actions.setConvertLeadId(null)}
            lead={leads.find(l => l.id === actions.convertLeadId) || null}
          />

          <AlertDialog open={actions.isConfirmClearOpen} onOpenChange={actions.setIsConfirmClearOpen}>
            <AlertDialogContent className="bg-zinc-900/80 backdrop-blur-2xl border-white/[0.08] shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>{t.leads.clearAllTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.leads.clearAllDesc}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/5 border-white/10">{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={actions.handleClearLeads} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {t.leads.clearAllConfirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={actions.isConfirmDeleteOpen} onOpenChange={actions.setIsConfirmDeleteOpen}>
            <AlertDialogContent className="bg-zinc-900/80 backdrop-blur-2xl border-white/[0.08] shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>{t.leads.deleteTitle}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.leads.deleteDesc}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/5 border-white/10">{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={actions.handleConfirmDeleteSingle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
