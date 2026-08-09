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

const DEFAULT_TEMPLATES_SIGNAGE: Omit<OperationTemplate, "id" | "company_id" | "created_at">[] = [
  {
    product_type: "channel_letters",
    name: "Channel Letters",
    description: "Illuminated signage letters",
    steps: [
      { name: "CNC Cutting", department: "cnc", description: "Face and return cutting on CNC router", sort_order: 0 },
      { name: "Bending", department: "cnc", description: "Aluminum return bending", sort_order: 1 },
      { name: "Welding", department: "cnc", description: "Return-to-face welding", sort_order: 2 },
      { name: "Painting", department: "graphics", description: "Surface painting and finishing", sort_order: 3 },
      { name: "LED Installation", department: "electrical", description: "LED module mounting and wiring", tip: "Verify polarity before sealing", sort_order: 4 },
      { name: "Electrical Wiring", department: "electrical", description: "Source connection and lighting test", sort_order: 5 },
      { name: "Quality Control", department: "qa", description: "Final inspection and operational test", sort_order: 6 },
    ],
  },
  {
    product_type: "monument_sign",
    name: "Monument Sign",
    description: "Standalone monument-style sign",
    steps: [
      { name: "Structural Design", department: "cnc", sort_order: 0 },
      { name: "Material Cutting", department: "cnc", sort_order: 1 },
      { name: "Structural Welding", department: "cnc", sort_order: 2 },
      { name: "Graphics / Vinyl", department: "graphics", description: "Vinyl application or printing", sort_order: 3 },
      { name: "Electrical", department: "electrical", sort_order: 4 },
      { name: "Quality Control", department: "qa", sort_order: 5 },
    ],
  },
  {
    product_type: "vinyl_banner",
    name: "Vinyl / Banner",
    description: "Vinyl or banner printing and cutting",
    steps: [
      { name: "Design / RIP", department: "graphics", sort_order: 0 },
      { name: "Printing", department: "graphics", sort_order: 1 },
      { name: "Laminating", department: "graphics", sort_order: 2 },
      { name: "Cutting / Finishing", department: "graphics", sort_order: 3 },
      { name: "Quality Control", department: "qa", sort_order: 4 },
    ],
  },
];

const DEFAULT_TEMPLATES_IT: Omit<OperationTemplate, "id" | "company_id" | "created_at">[] = [
  {
    product_type: "infrastructure_deployment",
    name: "Infrastructure Deployment",
    description: "Full network or hardware installation",
    steps: [
      { name: "Site Survey", department: "technical", sort_order: 0 },
      { name: "Hardware Procurement", department: "logistics", sort_order: 1 },
      { name: "Configuration", department: "it", sort_order: 2 },
      { name: "Installation", department: "it", sort_order: 3 },
      { name: "UAT / Testing", department: "qa", sort_order: 4 },
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

  const seedDefaults = async (industry?: string) => {
    if (!companyId) return;
    
    let templatesToSeed = DEFAULT_TEMPLATES_SIGNAGE;
    if (industry === "Servicios IT y Software") {
      templatesToSeed = DEFAULT_TEMPLATES_IT;
    }
    
    for (const t of templatesToSeed) {
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
