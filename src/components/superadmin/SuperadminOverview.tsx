import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DollarSign, Building, TrendingUp, Database, Eye, Activity,
  ArrowUpRight, Plus, UserPlus, Users, Loader2,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/* ── Types ── */
interface Company { id: string; name: string; is_active: boolean; created_at: string; }
interface CompanyUser { id: string; role: string; }

interface PlatformHealth {
  total_revenue: number;
  active_tenants: number;
  conversion_rate: number;
  total_records: number;
  total_leads: number;
  approved_proposals: number;
  growth_data: { date: string; leads: number; orders: number }[];
  top_tenants: {
    id: string; name: string; logo_url: string | null;
    created_at: string; is_active: boolean;
    user_count: number; total_revenue: number; order_count: number;
  }[];
  recent_activity: {
    id: string; actor_id: string; action_type: string;
    target_name: string | null; details: Record<string, any> | null;
    created_at: string;
  }[];
}

interface Props {
  companies: Company[];
  allUsers: CompanyUser[];
  setTab: (tab: string) => void;
  onSelectCompany: (company: any) => void;
  setShowCreateCompany: (v: boolean) => void;
}

/* ── Action label map ── */
const ACTION_LABELS: Record<string, { label: string; emoji: string }> = {
  USER_CREATED: { label: "Nuevo usuario creado", emoji: "👤" },
  USER_DELETED: { label: "Usuario eliminado", emoji: "🗑️" },
  USER_TOGGLED: { label: "Estado de usuario cambiado", emoji: "🔄" },
  ROLE_CHANGED: { label: "Rol actualizado", emoji: "🛡️" },
  PASSWORD_RESET: { label: "Contraseña reseteada", emoji: "🔑" },
  COMPANY_CREATED: { label: "Nueva empresa registrada", emoji: "🏢" },
  COMPANY_DELETED: { label: "Empresa eliminada", emoji: "❌" },
  COMPANY_UPDATED: { label: "Empresa editada", emoji: "✏️" },
};

/* ── Formatters ── */
const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
const fmtNumber = (n: number) => new Intl.NumberFormat("en-US").format(n);
const safeFmt = (dateStr: string, fmt: string) => {
  try { return format(parseISO(dateStr), fmt, { locale: es }); }
  catch { return String(dateStr).slice(0, 10); }
};

