import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { usePlanAccess, type PlanTier } from "@/hooks/usePlanAccess";

interface PlanDef {
  tier: PlanTier;
  name: string;
  tagline: string;
  price: string;
  icon: React.ElementType;
  recommended: boolean;
  features: string[];
}

const PLANS: PlanDef[] = [
  {
    tier: "start",
    name: "Start",
    tagline: "Auto-empleados / Freelance",
    price: "$29",
    icon: Zap,
    recommended: false,
    features: [
      "CRM + Gestión Manual",
      "Hasta 3 usuarios",
      "Etiquetas estándar",
      "Subida de archivos",
      "Seguridad básica",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    tagline: "Pequeñas y Medianas Empresas",
    price: "$79",
    icon: Sparkles,
    recommended: true,
    features: [
      "Todo en Start, más:",
      "Portal de firma digital",
      "Generador de Mockups",
      "Automatización avanzada",
      "Diccionarios personalizados",
      "Backup diario",
      "Hasta 15 usuarios",
    ],
  },
  {
    tier: "elite",
    name: "Elite",
    tagline: "Empresas con múltiples equipos",
    price: "$149",
    icon: Crown,
    recommended: false,
    features: [
      "Todo en Pro, más:",
      "Planos y Anotaciones Pro",
      "Campos ilimitados",
      "Subcontratistas / Logística",
      "API y Webhooks",
      "Audit Logs completos",
      "Usuarios ilimitados",
      "Soporte prioritario",
    ],
  },
];

export const PricingSection = () => {
  const { planTier } = usePlanAccess();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Tu Suscripción</h2>
        <p className="text-muted-foreground text-sm">
          Plan actual: <Badge variant="outline" className="ml-1 border-primary/30 text-primary font-semibold">{planTier.charAt(0).toUpperCase() + planTier.slice(1)}</Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isCurrent = plan.tier === planTier;
          const isRecommended = plan.recommended;

          return (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            >
              <Card className={`relative overflow-hidden h-full transition-all duration-300 ${
                isRecommended
                  ? "border-orange-500/40 bg-gradient-to-b from-orange-500/[0.06] to-transparent shadow-[0_0_40px_rgba(251,146,60,0.08)]"
                  : "border-white/[0.06] bg-white/[0.02]"
              } ${isCurrent ? "ring-2 ring-primary/40" : ""}`}>
                {isRecommended && (
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${isRecommended ? "bg-orange-500/15" : "bg-white/[0.06]"}`}>
                      <Icon className={`w-5 h-5 ${isRecommended ? "text-orange-400" : "text-muted-foreground"}`} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {isRecommended && (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px] px-1.5 py-0">
                            Recomendado
                          </Badge>
                        )}
                        {isCurrent && (
                          <Badge variant="outline" className="border-primary/30 text-primary text-[10px] px-1.5 py-0">
                            Actual
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{plan.tagline}</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/mes</span>
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isRecommended ? "text-orange-400" : "text-primary"}`} strokeWidth={2} />
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="outline" disabled className="w-full border-primary/20">
                      Plan Actual
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${
                        isRecommended
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-[0_4px_16px_rgba(251,146,60,0.25)]"
                          : ""
                      }`}
                      variant={isRecommended ? "default" : "outline"}
                    >
                      {plan.tier === "start" ? "Downgrade" : "Upgrade"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
