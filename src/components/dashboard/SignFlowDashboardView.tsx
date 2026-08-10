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
    >
      <Card className="glass-card flex flex-col h-full border-white/[0.08] hover:border-primary/30 transition-all duration-300 group overflow-hidden rounded-2xl">
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-[10px] font-bold border border-primary/20">
                {step}
              </span>
              <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{title}</h3>
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
          
          <p className="text-zinc-400 text-sm mb-6 line-clamp-2">{subtitle}</p>
          
          <div className="flex-1 min-h-[140px] flex items-center justify-center relative">
            {preview}
          </div>
        </div>
        
        <div className="p-5 pt-0 mt-auto">
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
      className="flex flex-col gap-1 p-2"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
          <Icon className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
        {delta !== undefined && (
          <div className={`flex items-center gap-0.5 text-[10px] font-bold mb-1 ${delta === 0 ? "text-zinc-500" : isUp ? "text-emerald-400" : "text-red-400"}`}>
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
      {/* 1. TOPBAR - Handled by ResponsiveLayout + sidebar, but we can add content here if needed or use the Dashboard Header area */}
      
      {/* 2. HERO BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass-card border-white/[0.08] p-8 md:p-10 mb-2"
      >
        <div className="relative z-10 max-w-2xl">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-[1.1]"
          >
            {t.auth.login.welcomeBack}, <span className="text-primary">{userName.split(' ')[0]}</span> 👋
          </motion.h2>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl font-bold text-white/90 mb-3"
          >
            {t.landing.seo.title.split('|')[0]}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-400 text-base md:text-lg font-medium leading-relaxed"
          >
            {t.landing.hero.subtitle}
          </motion.p>
        </div>
        
        {/* Isometric Illustration Decor */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex items-center justify-center pr-10 opacity-20 pointer-events-none">
          <div className="relative w-48 h-48">
            <Layers className="w-full h-full text-primary animate-pulse" strokeWidth={1} />
            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary/10 rounded-full blur-3xl" />
          </div>
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
          cta="Gestionar Leads"
          onClick={() => navigate('/leads')}
          delay={0.1}
          preview={
            <div className="w-full space-y-2 px-2">
              {leads.slice(0, 3).map((l: any, i: number) => (
                <div key={l.id} className={`flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-white/[0.02] ${i === 0 ? 'border-primary/20 bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                      {l.company?.[0] || l.name?.[0]}
                    </div>
                    <span className="text-xs font-semibold text-white truncate max-w-[100px]">{l.company || l.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 border-zinc-700 text-zinc-400">{l.status}</Badge>
                </div>
              ))}
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
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1">
                <span className="text-lg font-black text-white">{stats.production}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Activas</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1">
                <span className="text-lg font-black text-emerald-400">92%</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">A tiempo</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1">
                <span className="text-lg font-black text-sky-400">14</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Listas</span>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col items-center gap-1">
                <span className="text-lg font-black text-white">4.2d</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Promedio</span>
              </div>
            </div>
          }
        />
        
        <ModuleCard 
          step={3}
          title={t.nav.fieldServices}
          subtitle="Gestiona instalaciones y logística. Documenta el éxito de cada entrega."
          badge="Programado"
          badgeVariant="info"
          cta="Ver Instalaciones"
          onClick={() => navigate('/installation')}
          delay={0.3}
          preview={
            <div className="w-full space-y-2 px-2">
              <div className="relative h-24 w-full rounded-xl overflow-hidden border border-white/10 opacity-60">
                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                  <MapPin className="text-zinc-700 w-8 h-8" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-sky-400" /> Hoy: 4 inst.</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3 text-emerald-400" /> 2 equipos</span>
              </div>
            </div>
          }
        />
      </div>

      {/* 4. STATS SUMMARY BAR */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card border-white/[0.08] rounded-3xl p-6 md:p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Tu Negocio de un Vistazo
          </h3>
          <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-semibold p-0" onClick={() => navigate('/reports')}>
            Ver Todo <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <MetricItem 
            label="Total Leads" 
            value={leads.length} 
            delta={12} 
            icon={Users}
            delay={0.5}
          />
          <MetricItem 
            label="En Producción" 
            value={stats.production} 
            delta={-5} 
            icon={Layers}
            delay={0.6}
          />
          <MetricItem 
            label="Ventas del Mes" 
            value={`$${(stats.sales / 1000).toFixed(1)}k`} 
            delta={22} 
            icon={DollarSign}
            delay={0.7}
          />
          <MetricItem 
            label="Instalaciones Activas" 
            value={stats.installations} 
            delta={0} 
            icon={MapPin}
            delay={0.8}
          />
        </div>

        {/* Motivational quote (optional) */}
        <div className="mt-8 pt-8 border-t border-white/[0.04] text-center italic text-zinc-500 text-sm">
          "La disciplina es el puente entre las metas y los logros." — Jim Rohn
        </div>
      </motion.div>

      {/* 5. TIP BANNER */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
        className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 text-sm font-medium text-white">
          <div className="p-2 rounded-full bg-primary/20">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          Pro Tip: Conecta tu dominio personalizado para reforzar tu marca.
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-primary/30 hover:bg-primary/10 text-primary font-bold rounded-lg px-6"
          onClick={() => navigate('/settings?tab=domain')}
        >
          Configurar ahora
        </Button>
      </motion.div>
    </div>
  );
}
