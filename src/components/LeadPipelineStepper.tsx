import { motion } from "framer-motion";
import { Check, Megaphone, FileText, Signature, Cog } from "lucide-react";

export type LeadPipelineStage = 0 | 1 | 2 | 3 | 4;

const STAGES = [
  { label: "Lead", icon: Megaphone },
  { label: "Propuesta", icon: FileText },
  { label: "Firma", icon: Signature },
  { label: "Producción", icon: Cog },
];

interface LeadPipelineStepperProps {
  /** 0 = Lead, 1 = Propuesta creada, 2 = Enviada/Firma, 3 = Aprobada/Producción, 4 = Completed */
  currentStage: LeadPipelineStage;
}

/**
 * Derives the pipeline stage from lead + proposal state.
 * Usage: getLeadPipelineStage(lead.status, proposal?.status)
 */
export function getLeadPipelineStage(
  leadStatus: string,
  proposalStatus?: string | null
): LeadPipelineStage {
  // If proposal is approved → stage 3 (production)
  if (proposalStatus === "Aprobada") return 3;
  // If proposal was sent → stage 2 (awaiting signature)
  if (proposalStatus === "Enviada externamente") return 2;
  // If a proposal exists (draft) → stage 1
  if (proposalStatus) return 1;
  // Lead converted but no proposal yet → still stage 1 (they should create proposal)
  if (leadStatus === "Convertido") return 1;
  // Default: still in lead stage
  return 0;
}

export const LeadPipelineStepper = ({ currentStage }: LeadPipelineStepperProps) => {
  const isCompleted = currentStage >= 4;

  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
        {/* Connector line */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-8">
          <div className="h-[1.5px] w-full rounded-full bg-muted-foreground/10" />
          <motion.div
            className="h-[1.5px] rounded-full absolute top-0 left-0 bg-primary"
            initial={{ width: "0%" }}
            animate={{
              width: isCompleted
                ? "100%"
                : `${(currentStage / (STAGES.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {STAGES.map((stage, i) => {
          const done = isCompleted || i < currentStage;
          const active = !isCompleted && i === currentStage;
          const future = !isCompleted && i > currentStage;
          const Icon = stage.icon;

          return (
            <div key={stage.label} className="relative z-10 flex flex-col items-center gap-0.5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`
                  relative flex items-center justify-center rounded-full w-7 h-7 transition-all duration-300
                  ${done ? "bg-primary text-primary-foreground shadow-[0_0_8px_hsl(var(--primary)/0.3)]" : ""}
                  ${active ? "bg-primary/20 text-primary ring-1.5 ring-primary/40 shadow-[0_0_12px_hsl(var(--primary)/0.25)]" : ""}
                  ${future ? "bg-muted text-muted-foreground/30" : ""}
                `}
              >
                {done ? (
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                ) : (
                  <Icon className="w-3 h-3" />
                )}

                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full border border-primary/30"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
              </motion.div>

              <span
                className={`text-[9px] font-medium leading-tight transition-colors ${
                  done ? "text-primary" : active ? "text-foreground" : "text-muted-foreground/30"
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
