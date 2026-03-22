import { useMemo, useState } from "react";
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
import { SmartEntitySearch, type EntityResult } from "@/components/SmartEntitySearch";
import { useLanguage } from "@/i18n/LanguageContext";

type FormData = {
  project: string;
  value: string;
  description: string;
  sentMethod: string;
  status: string;
  serviceType?: string;
};

interface AddProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProposal: (proposal: any) => Promise<void>;
  onCreateClient?: (name: string) => void;
}

const SENT_METHODS: SentMethod[] = ['Gmail', 'WhatsApp', 'PDF físico', 'Otro'];
const STATUSES: ProposalStatus[] = ['Borrador', 'Enviada externamente', 'Aprobada', 'Rechazada'];

export const AddProposalModal: React.FC<AddProposalModalProps> = ({ isOpen, onClose, onAddProposal, onCreateClient }) => {
  const { t } = useLanguage();
  const m = t.addProposalModal;

  const schema = useMemo(() => z.object({
    project: z.string().min(1, m.projectRequired),
    value: z.string().min(1, m.amountRequired),
    description: z.string().min(1, m.descriptionRequired),
    sentMethod: z.string().min(1, m.sentMethodRequired),
    status: z.string().min(1, m.statusRequired),
    serviceType: z.string().optional(),
  }), [m]);

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
  const [selectedEntity, setSelectedEntity] = useState<EntityResult | null>(null);
  const [entityError, setEntityError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    if (!selectedEntity) {
      setEntityError(m.clientRequired);
      return;
    }
    setEntityError(null);

    try {
      await onAddProposal({
        client: selectedEntity.name,
        project: data.project,
        value: parseFloat(data.value.replace(/[^0-9.]/g, '')) || 0,
        description: data.description,
        status: data.status as ProposalStatus,
        sentDate: data.status === 'Borrador' ? null : sentDate,
        sentMethod: data.status === 'Borrador' ? null : (data.sentMethod as SentMethod),
        leadId: selectedEntity.type === "lead" ? selectedEntity.id : null,
        // If client selected, we still pass lead_id as null (proposals link through leads)
      });
      toast.success(m.successToast);
      reset();
      setSelectedEntity(null);
      setSentDate(new Date().toISOString().split('T')[0]);
      onClose();
    } catch {
      toast.error(m.errorToast);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedEntity(null);
    setEntityError(null);
    setSentDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const handleCreateNew = (name: string) => {
    // Set as a temporary entity so the form can proceed
    setSelectedEntity({ id: "", name, type: "client" });
    setEntityError(null);
    // Optionally trigger create-client modal
    if (onCreateClient) {
      onCreateClient(name);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{m.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Label>{m.clientLeadLabel}</Label>
              <SmartEntitySearch
                value={selectedEntity}
                onSelect={(entity) => {
                  setSelectedEntity(entity);
                  setEntityError(null);
                }}
                onCreateNew={handleCreateNew}
                placeholder={m.clientPlaceholder}
              />
              {entityError && <p className="text-sm text-destructive mt-1">{entityError}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor="project">{m.projectLabel}</Label>
              <Input {...register("project")} id="project" placeholder={m.projectPlaceholder} />
              {errors.project && <p className="text-sm text-destructive mt-1">{errors.project.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="value">{m.amountLabel}</Label>
            <Input {...register("value")} id="value" placeholder={m.amountPlaceholder} />
            {errors.value && <p className="text-sm text-destructive mt-1">{errors.value.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">{m.descriptionLabel}</Label>
            <Textarea {...register("description")} id="description" placeholder={m.descriptionPlaceholder} className="min-h-[100px]" />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="serviceType">{m.serviceTypeLabel}</Label>
            <Select onValueChange={(v) => setValue("serviceType", v)}>
              <SelectTrigger><SelectValue placeholder={m.serviceTypePlaceholder} /></SelectTrigger>
              <SelectContent>
                {resolvedServices.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">{m.statusLabel}</Label>
              <Select onValueChange={(v) => setValue("status", v)} defaultValue="Borrador">
                <SelectTrigger><SelectValue placeholder={m.statusPlaceholder} /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>
                      {m.statusLabels[s as keyof typeof m.statusLabels] ?? s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
            </div>
            <DateField
              label={m.sentDateLabel}
              value={sentDate}
              onChange={setSentDate}
            />
          </div>

          <div>
            <Label htmlFor="sentMethod">{m.sentMethodLabel}</Label>
            <Select onValueChange={(v) => setValue("sentMethod", v)}>
              <SelectTrigger><SelectValue placeholder={m.sentMethodPlaceholder} /></SelectTrigger>
              <SelectContent>
                {SENT_METHODS.map(method => (
                  <SelectItem key={method} value={method}>
                    {m.sentMethodLabels[method as keyof typeof m.sentMethodLabels] ?? method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sentMethod && <p className="text-sm text-destructive mt-1">{errors.sentMethod.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>{m.cancel}</Button>
            <Button type="submit" className="bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover">
              {m.submit}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
