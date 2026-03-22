import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCatalog } from "@/hooks/useCatalog";
import { useLeads, Lead } from "@/contexts/LeadsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";
import {
  Loader2, Pencil, Trash2, Upload, X, Phone, Mail, MapPin,
  Briefcase, Tag, TrendingUp, StickyNote, ArrowRight, Globe,
  Clock, CheckCircle2, MessageSquare, FileText, ExternalLink, Copy, Mic, MicOff
} from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/image";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  <div className={`rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-md p-4 ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-violet-400" />
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{title}</h4>
    </div>
    {children}
  </div>
);

/* ─── Field row (view / edit) ─── */
const FieldRow = ({ icon: Icon, label, value, editing, actionHref, children }: {
  icon: React.ElementType;
  label: string;
  value?: string;
  editing: boolean;
  actionHref?: string;
  children?: React.ReactNode;
}) => {
  const { t } = useLanguage();
  return (
  <div className="flex items-start gap-3 py-2 group/field">
    <Icon className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-0.5">{label}</p>
      {editing ? children : (
        <div className="flex items-center gap-2">
          {actionHref ? (
            <a href={actionHref} className="text-sm text-zinc-200 hover:text-violet-300 transition-colors truncate">
              {value || "—"}
            </a>
          ) : (
            <p className="text-sm text-zinc-200 truncate">{value || "—"}</p>
          )}
          {value && !editing && (
            <button
              onClick={() => { navigator.clipboard.writeText(value); toast({ title: t.editLeadModal.copiedToast }); }}
              className="opacity-0 group-hover/field:opacity-100 transition-opacity p-0.5"
              aria-label={t.editLeadModal.copyAriaLabel}
            >
              <Copy className="w-3 h-3 text-zinc-600 hover:text-zinc-300" />
            </button>
          )}
        </div>
      )}
    </div>
  </div>
  );
};

/* ─── Activity Timeline Item ─── */
interface ActivityEvent {
  id: string;
  action: string;
  created_at: string;
  details: any;
  user_name: string;
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  creado: CheckCircle2,
  editado: Pencil,
  cambio_estado: Tag,
  nota: MessageSquare,
};

const ActivityItem = ({ event, isLast }: { event: ActivityEvent; isLast: boolean }) => {
  const { t } = useLanguage();
  const Icon = ACTIVITY_ICONS[event.action] || Clock;
  const date = new Date(event.created_at);
  const timeStr = date.toLocaleDateString('es', { day: '2-digit', month: 'short' }) + ' · ' + date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  const getLabel = () => {
    switch (event.action) {
      case 'creado': return t.editLeadModal.activityCreated;
      case 'editado': return t.editLeadModal.activityEdited;
      case 'cambio_estado': {
        const d = event.details as any;
        return d?.after ? t.editLeadModal.activityStatusChanged.replace("{{status}}", d.after) : t.editLeadModal.activityStatusUpdated;
      }
      default: return event.action;
    }
  };

  return (
    <div className="flex gap-3 relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-7 bottom-0 w-px bg-white/[0.06]" />
      )}
      <div className="w-6 h-6 rounded-full border border-white/[0.1] bg-white/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3 h-3 text-violet-400" />
      </div>
      <div className="pb-4 min-w-0">
        <p className="text-xs text-zinc-300 font-medium">{getLabel()}</p>
        <p className="text-[10px] text-zinc-600 mt-0.5">{timeStr} — {event.user_name || t.editLeadModal.systemLabel}</p>
      </div>
    </div>
  );
};

