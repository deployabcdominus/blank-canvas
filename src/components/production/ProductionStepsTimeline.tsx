import { useProductionSteps } from "@/hooks/useProductionSteps";
import { Check, Clock, Zap, User } from "lucide-react";
import { useT } from "@/i18n/LanguageContext";


export default function ProductionStepsTimeline({ orderId }: { orderId: string }) {
  const { steps, loading, progress } = useProductionSteps(orderId);
  const t = useT();


  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        {t.production.timeline.noSteps}
      </div>

    );
  }

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground font-semibold">
            {t.production.timeline.stepsOf.replace("{{completed}}", steps.filter(s => s.status === "completed").length.toString()).replace("{{total}}", steps.length.toString())}
          </span>
          <span className="font-bold text-foreground">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 z-10 ${
                step.status === "completed"
                  ? "bg-emerald-500 border-emerald-500 text-white"
                  : step.status === "in_progress"
                  ? "bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400"
                  : "bg-muted border-border text-muted-foreground"
              }`}>
                {step.status === "completed" ? <Check size={14} /> :
                 step.status === "in_progress" ? <Zap size={14} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-0.5 h-8 ${step.status === "completed" ? "bg-emerald-500" : "bg-border"}`} />
              )}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{step.name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  step.status === "completed"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : step.status === "in_progress"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step.status === "completed" ? t.production.timeline.status.ready :
                   step.status === "in_progress" ? t.production.timeline.status.inProgress : t.production.timeline.status.pending}

                </span>
              </div>
              {step.assigned_name && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <User size={11} /> {step.assigned_name}
                  {step.duration_minutes && step.status === "completed" && (
                    <span className="ml-2 flex items-center gap-1">
                      <Clock size={11} /> {step.duration_minutes} min
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
