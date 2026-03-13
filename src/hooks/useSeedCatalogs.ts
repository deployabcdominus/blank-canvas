import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

const SEED_DATA = [
  // lead_service
  { catalog_type: "lead_service", value: "interior_wayfinding", label: "Señalética de orientación interior", sort_order: 1 },
  { catalog_type: "lead_service", value: "interior_branding", label: "Branding y decoración de espacios", sort_order: 2 },
  { catalog_type: "lead_service", value: "interior_directorios", label: "Directorios y mapas interiores", sort_order: 3 },
  { catalog_type: "lead_service", value: "interior_seguridad", label: "Señales de seguridad y emergencia", sort_order: 4 },
  { catalog_type: "lead_service", value: "exterior_fachada", label: "Letrero de fachada", sort_order: 5 },
  { catalog_type: "lead_service", value: "exterior_monumentos", label: "Señal monumental / totem", sort_order: 6 },
  { catalog_type: "lead_service", value: "exterior_iluminado", label: "Letrero iluminado / backlit", sort_order: 7 },
  { catalog_type: "lead_service", value: "vehiculos_flota", label: "Rotulación de flota", sort_order: 8 },
  { catalog_type: "lead_service", value: "vehiculos_auto", label: "Rotulación de auto individual", sort_order: 9 },
  { catalog_type: "lead_service", value: "impresion_banner", label: "Banners y lonas", sort_order: 10 },
  { catalog_type: "lead_service", value: "impresion_gran_formato", label: "Impresión gran formato", sort_order: 11 },
  { catalog_type: "lead_service", value: "otro", label: "Otro / Por definir", sort_order: 99 },
  // lead_status
  { catalog_type: "lead_status", value: "nuevo", label: "Nuevo", color: "#6B7699", sort_order: 1 },
  { catalog_type: "lead_status", value: "contactado", label: "Contactado", color: "#0EA5E9", sort_order: 2 },
  { catalog_type: "lead_status", value: "calificado", label: "Calificado", color: "#D97706", sort_order: 3 },
  { catalog_type: "lead_status", value: "propuesta", label: "Con propuesta", color: "#7C3AED", sort_order: 4 },
  { catalog_type: "lead_status", value: "negociacion", label: "En negociación", color: "#EA580C", sort_order: 5 },
  { catalog_type: "lead_status", value: "ganado", label: "Ganado", color: "#16A34A", sort_order: 6 },
  { catalog_type: "lead_status", value: "perdido", label: "Perdido", color: "#DC2626", sort_order: 7 },
  // lead_source
  { catalog_type: "lead_source", value: "referido", label: "Referido de cliente", sort_order: 1 },
  { catalog_type: "lead_source", value: "instagram", label: "Instagram", sort_order: 2 },
  { catalog_type: "lead_source", value: "facebook", label: "Facebook", sort_order: 3 },
  { catalog_type: "lead_source", value: "google", label: "Google / SEO", sort_order: 4 },
  { catalog_type: "lead_source", value: "web", label: "Sitio web", sort_order: 5 },
  { catalog_type: "lead_source", value: "llamada", label: "Llamada directa", sort_order: 6 },
  { catalog_type: "lead_source", value: "expo", label: "Expo / Evento", sort_order: 7 },
  { catalog_type: "lead_source", value: "otro", label: "Otro", sort_order: 99 },
  // order_status
  { catalog_type: "order_status", value: "pendiente", label: "Pendiente", color: "#6B7699", sort_order: 1 },
  { catalog_type: "order_status", value: "en_produccion", label: "En producción", color: "#D97706", sort_order: 2 },
  { catalog_type: "order_status", value: "en_instalacion", label: "En instalación", color: "#0EA5E9", sort_order: 3 },
  { catalog_type: "order_status", value: "esperando_cliente", label: "Esperando cliente", color: "#7C3AED", sort_order: 4 },
  { catalog_type: "order_status", value: "completado", label: "Completado", color: "#16A34A", sort_order: 5 },
  { catalog_type: "order_status", value: "cancelado", label: "Cancelado", color: "#DC2626", sort_order: 6 },
  // material_type
  { catalog_type: "material_type", value: "acrilico", label: "Acrílico", sort_order: 1 },
  { catalog_type: "material_type", value: "aluminio", label: "Aluminio compuesto", sort_order: 2 },
  { catalog_type: "material_type", value: "vinilo", label: "Vinilo adhesivo", sort_order: 3 },
  { catalog_type: "material_type", value: "pvc", label: "PVC expandido", sort_order: 4 },
  { catalog_type: "material_type", value: "madera", label: "Madera / MDF", sort_order: 5 },
  { catalog_type: "material_type", value: "acero", label: "Acero inoxidable", sort_order: 6 },
  { catalog_type: "material_type", value: "led", label: "LED / Caja de luz", sort_order: 7 },
  { catalog_type: "material_type", value: "lona", label: "Lona impresa", sort_order: 8 },
  { catalog_type: "material_type", value: "otro", label: "Otro material", sort_order: 99 },
];

export function useSeedCatalogs() {
  const { companyId, isAdmin } = useUserRole();
  const seededRef = useRef(false);

  useEffect(() => {
    if (!companyId || !isAdmin || seededRef.current) return;
    seededRef.current = true;

    (async () => {
      // Check if catalogs already exist for this company
      const { count } = await supabase
        .from("catalog_items" as any)
        .select("id", { count: "exact", head: true })
        .eq("company_id", companyId);

      if (count && count > 0) return; // Already seeded

      const rows = SEED_DATA.map((item) => ({
        ...item,
        company_id: companyId,
        is_default: true,
        is_active: true,
      }));

      await supabase.from("catalog_items" as any).insert(rows as any);
    })();
  }, [companyId, isAdmin]);
}
