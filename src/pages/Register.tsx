import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Loader2, Check, ChevronRight, Star, ArrowRight, Zap, Eye, EyeOff, Building2, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { hasCompany } from "@/lib/auth-helpers";
import { supabase } from "@/integrations/supabase/client";
import { STRIPE_TIERS } from "@/lib/stripe-tiers";
import { SignFlowLogo } from "@/components/SignFlowLogo";
import { useLanguage } from "@/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Navbar } from "@/components/Navbar";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const { t, locale } = useLanguage();
  const isEn = locale === "en";
  const [isAnnual, setIsAnnual] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const plans = [
    {
      key: "start" as const,
      name: "Start",
      priceMonthly: 29,
      priceAnnual: 24,
      features: isEn
        ? ["Up to 50 active leads", "1 admin user", "Basic pipeline", "Email support"]
        : ["Hasta 50 leads activos", "1 usuario administrador", "Pipeline básico", "Soporte por email"],
      recommended: false,
    },
    {
      key: "pro" as const,
      name: "Pro",
      priceMonthly: 79,
      priceAnnual: 64,
      features: isEn
        ? ["Unlimited leads", "Up to 5 users", "Digital signature", "Roles & permissions", "Priority support"]
        : ["Leads ilimitados", "Hasta 5 usuarios", "Firma digital", "Roles y permisos", "Soporte prioritario"],
      recommended: true,
    },
    {
      key: "elite" as const,
      name: "Elite",
      priceMonthly: 149,
      priceAnnual: 119,
      features: isEn
        ? ["Everything in Pro", "Unlimited users", "Advanced technical sheet", "Offline mode", "24/7 support"]
        : ["Todo lo de Pro", "Usuarios ilimitados", "Ficha técnica avanzada", "Modo offline", "Soporte 24/7"],
      recommended: false,
    },
  ];
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

      setIsAuthorized(false);
      setIsValidating(false);
    };

    validateAccess();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: t.auth.register.passwordsMatchError, variant: "destructive" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "Error", description: t.auth.register.passwordLengthError, variant: "destructive" });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.companyName);

    if (!error) {
      toast({ title: t.auth.register.success, description: t.auth.register.successDesc });
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
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px]" />
          <Loader2 className="w-8 h-8 animate-spin text-primary relative z-10" />
        </div>
      </PageTransition>
    );
  }

  if (!isAuthorized) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background text-foreground px-5 py-20 overflow-x-hidden relative">
          <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,hsl(265,85%,60%,0.05),transparent_60%)]" />
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            <Navbar />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
                <Zap className="w-3.5 h-3.5 fill-current" />
                {t.auth.register.plansTitle}
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                {t.landing.pricing.titleLine1}
                <br className="hidden sm:block" />
                <span className="text-primary"> {t.landing.pricing.titleLine2}</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                {t.landing.pricing.subtitle}
              </p>
            </motion.div>

            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm font-medium transition-colors duration-300 ${!isAnnual ? "text-white" : "text-zinc-500"}`}>{t.landing.pricing.monthly}</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative w-14 h-[30px] rounded-full transition-all duration-400 ${isAnnual ? "bg-gradient-to-r from-violet-500 to-purple-600 shadow-[0_0_12px_rgba(139,92,246,0.2)]" : "bg-zinc-800"}`}
                aria-label="Toggle annual billing"
              >
                <motion.div
                  className="absolute top-[3px] w-6 h-6 rounded-full bg-white shadow-lg"
                  animate={{ left: isAnnual ? "calc(100% - 27px)" : "3px" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm font-medium transition-colors duration-300 ${isAnnual ? "text-white" : "text-zinc-500"}`}>{t.landing.pricing.annual}</span>
              <AnimatePresence>
                {isAnnual && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8, x: -8 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -8 }}
                    className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                  >
                    {t.landing.pricing.save20}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.key}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.6 }}
                  className={`group relative flex flex-col rounded-3xl transition-all duration-500 overflow-hidden ${
                    plan.recommended
                      ? "border-2 border-primary bg-primary/5 md:scale-[1.05] shadow-[0_20px_50px_-12px_rgba(139,92,246,0.15)] z-20"
                      : "border border-white/10 bg-card/40 hover:bg-card/60"
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
                  )}
                  {plan.recommended && (
                    <div className="absolute top-5 right-5 z-10">
                      <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> {t.auth.register.planPopular}
                      </span>
                    </div>
                  )}

                  <div className="p-8 sm:p-10 flex flex-col h-full">
                    <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                    
                    <div className="flex items-baseline gap-1.5 mb-1">
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={isAnnual ? plan.priceAnnual : plan.priceMonthly}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="text-5xl font-extrabold tracking-tight"
                        >
                          ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                        </motion.span>
                      </AnimatePresence>
                      <span className="text-sm text-muted-foreground font-medium">{t.auth.register.month}</span>
                    </div>

                    <div className="h-6 mb-6">
                      <AnimatePresence>
                        {isAnnual && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[11px] text-zinc-500"
                          >
                            {t.landing.pricing.billedAnnually} · <span className="line-through text-zinc-600">${plan.priceMonthly}{t.landing.pricing.perMonth}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <ul className="space-y-4 mb-10 flex-grow">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[14px] text-muted-foreground group-hover:text-foreground transition-colors">
                          <div className={`mt-1 p-0.5 rounded-full ${plan.recommended ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <Check className="w-3 h-3" />
                          </div>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleChoosePlan(plan.key)}
                      disabled={loadingPlan === plan.key}
                      className={`w-full rounded-2xl h-14 font-bold text-base transition-all duration-300 ${
                        plan.recommended
                          ? "btn-violet shadow-xl shadow-primary/20"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/5"
                      }`}
                    >
                      {loadingPlan === plan.key ? t.auth.register.wait : t.auth.register.getPlan.replace('{plan}', plan.name)}
                      {loadingPlan !== plan.key && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mt-12 text-muted-foreground">
              {t.auth.register.alreadyHaveAccount}{" "}
              <button onClick={() => navigate("/login")} className="text-primary font-bold hover:underline underline-offset-4 decoration-2">{t.auth.register.loginLink}</button>
            </motion.p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground px-5 overflow-x-hidden relative flex flex-col">
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />
        </div>

        <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col">
          {/* Top Navbar */}
          <header className="flex items-center justify-between py-6 border-b border-white/5 mb-8">
            <Link to="/" className="flex items-center gap-2.5 group" aria-label="Sign Flow">
              <div className="w-10 h-10 p-2 glass-card border-primary/20 flex items-center justify-center transition-all group-hover:border-primary/40 rounded-xl">
                <SignFlowLogo variant="technical" className="w-full h-full text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Sign Flow</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/login")} 
                className="hidden sm:flex text-white hover:text-white hover:bg-white/10 border border-white/20 rounded-full px-6 transition-all font-bold"
              >
                {t.auth.login.submit}
              </Button>
            </div>
          </header>

          <div className="flex-1 flex items-center justify-center py-12">
            <div className="w-full max-w-md relative">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
                <Link to="/">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-20 h-20 mx-auto mb-6 glass-card rounded-2xl flex items-center justify-center border-primary/20 shadow-lg shadow-primary/5 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <SignFlowLogo variant="technical" className="w-10 h-10 text-primary" />
                  </motion.div>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight mb-2">{t.auth.register.title}</h1>
                <p className="text-muted-foreground/80">{t.auth.register.subtitle}</p>
              </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="glass-card p-6 sm:p-8 border-white/10 shadow-2xl relative overflow-hidden rounded-[24px] sm:rounded-[32px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{t.auth.register.fullNameLabel}</Label>
                  <Input id="fullName" type="text" placeholder={t.auth.register.fullNamePlaceholder} value={formData.fullName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))} required className="glass input-glow h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{t.auth.register.companyNameLabel}</Label>
                  <div className="relative">
                    <Input id="companyName" type="text" placeholder={t.auth.register.companyNamePlaceholder} value={formData.companyName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))} required className="glass input-glow h-11 pl-10" />
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{t.auth.register.emailLabel}</Label>
                <Input id="email" type="email" placeholder={t.auth.register.emailPlaceholder} value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required className="glass input-glow h-11" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{t.auth.register.passwordLabel}</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder={t.auth.register.passwordPlaceholder} value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} required className="glass input-glow h-11 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{t.auth.register.confirmPasswordLabel}</Label>
                  <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder={t.auth.register.confirmPasswordPlaceholder} value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))} required className="glass input-glow h-11" />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
                <Button type="submit" className="w-full btn-violet h-12 shadow-lg shadow-primary/20" size="lg" disabled={isLoading}>
                  {isLoading ? t.auth.register.creating : t.auth.register.submit}
                </Button>
              </motion.div>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              {t.auth.register.alreadyHaveAccount}{" "}
              <button onClick={() => navigate("/login")} className="font-bold text-primary hover:underline underline-offset-4 decoration-2">{t.auth.register.loginLink}</button>
            </p>
          </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Register;
