import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface DateFieldProps {
  label?: string;
  value?: Date | string | null;
  onChange: (isoString: string) => void;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  compact?: boolean;
}

export function DateField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  required,
  disabled,
  helperText,
  error,
  className,
  compact = false,
}: DateFieldProps) {
  const [open, setOpen] = React.useState(false);

  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return isValid(value) ? value : undefined;
    const parsed = new Date(value);
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
    }
    setOpen(false);
  };

  const h = compact ? "h-8" : "h-9";
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label className={cn(compact ? "text-xs" : "text-sm")}>
          {label}{required && " *"}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal bg-muted/30 border-border/20",
              h,
              textSize,
              !dateValue && "text-muted-foreground",
              error && "border-destructive/50",
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 opacity-60" />
            {dateValue
              ? format(dateValue, "dd/MM/yyyy", { locale: es })
              : "Seleccionar fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[9999]" align="start" sideOffset={4}>
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
      {helperText && !error && (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
