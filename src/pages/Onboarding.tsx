import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft, Upload, Palette, Building, Wrench, Printer, PaintBucket, HardHat, PartyPopper, ShoppingBag, Package } from "lucide-react";
import { compressImage } from "@/lib/image";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const INDUSTRIES = [
  { id: "Field Service / Instalaciones", icon: Wrench, label: "Field Service / Instalaciones", description: "Servicios en campo, instalación y mantenimiento" },
  { id: "Impresión / Producción", icon: Printer, label: "Impresión / Producción", description: "Señalética, rotulación, impresión gran formato" },
  { id: "Diseño / Creativos", icon: PaintBucket, label: "Diseño / Creativos", description: "Agencias, estudios de diseño, freelancers" },
  { id: "Construcción / Contratistas", icon: HardHat, label: "Construcción / Contratistas", description: "Obras, remodelaciones, contratistas generales" },
  { id: "Eventos / Hospitality", icon: PartyPopper, label: "Eventos / Hospitality", description: "Producción de eventos, banquetes, venues" },
  { id: "Retail / Tiendas", icon: ShoppingBag, label: "Retail / Tiendas", description: "Tiendas, franquicias, puntos de venta" },
  { id: "Otro", icon: Package, label: "Otro", description: "Cualquier otro tipo de negocio de servicios" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    industry: "",
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

  const totalSteps = 4;

  const handleNext = async () => {
    if (currentStep === 1 && !formData.industry) return;
    if (currentStep === 2 && !formData.companyName.trim()) return;
    if (currentStep === 3 && !formData.logo) {
      toast({ title: "Logo obligatorio", description: "Sube el logo de tu empresa para continuar. Es necesario para la marca de agua en mockups y propuestas.", variant: "destructive" });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Step 4 - complete onboarding
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

      // Upload logo to Storage if it's base64
      let logoUrl: string | null = null;
      if (formData.logo && formData.logo.startsWith("data:image")) {
        try {
          const base64Data = formData.logo.split(",")[1];
          const mimeMatch = formData.logo.match(/data:(image\/\w+);/);
          const ext = mimeMatch ? mimeMatch[1].split("/")[1] : "png";
          const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          const filePath = `${user.id}/logo.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("company-logos")
            .upload(filePath, byteArray, { contentType: mimeMatch?.[1] || "image/png", upsert: true });

          if (uploadError) {
            if (import.meta.env.DEV) console.error("Logo upload error:", uploadError);
          } else {
            const { data: publicUrlData } = supabase.storage
              .from("company-logos")
              .getPublicUrl(filePath);
            logoUrl = publicUrlData.publicUrl;
          }
        } catch (err) {
          if (import.meta.env.DEV) console.error("Logo processing error:", err);
        }
      } else if (formData.logo) {
        logoUrl = formData.logo; // already a URL
      }

      const { data: existingCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      let companyId: string;

      if (existingCompany) {
        await (supabase as any)
          .from("companies")
          .update({ name: formData.companyName, logo_url: logoUrl, brand_color: formData.brandColor, industry: formData.industry })
          .eq("id", existingCompany.id);
        companyId = existingCompany.id;
      } else {
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

        const { data: newCompany, error: insertError } = await supabase
          .rpc('create_company', {
            p_user_id: user.id,
            p_name: formData.companyName,
            p_logo_url: logoUrl || '',
            p_brand_color: formData.brandColor,
            p_industry: formData.industry || '',
            p_plan_id: planId || undefined
          });

        if (insertError) {
          if (insertError.message?.includes("foreign key") || insertError.code === "23503") {
            await supabase.auth.signOut();
            toast({ title: "Error de cuenta", description: "Tu cuenta tiene un problema. Por favor regístrate nuevamente.", variant: "destructive" });
            navigate("/register");
            return;
          }
          throw insertError;
        }
        companyId = newCompany!.id;

        if (purchaseToken) {
          await supabase
            .from("purchases")
            .update({ company_id: companyId })
            .eq("access_token", purchaseToken);
          localStorage.removeItem("purchase_token");
          localStorage.removeItem("purchase_email");
        }
      }

      await supabase.from("profiles").update({ company_id: companyId } as any).eq("id", user.id);

      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!existingRole) {
        await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" } as any);
      }

      await supabase
        .from("user_settings")
        .update({ brand_logo: logoUrl, brand_color: formData.brandColor })
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

  const stepTitles = ["Selecciona tu Industria", "Información de la Empresa", "Sube Tu Logo", "Elige el Color de Marca"];

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">¡Bienvenido a SignFlow!</h1>
            <p className="text-muted-foreground">Vamos a configurar tu espacio de trabajo en {totalSteps} pasos</p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step <= currentStep ? "bg-soft-blue text-soft-blue-foreground" : "bg-white/10 text-muted-foreground"}`}>{step}</div>
                {step < totalSteps && <div className={`w-12 h-1 mx-2 rounded transition-colors ${step < currentStep ? "bg-soft-blue" : "bg-white/10"}`} />}
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
                    <p className="text-sm text-muted-foreground mt-2">¿A qué se dedica tu negocio?</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {INDUSTRIES.map((industry) => {
                      const Icon = industry.icon;
                      const isSelected = formData.industry === industry.id;
                      return (
                        <button
                          key={industry.id}
                          onClick={() => setFormData(prev => ({ ...prev, industry: industry.id }))}
                          className={`flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 border ${
                            isSelected
                              ? "bg-primary/10 border-primary/30 ring-2 ring-primary/20 scale-[1.02]"
                              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl ${isSelected ? "bg-primary/20" : "bg-white/10"}`}>
                            <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm ${isSelected ? "text-foreground" : "text-foreground/80"}`}>{industry.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{industry.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-6">
                    <Building className="w-12 h-12 mx-auto mb-4 text-soft-blue-foreground" />
                    <h2 className="text-xl font-semibold">{stepTitles[1]}</h2>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                    <Input id="companyName" placeholder="Ingresa el nombre de tu empresa" value={formData.companyName} onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))} className="glass" required />
                    {!formData.companyName.trim() && <p className="text-xs text-destructive">Campo obligatorio</p>}
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-6">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-soft-blue-foreground" />
                    <h2 className="text-xl font-semibold">{stepTitles[2]}</h2>
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
                        <p className="text-xs text-orange-400 mt-2 font-medium">* Obligatorio — Se usa como marca de agua en mockups y propuestas</p>
                      </label>
                    )}
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center mb-6">
                    <Palette className="w-12 h-12 mx-auto mb-4 text-soft-blue-foreground" />
                    <h2 className="text-xl font-semibold">{stepTitles[3]}</h2>
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
              <Button variant="ghost" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className="btn-glass">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              <Button onClick={handleNext} disabled={isLoading || (currentStep === 1 && !formData.industry)} className="btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover">
                {isLoading ? "Guardando..." : currentStep === totalSteps ? "Completar Configuración" : "Siguiente"}
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
