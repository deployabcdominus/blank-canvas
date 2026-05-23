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
  name: z.string().min(1, isEn ? "Name is required" : "El nombre es obligatorio"),
  company: z.string().optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email(isEn ? "Email must have a valid format" : "El email debe tener un formato válido").optional().or(z.literal("")),
  signType: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url(isEn ? "Website must have a valid format" : "El sitio web debe tener un formato válido").optional().or(z.literal("")),
  leadSource: z.string().optional(),
  brokerName: z.string().optional(),
  brokerPhone: z.string().optional(),
  brokerEmail: z.string().optional(),
  brokerNotes: z.string().optional(),
  informalNotes: z.string().optional(),
  agreedPrice: z.string().optional(),
  intakeQuality: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpNotes: z.string().optional(),
  pilotTag: z.string().optional(),
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
    defaultValues: { 
      name: "", 
      company: "", 
      pilotTag: "",
      phone: "", 
      email: "", 
      signType: "", 
      address: "", 
      website: "",
      leadSource: "",
      brokerName: "",
      brokerPhone: "",
      brokerEmail: "",
      brokerNotes: "",
      informalNotes: "",
      agreedPrice: "",
      intakeQuality: "partial",
      followUpRequired: false,
      followUpNotes: ""
    }
  });

  const watchSource = form.watch("leadSource");

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
      
      const leadData = {
        name: data.name,
        company: data.company,
        service: data.signType || "",
        status: "Nuevo",
        contact: {
          phone: data.phone || "",
          email: data.email || "",
          location: data.address || ""
        },
        value: data.agreedPrice || "0",
        daysAgo: 0,
        website: data.website,
        logoUrl: logoUrl,
        leadSource: data.leadSource,
        brokerName: data.brokerName,
        brokerPhone: data.brokerPhone,
        brokerEmail: data.brokerEmail,
        brokerNotes: data.brokerNotes,
        informalNotes: data.informalNotes,
        agreedPrice: data.agreedPrice ? parseFloat(data.agreedPrice) : undefined,
        intakeQuality: data.intakeQuality,
        followUpRequired: data.followUpRequired,
        followUpNotes: data.followUpNotes,
        pilot_tag: data.pilotTag
      };

      await onAddLead(leadData as any);
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Contact Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold border-b pb-1 text-primary">{t.addLeadModal.basicContactSection}</h4>
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
              
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addLeadModal.addressLabel}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t.addLeadModal.addressPlaceholder} className="min-h-[80px] resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Lead Source Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold border-b pb-1 text-primary">{t.addLeadModal.leadSourceSection}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="leadSource" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.addLeadModal.leadSourceLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue placeholder={t.addLeadModal.leadSourcePlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(t.addLeadModal.sources).map(([key, label]) => (
                          <SelectItem key={key} value={label}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                
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
              </div>
            </div>

            {/* Broker Information Section (Conditional) */}
            {(watchSource === "Broker" || watchSource === t.addLeadModal.sources.broker) && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="text-sm font-semibold border-b pb-1 text-primary">{t.addLeadModal.brokerSection}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="brokerName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.addLeadModal.brokerNameLabel}</FormLabel>
                      <FormControl><Input placeholder="..." className="min-h-[44px]" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="brokerPhone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.addLeadModal.brokerPhoneLabel}</FormLabel>
                      <FormControl><Input type="tel" placeholder="..." className="min-h-[44px]" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="brokerEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.addLeadModal.brokerEmailLabel}</FormLabel>
                    <FormControl><Input type="email" placeholder="..." className="min-h-[44px]" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="brokerNotes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.addLeadModal.brokerNotesLabel}</FormLabel>
                    <FormControl><Textarea placeholder="..." className="min-h-[60px]" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
            )}

            {/* Project Notes Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold border-b pb-1 text-primary">{t.addLeadModal.projectNotesSection}</h4>
              <FormField control={form.control} name="informalNotes" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addLeadModal.informalNotesLabel}</FormLabel>
                  <FormControl><Textarea placeholder="..." className="min-h-[80px]" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            {/* Price Agreement Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold border-b pb-1 text-primary">{t.addLeadModal.priceAgreementSection}</h4>
              <FormField control={form.control} name="agreedPrice" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.addLeadModal.agreedPriceLabel}</FormLabel>
                  <FormControl><Input type="number" step="0.01" placeholder="0.00" className="min-h-[44px]" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            {/* Assignment & Quality Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold border-b pb-1 text-primary">{t.addLeadModal.assignmentSection}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="intakeQuality" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.addLeadModal.intakeQualityLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="min-h-[44px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(t.addLeadModal.intakeQualityOptions).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <FormField control={form.control} name="followUpRequired" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input 
                        type="checkbox" 
                        checked={field.value} 
                        onChange={field.onChange} 
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{t.addLeadModal.followUpRequiredLabel}</FormLabel>
                  </FormItem>
                )} />
              </div>

              {form.watch("followUpRequired") && (
                <FormField control={form.control} name="followUpNotes" render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <FormLabel>{t.addLeadModal.followUpNotesLabel}</FormLabel>
                    <FormControl><Textarea placeholder="..." className="min-h-[60px]" {...field} /></FormControl>
                  </FormItem>
                )} />
              )}
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

            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem>
                <FormLabel>{t.addLeadModal.websiteLabel}</FormLabel>
                <FormControl><Input type="url" placeholder={t.addLeadModal.websitePlaceholder} className="min-h-[44px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t mt-4">
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