import { useState } from "react";
import { useProjects, Project, ProjectStatus } from "@/contexts/ProjectsContext";
import { useClients } from "@/contexts/ClientsContext";
import { useCompany } from "@/hooks/useCompany";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, X, FolderKanban, Copy, FolderOpen, Pencil, Trash2, Globe } from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProjectMapView } from "@/components/ProjectMapView";
import { useSearchParams } from "react-router-dom";

const STATUSES: ProjectStatus[] = ['Lead', 'Proposal', 'Production', 'Installation', 'Completed'];
const statusColors: Record<ProjectStatus, string> = {
  Lead: 'bg-blue-500/20 text-blue-400',
  Proposal: 'bg-yellow-500/20 text-yellow-400',
  Production: 'bg-orange-500/20 text-orange-400',
  Installation: 'bg-purple-500/20 text-purple-400',
  Completed: 'bg-green-500/20 text-green-400',
};

const emptyForm = { projectName: '', clientId: '', installAddress: '', status: 'Lead' as ProjectStatus, folderRelativePath: '' };

export default function Projects() {
  const { user } = useAuth();
  const { projects, loading, addProject, updateProject, deleteProject } = useProjects();
  const { clients } = useClients();
  const { company } = useCompany();
  const { canDelete, canEdit } = useUserRole();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'list';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);

  const networkEnabled = (company as any)?.enable_network_index ?? false;
  const networkBasePath = (company as any)?.network_base_path ?? '';

  const filtered = projects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return p.projectName.toLowerCase().includes(s) ||
      (p.clientName || '').toLowerCase().includes(s) ||
      p.installAddress.toLowerCase().includes(s);
  });

  const openNew = () => { setEditingProject(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: Project) => {
    setEditingProject(p);
    setForm({
      projectName: p.projectName,
      clientId: p.clientId,
      installAddress: p.installAddress,
      status: p.status,
      folderRelativePath: p.folderRelativePath || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.projectName.trim() || !form.clientId) return;
    setSaving(true);
    try {
      const folderRelative = form.folderRelativePath.trim() || null;
      const folderFull = folderRelative && networkBasePath ? `${networkBasePath}${folderRelative}` : null;

      if (editingProject) {
        await updateProject(editingProject.id, {
          projectName: form.projectName.trim(),
          clientId: form.clientId,
          installAddress: form.installAddress.trim(),
          status: form.status,
          folderRelativePath: folderRelative,
          folderFullPath: folderFull,
        });
        toast({ title: "Proyecto actualizado" });
      } else {
        await addProject({
          clientId: form.clientId,
          projectName: form.projectName.trim(),
          installAddress: form.installAddress.trim(),
          status: form.status,
          ownerUserId: user!.id,
          assignedToUserId: null,
          folderRelativePath: folderRelative,
          folderFullPath: folderFull,
        });
        toast({ title: "Proyecto creado" });
      }
      setModalOpen(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteProject(deleteId); toast({ title: "Proyecto eliminado" }); } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setDeleteId(null);
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    toast({ title: "Ruta copiada al portapapeles" });
  };

  return (
    <ResponsiveLayout title="Proyectos" subtitle="Seguimiento de todos los proyectos" icon={FolderKanban}>
      <Tabs value={activeTab} onValueChange={v => setSearchParams({ tab: v })} className="w-full">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <TabsList className="bg-muted/30">
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="map" className="gap-1.5">
              <Globe className="w-4 h-4" />
              Mapa
            </TabsTrigger>
          </TabsList>

          {activeTab === 'list' && (
            <div className="flex items-center gap-4 flex-wrap flex-1 justify-end">
              <div className="relative min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar proyectos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-10" />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {canEdit && (
                <Button onClick={openNew} className="btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue/90">
                  <Plus className="w-4 h-4 mr-2" /> Nuevo Proyecto
                </Button>
              )}
            </div>
          )}
        </div>

        <TabsContent value="list" className="mt-0">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <ListCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">{search || statusFilter !== 'all' ? 'Sin resultados' : 'No hay proyectos'}</h3>
              <p className="text-muted-foreground mb-4">{search ? 'Intente otros términos.' : 'Cree su primer proyecto.'}</p>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="glass-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setDetailProject(p)}>
                    <CardHeader className="pb-2 flex flex-row items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{p.projectName}</CardTitle>
                        <p className="text-xs text-muted-foreground">{p.clientName}</p>
                      </div>
                      <Badge className={statusColors[p.status]}>{p.status}</Badge>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {p.installAddress && <p className="line-clamp-1">{p.installAddress}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <ProjectMapView />
        </TabsContent>
      </Tabs>

      {/* Project Detail Modal */}
      <Dialog open={!!detailProject} onOpenChange={open => { if (!open) setDetailProject(null); }}>
        <DialogContent className="max-w-lg">
          {detailProject && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{detailProject.projectName}</span>
                  <Badge className={statusColors[detailProject.status]}>{detailProject.status}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Cliente:</span> <span className="font-medium">{detailProject.clientName}</span></div>
                  <div><span className="text-muted-foreground">Dirección:</span> <span className="font-medium">{detailProject.installAddress || '—'}</span></div>
                </div>
                {networkEnabled && networkBasePath ? (
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Archivos (Red)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {detailProject.folderFullPath || detailProject.folderRelativePath ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted/50 px-2 py-1 rounded flex-1 truncate">
                            {detailProject.folderFullPath || `${networkBasePath}${detailProject.folderRelativePath}`}
                          </code>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); copyPath(detailProject.folderFullPath || `${networkBasePath}${detailProject.folderRelativePath}`); }}>
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">Sin ruta de carpeta configurada.</p>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Índice de carpetas de red desactivado.</p>
                )}
              </div>
              <DialogFooter>
                {canEdit && (
                  <Button variant="outline" onClick={() => { setDetailProject(null); openEdit(detailProject); }}>
                    <Pencil className="w-4 h-4 mr-2" /> Editar
                  </Button>
                )}
                {canDelete && (
                  <Button variant="destructive" onClick={() => { setDetailProject(null); setDeleteId(detailProject.id); }}>
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del proyecto *</Label>
              <Input value={form.projectName} onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={form.clientId} onValueChange={v => setForm(f => ({ ...f, clientId: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.clientName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dirección de ejecución *</Label>
              <Input value={form.installAddress} onChange={e => setForm(f => ({ ...f, installAddress: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ProjectStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {networkEnabled && (
              <div className="space-y-2">
                <Label>Ruta relativa de carpeta</Label>
                <Input value={form.folderRelativePath} onChange={e => setForm(f => ({ ...f, folderRelativePath: e.target.value }))} placeholder="Ej: ClienteName\Address\" />
                <p className="text-xs text-muted-foreground">Se concatena con: {networkBasePath || '(no configurado)'}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving || !form.projectName.trim() || !form.clientId}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este proyecto?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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
