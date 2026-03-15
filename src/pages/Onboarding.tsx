import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight, ChevronLeft, Upload, Building, X, Plus,
  Briefcase, Check, Sparkles, ArrowRight, Palette, Users, Zap,
  FileText, CheckCircle2
} from "lucide-react";
import { compressImage } from "@/lib/image";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { INDUSTRIES, DEFAULT_SERVICES_BY_INDUSTRY, getIndustryLabels } from "@/lib/industry_config";

/* ── Preset Engine ── */
interface IndustryPreset {
  suggestedPlan: string;
  planReason: string;
  highlightFields: string[];
}

const INDUSTRY_PRESETS: Record<string, IndustryPreset> = {
  "Servicios IT y Software": {
    suggestedPlan: "Pro",
    planReason: "Recomendado para gestión de SLAs y tickets",
    highlightFields: ["IP", "Prioridad Técnica", "SLA"],
  },
  "Señalética y Publicidad": {
    suggestedPlan: "Start",
    planReason: "Ideal para órdenes de producción y medidas",
    highlightFields: ["Largo", "Ancho", "Profundidad"],
  },
  "Climatización y HVAC": {
    suggestedPlan: "Pro",
    planReason: "Ideal para servicio técnico con SLA y seguimiento",
    highlightFields: ["BTU", "Presión", "Refrigerante"],
  },
  "Mantenimiento y Reformas": {
    suggestedPlan: "Start",
    planReason: "Perfecto para órdenes de trabajo y campo",
    highlightFields: ["Medidas", "Tipo de Trabajo", "Inspección"],
  },
};

const TOTAL_STEPS = 4;

