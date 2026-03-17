import { useProductionSteps } from "@/hooks/useProductionSteps";
import { Check, Zap, Clock, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  orderId: string;
  compact?: boolean;
}

export default function LiveProductionTimeline({ orderId, compact = false }: Props) {
  const { steps, loading, syncing, progress } = useProductionSteps(orderId);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No hay etapas definidas para esta orden
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Syncing indicator */}
      {syncing && (
        <div className="flex items-center gap-2 text-xs text-primary animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" />
          Sincronizando progreso…
        </div>
      )}
      {/* Progress summary */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground font-semibold">
            {steps.filter(s => s.status === "completed").length} de {steps.length} etapas
          </span>
          <span className="font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Node Timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border" />
        {/* Completed overlay line */}
        {steps.filter(s => s.status === "completed").length > 0 && (
          <div
            className="absolute left-4 top-4 w-0.5 bg-primary transition-all duration-700"
            style={{
              height: `${(steps.filter(s => s.status === "completed").length / steps.length) * 100}%`,
            }}
          />
        )}

        <div className="space-y-0">
          {steps.map((step, i) => {
            const isCompleted = step.status === "completed";
            const isInProgress = step.status === "in_progress";
            const isPending = step.status === "pending";

            return (
              <div key={step.id} className="relative flex items-start gap-4 py-2.5">
                {/* Node */}
                <div className={cn(
                  "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-500",
                  isCompleted && "bg-primary text-primary-foreground shadow-md shadow-primary/30",
                  isInProgress && "bg-primary/20 text-primary border-2 border-primary shadow-lg shadow-primary/20",
                  isPending && "bg-muted text-muted-foreground border border-border"
                )}>
                  {isCompleted ? <Check size={14} /> :
                   isInProgress ? <Zap size={14} className="animate-pulse" /> :
                   <span className="text-[11px]">{i + 1}</span>}
                  
                  {/* Pulsing ring for in-progress */}
                  {isInProgress && (
                    <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-sm font-semibold truncate",
                      isCompleted ? "text-foreground" :
                      isInProgress ? "text-primary" :
                      "text-muted-foreground"
                    )}>
                      {step.name}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                      isCompleted && "bg-primary/10 text-primary",
                      isInProgress && "bg-primary/10 text-primary animate-pulse",
                      isPending && "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? "✓ Listo" :
                       isInProgress ? "⚡ En curso" : "Pendiente"}
                    </span>
                  </div>
                  {!compact && step.assigned_name && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <User size={10} /> {step.assigned_name}
                      {step.duration_minutes != null && isCompleted && (
                        <span className="ml-2 flex items-center gap-0.5">
                          <Clock size={10} /> {step.duration_minutes}min
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
