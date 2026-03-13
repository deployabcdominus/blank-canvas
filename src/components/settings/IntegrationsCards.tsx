import { Bell, CreditCard, CalendarDays, MessageCircle, FileSignature, Zap, Sparkles, Rocket, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const notify = (toast: ReturnType<typeof useToast>["toast"]) => {
  toast({ title: "¡Te avisaremos cuando esté listo!" });
};

interface IntegrationDef {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  bullets: string[];
  badge: string;
  quarter: string;
  gradientClass: string;
}

const integrations: IntegrationDef[] = [
  {
    icon: <CreditCard className="w-7 h-7" style={{ color: "#635BFF" }} />,
    title: "Stripe Payments",
    subtitle: "Acepta pagos online directamente desde tus propuestas y portal del cliente",
    bullets: ["Links de pago en propuestas", "Suscripciones y pagos recurrentes", "Dashboard financiero unificado"],
    badge: "Próximamente",
    quarter: "Q2 2026",
    gradientClass: "integration-border-stripe",
  },
  {
    icon: <CalendarDays className="w-7 h-7" style={{ color: "#4285F4" }} />,
    title: "Google Calendar",
    subtitle: "Sincroniza órdenes de servicio y ejecuciones automáticamente con tu calendario",
    bullets: ["Órdenes → eventos automáticos", "Recordatorios al equipo", "Vista de agenda del mes"],
    badge: "Próximamente",
    quarter: "Q3 2026",
    gradientClass: "integration-border-gcal",
  },
  {
    icon: <MessageCircle className="w-7 h-7" style={{ color: "#25D366" }} />,
    title: "WhatsApp Business",
    subtitle: "Notificaciones automáticas a clientes en cada etapa del proyecto",
    bullets: ["Estado de orden en tiempo real", "Aprobación de propuestas por WhatsApp", "Recordatorios de pago automáticos"],
    badge: "Próximamente",
    quarter: "Q3 2026",
    gradientClass: "integration-border-whatsapp",
  },
  {
    icon: <FileSignature className="w-7 h-7" style={{ color: "#FFB800" }} />,
    title: "DocuSign",
    subtitle: "Firma digital de propuestas y contratos desde el portal del cliente",
    bullets: ["Propuestas con firma electrónica legal", "Contratos firmados en minutos", "Archivo automático de documentos"],
    badge: "Próximamente",
    quarter: "Q4 2026",
    gradientClass: "integration-border-docusign",
  },
  {
    icon: <Zap className="w-7 h-7" style={{ color: "#FF4A00" }} />,
    title: "Zapier",
    subtitle: "Conecta SignFlow con más de 5,000 apps sin código",
    bullets: ["Automatizaciones sin límite", "Conecta con tu CRM actual", "Workflows personalizados"],
    badge: "Próximamente",
    quarter: "2027",
    gradientClass: "integration-border-zapier",
  },
];

function IntegrationCard({ def, onNotify }: { def: IntegrationDef; onNotify: () => void }) {
  return (
    <Card className={`relative overflow-hidden ${def.gradientClass}`}>
      <Badge className="absolute top-3 right-3 bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
        {def.quarter}
      </Badge>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-secondary/60 flex items-center justify-center">
            {def.icon}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{def.title}</CardTitle>
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs">{def.badge}</Badge>
            </div>
            <CardDescription>{def.subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <ul className="space-y-2.5">
          {def.bullets.map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
              {b}
            </li>
          ))}
        </ul>
        <Button variant="outline" className="flex items-center gap-2" onClick={onNotify}>
          <Bell className="w-4 h-4" />
          Notificarme
        </Button>
      </CardContent>
    </Card>
  );
}

export default function IntegrationsCards() {
  const { toast } = useToast();
  const handleNotify = () => notify(toast);

  return (
    <div className="space-y-6">
      {/* Grid: 2 cols desktop, 1 mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QuickBooks (existing) */}
        <Card className="relative overflow-hidden integration-border-qb">
          <Badge className="absolute top-3 right-3 bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
            Q2 2026
          </Badge>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: "#2CA01C", color: "white" }}>
                QB
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">QuickBooks Online</CardTitle>
                  <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs">Próximamente</Badge>
                </div>
                <CardDescription>Sincronización bidireccional automática de clientes, propuestas e invoices</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2.5">
              {["Clientes sincronizados en tiempo real", "Propuestas convertidas a Estimates en QBO", "Pagos registrados como Invoices automáticamente"].map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleNotify}>
              <Bell className="w-4 h-4" />
              Notificarme
            </Button>
          </CardContent>
        </Card>

        {/* Dynamic cards */}
        {integrations.map((def) => (
          <IntegrationCard key={def.title} def={def} onNotify={handleNotify} />
        ))}
      </div>

      {/* AI Assistant Pro — full width hero card */}
      <Card className="relative overflow-hidden integration-ai-hero col-span-full">
        <div className="integration-ai-particles" aria-hidden />
        <Badge className="absolute top-4 right-4 bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">
          Exclusivo
        </Badge>
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center integration-ai-icon-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">AI Assistant Pro</CardTitle>
                <Badge className="integration-ai-badge text-xs">Beta Privada</Badge>
              </div>
              <CardDescription className="text-base">
                Tu consultor de negocios con IA que aprende de tu empresa y predice oportunidades
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-5">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              "Generación automática de propuestas por voz",
              "Predicción de precios óptimos",
              "Detección de clientes en riesgo de churn",
              "Recomendaciones de ventas en tiempo real",
            ].map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-purple-400/80 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white flex items-center gap-2" onClick={handleNotify}>
              <Rocket className="w-5 h-5" />
              Unirme a la lista de espera
            </Button>
            <p className="text-xs text-muted-foreground">Solo 50 lugares disponibles para beta</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
