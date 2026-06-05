import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateField } from "@/components/ui/date-field";
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

const SENT_METHODS: SentMethod[] = ['Gmail', 'WhatsApp', 'PDF físico', 'Otro'];
const STATUSES: ProposalStatus[] = ['Borrador', 'Enviada externamente', 'Aprobada', 'Rechazada'];

interface EditProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProposal: (data: Partial<Proposal> & { id: string }) => void;
  proposal: Proposal | null;
}

export const EditProposalModal = ({ isOpen, onClose, onEditProposal, proposal }: EditProposalModalProps) => {
  const { t } = useLanguage();
  const m = t.editProposalModal;

  const schema = useMemo(() => z.object({
    client: z.string().min(1, m.clientRequired),
    project: z.string().min(1, m.projectRequired),
    value: z.string().min(1, m.amountRequired),
    description: z.string().min(1, m.descriptionRequired),
    sentDate: z.string().optional(),
    sentMethod: z.string().optional(),
    status: z.string().min(1, m.statusRequired),
    sentVia: z.string().optional(),
    externalSentReference: z.string().optional(),
    sentNotes: z.string().optional(),
    clientApproved: z.boolean().optional(),
    clientApprovalDate: z.string().optional(),
    initialPaymentRequired: z.boolean().optional(),
    initialPaymentReceived: z.boolean().optional(),
    initialPaymentAmount: z.string().optional(),
    adminOverrideApproval: z.boolean().optional(),
    adminOverrideReason: z.string().optional(),
    approvedForProduction: z.boolean().optional(),
  }), [m]);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({ resolver: zodResolver(schema) });
  const watchPaymentRequired = watch("initialPaymentRequired");
  const watchAdminOverride = watch("adminOverrideApproval");
  const [sentDateValue, setSentDateValue] = useState("");
  const [approvalDateValue, setApprovalDateValue] = useState("");

  useEffect(() => {
    if (proposal) {
      setValue("client", proposal.client);
      setValue("project", proposal.project);
      setValue("value", proposal.value.toString());
      setValue("description", proposal.description);
      setValue("status", proposal.status);
      setValue("sentDate", proposal.sentDate || '');
      setSentDateValue(proposal.sentDate || '');
      setValue("sentMethod", proposal.sentMethod || '');
      
      setValue("sentVia", proposal.sentVia || '');
      setValue("externalSentReference", proposal.externalSentReference || '');
      setValue("sentNotes", proposal.sentNotes || '');
      setValue("clientApproved", !!proposal.clientApproved);
      setValue("clientApprovalDate", proposal.clientApprovalDate || '');
      setApprovalDateValue(proposal.clientApprovalDate || '');
      setValue("initialPaymentRequired", !!proposal.initialPaymentRequired);
      setValue("initialPaymentReceived", !!proposal.initialPaymentReceived);
      setValue("initialPaymentAmount", proposal.initialPaymentAmount?.toString() || '');
      setValue("adminOverrideApproval", !!proposal.adminOverrideApproval);
      setValue("adminOverrideReason", proposal.adminOverrideReason || '');
      setValue("approvedForProduction", !!proposal.approvedForProduction);
    }
  }, [proposal, setValue]);

  const onSubmit = (data: FormData) => {
    if (!proposal) return;
    onEditProposal({
      id: proposal.id,
      client: data.client,
      project: data.project,
      value: parseFloat(data.value.replace(/[^0-9.]/g, '')) || 0,
      description: data.description,
      status: data.status as ProposalStatus,
      sentDate: sentDateValue || null,
      sentMethod: (data.sentMethod as SentMethod) || null,
      sentVia: data.sentVia,
      externalSentReference: data.externalSentReference,
      sentNotes: data.sentNotes,
      clientApproved: data.clientApproved,
      clientApprovalDate: approvalDateValue || null,
      initialPaymentRequired: data.initialPaymentRequired,
      initialPaymentReceived: data.initialPaymentReceived,
      initialPaymentAmount: data.initialPaymentAmount ? parseFloat(data.initialPaymentAmount) : null,
      adminOverrideApproval: data.adminOverrideApproval,
      adminOverrideReason: data.adminOverrideReason,
      approvedForProduction: data.approvedForProduction,
    });
    handleClose();
  };

  const handleClose = () => { reset(); setSentDateValue(""); setApprovalDateValue(""); onClose(); };

  if (!proposal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{m.title}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{m.clientLabel}</Label>
              <Input {...register("client")} />
              {errors.client && <p className="text-sm text-destructive mt-1">{errors.client.message}</p>}
            </div>
            <div>
              <Label>{m.projectLabel}</Label>
              <Input {...register("project")} />
              {errors.project && <p className="text-sm text-destructive mt-1">{errors.project.message}</p>}
            </div>
          </div>
          <div>
            <Label>{m.amountLabel}</Label>
            <Input {...register("value")} placeholder={m.amountPlaceholder} />
            {errors.value && <p className="text-sm text-destructive mt-1">{errors.value.message}</p>}
          </div>
          <div>
            <Label>{m.descriptionLabel}</Label>
            <Textarea {...register("description")} className="min-h-[100px]" />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{m.statusLabel}</Label>
              <Select onValueChange={(v) => setValue("status", v)} defaultValue={proposal.status}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>
                      {m.statusLabels[s as keyof typeof m.statusLabels] ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DateField
              label={m.sentDateLabel}
              value={sentDateValue}
              onChange={(iso) => { setSentDateValue(iso); setValue("sentDate", iso); }}
            />
          </div>
          <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sentVia">{t.proposals.form.sentViaLabel}</Label>
              <Select onValueChange={(v) => setValue("sentVia", v)} defaultValue={proposal.sentVia || undefined}>
                <SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>
                <SelectContent>
                  {Object.entries(t.proposals.form.sentViaOptions).map(([key, label]) => (
                    <SelectItem key={key} value={label}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="externalSentReference">{t.proposals.form.externalRefLabel}</Label>
              <Input {...register("externalSentReference")} id="externalSentReference" placeholder="..." />
            </div>
          </div>

          <div>
             <Label htmlFor="sentNotes">{t.proposals.form.sentNotesLabel}</Label>
             <Textarea {...register("sentNotes")} id="sentNotes" className="min-h-[60px]" />
          </div>

          <div className="space-y-4 border-t pt-4">
             <h4 className="text-sm font-semibold text-primary">{t.editLeadModal.activityStatusUpdated}</h4>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="clientApproved" {...register("clientApproved")} className="h-4 w-4 rounded border-gray-300 text-primary" />
                  <Label htmlFor="clientApproved" className="font-normal">{t.proposals.form.clientApprovedLabel}</Label>
                </div>
                <DateField
                  label={t.proposals.form.approvalDateLabel}
                  value={approvalDateValue}
                  onChange={(iso) => { setApprovalDateValue(iso); setValue("clientApprovalDate", iso); }}
                />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="initialPaymentRequired" {...register("initialPaymentRequired")} className="h-4 w-4 rounded border-gray-300 text-primary" />
                  <Label htmlFor="initialPaymentRequired" className="font-normal">{t.proposals.form.initialPaymentRequiredLabel}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="initialPaymentReceived" {...register("initialPaymentReceived")} className="h-4 w-4 rounded border-gray-300 text-primary" />
                  <Label htmlFor="initialPaymentReceived" className="font-normal">{t.proposals.form.paymentReceivedLabel}</Label>
                </div>
             </div>

             {watchPaymentRequired && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="initialPaymentAmount">{t.proposals.form.initialPaymentAmountLabel}</Label>
                  <Input {...register("initialPaymentAmount")} id="initialPaymentAmount" type="number" step="0.01" placeholder="0.00" />
                </div>
             )}

             <div className="space-y-4 border-t pt-4 bg-violet-500/5 p-3 rounded-lg border border-violet-500/10">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="adminOverrideApproval" {...register("adminOverrideApproval")} className="h-4 w-4 rounded border-gray-300 text-primary" />
                  <Label htmlFor="adminOverrideApproval" className="font-normal text-violet-300">{t.proposals.form.adminOverrideLabel}</Label>
                </div>

                {watchAdminOverride && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="adminOverrideReason">{t.proposals.form.adminOverrideReasonLabel}</Label>
                    <Textarea {...register("adminOverrideReason")} id="adminOverrideReason" className="min-h-[60px]" />
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="approvedForProduction" {...register("approvedForProduction")} className="h-5 w-5 rounded border-gray-300 text-emerald-500" />
                  <Label htmlFor="approvedForProduction" className="font-bold text-emerald-400">{t.proposals.form.approvedForProductionLabel}</Label>
                </div>
             </div>
          </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>{m.cancel}</Button>
            <Button type="submit" className="bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover">{m.save}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
