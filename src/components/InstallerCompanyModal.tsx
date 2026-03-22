import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/i18n/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInstallerCompanies, InstallerCompany } from "@/contexts/InstallerCompaniesContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { compressImage } from "@/lib/image";
import { Checkbox } from "@/components/ui/checkbox";
import { useCatalog } from "@/hooks/useCatalog";
import { useServiceTypes } from "@/hooks/useServiceTypes";

const makeFormSchema = (isEn: boolean) => z.object({
  name: z.string().min(2, isEn ? "Name must be at least 2 characters" : "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email(isEn ? "Invalid email" : "Email inválido"),
  phone: z.string().min(10, isEn ? "Phone must be at least 10 digits" : "El teléfono debe tener al menos 10 dígitos"),
  contact: z.string().optional(),
  services: z.array(z.string()).min(1, isEn ? "Select at least one service" : "Seleccione al menos un servicio")
});

type FormData = z.infer<ReturnType<typeof makeFormSchema>>;

interface InstallerCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  company?: InstallerCompany | null;
}

export const InstallerCompanyModal: React.FC<InstallerCompanyModalProps> = ({ isOpen, onClose, company }) => {
  const { t, locale } = useLanguage();
  const isEn = locale === "en";
  const formSchema = makeFormSchema(isEn);
  const { addCompany, updateCompany } = useInstallerCompanies();
  const fallbackServices = useServiceTypes();
  const { items: catalogServices } = useCatalog("lead_service");
  const serviceTypes = catalogServices.length > 0 ? catalogServices.map(s => s.label) : fallbackServices;
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(formSchema) });

  useEffect(() => {
    if (company) {
      setValue("name", company.name); setValue("email", company.email || "");
      setValue("phone", company.phone || ""); setValue("contact", company.contact || "");
      setValue("services", company.services || []); setSelectedServices(company.services || []);
      setLogoPreview(company.logoUrl || null); setLogoFile(company.logoUrl || null);
    } else { reset(); setSelectedServices([]); setLogoPreview(null); setLogoFile(null); }
  }, [company, setValue, reset]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const compressedFile = await compressImage(file, 200, 200, 0.8);
      const reader = new FileReader();
      reader.onload = (e) => { const result = e.target?.result as string; setLogoFile(result); setLogoPreview(result); };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      toast({ title: t.installerCompanyModal.toastImageError, description: t.installerCompanyModal.toastImageErrorDesc, variant: "destructive" });
    }
  };

  const handleRemoveLogo = () => { setLogoFile(null); setLogoPreview(null); };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
    const match2 = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
    if (match2) return `(${match2[1]}) ${match2[2]}-${match2[3]}`;
    return value;
  };

  const onSubmit = (data: FormData) => {
    const companyData = { name: data.name, email: data.email, phone: data.phone, contact: data.contact || "", logoUrl: logoFile || undefined, services: selectedServices };
    if (company) {
      updateCompany(company.id, companyData);
      toast({ title: t.installerCompanyModal.toastUpdated, description: t.installerCompanyModal.toastUpdatedDesc });
    } else {
      addCompany(companyData);
      toast({ title: t.installerCompanyModal.toastRegistered, description: t.installerCompanyModal.toastRegisteredDesc });
    }
    reset(); setSelectedServices([]); setLogoFile(null); setLogoPreview(null); onClose();
  };

  const getInitials = (name: string) => name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border/40 shadow-2xl max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {company ? t.installerCompanyModal.editTitle : t.installerCompanyModal.registerTitle}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar / Logo upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-border">
                {logoPreview && <AvatarImage src={logoPreview} alt="Logo de la empresa" />}
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">{company?.name ? getInitials(company.name) : "?"}</AvatarFallback>
              </Avatar>
              {logoPreview && (
                <Button type="button" variant="destructive" size="sm" className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full" onClick={handleRemoveLogo}><X className="w-3 h-3" /></Button>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <Label htmlFor="logo" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Upload className="w-4 h-4" />{t.installerCompanyModal.logoLabel}</div>
              </Label>
              <Input id="logo" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <p className="text-xs text-muted-foreground">{t.installerCompanyModal.logoHint}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">{t.installerCompanyModal.nameLabel}</Label>
              <Input id="name" placeholder={t.installerCompanyModal.namePlaceholder} {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">{t.installerCompanyModal.emailLabel}</Label>
              <Input id="email" type="email" placeholder={t.installerCompanyModal.emailPlaceholder} {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">{t.installerCompanyModal.phoneLabel}</Label>
              <Input id="phone" placeholder={t.installerCompanyModal.phonePlaceholder} {...register("phone", { onChange: (e) => { e.target.value = formatPhone(e.target.value); } })} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact" className="text-sm font-medium text-foreground">{t.installerCompanyModal.contactLabel}</Label>
              <Input id="contact" placeholder={t.installerCompanyModal.contactPlaceholder} {...register("contact")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">{t.installerCompanyModal.servicesLabel}</Label>
            <div className="grid grid-cols-2 gap-2 border border-border rounded-xl p-3 bg-muted/30">
              {serviceTypes.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox id={service} checked={selectedServices.includes(service)}
                    onCheckedChange={(checked) => {
                      const newServices = checked ? [...selectedServices, service] : selectedServices.filter(s => s !== service);
                      setSelectedServices(newServices); setValue("services", newServices);
                    }} />
                  <Label htmlFor={service} className="text-sm font-normal cursor-pointer text-foreground">{service}</Label>
                </div>
              ))}
            </div>
            {errors.services && <p className="text-sm text-destructive">{errors.services.message}</p>}
          </div>

          <DialogFooter className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>{t.installerCompanyModal.cancel}</Button>
            <Button type="submit">{company ? t.installerCompanyModal.update : t.installerCompanyModal.register}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
