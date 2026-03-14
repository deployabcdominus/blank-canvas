import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Info, Loader2, UserPlus, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type InvitationData = {
  id: string;
  company_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
};

const Invite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [mode, setMode] = useState<"info" | "register" | "accepting">("info");
  const [formData, setFormData] = useState({ fullName: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate invitation token
  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setError("Token de invitación no proporcionado.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .rpc("get_invitation_by_token", { p_token: token })
        .maybeSingle();

      if (fetchError || !data) {
        setError("Invitación inválida o no encontrada.");
        setLoading(false);
        return;
      }

      if (data.accepted_at) {
        setError("Esta invitación ya fue utilizada.");
        setLoading(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError("Esta invitación ha expirado. Solicita una nueva al administrador.");
        setLoading(false);
        return;
      }

      setInvitation(data as InvitationData);
      setLoading(false);
    };

    validate();
  }, [token]);

  // If user is already logged in, try to accept directly
  useEffect(() => {
    if (!user || !invitation) return;

    const userEmail = user.email?.toLowerCase();
    const inviteEmail = invitation.email.toLowerCase();

    if (userEmail !== inviteEmail) {
      setError(
        `Esta invitación fue enviada a ${invitation.email}. Debes iniciar sesión con ese correo exacto. Estás conectado como ${user.email}.`
      );
      return;
    }

    // Email matches - accept invitation
    acceptInvitation();
  }, [user, invitation]);

  const acceptInvitation = async () => {
    if (!invitation) return;
    setMode("accepting");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("accept-invitation", {
        body: { token: invitation.token },
      });

      if (fnError) throw new Error(fnError.message || "Error al aceptar la invitación");
      if (data?.error) throw new Error(data.error);

      toast({ title: "¡Bienvenido!", description: "Te has unido al equipo exitosamente." });
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.message || "Error desconocido";
      setError("Error al aceptar la invitación: " + msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const handleGoToLogin = () => {
    // Preserve token for post-login redirect
    sessionStorage.setItem("pendingInviteToken", token || "");
    localStorage.setItem("invite_token", token || "");
    localStorage.setItem("invite_email", invitation?.email || "");
    navigate(`/login?invite=${token}`);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    if (formData.password.length < 8) {
      toast({ title: "Error", description: "La contraseña debe tener al menos 8 caracteres.", variant: "destructive" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Las contraseñas no coinciden.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email: invitation.email,
      password: formData.password,
      options: {
        data: { full_name: formData.fullName },
      },
    });

    if (signUpError) {
      if (signUpError.message?.includes("already registered")) {
        // Instead of red toast, set emailExists and go back to info mode
        setEmailExists(true);
        setMode("info");
      } else {
        toast({ title: "Error al registrarse", description: signUpError.message, variant: "destructive" });
      }
      setIsSubmitting(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: invitation.email,
      password: formData.password,
    });

    if (signInError) {
      toast({ title: "Error al iniciar sesión", description: signInError.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 max-w-md text-center">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Acceso Restringido</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">Volver al inicio</Button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  if (mode === "accepting") {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Uniéndote al equipo...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-soft-blue-foreground" />
            <h1 className="text-2xl font-bold mb-2">Invitación al Equipo</h1>
            <p className="text-muted-foreground">
              Has sido invitado como <span className="font-semibold text-foreground">{invitation?.role === "member" ? "Comercial" : invitation?.role}</span>
            </p>
            <div className="mt-3 p-3 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">Email autorizado:</p>
              <p className="font-semibold">{invitation?.email}</p>
            </div>
          </div>

          {mode === "info" && (
            <div className="space-y-3">
              <Button onClick={() => setMode("register")} className="w-full btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover" size="lg">
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Cuenta Nueva
              </Button>

              <div className="flex items-center gap-3">
                <hr className="flex-1 border-border" />
                <span className="text-xs text-muted-foreground">o</span>
                <hr className="flex-1 border-border" />
              </div>

              <Button onClick={handleGoToLogin} variant="outline" className="w-full" size="lg">
                Ya tengo cuenta — Iniciar Sesión
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Si tuviste problemas anteriores con esta invitación,<br/>
                usa "Ya tengo cuenta" e inicia sesión con tu email y contraseña.
              </p>
            </div>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm">
                <p className="text-amber-600 dark:text-amber-400">
                  ⚠️ Debes registrarte con el email <strong>{invitation?.email}</strong>. No se permite otro email.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input value={formData.fullName} onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))} required className="glass" placeholder="Tu nombre completo" />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={invitation?.email || ""} disabled className="glass bg-muted/50" />
              </div>

              <div className="space-y-2">
                <Label>Contraseña</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} required className="glass pr-10" placeholder="Mínimo 8 caracteres" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirmar Contraseña</Label>
                <Input type="password" value={formData.confirmPassword} onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} required className="glass" placeholder="Repite la contraseña" />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setMode("info")} className="flex-1">Atrás</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover">
                  {isSubmitting ? "Registrando..." : "Registrarme"}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Invite;
