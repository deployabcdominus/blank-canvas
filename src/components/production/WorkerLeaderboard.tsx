import { useLeaderboard } from "@/hooks/useProductionSteps";
import { Trophy, Flame } from "lucide-react";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function WorkerLeaderboard() {
  const board = useLeaderboard();

  if (board.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <Trophy size={24} className="text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No hay actividad en el leaderboard aún</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-2">
        <Trophy size={18} className="text-amber-500" />
        <h3 className="font-black text-foreground">Leaderboard del taller</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        El que más tareas completa esta semana gana el almuerzo del viernes 🍕
      </p>
      <div className="space-y-2">
        {board.map((entry, i) => (
          <div key={entry.user_id} className={`flex items-center gap-3 p-3 rounded-xl ${i === 0 ? "bg-amber-500/10 border border-amber-500/20" : "bg-muted/50"}`}>
            <span className="text-xl w-7 text-center">{MEDALS[i] ?? `${i + 1}`}</span>
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-black text-primary flex-shrink-0">
              {(entry.full_name ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-foreground truncate">{entry.full_name ?? "Operario"}</div>
              <div className="text-xs text-muted-foreground">Nivel {entry.level} · {entry.level_title}</div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden mt-1">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full" style={{ width: `${Math.min(100, Math.round((entry.tasks_week / 25) * 100))}%` }} />
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-black text-foreground">{entry.tasks_week} ✅</div>
              <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                <Flame size={10} className="text-amber-500" /> {entry.streak_days}d
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
