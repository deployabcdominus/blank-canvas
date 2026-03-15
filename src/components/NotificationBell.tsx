import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const typeStyles: Record<string, string> = {
  success: "border-l-emerald-500 bg-emerald-500/5",
  info: "border-l-sky-500 bg-sky-500/5",
  warning: "border-l-amber-500 bg-amber-500/5",
};

const typeIcon: Record<string, string> = {
  success: "🚀",
  info: "📥",
  warning: "⚠️",
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleClick = (n: { id: string; link: string | null; is_read: boolean }) => {
    if (!n.is_read) markAsRead(n.id);
    if (n.link) {
      navigate(n.link);
      setOpen(false);
    }
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
            <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white px-1 animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 border-white/[0.06] bg-zinc-950 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
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

        {/* List */}
        <ScrollArea className="max-h-[340px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Sin notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {notifications.slice(0, 8).map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full text-left px-4 py-3 flex gap-3 items-start transition-colors hover:bg-white/[0.03] border-l-2",
                    n.is_read ? "border-l-transparent opacity-60" : typeStyles[n.type] || "border-l-zinc-600"
                  )}
                >
                  <span className="text-base mt-0.5 flex-shrink-0">
                    {typeIcon[n.type] || "🔔"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm leading-tight", !n.is_read && "font-semibold text-foreground")}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">{formatTime(n.created_at)}</span>
                      {n.link && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      )}
                      {!n.is_read && (
                        <span className="ml-auto">
                          <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
