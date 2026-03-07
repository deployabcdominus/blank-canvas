import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, XSquare } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  count: number;
  onClear: () => void;
  children: ReactNode;
}

export function BulkActionBar({ count, onClear, children }: Props) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 flex-wrap"
        >
          <Badge variant="secondary" className="text-sm font-semibold gap-1.5 px-3 py-1">
            <CheckSquare className="w-4 h-4" />
            {count} seleccionado{count > 1 ? "s" : ""}
          </Badge>
          <div className="flex items-center gap-2 flex-wrap">{children}</div>
          <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto text-muted-foreground">
            <XSquare className="w-4 h-4 mr-1" /> Limpiar
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
