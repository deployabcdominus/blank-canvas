import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useClients } from "@/contexts/ClientsContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { useLeads, Lead } from "@/contexts/LeadsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export const ConvertLeadModal = ({ isOpen, onClose, lead }: ConvertLeadModalProps) => {
  const { user } = useAuth();
  const { clients, addClient } = useClients();
  const { addProject } = useProjects();
  const { addProposal } = useProposals();
  const { updateLead } = useLeads();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [saving, setSaving] = useState(false);

  const isAlreadyConverted = lead ? (lead.status === 'Convertido' || !!lead.clientId) : false;

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  // Pre-fill when lead changes  
  const prevLeadId = useState<string | null>(null);
  if (lead && lead.id !== prevLeadId[0]) {
    prevLeadId[1](lead.id);
    setProjectName(lead.service || lead.name);
    if (lead.company) setNewClientName(lead.company);
    setSelectedClientId('');
    setMode('new');
  }

  const handleConvert = async () => {
    if (!lead || !user || isAlreadyConverted) return;
    setSaving(true);
    try {
      // Step 1: Create or recover client
      let clientId: string;

      if (mode === 'new') {
        if (!newClientName.trim()) throw new Error('Nombre del cliente requerido');
        const newClient = await addClient({
          clientName: newClientName.trim(),
          contactName: lead.name || null,
          primaryEmail: lead.contact.email || null,
          primaryPhone: lead.contact.phone || null,
          address: lead.contact.location || null,
          website: lead.website || null,
          serviceType: lead.service || null,
          notes: lead.notes || null,
          logoUrl: lead.logoUrl || null,
        });
        if (!newClient?.id) throw new Error('Error al crear el cliente: no se recibió ID');
        clientId = newClient.id;
      } else {
        if (!selectedClientId) throw new Error('Seleccione un cliente');
        clientId = selectedClientId;
      }

      // Step 2: Create project
      const project = await addProject({
        clientId,
        projectName: projectName.trim() || lead.service || 'Proyecto',
        installAddress: lead.contact.location || '',
        status: 'Lead',
        ownerUserId: user.id,
        assignedToUserId: lead.assignedToUserId || null,
        folderRelativePath: null,
        folderFullPath: null,
      });
      if (!project?.id) throw new Error('Error al crear el proyecto: no se recibió ID');

      // Step 3: Create proposal linked to lead
      try {
        await addProposal({
          client: newClientName.trim() || lead.company || lead.name,
          project: projectName.trim() || lead.service || 'Proyecto',
          value: lead.value ? parseFloat(lead.value) || 0 : 0,
          description: lead.notes || lead.service || '',
          status: 'Borrador',
          sentDate: null,
          sentMethod: null,
          leadId: lead.id,
          updatedAt: null,
          lead: null,
          approvedTotal: null,
          approvedAt: null,
          mockupUrl: null,
        });
      } catch (proposalErr: any) {
        const msg = proposalErr?.message || 'Error desconocido';
        toast({ title: "Error al crear propuesta", description: `Detalle: ${msg}. Verifique que todos los campos requeridos estén completos.`, variant: "destructive" });
        throw new Error(`Fallo en creación de propuesta: ${msg}`);
      }

      // Step 4: Mark lead as converted
      await updateLead(lead.id, {
        status: 'Convertido',
        clientId: clientId,
        projectId: project.id,
      } as any);

      toast({ title: "Lead convertido", description: "Cliente, proyecto y propuesta creados exitosamente." });
      onClose();

      // Step 5: Redirect to proposals
      navigate('/proposals');
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convertir Lead a Cliente/Proyecto</DialogTitle>
        </DialogHeader>

        {isAlreadyConverted ? (
          <Alert variant="destructive" className="border-amber-500/30 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300">
              Este Lead ya ha sido procesado. No es posible convertirlo nuevamente.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <div className="flex gap-2">
                <Button variant={mode === 'existing' ? 'default' : 'outline'} size="sm" onClick={() => setMode('existing')}>Existente</Button>
                <Button variant={mode === 'new' ? 'default' : 'outline'} size="sm" onClick={() => setMode('new')}>Nuevo</Button>
              </div>
            </div>

            {mode === 'existing' ? (
              <div className="space-y-2">
                <Label>Seleccionar cliente</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.clientName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Nombre del nuevo cliente</Label>
                <Input value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Ej: Acme Corp" />
              </div>
            )}

            <div className="space-y-2">
              <Label>Nombre del proyecto</Label>
              <Input value={projectName} onChange={e => setProjectName(e.target.value)} />
            </div>

            {lead && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Dirección: {lead.contact.location || '—'}</p>
                <p>Servicio: {lead.service || '—'}</p>
                {lead.logoUrl && <p>✓ Logo del lead será transferido al cliente</p>}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          {!isAlreadyConverted && (
            <Button onClick={handleConvert} disabled={saving || (mode === 'existing' ? !selectedClientId : !newClientName.trim())}>
              {saving ? 'Convirtiendo...' : 'Convertir'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
