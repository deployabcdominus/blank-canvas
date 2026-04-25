import { motion } from "framer-motion";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeeklyReportQuery } from "@/hooks/queries/useWeeklyReportQuery";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  ArrowRightLeft,
  DollarSign,
  Trash2,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" /> 0%
      </span>
    );
  }
  if (previous === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400">
        <TrendingUp className="h-3 w-3" /> New
      </span>
    );
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400">
        <TrendingUp className="h-3 w-3" /> +{pct}%
      </span>
    );
  }
  if (pct < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-rose-400">
        <TrendingDown className="h-3 w-3" /> {pct}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Minus className="h-3 w-3" /> 0%
    </span>
  );
}

export function WeeklyReport() {
  const { companyId, isAdmin } = useUserRole();
  const { t } = useLanguage();
  
  const { data, isLoading: loading } = useWeeklyReportQuery(companyId, isAdmin);


  if (!isAdmin) return null;
  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </CardContent>
      </Card>
    );
  }
  if (!data) return null;

  const metrics = [
    {
      label: t.weeklyReport.newLeads,
      current: data.current.new_leads,
      previous: data.previous.new_leads,
      icon: Users,
      color: "text-[hsl(var(--accent-brand))]",
    },
    {
      label: t.weeklyReport.converted,
      current: data.current.converted,
      previous: data.previous.converted,
      icon: ArrowRightLeft,
      color: "text-[hsl(var(--color-info))]",
    },
    {
      label: t.weeklyReport.revenue,
      current: data.current.revenue,
      previous: data.previous.revenue,
      icon: DollarSign,
      color: "text-[hsl(var(--color-success))]",
      isCurrency: true,
    },
    {
      label: t.weeklyReport.lostValue,
      current: data.current.lost_value,
      previous: data.previous.lost_value,
      icon: Trash2,
      color: "text-[hsl(var(--color-warning))]",
      isCurrency: true,
    },
    {
      label: t.weeklyReport.closedOrders,
      current: data.current.closed_orders,
      previous: data.previous.closed_orders,
      icon: CheckCircle2,
      color: "text-[hsl(var(--color-success))]",
    },
  ];

  const chartData = [
    { name: t.weeklyReport.prevWeek, leads: data.previous.new_leads, orders: data.previous.closed_orders, revenue: data.previous.revenue },
    { name: t.weeklyReport.thisWeek, leads: data.current.new_leads, orders: data.current.closed_orders, revenue: data.current.revenue },
  ];

  const fmt = (v: number, isCurrency?: boolean) =>
    isCurrency ? `$${v.toLocaleString()}` : v.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-8"
    >
      <Card className="border-[hsl(var(--accent-brand)/0.15)] bg-[hsl(var(--glass-bg))] backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--accent-brand-light))]">
            <BarChart3 className="h-5 w-5 text-[hsl(var(--accent-brand))]" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              {t.weeklyReport.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {t.weeklyReport.subtitle}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.label}
                  className="rounded-xl border border-[hsl(var(--border-default))] bg-[hsl(var(--surface))] p-3 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`h-4 w-4 ${m.color}`} />
                    <TrendBadge current={m.current} previous={m.previous} />
                  </div>
                  <span className="text-xl font-bold text-foreground">
                    {fmt(m.current, m.isCurrency)}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-tight">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bar chart comparison */}
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={4}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--text-secondary))", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240 6% 10% / 0.95)",
                    border: "1px solid hsl(0 0% 100% / 0.08)",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="leads" name={t.weeklyReport.newLeads} fill="hsl(265 85% 60%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="orders" name={t.weeklyReport.closedOrders} fill="hsl(142 72% 37%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Auto-email notice */}
          <p className="text-[10px] text-muted-foreground mt-3 text-center opacity-60">
            {t.weeklyReport.emailNotice}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
