import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { Sidebar } from "@/components/Sidebar";
import { MobileMenu } from "@/components/MobileMenu";
import { useLeads, Lead } from "@/contexts/LeadsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useBreakpoint } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Undo2, Trash2, Menu, AlertTriangle, Recycle, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FIXED_BRANDING } from "@/contexts/SettingsContext";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale/es";

const LeadsRecycleBin = () => {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const { fetchDeletedLeads, restoreLead, permanentDeleteLead, refreshLeads } = useLeads();
  const { isAdmin } = useUserRole();
  const [deletedLeads, setDeletedLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"leads" | "projects">("leads");
  const [deletedProjects, setDeletedProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmProjectDeleteId, setConfirmProjectDeleteId] = useState<string | null>(null);

  const isMobile = breakpoint === "mobile";
  const isTablet = breakpoint === "tablet";
  const sidebarWidth = isMobile ? 0 : isTablet ? 80 : 256;

  const loadDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDeletedLeads();
      setDeletedLeads(data);
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar los leads eliminados.", variant: "destructive" });
    }
    setLoading(false);
  }, [fetchDeletedLeads]);

  const loadDeletedProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const { data } = await supabase
        .from('projects')
        .select('id, project_name, status, deleted_at, client_id, company_id')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });
      setDeletedProjects(data || []);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudieron cargar los proyectos eliminados.", variant: "destructive" });
    }
    setLoadingProjects(false);
  }, []);

  useEffect(() => { loadDeleted(); }, [loadDeleted]);
  useEffect(() => { if (activeTab === 'projects') loadDeletedProjects(); }, [activeTab, loadDeletedProjects]);

  const handleRestore = async (id: string) => {
    try {
      await restoreLead(id);
      setDeletedLeads(prev => prev.filter(l => l.id !== id));
      await refreshLeads();
      toast({ title: "Lead restaurado", description: "El lead fue devuelto a la lista activa." });
    } catch {
      toast({ title: "Error", description: "No se pudo restaurar el lead.", variant: "destructive" });
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await permanentDeleteLead(confirmDeleteId);
      setDeletedLeads(prev => prev.filter(l => l.id !== confirmDeleteId));
      toast({ title: "Eliminado permanentemente", description: "El lead fue eliminado de forma irreversible." });
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el lead.", variant: "destructive" });
    }
    setConfirmDeleteId(null);
  };

  const handleRestoreProject = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').update({ deleted_at: null }).eq('id', id);
      if (error) throw error;
      setDeletedProjects(prev => prev.filter(p => p.id !== id));
      toast({ title: "Proyecto restaurado", description: "El proyecto fue devuelto." });
    } catch {
      toast({ title: "Error", description: "No se pudo restaurar el proyecto.", variant: "destructive" });
    }
  };

  const handlePermanentDeleteProject = async () => {
    if (!confirmProjectDeleteId) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', confirmProjectDeleteId);
      if (error) throw error;
      setDeletedProjects(prev => prev.filter(p => p.id !== confirmProjectDeleteId));
      toast({ title: "Proyecto eliminado permanentemente" });
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar el proyecto.", variant: "destructive" });
    }
    setConfirmProjectDeleteId(null);
  };

  if (!isAdmin) {
    return (
      <PageTransition>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center" style={{ marginLeft: `${sidebarWidth}px` }}>
            <p className="text-muted-foreground">No tienes permisos para acceder a esta sección.</p>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="flex min-h-screen">
        <Sidebar />
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        <main
          className={`flex-1 transition-all duration-300 ${isMobile ? "p-4" : "p-6"}`}
          style={{ marginLeft: `${sidebarWidth}px` }}
        >
          {isMobile && (
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="hover:bg-white/10 min-h-[44px] min-w-[44px]">
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-bold">{FIXED_BRANDING.appName}</h1>
            </div>
          )}

          <Button variant="ghost" size="sm" onClick={() => navigate("/leads")} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Leads
          </Button>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <Recycle className="w-6 h-6 text-violet-400" />
              <h1 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>Papelera de Reciclaje</h1>
              <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                {deletedLeads.length}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">Leads eliminados que pueden ser restaurados o eliminados permanentemente.</p>

            {/* Tab switcher */}
            <div className="mt-3 inline-flex rounded-lg overflow-hidden border border-transparent">
              <button
                onClick={() => setActiveTab('leads')}
                className={`px-3 py-1 text-sm font-semibold ${activeTab === 'leads' ? 'text-violet-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                style={activeTab === 'leads' ? { background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.18)' } : {}}
              >
                Leads
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-3 py-1 text-sm font-semibold ${activeTab === 'projects' ? 'text-violet-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                style={activeTab === 'projects' ? { background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.18)' } : {}}
              >
                Projects
              </button>
            </div>
          </div>

          {/* Retention notice */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300/80">
              Los elementos en la papelera se eliminan permanentemente tras <strong>30 días</strong>.
            </p>
          </div>

          {activeTab === 'leads' ? (
            loading ? (
              <div className="text-center py-12 text-muted-foreground">Cargando...</div>
            ) : deletedLeads.length === 0 ? (
              <div className="text-center py-16">
                <Recycle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold mb-2 text-muted-foreground">La papelera está vacía</h3>
                <p className="text-sm text-muted-foreground/60">No hay leads eliminados para mostrar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {deletedLeads.map((lead, i) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-sm group hover:border-violet-500/20 transition-all"
                    >
                      {/* Logo */}
                      <div className="w-10 h-10 rounded-lg border border-white/[0.06] bg-white/[0.03] flex items-center justify-center shrink-0">
                        {lead.logoUrl ? (
                          <img src={lead.logoUrl} alt="" className="w-10 h-10 rounded-lg object-contain" />
                        ) : (
                          <span className="text-sm font-bold text-zinc-500">{lead.company?.charAt(0)?.toUpperCase() || "?"}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate text-zinc-200">{lead.company || lead.name}</h4>
                        <p className="text-xs text-zinc-500 truncate">{lead.name} · {lead.service}</p>
                      </div>

                      {/* Status */}
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px] shrink-0">
                        Eliminado
                      </Badge>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs border-violet-500/20 text-violet-400 hover:bg-violet-500/10"
                          onClick={() => handleRestore(lead.id)}
                        >
                          <Undo2 className="w-3.5 h-3.5 mr-1.5" /> Restaurar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                          onClick={() => setConfirmDeleteId(lead.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Eliminar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )
          ) : (
            // Projects tab
            loadingProjects ? (
              <div className="text-center py-12 text-muted-foreground">Cargando proyectos...</div>
            ) : deletedProjects.length === 0 ? (
              <div className="text-center py-16">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold mb-2 text-muted-foreground">No hay proyectos eliminados</h3>
                <p className="text-sm text-muted-foreground/60">Los proyectos eliminados aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {deletedProjects.map((proj, i) => (
                    <motion.div
                      key={proj.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -40 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-zinc-900/60 backdrop-blur-sm group hover:border-violet-500/20 transition-all"
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-lg border border-white/[0.06] bg-white/[0.03] flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-zinc-400" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate text-zinc-200">{proj.project_name}</h4>
                        <p className="text-xs text-zinc-500 truncate">Eliminado hace {formatDistanceToNow(new Date(proj.deleted_at), { locale: es })}</p>
                      </div>

                      {/* Status badge */}
                      <Badge variant="outline" className="bg-zinc-700/10 text-zinc-200 border-zinc-700/20 text-[10px] shrink-0">
                        {proj.status}
                      </Badge>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs border-violet-500/20 text-violet-400 hover:bg-violet-500/10"
                          onClick={() => handleRestoreProject(proj.id)}
                        >
                          <Undo2 className="w-3.5 h-3.5 mr-1.5" /> Restaurar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                          onClick={() => setConfirmProjectDeleteId(proj.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Eliminar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )
          )}

          {/* Permanent delete confirmation */}
          <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
            <AlertDialogContent className="bg-zinc-900/80 backdrop-blur-2xl border-white/[0.08] shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg">⚠️ Eliminación permanente</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  Esta acción eliminará el lead de forma <strong className="text-zinc-200">irreversible</strong>. No podrá ser recuperado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-zinc-700 text-zinc-300">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handlePermanentDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Eliminar para siempre
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Permanent delete confirmation (projects) */}
          <AlertDialog open={!!confirmProjectDeleteId} onOpenChange={(open) => !open && setConfirmProjectDeleteId(null)}>
            <AlertDialogContent className="bg-zinc-900/80 backdrop-blur-2xl border-white/[0.08] shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg">⚠️ Eliminación permanente</AlertDialogTitle>
                <AlertDialogDescription className="text-zinc-400">
                  Esta acción eliminará el proyecto de forma <strong className="text-zinc-200">irreversible</strong>. No podrá ser recuperado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-zinc-700 text-zinc-300">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handlePermanentDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Eliminar para siempre
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </PageTransition>
  );
};

export default LeadsRecycleBin;
