import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2, ArrowRight, Loader2, User, Building, Sparkles, Shield,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import brandLogoSrc from "@/assets/brand-logo.png";

const INDUSTRIES = [
  { value: "Servicios IT y Software", label: "Servicios IT" },
  { value: "Climatización y HVAC", label: "Climatización / HVAC" },
  { value: "Señalética y Publicidad", label: "Señalética / Rotulación" },
  { value: "Mantenimiento y Reformas", label: "Mantenimiento" },
  { value: "Otro", label: "Otro" },
];

// Map price IDs to plan keys
function getPlanKeyFromPriceId(priceId: string): string {
  for (const [key, tier] of Object.entries(STRIPE_TIERS)) {
    if (tier.price_id === priceId) return key;
  }
  return "start";
}

const PostPaymentSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // From Stripe
  const [stripeEmail, setStripeEmail] = useState("");
  const [planName, setPlanName] = useState("Start");
  const [priceId, setPriceId] = useState("");
  const [stripeCustomerId, setStripeCustomerId] = useState("");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");

  // Retrieve Stripe session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        toast({ title: "Error", description: "No se encontró la sesión de pago.", variant: "destructive" });
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("retrieve-session", {
          body: { sessionId },
        });

        if (error) throw error;
        if (!data?.email) throw new Error("No se pudo obtener el email del pago.");

        setStripeEmail(data.email);
        setPlanName(data.planName || "Start");
        setPriceId(data.priceId || "");
        setStripeCustomerId(data.customerId || "");
      } catch (e: any) {
        toast({ title: "Error al verificar pago", description: e.message, variant: "destructive" });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, navigate]);

  const handleCreateAccount = async () => {
    if (!fullName.trim() || !password.trim()) {
      toast({ title: "Completa los campos", description: "Nombre y contraseña son requeridos.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Contraseña muy corta", description: "Mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleFinalize = async () => {
    if (!companyName.trim() || !industry) {
      toast({ title: "Completa los campos", description: "Nombre de empresa e industria son requeridos.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // 1. Sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: stripeEmail,
        password,
        options: {
          data: { full_name: fullName, company_name: companyName },
        },
      });

      if (signUpError) throw signUpError;
      const user = signUpData.user;
      if (!user) throw new Error("No se pudo crear el usuario.");

      // 2. Sign in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: stripeEmail,
        password,
      });
      if (signInError) throw signInError;

      // 3. Determine plan_id
      const planKey = getPlanKeyFromPriceId(priceId);

      // 4. Create company via RPC
      const { data: company, error: companyError } = await supabase.rpc("create_company", {
        p_user_id: user.id,
        p_name: companyName,
        p_logo_url: "",
        p_brand_color: "soft-blue",
        p_industry: industry,
        p_plan_id: planKey,
      });

      if (companyError) throw companyError;
      const companyId = (company as any)?.id;

      if (!companyId) throw new Error("No se pudo crear la empresa.");

      // 5. Link profile to company
      await supabase.from("profiles").update({ company_id: companyId }).eq("id", user.id);

      // 6. Assign admin role
      await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });

      // 7. Update company with stripe_customer_id and subscription_status
      if (stripeCustomerId) {
        await supabase.from("companies").update({
          stripe_customer_id: stripeCustomerId,
          subscription_status: "active",
        }).eq("id", companyId);
      }

      setCompleted(true);

      toast({
        title: `¡Bienvenido a Sign Flow!`,
        description: `Tu empresa "${companyName}" está activa con el plan ${planName}.`,
      });

      // Redirect after animation
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (e: any) {
      toast({ title: "Error al configurar", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Violet ambient blobs */}
          <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[180px]" />
            <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-fuchsia-600/10 blur-[180px]" />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            {/* Pulsing violet ring */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-purple-500/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mb-2">
              Finalizing your secure activation...
            </h2>
            <p className="text-zinc-500 text-sm">
              Connecting with Stripe to verify your payment
            </p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  if (completed) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden">
          <div className="fixed inset-0 pointer-events-none -z-10">
            <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[180px]" />
            <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-fuchsia-600/10 blur-[180px]" />
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="w-20 h-20 mx-auto mb-8 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-xl flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-purple-400" />
            </motion.div>
            <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">¡Todo listo!</h1>
            <p className="text-zinc-400 mb-2">Tu empresa está activa con el plan <span className="text-purple-400 font-semibold">{planName}</span>.</p>
            <p className="text-zinc-500 text-sm">Redirigiendo al dashboard...</p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen text-zinc-200 overflow-x-hidden relative">
        {/* Violet ambient background */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[15%] w-[600px] h-[500px] rounded-full bg-purple-600/10 blur-[180px]" />
          <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-fuchsia-600/8 blur-[180px]" />
        </div>

        {/* Progress bar */}
        <div className="fixed top-0 inset-x-0 z-50 h-1 bg-zinc-900">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: "0%" }}
            animate={{ width: step === 1 ? "50%" : "100%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-center min-h-screen px-5 py-20">
          <div className="w-full max-w-md">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-8 h-8 overflow-hidden">
                  <img src={brandLogoSrc} alt="Sign Flow" className="w-full h-full object-contain" />
                </div>
                <span className="font-bold text-lg text-zinc-100">Sign Flow</span>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                className="w-14 h-14 mx-auto mb-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center"
              >
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </motion.div>

              <h1 className="text-2xl font-extrabold text-white mb-2">¡Pago Confirmado!</h1>
              <p className="text-zinc-400 text-[15px]">
                Estás a un paso de activar tu plan{" "}
                <span className="text-orange-400 font-semibold">{planName}</span>
              </p>
            </motion.div>

            {/* Card container */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-orange-500/[0.08] bg-[#0a0a0a]/90 backdrop-blur-xl p-8 relative overflow-hidden"
              style={{
                boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 60px -20px rgba(249,115,22,0.06), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              {/* Step indicator */}
              <div className="flex items-center gap-3 mb-8">
                <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 1 ? "text-orange-400" : "text-zinc-600"}`}>
                  <User className="w-3.5 h-3.5" />
                  Tu Cuenta
                </div>
                <div className="flex-1 h-px bg-zinc-800" />
                <div className={`flex items-center gap-2 text-xs font-semibold ${step >= 2 ? "text-orange-400" : "text-zinc-600"}`}>
                  <Building className="w-3.5 h-3.5" />
                  Tu Empresa
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-sm">Email (verificado por Stripe)</Label>
                      <Input
                        value={stripeEmail}
                        readOnly
                        className="bg-zinc-900/50 border-white/[0.06] text-zinc-300 cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-sm">Tu Nombre Completo</Label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nombre y apellido"
                        className="bg-zinc-900/50 border-white/[0.06] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-sm">Crea tu Contraseña</Label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="bg-zinc-900/50 border-white/[0.06] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/20"
                      />
                    </div>

                    <Button
                      onClick={handleCreateAccount}
                      className="w-full h-12 bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 rounded-xl font-semibold"
                    >
                      Continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-sm">Nombre de tu Negocio</Label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ej: Mi Empresa LLC"
                        className="bg-zinc-900/50 border-white/[0.06] text-zinc-100 placeholder:text-zinc-600 focus:border-orange-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-sm">Industria</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger className="bg-zinc-900/50 border-white/[0.06] text-zinc-100">
                          <SelectValue placeholder="Selecciona tu industria" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/[0.06]">
                          {INDUSTRIES.map((ind) => (
                            <SelectItem key={ind.value} value={ind.value} className="text-zinc-200 focus:bg-orange-500/10">
                              {ind.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 border-white/[0.06] text-zinc-400 hover:text-zinc-200 bg-transparent rounded-xl"
                      >
                        Atrás
                      </Button>
                      <Button
                        onClick={handleFinalize}
                        disabled={submitting}
                        className="flex-1 h-12 bg-gradient-to-b from-orange-500 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700 rounded-xl font-semibold"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Configurando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Finalizar Configuración
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Trust bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-2 mt-8 text-[11px] text-zinc-600"
            >
              <Shield className="w-3.5 h-3.5" />
              Tus datos están protegidos con cifrado de extremo a extremo
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PostPaymentSetup;
