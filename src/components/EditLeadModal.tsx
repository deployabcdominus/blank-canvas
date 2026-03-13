import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCatalog } from "@/hooks/useCatalog";
import { useLeads, Lead } from "@/contexts/LeadsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

interface EditLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  startInEditMode?: boolean;
}

export const EditLeadModal = ({ lead, isOpen, onClose, startInEditMode = false }: EditLeadModalProps) => {
  const { updateLead } = useLeads();
  const { isAdmin } = useUserRole();
  const { items: services } = useCatalog("lead_service");
  const { items: sources } = useCatalog("lead_source");
  const { items: statuses } = useCatalog("lead_status");

  const [editing, setEditing] = useState(startInEditMode);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [service, setService] = useState("");
  const [status, setStatus] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setCompany(lead.company);
      setPhone(lead.contact.phone);
      setEmail(lead.contact.email);
      setLocation(lead.contact.location);
      setService(lead.service);
      setStatus(lead.status);
      setValue(lead.value);
      setNotes("");
      setEditing(startInEditMode);
    }
  }, [lead, startInEditMode]);

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      await updateLead(lead.id, {
        name,
        company,
        service,
        status,
        value,
        contact: { phone, email, location },
      });
      toast({ title: "Lead actualizado" });
      setEditing(false);
      onClose();
    } catch {
      toast({ title: "Error al actualizar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    try {
      const { error } = await supabase.from("leads").delete().eq("id", lead.id);
      if (error) throw error;
      toast({ title: "Lead eliminado" });
      onClose();
      // Force reload leads
      window.location.reload();
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    }
  };

  const handleClose = () => {
    setEditing(false);
    onClose();
  };

  if (!lead) return null;

  const fieldClass = "min-h-[44px]";

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-[480px] overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-semibold">
                {editing ? `Editar Lead — ${lead.name}` : lead.name}
              </SheetTitle>
              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="w-3.5 h-3.5 mr-1.5" /> Editar
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-4">
            <div>
              <Label>Empresa</Label>
              {editing ? (
                <Input value={company} onChange={e => setCompany(e.target.value)} className={fieldClass} />
              ) : (
                <p className="text-sm text-foreground mt-1">{company || "—"}</p>
              )}
            </div>

            <div>
              <Label>Contacto (nombre)</Label>
              {editing ? (
                <Input value={name} onChange={e => setName(e.target.value)} className={fieldClass} />
              ) : (
                <p className="text-sm text-foreground mt-1">{name || "—"}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Teléfono</Label>
                {editing ? (
                  <Input value={phone} onChange={e => setPhone(e.target.value)} className={fieldClass} />
                ) : (
                  <p className="text-sm text-foreground mt-1">{phone || "—"}</p>
                )}
              </div>
              <div>
                <Label>Email</Label>
                {editing ? (
                  <Input value={email} onChange={e => setEmail(e.target.value)} className={fieldClass} />
                ) : (
                  <p className="text-sm text-foreground mt-1">{email || "—"}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Dirección</Label>
              {editing ? (
                <Input value={location} onChange={e => setLocation(e.target.value)} className={fieldClass} />
              ) : (
                <p className="text-sm text-foreground mt-1">{location || "—"}</p>
              )}
            </div>

            <div>
              <Label>Servicio</Label>
              {editing ? (
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger className={fieldClass}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {services.map(s => (
                      <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-foreground mt-1">{service || "—"}</p>
              )}
            </div>

            <div>
              <Label>Estado</Label>
              {editing ? (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className={fieldClass}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-foreground mt-1">{status || "—"}</p>
              )}
            </div>

            <div>
              <Label>Valor estimado</Label>
              {editing ? (
                <Input value={value} onChange={e => setValue(e.target.value)} placeholder="$0.00" className={fieldClass} />
              ) : (
                <p className="text-sm text-foreground mt-1">{value || "—"}</p>
              )}
            </div>

            <div>
              <Label>Notas</Label>
              {editing ? (
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas adicionales..." className="min-h-[80px] resize-none" />
              ) : (
                <p className="text-sm text-muted-foreground mt-1">{notes || "Sin notas"}</p>
              )}
            </div>

            {editing && (
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditing(false)} className={fieldClass} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className={`bg-mint text-mint-foreground hover:bg-mint-hover flex-1 ${fieldClass}`} disabled={saving}>
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : "Guardar cambios"}
                </Button>
              </div>
            )}

            {editing && isAdmin && (
              <div className="pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar lead
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente "{lead.name}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
