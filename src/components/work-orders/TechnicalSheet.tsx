import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FeatureGuard } from "@/components/FeatureGuard";
import { useCompany } from "@/hooks/useCompany";
import {
  Ruler, Thermometer, Monitor, Wrench, Wind, Gauge, Server,
  Clock, Shield, Hammer, ArrowUpDown, Box,
} from "lucide-react";

export interface TechnicalDetails {
  [key: string]: string | number | undefined;
}

interface TechnicalSheetProps {
  value: TechnicalDetails;
  onChange: (details: TechnicalDetails) => void;
  readOnly?: boolean;
}

/* ── Field Definitions per Industry ── */
interface FieldDef {
  key: string;
  label: string;
  icon: React.ElementType;
  type: "number" | "text" | "select";
  placeholder?: string;
  unit?: string;
  options?: string[];
}

const INDUSTRY_FIELDS: Record<string, FieldDef[]> = {
  "Señalética y Publicidad": [
    { key: "largo", label: "Largo", icon: Ruler, type: "number", placeholder: "0.00", unit: "m" },
    { key: "ancho", label: "Ancho", icon: ArrowUpDown, type: "number", placeholder: "0.00", unit: "m" },
    { key: "profundidad", label: "Profundidad", icon: Box, type: "number", placeholder: "0.00", unit: "m" },
    { key: "material", label: "Material", icon: Hammer, type: "text", placeholder: "Ej: Acrílico, ACM, Vinil" },
  ],
  "Impresión / Producción": [
    { key: "largo", label: "Largo", icon: Ruler, type: "number", placeholder: "0.00", unit: "m" },
    { key: "ancho", label: "Ancho", icon: ArrowUpDown, type: "number", placeholder: "0.00", unit: "m" },
    { key: "profundidad", label: "Profundidad", icon: Box, type: "number", placeholder: "0.00", unit: "m" },
    { key: "material", label: "Material", icon: Hammer, type: "text", placeholder: "Ej: Acrílico, ACM, Vinil" },
  ],
  "Climatización y HVAC": [
    { key: "capacidad_btu", label: "Capacidad", icon: Thermometer, type: "number", placeholder: "0", unit: "BTU" },
    { key: "toneladas", label: "Toneladas", icon: Gauge, type: "number", placeholder: "0.0", unit: "TON" },
    { key: "presion", label: "Presión", icon: Wind, type: "number", placeholder: "0", unit: "PSI" },
    { key: "refrigerante", label: "Tipo de Refrigerante", icon: Thermometer, type: "select", options: ["R-22", "R-410A", "R-32", "R-134a", "Otro"] },
  ],
  "Field Service / Instalaciones": [
    { key: "capacidad_btu", label: "Capacidad", icon: Thermometer, type: "number", placeholder: "0", unit: "BTU" },
    { key: "presion", label: "Presión", icon: Wind, type: "number", placeholder: "0", unit: "PSI" },
    { key: "refrigerante", label: "Tipo de Refrigerante", icon: Thermometer, type: "select", options: ["R-22", "R-410A", "R-32", "R-134a", "Otro"] },
  ],
  "Servicios IT y Software": [
    { key: "hardware_specs", label: "Especificaciones de Hardware", icon: Server, type: "text", placeholder: "Ej: Dell R740, 64GB RAM" },
    { key: "sla", label: "SLA", icon: Clock, type: "select", options: ["4 horas", "8 horas", "24 horas", "48 horas", "Best Effort"] },
    { key: "prioridad_tecnica", label: "Prioridad Técnica", icon: Shield, type: "select", options: ["P1 - Crítica", "P2 - Alta", "P3 - Media", "P4 - Baja"] },
    { key: "sistema_operativo", label: "Sistema Operativo", icon: Monitor, type: "text", placeholder: "Ej: Windows Server 2022" },
  ],
  "Mantenimiento y Reformas": [
    { key: "largo", label: "Largo", icon: Ruler, type: "number", placeholder: "0.00", unit: "m" },
    { key: "ancho", label: "Ancho", icon: ArrowUpDown, type: "number", placeholder: "0.00", unit: "m" },
    { key: "profundidad", label: "Profundidad", icon: Box, type: "number", placeholder: "0.00", unit: "m" },
    { key: "tipo_trabajo", label: "Tipo de Trabajo", icon: Wrench, type: "select", options: ["Plomería", "Electricidad", "Albañilería", "Pintura", "Carpintería", "Otro"] },
  ],
  "Construcción / Contratistas": [
    { key: "largo", label: "Largo", icon: Ruler, type: "number", placeholder: "0.00", unit: "m" },
    { key: "ancho", label: "Ancho", icon: ArrowUpDown, type: "number", placeholder: "0.00", unit: "m" },
    { key: "profundidad", label: "Profundidad", icon: Box, type: "number", placeholder: "0.00", unit: "m" },
    { key: "tipo_trabajo", label: "Tipo de Trabajo", icon: Wrench, type: "text", placeholder: "Ej: Demolición, Cimentación" },
  ],
};

const DEFAULT_FIELDS: FieldDef[] = [
  { key: "especificacion", label: "Especificación", icon: Wrench, type: "text", placeholder: "Detalle técnico" },
  { key: "cantidad", label: "Cantidad", icon: Box, type: "number", placeholder: "0" },
];

export function TechnicalSheet({ value, onChange, readOnly = false }: TechnicalSheetProps) {
  const { company } = useCompany();
  const industry = company?.industry ?? null;
  const fields = (industry && INDUSTRY_FIELDS[industry]) ? INDUSTRY_FIELDS[industry] : DEFAULT_FIELDS;

  const handleChange = (key: string, val: string) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Wrench className="w-4 h-4 text-primary" strokeWidth={1.5} />
        <h4 className="text-sm font-semibold text-foreground">Ficha Técnica</h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {fields.map((field, i) => {
          const Icon = field.icon;
          const fieldValue = value?.[field.key] ?? "";

          return (
            <motion.div
              key={field.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="space-y-1.5"
            >
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                {field.label}
                {field.unit && <span className="text-[10px] opacity-60">({field.unit})</span>}
              </Label>

              {readOnly ? (
                <p className="text-sm text-foreground min-h-[36px] flex items-center px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  {fieldValue || "—"}
                </p>
              ) : field.type === "select" ? (
                <Select
                  value={String(fieldValue)}
                  onValueChange={(v) => handleChange(field.key, v)}
                >
                  <SelectTrigger className="h-9 text-sm bg-white/[0.03] border-white/[0.08]">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options || []).map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type}
                  value={String(fieldValue)}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="h-9 text-sm bg-white/[0.03] border-white/[0.08]"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Customization gate — Elite only */}
      <FeatureGuard feature="access_advanced_fields" message="Personaliza los campos de la Ficha Técnica según las necesidades de tu negocio.">
        <div className="mt-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <p className="text-xs text-muted-foreground text-center">
            ✨ Personaliza campos — Agrega o elimina campos de la ficha técnica desde aquí.
          </p>
        </div>
      </FeatureGuard>
    </div>
  );
}