const stepVariants = {
  enter: { opacity: 0, x: 40, filter: "blur(4px)" },
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -40, filter: "blur(4px)" },
};

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    industry: "",
    companyName: "",
    logo: null as string | null,
    brandColor: "soft-blue",
  });

  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [newServiceInput, setNewServiceInput] = useState("");

  const preset = INDUSTRY_PRESETS[formData.industry] || null;
  const labels = getIndustryLabels(formData.industry || null);

  const colorOptions = [
    { name: "Azul Suave", value: "soft-blue", hex: "#5B9BD5" },
    { name: "Menta", value: "mint", hex: "#4ECDC4" },
    { name: "Lavanda", value: "lavender", hex: "#9B8EC4" },
    { name: "Rosa", value: "rose", hex: "#E8778B" },
    { name: "Naranja", value: "orange", hex: "#F59E0B" },
    { name: "Verde", value: "green", hex: "#22C55E" },
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

  const addService = () => {
    const trimmed = newServiceInput.trim();
    if (!trimmed) return;
    if (serviceTypes.includes(trimmed)) {
      toast({ title: "Ya existe", description: "Este servicio ya está en la lista.", variant: "destructive" });
      return;
    }
    setServiceTypes(prev => [...prev, trimmed]);
    setNewServiceInput("");
  };

  const removeService = (service: string) => {
    setServiceTypes(prev => prev.filter(s => s !== service));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!formData.industry;
      case 2: return !!formData.companyName.trim() && !!formData.logo;
      case 3: return true; // color always has default
      case 4: return serviceTypes.length > 0;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (!canProceed()) return;

    // When leaving step 1, seed services
    if (currentStep === 1 && formData.industry) {
      const defaults = DEFAULT_SERVICES_BY_INDUSTRY[formData.industry] || ["General"];
      if (serviceTypes.length === 0) setServiceTypes(defaults);
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Final step — complete onboarding
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
          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage.from("company-logos").getPublicUrl(filePath);
            logoUrl = publicUrlData.publicUrl;
          }
        } catch (err) {
          if (import.meta.env.DEV) console.error("Logo processing error:", err);
        }
      } else if (formData.logo) {
        logoUrl = formData.logo;
      }

      const finalServiceTypes = serviceTypes.length > 0 ? serviceTypes : ["General"];

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
          .update({
            name: formData.companyName,
            logo_url: logoUrl,
            brand_color: formData.brandColor,
            industry: formData.industry,
            service_types: finalServiceTypes,
          })
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
          if (purchase) planId = (purchase as any).plan_id;
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

        await (supabase as any)
          .from("companies")
          .update({ service_types: finalServiceTypes })
          .eq("id", companyId);

        if (purchaseToken) {
          await supabase.from("purchases").update({ company_id: companyId }).eq("access_token", purchaseToken);
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

      setShowSuccess(true);
    } catch (error: any) {
      if (import.meta.env.DEV) console.error("Error completing onboarding:", error);
      toast({ title: "Error", description: error.message || "Error al guardar configuración", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Success Screen ── */
  if (showSuccess) {
    const industryLabel = INDUSTRIES.find(i => i.id === formData.industry)?.label || formData.industry;
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg text-center"
          >
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
              className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 flex items-center justify-center"
            >
              <Check className="w-10 h-10 text-orange-400" strokeWidth={1.5} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-3xl font-bold mb-4"
            >
              ¡Tu espacio de trabajo está listo!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-md mx-auto"
            >
              Hemos configurado lo básico para <span className="text-foreground font-medium">{industryLabel}</span>.
              Ahora puedes pulir cada detalle en el Panel de Configuración.
            </motion.p>

            {/* Preset summary */}
            {preset && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl mb-8"
              >
                <div className="flex flex-wrap gap-2 justify-center">
                  {preset.highlightFields.map(field => (
                    <Badge key={field} variant="secondary" className="border-primary/20 bg-primary/10 text-xs">
                      {field}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Campos técnicos activados para tu industria
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                onClick={() => navigate("/settings")}
                variant="outline"
                className="border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl"
              >
                <Settings2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Personalizar más
              </Button>
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-[0_4px_16px_rgba(251,146,60,0.3)]"
              >
                Ir al Dashboard
                <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  /* ── Step titles ── */
  const stepMeta = [
    { title: "Tu Industria", subtitle: "¿A qué se dedica tu negocio?", icon: Building },
    { title: "Identidad", subtitle: "Nombre y logo de tu empresa", icon: Upload },
    { title: "Marca", subtitle: "Elige un color que te represente", icon: Sparkles },
    { title: "Servicios", subtitle: "Define lo que ofreces", icon: Briefcase },
  ];

  const current = stepMeta[currentStep - 1];
  const CurrentIcon = current.icon;

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Configura SignFlow</h1>
            <p className="text-sm text-muted-foreground">
              {currentStep} de {TOTAL_STEPS} — {current.title}
            </p>
          </motion.div>

          {/* Stepper — Apple-style pill track */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const step = i + 1;
              const isActive = step === currentStep;
              const isDone = step < currentStep;
              return (
                <motion.div
                  key={step}
                  layout
                  className={`relative flex items-center justify-center rounded-full transition-all duration-500 ${
                    isActive
                      ? "w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 shadow-[0_4px_16px_rgba(251,146,60,0.35)]"
                      : isDone
                        ? "w-8 h-8 bg-orange-500/20 border border-orange-500/30"
                        : "w-8 h-8 bg-white/[0.04] border border-white/[0.08]"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-orange-400" strokeWidth={2.5} />
                  ) : (
                    <span className={`text-xs font-semibold ${isActive ? "text-white" : "text-muted-foreground"}`}>
                      {step}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="rounded-3xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-3xl p-8 shadow-[0_16px_64px_rgba(0,0,0,0.4)]"
          >
            <AnimatePresence mode="wait">
              {/* ── Step 1: Industry ── */}
              {currentStep === 1 && (
                <motion.div key="s1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} className="space-y-6">
                  <div className="text-center mb-2">
                    <CurrentIcon className="w-10 h-10 mx-auto mb-3 text-orange-400" strokeWidth={1.5} />
                    <h2 className="text-lg font-semibold">{current.subtitle}</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {INDUSTRIES.map((industry) => {
                      const Icon = industry.icon;
                      const isSelected = formData.industry === industry.id;
                      return (
                        <motion.button
                          key={industry.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, industry: industry.id }));
                            const defaults = DEFAULT_SERVICES_BY_INDUSTRY[industry.id] || ["General"];
                            setServiceTypes(defaults);
                          }}
                          className={`relative flex flex-col items-center gap-2.5 p-5 rounded-2xl text-center transition-all duration-300 border backdrop-blur-xl ${
                            isSelected
                              ? "bg-white/[0.08] border-orange-500/30 ring-1 ring-orange-500/20 shadow-[0_4px_24px_rgba(251,146,60,0.12)]"
                              : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]"
                          }`}
                        >
                          <div className={`p-2.5 rounded-xl transition-colors ${isSelected ? "bg-orange-500/15" : "bg-white/[0.04]"}`}>
                            <Icon className={`w-5 h-5 ${isSelected ? "text-orange-400" : "text-muted-foreground"}`} strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="font-medium text-sm leading-tight">{industry.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{industry.description}</p>
                          </div>
                          {isSelected && (
                            <motion.div
                              layoutId="check"
                              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Preset hint */}
                  {preset && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 rounded-xl border border-orange-500/10 bg-orange-500/[0.04] text-center"
                    >
                      <p className="text-xs text-muted-foreground">
                        <span className="text-orange-400 font-medium">💡 Plan sugerido: {preset.suggestedPlan}</span>
                        {" — "}{preset.planReason}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* ── Step 2: Name + Logo ── */}
              {currentStep === 2 && (
                <motion.div key="s2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} className="space-y-6">
                  <div className="text-center mb-2">
                    <CurrentIcon className="w-10 h-10 mx-auto mb-3 text-orange-400" strokeWidth={1.5} />
                    <h2 className="text-lg font-semibold">{current.subtitle}</h2>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm">Nombre de la Empresa *</Label>
                    <Input
                      id="companyName"
                      placeholder="Ingresa el nombre de tu empresa"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="bg-white/[0.04] border-white/[0.08] focus:border-orange-500/40"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm">Logo de la Empresa *</Label>
                    <input type="file" id="logo-upload" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    {logoPreview ? (
                      <div className="flex items-center gap-4">
                        <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-white/[0.08]" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setLogoPreview(null); setFormData(prev => ({ ...prev, logo: null })); }}
                          className="text-muted-foreground hover:text-destructive text-xs"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Eliminar
                        </Button>
                      </div>
                    ) : (
                      <label
                        htmlFor="logo-upload"
                        className="flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-orange-500/20 cursor-pointer transition-colors"
                      >
                        <Upload className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
                        <p className="text-sm text-muted-foreground">Haz clic o arrastra tu logo</p>
                      </label>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Brand Color ── */}
              {currentStep === 3 && (
                <motion.div key="s3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} className="space-y-6">
                  <div className="text-center mb-2">
                    <CurrentIcon className="w-10 h-10 mx-auto mb-3 text-orange-400" strokeWidth={1.5} />
                    <h2 className="text-lg font-semibold">{current.subtitle}</h2>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {colorOptions.map((color) => (
                      <motion.button
                        key={color.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData(prev => ({ ...prev, brandColor: color.value }))}
                        className={`p-4 rounded-2xl border transition-all duration-200 ${
                          formData.brandColor === color.value
                            ? "bg-white/[0.08] border-orange-500/30 ring-1 ring-orange-500/20"
                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full mx-auto mb-2 ring-2 ring-white/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        <p className="text-xs text-muted-foreground">{color.name}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Step 4: Services ── */}
              {currentStep === 4 && (
                <motion.div key="s4" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35 }} className="space-y-6">
                  <div className="text-center mb-2">
                    <CurrentIcon className="w-10 h-10 mx-auto mb-3 text-orange-400" strokeWidth={1.5} />
                    <h2 className="text-lg font-semibold">{current.subtitle}</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                      Estos se usarán en {labels.leads}, {labels.workOrders} y más
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-[40px]">
                    {serviceTypes.map(service => (
                      <Badge key={service} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-orange-500/20 bg-orange-500/[0.08] text-foreground">
                        {service}
                        <button onClick={() => removeService(service)} className="ml-1 hover:text-destructive transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {serviceTypes.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">Agrega al menos un servicio</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newServiceInput}
                      onChange={e => setNewServiceInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addService(); } }}
                      placeholder="Escribe un servicio..."
                      className="flex-1 bg-white/[0.04] border-white/[0.08] focus:border-orange-500/40"
                    />
                    <Button
                      variant="outline"
                      onClick={addService}
                      disabled={!newServiceInput.trim()}
                      className="border-white/[0.08] hover:bg-white/[0.06]"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Puedes editar esta lista después en Configuración → Organización
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex justify-between items-center"
            >
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Atrás
              </Button>

              <Button
                onClick={handleNext}
                disabled={isLoading || !canProceed()}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-[0_4px_16px_rgba(251,146,60,0.3)] px-6"
              >
                {isLoading
                  ? "Guardando..."
                  : currentStep === TOTAL_STEPS
                    ? "Completar"
                    : "Siguiente"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Onboarding;
