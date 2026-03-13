import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ArrowRight, UserPlus, FolderKanban, Pencil } from "lucide-react";
import { Lead } from "@/contexts/LeadsContext";
import { Proposal } from "@/contexts/ProposalsContext";

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
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Nuevo": return "bg-mint text-mint-foreground";
    case "Contactado": return "bg-soft-blue text-soft-blue-foreground";
    case "Seguimiento": return "bg-lavender text-lavender-foreground";
    case "Calificado": return "bg-pale-pink text-pale-pink-foreground";
    default: return "bg-muted text-muted-foreground";
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
  if (!proposal) return { label: "Sin propuesta", className: "bg-muted text-muted-foreground" };
  switch (proposal.status) {
    case "Enviada externamente": return { label: "Propuesta enviada", className: "bg-soft-blue/20 text-soft-blue-foreground" };
    case "Aprobada": return { label: "Propuesta aprobada", className: "bg-mint/20 text-mint-foreground" };
    case "Rechazada": return { label: "Propuesta rechazada", className: "bg-destructive/10 text-destructive" };
    default: return { label: "Borrador", className: "bg-lavender/20 text-lavender-foreground" };
  }
}

export const LeadCard = ({ lead, proposals, index, isMobile, onAdvance, onAssign, onConvert, onEdit, onCardClick }: LeadCardProps) => {
  const linkedProposal = getLeadProposal(lead.id, proposals);
  const proposalBadge = getProposalBadge(linkedProposal);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className="glass-card hover:glow-mint transition-all duration-300 p-5 md:p-6 flex flex-col justify-between group cursor-pointer"
      role="article"
      aria-labelledby={`lead-${lead.id}-company`}
      onClick={() => onCardClick?.(lead)}
    >
      {/* Header: Company + Lead Status */}
      <div>
        <div className={`flex items-start justify-between mb-3 ${isMobile ? 'flex-col gap-2' : ''}`}>
          <div className="flex items-center gap-3 min-w-0">
            {lead.logoUrl ? (
              <img src={lead.logoUrl} alt={`Logo ${lead.company}`} className="w-11 h-11 rounded-xl object-contain border border-border bg-muted flex-shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-xl border border-border bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-muted-foreground">{lead.company?.charAt(0)?.toUpperCase() || '?'}</span>
              </div>
            )}
            <div className="min-w-0">
              <h3
                id={`lead-${lead.id}-company`}
                className="text-base md:text-lg font-bold truncate"
              >
                {lead.company}
              </h3>
              <p className="text-muted-foreground text-sm truncate">{lead.name}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(lead.status)} ${isMobile ? 'self-end' : ''} flex-shrink-0`}>
            {lead.status}
          </Badge>
        </div>

        {/* Service type */}
        <p className="text-sm font-medium text-soft-blue-foreground mb-3">{lead.service}</p>

        {/* Price block */}
        <div className="mb-3">
          {linkedProposal ? (
            <p className="text-2xl font-bold text-mint-foreground">
              ${linkedProposal.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          ) : (
            <p className="text-lg font-semibold text-muted-foreground">Precio por definir</p>
          )}
          <Badge variant="outline" className={`mt-1 text-xs ${proposalBadge.className}`}>
            {proposalBadge.label}
          </Badge>
        </div>

        {/* Contact info */}
        <div className="space-y-1.5 mb-4">
          <a
            href={`tel:${lead.contact.phone}`}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            {lead.contact.phone}
          </a>
          <a
            href={`mailto:${lead.contact.email}`}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="w-3.5 h-3.5" aria-hidden="true" />
            {lead.contact.email}
          </a>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            {lead.contact.location}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-3 border-t border-border/50 ${isMobile ? 'flex-col gap-3' : ''}`}>
        <span className="text-xs text-muted-foreground">
          hace {lead.daysAgo} día{lead.daysAgo !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          {onConvert && !lead.companyId && (
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
            className={`bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover min-h-[40px] rounded-lg font-medium ${isMobile ? 'w-full' : 'px-4'}`}
            aria-label={`Avanzar lead de ${lead.name} a propuesta`}
          >
            Avanzar a Propuesta
            <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
