import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePlanAccess, type PlanTier } from "@/hooks/usePlanAccess";

interface FeatureGuardProps {
  /** The feature key to check */
  feature: "access_portal" | "access_previews" | "access_advanced_fields" | "access_audit" | "access_subcontractors" | "access_api";
  children: React.ReactNode;
  /** Optional: override the fallback message */
  message?: string;
}

const PLAN_LABELS: Record<PlanTier, string> = {
  start: "Start",
  pro: "Pro",
  elite: "Elite",
};

export const FeatureGuard = ({ feature, children, message }: FeatureGuardProps) => {
  const { canAccess, requiredPlan } = usePlanAccess();
  const navigate = useNavigate();

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  const minPlan = requiredPlan(feature);

  return (
    <div className="relative rounded-2xl overflow-hidden">
      {/* Blurred content underneath */}
      <div className="pointer-events-none select-none" aria-hidden>
        <div className="blur-sm opacity-40 scale-[0.98]">
          {children}
        </div>
      </div>

      {/* Glass overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-md bg-zinc-950/60"
      >
        <div className="text-center max-w-sm px-6">
          {/* Glass card */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          >
            <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center">
              <Lock className="w-6 h-6 text-orange-400" strokeWidth={1.5} />
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              Función Premium
            </h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {message || "Esta función está disponible en planes superiores. Actualiza tu suscripción para desbloquearla."}
            </p>

            <Button
              onClick={() => navigate("/settings?tab=suscripcion")}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-[0_4px_16px_rgba(251,146,60,0.3)]"
            >
              <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Desbloquear en Plan {PLAN_LABELS[minPlan]}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
