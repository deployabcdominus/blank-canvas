import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, KeyRound, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { SignFlowLogo } from "@/components/SignFlowLogo";
import { useLanguage } from "@/i18n/LanguageContext";

type Phase = "verifying" | "ready" | "invalid" | "done";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("verifying");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Establish the recovery session from whichever link format Supabase used.
  useEffect(() => {
    let cancelled = false;

    const establishSession = async () => {
      try {
        const hash = window.location.hash.startsWith("#")
          ? new URLSearchParams(window.location.hash.substring(1))
          : new URLSearchParams();

        const hashError = hash.get("error_description") || hash.get("error");
        const queryError = searchParams.get("error_description") || searchParams.get("error");
        if (hashError || queryError) {
          if (!cancelled) {
            setErrorMessage(decodeURIComponent(hashError || queryError || ""));
            setPhase("invalid");
          }
          return;
        }

        // 1. Implicit flow: #access_token=...&refresh_token=...&type=recovery
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          if (!cancelled) setPhase("ready");
          return;
        }

        // 2. PKCE flow: ?code=...
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (!cancelled) setPhase("ready");
          return;
        }

        // 3. Verification link flow: ?token_hash=...&type=recovery
        const tokenHash = searchParams.get("token_hash") || searchParams.get("token");
        const type = searchParams.get("type");
        if (tokenHash && (type === "recovery" || !type)) {
          const { error } = await supabase.auth.verifyOtp({
            type: "recovery",
            token_hash: tokenHash,
          });
          if (error) throw error;
          if (!cancelled) setPhase("ready");
          return;
        }

        // 4. Fallback: session may already exist (detectSessionInUrl consumed the hash)
        const { data } = await supabase.auth.getSession();
        if (!cancelled) setPhase(data.session ? "ready" : "invalid");
      } catch (err: any) {
        if (!cancelled) {
          setErrorMessage(err?.message ?? null);
          setPhase("invalid");
        }
      }
    };

    establishSession();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        title: "Error",
        description: isEn
          ? "Password must be at least 8 characters."
          : "La contraseña debe tener al menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: isEn ? "Passwords do not match." : "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setPhase("done");
    toast({
      title: isEn ? "Password updated" : "Contraseña actualizada",
      description: isEn
        ? "Sign in with your new password."
        : "Inicia sesión con tu nueva contraseña.",
    });

    await supabase.auth.signOut();
    setTimeout(() => navigate("/login", { replace: true }), 1200);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-foreground relative flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="w-full max-w-md relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <Link to="/" className="inline-block" aria-label="SignFlow">
                <SignFlowLogo variant="technical" className="h-14 w-auto mx-auto" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="glass-card border-white/10">
                <CardHeader className="space-y-1">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <KeyRound className="h-5 w-5 text-primary" />
                    {isEn ? "Set a new password" : "Define una nueva contraseña"}
                  </CardTitle>
                  <CardDescription>
                    {isEn
                      ? "Choose a strong password to regain access to your account."
                      : "Elige una contraseña segura para recuperar el acceso a tu cuenta."}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {phase === "verifying" && (
                    <div className="flex items-center justify-center gap-3 py-10 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">
                        {isEn ? "Validating your link..." : "Validando tu enlace..."}
                      </span>
                    </div>
                  )}

                  {phase === "invalid" && (
                    <div className="space-y-4 py-4 text-center">
                      <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        {isEn
                          ? "This recovery link is invalid or has expired. Request a new one from the login page."
                          : "Este enlace de recuperación no es válido o ya expiró. Solicita uno nuevo desde la pantalla de inicio de sesión."}
                      </p>
                      {errorMessage && (
                        <p className="text-xs text-destructive/80 break-words">{errorMessage}</p>
                      )}
                      <Button className="w-full" onClick={() => navigate("/login")}>
                        {isEn ? "Back to login" : "Volver al inicio de sesión"}
                      </Button>
                    </div>
                  )}

                  {phase === "done" && (
                    <div className="py-8 text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {isEn
                          ? "Password updated. Redirecting to login..."
                          : "Contraseña actualizada. Redirigiendo al inicio de sesión..."}
                      </p>
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" />
                    </div>
                  )}

                  {phase === "ready" && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">
                          {isEn ? "New password" : "Nueva contraseña"}
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={isEn ? "Toggle password visibility" : "Mostrar u ocultar contraseña"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          {isEn ? "Confirm password" : "Confirmar contraseña"}
                        </Label>
                        <Input
                          id="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEn ? "Saving..." : "Guardando..."}
                          </>
                        ) : (
                          isEn ? "Update password" : "Actualizar contraseña"
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>

                <CardFooter className="justify-center">
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {isEn ? "Back to login" : "Volver al inicio de sesión"}
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
