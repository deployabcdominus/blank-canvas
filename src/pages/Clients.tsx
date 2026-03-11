import { useState, useMemo } from "react";
import { useClients, Client } from "@/contexts/ClientsContext";
import { useProjects } from "@/contexts/ProjectsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, X, Users, TrendingUp, FolderOpen, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientTableView } from "@/components/clients/ClientTableView";
import { ClientsPagination } from "@/components/clients/ClientsPagination";
import { cn } from "@/lib/utils";

const emptyForm = { clientName: '', primaryEmail: '', primaryPhone: '', notes: '' };
const PAGE_SIZE = 12;

export default function Clients() {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const { projects } = useProjects();
  const { canDelete, canEdit } = useUserRole();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset page when search changes
  const totalItems = sorted.length;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => { setCurrentPage(1); }, [search]);

  const totalProjects = projects.length;
  const activeClients = clients.filter(c => (clientStats[c.id]?.total || 0) > 0).length;

  const openNew = () => { setEditingClient(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c: Client) => {
    setEditingClient(c);
    setForm({ clientName: c.clientName, primaryEmail: c.primaryEmail || '', primaryPhone: c.primaryPhone || '', notes: c.notes || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.clientName.trim()) return;
    setSaving(true);
    try {
      if (editingClient) {
        await updateClient(editingClient.id, {
          clientName: form.clientName.trim(),
          primaryEmail: form.primaryEmail.trim() || null,
          primaryPhone: form.primaryPhone.trim() || null,
          notes: form.notes.trim() || null,
        });
        toast({ title: "Cliente actualizado" });
      } else {
        await addClient({
          clientName: form.clientName.trim(),
          primaryEmail: form.primaryEmail.trim() || null,
          primaryPhone: form.primaryPhone.trim() || null,
          notes: form.notes.trim() || null,
          logoUrl: null,
        });
        toast({ title: "Cliente creado" });
      }
      setModalOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteClient(deleteId);
      toast({ title: "Cliente eliminado" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  return (
    <ResponsiveLayout title="Clientes" subtitle="Gestione sus clientes" icon={Users}>
      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Clientes', value: clients.length, icon: Users },
          { label: 'Clientes Activos', value: activeClients, icon: TrendingUp },
          { label: 'Total Proyectos', value: totalProjects, icon: FolderOpen },
          { label: 'Prom. Proy/Cliente', value: clients.length ? (totalProjects / clients.length).toFixed(1) : '0', icon: TrendingUp },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-soft-blue/10">
                  <kpi.icon className="w-4 h-4 text-soft-blue" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-lg font-bold">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Toolbar: Search + View Switcher + Add */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-10" />
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
            className={cn('h-8 w-8 p-0', viewMode === 'grid' && 'bg-soft-blue/20 text-soft-blue')}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 w-8 p-0', viewMode === 'table' && 'bg-soft-blue/20 text-soft-blue')}
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        <Button onClick={openNew} className="btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue/90">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-muted-foreground text-center py-12">Cargando...</p>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">{search ? 'Sin resultados' : 'No hay clientes'}</h3>
          <p className="text-muted-foreground mb-4">{search ? 'Intente otros términos.' : 'Cree su primer cliente.'}</p>
          {!search && <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Nuevo Cliente</Button>}
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
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={setDeleteId}
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

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del cliente *</Label>
              <Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="Ej: Acme Corp" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.primaryEmail} onChange={e => setForm(f => ({ ...f, primaryEmail: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={form.primaryPhone} onChange={e => setForm(f => ({ ...f, primaryPhone: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.clientName.trim()}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este cliente?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción también eliminará los proyectos asociados. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ResponsiveLayout>
  );
}
