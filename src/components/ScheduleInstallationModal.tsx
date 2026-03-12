import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useWorkOrders } from "@/contexts/WorkOrdersContext";
import { useInstallerCompanies } from "@/contexts/InstallerCompaniesContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Copy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  serviceId: z.string().min(1, "Seleccione un servicio"),
  installerCompanyId: z.string().min(1, "Seleccione un subcontratista"),
  date: z.date({ required_error: "Seleccione una fecha" }),
  time: z.string().min(1, "Informe el horario"),
  address: z.string().min(1, "La dirección es obligatoria"),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ScheduleInstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (data: any) => void;
}

export const ScheduleInstallationModal: React.FC<ScheduleInstallationModalProps> = ({ isOpen, onClose, onSchedule }) => {
  const { getAvailableForInstallation } = useWorkOrders();
  const { companies } = useInstallerCompanies();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const navigate = useNavigate();
  const availableServices = getAvailableForInstallation();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  const watchedDate = watch("date");
  const watchedServiceId = watch("serviceId");
  const watchedInstallerCompanyId = watch("installerCompanyId");
  const selectedService = availableServices.find(s => s.id.toString() === watchedServiceId);
  const selectedCompany = companies.find(c => c.id.toString() === watchedInstallerCompanyId);

  const filteredServices = selectedCompany?.services && selectedCompany.services.length > 0
    ? availableServices.filter(service => selectedCompany.services?.includes(service.serviceType))
    : availableServices;

  const onSubmit = (data: FormData) => {
    onSchedule({ ...data, service: selectedService, installerCompany: selectedCompany });
    reset(); onClose();
    toast({ title: "Ejecución agendada", description: "¡Ejecución agendada con éxito!" });
  };

  const handleShare = () => {
    if (!selectedService || !selectedCompany || !watchedDate) return;
    const summary = `
AGENDAMIENTO DE EJECUCIÓN

Cliente: ${selectedService.client}
Proyecto: ${selectedService.project}
Empresa Instaladora: ${selectedCompany.name}
Contacto: ${selectedCompany.contact} - ${selectedCompany.phone}
Fecha: ${format(watchedDate, "dd/MM/yyyy", { locale: es })}
Horario: ${watch("time") || "No informado"}
Dirección: ${watch("address") || "No informada"}

${watch("contactName") ? `Contacto en el Lugar: ${watch("contactName")}` : ""}
${watch("contactPhone") ? `Teléfono: ${watch("contactPhone")}` : ""}
${watch("contactEmail") ? `Email: ${watch("contactEmail")}` : ""}

${watch("notes") ? `Observaciones: ${watch("notes")}` : ""}
    `.trim();
    navigator.clipboard.writeText(summary).then(() => {
      toast({ title: "¡Información copiada!", description: "Resumen del agendamiento copiado al portapapeles." });
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border shadow-lg max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Agendar Instalación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="installer" className="text-sm font-medium text-foreground">Empresa Instaladora *</Label>
                <Button type="button" variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground hover:text-foreground" onClick={() => navigate("/installer-companies")}>
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              <Select onValueChange={(value) => setValue("installerCompanyId", value)}>
                <SelectTrigger className="bg-white border-input"><SelectValue placeholder="Seleccione la empresa" /></SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      <div><div className="font-medium">{company.name}</div><div className="text-sm text-muted-foreground">{company.contact}</div></div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.installerCompanyId && <p className="text-sm text-destructive">{errors.installerCompanyId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="service" className="text-sm font-medium text-foreground">Servicio *</Label>
              <Select onValueChange={(value) => setValue("serviceId", value)}>
                <SelectTrigger className="bg-white border-input"><SelectValue placeholder="Seleccione el servicio" /></SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {filteredServices.length > 0 ? filteredServices.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      <div><div className="font-medium">{service.client}</div><div className="text-sm text-muted-foreground">{service.serviceType} - {service.project}</div></div>
                    </SelectItem>
                  )) : (
                    <div className="p-2 text-sm text-muted-foreground">Ningún servicio disponible para esta empresa</div>
                  )}
                </SelectContent>
              </Select>
              {errors.serviceId && <p className="text-sm text-destructive">{errors.serviceId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Fecha *</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-white border-input", !watchedDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedDate ? format(watchedDate, "dd/MM/yyyy", { locale: es }) : "Seleccione una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white z-50" align="start">
                  <Calendar mode="single" selected={watchedDate} onSelect={(date) => { setValue("date", date as Date); setIsCalendarOpen(false); }} disabled={(date) => date < new Date()} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-medium text-foreground">Horario *</Label>
              <Input id="time" type="time" className="bg-white border-input" {...register("time")} />
              {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-foreground">Dirección *</Label>
            <Input id="address" placeholder="Dirección completa de la instalación" className="bg-white border-input" {...register("address")} />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Contacto en el Lugar (Opcional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName" className="text-sm font-medium text-foreground">Nombre</Label>
                <Input id="contactName" placeholder="Nombre del contacto" className="bg-white border-input" {...register("contactName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-sm font-medium text-foreground">Teléfono</Label>
                <Input id="contactPhone" placeholder="(11) 99999-9999" className="bg-white border-input" {...register("contactPhone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium text-foreground">Email</Label>
                <Input id="contactEmail" type="email" placeholder="contacto@empresa.com" className="bg-white border-input" {...register("contactEmail")} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-foreground">Observaciones</Label>
            <Textarea id="notes" placeholder="Información adicional sobre la instalación..." className="bg-white border-input min-h-[80px]" {...register("notes")} />
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="bg-white border-input hover:bg-gray-50">Cancelar</Button>
            <Button type="button" variant="outline" onClick={handleShare} className="bg-white border-input hover:bg-gray-50" disabled={!selectedService || !selectedCompany || !watchedDate}>
              <Copy className="w-4 h-4 mr-2" />Compartir
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Agendar Instalación</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};