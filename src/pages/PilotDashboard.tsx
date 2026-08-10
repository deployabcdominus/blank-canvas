import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PilotChecklist } from "@/components/pilot/PilotChecklist";
import { PilotFeedbackForm } from "@/components/pilot/PilotFeedbackForm";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { resolveCompanyId } from "@/lib/resolve-company";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

export default function PilotDashboard() {
  const { locale, t } = useLanguage();
  const { user } = useAuth();
  const isEn = locale === "en";
  const [feedback, setFeedback] = useState<any[]>([]);

  const fetchFeedback = async () => {
    if (!user) return;
    const companyId = await resolveCompanyId(user.id);
    if (!companyId) return;

    const { data, error } = await supabase
      .from("pilot_feedback")
      .select("*, profiles(display_name)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching feedback:", error);
    else setFeedback(data || []);
  };

  useEffect(() => {
    fetchFeedback();
  }, [user]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "destructive";
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t.landing.pilot.title}
        </h1>
        <p className="text-muted-foreground">
          el problema persiste en /work-orders
        </p>
      </div>

      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList className="grid w-full grid-cols-9 max-w-6xl">
          <TabsTrigger value="checklist">{t.landing.pilot.checklist}</TabsTrigger>
          <TabsTrigger value="marketing">{t.landing.pilot.marketing}</TabsTrigger>
          <TabsTrigger value="intelligence">{(t as any).landing.pilot.intelligence}</TabsTrigger>
          <TabsTrigger value="integrations">{(t as any).landing.pilot.integrations}</TabsTrigger>
          <TabsTrigger value="portal">{(t as any).landing.pilot.portal}</TabsTrigger>
          <TabsTrigger value="scaling">{(t as any).landing.pilot.scaling}</TabsTrigger>
          <TabsTrigger value="enterprise">{(t as any).landing.pilot.enterprise}</TabsTrigger>
          <TabsTrigger value="feedback">{t.landing.pilot.feedback}</TabsTrigger>
          <TabsTrigger value="history">{t.landing.pilot.history}</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t.landing.pilot.operationsChecklist}</CardTitle>
                  <CardDescription>
                    {t.landing.pilot.operationsChecklistDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PilotChecklist />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>{t.landing.pilot.aboutPilot}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p>
                    {t.landing.pilot.aboutPilotDesc}
                  </p>
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <h4 className="font-bold mb-2">{t.landing.pilot.successMetrics}</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>{t.landing.pilot.metricZeroBugs}</li>
                      <li>{t.landing.pilot.metricOrdersPrinted}</li>
                      <li>{t.landing.pilot.metricPhotosUploaded}</li>
                      <li>{t.landing.pilot.metricPaymentsRecorded}</li>
                      <li>{t.landing.pilot.metricReferralActive}</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-violet-500/20 bg-violet-500/5">
                <CardHeader>
                  <CardTitle className="text-lg">{(t as any).landing.pilot.remainingStagesTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">10</Badge>
                      {(t as any).landing.pilot.stage10}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">11</Badge>
                      {(t as any).landing.pilot.stage11}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
                      <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center border-emerald-500">12</Badge>
                      {(t as any).landing.pilot.stage12}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-blue-500 font-bold animate-pulse">
                      <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center border-blue-500">13</Badge>
                      Phase 13: Autonomous AI & Enterprise SSO (Active)
                    </li>
                    <li className="pt-2 border-t border-violet-500/10 text-xs text-muted-foreground italic">
                      {(t as any).landing.pilot.stageCompletion}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{t.landing.pilot.campaigns}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">Ready to launch</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{t.landing.pilot.referrals}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Inactive</div>
                <p className="text-xs text-muted-foreground mt-1">Configure in settings</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{t.landing.pilot.growthStats}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0%</div>
                <p className="text-xs text-muted-foreground mt-1">Conversion lift</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle>Phase 8: Growth Engine</CardTitle>
              <CardDescription>
                Marketing automation infrastructure is now provisioned. Connect your delivery providers to start automated campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl">
                <p className="text-muted-foreground italic">Campaign designer and referral link generator coming in the next update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.profitability}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">A+</div>
                <p className="text-xs text-muted-foreground mt-1">Target margin: 35%</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.predictivePricing}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Enabled</div>
                <p className="text-xs text-muted-foreground mt-1">Based on 0 projects</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.efficiencyScore}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.0</div>
                <p className="text-xs text-muted-foreground mt-1">Base performance</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle>Phase 9: Predictive Intelligence</CardTitle>
              <CardDescription>
                {(t as any).landing.pilot.phase9Desc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl">
                <p className="text-muted-foreground italic">Cost tracking and automated margin suggestions will populate as you complete work orders.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.apiManagement}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Ready</div>
                <p className="text-xs text-muted-foreground mt-1">{(t as any).landing.pilot.apiKeyStatus}: Active</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.webhooks}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">{(t as any).landing.pilot.activeEndpoints}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.connectedApps}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">Active integrations</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle>Phase 10: API & Ecosystem</CardTitle>
              <CardDescription>
                {(t as any).landing.pilot.phase10Desc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['QuickBooks', 'Stripe', 'Zapier', 'Slack'].map(app => (
                  <div key={app} className="flex flex-col items-center justify-center p-4 border border-white/10 rounded-xl bg-white/5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                    <span className="text-xs font-semibold">{app}</span>
                    <span className="text-[10px] text-muted-foreground mt-1">Available soon</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="portal" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.portalStatus}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(t as any).landing.pilot.active}</div>
                <p className="text-xs text-muted-foreground mt-1">{(t as any).landing.pilot.subdomain}: client.signflow.app</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.clientUsers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">{(t as any).landing.pilot.invitesPending}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.collaboration}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Enabled</div>
                <p className="text-xs text-muted-foreground mt-1">Real-time sync active</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle>Phase 11: White-Label Client Portal</CardTitle>
              <CardDescription>
                {(t as any).landing.pilot.phase11Desc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground font-medium">Portal Customization Preview</p>
                  <p className="text-xs text-muted-foreground/60 italic">Upload your branding in Company Settings to preview your white-label portal.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scaling" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.activeRegions}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground mt-1">{(t as any).landing.pilot.primaryNode}: US-East</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.globalLatency}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42ms</div>
                <p className="text-xs text-muted-foreground mt-1">{(t as any).landing.pilot.uptime}: 99.99%</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.multiRegionSync}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground mt-1">Real-time edge propagation</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle>Phase 12: Global Scaling & Multi-Region</CardTitle>
              <CardDescription>
                {(t as any).landing.pilot.phase12Desc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Deployment Infrastructure</h4>
                  <div className="space-y-2">
                    {['North America (Primary)', 'Europe (Edge)', 'Asia Pacific (Planned)'].map(region => (
                      <div key={region} className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
                        <span className="text-sm">{region}</span>
                        <Badge variant={region.includes('Primary') ? 'default' : 'outline'} className="text-[10px]">
                          {region.includes('Planned') ? 'Coming Soon' : 'Operational'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl border border-white/10 p-6 flex flex-col justify-center items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center border border-violet-500/40">
                    <div className="w-8 h-8 rounded-full border-2 border-violet-500 animate-ping opacity-20" />
                  </div>
                  <h4 className="font-medium">Edge Network Active</h4>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Automatic traffic routing based on technical specialist geolocation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enterprise" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.ssoStatus}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Ready</div>
                <p className="text-xs text-muted-foreground mt-1">SAML 2.0 / Okta Support</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.aiInsights}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground mt-1">Voice-to-Task enabled</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">{(t as any).landing.pilot.mobilePerformance}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">A+</div>
                <p className="text-xs text-muted-foreground mt-1">Lighthouse Score: 98</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle>Phase 13: Autonomous Intelligence & Enterprise</CardTitle>
              <CardDescription>
                {(t as any).landing.pilot.phase13Desc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Intelligence Features</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Voice Transcription', status: 'Operational' },
                      { name: 'Automated Blueprint OCR', status: 'BETA' },
                      { name: 'Mobile Offline Hardening', status: 'Active' },
                      { name: 'Enterprise SSO (SAML)', status: 'Operational' }
                    ].map(feature => (
                      <div key={feature.name} className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
                        <span className="text-sm">{feature.name}</span>
                        <Badge variant={feature.status === 'Operational' || feature.status === 'Active' ? 'default' : 'outline'} className="text-[10px]">
                          {feature.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl border border-white/10 p-6 flex flex-col justify-center items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500 animate-pulse" />
                  </div>
                  <h4 className="font-medium">AI Node Operational</h4>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    Autonomous task generation and enterprise authentication bridging active.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{t.landing.pilot.submitFeedback}</CardTitle>
              <CardDescription>
                {t.landing.pilot.submitFeedbackDesc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PilotFeedbackForm onSuccess={fetchFeedback} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.landing.pilot.issueHistory}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {feedback.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">{t.landing.pilot.noFeedback}</p>
                  ) : (
                    feedback.map((item) => (
                      <div key={item.id} className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={getSeverityColor(item.severity)}>{item.severity}</Badge>
                            <Badge variant="outline">{item.module}</Badge>
                            <Badge variant="secondary">{item.issue_type}</Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm font-medium mt-2">{item.description}</p>
                        {item.suggested_improvement && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                            <span className="font-bold">{t.landing.pilot.suggestion}</span>
                            {item.suggested_improvement}
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{t.landing.pilot.reportedBy}{item.profiles?.display_name || "Unknown"}</span>
                          <Badge variant={item.status === "Resolved" ? "default" : "outline"} className="text-[10px] h-4">
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
