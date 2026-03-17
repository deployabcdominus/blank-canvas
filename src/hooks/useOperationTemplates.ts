import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export interface TemplateStep {
  name: string;
  department: string;
  description?: string;
  tip?: string;
  sort_order: number;
}

export interface OperationTemplate {
  id: string;
  company_id: string;
  product_type: string;
  name: string;
  description?: string;
  steps: TemplateStep[];
  created_at: string;
}

const DEFAULT_TEMPLATES: Omit<OperationTemplate, "id" | "company_id" | "created_at">[] = [
  {
    product_type: "channel_letters",
    name: "Channel Letters",
    description: "Letras de canal iluminadas",
    steps: [
      { name: "Corte CNC", department: "cnc", description: "Corte de caras y retornos en router CNC", sort_order: 0 },
      { name: "Doblado", department: "cnc", description: "Doblado de retornos de aluminio", sort_order: 1 },
      { name: "Soldadura", department: "cnc", description: "Soldadura de retornos a caras", sort_order: 2 },
      { name: "Pintura", department: "graphics", description: "Pintura y acabado de superficies", sort_order: 3 },
      { name: "Instalación LED", department: "electrical", description: "Montaje de módulos LED y cableado", tip: "Verificar polaridad antes de sellar", sort_order: 4 },
      { name: "Cableado Eléctrico", department: "electrical", description: "Conexión de fuente y prueba de iluminación", sort_order: 5 },
      { name: "Control de Calidad", department: "qa", description: "Inspección final y prueba de funcionamiento", sort_order: 6 },
    ],
  },
  {
    product_type: "monument_sign",
    name: "Monument Sign",
    description: "Letrero tipo monumento",
    steps: [
      { name: "Diseño Estructural", department: "cnc", sort_order: 0 },
      { name: "Corte de Materiales", department: "cnc", sort_order: 1 },
      { name: "Soldadura Estructural", department: "cnc", sort_order: 2 },
      { name: "Gráficos / Vinil", department: "graphics", description: "Aplicación de vinil o impresión", sort_order: 3 },
      { name: "Eléctrico", department: "electrical", sort_order: 4 },
      { name: "Control de Calidad", department: "qa", sort_order: 5 },
    ],
  },
  {
    product_type: "vinyl_banner",
    name: "Vinyl / Banner",
    description: "Impresión y corte de vinil o banners",
    steps: [
      { name: "Diseño / RIP", department: "graphics", sort_order: 0 },
      { name: "Impresión", department: "graphics", sort_order: 1 },
      { name: "Laminado", department: "graphics", sort_order: 2 },
      { name: "Corte / Acabado", department: "graphics", sort_order: 3 },
      { name: "Control de Calidad", department: "qa", sort_order: 4 },
    ],
  },
];

export function useOperationTemplates() {
  const { companyId } = useUserRole();
  const [templates, setTemplates] = useState<OperationTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from("operation_templates" as any)
      .select("*")
      .eq("company_id", companyId)
      .order("product_type");
    setTemplates((data as unknown as OperationTemplate[]) || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const seedDefaults = async () => {
    if (!companyId) return;
    for (const t of DEFAULT_TEMPLATES) {
      await supabase.from("operation_templates" as any).insert({
        company_id: companyId,
        product_type: t.product_type,
        name: t.name,
        description: t.description,
        steps: t.steps,
      } as any);
    }
    await fetchTemplates();
  };

  /** Generate production_steps from a template for a given order */
  const applyTemplate = async (orderId: string, productType: string) => {
    if (!companyId) return;
    const template = templates.find(t => t.product_type === productType);
    if (!template) return;

    // Update the order's product_type
    await supabase.from("production_orders").update({ product_type: productType } as any).eq("id", orderId);

    // Delete existing steps for this order
    await supabase.from("production_steps" as any).delete().eq("production_order_id", orderId);

    // Insert new steps from template
    const steps = template.steps.map(s => ({
      production_order_id: orderId,
      company_id: companyId,
      name: s.name,
      department: s.department,
      description: s.description || null,
      tip: s.tip || null,
      sort_order: s.sort_order,
      status: "pending",
    }));

    await supabase.from("production_steps" as any).insert(steps as any);
  };

  return { templates, loading, seedDefaults, applyTemplate, fetchTemplates };
}
