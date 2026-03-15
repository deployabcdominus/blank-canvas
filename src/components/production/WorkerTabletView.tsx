import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkerStats } from "@/hooks/useProductionSteps";
import { Check, Flame, Zap } from "lucide-react";
import { toast } from "sonner";

const TOASTS = [
  { emoji: "🔥", msg: "¡Imparable! El admin ya lo vio en el dashboard" },
  { emoji: "💪", msg: "¡Tarea aplastada! El taller te necesita" },
  { emoji: "⚡", msg: "¡Rapidísimo! ¿Eres humano o robot?" },
  { emoji: "🏆", msg: "¡Un paso más al almuerzo gratis del viernes!" },
  { emoji: "🎯", msg: "¡Perfecto! Sin errores, así se hace" },
  { emoji: "🤙", msg: "¡Ya casi eres el MVP de la semana!" },
];

function Confetti({ active }: { active: boolean }) {
  const colors = ["#FF5722", "#16A34A", "#818CF8", "#F59E0B", "#14B8A6", "#EC4899"];
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999 }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${20 + Math.random() * 60}%`,
          top: `${20 + Math.random() * 30}%`,
          width: `${6 + Math.random() * 8}px`,
          height: `${6 + Math.random() * 8}px`,
          borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          background: colors[Math.floor(Math.random() * colors.length)],
          animation: `confettiFall ${0.8 + Math.random() * 0.6}s ease-out ${Math.random() * 0.3}s forwards`,
        }} />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(200px) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default function WorkerTabletView() {
  const { companyId } = useUserRole();
  const { user } = useAuth();
  const stats = useWorkerStats();
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [completedCount, setCompletedCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [xp, setXp] = useState(0);
  const XP_MAX = 500;

  const loadTasks = useCallback(async () => {
    if (!user || !companyId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    setUserName(profile?.full_name?.split(" ")[0] ?? "Operario");

    const { data: tasks } = await supabase
      .from("production_steps" as any)
      .select("*")
      .eq("assigned_to", user.id)
      .eq("company_id", companyId)
      .in("status", ["pending", "in_progress"])
      .order("sort_order");

    // Also fetch the related order info
    if (tasks && (tasks as any[]).length > 0) {
      const orderIds = [...new Set((tasks as any[]).map((t: any) => t.production_order_id))];
      const { data: orders } = await supabase
        .from("production_orders")
        .select("id, client, project")
        .in("id", orderIds);
      const orderMap = new Map((orders || []).map(o => [o.id, o]));
      setMyTasks((tasks as any[]).map((t: any) => ({
        ...t,
        order_client: orderMap.get(t.production_order_id)?.client ?? "",
        order_project: orderMap.get(t.production_order_id)?.project ?? "",
      })));
    } else {
      setMyTasks([]);
    }

    if (stats) setXp(stats.xp_today % XP_MAX);
  }, [user, companyId, stats]);

  useEffect(() => {
    loadTasks();
    if (!companyId) return;
    const channel = supabase.channel("my-tablet-tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "production_steps" }, loadTasks)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadTasks, companyId]);

  const completeTask = async (taskId: string) => {
    const now = new Date().toISOString();
    const task = myTasks.find(t => t.id === taskId);
    const minutes = task?.started_at
      ? Math.round((Date.now() - new Date(task.started_at).getTime()) / 60000)
      : 0;

    await supabase.from("production_steps" as any).update({
      status: "completed",
      completed_at: now,
      duration_minutes: minutes,
    } as any).eq("id", taskId);

    // Update worker stats
    if (user && companyId) {
      const { data: existing } = await supabase
        .from("worker_stats" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("company_id", companyId)
        .maybeSingle();

      const today = now.split("T")[0];
      const ex = existing as any;
      const isNewDay = ex?.last_activity_date !== today;
      const LEVEL_TITLES = ["Aprendiz", "Operario", "Técnico", "Especialista", "Experto", "Maestro", "Leyenda del Taller"];
      const newXpTotal = (ex?.xp_total || 0) + 90;
      const newLevel = Math.min(6, Math.floor(newXpTotal / 500));

      await supabase.from("worker_stats" as any).upsert({
        user_id: user.id,
        company_id: companyId,
        xp_today: isNewDay ? 90 : (ex?.xp_today || 0) + 90,
        xp_total: newXpTotal,
        tasks_today: isNewDay ? 1 : (ex?.tasks_today || 0) + 1,
        tasks_week: (ex?.tasks_week || 0) + 1,
        tasks_total: (ex?.tasks_total || 0) + 1,
        streak_days: isNewDay ? (ex?.streak_days || 0) + 1 : (ex?.streak_days || 0),
        last_activity_date: today,
        level: newLevel,
        level_title: LEVEL_TITLES[newLevel],
        updated_at: now,
      } as any);
    }

    setCompletedCount(c => c + 1);
    setXp(prev => Math.min(XP_MAX, prev + 90));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);

    const t = TOASTS[completedCount % TOASTS.length];
    toast(t.msg, { icon: t.emoji, duration: 3000 });
  };

  const startTask = async (taskId: string) => {
    await supabase.from("production_steps" as any).update({
      status: "in_progress",
      started_at: new Date().toISOString(),
    } as any).eq("id", taskId);
  };

  const pendingTasks = myTasks.filter(t => t.status !== "completed");
  const xpPct = Math.round((xp / XP_MAX) * 100);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Confetti active={showConfetti} />

      {/* Header */}
      <div className="rounded-2xl bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-foreground">
              ¡Buenas, {userName}! 🤙
            </h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                Nivel {stats?.level ?? 1} · {stats?.level_title ?? "Aprendiz"}
              </span>
              <span className="text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
                {completedCount + (stats?.tasks_today ?? 0)} completadas hoy ✅
              </span>
            </div>
          </div>
          <div className="text-center bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Flame size={24} /> {stats?.streak_days ?? 0}
            </div>
            <div className="text-xs font-bold text-amber-600/70 uppercase tracking-wide">días seguidos</div>
          </div>
        </div>

        {/* XP Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-muted-foreground flex items-center gap-1">
              <Zap size={12} /> XP del día
            </span>
            <span className="font-bold text-primary">{xp} / {XP_MAX} XP</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-700"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task count */}
      <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
        {pendingTasks.length === 0
          ? "🎉 ¡Todo listo por hoy! Eres el MVP 🏆"
          : `${pendingTasks.length} tarea${pendingTasks.length !== 1 ? "s" : ""} pendiente${pendingTasks.length !== 1 ? "s" : ""} — ¡tú puedes! 💪`
        }
      </div>

      {/* Tasks */}
      {myTasks.map(task => (
        <div
          key={task.id}
          className={`rounded-2xl border-2 p-5 bg-card transition-all duration-300 ${
            task.status === "completed"
              ? "border-emerald-500/30 opacity-60"
              : task.status === "in_progress"
              ? "border-primary/40"
              : "border-amber-500/40"
          }`}
          style={{ borderLeft: `5px solid ${task.status === "completed" ? "hsl(var(--chart-2))" : task.status === "in_progress" ? "hsl(var(--primary))" : "#D97706"}` }}
        >
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {task.order_project || "Orden"} · {task.order_client || ""}
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2 leading-tight">
            {task.name}
          </h2>
          {task.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {task.description}
            </p>
          )}
          {task.tip && (
            <div className="bg-muted rounded-xl p-3 text-sm text-muted-foreground italic mb-4">
              💡 {task.tip}
            </div>
          )}

          {task.status === "completed" ? (
            <div className="w-full py-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-lg flex items-center justify-center gap-3">
              <Check size={22} /> ¡Listo! 🎉
            </div>
          ) : task.status === "in_progress" ? (
            <button
              onClick={() => completeTask(task.id)}
              className="w-full py-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/30 transition-all duration-150"
            >
              <span className="text-2xl">✅</span> ¡YA TERMINÉ ESTO!
            </button>
          ) : (
            <button
              onClick={() => startTask(task.id)}
              className="w-full py-5 rounded-xl bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-black text-xl flex items-center justify-center gap-3 shadow-lg transition-all duration-150"
            >
              <span className="text-2xl">▶️</span> EMPEZAR TAREA
            </button>
          )}
        </div>
      ))}

      {pendingTasks.length === 0 && myTasks.length > 0 && (
        <div className="text-center py-8 space-y-2">
          <div className="text-5xl">🏆</div>
          <div className="text-xl font-black text-foreground">¡Champeón del día!</div>
          <div className="text-sm text-muted-foreground">El almuerzo del viernes huele a tuyo 🍕</div>
        </div>
      )}

      {myTasks.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <div className="text-5xl">☕</div>
          <div className="text-lg font-bold text-foreground">No tienes tareas asignadas</div>
          <div className="text-sm text-muted-foreground">Habla con tu admin para que te asigne etapas de producción</div>
        </div>
      )}
    </div>
  );
}
