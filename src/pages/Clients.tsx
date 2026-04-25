import { useState, useMemo, useRef } from "react";
import { ListCardSkeleton } from "@/components/ui/skeleton-card";
import { useCatalog } from "@/hooks/useCatalog";
import { Client } from "@/contexts/ClientsContext";
import { useClientsQuery } from "@/hooks/queries/useClientsQuery";
import { useProjectsQuery } from "@/hooks/queries/useProjectsQuery";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/i18n/LanguageContext";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, X, Users, TrendingUp, FolderOpen, LayoutGrid, List, Upload, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientTableView } from "@/components/clients/ClientTableView";
import { ClientsPagination } from "@/components/clients/ClientsPagination";
import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/image";

const emptyForm = { clientName: '', contactName: '', primaryEmail: '', primaryPhone: '', address: '', website: '', serviceType: '', notes: '' };
const PAGE_SIZE = 12;

export default function Clients() {
  const { t } = useLanguage();
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const { projects } = useProjects();
  const { canDelete, canEdit } = useUserRole();
  const { toast } = useToast();
  const { items: catalogServices } = useCatalog("lead_service");
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clientStats = useMemo(() => {
    const stats: Record<string, { total: number; byStatus: Record<string, number>; latestDate: string | null }> = {};
    for (const p of projects) {
      if (!stats[p.clientId]) stats[p.clientId] = { total: 0, byStatus: {}, latestDate: null };
      const s = stats[p.clientId];
      s.total++;
      s.byStatus[p.status] = (s.byStatus[p.status] || 0) + 1;
      if (!s.latestDate || p.createdAt > s.latestDate) s.latestDate = p.createdAt;
    }
    return stats;
  }, [projects]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return clients;
    return clients.filter(c =>
      c.clientName.toLowerCase().includes(s) ||
      (c.primaryEmail || '').toLowerCase().includes(s) ||
      (c.primaryPhone || '').toLowerCase().includes(s)
    );
  }, [clients, search]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => {
      const pa = clientStats[a.id]?.total || 0;
      const pb = clientStats[b.id]?.total || 0;
      if (pb !== pa) return pb - pa;
      return a.clientName.localeCompare(b.clientName);
    }),
    [filtered, clientStats]
  );

  const totalItems = sorted.length;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, currentPage]);

  useMemo(() => { setCurrentPage(1); }, [search]);

  const totalProjects = projects.length;
  const activeClients = clients.filter(c => (clientStats[c.id]?.total || 0) > 0).length;

  const resetLogoState = () => {
    if (logoPreview && !logoPreview.startsWith('http')) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openNew = () => { setEditingClient(null); setForm(emptyForm); resetLogoState(); setModalOpen(true); };
  const openEdit = (c: Client) => {
    setEditingClient(c);
    setForm({
      clientName: c.clientName, contactName: c.contactName || '', primaryEmail: c.primaryEmail || '',
      primaryPhone: c.primaryPhone || '', address: c.address || '', website: c.website || '',
      serviceType: c.serviceType || '', notes: c.notes || ''
    });
    setLogoPreview(c.logoUrl || null);
    setLogoFile(null);
    setModalOpen(true);
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: t.clients.toasts.invalidFormat, description: t.clients.toasts.invalidFormatDesc, variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: t.clients.toasts.fileTooLarge, description: t.clients.toasts.fileTooLargeDesc, variant: "destructive" });
      return;
    }
    try {
      const compressed = await compressImage(file, 400, 400, 0.8);
      setLogoFile(compressed);
      if (logoPreview && !logoPreview.startsWith('http')) URL.revokeObjectURL(logoPreview);
      setLogoPreview(URL.createObjectURL(compressed));
    } catch (err) {
      console.error('Logo compress error:', err);
      toast({ title: t.clients.toasts.imageError, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!form.clientName.trim()) return;
    setSaving(true);
    try {
      let logoUrl: string | null | undefined = undefined;

      // Upload new logo if selected
      if (logoFile) {
        const ext = logoFile.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `clients/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('company-logos')
          .upload(fileName, logoFile, { upsert: true });
        if (uploadError) {
          console.error('Logo upload error:', uploadError);
          throw new Error('Error al subir el logo: ' + uploadError.message);
        }
        const { data: urlData } = supabase.storage.from('company-logos').getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }

      if (editingClient) {
        const updates: Partial<Omit<Client, 'id' | 'companyId'>> = {
          clientName: form.clientName.trim(),
          contactName: form.contactName.trim() || null,
          primaryEmail: form.primaryEmail.trim() || null,
          primaryPhone: form.primaryPhone.trim() || null,
          address: form.address.trim() || null,
          website: form.website.trim() || null,
          serviceType: form.serviceType || null,
          notes: form.notes.trim() || null,
        };
        if (logoUrl !== undefined) updates.logoUrl = logoUrl;
        await updateClient(editingClient.id, updates);
        toast({ title: t.clients.toasts.updated });
      } else {
        await addClient({
          clientName: form.clientName.trim(),
          contactName: form.contactName.trim() || null,
          primaryEmail: form.primaryEmail.trim() || null,
          primaryPhone: form.primaryPhone.trim() || null,
          address: form.address.trim() || null,
          website: form.website.trim() || null,
          serviceType: form.serviceType || null,
          notes: form.notes.trim() || null,
          logoUrl: logoUrl || null,
        });
        toast({ title: t.clients.toasts.created });
      }
      resetLogoState();
      setModalOpen(false);
    } catch (err: any) {
      console.error('Client save error:', err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClient(deleteId);
      toast({ title: t.clients.toasts.deleted });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  return (
    <ResponsiveLayout title={t.clients.title} subtitle={t.clients.subtitle} icon={Users}>
      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: t.clients.kpi.total, value: clients.length, icon: Users, iconBg: 'rgba(255,255,255,0.04)', iconColor: 'hsl(25,95%,53%)' },
          { label: t.clients.kpi.active, value: activeClients, icon: TrendingUp, iconBg: 'rgba(22,163,74,0.10)', iconColor: '#16A34A' },
          { label: t.clients.kpi.projects, value: totalProjects, icon: FolderOpen, iconBg: 'rgba(255,255,255,0.04)', iconColor: 'hsl(0,0%,55%)' },
          { label: t.clients.kpi.avgProjects, value: clients.length ? (totalProjects / clients.length).toFixed(1) : '0', icon: TrendingUp, iconBg: 'rgba(217,119,6,0.10)', iconColor: '#D97706' },
         ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="kpi-card card-interactive glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-[10px]" style={{ background: kpi.iconBg }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.iconColor }} />
                </div>
                <div>
                  <p className="kpi-label">{kpi.label}</p>
                  <p className="kpi-value">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t.clients.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-10" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center border border-border/50 rounded-lg p-0.5 gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 w-8 p-0', viewMode === 'grid' && 'bg-primary/20 text-primary')}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 w-8 p-0', viewMode === 'table' && 'bg-primary/20 text-primary')}
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {canEdit && (
          <Button onClick={openNew} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md hover:shadow-lg transition-all btn-spring rounded-[10px]">
            <Plus className="w-4 h-4 mr-2" /> {t.clients.addClient}
          </Button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ListCardSkeleton key={i} />)}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 empty-state-pattern rounded-xl">
          <Users className="w-12 h-12 text-primary/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{search ? t.clients.emptySearch : t.clients.emptyDefault}</h3>
          <p className="text-muted-foreground mb-6 text-sm">{search ? t.clients.emptySearchHint : t.clients.emptyDefaultHint}</p>
          {!search && <Button onClick={openNew} size="lg"><Plus className="w-4 h-4 mr-2" /> {t.clients.addClient}</Button>}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {paginatedClients.map((c, i) => (
                <ClientCard
                  key={c.id}
                  client={c}
                  stats={clientStats[c.id]}
                  index={i}
                  isAdmin={canDelete}
                  onEdit={canEdit ? openEdit : undefined}
                  onDelete={canDelete ? setDeleteId : undefined}
                />
              ))}
            </motion.div>
          ) : (
            <ClientTableView
              key="table"
              clients={paginatedClients}
              clientStats={clientStats}
              isAdmin={canDelete}
              onEdit={canEdit ? openEdit : undefined}
              onDelete={canDelete ? setDeleteId : undefined}
            />
          )}
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && sorted.length > 0 && (
        <ClientsPagination
          currentPage={currentPage}
          totalItems={totalItems}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Add/Edit Modal with Logo Upload */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { resetLogoState(); } setModalOpen(open); }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-lg font-semibold">{editingClient ? t.clients.modal.editTitle : t.clients.modal.newTitle}</DialogTitle></DialogHeader>
          <div className="space-y-5">
            {/* Avatar/Logo Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                {logoPreview ? (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/[0.06] shadow-lg">
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { resetLogoState(); }}
                      className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center">
                    <ClientAvatar name={form.clientName || 'C'} size="lg" className="w-20 h-20 text-xl" />
                  </div>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              <p className="text-[11px] text-muted-foreground">{t.clients.form.logoHint}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.clients.form.company}</Label>
                <Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder={t.clients.form.companyPlaceholder} className="min-h-[44px]" />
              </div>
              <div className="space-y-2">
                <Label>{t.clients.form.contact}</Label>
                <Input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} placeholder={t.clients.form.contactPlaceholder} className="min-h-[44px]" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.clients.form.phone}</Label>
                <Input value={form.primaryPhone} onChange={e => setForm(f => ({ ...f, primaryPhone: e.target.value }))} placeholder={t.clients.form.phonePlaceholder} className="min-h-[44px]" />
              </div>
              <div className="space-y-2">
                <Label>{t.clients.form.email}</Label>
                <Input type="email" value={form.primaryEmail} onChange={e => setForm(f => ({ ...f, primaryEmail: e.target.value }))} placeholder={t.clients.form.emailPlaceholder} className="min-h-[44px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.clients.form.serviceType}</Label>
              <Select value={form.serviceType} onValueChange={v => setForm(f => ({ ...f, serviceType: v }))}>
                <SelectTrigger className="min-h-[44px]"><SelectValue placeholder={t.clients.form.serviceTypePlaceholder} /></SelectTrigger>
                <SelectContent>
                  {catalogServices.map(s => <SelectItem key={s.value} value={s.label}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.clients.form.address}</Label>
              <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder={t.clients.form.addressPlaceholder} className="min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label>{t.clients.form.website}</Label>
              <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder={t.clients.form.websitePlaceholder} className="min-h-[44px]" />
            </div>
            <div className="space-y-2">
              <Label>{t.clients.form.notes}</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetLogoState(); setModalOpen(false); }}>{t.clients.cancel}</Button>
            <Button onClick={handleSave} disabled={saving || !form.clientName.trim()}>{saving ? t.clients.saving : t.clients.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.clients.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{t.clients.deleteDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.clients.deleteDialog.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t.clients.deleteDialog.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ResponsiveLayout>
  );
}
