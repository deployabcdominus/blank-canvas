import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Building2, UserCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export interface EntityResult {
  id: string;
  name: string;
  type: "client" | "lead";
  logoUrl?: string | null;
}

interface SmartEntitySearchProps {
  value: EntityResult | null;
  onSelect: (entity: EntityResult | null) => void;
  onCreateNew: (name: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SmartEntitySearch: React.FC<SmartEntitySearchProps> = ({
  value,
  onSelect,
  onCreateNew,
  placeholder = "Buscar cliente o lead...",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EntityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(async (term: string) => {
    if (term.length < 1) { setResults([]); return; }
    setLoading(true);
    try {
      const pattern = `%${term}%`;
      const [clientsRes, leadsRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id, client_name, logo_url")
          .ilike("client_name", pattern)
          .limit(5),
        supabase
          .from("leads")
          .select("id, name, company, logo_url, status")
          .or(`name.ilike.${pattern},company.ilike.${pattern}`)
          .is("deleted_at", null)
          .limit(5),
      ]);

      const mapped: EntityResult[] = [
        ...(clientsRes.data || []).map((c: any) => ({
          id: c.id,
          name: c.client_name,
          type: "client" as const,
          logoUrl: c.logo_url,
        })),
        ...(leadsRes.data || []).map((l: any) => ({
          id: l.id,
          name: l.company || l.name,
          type: "lead" as const,
          logoUrl: l.logo_url,
        })),
      ];
      setResults(mapped);
    } catch (e) {
      console.error("SmartEntitySearch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, search]);

  const handleSelect = (entity: EntityResult) => {
    onSelect(entity);
    setQuery(entity.name);
    setOpen(false);
  };

  const handleCreateNew = () => {
    onCreateNew(query);
    setOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setResults([]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={value ? value.name : query}
            onChange={(e) => {
              if (value) handleClear();
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => { if (query.length > 0 || value) setOpen(true); }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "pl-9 pr-3 bg-background/50 backdrop-blur-sm border-white/10 focus:border-primary/40",
              value && "text-primary font-medium"
            )}
          />
          {value && (
            <Badge
              variant="outline"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 text-[10px] cursor-pointer",
                value.type === "client"
                  ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                  : "border-violet-500/30 text-violet-400 bg-violet-500/10"
              )}
              onClick={handleClear}
            >
              {value.type === "client" ? "Cliente" : "Lead"} ✕
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 border-white/10 bg-zinc-900/95 backdrop-blur-xl"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="max-h-[240px] overflow-y-auto"
          >
            {/* Create new option */}
            {query.length > 0 && (
              <button
                onClick={handleCreateNew}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left border-b border-white/5"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Plus className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-muted-foreground">Crear nuevo cliente:</span>
                <span className="text-foreground font-medium truncate">"{query}"</span>
              </button>
            )}

            {loading && (
              <div className="px-3 py-4 text-xs text-muted-foreground text-center">Buscando...</div>
            )}

            {!loading && results.length === 0 && query.length > 0 && (
              <div className="px-3 py-3 text-xs text-muted-foreground text-center">
                Sin resultados. Usa "Crear nuevo" arriba.
              </div>
            )}

            {results.map((entity) => (
              <motion.button
                key={`${entity.type}-${entity.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => handleSelect(entity)}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  entity.type === "client" ? "bg-emerald-500/10" : "bg-violet-500/10"
                )}>
                  {entity.type === "client"
                    ? <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                    : <UserCircle className="h-3.5 w-3.5 text-violet-400" />
                  }
                </div>
                <span className="truncate text-foreground">{entity.name}</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-auto text-[10px] shrink-0",
                    entity.type === "client"
                      ? "border-emerald-500/30 text-emerald-400"
                      : "border-violet-500/30 text-violet-400"
                  )}
                >
                  {entity.type === "client" ? "Cliente" : "Lead"}
                </Badge>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
};
