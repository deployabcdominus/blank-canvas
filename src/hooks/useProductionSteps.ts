import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/contexts/AuthContext";
import { Database } from "@/integrations/supabase/types";

export type ProductionStep = Database['public']['Tables']['production_steps']['Row'];
export type WorkerStats = Database['public']['Tables']['worker_stats']['Row'];

const LEVEL_TITLES = [
  "Aprendiz", "Operario", "Técnico", "Especialista",
  "Experto", "Maestro", "Leyenda del Taller"
];

const XP_PER_TASK = 90;
const XP_TO_NEXT_LEVEL = 500;

export function useProductionSteps(orderId?: string) {
  const { companyId } = useUserRole();
  const { user } = useAuth();
  const [steps, setSteps] = useState<ProductionStep[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSteps = useCallback(async () => {
    if (!orderId || !companyId) return;
    const { data } = await supabase
      .from("production_steps")
      .select("*")
      .eq("production_order_id", orderId)
      .eq("company_id", companyId)
      .order("sort_order");
    if (data) setSteps(data);
    setLoading(false);
  }, [orderId, companyId]);

  useEffect(() => {
    fetchSteps();
    if (!orderId) return;
    const channel = supabase
      .channel(`steps-${orderId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "production_steps",
        filter: `production_order_id=eq.${orderId}`
      }, fetchSteps)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId, fetchSteps]);

  const startStep = async (stepId: string) => {
    await supabase.from("production_steps").update({
      status: "in_progress",
      started_at: new Date().toISOString(),
    }).eq("id", stepId);
  };

  const [syncing, setSyncing] = useState(false);

  const completeStep = async (stepId: string) => {
    const now = new Date().toISOString();
    const step = steps.find(s => s.id === stepId);
    if (!step) return;

    setSyncing(true);
    const minutes = step.started_at
      ? Math.round((Date.now() - new Date(step.started_at).getTime()) / 60000)
      : 0;

    const { error } = await supabase.from("production_steps").update({
      status: "completed",
      completed_at: now,
      duration_minutes: minutes,
    }).eq("id", stepId);

    if (!error) {
      // Get the order owner to notify
      const { data: order } = await supabase
        .from('production_orders')
        .select('owner_user_id, client')
        .eq('id', step.production_order_id)
        .single();

      if (order?.owner_user_id && companyId) {
        await supabase.from('notifications' as any).insert({
          user_id: order.owner_user_id,
          company_id: companyId,
          type: 'success',
          title: 'Etapa Completada',
          message: `La etapa "${step.name}" ha sido completada por un operario.`,
          link: `/work-orders/${step.production_order_id}`
        } as any);
      }
    }

    // Brief delay to let DB triggers cascade progress
    setTimeout(() => setSyncing(false), 1500);

    // Update worker stats
    if (!user || !companyId) return;

    const { data: existing } = await supabase
      .from("worker_stats")
      .select("*")
      .eq("user_id", user.id)
      .eq("company_id", companyId)
      .maybeSingle();

    const today = new Date().toISOString().split("T")[0];
    const ex = existing;
    const isNewDay = ex?.last_activity_date !== today;
    const newTasksToday = isNewDay ? 1 : (ex?.tasks_today || 0) + 1;
    const newXpToday = isNewDay ? XP_PER_TASK : (ex?.xp_today || 0) + XP_PER_TASK;
    const newXpTotal = (ex?.xp_total || 0) + XP_PER_TASK;
    const newTasksTotal = (ex?.tasks_total || 0) + 1;
    const newTasksWeek = (ex?.tasks_week || 0) + 1;
    const newStreak = isNewDay ? (ex?.streak_days || 0) + 1 : (ex?.streak_days || 0);
    const newLevel = Math.min(6, Math.floor(newXpTotal / XP_TO_NEXT_LEVEL));

    await supabase.from("worker_stats").upsert({
      user_id: user.id,
      company_id: companyId,
      xp_today: newXpToday,
      xp_total: newXpTotal,
      tasks_today: newTasksToday,
      tasks_week: newTasksWeek,
      tasks_total: newTasksTotal,
      streak_days: newStreak,
      last_activity_date: today,
      level: newLevel,
      level_title: LEVEL_TITLES[newLevel],
      updated_at: now,
    });
  };

  const addStep = async (step: { name: string; description?: string; tip?: string; assigned_to?: string; assigned_name?: string; sort_order: number }) => {
    if (!orderId || !companyId) return;
    await supabase.from("production_steps").insert({
      production_order_id: orderId,
      company_id: companyId,
      ...step,
    });
  };

  const progress = steps.length > 0
    ? Math.round((steps.filter(s => s.status === "completed").length / steps.length) * 100)
    : 0;

  return { steps, loading, syncing, startStep, completeStep, addStep, progress, fetchSteps };
}

export function useWorkerStats() {
  const { companyId } = useUserRole();
  const { user } = useAuth();
  const [stats, setStats] = useState<WorkerStats | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user || !companyId) return;
    const { data } = await supabase
      .from("worker_stats")
      .select("*")
      .eq("user_id", user.id)
      .eq("company_id", companyId)
      .maybeSingle();
    if (data) setStats(data);
  }, [user, companyId]);

  useEffect(() => {
    fetchStats();
    if (!companyId) return;
    const channel = supabase
      .channel("my-worker-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "worker_stats" }, fetchStats)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchStats, companyId]);

  return stats;
}

export function useLeaderboard() {
  const { companyId } = useUserRole();
  const [board, setBoard] = useState<(WorkerStats & { full_name: string })[]>([]);

  const fetchBoard = useCallback(async () => {
    if (!companyId) return;
    const { data } = await supabase
      .from("worker_stats")
      .select("*")
      .eq("company_id", companyId)
      .order("tasks_week", { ascending: false })
      .limit(10);

    if (!data) return;

    // Fetch profile names separately
    const userIds = data.map(d => d.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map(p => [p.id, p.full_name]));
    setBoard(data.map(d => ({
      ...d,
      full_name: profileMap.get(d.user_id) || "Operario",
    })));
  }, [companyId]);

  useEffect(() => {
    fetchBoard();
    if (!companyId) return;
    const channel = supabase
      .channel("leaderboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "worker_stats" }, fetchBoard)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchBoard, companyId]);

  return board;
}
