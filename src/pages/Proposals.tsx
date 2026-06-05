
import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { AddProposalModal } from "@/components/AddProposalModal";
import { EditProposalModal } from "@/components/EditProposalModal";
import { RegisterPaymentModal } from "@/components/RegisterPaymentModal";
import { ProposalsKPIBar } from "@/components/ProposalsKPIBar";
import { ProposalCard } from "@/components/ProposalCard";
import { ProposalsControlBar, type ViewMode } from "@/components/proposals/ProposalsControlBar";
import { ProposalsTableView } from "@/components/proposals/ProposalsTableView";
import { WorkOrdersPagination } from "@/components/work-orders/WorkOrdersPagination";
import { Proposal } from "@/types/domain";
import { useProposalsQuery } from "@/hooks/queries/useProposalsQuery";
import { useWorkOrdersQuery } from "@/hooks/queries/useWorkOrdersQuery";
import { useClientsQuery } from "@/hooks/queries/useClientsQuery";
import { useLeadsQuery } from "@/hooks/queries/useLeadsQuery";
import { useCompany } from "@/hooks/useCompany";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PlanLimitBanner } from "@/components/PlanLimitBanner";
import { FileText, Plus } from "lucide-react";
import { useProposalFilters } from "@/hooks/useProposalFilters";
import { useProposalActions } from "@/hooks/useProposalActions";

const Proposals = () => {
  const { companyId, canEdit, canDelete } = useUserRole();
  const { proposals, isLoading: loading, createProposalMutation, updateProposalMutation, deleteProposalMutation } = useProposalsQuery(companyId);
  const { createWorkOrderMutation } = useWorkOrdersQuery(companyId);
  const { clients, createClientMutation } = useClientsQuery(companyId);
  const { leads, updateLeadMutation } = useLeadsQuery(companyId);

  const addOrder = (o: any) => createWorkOrderMutation.mutateAsync(o);
  const addClient = (c: any) => createClientMutation.mutateAsync(c);
  const updateLead = (id: string, updates: any) => updateLeadMutation.mutateAsync({ id, updates });
  const refreshClients = () => {};
  const { company } = useCompany();
  const limits = usePlanLimits();
  const { t } = useLanguage();

  const filter = useProposalFilters(proposals);
  const actions = useProposalActions(
    companyId,
    proposals,
    { createProposalMutation, updateProposalMutation, deleteProposalMutation },
    { addOrder, addClient, refreshClients, updateLead, leads, clients, t }
  );

  const [view, setView] = useState<ViewMode>("cards");

  const totalPages = Math.ceil(filter.processed.length / filter.pageSize);
  const safePage = Math.min(filter.page, Math.max(totalPages, 1));
  const paginated = filter.processed.slice((safePage - 1) * filter.pageSize, safePage * filter.pageSize);
  const showing = filter.processed.length > 0
    ? `${t.proposals.showing} ${(safePage - 1) * filter.pageSize + 1}–${Math.min(safePage * filter.pageSize, filter.processed.length)} ${t.proposals.of} ${filter.processed.length}`
    : t.proposals.noResults;

  return (
    <PageTransition>
      <ResponsiveLayout>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold mb-1">{t.proposals.title}</h1>
            <p className="text-muted-foreground text-sm">{t.proposals.subtitle}</p>
          </div>
          {canEdit && (
            <Button
              onClick={() => actions.setIsAddOpen(true)}
              disabled={limits.proposals.isAtLimit}
              title={limits.proposals.isAtLimit ? t.proposals.limitReached : undefined}
              className="btn-glass bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" /> {t.proposals.addProposal}
            </Button>
          )}
        </div>

        <PlanLimitBanner entity="proposals" />

        <ProposalsKPIBar proposals={proposals} />

        <ProposalsControlBar
          search={filter.search} onSearchChange={v => { filter.setSearch(v); filter.setPage(1); }}
          sort={filter.sort} onSortChange={filter.setSort}
          view={view} onViewChange={setView}
          statusFilter={filter.statusFilter} onStatusFilterChange={v => { filter.setStatusFilter(v); filter.setPage(1); }}
          dateFrom={filter.dateFrom} onDateFromChange={filter.setDateFrom}
          dateTo={filter.dateTo} onDateToChange={filter.setDateTo}
          totalItems={filter.processed.length}
          showing={showing}
        />

        {loading ? (
          <div className="text-center py-12 glass-card">
            <p className="text-muted-foreground">{t.proposals.loading}</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">{t.proposals.empty}</h3>
            <p className="text-muted-foreground mb-4">{t.proposals.emptyHint}</p>
            {canEdit && (
              <Button onClick={() => actions.setIsAddOpen(true)} className="btn-glass bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> {t.proposals.addProposal}
              </Button>
            )}
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((p, i) => (
              <ProposalCard 
                key={p.id} 
                proposal={p} 
                index={i} 
                onEdit={canEdit ? (p) => { actions.setEditingProposal(p); actions.setIsEditOpen(true); } : undefined} 
                onDelete={canDelete ? actions.handleDelete : undefined} 
                onCreateOrder={canEdit ? actions.handleCreateOrder : undefined} 
                onRegisterPayment={canEdit ? (p) => { actions.setPaymentProposal(p); actions.setIsPaymentOpen(true); } : undefined} 
              />
            ))}
          </div>
        ) : (
          <ProposalsTableView 
            proposals={paginated} 
            onEdit={canEdit ? (p) => { actions.setEditingProposal(p); actions.setIsEditOpen(true); } : undefined} 
            onDelete={canDelete ? actions.handleDelete : undefined} 
            onCreateOrder={canEdit ? actions.handleCreateOrder : undefined} 
            onRegisterPayment={canEdit ? (p) => { actions.setPaymentProposal(p); actions.setIsPaymentOpen(true); } : undefined} 
          />
        )}

        <WorkOrdersPagination
          currentPage={safePage}
          totalItems={filter.processed.length}
          pageSize={filter.pageSize}
          onPageChange={filter.setPage}
          onPageSizeChange={s => { filter.setPageSize(s); filter.setPage(1); }}
        />

        <AddProposalModal isOpen={actions.isAddOpen} onClose={() => actions.setIsAddOpen(false)} onAddProposal={actions.handleAdd} />
        <EditProposalModal isOpen={actions.isEditOpen} onClose={() => { actions.setEditingProposal(null); actions.setIsEditOpen(false); }} onEditProposal={actions.handleEdit} proposal={actions.editingProposal} />
        <RegisterPaymentModal isOpen={actions.isPaymentOpen} onClose={() => { actions.setPaymentProposal(null); actions.setIsPaymentOpen(false); }} proposal={actions.paymentProposal} companyId={company?.id || null} />
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default Proposals;
