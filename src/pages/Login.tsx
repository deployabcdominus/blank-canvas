import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { hasCompany } from "@/lib/auth-helpers";
import { getHomeRouteForUser } from "@/lib/role-redirect";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(formData.email, formData.password);

    if (!error) {
      toast({
        title: "¡Bienvenido de vuelta!",
        description: "Inicio de sesión exitoso.",
      });

      const inviteToken = localStorage.getItem("invite_token");
      const inviteEmail = localStorage.getItem("invite_email");
      if (inviteToken && inviteEmail) {
        localStorage.removeItem("invite_token");
        localStorage.removeItem("invite_email");
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
        title: "Ingresa tu email",
        description: "Escribe tu email en el campo de arriba y luego haz clic en '¿Olvidaste tu contraseña?'",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/settings?tab=perfil`,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Email enviado",
        description: "Revisa tu correo para restablecer tu contraseña.",
      });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 mx-auto mb-6 glass-card rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-soft-blue-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground">
              Inicia sesión para continuar en SignFlow
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-card p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email" type="email" placeholder="Ingresa tu email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required className="glass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password" type="password" placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required className="glass"
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover"
                  size="lg" disabled={isLoading}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {isLoading ? "Ingresando..." : "Ingresar"}
                </Button>
              </motion.div>
            </form>
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <button onClick={() => navigate('/register')} className="text-soft-blue-foreground hover:underline">
                Regístrate aquí
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
