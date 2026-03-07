import { useEffect, useState } from "react";
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

const schema = z.object({
  client: z.string().min(1, "El cliente es obligatorio"),
  project: z.string().min(1, "El proyecto es obligatorio"),
  value: z.string().min(1, "El monto es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  sentDate: z.string().optional(),
  sentMethod: z.string().optional(),
  status: z.string().min(1, "El estado es obligatorio"),
});

type FormData = z.infer<typeof schema>;

const SENT_METHODS: SentMethod[] = ['Gmail', 'WhatsApp', 'PDF físico', 'Otro'];
const STATUSES: ProposalStatus[] = ['Borrador', 'Enviada externamente', 'Aprobada', 'Rechazada'];

interface EditProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProposal: (data: Partial<Proposal> & { id: string }) => void;
  proposal: Proposal | null;
}

export const EditProposalModal = ({ isOpen, onClose, onEditProposal, proposal }: EditProposalModalProps) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>({ resolver: zodResolver(schema) });
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
        <DialogHeader><DialogTitle>Editar Propuesta</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cliente *</Label>
              <Input {...register("client")} />
              {errors.client && <p className="text-sm text-destructive mt-1">{errors.client.message}</p>}
            </div>
            <div>
              <Label>Proyecto *</Label>
              <Input {...register("project")} />
              {errors.project && <p className="text-sm text-destructive mt-1">{errors.project.message}</p>}
            </div>
          </div>
          <div>
            <Label>Monto Total *</Label>
            <Input {...register("value")} placeholder="Ej: 3500" />
            {errors.value && <p className="text-sm text-destructive mt-1">{errors.value.message}</p>}
          </div>
          <div>
            <Label>Descripción del Alcance *</Label>
            <Textarea {...register("description")} className="min-h-[100px]" />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Estado *</Label>
              <Select onValueChange={(v) => setValue("status", v)} defaultValue={proposal.status}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DateField
              label="Fecha de Envío"
              value={sentDateValue}
              onChange={(iso) => { setSentDateValue(iso); setValue("sentDate", iso); }}
            />
          </div>
          <div>
            <Label>Medio de Envío</Label>
            <Select onValueChange={(v) => setValue("sentMethod", v)} defaultValue={proposal.sentMethod || undefined}>
              <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
              <SelectContent>
                {SENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" className="bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover">Guardar Cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
