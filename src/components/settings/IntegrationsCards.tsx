import { Bell, CreditCard, CalendarDays, MessageCircle, FileSignature, Zap, Sparkles, Rocket, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";

interface IntegrationDef {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  bullets: string[];
  badge: string;
  quarter: string;
  gradientClass: string;
  onNotify: () => void;
}

function IntegrationCard({ def }: { def: IntegrationDef }) {
  const { t } = useLanguage();
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
        <Button variant="outline" className="flex items-center gap-2" onClick={def.onNotify}>
          <Bell className="w-4 h-4" />
          {t.settings.integrations.notifyMe}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function IntegrationsCards() {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const handleNotify = () => {
    toast({ title: t.settings.integrations.notified });
  };

  const integrations = [
    {
      icon: <CreditCard className="w-7 h-7" style={{ color: "#635BFF" }} />,
      title: t.settings.integrations.stripe.title,
      subtitle: t.settings.integrations.stripe.desc,
      bullets: t.settings.integrations.stripe.bullets,
      badge: t.settings.integrations.comingSoon,
      quarter: "Q2 2026",
      gradientClass: "integration-border-stripe",
      onNotify: handleNotify
    },
    {
      icon: <CalendarDays className="w-7 h-7" style={{ color: "#4285F4" }} />,
      title: t.settings.integrations.gcal.title,
      subtitle: t.settings.integrations.gcal.desc,
      bullets: t.settings.integrations.gcal.bullets,
      badge: t.settings.integrations.comingSoon,
      quarter: "Q3 2026",
      gradientClass: "integration-border-gcal",
      onNotify: handleNotify
    },
    {
      icon: <MessageCircle className="w-7 h-7" style={{ color: "#25D366" }} />,
      title: t.settings.integrations.whatsapp.title,
      subtitle: t.settings.integrations.whatsapp.desc,
      bullets: t.settings.integrations.whatsapp.bullets,
      badge: t.settings.integrations.comingSoon,
      quarter: "Q3 2026",
      gradientClass: "integration-border-whatsapp",
      onNotify: handleNotify
    },
    {
      icon: <FileSignature className="w-7 h-7" style={{ color: "#FFB800" }} />,
      title: t.settings.integrations.docusign.title,
      subtitle: t.settings.integrations.docusign.desc,
      bullets: t.settings.integrations.docusign.bullets,
      badge: t.settings.integrations.comingSoon,
      quarter: "Q4 2026",
      gradientClass: "integration-border-docusign",
      onNotify: handleNotify
    },
    {
      icon: <Zap className="w-7 h-7" style={{ color: "#FF4A00" }} />,
      title: t.settings.integrations.zapier.title,
      subtitle: t.settings.integrations.zapier.desc,
      bullets: t.settings.integrations.zapier.bullets,
      badge: t.settings.integrations.comingSoon,
      quarter: "2027",
      gradientClass: "integration-border-zapier",
      onNotify: handleNotify
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QuickBooks */}
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
                  <CardTitle className="text-lg">{t.settings.integrations.quickbooks.title}</CardTitle>
                  <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs">{t.settings.integrations.comingSoon}</Badge>
                </div>
                <CardDescription>{t.settings.integrations.quickbooks.desc}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2.5">
              {t.settings.integrations.quickbooks.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleNotify}>
              <Bell className="w-4 h-4" />
              {t.settings.integrations.notifyMe}
            </Button>
          </CardContent>
        </Card>

        {/* Dynamic cards */}
        {integrations.map((def) => (
          <IntegrationCard key={def.title} def={def} />
        ))}
      </div>

      {/* AI Assistant Pro */}
      <Card className="relative overflow-hidden integration-ai-hero col-span-full">
        <div className="integration-ai-particles" aria-hidden />
        <Badge className="absolute top-4 right-4 bg-pink-500/20 text-pink-300 border-pink-500/30 text-xs">
          {t.settings.integrations.ai.exclusive}
        </Badge>
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center integration-ai-icon-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{t.settings.integrations.ai.title}</CardTitle>
                <Badge className="integration-ai-badge text-xs">{t.settings.integrations.ai.privateBeta}</Badge>
              </div>
              <CardDescription className="text-base">
                {t.settings.integrations.ai.desc}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-5">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {t.settings.integrations.ai.bullets.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-purple-400/80 flex-shrink-0" />
                {b}
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white flex items-center gap-2" onClick={handleNotify}>
              <Rocket className="w-5 h-5" />
              {t.settings.integrations.ai.waitlist}
            </Button>
            <p className="text-xs text-muted-foreground">{t.settings.integrations.ai.betaPlaces}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}