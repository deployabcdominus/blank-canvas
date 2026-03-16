import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ArrowRight, UserPlus, FolderKanban, Pencil, Eye, CheckCircle2 } from "lucide-react";
import { Lead } from "@/contexts/LeadsContext";
import { Proposal } from "@/contexts/ProposalsContext";
import { LeadPipelineStepper, getLeadPipelineStage } from "@/components/LeadPipelineStepper";

interface LeadCardProps {
  lead: Lead;
  proposals: Proposal[];
  index: number;
  isMobile: boolean;
  onAdvance: (leadId: string) => void;
  onAssign?: (leadId: string) => void;
  onConvert?: (leadId: string) => void;
  onEdit?: (lead: Lead) => void;
  onCardClick?: (lead: Lead) => void;
  onViewProposal?: (proposalId: string) => void;
}

/* Soft badge style: 10% opacity bg, full opacity text */
const getStatusColor = (status: string) => {
  switch (status) {
    case "Nuevo": return "bg-primary/10 text-primary border-primary/20";
    case "Contactado": return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "Seguimiento": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Calificado": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "Convertido": return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
};

function getLeadProposal(leadId: string, proposals: Proposal[]): Proposal | null {
  const approved = proposals.find(p => p.leadId === leadId && p.status === 'Aprobada');
  if (approved) return approved;
  const linked = proposals
    .filter(p => p.leadId === leadId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return linked[0] || null;
}

function getProposalBadge(proposal: Proposal | null) {
  if (!proposal) return { label: "Sin propuesta", className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" };
  switch (proposal.status) {
    case "Enviada externamente": return { label: "Propuesta enviada", className: "bg-sky-500/10 text-sky-400 border-sky-500/20" };
    case "Aprobada": return { label: "Propuesta aprobada", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
    case "Rechazada": return { label: "Propuesta rechazada", className: "bg-red-500/10 text-red-400 border-red-500/20" };
    default: return { label: "Borrador", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
  }
}

export const LeadCard = ({ lead, proposals, index, isMobile, onAdvance, onAssign, onConvert, onEdit, onCardClick, onViewProposal }: LeadCardProps) => {
  const linkedProposal = getLeadProposal(lead.id, proposals);
  const proposalBadge = getProposalBadge(linkedProposal);
  const isConverted = lead.status === 'Convertido' || !!lead.clientId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="rounded-xl border border-white/[0.06] bg-zinc-900/60 hover:border-primary/15 transition-all duration-300 p-5 md:p-6 flex flex-col justify-between group cursor-pointer shimmer-hover"
      role="article"
      aria-labelledby={`lead-${lead.id}-company`}
      onClick={() => onCardClick?.(lead)}
    >
      {/* Header: Company + Lead Status */}
      <div>
        <div className={`flex items-start justify-between mb-3 ${isMobile ? 'flex-col gap-2' : ''}`}>
          <div className="flex items-center gap-3 min-w-0">
            {lead.logoUrl ? (
              <img src={lead.logoUrl} alt={`Logo ${lead.company}`} className="w-11 h-11 rounded-xl object-contain border border-white/[0.06] bg-white/[0.03] flex-shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-xl border border-white/[0.06] bg-white/[0.03] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-zinc-500">{lead.company?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
            )}
            <div className="min-w-0">
              <h3
                id={`lead-${lead.id}-company`}
                className="text-base font-bold truncate text-zinc-100"
              >
                {lead.company}
              </h3>
              <p className="text-zinc-400 text-sm truncate">{lead.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${getStatusColor(lead.status)} ${isMobile ? 'self-end' : ''} flex-shrink-0`}>
              {isConverted && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {lead.status}
            </Badge>
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(lead); }}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/[0.05] text-zinc-500 hover:text-foreground"
                aria-label="Editar lead"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Service type */}
        <p className="text-sm font-medium text-zinc-400 mb-2">{lead.service}</p>

        {/* Price block */}
        <div className="mb-3">
          {linkedProposal ? (
            <p className="text-2xl font-bold text-zinc-100">
              ${linkedProposal.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          ) : (
            <p className="text-lg font-semibold text-zinc-600">Precio por definir</p>
          )}
          <Badge variant="outline" className={`mt-1 text-xs ${proposalBadge.className}`}>
            {proposalBadge.label}
          </Badge>
        </div>

        {/* Contact info */}
        <div className="space-y-1.5 mb-4">
          <a
            href={`tel:${lead.contact.phone}`}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-foreground transition-colors"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            {lead.contact.phone}
          </a>
          <a
            href={`mailto:${lead.contact.email}`}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-foreground transition-colors"
          >
            <Mail className="w-3.5 h-3.5" aria-hidden="true" />
            {lead.contact.email}
          </a>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            {lead.contact.location}
          </div>
        </div>

        {/* Pipeline stepper */}
        <div className="mb-4">
          <LeadPipelineStepper currentStage={getLeadPipelineStage(lead.status, linkedProposal?.status)} />
        </div>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-3 border-t border-white/[0.06] ${isMobile ? 'flex-col gap-3' : ''}`} onClick={e => e.stopPropagation()}>
        <span className="text-xs text-zinc-600">
          hace {lead.daysAgo} día{lead.daysAgo !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          {isConverted ? (
            /* Lead already converted — show "View Proposal" if one exists */
            linkedProposal && onViewProposal ? (
              <Button
                onClick={() => onViewProposal(linkedProposal.id)}
                size="sm"
                variant="outline"
                className="h-9 px-3 text-xs border-violet-500/20 text-violet-400 hover:bg-violet-500/10"
                aria-label="Ver propuesta de este lead"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Ver Propuesta
              </Button>
            ) : null
          ) : (
            /* Lead not converted — show normal actions */
            <>
              {onConvert && (
                <Button
                  onClick={() => onConvert(lead.id)}
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 text-xs"
                  aria-label="Convertir a Cliente/Proyecto"
                >
                  <FolderKanban className="w-3.5 h-3.5 mr-1" />
                  Convertir
                </Button>
              )}
              {onAssign && (
                <Button
                  onClick={() => onAssign(lead.id)}
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 text-xs"
                  aria-label="Asignar lead"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  Asignar
                </Button>
              )}
              <Button
                onClick={() => onAdvance(lead.id)}
                size="sm"
                className={`min-h-[40px] font-medium ${isMobile ? 'w-full' : 'px-4'}`}
                aria-label={`Avanzar lead de ${lead.name} a propuesta`}
              >
                Avanzar a Propuesta
                <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
