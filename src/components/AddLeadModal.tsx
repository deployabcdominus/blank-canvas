import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import { useServiceTypes } from "@/hooks/useServiceTypes";
import { useCatalog } from "@/hooks/useCatalog";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/image";
import { useLanguage } from "@/i18n/LanguageContext";

const makeLeadFormSchema = (isEn: boolean) => z.object({
  name: z.string().min(2, isEn ? "Name must be at least 2 characters" : "El nombre debe tener al menos 2 caracteres"),
  company: z.string().min(2, isEn ? "Company name must be at least 2 characters" : "El nombre de la empresa debe tener al menos 2 caracteres"),
  phone: z.string().min(10, isEn ? "Phone must be at least 10 digits" : "El teléfono debe tener al menos 10 dígitos"),
  email: z.string().email(isEn ? "Email must have a valid format" : "El email debe tener un formato válido"),
  signType: z.string().min(1, isEn ? "Select a service type" : "Seleccione un tipo de servicio"),
  address: z.string().min(10, isEn ? "Address must be at least 10 characters" : "La dirección debe tener al menos 10 caracteres"),
  website: z.string().url(isEn ? "Website must have a valid format" : "El sitio web debe tener un formato válido").optional().or(z.literal(""))
});

type LeadFormData = z.infer<ReturnType<typeof makeLeadFormSchema>>;

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLead: (lead: LeadFormData & { logoUrl?: string }) => Promise<void> | void;
}

export const AddLeadModal = ({ isOpen, onClose, onAddLead }: AddLeadModalProps) => {
  const { t, locale } = useLanguage();
  const isEn = locale === "en";
  const leadFormSchema = makeLeadFormSchema(isEn);
  const serviceTypes = useServiceTypes();
  const { items: catalogServices } = useCatalog("lead_service");
  const resolvedServices = catalogServices.length > 0
    ? catalogServices.map(s => s.label)
    : serviceTypes;
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { name: "", company: "", phone: "", email: "", signType: "", address: "", website: "" }
  });

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (match) {
        return `${match[1] ? `(${match[1]}` : ''}${match[1] && match[1].length === 2 ? ') ' : ''}${match[2]}${match[3] ? `-${match[3]}` : ''}`;
      }
    }
    return value;
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: t.addLeadModal.toastInvalidFormat, description: t.addLeadModal.toastInvalidFormatDesc, variant: "destructive" });
      return;
    }
    try {
      const compressed = await compressImage(file, 400, 400, 0.8);
      setLogoFile(compressed);
      setLogoPreview(URL.createObjectURL(compressed));
    } catch {
      toast({ title: t.addLeadModal.toastImageError, variant: "destructive" });
    }
  };

  const removeLogo = () => {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoPreview(null);
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: LeadFormData) => {
    setIsLoading(true);
    try {
      let logoUrl: string | undefined;
      if (logoFile) {
        const fileName = `${Date.now()}-${logoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('lead-logos')
          .upload(fileName, logoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('lead-logos')
          .getPublicUrl(fileName);
        logoUrl = urlData.publicUrl;
      }
      await onAddLead({ ...data, logoUrl });
      form.reset();
      removeLogo();
      onClose();
      toast({
        title: t.addLeadModal.toastSuccess,
        description: t.addLeadModal.toastSuccessDesc.replace("{{name}}", data.name)
      });
    } catch (error) {
      toast({
        title: t.addLeadModal.toastError,
        description: t.addLeadModal.toastErrorDesc,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => { form.reset(); removeLogo(); onClose(); };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t.addLeadModal.title}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addLeadModal.nameLabel}</FormLabel>
                  <FormControl><Input placeholder={t.addLeadModal.namePlaceholder} className="min-h-[44px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="company" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addLeadModal.companyLabel}</FormLabel>
                  <FormControl><Input placeholder={t.addLeadModal.companyPlaceholder} className="min-h-[44px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addLeadModal.phoneLabel}</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder={t.addLeadModal.phonePlaceholder} className="min-h-[44px]" {...field}
                      onChange={(e) => { field.onChange(formatPhone(e.target.value)); }} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addLeadModal.emailLabel}</FormLabel>
                  <FormControl><Input type="email" placeholder={t.addLeadModal.emailPlaceholder} className="min-h-[44px]" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Logo upload */}
            <div className="space-y-2">
              <FormLabel>{t.addLeadModal.logoLabel}</FormLabel>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative">
                    <img src={logoPreview} alt="Logo preview" className="w-16 h-16 rounded-lg object-contain border border-border bg-muted" />
                    <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-primary transition-colors"
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                <p className="text-xs text-muted-foreground">{t.addLeadModal.logoHint}</p>
              </div>
            </div>

            <FormField control={form.control} name="signType" render={({ field }) => (
              <FormItem>
                <FormLabel>{t.addLeadModal.serviceLabel}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="min-h-[44px]">
                      <SelectValue placeholder={t.addLeadModal.servicePlaceholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resolvedServices.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>{t.addLeadModal.addressLabel}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t.addLeadModal.addressPlaceholder} className="min-h-[80px] resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem>
                <FormLabel>{t.addLeadModal.websiteLabel}</FormLabel>
                <FormControl><Input type="url" placeholder={t.addLeadModal.websitePlaceholder} className="min-h-[44px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="min-h-[44px] sm:w-auto w-full" disabled={isLoading}>
                {t.addLeadModal.cancel}
              </Button>
              <Button type="submit" className="min-h-[44px] sm:w-auto w-full" disabled={isLoading}>
                {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.addLeadModal.saving}</>) : t.addLeadModal.save}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};