import { useNavigate } from "react-router-dom";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

const ENTITY_LABELS_ES: Record<string, string> = {
  work_orders: "órdenes de trabajo",
  leads: "leads",
  users: "usuarios",
  proposals: "propuestas",
};

const ENTITY_LABELS_EN: Record<string, string> = {
  work_orders: "work orders",
  leads: "leads",
  users: "users",
  proposals: "proposals",
};

interface PlanLimitBannerProps {
  entity: "work_orders" | "leads" | "users" | "proposals";
}

export function PlanLimitBanner({ entity }: PlanLimitBannerProps) {
  const limits = usePlanLimits();
  const navigate = useNavigate();
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const limit = limits[entity];
  const label = isEn ? ENTITY_LABELS_EN[entity] : ENTITY_LABELS_ES[entity];

  if (limits.loading || limit.isUnlimited) return null;

  if (limit.isAtLimit) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "16px",
        }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">
            {isEn
              ? <>You have reached the <span className="font-semibold">{limits.planName}</span> plan limit for {label}.</>
              : <>Has alcanzado el límite de {label} en tu plan{" "}<span className="font-semibold">{limits.planName}</span>.</>}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/settings?tab=suscripcion")}
          className="shrink-0 bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
          variant="outline"
        >
          <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
          Upgrade
        </Button>
      </div>
    );
  }

  if (limit.isNearLimit) {
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "16px",
        }}
        className="flex items-center gap-3"
      >
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-sm text-amber-300">
          {isEn
            ? <>You are using <span className="font-semibold">{limit.current}</span> of{" "}<span className="font-semibold">{limit.max}</span> available {label}.</>
            : <>Estás usando <span className="font-semibold">{limit.current}</span> de{" "}<span className="font-semibold">{limit.max}</span> {label} disponibles.</>}
        </p>
      </div>
    );
  }

  return null;
}
