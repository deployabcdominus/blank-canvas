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

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw new Error("No se pudo validar tu sesión. Intenta nuevamente.");

      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        throw new Error("Tu sesión expiró. Vuelve a iniciar sesión para generar el briefing.");
      }

      const response = await supabase.functions.invoke("ai-briefing", {
        body: { businessData },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.error) {
        let errorMessage = response.error.message || "Error desconocido en la Edge Function";
        const errorContext = (response.error as { context?: Response }).context;

        if (errorContext) {
          try {
            const payload = await errorContext.clone().json();
            if (payload?.error && typeof payload.error === "string") {
              errorMessage = payload.error;
            }
          } catch {
            // Keep default edge function error message
          }
        }

        throw new Error(errorMessage);
      }

      setBriefingText(response.data?.briefing || "No se pudo generar el briefing.");
    } catch (e: any) {
      toast({ title: "Error al generar briefing", description: e.message, variant: "destructive" });
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
        {/* AI Panel — always dark for contrast */}
        <div
          className="rounded-[20px] p-[1px] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(234 86% 65%), hsl(260 60% 58%), hsl(234 86% 65%))",
            backgroundSize: "200% 200%",
            animation: "shimmer 4s linear infinite",
          }}
        >
          <div
            className="rounded-[19px]"
            style={{
              background: "linear-gradient(135deg, #1E2340 0%, #141830 50%, #1A2048 100%)",
            }}
          >
            <div className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="h-6 w-6 text-[#5B6AF2]" />
                  </motion.div>
                  <div>
                    <h2 className="font-semibold text-lg" style={{ color: "#E8EAFF" }}>{greeting}, {firstName}</h2>
                    <p className="text-xs" style={{ color: "rgba(200, 206, 255, 0.75)" }}>
                      Tu resumen inteligente de hoy · {dateStr}
                    </p>
                  </div>
                  <Badge className="ml-2 text-[10px] px-2 py-0.5 border-0 font-bold bg-[#5B6AF2] text-white">
                    AI
                  </Badge>
                </div>
                <span className="text-[10px] hidden sm:block" style={{ color: "rgba(160, 170, 230, 0.85)" }}>
                  Actualizado hace 1 min
                </span>
              </div>

              {!hasEnoughData ? (
                <div className="space-y-4">
                  <p className="text-sm" style={{ color: "rgba(200, 206, 255, 0.75)" }}>
                    Tu asistente de inteligencia está listo. Necesita conocer tu negocio primero.
                  </p>
                  <div className="w-full rounded-full h-2" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(completedSteps / steps.length) * 100}%`,
                        background: "linear-gradient(90deg, #5B6AF2, #7C6FEE)",
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    {steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {step.done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4" style={{ color: "rgba(160, 170, 230, 0.5)" }} />
                        )}
                        <span style={{ color: step.done ? "rgba(160, 170, 230, 0.5)" : "#E8EAFF", textDecoration: step.done ? "line-through" : "none" }}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="mt-2 bg-[#5B6AF2] hover:bg-[#4757E8] text-white font-semibold"
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
                          className="rounded-xl p-4 space-y-1 transition-all duration-200 hover:bg-white/[0.10]"
                          style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                          }}
                        >
                          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "rgba(180, 190, 240, 0.85)" }}>
                            <IconComp className="h-3.5 w-3.5" /> {card.label}
                          </div>
                          {card.value && (
                            <p className="font-bold text-[28px] leading-none text-white">{card.value}</p>
                          )}
                          <p className={`text-xs leading-tight ${card.value ? "" : "font-medium"}`} style={{ color: "rgba(160, 170, 220, 0.75)" }}>
                            {card.sub}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    onClick={generateBriefing}
                    disabled={briefingLoading}
                    className="w-full border-0 font-semibold text-white btn-spring"
                    style={{
                      background: "linear-gradient(135deg, #5B6AF2, #7C6FEE)",
                      boxShadow: "0 4px 20px rgba(91, 106, 242, 0.35)",
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar briefing completo con IA
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Briefing Sheet */}
      <Sheet open={briefingOpen} onOpenChange={setBriefingOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Briefing Ejecutivo
            </SheetTitle>
            <SheetDescription>
              Análisis generado con IA · {format(now, "d MMM yyyy", { locale: es })}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="mt-4 h-[calc(100vh-140px)] pr-2">
            {briefingLoading ? (
              <div className="space-y-4">
                <motion.p
                  className="text-muted-foreground text-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Analizando tu negocio...
                </motion.p>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[70%]" />
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
