import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBreakpoint } from "@/hooks/use-mobile";
import { useLeads, Lead } from "@/contexts/LeadsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { useUserRole } from "@/hooks/useUserRole";
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
import { Plus, Search, X, Trash2, UserPlus, Menu } from "lucide-react";
import { FIXED_BRANDING } from "@/contexts/SettingsContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";

const Leads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const breakpoint = useBreakpoint();
  const { leads, addLead, clearLeads } = useLeads();
  const { proposals, addProposal } = useProposals();
  const { isAdmin, isComercial, canEdit, canManageLeads, isViewer } = useUserRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignLeadId, setAssignLeadId] = useState<string | null>(null);
  const [assignCurrentUser, setAssignCurrentUser] = useState<string | null>(null);
  const [convertLeadId, setConvertLeadId] = useState<string | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editLeadMode, setEditLeadMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("todos");

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const sidebarWidth = isMobile ? 0 : isTablet ? 80 : 256;

  const handleAddLead = async (leadData: any) => {
    try {
      await addLead({
        name: leadData.name,
        company: leadData.company,
        service: leadData.signType,
        status: "Nuevo",
        contact: { phone: leadData.phone, email: leadData.email, location: leadData.address },
        value: "Por definir",
        daysAgo: 0,
        website: leadData.website,
        logoUrl: leadData.logoUrl,
      });
    } catch {
      toast({ title: "Error al guardar lead", description: "Intente nuevamente.", variant: "destructive" });
    }
  };

  const handleAdvanceToProposal = async (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Block if already converted
    if (lead.status === 'Convertido' || lead.clientId) {
      toast({ title: "Lead ya convertido", description: "Este lead ya fue procesado.", variant: "destructive" });
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

    toast({ title: "¡Propuesta creada!", description: "El lead fue avanzado a propuesta. Redirigiendo..." });
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

  const handleClearLeads = () => {
    clearLeads();
    setIsConfirmClearOpen(false);
    toast({ title: "Leads eliminados con éxito", description: "Todos los leads fueron removidos del sistema." });
  };

  const filteredLeads = leads.filter(lead => {
    // Ownership filter (for comercial)
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
          className={`flex-1 transition-all duration-300 ${isMobile ? 'p-4' : 'p-6'}`}
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          {isMobile && (
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="hover:bg-white/10 min-h-[44px] min-w-[44px]" aria-label="Abrir menú">
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold">{FIXED_BRANDING.appName}</h1>
            </div>
          )}

          {/* Title */}
          <div className={`mb-6 ${isMobile ? 'text-center' : ''}`}>
            <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-1`}>Leads</h1>
            <p className="text-muted-foreground text-sm">Gestione y haga seguimiento de clientes potenciales</p>
          </div>

          {/* KPIs */}
          <LeadsKPIBar leads={leads} proposals={proposals} isMobile={isMobile} />

          {/* Search + Filters + Actions */}
          <div className={`flex items-center gap-4 mb-6 ${isMobile ? 'flex-col' : 'justify-between'}`}>
            <div className={`flex items-center gap-3 ${isMobile ? 'w-full flex-col' : ''}`}>
              <div className={`relative ${isMobile ? 'w-full' : 'w-72'}`}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-10 h-10"
                  aria-label="Buscar leads"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Limpiar búsqueda"
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
                  <SelectItem value="todos">Todos</SelectItem>
                  {isComercial && (
                    <>
                      <SelectItem value="mios">Mis leads</SelectItem>
                      <SelectItem value="asignados">Asignados a mí</SelectItem>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <SelectItem value="mios">Creados por mí</SelectItem>
                      <SelectItem value="sin_asignar">Sin asignar</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
              {leads.length > 0 && isAdmin && (
                <Button
                  onClick={() => setIsConfirmClearOpen(true)}
                  variant="outline"
                  className={`min-h-[44px] ${isMobile ? 'flex-1' : ''}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Limpiar
                </Button>
              )}
              {canEdit && (
                <Button
                  onClick={() => setIsAddLeadModalOpen(true)}
                  className={`btn-glass bg-mint text-mint-foreground hover:bg-mint-hover min-h-[44px] ${isMobile ? 'flex-1' : ''}`}
                >
                  <Plus className="w-4 h-4 mr-2" /> Agregar Lead
                </Button>
              )}
            </div>
          </div>

          {/* Cards */}
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? `Ningún lead encontrado para "${searchTerm}"` : 'Ningún lead encontrado'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Intente usar otros términos de búsqueda.' : 'Comience agregando su primer lead.'}
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm("")} variant="outline" className="mr-2">Limpiar búsqueda</Button>
              )}
              {canEdit && (
                <Button onClick={() => setIsAddLeadModalOpen(true)} className="btn-glass bg-mint text-mint-foreground hover:bg-mint-hover">
                  <Plus className="w-4 h-4 mr-2" /> Agregar Lead
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
                  onAdvance={handleAdvanceToProposal}
                  onAssign={canManageLeads ? handleAssignLead : undefined}
                  onConvert={(leadId) => setConvertLeadId(leadId)}
                  onEdit={(l) => { setEditLead(l); setEditLeadMode(true); }}
                  onCardClick={(l) => { setEditLead(l); setEditLeadMode(false); }}
                  onViewProposal={handleViewProposal}
                />
              ))}
            </div>
          )}

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

          <AlertDialog open={isConfirmClearOpen} onOpenChange={setIsConfirmClearOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará todos los leads del sistema. Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearLeads}>Confirmar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </PageTransition>
  );
};

export default Leads;
