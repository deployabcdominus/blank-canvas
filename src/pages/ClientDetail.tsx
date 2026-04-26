import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { AuditLogsService, type AuditLogEntry } from "@/services/audit-logs.service";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect } from "react";
import { useClients } from "@/contexts/ClientsContext";
import { useProjects, type Project } from "@/contexts/ProjectsContext";
import { useProposals, type Proposal } from "@/contexts/ProposalsContext";
import { usePayments } from "@/contexts/PaymentsContext";
import { ClientAvatar } from "@/components/clients/ClientAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Mail, Phone, StickyNote, FolderOpen, FileText, BarChart3,
  Calendar, MapPin, TrendingUp, DollarSign, CheckCircle, Clock, ExternalLink,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VisualStatusTracker } from "@/components/VisualStatusTracker";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_COLORS: Record<string, string> = {
  Lead: "bg-soft-blue/20 text-soft-blue border-soft-blue/30",
  Proposal: "bg-lavender/20 text-lavender border-lavender/30",
  Production: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Installation: "bg-pale-pink/20 text-pale-pink border-pale-pink/30",
  Completed: "bg-mint/20 text-mint border-mint/30",
};

const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  Borrador: "bg-muted text-muted-foreground",
  "Enviada externamente": "bg-soft-blue/20 text-soft-blue",
  Aprobada: "bg-mint/20 text-mint",
  Rechazada: "bg-destructive/20 text-destructive",
};

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, companyId } = useUserRole();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { proposals } = useProposals();
  const { payments } = usePayments();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const client = clients.find((c) => c.id === id);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!id || !companyId || !isAdmin) return;
      setLoadingLogs(true);
      const { data } = await AuditLogsService.getAll(companyId);
      if (data) {
        // Filter logs specifically for this client
        const filtered = (data as AuditLogEntry[]).filter(
          log => log.entity_id === id || (log.details && log.details.client_id === id)
        );
        setAuditLogs(filtered);
      }
      setLoadingLogs(false);
    };
    fetchLogs();
  }, [id, companyId, isAdmin]);

  const clientProjects = useMemo(
    () => projects.filter((p) => p.clientId === id),
    [projects, id]
  );

  const clientProposals = useMemo(
    () => proposals.filter((p) => p.client === client?.clientName),
    [proposals, client?.clientName]
  );

  const metrics = useMemo(() => {
    const totalProjects = clientProjects.length;
    const completedProjects = clientProjects.filter((p) => p.status === "Completed").length;
    const totalProposalValue = clientProposals.reduce((s, p) => s + p.value, 0);
    const approvedProposals = clientProposals.filter((p) => p.status === "Aprobada");
    const approvedValue = approvedProposals.reduce((s, p) => s + (p.approvedTotal ?? p.value), 0);
    const totalPaid = approvedProposals.reduce((s, p) => s + payments.filter((pay) => pay.proposalId === p.id && pay.status === "received").reduce((ps, pay) => ps + pay.amount, 0), 0);
    const conversionRate = clientProposals.length > 0 ? Math.round((approvedProposals.length / clientProposals.length) * 100) : 0;
    const byStatus: Record<string, number> = {};
    clientProjects.forEach((p) => { byStatus[p.status] = (byStatus[p.status] || 0) + 1; });

    return { totalProjects, completedProjects, totalProposalValue, approvedValue, totalPaid, conversionRate, byStatus };
  }, [clientProjects, clientProposals, payments]);

  if (!client) {
    return (
      <PageTransition>
        <ResponsiveLayout>
          <div className="text-center py-20">
            <h2 className="text-xl font-bold mb-2">Cliente no encontrado</h2>
            <Button onClick={() => navigate("/clients")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Clientes
            </Button>
          </div>
        </ResponsiveLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <ResponsiveLayout>
        {/* Back + Header */}
        <Button variant="ghost" size="sm" onClick={() => navigate("/clients")} className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Clientes
        </Button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
          <div className="flex items-start gap-4 flex-wrap">
            <ClientAvatar name={client.clientName} logoUrl={client.logoUrl} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{client.clientName}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Cliente desde {formatDistanceToNow(new Date(client.createdAt), { addSuffix: true, locale: es })}
              </p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                {client.primaryEmail && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-soft-blue" /> {client.primaryEmail}
                  </span>
                )}
                {client.primaryPhone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-mint" /> {client.primaryPhone}
                  </span>
                )}
              </div>
              {client.notes && (
                <p className="text-xs text-muted-foreground/70 mt-2 flex items-start gap-1.5">
                  <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {client.notes}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList className="w-full justify-start bg-muted/30 border border-border/30">
            <TabsTrigger value="projects" className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <FolderOpen className="w-3.5 h-3.5" /> Proyectos
            </TabsTrigger>
            <TabsTrigger value="proposals" className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <FileText className="w-3.5 h-3.5" /> Propuestas
            </TabsTrigger>
            <TabsTrigger value="metrics" className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary">
              <BarChart3 className="w-3.5 h-3.5" /> Métricas
            </TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects">
            {clientProjects.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground">Sin proyectos registrados</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientProjects.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals">
            {clientProposals.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground">Sin propuestas registradas</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientProposals.map((proposal, i) => (
                  <ProposalMiniCard key={proposal.id} proposal={proposal} index={i} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard icon={FolderOpen} label="Total Proyectos" value={metrics.totalProjects} color="text-soft-blue" />
              <MetricCard icon={CheckCircle} label="Completados" value={metrics.completedProjects} color="text-mint" />
              <MetricCard icon={DollarSign} label="Valor Propuestas" value={`$${metrics.totalProposalValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}`} color="text-lavender" />
              <MetricCard icon={TrendingUp} label="Conversión" value={`${metrics.conversionRate}%`} color="text-pale-pink" />
              <MetricCard icon={DollarSign} label="Aprobado" value={`$${metrics.approvedValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}`} color="text-mint" />
              <MetricCard icon={DollarSign} label="Cobrado" value={`$${metrics.totalPaid.toLocaleString("en-US", { minimumFractionDigits: 0 })}`} color="text-soft-blue" />
            </div>

            {/* Status breakdown */}
            {Object.keys(metrics.byStatus).length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Desglose por Estado</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(metrics.byStatus).map(([status, count]) => (
                    <Badge key={status} variant="outline" className={`text-xs px-2.5 py-1 ${STATUS_COLORS[status] || ""}`}>
                      {count} {status}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </ResponsiveLayout>
    </PageTransition>
  );
};

/* --- Sub-components --- */

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card p-4 card-interactive"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm truncate flex-1">{project.projectName}</h4>
        <Badge variant="outline" className={`text-[10px] ml-2 ${STATUS_COLORS[project.status] || ""}`}>
          {project.status}
        </Badge>
      </div>
      <div className="mb-2">
        <VisualStatusTracker currentStatus={project.status} compact />
      </div>
      {project.installAddress && (
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <MapPin className="w-3 h-3 shrink-0" /> {project.installAddress}
        </p>
      )}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Calendar className="w-3 h-3 shrink-0" />
        {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: es })}
      </p>
    </motion.div>
  );
}

function ProposalMiniCard({ proposal, index }: { proposal: Proposal; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card p-4 card-interactive"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm truncate flex-1">{proposal.project}</h4>
        <Badge className={`text-[10px] ml-2 ${PROPOSAL_STATUS_COLORS[proposal.status] || ""}`}>
          {proposal.status}
        </Badge>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <p className="text-lg font-bold">
          ${proposal.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        {proposal.approvalToken && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`/p/${proposal.approvalToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-6 w-6 rounded-md text-violet-500 hover:bg-violet-500/10 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-3.5 h-3.5" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Ver términos y detalles de la propuesta</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(proposal.createdAt).toLocaleDateString("es-ES")}
        </span>
        {proposal.sentDate && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Enviada
          </span>
        )}
      </div>
    </motion.div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg bg-muted/30 ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

export default ClientDetail;
