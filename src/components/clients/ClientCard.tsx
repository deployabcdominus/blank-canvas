import { useNavigate } from "react-router-dom";
import { Client } from "@/contexts/ClientsContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientAvatar } from "./ClientAvatar";
import { Mail, Phone, FolderOpen, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_COLORS: Record<string, string> = {
  Lead: 'bg-soft-blue/20 text-soft-blue border-soft-blue/30',
  Proposal: 'bg-lavender/20 text-lavender border-lavender/30',
  Production: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Installation: 'bg-pale-pink/20 text-pale-pink border-pale-pink/30',
  Completed: 'bg-mint/20 text-mint border-mint/30',
};

interface ClientCardProps {
  client: Client;
  stats: { total: number; byStatus: Record<string, number> } | undefined;
  index: number;
  isAdmin: boolean;
  onEdit: (c: Client) => void;
  onDelete: (id: string) => void;
}

export function ClientCard({ client: c, stats, index, isAdmin, onEdit, onDelete }: ClientCardProps) {
  const navigate = useNavigate();
  const projectCount = stats?.total || 0;
  const statusEntries = stats ? Object.entries(stats.byStatus) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card
        className="glass-card hover:shadow-2xl transition-all duration-300 group overflow-hidden relative rounded-3xl hover:border-soft-blue/40 hover:ring-1 hover:ring-soft-blue/20 cursor-pointer"
        onClick={() => navigate(`/clients/${c.id}`)}
      >
        <div className={`h-1 w-full ${projectCount > 0 ? 'bg-gradient-to-r from-soft-blue to-mint' : 'bg-muted/30'}`} />
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <ClientAvatar name={c.clientName} logoUrl={c.logoUrl} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">{c.clientName}</h3>
              {c.createdAt && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: es })}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(c)}>
                  <Pencil className="w-3.5 h-3.5 mr-2" /> Editar
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem className="text-destructive" onClick={() => onDelete(c.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Contact */}
          <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
            {c.primaryEmail && (
              <p className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0 text-soft-blue" />{c.primaryEmail}
              </p>
            )}
            {c.primaryPhone && (
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0 text-mint" />{c.primaryPhone}
              </p>
            )}
          </div>

          {/* Projects */}
          <div className="border-t border-border/50 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" /> Proyectos
              </span>
              <Badge variant="secondary" className="text-xs font-semibold px-2 py-0">{projectCount}</Badge>
            </div>
            {statusEntries.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {statusEntries.map(([status, count]) => (
                  <Badge key={status} variant="outline" className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[status] || ''}`}>
                    {count} {status}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground/60 italic">Sin proyectos aún</p>
            )}
          </div>

          {c.notes && (
            <p className="text-[11px] text-muted-foreground/70 line-clamp-1 mt-3 border-t border-border/30 pt-2 italic">{c.notes}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
