import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Circle, TrendingUp, AlertTriangle, Target, Zap, ArrowRight, BarChart2, Copy, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCompany } from "@/hooks/useCompany";
import { useLeads } from "@/contexts/LeadsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { usePayments } from "@/contexts/PaymentsContext";
import { useClients } from "@/contexts/ClientsContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays, subDays, isThisMonth, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

function BriefingContent({ text }: { text: string }) {
  const lines = text.split('\n').filter(Boolean);
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        if (line.startsWith('## '))
          return <h3 key={i} className="text-sm font-bold text-foreground/90 mt-4 first:mt-0">{line.replace('## ', '')}</h3>;
        if (line.startsWith('# '))
          return <h2 key={i} className="text-base font-bold text-foreground mb-1">{line.replace('# ', '')}</h2>;
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={i} className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
      })}
    </div>
  );
}

export function AiBriefing() {
  const { fullName } = useUserProfile();
  const { company } = useCompany();
  const { leads } = useLeads();
  const { proposals } = useProposals();
  const { payments } = usePayments();
  const { clients } = useClients();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [briefingOpen, setBriefingOpen] = useState(false);
  const [briefingText, setBriefingText] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(false);

  const now = new Date();
  const firstName = fullName.split(" ")[0];
  const hour = now.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
  const dateStr = format(now, "EEEE d 'de' MMMM", { locale: es });

  const hasEnoughData = proposals.length >= 3 || clients.length >= 2;

  const insights = useMemo(() => {
    const activeLeads = leads.filter(l => l.status !== "Convertido" && l.status !== "Perdido");
    const totalPipelineValue = activeLeads.reduce((s, l) => s + (parseFloat(l.value) || 0), 0);

    const atRisk = proposals.filter(p => {
      if (p.status !== "Enviada externamente") return false;
      if (!p.sentDate) return false;
      return differenceInDays(now, new Date(p.sentDate)) > 7;
    });

    const thisMonthProposals = proposals.filter(p => p.createdAt && isThisMonth(new Date(p.createdAt)));
    const thisMonthApproved = thisMonthProposals.filter(p => p.status === "Aprobada").length;
    const thisMonthRate = thisMonthProposals.length > 0 ? Math.round((thisMonthApproved / thisMonthProposals.length) * 100) : 0;

    const lastMonth = subDays(now, 30);
    const prevMonthProposals = proposals.filter(p => {
      if (!p.createdAt) return false;
      const d = new Date(p.createdAt);
      return isAfter(d, subDays(lastMonth, 30)) && !isAfter(d, lastMonth);
    });
    const prevMonthApproved = prevMonthProposals.filter(p => p.status === "Aprobada").length;
    const prevMonthRate = prevMonthProposals.length > 0 ? Math.round((prevMonthApproved / prevMonthProposals.length) * 100) : 0;

    let alertText = "Sin alertas urgentes hoy";
    if (atRisk.length > 0) {
      alertText = `${atRisk.length} propuesta(s) sin respuesta en +7 días`;
    } else if (activeLeads.length > 5) {
      alertText = `${activeLeads.length} leads activos esperando seguimiento`;
    }

    return {
      activeLeads: activeLeads.length,
      pipelineValue: totalPipelineValue,
      atRiskCount: atRisk.length,
      thisMonthRate,
      prevMonthRate,
      rateDiff: thisMonthRate - prevMonthRate,
      alertText,
    };
  }, [leads, proposals]);

  const steps = useMemo(() => [
    { label: "Empresa configurada", done: !!company },
    { label: "Agrega 3 clientes", done: clients.length >= 3 },
    { label: "Crea tu primera propuesta", done: proposals.length >= 1 },
    { label: "Registra un pago", done: payments.length >= 1 },
  ], [company, clients, proposals, payments]);

  const completedSteps = steps.filter(s => s.done).length;

  const [aiUnavailable, setAiUnavailable] = useState(false);

  const generateBriefing = async () => {
    setBriefingLoading(true);
    setBriefingOpen(true);
    setBriefingText("");

    try {
      const thirtyDaysAgo = subDays(now, 30).toISOString();
      const recentLeads = leads.slice(0, 20).map(l => ({ name: l.name, status: l.status, value: l.value, service: l.service }));
      const recentProposals = proposals.filter(p => p.createdAt > thirtyDaysAgo).map(p => ({ client: p.client, value: p.value, status: p.status, sentDate: p.sentDate }));
      const recentPayments = payments.filter(p => p.createdAt > thirtyDaysAgo).map(p => ({ amount: p.amount, status: p.status, paidAt: p.paidAt }));
      const clientList = clients.slice(0, 20).map(c => ({ name: c.clientName }));

      const businessData = {
        companyName: company?.name || "Mi empresa",
        totalClients: clients.length,
        totalLeads: leads.length,
        totalProposals: proposals.length,
        recentLeads,
        recentProposals,
        recentPayments,
        clients: clientList,
      };

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        toast({ title: "Sesión expirada", description: "Vuelve a iniciar sesión para usar el asistente de IA.", variant: "destructive" });
        setBriefingOpen(false);
        setBriefingLoading(false);
        return;
      }

      const response = await supabase.functions.invoke("ai-briefing", {
        body: { businessData },
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Parse error codes from edge function
      if (response.error) {
        let errorCode = "unknown";
        const errorContext = (response.error as { context?: Response }).context;
        if (errorContext) {
          try {
            const payload = await errorContext.clone().json();
            errorCode = payload?.error || errorCode;
          } catch { /* ignore */ }
        }

        if (errorCode === "session_expired") {
          toast({ title: "Sesión expirada", description: "Vuelve a iniciar sesión para usar el asistente.", variant: "destructive" });
        } else if (errorCode === "ai_not_configured") {
          setAiUnavailable(true);
          toast({ title: "Asistente no disponible", description: "La configuración del servicio de IA necesita revisión. Contacta al administrador." });
        } else if (errorCode === "rate_limited") {
          toast({ title: "Demasiadas solicitudes", description: "Espera unos minutos antes de generar otro briefing." });
        } else {
          toast({ title: "Problema de conexión", description: "No se pudo conectar con el asistente. Inténtalo de nuevo más tarde." });
        }
        setBriefingOpen(false);
        return;
      }

      setBriefingText(response.data?.briefing || "No se pudo generar el briefing.");
    } catch {
      toast({ title: "Problema de conexión", description: "No se pudo conectar con el asistente. Inténtalo de nuevo más tarde." });
      setBriefingOpen(false);
    } finally {
      setBriefingLoading(false);
    }
  };

  const formatCurrency = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`;

  const insightCards = [
    { icon: Target, label: "Pipeline hoy", value: String(insights.activeLeads), sub: `${formatCurrency(insights.pipelineValue)} en valor` },
    { icon: AlertTriangle, label: "En riesgo", value: String(insights.atRiskCount), sub: "Sin respuesta +7 días" },
    { icon: TrendingUp, label: "Tasa de cierre", value: `${insights.thisMonthRate}%`, sub: `${insights.rateDiff >= 0 ? "+" : ""}${insights.rateDiff}% vs mes ant.` },
    { icon: Zap, label: "Alerta", value: "", sub: insights.alertText },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        {/* AI Panel — Zinc-950 with subtle orange border */}
        <div
          className="rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-2xl overflow-hidden transition-all duration-300 hover:border-white/[0.12]"
        >
          <div className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Sparkles className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </motion.div>
                <div>
                  <h2 className="font-medium text-lg text-white">{greeting}, {firstName}</h2>
                  <p className="text-xs text-zinc-500">
                    Tu resumen inteligente de hoy · {dateStr}
                  </p>
                </div>
                <Badge className="ml-2 text-[10px] px-2 py-0.5 border-0 font-bold bg-primary/15 text-primary">
                  AI
                </Badge>
              </div>
              <span className="text-[10px] hidden sm:block text-zinc-600">
                Actualizado hace 1 min
              </span>
            </div>

            {!hasEnoughData ? (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                  Tu asistente de inteligencia está listo. Necesita conocer tu negocio primero.
                </p>
                {/* Glass capsule progress bar */}
                <div className="w-full rounded-full h-2.5 bg-white/[0.04] border border-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(completedSteps / steps.length) * 100}%`,
                      background: 'linear-gradient(90deg, hsl(25, 95%, 53%), hsl(30, 100%, 60%))',
                      boxShadow: '0 0 12px hsl(25, 95%, 53% / 0.4), 0 0 24px hsl(25, 95%, 53% / 0.2)',
                    }}
                  />
                </div>
                <div className="space-y-2">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      {step.done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" strokeWidth={1.5} />
                      ) : (
                        <Circle className="h-4 w-4 text-zinc-600" strokeWidth={1.5} />
                      )}
                      <span className={step.done ? "text-zinc-600 line-through" : "text-white"}>
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => navigate("/clients")}
                >
                  Completar configuración <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {insightCards.map((card, i) => {
                    const IconComp = card.icon;
                    return (
                      <div
                        key={i}
                        className="rounded-xl p-4 space-y-1 transition-all duration-300 hover:border-white/[0.12] hover:bg-zinc-950/50 border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl"
                      >
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                          <IconComp className="h-3.5 w-3.5" strokeWidth={1.5} /> {card.label}
                        </div>
                        {card.value && (
                          <p className="font-semibold text-[28px] leading-none text-white">{card.value}</p>
                        )}
                        <p className={`text-xs leading-tight text-zinc-500 ${card.value ? "" : "font-medium"}`}>
                          {card.sub}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {aiUnavailable ? (
                  <div className="w-full text-center py-2 text-xs text-muted-foreground border border-border/50 rounded-lg">
                    Asistente de IA no disponible · Verifica la configuración
                  </div>
                ) : (
                  <Button
                    onClick={generateBriefing}
                    disabled={briefingLoading}
                    variant="ghost"
                    className="w-full border border-primary/30 text-primary hover:bg-primary/10 font-medium btn-spring"
                  >
                    <Sparkles className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    Generar briefing completo con IA
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Briefing Sheet */}
      <Sheet open={briefingOpen} onOpenChange={setBriefingOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Briefing Ejecutivo
              </SheetTitle>
              {briefingText && !briefingLoading && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(briefingText);
                    toast({ title: "Copiado", description: "Briefing copiado al portapapeles" });
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors text-muted-foreground hover:text-foreground"
                  title="Copiar briefing"
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
            <SheetDescription>
              Análisis generado con IA · {format(now, "d MMM yyyy", { locale: es })}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[calc(100vh-140px)] pr-2">
            {briefingLoading ? (
              <div className="space-y-3 p-4">
                <motion.p
                  className="text-muted-foreground text-sm mb-3"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Analizando tu negocio...
                </motion.p>
                <div className="h-4 bg-white/[0.06] rounded animate-pulse w-1/3" />
                <div className="h-3 bg-white/[0.03] rounded animate-pulse w-full" />
                <div className="h-3 bg-white/[0.03] rounded animate-pulse w-5/6" />
                <div className="h-4 bg-white/[0.06] rounded animate-pulse w-2/5 mt-4" />
                <div className="h-3 bg-white/[0.03] rounded animate-pulse w-full" />
                <div className="h-3 bg-white/[0.03] rounded animate-pulse w-4/6" />
              </div>
            ) : (
              <BriefingContent text={briefingText} />
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
