import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { useLeads } from "@/contexts/LeadsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { useWorkOrders } from "@/contexts/WorkOrdersContext";
import { useInstallations } from "@/contexts/InstallationsContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, TrendingUp, Users, CheckCircle2, BarChart3, PieChart as PieChartIcon } from "lucide-react";

export default function Reports() {
  const { leads } = useLeads();
  const { proposals } = useProposals();
  const { orders } = useWorkOrders();
  const { installations } = useInstallations();
  const { isAdmin, canViewFinancials } = useUserRole();
  const { t } = useLanguage();

  const salesByPersonData = useMemo(() => {
    const people: Record<string, { name: string, value: number, count: number }> = {};
    proposals.filter(p => p.status === "Aprobada").forEach(p => {
      const name = (p as any).owner_user_id || "Unassigned"; // In real app we would join with profiles
      if (!people[name]) people[name] = { name, value: 0, count: 0 };
      people[name].value += Number(p.value) || 0;
      people[name].count += 1;
    });
    return Object.values(people);
  }, [proposals]);

  const ordersByStatusData = useMemo(() => {
    const statuses: Record<string, number> = {};
    orders.forEach(o => {
      const s = o.internal_status || o.status || "Unknown";
      statuses[s] = (statuses[s] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

  if (!isAdmin) {
    return (
      <ResponsiveLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only administrators can view comprehensive reports.</p>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <PageTransition>
      <ResponsiveLayout title="Operational Reports" subtitle="Analyze your business performance">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Sales Performance */}
          <Card className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center gap-3">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              <CardTitle className="text-base font-bold">Approved Proposals Value</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByPersonData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Production Status */}
          <Card className="glass-card border-white/10">
            <CardHeader className="flex flex-row items-center gap-3">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <CardTitle className="text-base font-bold">Production Jobs by Status</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ordersByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {ordersByStatusData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricSmall label="Total Leads" value={leads.length} icon={Users} color="text-violet-400" />
          <MetricSmall label="Active Proposals" value={proposals.filter(p => p.status === 'Enviada externamente').length} icon={FileText} color="text-blue-400" />
          <MetricSmall label="Completed Jobs" value={orders.filter(o => o.closing_status === 'Closed').length} icon={CheckCircle2} color="text-emerald-400" />
          <MetricSmall label="Conversion Rate" value={`${leads.length ? Math.round((proposals.filter(p => p.status === 'Aprobada').length / leads.length) * 100) : 0}%`} icon={TrendingUp} color="text-pink-400" />
        </div>
      </ResponsiveLayout>
    </PageTransition>
  );
}

function MetricSmall({ label, value, icon: Icon, color }: any) {
  return (
    <Card className="glass-card border-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
    </Card>
  );
}

import { useMemo } from "react";
