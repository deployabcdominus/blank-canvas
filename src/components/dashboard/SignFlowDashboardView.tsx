import { useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Settings, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  ChevronRight,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  Briefcase,
  User
} from "lucide-react";
import { motion } from "framer-motion";

interface ModuleCardProps {
  step: number;
  title: string;
  subtitle: string;
  badge: string;
  badgeVariant: "success" | "warning" | "info";
  cta: string;
  onClick: () => void;
  preview: React.ReactNode;
  delay?: number;
}

const ModuleCard = ({ step, title, subtitle, badge, badgeVariant, cta, onClick, preview, delay = 0 }: ModuleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="glass-card flex flex-col h-full border-zinc-200/60 hover:border-primary/30 transition-all duration-300 group overflow-hidden rounded-3xl bg-white shadow-xl shadow-zinc-200/20">

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                {step}
              </span>
              <h3 className="font-bold text-lg text-zinc-900 group-hover:text-primary transition-colors">{title}</h3>
            </div>
            <Badge 
              variant="outline" 
              className={
                badgeVariant === "success" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                badgeVariant === "warning" ? "bg-amber-50 text-amber-600 border-amber-200" :
                "bg-sky-50 text-sky-600 border-sky-200"
              }
            >
              {badge}
            </Badge>
          </div>
          
          <p className="text-zinc-500 text-sm mb-6 line-clamp-2">{subtitle}</p>
          
          <div className="flex-1 min-h-[140px] flex items-center justify-center relative">
            {preview}
          </div>
        </div>
        
        <div className="p-5 pt-0 mt-auto">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 font-semibold shadow-lg shadow-primary/20"
            onClick={onClick}
          >
            {cta}
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

interface MetricItemProps {
  label: string;
  value: string | number;
  delta?: number;
  icon: any;
  delay?: number;
}

const MetricItem = ({ label, value, delta, icon: Icon, delay = 0 }: MetricItemProps) => {
  const isUp = delta && delta > 0;
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col gap-1 p-2"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-zinc-100 border border-zinc-200">
          <Icon className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-zinc-900 tracking-tight">{value}</span>
        {delta !== undefined && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold mb-1 ${delta === 0 ? "text-zinc-500" : isUp ? "text-emerald-600" : "text-red-600"}`}>
            {delta === 0 ? <Minus className="w-3 h-3" /> : isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
    </motion.div>
  );
};

export function SignFlowDashboardView({ 
  leads, 
  proposals, 
  orders, 
  installations, 
  payments,
  userName,
  t 
}: any) {
  const navigate = useNavigate();

  // Stats logic
  const stats = useMemo(() => {
    const activeLeadsCount = leads.filter((l: any) => l.status !== "Convertido" && l.status !== "Perdido").length;
    const inProductionCount = orders.filter((o: any) => ["En Producción", "En Progreso", "In Production"].includes(o.status || o.internal_status)).length;
    const salesMonth = payments.filter((p: any) => p.status === 'received').reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
    const activeInstalls = installations.filter((i: any) => i.status !== "Completed").length;
    
    return {
      activeLeads: activeLeadsCount,
      production: inProductionCount,
      sales: salesMonth,
      installations: activeInstalls
    };
  }, [leads, orders, payments, installations]);

  return (
    <div className="space-y-8 pb-12">
      {/* 2. HERO BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] border border-zinc-200/60 p-10 md:p-14 mb-4 bg-white shadow-2xl shadow-zinc-200/30"
      >
        <div className="relative z-10 max-w-3xl">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight mb-6 leading-[1.05]"
          >
            {t.auth.login.welcomeBack}, <span className="text-primary">{userName.split(' ')[0]}</span>! 👋
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-500 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl"
          >
            {t.landing.hero.subtitle}
          </motion.p>
        </div>
        
        {/* Abstract Illustration Decor */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:flex items-center justify-end pr-20 opacity-5 pointer-events-none">
          <Layers className="w-96 h-96 text-primary rotate-12" strokeWidth={0.5} />
        </div>
      </motion.div>

      {/* 3. FEATURE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard 
          step={1}
          title={t.nav.leads}
          subtitle="Captura y califica nuevos prospectos. Mantén tu pipeline de ventas siempre lleno."
          badge="Activo"
          badgeVariant="success"
          cta={leads.length > 0 ? "Gestionar Leads" : "Crear Lead"}
          onClick={() => navigate(leads.length > 0 ? '/leads' : '/leads?new=true')}
          delay={0.1}
          preview={
            <div className="w-full space-y-2 px-2">
              {leads.length > 0 ? leads.slice(0, 3).map((l: any, i: number) => (
                <div key={l.id} className={`flex items-center justify-between p-2.5 rounded-xl border border-zinc-100 bg-zinc-50/50 ${i === 0 ? 'border-primary/20 bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600">
                      {(l.company || l.name || "?")[0]}
                    </div>
                    <span className="text-xs font-semibold text-zinc-800 truncate max-w-[100px]">{l.company || l.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 border-zinc-200 text-zinc-500 bg-white">{l.status}</Badge>
                </div>
              )) : (
                <div className="text-center p-4 border border-dashed border-zinc-200 rounded-xl">
                  <span className="text-[10px] text-zinc-400">No leads found</span>
                </div>
              )}
            </div>
          }
        />
        
        <ModuleCard 
          step={2}
          title={t.nav.production}
          subtitle="Monitorea el progreso en el taller. Asegura la calidad y el cumplimiento de plazos."
          badge="En Progreso"
          badgeVariant="warning"
          cta="Ver Producción"
          onClick={() => navigate('/work-orders')}
          delay={0.2}
          preview={
            <div className="grid grid-cols-2 gap-2 w-full px-2">
              <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl flex flex-col items-center gap-1">
                <span className="text-lg font-black text-zinc-900">{stats.production}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Activas</span>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl flex flex-col items-center gap-1">
                <span className="text-lg font-black text-emerald-600">92%</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">A tiempo</span>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl flex flex-col items-center gap-1">
                <span className="text-lg font-black text-sky-600">14</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Listas</span>
              </div>
              <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl flex flex-col items-center gap-1">
                <span className="text-lg font-black text-zinc-900">4.2d</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Promedio</span>
              </div>
            </div>
          }
        />

        <ModuleCard 
          step={3}
          title={t.nav.execution}
          subtitle="Gestión de instalaciones y entregas. Cierra el ciclo con el cliente satisfecho."
          badge="Publicado"
          badgeVariant="info"
          cta="Agenda Técnica"
          onClick={() => navigate('/dashboard?tab=map')}
          delay={0.3}
          preview={
            <div className="w-full flex flex-col gap-3 px-2">
              <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 p-3 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm border border-zinc-100">
                  <MapPin size={16} />
                </div>
                <div className="flex-1">
                  <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3" />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">Installation Readiness</span>
                    <span className="text-[9px] font-bold text-primary">68%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-around gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-[8px] font-bold text-zinc-500">COMPLETE</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-1">
                    <Clock size={14} />
                  </div>
                  <span className="text-[8px] font-bold text-zinc-500">PENDING</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-1">
                    <Briefcase size={14} />
                  </div>
                  <span className="text-[8px] font-bold text-zinc-500">ONSITE</span>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* 4. STRATEGIC METRICS BAR */}
      <Card className="rounded-[2rem] border-zinc-200/60 p-8 md:p-12 bg-white shadow-2xl shadow-zinc-200/30">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h3 className="text-zinc-900 font-bold text-lg mb-1">{t.dashboard.glance || "Your Business at a Glance"}</h3>
            <p className="text-zinc-500 text-sm">Real-time performance metrics</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 flex-1 max-w-4xl">
            <MetricItem 
              label={t.dashboard.totalLeads || "Total Leads"} 
              value={leads.length} 
              delta={12.4} 
              icon={Users}
              delay={0.4}
            />
            <MetricItem 
              label={t.nav.production} 
              value={stats.production} 
              delta={15.8} 
              icon={Layers}
              delay={0.5}
            />
            <MetricItem 
              label={t.nav.payments} 
              value={`$${stats.sales.toLocaleString()}`} 
              delta={22.7} 
              icon={DollarSign}
              delay={0.6}
            />
            <MetricItem 
              label={t.dashboard.activeProjects || "Active Campaigns"} 
              value={7} 
              delta={4.5}
              icon={TrendingUp}
              delay={0.7}
            />
          </div>
        </div>
      </Card>
      
      {/* 5. BOTTOM CTA / TIP */}
      <div className="flex flex-col md:flex-row items-center justify-between p-8 px-10 rounded-[2rem] bg-zinc-950 text-white shadow-2xl shadow-zinc-400/20 border border-white/5">
        <div className="flex items-center gap-6 mb-6 md:mb-0">
          <div className="p-4 rounded-2xl bg-white/10 ring-1 ring-white/20">
            <TrendingUp size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold text-white mb-1">
              Maximize your conversion rate
            </p>
            <p className="text-zinc-400 text-sm">
              Connect your custom domain to build trust and boost sales performance.
            </p>
          </div>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-[1.2rem] px-10 py-7 text-base font-bold shadow-xl shadow-primary/25">
          Connect Domain
        </Button>
      </div>
    </div>
  );
}
