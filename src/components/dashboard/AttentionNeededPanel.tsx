import { useMemo } from "react";
import { AlertCircle, Clock, FileWarning, Camera, DollarSign, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface AttentionItem {
  id: string;
  type: "lead" | "proposal" | "order" | "installation";
  label: string;
  description: string;
  severity: "urgent" | "warning" | "info";
  icon: any;
  actionPath: string;
}

export function AttentionNeededPanel({ leads, proposals, orders, installations }: any) {
  const navigate = useNavigate();

  const attentionItems = useMemo(() => {
    const items: AttentionItem[] = [];

    // 1. Leads needing follow-up
    leads.filter((l: any) => l.follow_up_required && l.status !== "Convertido").forEach((l: any) => {
      items.push({
        id: `lead-${l.id}`,
        type: "lead",
        label: `Follow-up: ${l.name}`,
        description: "Lead marked for manual follow-up",
        severity: "warning",
        icon: Clock,
        actionPath: `/leads?id=${l.id}`,
      });
    });

    // 2. Orders missing dimensions or mockups
    orders.filter((o: any) => o.status !== "Completada" && o.status !== "Canceled").forEach((o: any) => {
      if (!o.final_width || !o.final_height) {
        items.push({
          id: `order-dim-${o.id}`,
          type: "order",
          label: `Missing Dims: ${o.client}`,
          description: "Production order missing final dimensions",
          severity: "urgent",
          icon: FileWarning,
          actionPath: `/work-orders?id=${o.id}`,
        });
      }
      if (!o.blueprintUrl && (!o.mockup_urls || o.mockup_urls.length === 0)) {
        items.push({
          id: `order-mock-${o.id}`,
          type: "order",
          label: `No Mockup: ${o.client}`,
          description: "Design review pending or missing files",
          severity: "warning",
          icon: Camera,
          actionPath: `/work-orders?id=${o.id}`,
        });
      }
    });

    // 3. Installations pending review
    installations.filter((i: any) => i.status === "Completed Pending Review").forEach((i: any) => {
      items.push({
        id: `install-${i.id}`,
        type: "installation",
        label: `Review Install: ${i.client}`,
        description: "Installation finished, needs admin verification",
        severity: "urgent",
        icon: CheckCircle2,
        actionPath: "/installation",
      });
    });

    // 4. Projects ready to close
    orders.filter((o: any) => o.closing_status === "Ready to Close").forEach((o: any) => {
      items.push({
        id: `close-${o.id}`,
        type: "order",
        label: `Ready to Close: ${o.client}`,
        description: "Acceptance and payment verified",
        severity: "info",
        icon: DollarSign,
        actionPath: `/work-orders?id=${o.id}`,
      });
    });

    return items.sort((a, b) => {
      const priority = { urgent: 0, warning: 1, info: 2 };
      return priority[a.severity] - priority[b.severity];
    }).slice(0, 8); // Show top 8
  }, [leads, proposals, orders, installations]);

  if (attentionItems.length === 0) return null;

  return (
    <Card className="border-white/[0.08] bg-zinc-900/50 backdrop-blur-xl mb-8 overflow-hidden">
      <CardHeader className="pb-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <CardTitle className="text-sm font-bold tracking-wider uppercase text-zinc-400">Needs Attention</CardTitle>
          <Badge variant="outline" className="ml-auto bg-red-500/10 text-red-400 border-red-500/20">
            {attentionItems.length} Actions
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/[0.04]">
          {attentionItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  item.severity === 'urgent' ? 'bg-red-500/10 text-red-400' :
                  item.severity === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{item.label}</p>
                  <p className="text-xs text-zinc-500">{item.description}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(item.actionPath)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-zinc-400 hover:text-white hover:bg-white/5"
              >
                View <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
