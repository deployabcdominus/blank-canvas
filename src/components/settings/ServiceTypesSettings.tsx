import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/hooks/useCompany";
import { useServiceTypes } from "@/hooks/useServiceTypes";

export const ServiceTypesSettings: React.FC = () => {
  const { company, updateCompanySettings } = useCompany();
  const currentTypes = useServiceTypes();
  const { toast } = useToast();

  const [services, setServices] = useState<string[]>(currentTypes);
  const [newService, setNewService] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    setServices(currentTypes);
  }, [currentTypes]);

  const addService = () => {
    const trimmed = newService.trim();
    if (!trimmed) return;
    if (services.includes(trimmed)) {
      toast({ title: "Ya existe", description: "Este tipo de servicio ya está en la lista.", variant: "destructive" });
      return;
    }
    setServices(prev => [...prev, trimmed]);
    setNewService('');
  };

  const removeService = (service: string) => {
    if (services.length <= 1) {
      toast({ title: "Error", description: "Debe haber al menos un tipo de servicio.", variant: "destructive" });
      return;
    }
    setServices(prev => prev.filter(s => s !== service));
  };

  const handleSave = async () => {
    if (services.length === 0) {
      toast({ title: "Error", description: "Agregue al menos un tipo de servicio.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await updateCompanySettings({ service_types: services } as any);
      toast({ title: "Tipos de servicio guardados", description: "Los cambios se reflejan en todo el sistema." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo guardar.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(services) !== JSON.stringify(currentTypes);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de Servicio</CardTitle>
        <CardDescription>
          Define los tipos de servicio que ofrece tu empresa. Se usan en leads, propuestas y órdenes de trabajo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {services.map(service => (
            <Badge key={service} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
              {service}
              <button
                onClick={() => removeService(service)}
                className="ml-1 hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newService}
            onChange={e => setNewService(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addService()}
            placeholder="Nuevo tipo de servicio..."
            className="flex-1"
          />
          <Button variant="outline" onClick={addService} disabled={!newService.trim()}>
            <Plus className="w-4 h-4 mr-1" /> Agregar
          </Button>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar Tipos de Servicio'}
        </Button>
      </CardContent>
    </Card>
  );
};
