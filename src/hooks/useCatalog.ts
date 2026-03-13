import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export type CatalogType =
  | "lead_service"
  | "lead_status"
  | "lead_source"
  | "order_status"
  | "material_type";

export interface CatalogItem {
  id: string;
  value: string;
  label: string;
  color?: string | null;
  sort_order: number;
  is_default: boolean;
  is_active: boolean;
}

export function useCatalog(type: CatalogType) {
  const { companyId } = useUserRole();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["catalog", companyId, type],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("catalog_items" as any)
        .select("id, value, label, color, sort_order, is_default, is_active")
        .eq("company_id", companyId!)
        .eq("catalog_type", type)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return (data as any[]) as CatalogItem[];
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["catalog", companyId, type] });

  const add = useMutation({
    mutationFn: async (item: { label: string; color?: string }) => {
      const value = `custom_${item.label.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "")}_${Date.now()}`;
      const maxOrder = Math.max(0, ...items.map((i) => i.sort_order));
      const { error } = await supabase.from("catalog_items" as any).insert({
        company_id: companyId,
        catalog_type: type,
        value,
        label: item.label,
        color: item.color || null,
        sort_order: maxOrder + 1,
        is_default: false,
      } as any);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: async ({
      id,
      label,
      color,
    }: {
      id: string;
      label: string;
      color?: string;
    }) => {
      const { error } = await supabase
        .from("catalog_items" as any)
        .update({ label, color } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("catalog_items" as any)
        .update({ is_active: false } as any)
        .eq("id", id)
        .eq("is_default", false);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { items, isLoading, add, update, remove };
}
