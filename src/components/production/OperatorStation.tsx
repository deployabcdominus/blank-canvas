import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkerStatsQuery } from "@/hooks/queries/useWorkerStatsQuery";
import { useProductionStepsQuery } from "@/hooks/queries/useProductionStepsQuery";
import { Check, Flame, Zap, Filter, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

const getDepartments = (isEn: boolean) => [
  { value: "all", label: isEn ? "All" : "Todos", icon: "🏭" },
  { value: "cnc", label: "CNC", icon: "⚙️" },
  { value: "electrical", label: isEn ? "Electrical" : "Eléctrico", icon: "⚡" },
  { value: "graphics", label: isEn ? "Graphics" : "Gráficos", icon: "🎨" },
  { value: "qa", label: isEn ? "Quality" : "Calidad", icon: "✅" },
  { value: "general", label: "General", icon: "📋" },
];

const PRIORITY_BADGE: Record<string, string> = {
  urgente: "bg-red-500/15 text-red-400 border-red-500/30",
  alta: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  media: "bg-primary/10 text-primary border-primary/20",
  baja: "bg-muted text-muted-foreground border-border",
};

const getToasts = (isEn: boolean) => [
  { emoji: "🔥", msg: isEn ? "Unstoppable! The admin already saw it on the dashboard" : "¡Imparable! El admin ya lo vio en el dashboard" },
  { emoji: "💪", msg: isEn ? "Task crushed! The workshop needs you" : "¡Tarea aplastada! El taller te necesita" },
  { emoji: "⚡", msg: isEn ? "Lightning fast! Are you human or robot?" : "¡Rapidísimo! ¿Eres humano o robot?" },
  { emoji: "🏆", msg: isEn ? "One step closer to Friday's free lunch!" : "¡Un paso más al almuerzo gratis del viernes!" },
  { emoji: "🎯", msg: isEn ? "Perfect! No errors, that's how it's done" : "¡Perfecto! Sin errores, así se hace" },
];

function Confetti({ active }: { active: boolean }) {
  const colors = ["#7C3AED", "#A78BFA", "#16A34A", "#F59E0B", "#14B8A6", "#EC4899"];
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${15 + Math.random() * 70}%`,
          top: `${15 + Math.random() * 30}%`,
          width: `${6 + Math.random() * 10}px`,
          height: `${6 + Math.random() * 10}px`,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          background: colors[Math.floor(Math.random() * colors.length)],
          animation: `confettiFall ${0.8 + Math.random() * 0.7}s ease-out ${Math.random() * 0.3}s forwards`,
        }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-30px) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(250px) rotate(720deg) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function OperatorStation() {
  const { companyId } = useUserRole();
  const { user } = useAuth();
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const DEPARTMENTS = getDepartments(isEn);
  const TOASTS = getToasts(isEn);
  const { data: stats } = useWorkerStatsQuery(user?.id, companyId);
  const { steps: tasks, startTaskMutation, completeTaskMutation } = useProductionStepsQuery(companyId, user?.id);
  const [department, setDepartment] = useState("all");
  const [userName, setUserName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("full_name").eq("id", user.id).single().then(({ data }) => {
        setUserName(data?.full_name?.split(" ")[0] ?? "Operario");
      });
    }
  }, [user]);

  const startTask = async (taskId: string) => {
    startTaskMutation.mutate(taskId);
  };

  const completeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    await completeTaskMutation.mutateAsync({ taskId, startedAt: task?.started_at });

    setCompletedCount(c => c + 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
    const t = TOASTS[completedCount % TOASTS.length];
    toast(t.msg, { icon: t.emoji, duration: 3000 });
  };

  const filtered = department === "all" ? tasks : tasks.filter(t => t.department === department);
  const xpPct = stats ? Math.round(((stats.xp_today % 500) / 500) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 pb-20">
      <Confetti active={showConfetti} />

      {/* Header Card */}
      <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-black text-foreground">{isEn ? `Hey, ${userName}! 🤙` : `¡Buenas, ${userName}! 🤙`}</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                {isEn ? "Level" : "Nivel"} {stats?.level ?? 1} · {stats?.level_title ?? (isEn ? "Apprentice" : "Aprendiz")}
              </span>
              <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full">
                {stats?.tasks_today ?? 0} {isEn ? "today ✅" : "hoy ✅"}
              </span>
            </div>
          </div>
          <div className="text-center bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
            <div className="text-2xl font-black text-amber-400 flex items-center gap-1">
              <Flame size={20} /> {stats?.streak_days ?? 0}
            </div>
            <div className="text-[10px] font-bold text-amber-500/70 uppercase">{isEn ? "streak" : "racha"}</div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-muted-foreground flex items-center gap-1"><Zap size={12} /> XP</span>
            <span className="font-bold text-primary">{stats?.xp_today ?? 0} / 500</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-700" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>

      {/* Department Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {DEPARTMENTS.map(d => (
          <button
            key={d.value}
            onClick={() => setDepartment(d.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              department === d.value
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-card/60 text-muted-foreground border border-border hover:border-primary/30"
            }`}
          >
            <span>{d.icon}</span> {d.label}
          </button>
        ))}
      </div>

      {/* Task Count */}
      <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Filter size={14} />
        {filtered.length === 0
          ? (isEn ? "🎉 All done! You're the MVP 🏆" : "🎉 ¡Todo listo! Eres el MVP 🏆")
          : isEn
            ? `${filtered.length} pending task${filtered.length !== 1 ? "s" : ""}`
            : `${filtered.length} tarea${filtered.length !== 1 ? "s" : ""} pendiente${filtered.length !== 1 ? "s" : ""}`}
      </div>

      {/* Task Cards */}
      {filtered.map(task => (
        <div
          key={task.id}
          className={`rounded-2xl border-2 p-5 bg-card/70 backdrop-blur-xl transition-all duration-300 ${
            task.status === "in_progress"
              ? "border-primary/40 shadow-lg shadow-primary/5"
              : task.order_priority === "urgente"
              ? "border-red-500/30 shadow-lg shadow-red-500/5"
              : task.order_priority === "alta"
              ? "border-amber-500/20"
              : "border-border"
          }`}
        >
          {/* Top row: Company + Priority */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Building2 size={13} />
              <span className="truncate max-w-[200px]">{task.order_client}</span>
            </div>
            <Badge className={`text-[10px] font-bold border ${PRIORITY_BADGE[task.order_priority] || PRIORITY_BADGE.media}`}>
              {task.order_priority?.toUpperCase()}
            </Badge>
          </div>

          {/* Task name */}
          <h2 className="text-xl font-black text-foreground mb-1 leading-tight">{task.name}</h2>

          {/* Department badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
              {DEPARTMENTS.find(d => d.value === task.department)?.icon} {DEPARTMENTS.find(d => d.value === task.department)?.label || task.department}
            </span>
            {task.order_project && (
              <span className="text-xs text-muted-foreground truncate">{task.order_project}</span>
            )}
          </div>

          {task.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{task.description}</p>
          )}
          {task.tip && (
            <div className="bg-muted/50 rounded-xl p-3 text-sm text-muted-foreground italic mb-4 border border-border">
              💡 {task.tip}
            </div>
          )}

          {/* Action Button */}
          {task.status === "in_progress" ? (
            <button
              onClick={() => completeTask(task.id)}
              className="w-full py-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 transition-all duration-150"
            >
              <Check size={24} /> {isEn ? "COMPLETED!" : "¡COMPLETADO!"}
            </button>
          ) : (
            <button
              onClick={() => startTask(task.id)}
              className="w-full py-5 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.98] text-primary-foreground font-black text-xl flex items-center justify-center gap-3 shadow-lg shadow-primary/25 transition-all duration-150"
            >
              ▶️ {isEn ? "START" : "EMPEZAR"}
            </button>
          )}
        </div>
      ))}

      {filtered.length === 0 && tasks.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <div className="text-5xl">☕</div>
          <div className="text-lg font-bold text-foreground">{isEn ? "You have no assigned tasks" : "No tienes tareas asignadas"}</div>
          <div className="text-sm text-muted-foreground">{isEn ? "Talk to your admin to get stages assigned to you" : "Habla con tu admin para que te asigne etapas"}</div>
        </div>
      )}
    </div>
  );
}
