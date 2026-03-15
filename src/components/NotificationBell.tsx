import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useIndustryLabels } from "@/hooks/useIndustryLabels";
import {
  Bell, CheckCheck, ExternalLink, DollarSign, Clock, User,
  FileText, Wrench, AlertTriangle, Sparkles, Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* ── Icon & style mapping by notification type ── */
const TYPE_CONFIG: Record<string, {
  icon: typeof Bell;
  iconClass: string;
  glowClass: string;
  borderClass: string;
}> = {
  success: {
    icon: Sparkles,
    iconClass: "text-emerald-400",
    glowClass: "shadow-[0_0_8px_rgba(52,211,153,0.3)]",
    borderClass: "border-l-emerald-500",
  },
  info: {
    icon: User,
    iconClass: "text-sky-400",
    glowClass: "shadow-[0_0_8px_rgba(56,189,248,0.3)]",
    borderClass: "border-l-sky-500",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-400",
    glowClass: "shadow-[0_0_8px_rgba(251,191,36,0.3)]",
    borderClass: "border-l-amber-500",
  },
  alert: {
    icon: Clock,
    iconClass: "text-red-400",
    glowClass: "shadow-[0_0_8px_rgba(248,113,113,0.3)]",
    borderClass: "border-l-red-500",
  },
  payment: {
    icon: DollarSign,
    iconClass: "text-emerald-400",
    glowClass: "shadow-[0_0_8px_rgba(52,211,153,0.3)]",
    borderClass: "border-l-emerald-500",
  },
  order: {
    icon: Wrench,
    iconClass: "text-orange-400",
    glowClass: "shadow-[0_0_8px_rgba(251,146,60,0.3)]",
    borderClass: "border-l-orange-500",
  },
  proposal: {
    icon: FileText,
    iconClass: "text-violet-400",
    glowClass: "shadow-[0_0_8px_rgba(167,139,250,0.3)]",
    borderClass: "border-l-violet-500",
  },
};

const getTypeConfig = (type: string) =>
  TYPE_CONFIG[type] || TYPE_CONFIG.info;

type Tab = "recent" | "archived";

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const labels = useIndustryLabels();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("recent");

  const recentNotifications = notifications.filter(n => !n.is_read);
  const archivedNotifications = notifications.filter(n => n.is_read);
  const displayList = tab === "recent" ? recentNotifications : archivedNotifications;

  const handleClick = (n: { id: string; link: string | null; is_read: boolean }) => {
    if (!n.is_read) markAsRead(n.id);
    if (n.link) {
      navigate(n.link);
      setOpen(false);
    }
  };

  /** Replace generic labels with industry-specific ones */
  const localizeMessage = (msg: string) => {
    return msg
      .replace(/\bProyecto\b/g, labels.labelProject)
      .replace(/\bÓrdenes de Servicio\b/g, labels.workOrders);
  };

  const formatTime = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 hover:bg-white/10"
          aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ""}`}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <>
              {/* Ping animation ring */}
              <span className="absolute top-1 right-1 h-4 min-w-[16px] rounded-full bg-orange-500/40 animate-ping" />
              {/* Solid badge */}
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 border border-white/[0.06] bg-zinc-950/80 backdrop-blur-2xl shadow-[0_16px_64px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-0.5 rounded-xl bg-white/[0.04]">
            {(["recent", "archived"] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5",
                  tab === t
                    ? "bg-white/[0.08] text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground/80"
                )}
              >
                {t === "recent" ? (
                  <>
                    <Bell className="w-3 h-3" />
                    Recientes
                    {recentNotifications.length > 0 && (
                      <span className="ml-0.5 text-[10px] bg-orange-500/20 text-orange-400 px-1.5 rounded-full font-semibold">
                        {recentNotifications.length}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Archive className="w-3 h-3" />
                    Archivadas
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="max-h-[360px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {displayList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  {tab === "recent" ? (
                    <>
                      <Bell className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">Todo al día</p>
                      <p className="text-xs mt-1 opacity-60">No hay notificaciones pendientes</p>
                    </>
                  ) : (
                    <>
                      <Archive className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-sm">Sin archivadas</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {displayList.slice(0, 12).map((n, i) => {
                    const config = getTypeConfig(n.type);
                    const Icon = config.icon;
                    return (
                      <motion.button
                        key={n.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => handleClick(n)}
                        className={cn(
                          "w-full text-left px-4 py-3 flex gap-3 items-start transition-colors hover:bg-white/[0.03] border-l-2",
                          n.is_read
                            ? "border-l-transparent opacity-50"
                            : config.borderClass
                        )}
                      >
                        {/* Category icon with glow */}
                        <div className={cn(
                          "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5",
                          n.is_read ? "bg-white/[0.04]" : `bg-white/[0.04] ${config.glowClass}`
                        )}>
                          <Icon className={cn("w-4 h-4", n.is_read ? "text-muted-foreground" : config.iconClass)} strokeWidth={1.5} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className={cn("text-sm leading-tight", !n.is_read && "font-semibold text-foreground")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {localizeMessage(n.message)}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-muted-foreground">{formatTime(n.created_at)}</span>
                            {n.link && (
                              <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
                            )}
                            {!n.is_read && (
                              <span className="ml-auto">
                                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
