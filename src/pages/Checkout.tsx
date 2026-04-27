import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  companyName: z.string().min(2, "El nombre de la empresa debe tener al menos 2 caracteres"),
});

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);

  const selectedPlan = localStorage.getItem("selectedPlan") || "Inicial";

  // Fetch plan_id from DB
  useEffect(() => {
    const fetchPlan = async () => {
      const { data } = await supabase
        .from("plans")
        .select("id")
        .eq("name", selectedPlan)
        .maybeSingle();
      if (data) setPlanId(data.id);
    };
    fetchPlan();
  }, [selectedPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      checkoutSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ title: "Error de validación", description: error.errors[0].message, variant: "destructive" });
      }
      return;
    }

    if (!planId) {
      toast({ title: "Error", description: "Plan no encontrado", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // Call create-checkout edge function
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: planId },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("No se pudo generar la sesión de pago.");

      // Store basic data to recover if needed, but the real setup happens in PostPaymentSetup
      localStorage.setItem("selectedPlan", selectedPlan);
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Error al conectar con la pasarela de pago", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a los planes
            </Button>
            <h1 className="text-3xl font-bold mb-2">Completa Tu Compra</h1>
            <p className="text-muted-foreground">Estás casi listo para optimizar tu gestión de operaciones</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="glass-card p-8">
            <div className="mb-6 p-4 glass border border-soft-blue rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Plan {selectedPlan}</h3>
                  <p className="text-sm text-muted-foreground">Suscripción mensual</p>
                </div>
                <CreditCard className="w-5 h-5 text-soft-blue-foreground" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input id="fullName" type="text" placeholder="Ingresa tu nombre completo" value={formData.fullName} onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))} required className="glass" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Dirección de Email</Label>
                <Input id="email" type="email" placeholder="Ingresa tu email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required className="glass" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input id="companyName" type="text" placeholder="Ingresa el nombre de tu empresa" value={formData.companyName} onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))} required className="glass" />
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover" size="lg" disabled={isLoading}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isLoading ? "Procesando..." : "Finalizar Compra"}
                </Button>
              </motion.div>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad</p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Checkout;
