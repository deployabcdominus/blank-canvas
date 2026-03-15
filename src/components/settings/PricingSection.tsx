import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, ExternalLink, Loader2, CreditCard } from "lucide-react";
import { usePlanAccess, type PlanTier } from "@/hooks/usePlanAccess";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

interface PlanDef {
  tier: PlanTier;
  name: string;
  tagline: string;
  price: string;
  icon: React.ElementType;
  recommended: boolean;
  features: string[];
  priceId: string;
}

const PLANS: PlanDef[] = [
  {
    tier: "start",
    name: "Start",
    tagline: "Auto-empleados / Freelance",
    price: "$29",
    icon: Zap,
    recommended: false,
    priceId: STRIPE_TIERS.start.price_id,
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
    priceId: STRIPE_TIERS.pro.price_id,
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
    priceId: STRIPE_TIERS.elite.price_id,
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
  const { session } = useAuth();
  const { subscriptionStatus, subscriptionEnd, checkSubscription } = useSubscription();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  // Handle Stripe redirect success
  useEffect(() => {
    const stripeResult = searchParams.get("stripe");
    if (stripeResult === "success") {
      toast({
        title: "🎉 ¡Gracias por confiar en nosotros!",
        description: `Tu plan ya está activo. Disfruta de todas las funciones.`,
      });
      // Refresh subscription state
      checkSubscription();
      // Clean URL
      searchParams.delete("stripe");
      setSearchParams(searchParams, { replace: true });
    } else if (stripeResult === "cancel") {
      searchParams.delete("stripe");
      setSearchParams(searchParams, { replace: true });
    }
  }, []);

  const handleCheckout = async (priceId: string, tier: string) => {
    if (!session?.access_token) {
      toast({ title: "Error", description: "Debes iniciar sesión", variant: "destructive" });
      return;
    }
    setLoadingTier(tier);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo iniciar el pago", variant: "destructive" });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleCustomerPortal = async () => {
    if (!session?.access_token) return;
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo abrir el portal", variant: "destructive" });
    } finally {
      setLoadingPortal(false);
    }
  };

  const hasStripeSubscription = subscriptionStatus !== "none" && subscriptionStatus !== undefined;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Tu Suscripción</h2>
        <p className="text-muted-foreground text-sm">
          Plan actual:{" "}
          <Badge variant="outline" className="ml-1 border-primary/30 text-primary font-semibold">
            {planTier.charAt(0).toUpperCase() + planTier.slice(1)}
          </Badge>
          {subscriptionStatus === "past_due" && (
            <Badge variant="destructive" className="ml-2 text-xs">
              Pago Pendiente
            </Badge>
          )}
        </p>
      </div>

      {/* Past Due Warning */}
      {subscriptionStatus === "past_due" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <CreditCard className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-200">
                Tu suscripción tiene un pago pendiente
              </p>
              <p className="text-xs text-amber-200/70 mt-1">
                Por favor, actualiza tu método de pago para evitar la suspensión del servicio.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCustomerPortal}
                disabled={loadingPortal}
                className="mt-3 border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
              >
                {loadingPortal ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <ExternalLink className="w-3 h-3 mr-2" />}
                Actualizar Método de Pago
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Manage subscription button if they have Stripe */}
      {hasStripeSubscription && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleCustomerPortal}
            disabled={loadingPortal}
            className="border-white/[0.08] hover:bg-white/[0.04]"
          >
            {loadingPortal ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
            Gestionar Suscripción (Facturas, Método de Pago)
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan, i) => {
          const Icon = plan.icon;
          const isCurrent = plan.tier === planTier;
          const isRecommended = plan.recommended;
          const isLoading = loadingTier === plan.tier;

          return (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            >
              <Card
                className={`relative overflow-hidden h-full transition-all duration-300 ${
                  isRecommended
                    ? "border-orange-500/40 bg-gradient-to-b from-orange-500/[0.06] to-transparent shadow-[0_0_40px_rgba(251,146,60,0.08)]"
                    : "border-white/[0.06] bg-white/[0.02]"
                } ${isCurrent ? "ring-2 ring-primary/40" : ""}`}
              >
                {isRecommended && (
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                )}
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-xl ${isRecommended ? "bg-orange-500/15" : "bg-white/[0.06]"}`}>
                      <Icon
                        className={`w-5 h-5 ${isRecommended ? "text-orange-400" : "text-muted-foreground"}`}
                        strokeWidth={1.5}
                      />
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
                        <Check
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isRecommended ? "text-orange-400" : "text-primary"}`}
                          strokeWidth={2}
                        />
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
                      onClick={() => handleCheckout(plan.priceId, plan.tier)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
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
