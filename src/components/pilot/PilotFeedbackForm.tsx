import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { resolveCompanyId } from "@/lib/resolve-company";
import { useLanguage } from "@/i18n/LanguageContext";

const feedbackSchema = z.object({
  issueType: z.string().min(1, "Required"),
  module: z.string().min(1, "Required"),
  description: z.string().min(5, "Minimum 5 characters"),
  severity: z.string().min(1, "Required"),
  suggestedImprovement: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export const PilotFeedbackForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      issueType: "",
      module: "",
      description: "",
      severity: "Medium",
      suggestedImprovement: "",
    },
  });

  const onSubmit = async (data: FeedbackFormData) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const companyId = await resolveCompanyId(user.id);
      if (!companyId) throw new Error("No company found");

      const { error } = await supabase.from("pilot_feedback").insert({
        company_id: companyId,
        user_id: user.id,
        issue_type: data.issueType,
        module: data.module,
        description: data.description,
        severity: data.severity,
        suggested_improvement: data.suggestedImprovement,
      });

      if (error) throw error;

      toast({
        title: isEn ? "Feedback sent" : "Comentarios enviados",
        description: isEn ? "Thank you for your feedback!" : "¡Gracias por tus comentarios!",
      });

      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modules = ["Leads", "Proposals", "Production", "Installation", "Closing", "Dashboard", "Reports", "Search", "Other"];
  const issueTypes = ["UX confusion", "Missing field", "Wrong status", "Permission issue", "Mobile issue", "Print issue", "Search/report issue", "Workflow mismatch", "Other"];
  const severities = ["Low", "Medium", "High", "Critical"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issueType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isEn ? "Issue Type" : "Tipo de Problema"}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {issueTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="module"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isEn ? "Module" : "Módulo"}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {modules.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEn ? "Severity" : "Severidad"}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {severities.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEn ? "Description" : "Descripción"}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={isEn ? "Describe the issue..." : "Describe el problema..."} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="suggestedImprovement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isEn ? "Suggested Improvement" : "Mejora Sugerida"}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={isEn ? "How can we make it better?" : "¿Cómo podemos mejorarlo?"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (isEn ? "Sending..." : "Enviando...") : (isEn ? "Submit Feedback" : "Enviar Comentarios")}
        </Button>
      </form>
    </Form>
  );
};
