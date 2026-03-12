import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Camera, Calendar, CheckCircle, Truck, Clock, Share2, Search, Trash2 } from "lucide-react";
import { ScheduleInstallationModal } from "@/components/ScheduleInstallationModal";
import { InstallationPhotos } from "@/components/InstallationPhotos";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInstallations } from "@/contexts/InstallationsContext";
import { useUserRole } from "@/hooks/useUserRole";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Installation = () => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { installations, addInstallation, updateInstallation, clearInstallations } = useInstallations();
  const { canEdit, canDelete } = useUserRole();

  const filteredInstallations = useMemo(() => {
    if (!searchTerm.trim()) return installations;
    
    const search = searchTerm.toLowerCase();
    return installations.filter(installation => 
      installation.client.toLowerCase().includes(search) ||
      installation.project.toLowerCase().includes(search) ||
      installation.address.toLowerCase().includes(search) ||
      installation.technician.toLowerCase().includes(search) ||
      installation.status.toLowerCase().includes(search) ||
      installation.notes.toLowerCase().includes(search)
    );
  }, [installations, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled": return "bg-soft-blue text-soft-blue-foreground";
      case "In Progress": return "bg-lavender text-lavender-foreground";
      case "Completed": return "bg-mint text-mint-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Scheduled": return <Calendar className="w-4 h-4" />;
      case "In Progress": return <Truck className="w-4 h-4" />;
      case "Completed": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleMarkAsInstalled = async (installationId: string) => {
    await updateInstallation(installationId, { status: "Completed" });
    toast({
      title: "Ejecución completada",
      description: "La ejecución fue marcada como completada con éxito.",
    });
  };

  const handleClearInstallations = async () => {
    await clearInstallations();
    setIsClearDialogOpen(false);
    toast({
      title: "Ejecuciones eliminadas",
      description: "Todas las ejecuciones fueron eliminadas con éxito.",
    });
  };

  const handleScheduleInstallation = async (data: any) => {
    await addInstallation({
      client: data.service.client,
      project: data.service.project,
      status: "Scheduled" as const,
      address: data.address,
      scheduledDate: data.date.toISOString().split('T')[0],
      scheduledTime: data.time,
      technician: data.installerCompany.contact,
      notes: data.notes || `Empresa instaladora: ${data.installerCompany.name}. ${data.contactName ? `Contacto: ${data.contactName}` : ''}${data.contactPhone ? ` - ${data.contactPhone}` : ''}${data.contactEmail ? ` - ${data.contactEmail}` : ''}`,
      projectId: null,
    });
  };

  const handleShareInstallation = (installation: any) => {
    const summary = `
EJECUCIÓN - ${installation.status.toUpperCase()}

Cliente: ${installation.client}
Proyecto: ${installation.project}
Dirección: ${installation.address}
Fecha: ${installation.scheduledDate}
Horario: ${installation.scheduledTime}
Técnico: ${installation.technician}

${installation.notes ? `Observaciones: ${installation.notes}` : ''}
    `.trim();

    navigator.clipboard.writeText(summary).then(() => {
      toast({
        title: "¡Información copiada!",
        description: "Los detalles de la ejecución fueron copiados al portapapeles.",
      });
    });
  };

  return (
    <PageTransition>
      <ResponsiveLayout title="Ejecuciones" subtitle="Agende y haga seguimiento de ejecuciones">
          <div className="flex items-center justify-end mb-6">
            <div className="flex gap-2">
              {installations.length > 0 && canDelete && (
                <Button 
                  onClick={() => setIsClearDialogOpen(true)}
                  variant="destructive"
                  className="btn-glass"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpiar Ejecuciones
                </Button>
              )}
              {canEdit && (
                <Button 
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="btn-glass bg-pale-pink text-pale-pink-foreground hover:bg-pale-pink-hover"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Ejecución
                </Button>
              )}
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ejecuciones por cliente, proyecto, dirección, técnico o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass pl-10"
              />
            </div>
          </div>

          <div className="space-y-6">
            {filteredInstallations.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Ninguna ejecución encontrada</h3>
                <p className="text-muted-foreground">
                  {searchTerm.trim() 
                    ? "Intente ajustar los términos de búsqueda"
                    : "Ninguna ejecución ha sido agendada aún"
                  }
                </p>
              </div>
            ) : (
              filteredInstallations.map((installation, index) => (
              <motion.div
                key={installation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="glass-card p-6 hover:glow-pink transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{installation.client}</h3>
                      <Badge className={getStatusColor(installation.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(installation.status)}
                          {installation.status}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-soft-blue-foreground font-medium mb-4">
                      {installation.project}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{installation.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{installation.scheduledDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{installation.scheduledTime}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm text-muted-foreground">Técnico: </span>
                      <span className="font-medium">{installation.technician}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Notas de Ejecución</Label>
                    <Textarea
                      className="glass mt-2 min-h-[80px]"
                      defaultValue={installation.notes}
                      readOnly={installation.status === "Completed"}
                    />
                  </div>

                    {(installation.status === "In Progress" || installation.status === "Completed") && (
                     <InstallationPhotos
                       installationId={String(installation.id)}
                       isReadOnly={installation.status === "Completed"}
                     />
                   )}

                  {installation.status === "In Progress" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location" className="text-sm font-medium">Ubicación Final</Label>
                        <Input
                          id="location"
                          placeholder="Detalles exactos de la ubicación"
                          className="glass mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="completion-notes" className="text-sm font-medium">Notas de Finalización</Label>
                        <Input
                          id="completion-notes"
                          placeholder="Notas finales u observaciones"
                          className="glass mt-2"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                  <div className="text-xs text-muted-foreground">
                    {installation.status === "Completed" ? "Completada" : "Última actualización"} hace 1 hora
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleShareInstallation(installation)}
                      size="sm"
                      variant="outline"
                      className="btn-glass"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartir
                    </Button>
                    {installation.status === "In Progress" && (
                      <Button 
                        onClick={() => handleMarkAsInstalled(installation.id)}
                        size="sm" 
                        className="btn-glass bg-mint text-mint-foreground hover:bg-mint-hover"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Marcar como Completado
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
              ))
            )}
          </div>

        <ScheduleInstallationModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSchedule={handleScheduleInstallation}
        />

        <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esto eliminará todas las ejecuciones. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearInstallations}>
                Sí, limpiar instalaciones
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ResponsiveLayout>
    </PageTransition>
  );
};

export default Installation;