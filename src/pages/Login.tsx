import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { getHomeRouteForUser } from "@/lib/role-redirect";
import { hasCompany } from "@/lib/auth-helpers";
import { Checkbox } from "@/components/ui/checkbox";
import { PageTransition } from "@/components/PageTransition";
import { SignFlowLogo } from "@/components/SignFlowLogo";
import { useLanguage } from "@/i18n/LanguageContext";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const inviteToken = searchParams.get("invite") || searchParams.get("token");

  useEffect(() => {
    // Clean up potentially sensitive data from storage on reach
    localStorage.removeItem("invite_token");
    localStorage.removeItem("invite_email");
    sessionStorage.removeItem("pendingInviteToken");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(formData.email, formData.password);

    if (!error) {
      toast({
        title: t.auth.login.welcomeBack,
        description: t.auth.login.success,
      });

      // If there's an invite token in the URL, pass it to the invite validation page
      if (inviteToken) {
        navigate(`/invite?token=${inviteToken}`);
        setIsLoading(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const homeRoute = await getHomeRouteForUser(authData.user.id);
        if (homeRoute === "/superadmin") {
          navigate("/superadmin");
        } else {
          const userHasCompany = await hasCompany(authData.user.id);
          navigate(userHasCompany ? "/dashboard" : "/onboarding");
        }
      }
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      toast({
        title: t.auth.login.emailLabel,
        description: t.auth.login.forgotPasswordPrompt,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/settings?tab=perfil&lang=${locale}`,
    });

    if (error) {
      toast({ title: t.auth.login.error, description: error.message, variant: "destructive" });
    } else {
      toast({
        title: t.auth.login.emailSent,
        description: t.auth.login.emailSentDesc,
      });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-16 h-16 mx-auto mb-6 glass-card rounded-2xl flex items-center justify-center border-primary/20 shadow-lg shadow-primary/5"
            >
              <SignFlowLogo variant="technical" className="w-7 h-7 text-primary" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tighter mb-4 text-white">{t.auth.login.title}</h1>
            <p className="text-zinc-400 font-medium tracking-tight">{t.auth.login.subtitle}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-card p-6 sm:p-8 md:p-10 border-white/10 shadow-2xl relative overflow-hidden rounded-[24px] sm:rounded-[32px]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">{t.auth.login.emailLabel}</Label>
                <Input
                  id="email" type="email" placeholder={t.auth.login.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required className="glass input-glow h-12 rounded-xl border-white/10 text-white placeholder:text-zinc-600"
                />
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">{t.auth.login.passwordLabel}</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder={t.auth.login.passwordPlaceholder}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required className="glass input-glow h-12 rounded-xl border-white/10 text-white placeholder:text-zinc-600 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-primary transition-colors h-8 w-8 flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe} 
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                      className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded-md w-5 h-5"
                    />
                    <label htmlFor="remember" className="text-sm font-semibold leading-none cursor-pointer text-zinc-400 hover:text-white transition-colors">
                      {t.auth.login.rememberMe}
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    {t.auth.login.forgotPassword}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-14 shadow-xl shadow-primary/20 text-base font-black uppercase tracking-widest"
                size="lg" disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    {t.auth.login.submit}
                  </>
                )}
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-muted-foreground">
              {t.auth.login.noAccount}{" "}
              <button onClick={() => navigate('/register')} className="font-semibold text-primary hover:underline underline-offset-4">
                {t.auth.login.registerLink}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
