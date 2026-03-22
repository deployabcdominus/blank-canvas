import { useState, useMemo } from "react";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { AddProposalModal } from "@/components/AddProposalModal";
import { EditProposalModal } from "@/components/EditProposalModal";
import { RegisterPaymentModal } from "@/components/RegisterPaymentModal";
import { ProposalsKPIBar } from "@/components/ProposalsKPIBar";
import { ProposalCard } from "@/components/ProposalCard";
import { ProposalsControlBar, type ProposalSortKey, type ViewMode } from "@/components/proposals/ProposalsControlBar";
import { ProposalsTableView } from "@/components/proposals/ProposalsTableView";
import { WorkOrdersPagination } from "@/components/work-orders/WorkOrdersPagination";
import { useProposals, type Proposal } from "@/contexts/ProposalsContext";
import { useWorkOrders } from "@/contexts/WorkOrdersContext";
import { useClients } from "@/contexts/ClientsContext";
import { useLeads } from "@/contexts/LeadsContext";
import { useCompany } from "@/hooks/useCompany";
import { useUserRole } from "@/hooks/useUserRole";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { PlanLimitBanner } from "@/components/PlanLimitBanner";
import { logAudit } from "@/lib/audit";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";

const Proposals = () => {
  const { proposals, loading, addProposal, updateProposal, deleteProposal } = useProposals();
  const { addOrder } = useWorkOrders();
  const { clients, addClient, refreshClients } = useClients();
  const { leads, updateLead } = useLeads();
  const { company } = useCompany();
  const { canEdit, canDelete } = useUserRole();
  const limits = usePlanLimits();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [paymentProposal, setPaymentProposal] = useState<Proposal | null>(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<ProposalSortKey>("updated");
  const [view, setView] = useState<ViewMode>("cards");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const handleAdd = async (data: any) => { await addProposal(data); };

  const handleEdit = async (data: any) => {
    const { id, ...rest } = data;
    const previousProposal = proposals.find(p => p.id === id);
    await updateProposal(id, rest);

    // Auto-create client + work order when manually approved
    if (rest.status === 'Aprobada' && previousProposal?.status !== 'Aprobada') {
      let clientId: string | null = null;
      const clientName = rest.client || previousProposal?.client || '';

      // Try to find/create client from linked lead
      const leadId = previousProposal?.leadId;
      if (leadId) {
        const lead = leads.find(l => l.id === leadId);
        if (lead?.clientId) {
          clientId = lead.clientId;
        } else if (lead) {
          // Check if client already exists by name
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
          // Mark lead as converted
          if (clientId) {
            try {
              await updateLead(leadId, { status: 'Convertido', clientId } as any);
            } catch (e) {
              console.error('Error updating lead:', e);
            }
          }
        }
      }

      // Fallback: create client from proposal name if no lead
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
        notes: `Orden generada automáticamente desde propuesta aprobada manualmente.`,
        priority: 'media',
        proposalId: id,
      });
      logAudit({
        action: 'aprobado',
        entityType: 'propuesta',
        entityId: id,
        entityLabel: clientName,
        details: { method: 'manual', auto_work_order: true, auto_client: !!clientId },
      });

      await refreshClients();
      toast.success(`Cliente registrado y Orden de Trabajo generada con éxito para "${clientName}"`);
    } else {
      toast.success("Propuesta actualizada");
    }
  };

  const handleDelete = async (id: string) => { await deleteProposal(id); toast.success("Propuesta eliminada"); };

  const handleCreateOrder = async (proposal: Proposal) => {
    if (proposal.hasOrder) {
      toast.error("Esta propuesta ya tiene una Orden de Trabajo asociada.");
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
    toast.success(`Orden creada para "${proposal.client}"`);
  };

  const openEdit = (p: Proposal) => { setEditingProposal(p); setIsEditOpen(true); };
  const closeEdit = () => { setEditingProposal(null); setIsEditOpen(false); };
  const openPayment = (p: Proposal) => { setPaymentProposal(p); setIsPaymentOpen(true); };
  const closePayment = () => { setPaymentProposal(null); setIsPaymentOpen(false); };

  const processed = useMemo(() => {
    let result = [...proposals];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.client.toLowerCase().includes(q) || p.project.toLowerCase().includes(q));
    }
    if (statusFilter.length > 0) result = result.filter(p => statusFilter.includes(p.status));
    if (dateFrom) result = result.filter(p => (p.sentDate || p.createdAt) >= dateFrom);
    if (dateTo) result = result.filter(p => (p.sentDate || p.createdAt) <= dateTo);

    result.sort((a, b) => {
      switch (sort) {
        case "updated": return (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt);
        case "amount_desc": return b.value - a.value;
        case "amount_asc": return a.value - b.value;
        case "status": return a.status.localeCompare(b.status);
        case "sent_date": return (b.sentDate || "").localeCompare(a.sentDate || "");
        default: return 0;
      }
    });
    return result;
  }, [proposals, search, statusFilter, dateFrom, dateTo, sort]);

  const totalPages = Math.ceil(processed.length / pageSize);
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const paginated = processed.slice((safePage - 1) * pageSize, safePage * pageSize);
  const showing = processed.length > 0
    ? `Mostrando ${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, processed.length)} de ${processed.length}`
    : "Sin resultados";

  return (
    <PageTransition>
      <ResponsiveLayout>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold mb-1">Propuestas</h1>
            <p className="text-muted-foreground text-sm">Registro interno de propuestas comerciales</p>
          </div>
          {canEdit && (
            <Button
              onClick={() => setIsAddOpen(true)}
              disabled={limits.proposals.isAtLimit}
              title={limits.proposals.isAtLimit ? "Límite alcanzado — upgrade tu plan" : undefined}
              className="btn-glass bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" /> Nueva Propuesta
            </Button>
          )}
        </div>

        <PlanLimitBanner entity="proposals" />

        <ProposalsKPIBar proposals={proposals} />

        <ProposalsControlBar
          search={search} onSearchChange={v => { setSearch(v); setPage(1); }}
          sort={sort} onSortChange={setSort}
          view={view} onViewChange={setView}
          statusFilter={statusFilter} onStatusFilterChange={v => { setStatusFilter(v); setPage(1); }}
          dateFrom={dateFrom} onDateFromChange={setDateFrom}
          dateTo={dateTo} onDateToChange={setDateTo}
          totalItems={processed.length}
          showing={showing}
        />

        {loading ? (
          <div className="text-center py-12 glass-card">
            <p className="text-muted-foreground">Cargando propuestas...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Sin propuestas</h3>
            <p className="text-muted-foreground mb-4">Registre una propuesta comercial</p>
            {canEdit && (
              <Button onClick={() => setIsAddOpen(true)} className="btn-glass bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" /> Nueva Propuesta
              </Button>
            )}
          </div>
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((p, i) => (
              <ProposalCard key={p.id} proposal={p} index={i} onEdit={canEdit ? openEdit : undefined} onDelete={canDelete ? handleDelete : undefined} onCreateOrder={canEdit ? handleCreateOrder : undefined} onRegisterPayment={canEdit ? openPayment : undefined} />
            ))}
          </div>
        ) : (
          <ProposalsTableView proposals={paginated} onEdit={canEdit ? openEdit : undefined} onDelete={canDelete ? handleDelete : undefined} onCreateOrder={canEdit ? handleCreateOrder : undefined} onRegisterPayment={canEdit ? openPayment : undefined} />
        )}

        <WorkOrdersPagination
          currentPage={safePage}
          totalItems={processed.length}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={s => { setPageSize(s); setPage(1); }}
        />

        <AddProposalModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAddProposal={handleAdd} />
        <EditProposalModal isOpen={isEditOpen} onClose={closeEdit} onEditProposal={handleEdit} proposal={editingProposal} />
        <RegisterPaymentModal isOpen={isPaymentOpen} onClose={closePayment} proposal={paymentProposal} companyId={company?.id || null} />
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default Proposals;
