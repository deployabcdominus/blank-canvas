import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useLanguage } from "@/i18n/LanguageContext";

interface PilotTagSelectorProps {
  control: any;
  name?: string;
}

export const PilotTagSelector = ({ control, name = "pilotTag" }: PilotTagSelectorProps) => {
  const { locale } = useLanguage();
  const isEn = locale === "en";

  const options = [
    { value: "Real Job", label: isEn ? "Real Job" : "Trabajo Real" },
    { value: "Pilot Test", label: isEn ? "Pilot Test" : "Prueba Piloto" },
    { value: "Training Job", label: isEn ? "Training Job" : "Trabajo de Entrenamiento" },
    { value: "Internal Test", label: isEn ? "Internal Test" : "Prueba Interna" },
  ];

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{isEn ? "Pilot Tag" : "Etiqueta de Piloto"}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="min-h-[44px]">
                <SelectValue placeholder={isEn ? "Select tag" : "Seleccionar etiqueta"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
