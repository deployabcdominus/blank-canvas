import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Circle, Bell, TrendingUp, AlertTriangle, Target, Zap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useCompany } from "@/hooks/useCompany";
import { useLeads, Lead } from "@/contexts/LeadsContext";
import { useProposals, Proposal } from "@/contexts/ProposalsContext";
import { usePayments, Payment } from "@/contexts/PaymentsContext";
import { useClients } from "@/contexts/ClientsContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays, subDays, isThisMonth, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

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

  // Insights calculations
  const insights = useMemo(() => {
    const activeLeads = leads.filter(l => l.status !== "Convertido" && l.status !== "Perdido");
    const totalPipelineValue = activeLeads.reduce((s, l) => s + (parseFloat(l.value) || 0), 0);

    // Proposals at risk: sent but no response for 7+ days
    const atRisk = proposals.filter(p => {
      if (p.status !== "Enviada externamente") return false;
      if (!p.sentDate) return false;
      return differenceInDays(now, new Date(p.sentDate)) > 7;
    });

    // Close rate this month vs last month
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

    // Alert: most urgent
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

  // Steps for activation
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

      const response = await supabase.functions.invoke("ai-briefing", {
        body: { businessData },
      });

      if (response.error) throw new Error(response.error.message);
      setBriefingText(response.data?.briefing || "No se pudo generar el briefing.");
    } catch (e: any) {
      console.error("Briefing error:", e);
      toast({ title: "Error al generar briefing", description: e.message, variant: "destructive" });
      setBriefingOpen(false);
    } finally {
      setBriefingLoading(false);
    }
  };

  const formatCurrency = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="relative rounded-xl p-[1px] overflow-hidden" style={{
          background: "linear-gradient(135deg, hsl(260 60% 58%), hsl(225 80% 56%), hsl(260 60% 58%))",
          backgroundSize: "200% 200%",
          animation: "shimmer 4s linear infinite",
        }}>
          <Card className="border-0 bg-[hsl(240,6%,8%)] rounded-xl">
            <CardContent className="p-5 sm:p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Sparkles className="h-6 w-6" style={{ color: "hsl(260 60% 58%)" }} />
                    </motion.div>
                  </div>
                  <div>
                    <h2 className="text-foreground font-semibold text-lg">{greeting}, {firstName}</h2>
                    <p className="text-muted-foreground text-xs">Tu resumen inteligente de hoy · {dateStr}</p>
                  </div>
                  <Badge className="ml-2 text-[10px] px-2 py-0.5 border-0" style={{
                    background: "hsl(260 60% 58% / 0.2)",
                    color: "hsl(260 60% 92%)",
                    boxShadow: "0 0 12px hsl(260 60% 58% / 0.3)",
                  }}>AI</Badge>
                </div>
                <span className="text-muted-foreground text-[10px] hidden sm:block">
                  Actualizado hace 1 min
                </span>
              </div>

              {!hasEnoughData ? (
                /* Activation state */
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Tu asistente de inteligencia está listo. Necesita conocer tu negocio primero.
                  </p>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(completedSteps / steps.length) * 100}%`,
                        background: "linear-gradient(90deg, hsl(260 60% 58%), hsl(225 80% 56%))",
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    {steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {step.done ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className={step.done ? "text-muted-foreground line-through" : "text-foreground"}>
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
                /* Insight cards */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Card 1 — Pipeline */}
                    <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <Target className="h-3.5 w-3.5" /> Pipeline hoy
                      </div>
                      <p className="text-foreground font-semibold text-lg">{insights.activeLeads}</p>
                      <p className="text-muted-foreground text-[10px]">{formatCurrency(insights.pipelineValue)} en valor</p>
                    </div>

                    {/* Card 2 — At risk */}
                    <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <AlertTriangle className="h-3.5 w-3.5" /> En riesgo
                      </div>
                      <p className="text-foreground font-semibold text-lg">{insights.atRiskCount}</p>
                      <p className="text-muted-foreground text-[10px]">Sin respuesta +7 días</p>
                    </div>

                    {/* Card 3 — Close rate */}
                    <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <TrendingUp className="h-3.5 w-3.5" /> Tasa de cierre
                      </div>
                      <p className="text-foreground font-semibold text-lg">{insights.thisMonthRate}%</p>
                      <p className="text-muted-foreground text-[10px]">
                        {insights.rateDiff >= 0 ? "+" : ""}{insights.rateDiff}% vs mes ant.
                      </p>
                    </div>

                    {/* Card 4 — Alert */}
                    <div className="rounded-lg bg-secondary/50 p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <Zap className="h-3.5 w-3.5" /> Alerta
                      </div>
                      <p className="text-foreground font-medium text-xs leading-tight">{insights.alertText}</p>
                    </div>
                  </div>

                  <Button
                    onClick={generateBriefing}
                    disabled={briefingLoading}
                    className="w-full border-0"
                    style={{
                      background: "linear-gradient(135deg, hsl(260 60% 48%), hsl(225 80% 50%))",
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar briefing completo con IA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Briefing Sheet */}
      <Sheet open={briefingOpen} onOpenChange={setBriefingOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" style={{ color: "hsl(260 60% 58%)" }} />
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
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[85%]" />
              </div>
            ) : (
              <div className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">
                {briefingText}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
