import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DateField } from "@/components/ui/date-field";
import { toast } from "sonner";
import type { ProposalStatus, SentMethod } from "@/contexts/ProposalsContext";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { useCatalog } from "@/hooks/useCatalog";

const schema = z.object({
  client: z.string().min(1, "El cliente es obligatorio"),
  project: z.string().min(1, "El proyecto es obligatorio"),
  value: z.string().min(1, "El monto es obligatorio"),
  description: z.string().min(1, "La descripción del alcance es obligatoria"),
  sentMethod: z.string().min(1, "El medio de envío es obligatorio"),
  status: z.string().min(1, "El estado es obligatorio"),
  serviceType: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AddProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProposal: (proposal: any) => Promise<void>;
}

const SENT_METHODS: SentMethod[] = ['Gmail', 'WhatsApp', 'PDF físico', 'Otro'];
const STATUSES: ProposalStatus[] = ['Borrador', 'Enviada externamente', 'Aprobada', 'Rechazada'];

export const AddProposalModal: React.FC<AddProposalModalProps> = ({ isOpen, onClose, onAddProposal }) => {
  const serviceTypes = useServiceTypes();
  const { items: catalogServices } = useCatalog("lead_service");
  const resolvedServices = catalogServices.length > 0
    ? catalogServices.map(s => s.label)
    : serviceTypes;

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'Borrador' },
  });
  const [sentDate, setSentDate] = useState(new Date().toISOString().split('T')[0]);

  const onSubmit = async (data: FormData) => {
    try {
      await onAddProposal({
        client: data.client,
        project: data.project,
        value: parseFloat(data.value.replace(/[^0-9.]/g, '')) || 0,
        description: data.description,
        status: data.status as ProposalStatus,
        sentDate: data.status === 'Borrador' ? null : sentDate,
        sentMethod: data.status === 'Borrador' ? null : (data.sentMethod as SentMethod),
      });
      toast.success("Propuesta registrada con éxito");
      reset();
      setSentDate(new Date().toISOString().split('T')[0]);
      onClose();
    } catch {
      toast.error("Error al registrar la propuesta");
    }
  };

  const handleClose = () => { reset(); setSentDate(new Date().toISOString().split('T')[0]); onClose(); };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Propuesta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Cliente *</Label>
              <Input {...register("client")} id="client" placeholder="Nombre del cliente" />
              {errors.client && <p className="text-sm text-destructive mt-1">{errors.client.message}</p>}
            </div>
            <div>
              <Label htmlFor="project">Proyecto *</Label>
              <Input {...register("project")} id="project" placeholder="Nombre del proyecto" />
              {errors.project && <p className="text-sm text-destructive mt-1">{errors.project.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="value">Monto Total *</Label>
            <Input {...register("value")} id="value" placeholder="Ej: 3500" />
            {errors.value && <p className="text-sm text-destructive mt-1">{errors.value.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Descripción del Alcance *</Label>
            <Textarea {...register("description")} id="description" placeholder="Detalle el alcance de la propuesta..." className="min-h-[100px]" />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Estado *</Label>
              <Select onValueChange={(v) => setValue("status", v)} defaultValue="Borrador">
                <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
            </div>
            <DateField
              label="Fecha de Envío"
              value={sentDate}
              onChange={setSentDate}
            />
          </div>

          <div>
            <Label htmlFor="sentMethod">Medio de Envío *</Label>
            <Select onValueChange={(v) => setValue("sentMethod", v)}>
              <SelectTrigger><SelectValue placeholder="¿Cómo se envió?" /></SelectTrigger>
              <SelectContent>
                {SENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.sentMethod && <p className="text-sm text-destructive mt-1">{errors.sentMethod.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" className="bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover">
              Registrar Propuesta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
