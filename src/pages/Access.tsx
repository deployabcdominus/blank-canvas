import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShieldCheck, Star, Mail, LogIn } from "lucide-react";

const Access = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Star,
      title: "Ver Planes",
      description: "Explora nuestros planes y elige el que mejor se adapte a tu negocio.",
      onClick: () => navigate("/checkout"),
      primary: true,
    },
    {
      icon: Mail,
      title: "Tengo una invitación",
      description: "Únete a la empresa que te invitó usando tu link de invitación.",
      onClick: () => navigate("/invite"),
      primary: false,
    },
    {
      icon: LogIn,
      title: "Ya tengo cuenta",
      description: "Inicia sesión con tu cuenta existente.",
      onClick: () => navigate("/login"),
      primary: false,
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-6 glass-card rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Acceso a SignFlow</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Únete a cientos de negocios en Miami que gestionan sus operaciones con SignFlow
            </p>
          </div>

          <div className="space-y-3">
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 * (i + 1) }}
                >
                  <button
                    onClick={action.onClick}
                    className={`w-full glass-card p-5 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group ${
                      action.primary ? "ring-1 ring-primary/20 bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${action.primary ? "bg-primary/15" : "bg-white/10"}`}>
                        <Icon className={`w-5 h-5 ${action.primary ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Access;
