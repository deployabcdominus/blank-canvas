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
          {t.landing.pilot.subtitle}
        </p>
      </div>

      <Tabs defaultValue="checklist" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="checklist">{t.landing.pilot.checklist}</TabsTrigger>
          <TabsTrigger value="marketing">{t.landing.pilot.marketing}</TabsTrigger>
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
            </div>
          </div>
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
