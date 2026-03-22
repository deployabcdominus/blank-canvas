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
import type { Proposal, ProposalStatus, SentMethod } from "@/contexts/ProposalsContext";
import { useLanguage } from "@/i18n/LanguageContext";

type FormData = {
  client: string;
  project: string;
  value: string;
  description: string;
  sentDate?: string;
  sentMethod?: string;
  status: string;
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
  }), [m]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({ resolver: zodResolver(schema) });
  const [sentDateValue, setSentDateValue] = useState("");

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
    });
    handleClose();
  };

  const handleClose = () => { reset(); setSentDateValue(""); onClose(); };

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
            <Label>{m.sentMethodLabel}</Label>
            <Select onValueChange={(v) => setValue("sentMethod", v)} defaultValue={proposal.sentMethod || undefined}>
              <SelectTrigger><SelectValue placeholder={m.sentMethodPlaceholder} /></SelectTrigger>
              <SelectContent>
                {SENT_METHODS.map(method => (
                  <SelectItem key={method} value={method}>
                    {m.sentMethodLabels[method as keyof typeof m.sentMethodLabels] ?? method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
