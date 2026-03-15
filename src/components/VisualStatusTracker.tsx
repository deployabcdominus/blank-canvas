import { motion } from "framer-motion";
import { Check, Megaphone, FileText, Cog, Truck } from "lucide-react";
import type { ProjectStatus } from "@/contexts/ProjectsContext";

const STAGES: { key: ProjectStatus; label: string; icon: typeof Megaphone }[] = [
  { key: "Lead", label: "Lead", icon: Megaphone },
  { key: "Proposal", label: "Propuesta", icon: FileText },
  { key: "Production", label: "Producción", icon: Cog },
  { key: "Installation", label: "Instalación", icon: Truck },
];

const ORDER: Record<string, number> = { Lead: 0, Proposal: 1, Production: 2, Installation: 3, Completed: 4 };

interface VisualStatusTrackerProps {
  currentStatus: ProjectStatus;
  /** Optional hints shown below the tracker */
  showHints?: boolean;
  compact?: boolean;
}

export const VisualStatusTracker = ({
  currentStatus,
  showHints = false,
  compact = false,
}: VisualStatusTrackerProps) => {
  const currentIndex = ORDER[currentStatus] ?? 0;
  const isCompleted = currentStatus === "Completed";

  return (
    <div className="w-full">
      <div
        className={`relative flex items-center justify-between rounded-xl border border-white/[0.06] ${
          compact ? "px-3 py-2" : "px-5 py-3"
        }`}
        style={{ background: "hsl(var(--muted) / 0.35)" }}
      >
        {/* Connector line behind nodes */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-12 md:mx-16">
          <div className="h-[2px] w-full rounded-full bg-muted-foreground/10" />
          <motion.div
            className="h-[2px] rounded-full absolute top-0 left-0"
            style={{ background: "hsl(var(--primary))" }}
            initial={{ width: "0%" }}
            animate={{
              width: isCompleted
                ? "100%"
                : `${(currentIndex / (STAGES.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        {STAGES.map((stage, i) => {
          const done = isCompleted || i < currentIndex;
          const active = !isCompleted && i === currentIndex;
          const future = !isCompleted && i > currentIndex;
          const Icon = stage.icon;

          return (
            <div
              key={stage.key}
              className="relative z-10 flex flex-col items-center gap-1"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`
                  relative flex items-center justify-center rounded-full transition-all duration-300
                  ${compact ? "w-8 h-8" : "w-10 h-10"}
                  ${done ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]" : ""}
                  ${active ? "bg-primary/20 text-primary ring-2 ring-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.35)]" : ""}
                  ${future ? "bg-muted text-muted-foreground/40" : ""}
                `}
              >
                {done ? (
                  <Check className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} strokeWidth={2.5} />
                ) : (
                  <Icon className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} />
                )}

                {/* Active pulse */}
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/40"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </motion.div>

              <span
                className={`text-[10px] font-medium transition-colors ${
                  done
                    ? "text-primary"
                    : active
                    ? "text-foreground"
                    : "text-muted-foreground/40"
                } ${compact ? "hidden sm:block" : ""}`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stage-aware hints */}
      {showHints && (
        <motion.p
          key={currentStatus}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-muted-foreground mt-2 text-center italic"
        >
          {currentStatus === "Lead" &&
            "Etapa de prospección — genera un mockup o presupuesto para avanzar."}
          {currentStatus === "Proposal" &&
            "Propuesta enviada — esperando aprobación del cliente."}
          {currentStatus === "Production" &&
            "En producción — gestiona materiales y fechas de entrega."}
          {currentStatus === "Installation" &&
            "Listo para instalación — coordina equipo y logística."}
          {currentStatus === "Completed" &&
            "Proyecto completado exitosamente."}
        </motion.p>
      )}
    </div>
  );
};
