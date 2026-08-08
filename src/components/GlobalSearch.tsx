import { useState, useRef, useEffect, useDeferredValue, memo } from "react";
import { Search, Command, FileText, ClipboardList, MapPin, Users, Building2, UserCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGlobalSearchQuery, type SearchResult } from "@/hooks/queries/useGlobalSearchQuery";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const GlobalSearch = memo(() => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const deferredQuery = useDeferredValue(query);
  const { data: results = [], isLoading } = useGlobalSearchQuery(deferredQuery);


  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    navigate(result.path);
  };

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "lead": return <Users className="mr-2 h-4 w-4 text-violet-400" />;
      case "proposal": return <FileText className="mr-2 h-4 w-4 text-blue-400" />;
      case "order": return <ClipboardList className="mr-2 h-4 w-4 text-amber-400" />;
      case "installation": return <MapPin className="mr-2 h-4 w-4 text-cyan-400" />;
      case "client": return <UserCircle className="mr-2 h-4 w-4 text-emerald-400" />;
      case "partner": return <Building2 className="mr-2 h-4 w-4 text-zinc-400" />;
      default: return null;
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="relative h-11 w-full justify-start text-sm text-zinc-400 hover:text-white sm:pr-12 md:w-64 lg:w-96 bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 rounded-xl"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2.5 h-4 w-4 text-primary" />
        <span className="hidden lg:inline-flex font-medium">Search anything...</span>
        <span className="inline-flex lg:hidden font-medium">Search...</span>
        <kbd className="pointer-events-none absolute right-3 top-2.5 hidden h-6 select-none items-center gap-1 rounded-md border border-white/[0.1] bg-white/[0.05] px-2 font-mono text-[10px] font-bold text-zinc-300 opacity-100 sm:flex">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type to search leads, proposals, orders..." 
          onValueChange={setQuery}
        />
        <CommandList className="max-h-[400px]">
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
              <span className="text-xs text-muted-foreground">Searching...</span>
            </div>
          )}
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Results">
            {results.map((result) => (
              <CommandItem
                key={`${result.type}-${result.id}`}
                onSelect={() => handleSelect(result)}
                className="flex items-center justify-between py-3 cursor-pointer"
              >
                <div className="flex items-center flex-1 min-w-0">
                  {getIcon(result.type)}
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{result.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{result.description}</span>
                  </div>
                </div>
                <Badge variant="outline" className="ml-2 text-[10px] uppercase tracking-wider opacity-60">
                  {result.type}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
});
