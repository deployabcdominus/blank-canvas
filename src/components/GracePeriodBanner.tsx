import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

export const GracePeriodBanner = () => {
  const { subscriptionStatus } = useSubscription();
  const navigate = useNavigate();

  if (subscriptionStatus !== "past_due") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl mb-4 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] backdrop-blur-xl cursor-pointer hover:bg-amber-500/[0.12] transition-colors"
      onClick={() => navigate("/settings?tab=suscripcion")}
    >
      <div className="flex items-center gap-3">
        <CreditCard className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="text-sm text-amber-200">
          <span className="font-medium">Tu suscripción tiene un pago pendiente.</span>{" "}
          <span className="text-amber-200/70">
            Actualiza tu método de pago para evitar la suspensión del servicio.
          </span>
        </p>
      </div>
    </motion.div>
  );
};