/* ── Custom tooltip ── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-900/95 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.dataKey === "leads" ? "Leads" : "Órdenes"}: {p.value}
        </p>
      ))}
    </div>
  );
};

export function SuperadminOverview({ companies, allUsers, setTab, onSelectCompany, setShowCreateCompany }: Props) {
  const [health, setHealth] = useState<PlatformHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_platform_health" as any);
      if (error) throw error;
      setHealth(data as unknown as PlatformHealth);
    } catch (e) {
      console.error("Platform health error:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  /* ── KPI Cards Config ── */
  const kpis = health ? [
    {
      label: "Total Revenue",
      value: fmtCurrency(health.total_revenue),
      icon: DollarSign,
      accent: "text-emerald-400",
      bg: "from-emerald-500/10 to-emerald-500/5",
    },
    {
      label: "Active Tenants",
      value: fmtNumber(health.active_tenants),
      icon: Building,
      accent: "text-primary",
      bg: "from-primary/10 to-primary/5",
    },
    {
      label: "Conversion Rate",
      value: `${health.conversion_rate}%`,
      icon: TrendingUp,
      accent: "text-sky-400",
      bg: "from-sky-500/10 to-sky-500/5",
    },
    {
      label: "System Records",
      value: fmtNumber(health.total_records),
      icon: Database,
      accent: "text-violet-400",
      bg: "from-violet-500/10 to-violet-500/5",
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!health) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Error cargando métricas de plataforma.
      </div>
    );
  }

  /* Chart data formatting */
  const chartData = (health.growth_data || []).map(d => {
    let label: string;
    try {
      label = format(parseISO(d.date), "d MMM", { locale: es });
    } catch {
      label = String(d.date).slice(5);
    }
    return { ...d, label };
  });

  /* Top tenants sorted by revenue */
  const topTenants = health.top_tenants;

  return (
    <div className="space-y-6">
      {/* ── KPI Bento Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="glass-card border-white/[0.06] overflow-hidden relative group hover:border-white/[0.12] transition-all">
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bg} opacity-60`} />
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <kpi.icon className={`w-5 h-5 ${kpi.accent}`} />
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors" />
                </div>
                <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => { setTab("companies"); setTimeout(() => setShowCreateCompany(true), 100); }} variant="outline" size="sm" className="gap-1.5 glass">
          <Plus className="w-3.5 h-3.5" /> Nueva empresa
        </Button>
        <Button onClick={() => setTab("provisioning")} variant="outline" size="sm" className="gap-1.5 glass">
          <UserPlus className="w-3.5 h-3.5" /> Provisionar usuario
        </Button>
        <Button onClick={() => setTab("users")} variant="outline" size="sm" className="gap-1.5 glass">
          <Users className="w-3.5 h-3.5" /> Ver usuarios
        </Button>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart — Leads & Orders Growth (30d) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-white/[0.06]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold">Crecimiento — 30 días</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Leads y Órdenes de Trabajo a nivel plataforma</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Leads</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Órdenes</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(24,95%,53%)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(24,95%,53%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152,69%,53%)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(152,69%,53%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,100%,0.04)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "hsl(0,0%,55%)" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(0,0%,55%)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <ReTooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    stroke="hsl(24,95%,53%)"
                    strokeWidth={2}
                    fill="url(#gradLeads)"
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(152,69%,53%)"
                    strokeWidth={2}
                    fill="url(#gradOrders)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar Chart — Top Tenants by Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-white/[0.06] h-full">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-1">Top Tenants</p>
              <p className="text-xs text-muted-foreground mb-4">Por ingresos facturados</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={topTenants.map(t => ({
                    name: t.name.length > 12 ? t.name.slice(0, 12) + "…" : t.name,
                    revenue: t.total_revenue,
                  }))}
                  margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,100%,0.04)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(0,0%,55%)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(0,0%,55%)" }} tickLine={false} axisLine={false} />
                  <ReTooltip
                    contentStyle={{ background: "hsl(0,0%,8%)", border: "1px solid hsl(0,0%,100%,0.08)", borderRadius: 12 }}
                    labelStyle={{ color: "hsl(0,0%,60%)", fontSize: 11 }}
                    formatter={(val: number) => [fmtCurrency(val), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(24,95%,53%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Bottom Row: Top Tenants Table + Activity Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Tenants Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-white/[0.06]">
            <CardContent className="p-0">
              <div className="p-5 pb-3">
                <p className="text-sm font-semibold">Empresas (Tenants)</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ordenadas por ingresos</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/10">
                    <TableHead>Empresa</TableHead>
                    <TableHead className="text-right">Usuarios</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Órdenes</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topTenants.map(t => (
                    <TableRow key={t.id} className="border-border/10 hover:bg-muted/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {t.logo_url ? (
                            <img src={t.logo_url} alt={t.name} className="w-8 h-8 rounded-lg object-contain border border-white/[0.06] bg-white/[0.03]" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.03] flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {t.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{t.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {format(parseISO(t.created_at), "MMM yyyy", { locale: es })}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm">{t.user_count}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{fmtCurrency(t.total_revenue)}</TableCell>
                      <TableCell className="text-right text-sm">{t.order_count}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={t.is_active ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 text-[10px]" : "bg-red-500/15 text-red-400 border-red-500/25 text-[10px]"}>
                          {t.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            onSelectCompany({ id: t.id, name: t.name, is_active: t.is_active, created_at: t.created_at } as any);
                            setTab("companies");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {topTenants.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Sin datos de tenants
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card className="glass-card border-white/[0.06] h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-sm font-semibold">Actividad Global</p>
              </div>
              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {health.recent_activity.map(a => {
                  const cfg = ACTION_LABELS[a.action_type] || { label: a.action_type, emoji: "📋" };
                  return (
                    <div key={a.id} className="flex gap-3 items-start">
                      <span className="text-base mt-0.5 shrink-0">{cfg.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-xs leading-relaxed">
                          <span className="font-medium">{cfg.label}</span>
                          {a.target_name && (
                            <span className="text-muted-foreground"> · {a.target_name}</span>
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                          {format(parseISO(a.created_at), "d MMM, HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {health.recent_activity.length === 0 && (
                  <p className="text-xs text-muted-foreground/50 text-center py-6">Sin actividad reciente</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
