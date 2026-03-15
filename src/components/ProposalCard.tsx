import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Proposal, ProposalStatus } from "@/contexts/ProposalsContext";
import { usePayments } from "@/contexts/PaymentsContext";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ProposalPDF } from "@/components/proposals/ProposalPDF";
import {
  Clock, CheckCircle, XCircle, ExternalLink, Edit2, Trash2, Factory,
  Calendar, Mail, Link2, User, RefreshCw, DollarSign, Download, Copy,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<ProposalStatus, { color: string; icon: React.ReactNode; label: string }> = {
  'Borrador': { color: 'bg-muted text-muted-foreground', icon: <Clock className="w-3 h-3" />, label: 'Borrador' },
  'Enviada externamente': { color: 'bg-soft-blue text-soft-blue-foreground', icon: <ExternalLink className="w-3 h-3" />, label: 'Enviada' },
  'Aprobada': { color: 'bg-mint text-mint-foreground', icon: <CheckCircle className="w-3 h-3" />, label: 'Aprobada' },
  'Rechazada': { color: 'bg-destructive/10 text-destructive', icon: <XCircle className="w-3 h-3" />, label: 'Rechazada' },
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

function getPaymentStatus(totalPaid: number, totalApproved: number): { label: string; color: string } {
  if (totalPaid <= 0) return { label: 'Sin pagar', color: 'text-destructive' };
  if (totalPaid >= totalApproved) return { label: 'Pagado', color: 'text-green-400' };
  return { label: 'Parcial', color: 'text-amber-400' };
}

interface ProposalCardProps {
  proposal: Proposal;
  index: number;
  onEdit: (p: Proposal) => void;
  onDelete: (id: string) => void;
  onCreateOrder: (p: Proposal) => void;
  onRegisterPayment?: (p: Proposal) => void;
  companyData?: { name: string; logo_url?: string | null } | null;
}

export const ProposalCard = ({ proposal, index, onEdit, onDelete, onCreateOrder, onRegisterPayment, companyData }: ProposalCardProps) => {
  const navigate = useNavigate();
  const { getTotalPaidForProposal } = usePayments();
  const cfg = STATUS_CONFIG[proposal.status] || STATUS_CONFIG['Borrador'];
  const currentStep = getStepIndex(proposal.status);

  const logoUrl = proposal.lead?.logoUrl;
  const companyName = proposal.lead?.company || proposal.client;
  const contactName = proposal.lead?.name || proposal.client;
  const initials = companyName.slice(0, 2).toUpperCase();

  const isApproved = proposal.status === 'Aprobada';
  const totalApproved = proposal.approvedTotal ?? proposal.value;
  const totalPaid = getTotalPaidForProposal(proposal.id);
  const balance = totalApproved - totalPaid;
  const payStatus = getPaymentStatus(totalPaid, totalApproved);

  const handleLeadClick = () => {
    if (proposal.leadId) {
      navigate(`/leads?highlight=${proposal.leadId}`);
    }
  };

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
        <Badge className={`${cfg.color} shrink-0 text-[11px]`}>
          <span className="flex items-center gap-1">{cfg.icon}{cfg.label}</span>
        </Badge>
      </div>

      {/* Project + Price */}
      <p className="text-sm text-muted-foreground mb-1 truncate">{proposal.project}</p>
      <p className="text-2xl font-extrabold tracking-tight mb-3">
        ${proposal.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>

      {/* Payment summary (only for approved) */}
      {isApproved && (
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
            <p className="text-[10px] text-muted-foreground">Pagado</p>
            <p className="text-xs font-bold text-green-400">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
            <p className="text-[10px] text-muted-foreground">Saldo</p>
            <p className="text-xs font-bold text-amber-400">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/20 border border-border/10">
            <p className="text-[10px] text-muted-foreground">Estado</p>
            <p className={`text-xs font-bold ${payStatus.color}`}>{payStatus.label}</p>
          </div>
        </div>
      )}

      {/* Mini Pipeline */}
      {proposal.status !== 'Rechazada' && (
        <div className="flex items-center gap-1 mb-3">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center gap-1 flex-1">
              <div className={`h-1.5 rounded-full flex-1 transition-colors ${i <= currentStep ? 'bg-soft-blue' : 'bg-muted/60'}`} />
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
      <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          {new Date(proposal.createdAt).toLocaleDateString('es-ES')}
        </span>
        {proposal.sentDate && (
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            Enviada: {new Date(proposal.sentDate).toLocaleDateString('es-ES')}
          </span>
        )}
        {proposal.sentMethod && (
          <span className="flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 shrink-0" />
            {proposal.sentMethod}
          </span>
        )}
        {proposal.updatedAt && (
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            Actualizado: {new Date(proposal.updatedAt).toLocaleDateString('es-ES')}
          </span>
        )}
      </div>

      {proposal.description && !proposal.description.match(/^Propuesta creada a partir del lead:/i) && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{proposal.description}</p>
      )}

      {proposal.leadId ? (
        <button
          onClick={handleLeadClick}
          className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline mb-3 w-fit cursor-pointer"
        >
          <User className="w-3.5 h-3.5" />
          Lead: {proposal.lead?.name || 'Ver lead'}
          <ExternalLink className="w-3 h-3" />
        </button>
      ) : (
        <p className="text-xs text-muted-foreground/50 mb-3">Lead: No disponible</p>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/30 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => onEdit(proposal)} className="text-xs h-8 px-2.5">
          <Edit2 className="w-3.5 h-3.5 mr-1" /> Editar
        </Button>
        {isApproved && (
          <>
            <Button
              size="sm"
              onClick={() => onCreateOrder(proposal)}
              className="text-xs h-8 px-2.5 bg-mint text-mint-foreground hover:bg-mint/80"
            >
              <Factory className="w-3.5 h-3.5 mr-1" /> Orden
            </Button>
            {onRegisterPayment && (
              <Button
                size="sm"
                onClick={() => onRegisterPayment(proposal)}
                className="text-xs h-8 px-2.5"
                variant="outline"
              >
                <DollarSign className="w-3.5 h-3.5 mr-1" /> Pago
              </Button>
            )}
          </>
        )}
        {companyData && (
          <PDFDownloadLink
            document={<ProposalPDF proposal={proposal} company={companyData} />}
            fileName={`propuesta-${proposal.client.replace(/\s+/g, '-')}-${proposal.id.slice(0, 8)}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <Button size="sm" variant="ghost" className="text-xs h-8 px-2 text-muted-foreground hover:text-primary" disabled={pdfLoading} title="Descargar PDF">
                {pdfLoading ? (
                  <span className="animate-spin inline-block w-3.5 h-3.5 border border-current border-t-transparent rounded-full" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
              </Button>
            )}
          </PDFDownloadLink>
        )}
        <div className="flex-1" />
        <Button size="sm" variant="ghost" onClick={() => onDelete(proposal.id)} className="text-xs h-8 px-2 text-destructive hover:text-destructive">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
};
