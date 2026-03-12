import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, LogIn, UserPlus, ShieldCheck, CreditCard, Mail } from "lucide-react";

type PurchaseData = {
  id: string;
  plan_id: string;
  purchaser_email: string;
  company_id: string | null;
  access_token: string;
  status: string;
};

const Access = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState<string | null>(null);
  const [purchase, setPurchase] = useState<PurchaseData | null>(null);

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        // No token — show the general access page
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("purchases")
        .select("id, plan_id, purchaser_email, company_id, access_token, status")
        .eq("access_token", token)
        .maybeSingle();

      if (fetchError || !data) {
        setError("Token de acceso inválido o no encontrado.");
        setLoading(false);
        return;
      }

      if (data.status !== "paid") {
        setError("Esta compra no ha sido procesada correctamente.");
        setLoading(false);
        return;
      }

      setPurchase(data as PurchaseData);
      setLoading(false);
    };

    validate();
  }, [token]);

  const handleRegister = () => {
    localStorage.setItem("purchase_token", token || "");
    localStorage.setItem("purchase_email", purchase?.purchaser_email || "");
    navigate("/register?token=" + (token || ""));
  };

  const handleLogin = () => {
    localStorage.setItem("purchase_token", token || "");
    localStorage.setItem("purchase_email", purchase?.purchaser_email || "");
    navigate("/login");
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

  // If there's a token error, show error state
  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 max-w-md text-center"
          >
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Acceso Inválido</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Volver al inicio
            </Button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // If we have a valid purchase (token flow), show login/register options
  if (purchase) {
    const hasCompany = !!purchase.company_id;

    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 max-w-md w-full"
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {hasCompany ? "Accede a tu Empresa" : "Configura tu Empresa"}
              </h1>
              <p className="text-muted-foreground">
                {hasCompany
                  ? "Tu empresa ya está configurada. Inicia sesión para acceder."
                  : "Eres el primer usuario. Regístrate para convertirte en administrador y configurar tu empresa."}
              </p>
            </div>

            <div className="space-y-3">
              {!hasCompany && (
                <Button
                  onClick={handleRegister}
                  className="w-full btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover"
                  size="lg"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Registrarme como Administrador
                </Button>
              )}
              <Button
                onClick={handleLogin}
                variant={hasCompany ? "default" : "outline"}
                className={hasCompany ? "w-full btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover" : "w-full"}
                size="lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  // General access page (no token) — gatekeeping message
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-md w-full"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-6 glass-card rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Acceso a Sign Flow</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              El registro en Sign Flow está disponible únicamente después de adquirir un plan o mediante una invitación de tu administrador.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate("/checkout")}
              className="w-full btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover"
              size="lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Ver planes
            </Button>

            <Button
              onClick={() => navigate("/invite")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Mail className="w-4 h-4 mr-2" />
              Tengo una invitación
            </Button>

            <Button
              onClick={() => navigate("/login")}
              variant="ghost"
              className="w-full"
              size="lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar sesión
            </Button>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Access;
