import { useState, useEffect, useRef } from "react";
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
import { Loader2, Pencil, Trash2, Upload, X } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/image";

interface EditLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  startInEditMode?: boolean;
}

export const EditLeadModal = ({ lead, isOpen, onClose, startInEditMode = false }: EditLeadModalProps) => {
  const { updateLead, leads, setLeads } = useLeads();
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
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  // Logo state
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setCompany(lead.company);
      setPhone(lead.contact.phone);
      setEmail(lead.contact.email);
      setLocation(lead.contact.location);
      setService(lead.service);
      setSource(lead.source || "");
      setStatus(lead.status);
      setValue(lead.value);
      setNotes(lead.notes || "");
      setLogoPreview(lead.logoUrl || null);
      setLogoFile(null);
      setEditing(startInEditMode);
    }
  }, [lead, startInEditMode]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: "Formato inválido", description: "Seleccione una imagen." });
      return;
    }
    try {
      const compressed = await compressImage(file, 400, 400, 0.8);
      setLogoFile(compressed);
      if (logoPreview && !logoPreview.startsWith('http')) URL.revokeObjectURL(logoPreview);
      setLogoPreview(URL.createObjectURL(compressed));
    } catch {
      toast({ title: "Error al procesar imagen" });
    }
  };

  const removeLogo = () => {
    if (logoPreview && !logoPreview.startsWith('http')) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      let logoUrl: string | undefined = undefined;

      if (logoFile) {
        const fileName = `${Date.now()}-${logoFile.name}`;
        const { error: uploadError } = await supabase.storage.from('lead-logos').upload(fileName, logoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('lead-logos').getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }

      const updates: Partial<Lead> = {
        name,
        company,
        service,
        source,
        status,
        value,
        notes,
        contact: { phone, email, location },
      };
      if (logoUrl !== undefined) updates.logoUrl = logoUrl;

      await updateLead(lead.id, updates);
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
      setLeads(leads.filter(l => l.id !== lead.id));
      onClose();
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
  const initials = (lead.company || lead.name || "?").slice(0, 2).toUpperCase();

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
            {/* Logo / Avatar */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-primary">{initials}</span>
                )}
              </div>
              {editing && (
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Cambiar logo
                  </Button>
                  {logoPreview && (
                    <Button type="button" variant="ghost" size="sm" onClick={removeLogo}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>

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
              <Label>Fuente</Label>
              {editing ? (
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger className={fieldClass}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {sources.map(s => (
                      <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-foreground mt-1">{source || "—"}</p>
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
                <Button onClick={handleSave} className={`flex-1 ${fieldClass}`} disabled={saving}>
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
