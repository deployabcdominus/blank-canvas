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
import { useLanguage } from "@/i18n/LanguageContext";

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export const ConvertLeadModal = ({ isOpen, onClose, lead }: ConvertLeadModalProps) => {
  const { t } = useLanguage();
  const m = t.convertLeadModal;

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
        if (!newClientName.trim()) throw new Error(m.clientNameRequired);
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
        if (!newClient?.id) throw new Error(m.errorNoClientId);
        clientId = newClient.id;
      } else {
        if (!selectedClientId) throw new Error(m.selectClientRequired);
        clientId = selectedClientId;
      }

      // Step 2: Create project
      const project = await addProject({
        clientId,
        projectName: projectName.trim() || lead.service || m.projectFallback,
        installAddress: lead.contact.location || '',
        status: 'Lead',
        ownerUserId: user.id,
        assignedToUserId: lead.assignedToUserId || null,
        folderRelativePath: null,
        folderFullPath: null,
      });
      if (!project?.id) throw new Error(m.errorNoProjectId);

      // Step 3: Create proposal linked to lead
      try {
        // Use company name (not contact name) as the proposal client identifier
        const proposalClientName = mode === 'new'
          ? newClientName.trim()
          : (clients.find(c => c.id === selectedClientId)?.clientName || lead.company || lead.name);

        await addProposal({
          client: proposalClientName,
          project: projectName.trim() || lead.service || m.projectFallback,
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
        toast({
          title: m.errorProposalTitle,
          description: m.errorProposalDesc.replace('{{msg}}', msg),
          variant: "destructive",
        });
        throw new Error(m.errorProposalThrow.replace('{{msg}}', msg));
      }

      // Step 4: Mark lead as converted
      await updateLead(lead.id, {
        status: 'Convertido',
        clientId: clientId,
        projectId: project.id,
      } as any);

      toast({ title: m.successTitle, description: m.successDesc });
      onClose();

      // Step 5: Redirect to proposals
      navigate('/proposals');
    } catch (err: any) {
      toast({ title: m.errorTitle, description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m.title}</DialogTitle>
        </DialogHeader>

        {isAlreadyConverted ? (
          <Alert variant="destructive" className="border-amber-500/30 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-amber-300">
              {m.alreadyConverted}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{m.clientLabel}</Label>
              <div className="flex gap-2">
                <Button variant={mode === 'existing' ? 'default' : 'outline'} size="sm" onClick={() => setMode('existing')}>{m.existingBtn}</Button>
                <Button variant={mode === 'new' ? 'default' : 'outline'} size="sm" onClick={() => setMode('new')}>{m.newBtn}</Button>
              </div>
            </div>

            {mode === 'existing' ? (
              <div className="space-y-2">
                <Label>{m.selectClientLabel}</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger><SelectValue placeholder={m.selectPlaceholder} /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.clientName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>{m.newClientLabel}</Label>
                <Input value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder={m.newClientPlaceholder} />
              </div>
            )}

            <div className="space-y-2">
              <Label>{m.projectLabel}</Label>
              <Input value={projectName} onChange={e => setProjectName(e.target.value)} />
            </div>

            {lead && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>{m.addressInfo} {lead.contact.location || '—'}</p>
                <p>{m.serviceInfo} {lead.service || '—'}</p>
                {lead.logoUrl && <p>{m.logoInfo}</p>}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{m.cancel}</Button>
          {!isAlreadyConverted && (
            <Button onClick={handleConvert} disabled={saving || (mode === 'existing' ? !selectedClientId : !newClientName.trim())}>
              {saving ? m.converting : m.convert}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
