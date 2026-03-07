import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, Upload, Palette, Building } from "lucide-react";
import { compressImage } from "@/lib/image";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    logo: null as string | null,
    brandColor: "soft-blue",
  });

  const colorOptions = [
    { name: "Azul Suave", value: "soft-blue" },
    { name: "Menta", value: "mint" },
    { name: "Lavanda", value: "lavender" },
    { name: "Rosa", value: "rose" },
    { name: "Naranja", value: "orange" },
    { name: "Verde", value: "green" },
  ];

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedFile = await compressImage(file, 400, 400, 0.9);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        setLogoPreview(result);
        setFormData((prev) => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error al procesar imagen:", error);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && !formData.companyName.trim()) return;

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Step 3 - complete onboarding
    if (!user) {
      toast({ title: "Error", description: "Usuario no autenticado", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        await supabase.auth.signOut();
        toast({ title: "Sesión expirada", description: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.", variant: "destructive" });
        navigate("/login");
        return;
      }

      // Check if company already exists for this user
      const { data: existingCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      let companyId: string;

      if (existingCompany) {
        await supabase
          .from("companies")
          .update({ name: formData.companyName, logo_url: formData.logo, brand_color: formData.brandColor })
          .eq("id", existingCompany.id);
        companyId = existingCompany.id;
      } else {
        // Check if there's a purchase token to link
        const purchaseToken = localStorage.getItem("purchase_token");
        let planId: string | undefined;

        if (purchaseToken) {
          const { data: purchase } = await supabase
            .from("purchases")
            .select("id, plan_id")
            .eq("access_token", purchaseToken)
            .maybeSingle();

          if (purchase) {
            planId = (purchase as any).plan_id;
          }
        }

        const insertData: any = {
          user_id: user.id,
          name: formData.companyName,
          logo_url: formData.logo,
          brand_color: formData.brandColor,
        };
        if (planId) insertData.plan_id = planId;

        const { data: newCompany, error: insertError } = await supabase
          .from("companies")
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          if (insertError.message?.includes("foreign key") || insertError.code === "23503") {
            await supabase.auth.signOut();
            toast({ title: "Error de cuenta", description: "Tu cuenta tiene un problema. Por favor regístrate nuevamente.", variant: "destructive" });
            navigate("/register");
            return;
          }
          throw insertError;
        }
        companyId = newCompany.id;

        // Link purchase to company
        if (purchaseToken) {
          await supabase
            .from("purchases")
            .update({ company_id: companyId })
            .eq("access_token", purchaseToken);
          localStorage.removeItem("purchase_token");
          localStorage.removeItem("purchase_email");
        }
      }

      // Set company_id on profile
      await supabase.from("profiles").update({ company_id: companyId } as any).eq("id", user.id);

      // Assign admin role if not already assigned
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!existingRole) {
        await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" } as any);
      }

      // Update user settings
      await supabase
        .from("user_settings")
        .update({ brand_logo: formData.logo, brand_color: formData.brandColor })
        .eq("user_id", user.id);

      toast({ title: "¡Éxito!", description: "Configuración completada correctamente" });
      navigate("/dashboard");
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error completing onboarding:", error);
      toast({ title: "Error", description: error.message || "Error al guardar configuración", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles = ["Información de la Empresa", "Sube Tu Logo", "Elige el Color de Marca"];

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">¡Bienvenido a Sign Flow!</h1>
            <p className="text-muted-foreground">Vamos a configurar tu espacio de trabajo en solo 3 pasos</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step <= currentStep ? "bg-soft-blue text-soft-blue-foreground" : "bg-white/10 text-muted-foreground"}`}>{step}</div>
                {step < 3 && <div className={`w-12 h-1 mx-2 rounded transition-colors ${step < currentStep ? "bg-soft-blue" : "bg-white/10"}`} />}
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="glass-card p-8">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-6">
                    <Building className="w-12 h-12 mx-auto mb-4 text-soft-blue-foreground" />
                    <h2 className="text-xl font-semibold">{stepTitles[0]}</h2>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                    <Input id="companyName" placeholder="Ingresa el nombre de tu empresa" value={formData.companyName} onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))} className="glass" required />
                    {!formData.companyName.trim() && <p className="text-xs text-destructive">Campo obligatorio</p>}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-6">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-soft-blue-foreground" />
                    <h2 className="text-xl font-semibold">{stepTitles[1]}</h2>
                  </div>
                  <div className="space-y-4">
                    <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    {logoPreview ? (
                      <div className="text-center space-y-4">
                        <img src={logoPreview} alt="Vista previa del logo" className="w-32 h-32 mx-auto rounded-xl object-cover shadow-lg" />
                        <Button variant="outline" onClick={() => { setLogoPreview(null); setFormData((prev) => ({ ...prev, logo: null })); }} className="btn-glass">Eliminar Logo</Button>
                      </div>
                    ) : (
                      <label htmlFor="logo-upload" className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-white/40 transition-colors block">
                        <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-2">Arrastra y suelta tu logo aquí, o haz clic para elegir</p>
                        <span className="text-sm text-soft-blue-foreground font-medium">Haz Clic para Elegir Archivo</span>
                      </label>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-6">
                    <Palette className="w-12 h-12 mx-auto mb-4 text-soft-blue-foreground" />
                    <h2 className="text-xl font-semibold">{stepTitles[2]}</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      {colorOptions.map((color) => (
                        <button key={color.value} onClick={() => setFormData((prev) => ({ ...prev, brandColor: color.value }))} className={`p-4 rounded-xl glass transition-all duration-200 cursor-pointer ${formData.brandColor === color.value ? "ring-4 ring-white scale-110 bg-white/20" : "hover:scale-105 hover:bg-white/10"}`}>
                          <div className={`w-12 h-12 rounded-full mx-auto mb-2 transition-transform ${formData.brandColor === color.value ? "scale-110 ring-2 ring-white" : ""}`} style={{ backgroundColor: color.value }} />
                          <p className="text-xs text-muted-foreground">{color.name}</p>
                        </button>
                      ))}
                    </div>
                    <div className="text-center mt-6 p-4 rounded-xl bg-white/5">
                      <p className="text-sm text-muted-foreground mb-2">Color seleccionado: <span className="font-semibold">{colorOptions.find((c) => c.value === formData.brandColor)?.name}</span></p>
                      <div className="w-16 h-16 rounded-full mx-auto shadow-lg ring-2 ring-white/20" style={{ backgroundColor: formData.brandColor }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className="btn-glass">Anterior</Button>
              <Button onClick={handleNext} disabled={isLoading} className="btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover">
                {isLoading ? "Guardando..." : currentStep === 3 ? "Completar Configuración" : "Siguiente"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Onboarding;