export const EditLeadModal = ({ lead, isOpen, onClose, startInEditMode = false }: EditLeadModalProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { updateLead, leads, setLeads } = useLeads();
  const { addProposal, proposals } = useProposals();
  const { isAdmin } = useUserRole();
  const { items: services } = useCatalog("lead_service");
  const { items: sources } = useCatalog("lead_source");
  const { items: statuses } = useCatalog("lead_status");

  const [editing, setEditing] = useState(startInEditMode);
  const [saving, setSaving] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [createdProposalId, setCreatedProposalId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [voiceNoteText, setVoiceNoteText] = useState("");
  const [isDictated, setIsDictated] = useState(false);

  const speechToText = useSpeechToText({
    lang: "es-ES",
    onResult: (transcript) => {
      setIsDictated(true);
      setNotes(prev => prev + (prev ? ' ' : '') + transcript);
    },
  });

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

  // Fetch activity timeline
  const fetchActivity = useCallback(async (leadId: string) => {
    const { data } = await supabase
      .from('audit_logs')
      .select('id, action, created_at, details, user_name')
      .eq('entity_type', 'lead')
      .eq('entity_id', leadId)
      .order('created_at', { ascending: false })
      .limit(15);
    setActivityEvents((data as ActivityEvent[]) || []);
  }, []);

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
      setCreatedProposalId(null);
      setAdvancing(false);
      setIsDictated(false);
      speechToText.stop();
      fetchActivity(lead.id);
    }
  }, [lead, startInEditMode, fetchActivity]);

  // Check if proposal already linked
  const linkedProposal = lead ? proposals.find(p => p.leadId === lead.id) : null;

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: t.editLeadModal.toastInvalidFormat, description: t.editLeadModal.toastInvalidFormatDesc });
      return;
    }
    try {
      const compressed = await compressImage(file, 400, 400, 0.8);
      setLogoFile(compressed);
      if (logoPreview && !logoPreview.startsWith('http')) URL.revokeObjectURL(logoPreview);
      setLogoPreview(URL.createObjectURL(compressed));
    } catch {
      toast({ title: t.editLeadModal.toastImageError });
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
      toast({ title: t.editLeadModal.toastUpdated });
      setEditing(false);
      fetchActivity(lead.id);
    } catch {
      toast({ title: t.editLeadModal.toastUpdateError, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAdvanceInPanel = async () => {
    if (!lead) return;
    if (lead.status === 'Convertido' || lead.clientId) {
      toast({ title: t.editLeadModal.toastAlreadyConverted, variant: "destructive" });
      return;
    }
    setAdvancing(true);
    try {
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
      // Find the newly created proposal
      const { data: newProp } = await supabase
        .from('proposals')
        .select('id')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setCreatedProposalId(newProp?.id || null);
      toast({ title: t.editLeadModal.toastProposalCreated, description: t.editLeadModal.toastProposalCreatedDesc });
      fetchActivity(lead.id);
    } catch {
      toast({ title: t.editLeadModal.toastProposalError, variant: "destructive" });
    } finally {
      setAdvancing(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    try {
      const { error } = await supabase.from("leads").delete().eq("id", lead.id);
      if (error) throw error;
      toast({ title: t.editLeadModal.toastDeleted });
      setLeads(leads.filter(l => l.id !== lead.id));
      onClose();
    } catch {
      toast({ title: t.editLeadModal.toastDeleteError, variant: "destructive" });
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
  const hasProposal = !!linkedProposal || !!createdProposalId;

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
          className="sm:max-w-[500px] p-0 border-white/[0.06] bg-[hsl(240_6%_7%/0.88)] backdrop-blur-2xl flex flex-col"
        >
          {/* ─── Header: Company-First ─── */}
          <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
            <div className="flex items-start gap-4">
              {/* Logo */}
              <div className="relative group/logo flex-shrink-0">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/[0.1] bg-white/[0.04] flex items-center justify-center shadow-lg shadow-black/20">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-extrabold text-violet-400/80">{initials}</span>
                  )}
                </div>
                {editing && (
                  <div className="absolute -bottom-1 -right-1 flex gap-0.5">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center hover:bg-violet-500 transition-colors"
                    >
                      <Upload className="w-2.5 h-2.5 text-white" />
                    </button>
                    {logoPreview && (
                      <button onClick={removeLogo} className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center hover:bg-zinc-600 transition-colors">
                        <X className="w-2.5 h-2.5 text-zinc-300" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Company + Contact */}
              <div className="flex-1 min-w-0">
                {editing ? (
                  <Input
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className={`text-xl font-extrabold h-auto py-1 px-2 bg-transparent border-transparent ${editRing}`}
                    placeholder={t.editLeadModal.companyPlaceholder}
                  />
                ) : (
                  <h2 className="text-2xl font-extrabold tracking-tight text-zinc-100 truncate">
                    {company || t.editLeadModal.noCompany}
                  </h2>
                )}
                {editing ? (
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={`text-sm h-auto py-0.5 px-2 mt-0.5 bg-transparent border-transparent text-zinc-400 ${editRing}`}
                    placeholder={t.editLeadModal.contactPlaceholder}
                  />
                ) : (
                  <p className="text-sm text-zinc-400 truncate mt-0.5">{name}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </Badge>
                  {lead.source && (
                    <Badge variant="outline" className="text-[10px] bg-zinc-800/40 text-zinc-500 border-zinc-700/40">
                      {lead.source}
                    </Badge>
                  )}
                  <span className="text-[10px] text-zinc-600 ml-auto">
                    {t.editLeadModal.daysAgo.replace("{{n}}", String(lead.daysAgo))}
                  </span>
                </div>
              </div>

              {/* Edit toggle */}
              {!editing && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(true)}
                  className="h-8 w-8 text-zinc-600 hover:text-zinc-100 hover:bg-white/[0.06]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* ─── Scrollable body ─── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* Contact Details Card */}
            <GlassCard title={t.editLeadModal.contactInfoTitle} icon={Phone}>
              <div className="space-y-0">
                <FieldRow icon={Phone} label={t.editLeadModal.phoneLabel} value={phone} editing={editing} actionHref={phone ? `tel:${phone}` : undefined}>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} className={`h-8 text-sm ${editRing}`} />
                </FieldRow>
                <FieldRow icon={Mail} label={t.editLeadModal.emailLabel} value={email} editing={editing} actionHref={email ? `mailto:${email}` : undefined}>
                  <Input value={email} onChange={e => setEmail(e.target.value)} className={`h-8 text-sm ${editRing}`} />
                </FieldRow>
                <FieldRow icon={MapPin} label={t.editLeadModal.locationLabel} value={location} editing={editing}>
                  <Input value={location} onChange={e => setLocation(e.target.value)} className={`h-8 text-sm ${editRing}`} />
                </FieldRow>
                {lead.website && !editing && (
                  <FieldRow icon={Globe} label={t.editLeadModal.websiteLabel} value={lead.website} editing={false} actionHref={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} />
                )}
              </div>
            </GlassCard>

            {/* Project Specs Card */}
            <GlassCard title={t.editLeadModal.projectSpecsTitle} icon={Briefcase}>
              <div className="space-y-0">
                <FieldRow icon={Tag} label={t.editLeadModal.serviceLabel} value={service} editing={editing}>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger className={`h-8 text-sm ${editRing}`}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {services.map(s => <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FieldRow>
                {editing ? (
                  <FieldRow icon={TrendingUp} label={t.editLeadModal.estimatedValueLabel} value={value} editing>
                    <Input value={value} onChange={e => setValue(e.target.value)} placeholder="$0.00" className={`h-8 text-sm ${editRing}`} />
                  </FieldRow>
                ) : (
                  <div className="flex items-start gap-3 py-2">
                    <TrendingUp className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-0.5">{t.editLeadModal.valueLabel}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-zinc-200 font-medium">
                          {(() => {
                            const proposalVal = linkedProposal?.approvedTotal ?? linkedProposal?.value;
                            return proposalVal != null
                              ? `$${proposalVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                              : value || t.editLeadModal.toBeDefined;
                          })()}
                        </p>
                        {linkedProposal?.status === 'Aprobada' && (
                          <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {t.editLeadModal.approved}
                          </span>
                        )}
                        {linkedProposal && linkedProposal.status !== 'Aprobada' && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                            {t.editLeadModal.proposal}
                          </span>
                        )}
                        {/* PDF shortcut */}
                        {linkedProposal?.approvalToken && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={`/p/${linkedProposal.approvalToken}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-md text-violet-500 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                                aria-label={t.editLeadModal.viewPdfAriaLabel}
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {t.editLeadModal.viewPdfTooltip}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {editing && (
                  <>
                    <FieldRow icon={Globe} label={t.editLeadModal.sourceLabel} value={source} editing>
                      <Select value={source} onValueChange={setSource}>
                        <SelectTrigger className={`h-8 text-sm ${editRing}`}><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          {sources.map(s => <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </FieldRow>
                    <FieldRow icon={Tag} label={t.editLeadModal.statusLabel} value={status} editing>
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

            {/* Notes Card with Voice Input */}
            <GlassCard title={t.editLeadModal.notesTitle} icon={StickyNote}>
              {editing ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Textarea
                      value={notes}
                      onChange={e => { setNotes(e.target.value); }}
                      placeholder={speechToText.isListening ? t.editLeadModal.notesListening : t.editLeadModal.notesPlaceholder}
                      className={`min-h-[80px] resize-none text-sm pr-12 ${editRing} ${speechToText.isListening ? 'border-violet-500/40' : ''}`}
                    />
                    {/* Mic button */}
                    {speechToText.isSupported && (
                      <button
                        type="button"
                        onClick={speechToText.toggle}
                        className={`absolute right-2 bottom-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full border transition-all duration-300 ${
                          speechToText.isListening
                            ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_16px_-2px_rgba(139,92,246,0.5)] animate-pulse'
                            : 'bg-white/[0.05] border-white/[0.1] text-zinc-500 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10'
                        }`}
                        aria-label={speechToText.isListening ? t.editLeadModal.stopDictation : t.editLeadModal.startDictation}
                      >
                        {speechToText.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {/* Interim transcript preview */}
                  {speechToText.isListening && speechToText.interimTranscript && (
                    <p className="text-xs text-violet-400/70 italic px-1">
                      {speechToText.interimTranscript}
                    </p>
                  )}
                  {isDictated && (
                    <p className="text-[10px] text-zinc-600 flex items-center gap-1 px-1">
                      <Mic className="w-3 h-3" /> {t.editLeadModal.dictatedByVoice}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {notes || t.editLeadModal.noNotes}
                </p>
              )}
            </GlassCard>

            {/* Linked Proposal Banner */}
            {hasProposal && !editing && (
              <button
                onClick={() => navigate('/proposals')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-violet-500/15 bg-violet-500/[0.06] hover:bg-violet-500/[0.1] transition-colors group/link"
              >
                <FileText className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-violet-300 font-medium flex-1 text-left">
                  {linkedProposal ? t.editLeadModal.proposalBannerLabel.replace("{{status}}", linkedProposal.status) : t.editLeadModal.proposalCreated}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-violet-500 group-hover/link:text-violet-300 transition-colors" />
              </button>
            )}

            {/* Activity Timeline */}
            {activityEvents.length > 0 && !editing && (
              <GlassCard title={t.editLeadModal.activityTitle} icon={Clock}>
                <div className="mt-1">
                  {activityEvents.map((event, i) => (
                    <ActivityItem key={event.id} event={event} isLast={i === activityEvents.length - 1} />
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Delete zone */}
            {editing && isAdmin && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-destructive/15 text-destructive/60 hover:text-destructive hover:bg-destructive/5 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                {t.editLeadModal.deleteLead}
              </button>
            )}
          </div>

          {/* ─── Sticky Footer ─── */}
          <div className="border-t border-white/[0.06] px-6 py-4 bg-[hsl(240_6%_7%/0.92)] backdrop-blur-xl flex-shrink-0">
            {editing ? (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1 h-11" disabled={saving}>
                  {t.editLeadModal.cancel}
                </Button>
                <Button onClick={handleSave} className="flex-1 h-11 btn-violet" disabled={saving}>
                  {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t.editLeadModal.saving}</> : t.editLeadModal.saveChanges}
                </Button>
              </div>
            ) : advancing ? (
              <div className="flex items-center justify-center gap-3 h-11 text-violet-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">{t.editLeadModal.creatingProposal}</span>
              </div>
            ) : !isConverted && !hasProposal ? (
              <Button
                onClick={handleAdvanceInPanel}
                className="w-full h-11 bg-gradient-to-r from-violet-600/25 to-violet-500/15 text-violet-300 border border-violet-500/20 hover:from-violet-600/35 hover:to-violet-500/25 hover:text-violet-200 transition-all"
              >
                {t.editLeadModal.advanceToProposal}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : hasProposal ? (
              <Button
                onClick={() => navigate('/proposals')}
                variant="outline"
                className="w-full h-11 border-violet-500/20 text-violet-400 hover:bg-violet-500/10"
              >
                <FileText className="w-4 h-4 mr-2" />
                {t.editLeadModal.viewProposal}
              </Button>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.editLeadModal.deleteDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.editLeadModal.deleteDialogDesc.replace("{{name}}", lead.name)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.editLeadModal.deleteDialogCancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t.editLeadModal.deleteDialogConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
