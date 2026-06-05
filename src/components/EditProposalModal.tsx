import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Proposal, ProposalStatus, SentMethod } from "@/types/domain";
import { useLanguage } from "@/i18n/LanguageContext";

type FormData = {
  client: string;
  project: string;
  value: string;
  description: string;
  sentDate?: string;
  sentMethod?: string;
  status: string;
  sentVia?: string;
  externalSentReference?: string;
  sentNotes?: string;
  clientApproved?: boolean;
  clientApprovalDate?: string;
  initialPaymentRequired?: boolean;
  initialPaymentReceived?: boolean;
  initialPaymentAmount?: string;
  adminOverrideApproval?: boolean;
  adminOverrideReason?: string;
  approvedForProduction?: boolean;
};

const STATUSES: ProposalStatus[] = ['Borrador', 'Enviada externamente', 'Aprobada', 'Rechazada'];

interface EditProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  onEditProposal: (id: string, updates: Partial<Proposal>) => Promise<void>;
}

export const EditProposalModal = ({ isOpen, onClose, proposal, onEditProposal }: EditProposalModalProps) => {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>();

  useEffect(() => {
    if (proposal) {
      reset({
        client: proposal.client,
        project: proposal.project,
        value: String(proposal.value),
        description: proposal.description,
        sentDate: proposal.sentDate || undefined,
        sentMethod: proposal.sentMethod || undefined,
        status: proposal.status,
        sentVia: proposal.sentVia,
        externalSentReference: proposal.externalSentReference,
        sentNotes: proposal.sentNotes,
        clientApproved: proposal.clientApproved,
        clientApprovalDate: proposal.clientApprovalDate || undefined,
        initialPaymentRequired: proposal.initialPaymentRequired,
        initialPaymentReceived: proposal.initialPaymentReceived,
        initialPaymentAmount: proposal.initialPaymentAmount ? String(proposal.initialPaymentAmount) : undefined,
        adminOverrideApproval: proposal.adminOverrideApproval,
        adminOverrideReason: proposal.adminOverrideReason || undefined,
        approvedForProduction: proposal.approvedForProduction,
      });
    }
  }, [proposal, reset]);

  const onSubmit = async (data: FormData) => {
    if (!proposal) return;
    setSubmitting(true);
    try {
      await onEditProposal(proposal.id, {
        client: data.client,
        project: data.project,
        value: parseFloat(data.value),
        description: data.description,
        sentDate: data.sentDate || null,
        sentMethod: (data.sentMethod as SentMethod) || null,
        status: data.status as ProposalStatus,
        sentVia: data.sentVia,
        externalSentReference: data.externalSentReference,
        sentNotes: data.sentNotes,
        clientApproved: data.clientApproved,
        clientApprovalDate: data.clientApprovalDate || null,
        initialPaymentRequired: data.initialPaymentRequired,
        initialPaymentReceived: data.initialPaymentReceived,
        initialPaymentAmount: data.initialPaymentAmount ? parseFloat(data.initialPaymentAmount) : null,
        adminOverrideApproval: data.adminOverrideApproval,
        adminOverrideReason: data.adminOverrideReason || null,
        approvedForProduction: data.approvedForProduction,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.proposals.addProposal /* Fallback to existing key */}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Input {...register("client")} required />
            </div>
            <div className="space-y-2">
              <Label>Proyecto</Label>
              <Input {...register("project")} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input {...register("value")} type="number" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea {...register("description")} className="min-h-[100px]" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>{t.common.cancel}</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : t.common.save}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};