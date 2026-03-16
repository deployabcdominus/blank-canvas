import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Proposal, ProposalStatus } from "@/contexts/ProposalsContext";
import { usePayments } from "@/contexts/PaymentsContext";
import {
  Clock, CheckCircle, XCircle, Send, Edit2, Trash2, Factory,
  Calendar, DollarSign, FileText,
} from "lucide-react";

const STATUS_CONFIG: Record<ProposalStatus, { color: string; icon: React.ReactNode; label: string }> = {
  'Borrador': { color: 'bg-muted/30 text-muted-foreground border-border/30', icon: <Clock className="w-3 h-3" />, label: 'Borrador' },
  'Enviada externamente': { color: 'bg-primary/10 text-primary border-primary/20', icon: <Send className="w-3 h-3" />, label: 'Enviada' },
  'Aprobada': { color: 'bg-mint/15 text-mint border-mint/25', icon: <CheckCircle className="w-3 h-3" />, label: 'Aprobada' },
  'Rechazada': { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: <XCircle className="w-3 h-3" />, label: 'Rechazada' },
};

const PIPELINE_STEPS: { key: ProposalStatus; label: string }[] = [
  { key: 'Borrador', label: 'Borrador' },
  { key: 'Enviada externamente', label: 'Enviada' },
  { key: 'Aprobada', label: 'Aprobada' },
];

function getStepIndex(status: ProposalStatus): number {
  if (status === 'Rechazada') return -1;
  return PIPELINE_STEPS.findIndex(s => s.key === status);
}

interface ProposalCardProps {
  proposal: Proposal;
  index: number;
  onEdit?: (p: Proposal) => void;
  onDelete?: (id: string) => void;
  onCreateOrder?: (p: Proposal) => void;
  onRegisterPayment?: (p: Proposal) => void;
  companyData?: { name: string; logo_url?: string | null } | null;
}

export const ProposalCard = ({ proposal, index, onEdit, onDelete, onCreateOrder, onRegisterPayment }: ProposalCardProps) => {
  const { getTotalPaidForProposal } = usePayments();
  const cfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG['Borrador'];
  const currentStep = getStepIndex(proposal.status);

  const companyName = proposal.lead?.company || proposal.client;
  const contactName = proposal.lead?.name || proposal.client;
  const initials = companyName.slice(0, 2).toUpperCase();
  const logoUrl = proposal.lead?.logoUrl;

  const isApproved = proposal.status === 'Aprobada';
  const hasOrder = proposal.hasOrder;
  const totalApproved = proposal.approvedTotal ?? proposal.value;
  const totalPaid = getTotalPaidForProposal(proposal.id);
  const balance = totalApproved - totalPaid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="glass-card p-5 hover:glow-blue transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center overflow-hidden flex-shrink-0 border border-border/30">
          {logoUrl ? (
            <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-muted-foreground">{initials}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold truncate leading-tight">{companyName}</h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{contactName}</p>
        </div>
        <Badge variant="outline" className={`${cfg.color} shrink-0 text-[11px]`}>
          <span className="flex items-center gap-1">{cfg.icon}{cfg.label}</span>
        </Badge>
      </div>

      {/* Project */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
        <FileText className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{proposal.project}</span>
      </div>

      {/* Amount */}
      <p className="text-2xl font-extrabold tracking-tight mb-3">
        ${proposal.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>

      {/* Description */}
      {proposal.description && (
        <p className="text-xs text-muted-foreground line-clamp-3 mb-3 leading-relaxed">{proposal.description}</p>
      )}

      {/* Payment summary (only for approved) */}
      {isApproved && (
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
            <p className="text-[10px] text-muted-foreground">Pagado</p>
            <p className="text-xs font-bold text-mint">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
            <p className="text-[10px] text-muted-foreground">Saldo</p>
            <p className="text-xs font-bold text-primary">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
            <p className="text-[10px] text-muted-foreground">Total</p>
            <p className="text-xs font-bold">${totalApproved.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      )}

      {/* Mini Pipeline */}
      {proposal.status !== 'Rechazada' && (
        <div className="flex items-center gap-1 mb-3">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center gap-1 flex-1">
              <div className={`h-1.5 rounded-full flex-1 transition-colors ${i <= currentStep ? 'bg-primary' : 'bg-muted/60'}`} />
            </div>
          ))}
          <span className="text-[10px] text-muted-foreground ml-1 whitespace-nowrap">
            {PIPELINE_STEPS[Math.max(0, currentStep)]?.label}
          </span>
        </div>
      )}
      {proposal.status === 'Rechazada' && (
        <div className="flex items-center gap-1 mb-3">
          <div className="h-1.5 rounded-full flex-1 bg-destructive/40" />
          <span className="text-[10px] text-destructive ml-1">Rechazada</span>
        </div>
      )}

      {/* Meta */}
      <div className="text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          Creada: {new Date(proposal.createdAt).toLocaleDateString('es-ES')}
        </span>
      </div>

      <div className="flex-1" />

      {/* Actions — simplified */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/30 flex-wrap">
        {onEdit && (
          <Button size="sm" variant="outline" onClick={() => onEdit(proposal)} className="text-xs h-8 px-2.5">
            <Edit2 className="w-3.5 h-3.5 mr-1" /> Editar
          </Button>
        )}
        {isApproved && onCreateOrder && (
          <Button
            size="sm"
            onClick={() => !hasOrder && onCreateOrder(proposal)}
            disabled={hasOrder}
            className={`text-xs h-8 px-2.5 ${hasOrder
              ? 'border-zinc-800 text-zinc-600 opacity-60 cursor-not-allowed hover:bg-transparent'
              : 'bg-mint text-mint-foreground hover:bg-mint/80'
            }`}
            variant={hasOrder ? 'outline' : 'default'}
          >
            <Factory className="w-3.5 h-3.5 mr-1" /> {hasOrder ? 'Orden Generada' : 'Orden'}
          </Button>
        )}
        {isApproved && onRegisterPayment && (
          <Button size="sm" onClick={() => onRegisterPayment(proposal)} className="text-xs h-8 px-2.5" variant="outline">
            <DollarSign className="w-3.5 h-3.5 mr-1" /> Pago
          </Button>
        )}
        <div className="flex-1" />
        {onDelete && (
          <Button size="sm" variant="ghost" onClick={() => onDelete(proposal.id)} className="text-xs h-8 px-2 text-destructive hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
