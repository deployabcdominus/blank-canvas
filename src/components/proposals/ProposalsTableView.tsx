import { Proposal, ProposalStatus } from "@/contexts/ProposalsContext";
import { usePayments } from "@/contexts/PaymentsContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit2, Trash2, Factory, DollarSign } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<ProposalStatus, string> = {
  Borrador: "bg-muted/30 text-muted-foreground border-border/30",
  "Enviada externamente": "bg-primary/10 text-primary border-primary/20",
  Aprobada: "bg-mint/15 text-mint border-mint/25",
  Rechazada: "bg-destructive/10 text-destructive border-destructive/20",
};

interface Props {
  proposals: Proposal[];
  onEdit?: (p: Proposal) => void;
  onDelete?: (id: string) => void;
  onCreateOrder?: (p: Proposal) => void;
  onRegisterPayment?: (p: Proposal) => void;
  companyData?: { name: string; logo_url?: string | null } | null;
}

export function ProposalsTableView({ proposals, onEdit, onDelete, onCreateOrder, onRegisterPayment }: Props) {
  const { getTotalPaidForProposal } = usePayments();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <div className="glass-card rounded-2xl overflow-hidden border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-xs font-medium text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Proyecto</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground text-right">Monto</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Estado</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground">Creada</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proposals.map(p => {
              const isApproved = p.status === "Aprobada";
              return (
                <TableRow key={p.id} className="group border-border/30 hover:bg-accent/30 transition-colors cursor-pointer" onClick={() => onEdit?.(p)}>
                  <TableCell className="text-sm font-medium">{p.client}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.project}</TableCell>
                  <TableCell className="text-sm font-bold text-right">${p.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[p.status] || ""}`}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(p.createdAt).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); onEdit(p); }}>
                            <Edit2 className="w-3.5 h-3.5 mr-2" /> Editar
                          </DropdownMenuItem>
                        )}
                        {isApproved && onCreateOrder && !p.hasOrder && (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); onCreateOrder(p); }}>
                            <Factory className="w-3.5 h-3.5 mr-2" /> Crear Orden
                          </DropdownMenuItem>
                        )}
                        {isApproved && p.hasOrder && (
                          <DropdownMenuItem disabled className="text-zinc-600 opacity-60">
                            <Factory className="w-3.5 h-3.5 mr-2" /> Orden Generada
                          </DropdownMenuItem>
                        )}
                        {isApproved && onRegisterPayment && (
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); onRegisterPayment(p); }}>
                            <DollarSign className="w-3.5 h-3.5 mr-2" /> Registrar Pago
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem className="text-destructive" onClick={e => { e.stopPropagation(); onDelete(p.id); }}>
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
