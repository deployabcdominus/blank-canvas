import { useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  ChevronRight,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  Briefcase
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
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-primary/50 transition-all duration-300 rounded-2xl shadow-xl shadow-violet-950/20 overflow-hidden flex flex-col">
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-primary/20 border border-primary/20">
                <span className="text-[11px] font-bold text-primary">{step}</span>
                <div className="absolute inset-0 rounded-xl bg-primary/20 blur-sm" />
              </div>
              <h3 className="font-bold text-lg text-white">{title}</h3>
            </div>
            <Badge 
              variant="outline" 
              className={
                badgeVariant === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                badgeVariant === "warning" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                "bg-sky-500/10 text-sky-400 border-sky-500/20"
              }
            >
              {badge}
            </Badge>
          </div>
          
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{subtitle}</p>
          
          <div className="flex-1 min-h-[140px] relative rounded-xl overflow-hidden border border-white/[0.05] bg-black/20">
            {preview}
          </div>
        </div>
        
        <div className="p-6 pt-0 mt-auto">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 font-semibold"
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
      className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.05] p-5 rounded-2xl flex flex-col gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">{label}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black text-white tracking-tight">{value}</span>
        {delta !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${delta === 0 ? "text-zinc-500" : isUp ? "text-emerald-400" : "text-red-400"}`}>
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
    <div className="space-y-8 pb-12 relative">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-fuchsia-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-8 md:p-10 mb-2 rounded-3xl"
      >
        <div className="relative z-10">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2"
          >
            {t.auth.login.welcomeBack}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">{userName ? userName.split(' ')[0] : ''}</span> 👋
          </motion.h2>
          <p className="text-zinc-500 text-sm font-medium">
             {((t.seo as any)?.title || "SignFlow").split('|')[0]} • Resumen de operación actual
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.08] to-transparent rounded-3xl" />
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModuleCard 
          step={1}
          title={t.nav.leads}
          subtitle="Gestiona tu pipeline de ventas. Califica y convierte nuevos prospectos."
          badge="Activo"
          badgeVariant="success"
          cta={leads.length > 0 ? "Ver Leads" : "Crear Lead"}
          onClick={() => navigate(leads.length > 0 ? '/leads' : '/leads?new=true')}
          delay={0.1}
          preview={
            <div className="w-full space-y-1 p-3">
              {leads.slice(0, 3).map((l: any) => (
                <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-xs text-zinc-300 font-medium">{l.company || l.name}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
          }
        />
        
        <ModuleCard 
          step={2}
          title={t.nav.production}
          subtitle="Monitoreo en tiempo real. Calidad y plazos bajo control."
          badge="En Progreso"
          badgeVariant="warning"
          cta="Ver Producción"
          onClick={() => navigate('/work-orders')}
          delay={0.2}
          preview={
            <div className="grid grid-cols-2 gap-2 p-3 h-full">
              {[
                { label: 'Activas', val: stats.production, color: 'text-white' },
                { label: 'A Tiempo', val: '92%', color: 'text-emerald-400' },
                { label: 'Listas', val: '14', color: 'text-sky-400' },
                { label: 'Promedio', val: '4.2d', color: 'text-zinc-300' }
              ].map(s => (
                <div key={s.label} className="bg-white/[0.03] border border-white/[0.05] p-2 rounded-xl flex flex-col justify-center items-center">
                  <span className={`text-lg font-black ${s.color}`}>{s.val}</span>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">{s.label}</span>
                </div>
              ))}
            </div>
          }
        />
        
        <ModuleCard 
          step={3}
          title={t.nav.fieldServices}
          subtitle="Instalaciones y logística. Visibilidad total en campo."
          badge="Programado"
          badgeVariant="info"
          cta="Ver Instalaciones"
          onClick={() => navigate('/installation')}
          delay={0.3}
          preview={
            <div className="w-full h-full flex flex-col p-3 gap-2">
              <div className="flex-1 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/[0.05]">
                <MapPin className="text-zinc-700 w-8 h-8" />
              </div>
              <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest">4 instalaciones hoy</p>
            </div>
          }
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricItem label="Total Leads" value={leads.length} delta={12} icon={Users} delay={0.4} />
        <MetricItem label="En Producción" value={stats.production} delta={-5} icon={Layers} delay={0.5} />
        <MetricItem label="Ventas Mensual" value={`$${(stats.sales / 1000).toFixed(1)}k`} delta={22} icon={DollarSign} delay={0.6} />
        <MetricItem label="Instalaciones" value={stats.installations} delta={0} icon={MapPin} delay={0.7} />
      </div>

      {/* Tip */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="glass-card border-primary/20 p-5 rounded-2xl flex items-center justify-between"
      >
        <div className="flex items-center gap-3 text-sm text-zinc-300">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <span>Configura tu dominio personalizado para profesionalizar tu marca.</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings?tab=domain')} className="text-primary hover:text-primary">
          Configurar
        </Button>
      </motion.div>
    </div>
  );
}