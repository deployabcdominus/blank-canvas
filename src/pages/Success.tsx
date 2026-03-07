import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Copy, Check, ArrowRight, Link } from "lucide-react";

const Success = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "usuario";
  const accessToken = localStorage.getItem("purchase_access_token");
  const [copied, setCopied] = useState(false);

  const accessLink = accessToken
    ? `${window.location.origin}/access?token=${accessToken}`
    : null;

  const handleCopy = async () => {
    if (!accessLink) return;
    await navigator.clipboard.writeText(accessLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2, duration: 0.6 }} className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 glass-card rounded-full flex items-center justify-center glow-mint">
              <CheckCircle className="w-10 h-10 text-mint-foreground" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="mb-8">
            <h1 className="text-4xl font-bold mb-4">¡Bienvenido, {userName}! 🎉</h1>
            <p className="text-xl text-muted-foreground mb-2">¡Tu compra fue exitosa!</p>
          </motion.div>

          {accessLink && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="glass-card p-6 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Link className="w-5 h-5 text-soft-blue-foreground" />
                <h3 className="font-semibold">Tu Link de Acceso</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Usa este link para acceder a tu cuenta y configurar tu empresa como administrador.
              </p>
              <div className="flex items-center gap-2">
                <Input value={accessLink} readOnly className="glass text-xs" />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Guárdalo. Solo el primer usuario que acceda será el administrador.
              </p>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }} className="glass-card p-6 mb-8">
            <h3 className="font-semibold mb-3">¿Qué sigue?</h3>
            <ul className="text-left space-y-2 text-muted-foreground">
              <li>• Abre el link de acceso</li>
              <li>• Crea tu cuenta (serás el administrador)</li>
              <li>• Configura el nombre de tu empresa</li>
              <li>• Invita a tu equipo desde Gestión de Equipo</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.6 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {accessLink ? (
              <Button
                onClick={() => window.open(accessLink, "_self")}
                className="btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover"
                size="lg"
              >
                Acceder Ahora
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={() => navigate("/login")} className="btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover" size="lg">
                Ir al Inicio de Sesión
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Success;
