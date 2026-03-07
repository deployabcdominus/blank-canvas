import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, LayoutGrid, List } from "lucide-react";

export type PaymentSortKey = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
export type ViewMode = "table" | "cards";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  sort: PaymentSortKey;
  onSortChange: (v: PaymentSortKey) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  methodFilter: string[];
  onMethodFilterChange: (v: string[]) => void;
  statusFilter: string[];
  onStatusFilterChange: (v: string[]) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  totalItems: number;
  showing: string;
}

export const PaymentsControlBar = ({
  search, onSearchChange, sort, onSortChange,
  view, onViewChange,
  methodFilter, onMethodFilterChange,
  statusFilter, onStatusFilterChange,
  dateFrom, onDateFromChange, dateTo, onDateToChange,
  totalItems, showing,
}: Props) => {
  return (
    <div className="glass-card p-4 mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente o proyecto..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 bg-muted/30 border-border/20"
          />
        </div>

        {/* Sort */}
        <Select value={sort} onValueChange={v => onSortChange(v as PaymentSortKey)}>
          <SelectTrigger className="w-[180px] bg-muted/30 border-border/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date_desc">Más reciente</SelectItem>
            <SelectItem value="date_asc">Más antiguo</SelectItem>
            <SelectItem value="amount_desc">Mayor monto</SelectItem>
            <SelectItem value="amount_asc">Menor monto</SelectItem>
          </SelectContent>
        </Select>

        {/* Method filter */}
        <Select
          value={methodFilter.length === 1 ? methodFilter[0] : "all"}
          onValueChange={v => onMethodFilterChange(v === "all" ? [] : [v])}
        >
          <SelectTrigger className="w-[140px] bg-muted/30 border-border/20">
            <SelectValue placeholder="Método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="cash">Efectivo</SelectItem>
            <SelectItem value="zelle">Zelle</SelectItem>
            <SelectItem value="card">Tarjeta</SelectItem>
            <SelectItem value="transfer">Transferencia</SelectItem>
            <SelectItem value="check">Cheque</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="flex gap-1 bg-muted/30 rounded-lg p-1">
          <Button variant={view === "table" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => onViewChange("table")}>
            <List className="w-4 h-4" />
          </Button>
          <Button variant={view === "cards" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => onViewChange("cards")}>
            <LayoutGrid className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Date range + showing */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Desde</span>
          <Input type="date" value={dateFrom} onChange={e => onDateFromChange(e.target.value)} className="w-[150px] h-8 bg-muted/30 border-border/20 text-xs" />
          <span className="text-muted-foreground">Hasta</span>
          <Input type="date" value={dateTo} onChange={e => onDateToChange(e.target.value)} className="w-[150px] h-8 bg-muted/30 border-border/20 text-xs" />
        </div>
        <span className="text-muted-foreground ml-auto text-xs">{showing}</span>
      </div>
    </div>
  );
};
