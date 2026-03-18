import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, Check, ChevronRight, Star, ArrowRight, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { hasCompany } from "@/lib/auth-helpers";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import brandLogoSrc from "@/assets/brand-logo.png";

/* ─── Inline pricing data ─── */
const plans = [
  {
    key: "start" as const,
    name: "Start",
    price: 29,
    features: ["Hasta 50 leads activos", "1 usuario administrador", "Pipeline básico", "Soporte por email"],
    recommended: false,
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: 79,
    features: ["Leads ilimitados", "Hasta 5 usuarios", "Firma digital", "Roles y permisos", "Soporte prioritario"],
    recommended: true,
  },
  {
    key: "elite" as const,
    name: "Elite",
    price: 149,
    features: ["Todo lo de Pro", "Usuarios ilimitados", "Ficha técnica avanzada", "Modo offline", "Soporte 24/7"],
    recommended: false,
  },
];

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    const validateAccess = async () => {
      const plan = searchParams.get("plan");
      if (plan) {
        setIsAuthorized(true);
        setIsValidating(false);
        return;
      }

      const token = searchParams.get("token");
      const storedToken = localStorage.getItem("purchase_token");
      const accessToken = token || storedToken;

      if (accessToken) {
        const { data } = await supabase
          .rpc("validate_purchase_by_token", { p_access_token: accessToken })
          .maybeSingle();

        if (data) {
          setIsAuthorized(true);
          setIsValidating(false);
          return;
        }
      }

      const storedEmail = localStorage.getItem("purchase_email");
      if (storedEmail && storedToken) {
        setIsAuthorized(true);
        setIsValidating(false);
        return;
      }

      // Not authorized — but we won't redirect, we'll show pricing
      setIsAuthorized(false);
      setIsValidating(false);
    };

    validateAccess();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.companyName);

    if (!error) {
      toast({ title: "¡Cuenta creada con éxito!", description: "Bienvenido a SignFlow." });
      localStorage.removeItem("purchase_token");
      localStorage.removeItem("purchase_email");

      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const userHasCompany = await hasCompany(authData.user.id);
        navigate(userHasCompany ? "/dashboard" : "/onboarding");
      }
    }

    setIsLoading(false);
  };

  const handleChoosePlan = async (tierKey: "start" | "pro" | "elite") => {
    setLoadingPlan(tierKey);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Set plan context and allow registration
        navigate(`/register?plan=${tierKey}`, { replace: true });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: STRIPE_TIERS[tierKey].price_id },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  if (isValidating) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </PageTransition>
    );
  }

  // ── Not authorized: show pricing instead of blocking ──
  if (!isAuthorized) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#050505] text-zinc-200 px-5 py-20 overflow-x-hidden">
          {/* Background */}
          <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.04),transparent_50%)]" />
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-16">
              <a href="/" className="flex items-center gap-1.5" aria-label="Sign Flow">
                <div className="w-8 h-8 overflow-hidden">
                  <img src={brandLogoSrc} alt="Sign Flow" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-lg text-zinc-100">Sign Flow</span>
              </a>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-zinc-500 hover:text-zinc-200 border border-white/[0.06] rounded-full px-5 text-[13px]">
                Iniciar Sesión
              </Button>
            </div>

            {/* Title */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-400/60 mb-6 px-3.5 py-1.5 rounded-full border border-orange-500/10 bg-orange-500/[0.04]">
                <Zap className="w-3.5 h-3.5" />
                Elige tu plan para comenzar
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
                Primero, elige el plan ideal
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-orange-300 via-orange-500 to-amber-500 bg-clip-text text-transparent"> para tu negocio</span>
              </h1>
              <p className="text-zinc-400 text-[15px] max-w-lg mx-auto">
                Selecciona tu plan y crea tu cuenta. Sin compromisos, cancela cuando quieras.
              </p>
            </motion.div>

            {/* Plans grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-start">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.6 }}
                  className={`group relative flex flex-col rounded-2xl transition-all duration-500 ${
                    plan.recommended
                      ? "border-2 border-orange-500/25 bg-[#0a0a0a] md:scale-[1.04] shadow-[0_0_40px_-10px_rgba(249,115,22,0.08)]"
                      : "border border-white/[0.04] bg-[#0a0a0a] opacity-80 hover:opacity-100"
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-b from-orange-500 to-orange-600 text-white text-[10px] font-bold px-5 py-1.5 rounded-full shadow-[0_2px_10px_rgba(249,115,22,0.25)] flex items-center gap-1.5">
                        <Star className="w-3 h-3 fill-current" /> Más Popular
                      </span>
                    </div>
                  )}

                  <div className="relative z-10 p-8 sm:p-9">
                    <h3 className="text-xl font-bold mb-1 text-white">{plan.name}</h3>
                    {plan.recommended && <p className="text-[11px] text-orange-400/40 font-medium mb-4">Elegido por negocios en crecimiento</p>}
                    {!plan.recommended && <div className="mb-4" />}

                    <div className="flex items-baseline gap-1.5 mb-7">
                      <span className="text-5xl font-extrabold tracking-tight">${plan.price}</span>
                      <span className="text-sm text-zinc-600 font-medium">/mes</span>
                    </div>

                    <ul className="space-y-4 mb-10">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[13px] text-zinc-400">
                          <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.recommended ? "text-orange-400/60" : "text-zinc-600"}`} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleChoosePlan(plan.key)}
                      disabled={loadingPlan === plan.key}
                      className={`w-full rounded-xl h-12 font-semibold text-[14px] transition-all duration-500 ${
                        plan.recommended
                          ? "bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 shadow-[0_2px_12px_rgba(249,115,22,0.15)]"
                          : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-white/[0.04] hover:border-orange-500/10"
                      }`}
                    >
                      {loadingPlan === plan.key ? "Procesando..." : `Elegir ${plan.name}`}
                      {loadingPlan !== plan.key && <ChevronRight className="w-4 h-4 ml-1" />}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-10 text-[13px] text-zinc-600">
              ¿Ya tienes una cuenta?{" "}
              <button onClick={() => navigate("/login")} className="text-orange-400/70 hover:text-orange-400 transition-colors">Inicia sesión</button>
            </motion.p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-6 glass-card rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-soft-blue-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Crear cuenta</h1>
            <p className="text-muted-foreground">Regístrate para comenzar en SignFlow</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input id="fullName" type="text" placeholder="Ingresa tu nombre" value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))} required className="glass" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la empresa</Label>
                <Input id="companyName" type="text" placeholder="Ingresa el nombre de la empresa" value={formData.companyName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))} required className="glass" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Ingresa tu email" value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required className="glass" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="Mínimo 6 caracteres" value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} required className="glass" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input id="confirmPassword" type="password" placeholder="Repite la contraseña" value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))} required className="glass" />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover" size="lg" disabled={isLoading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </motion.div>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <button onClick={() => navigate("/login")} className="text-soft-blue-foreground hover:underline">Inicia sesión</button>
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Register;
