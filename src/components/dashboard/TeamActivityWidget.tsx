import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";

interface AuditEntry {
  id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_label: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  creado: "creó",
  editado: "editó",
  eliminado: "eliminó",
  cambio_estado: "cambió el estado de",
  aprobado: "aprobó",
};

const ENTITY_LABELS: Record<string, string> = {
  lead: "lead",
  cliente: "cliente",
  propuesta: "propuesta",
  pago: "pago",
  orden: "orden",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days}d`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

export function TeamActivityWidget() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, user_name, action, entity_type, entity_label, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) setEntries(data as AuditEntry[]);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-2xl p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-zinc-950/50"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-[0.08em]">
            Actividad del Equipo
          </h3>
          <span className="relative flex h-1.5 w-1.5 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
        </div>
        <Link
          to="/audit-log"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Ver todo
        </Link>
      </div>

      <div className="space-y-0">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ))
        ) : entries.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">
            Sin actividad reciente
          </p>
        ) : (
          entries.map((entry, i) => {
            const verb = ACTION_LABELS[entry.action] || entry.action;
            const entityType = ENTITY_LABELS[entry.entity_type] || entry.entity_type;
            const isNew = entry.action === "creado";

            return (
              <div key={entry.id}>
                {i > 0 && (
                  <div className="border-t border-white/[0.04]" />
                )}
                <div className="flex items-start gap-3 py-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-primary">
                      {getInitials(entry.user_name || "?")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      <span className="font-medium text-white">
                        {entry.user_name}
                      </span>{" "}
                      {verb}{" "}
                      {isNew ? `un nuevo ${entityType}` : `el ${entityType}`}
                      {entry.entity_label && (
                        <>
                          :{" "}
                          <span className="font-medium text-white">
                            {entry.entity_label}
                          </span>
                        </>
                      )}
                    </p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">
                      {timeAgo(entry.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
