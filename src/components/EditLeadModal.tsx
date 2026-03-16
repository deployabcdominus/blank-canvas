import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCatalog } from "@/hooks/useCatalog";
import { useLeads, Lead } from "@/contexts/LeadsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, Pencil, Trash2, Upload, X, Phone, Mail, MapPin,
  Briefcase, Tag, TrendingUp, StickyNote, ArrowRight, Globe
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/image";
import { Badge } from "@/components/ui/badge";

interface EditLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  startInEditMode?: boolean;
  onAdvanceToProposal?: (leadId: string) => void;
}

/* ─── Glass card wrapper ─── */
const GlassCard = ({ title, icon: Icon, children, className = "" }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-4 ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-violet-400" />
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{title}</h4>
    </div>
    {children}
  </div>
);

/* ─── Field row (view / edit) ─── */
const FieldRow = ({ icon: Icon, label, value, editing, children }: {
  icon: React.ElementType;
  label: string;
  value?: string;
  editing: boolean;
  children?: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">{label}</p>
      {editing ? children : (
        <p className="text-sm text-zinc-200 truncate">{value || "—"}</p>
      )}
    </div>
  </div>
);

export const EditLeadModal = ({ lead, isOpen, onClose, startInEditMode = false, onAdvanceToProposal }: EditLeadModalProps) => {
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
        name, company, service, source, status, value, notes,
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

  const initials = (company || name || "?").slice(0, 2).toUpperCase();
  const editRing = editing ? "ring-1 ring-violet-500/50 border-violet-500/30" : "";
  const isConverted = lead.status === 'Convertido' || !!lead.clientId;

  const getStatusColor = (s: string) => {
    switch (s) {
      case "Nuevo": return "bg-primary/10 text-primary border-primary/20";
      case "Contactado": return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "Seguimiento": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Calificado": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Convertido": return "bg-violet-500/10 text-violet-400 border-violet-500/20";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent
          className="sm:max-w-[480px] p-0 border-white/[0.06] bg-[hsl(240_6%_7%/0.85)] backdrop-blur-2xl flex flex-col"
        >
          {/* ─── Header: Company-First Hierarchy ─── */}
          <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
            <div className="flex items-start gap-4">
              {/* Logo / Avatar — prominent */}
              <div className="relative group/logo flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.04] flex items-center justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-violet-400">{initials}</span>
                  )}
                </div>
                {editing && (
                  <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center hover:bg-violet-500 transition-colors"
                    >
                      <Upload className="w-3 h-3 text-white" />
                    </button>
                    {logoPreview && (
                      <button
                        onClick={removeLogo}
                        className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center hover:bg-zinc-600 transition-colors"
                      >
                        <X className="w-3 h-3 text-zinc-300" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Company Name + Contact */}
              <div className="flex-1 min-w-0">
                {editing ? (
                  <Input
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className={`text-xl font-bold h-auto py-1 px-2 bg-transparent border-transparent ${editRing}`}
                    placeholder="Empresa"
                  />
                ) : (
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-100 truncate">
                    {company || "Sin empresa"}
                  </h2>
                )}
                {editing ? (
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={`text-sm h-auto py-0.5 px-2 mt-1 bg-transparent border-transparent text-zinc-400 ${editRing}`}
                    placeholder="Contacto"
                  />
                ) : (
                  <p className="text-sm text-zinc-400 truncate mt-0.5">{name}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={`text-[10px] ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </Badge>
                  {lead.source && (
                    <Badge variant="outline" className="text-[10px] bg-zinc-800/50 text-zinc-500 border-zinc-700/50">
                      {lead.source}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Edit toggle */}
              {!editing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(true)}
                  className="h-9 w-9 text-zinc-500 hover:text-zinc-100 hover:bg-white/[0.06]"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* ─── Scrollable body ─── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* Contact Info Card */}
            <GlassCard title="Información de Contacto" icon={Phone}>
              <div className="space-y-0.5">
                <FieldRow icon={Phone} label="Teléfono" value={phone} editing={editing}>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} className={`h-8 text-sm ${editRing}`} />
                </FieldRow>
                <FieldRow icon={Mail} label="Email" value={email} editing={editing}>
                  <Input value={email} onChange={e => setEmail(e.target.value)} className={`h-8 text-sm ${editRing}`} />
                </FieldRow>
                <FieldRow icon={MapPin} label="Ubicación" value={location} editing={editing}>
                  <Input value={location} onChange={e => setLocation(e.target.value)} className={`h-8 text-sm ${editRing}`} />
                </FieldRow>
                {lead.website && !editing && (
                  <FieldRow icon={Globe} label="Website" value={lead.website} editing={false} />
                )}
              </div>
            </GlassCard>

            {/* Project Specifications Card */}
            <GlassCard title="Especificaciones del Proyecto" icon={Briefcase}>
              <div className="space-y-0.5">
                <FieldRow icon={Tag} label="Servicio" value={service} editing={editing}>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger className={`h-8 text-sm ${editRing}`}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {services.map(s => <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow icon={TrendingUp} label="Valor Estimado" value={value} editing={editing}>
                  <Input value={value} onChange={e => setValue(e.target.value)} placeholder="$0.00" className={`h-8 text-sm ${editRing}`} />
                </FieldRow>
                {editing && (
                  <>
                    <FieldRow icon={Globe} label="Fuente" value={source} editing={editing}>
                      <Select value={source} onValueChange={setSource}>
                        <SelectTrigger className={`h-8 text-sm ${editRing}`}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          {sources.map(s => <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FieldRow>
                    <FieldRow icon={Tag} label="Estado" value={status} editing={editing}>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className={`h-8 text-sm ${editRing}`}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          {statuses.map(s => <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FieldRow>
                  </>
                )}
              </div>
            </GlassCard>

            {/* Internal Notes Card */}
            <GlassCard title="Notas Internas" icon={StickyNote}>
              {editing ? (
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Agrega notas sobre este lead..."
                  className={`min-h-[80px] resize-none text-sm ${editRing}`}
                />
              ) : (
                <p className="text-sm text-zinc-400 whitespace-pre-wrap">
                  {notes || "Sin notas"}
                </p>
              )}
            </GlassCard>

            {/* Delete zone (admin only, edit mode) */}
            {editing && isAdmin && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/20 text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar lead
              </button>
            )}
          </div>

          {/* ─── Sticky Footer ─── */}
          <div className="border-t border-white/[0.06] px-6 py-4 bg-[hsl(240_6%_7%/0.9)] backdrop-blur-xl">
            {editing ? (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  className="flex-1 h-11"
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 h-11 btn-violet"
                  disabled={saving}
                >
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</> : "Guardar cambios"}
                </Button>
              </div>
            ) : (
              !isConverted && onAdvanceToProposal && (
                <Button
                  onClick={() => onAdvanceToProposal(lead.id)}
                  className="w-full h-11 bg-violet-600/20 text-violet-300 border border-violet-500/20 hover:bg-violet-600/30 hover:text-violet-200 transition-all"
                >
                  Avanzar a Propuesta
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )
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
