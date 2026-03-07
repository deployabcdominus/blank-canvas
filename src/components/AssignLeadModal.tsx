import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLeads } from '@/contexts/LeadsContext';
import { toast } from '@/hooks/use-toast';

interface AssignLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string | null;
  currentAssignee: string | null;
}

interface CompanyMember {
  id: string;
  name: string;
  email: string;
}

export function AssignLeadModal({ isOpen, onClose, leadId, currentAssignee }: AssignLeadModalProps) {
  const { user } = useAuth();
  const { assignLead } = useLeads();
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>(currentAssignee || 'none');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    setSelectedMember(currentAssignee || 'none');

    // Fetch team members (users in the same company)
    const fetchMembers = async () => {
      // Get current user's company_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.company_id) return;

      // Get all profiles with same company_id
      const { data: companyProfiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('company_id', profile.company_id) as any;

      if (companyProfiles) {
        setMembers(
          companyProfiles
            .filter((p: any) => p.id !== user.id) // Exclude self
            .map((p: any) => ({
              id: p.id,
              name: p.full_name || 'Sin nombre',
              email: '',
            }))
        );
      }
    };

    fetchMembers();
  }, [isOpen, user, currentAssignee]);

  const handleSave = async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const assignTo = selectedMember === 'none' ? null : selectedMember;
      await assignLead(leadId, assignTo);
      toast({ title: 'Lead asignado', description: assignTo ? 'Lead asignado al comercial.' : 'Asignación removida.' });
      onClose();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'No se pudo asignar el lead.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Lead a Comercial</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Comercial asignado</Label>
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar comercial..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {members.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {members.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No hay otros miembros en tu empresa. Invita comerciales primero.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
