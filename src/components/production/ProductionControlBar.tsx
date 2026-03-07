import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DateField } from "@/components/ui/date-field";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, ArrowUpDown, Filter, LayoutGrid, List, X, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SortKey = "newest" | "oldest" | "priority" | "targetDate" | "status";
export type ViewMode = "cards" | "list";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Más recientes",
  oldest: "Más antiguas",
  priority: "Prioridad",
  targetDate: "Fecha objetivo",
  status: "Estado",
};

const STATUS_OPTIONS = [
  "Materiales Pedidos",
  "En Producción",
  "Control de Calidad",
  "Producido",
];

interface ProductionControlBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  sort: SortKey;
  onSortChange: (v: SortKey) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  statusFilter: string[];
  onStatusFilterChange: (v: string[]) => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  totalItems: number;
  showing: string;
}

export function ProductionControlBar({
  search, onSearchChange,
  sort, onSortChange,
  view, onViewChange,
  statusFilter, onStatusFilterChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
  totalItems, showing,
}: ProductionControlBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasFilters = statusFilter.length > 0 || dateFrom || dateTo;

  const toggleStatus = (s: string) => {
    onStatusFilterChange(
      statusFilter.includes(s)
        ? statusFilter.filter(x => x !== s)
        : [...statusFilter, s]
    );
  };

  const clearFilters = () => {
    onStatusFilterChange([]);
    onDateFromChange("");
    onDateToChange("");
  };

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar por cliente, proyecto..."
            className="pl-10 glass h-9 text-sm"
          />
        </div>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-9 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5" />
              {SORT_LABELS[sort]}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(SORT_LABELS) as SortKey[]).map(k => (
              <DropdownMenuItem key={k} onClick={() => onSortChange(k)} className={sort === k ? "bg-accent" : ""}>
                {SORT_LABELS[k]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filters toggle */}
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-1.5 h-9 text-xs", hasFilters && "border-primary/30 text-primary")}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-3.5 h-3.5" />
          Filtros
          {hasFilters && (
            <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground">
              {statusFilter.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
            </Badge>
          )}
        </Button>

        {/* View toggle */}
        <div className="flex items-center border border-border/30 rounded-lg overflow-hidden">
          <button
            onClick={() => onViewChange("cards")}
            className={cn("p-2 transition-colors", view === "cards" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange("list")}
            className={cn("p-2 transition-colors", view === "list" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Results count */}
        <span className="text-xs text-muted-foreground hidden sm:inline">{showing}</span>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="glass-card p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtros</span>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6 px-2 gap-1">
                <X className="w-3 h-3" /> Limpiar
              </Button>
            )}
          </div>

          {/* Status chips */}
          <div>
            <span className="text-xs text-muted-foreground mb-1.5 block">Estado</span>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
                    statusFilter.includes(s)
                      ? "bg-primary/15 text-primary border-primary/25"
                      : "bg-muted/20 text-muted-foreground border-border/20 hover:bg-muted/40"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="flex gap-3 items-end">
            <DateField label="Desde" value={dateFrom} onChange={onDateFromChange} compact />
            <DateField label="Hasta" value={dateTo} onChange={onDateToChange} compact />
          </div>
        </div>
      )}
    </div>
  );
}
