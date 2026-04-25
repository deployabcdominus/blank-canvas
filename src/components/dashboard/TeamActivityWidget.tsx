import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuditLogsQuery } from "@/hooks/queries/useAuditLogsQuery";

function timeAgoFn(dateStr: string, labels: { now: string; minutes: string; hours: string; days: string }): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return labels.now;
  if (mins < 60) return labels.minutes.replace("{{n}}", String(mins));
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return labels.hours.replace("{{n}}", String(hrs));
  const days = Math.floor(hrs / 24);
  return labels.days.replace("{{n}}", String(days));
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
  const { t } = useLanguage();
  const tc = t.teamActivity;
  
  const { data: entries = [], isLoading: loading } = useAuditLogsQuery(null, 5);


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
            {tc.title}
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
          {tc.viewAll}
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
            {tc.noActivity}
          </p>
        ) : (
          entries.map((entry, i) => {
            const verb = (tc.actions as any)[entry.action] || entry.action;
            const entityType = (tc.entities as any)[entry.entity_type] || entry.entity_type;
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
                      {isNew
                        ? tc.newEntity.replace("{{entity}}", entityType)
                        : tc.existingEntity.replace("{{entity}}", entityType)}
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
                      {timeAgoFn(entry.created_at, tc.timeAgo)}
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
