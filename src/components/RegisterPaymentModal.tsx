import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePayments, PaymentMethod } from "@/contexts/PaymentsContext";
import { Proposal } from "@/contexts/ProposalsContext";
import { toast } from "sonner";
import { DollarSign, AlertCircle } from "lucide-react";

interface RegisterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  companyId: string | null;
}

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'zelle', label: 'Zelle' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'check', label: 'Cheque' },
  { value: 'other', label: 'Otro' },
];

export const RegisterPaymentModal = ({ isOpen, onClose, proposal, companyId }: RegisterPaymentModalProps) => {
  const { addPayment, getTotalPaidForProposal } = usePayments();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!proposal) return null;

  const isApproved = proposal.status === 'Aprobada';
  const totalApproved = (proposal as any).approvedTotal ?? proposal.value;
  const totalPaid = getTotalPaidForProposal(proposal.id);
  const balance = totalApproved - totalPaid;

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      toast.error("El monto debe ser mayor a 0");
      return;
    }
    if (!companyId) {
      toast.error("No se encontró la empresa");
      return;
    }
    setSubmitting(true);
    try {
      await addPayment({
        companyId,
        proposalId: proposal.id,
        amount: parsed,
        currency: 'USD',
        method,
        status: 'received',
        paidAt: new Date(paidAt).toISOString(),
        note: note || null,
        createdBy: null,
      });
      toast.success("Pago registrado exitosamente");
      setAmount(""); setNote(""); setMethod("transfer");
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Error al registrar pago");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[480px] p-0 bg-background/90 backdrop-blur-2xl border border-border/30">
        <DialogHeader className="px-6 py-5 border-b border-border/20">
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Registrar Pago
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {!isApproved && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">
                Solo puedes registrar pagos cuando la propuesta esté aprobada.
              </p>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
              <p className="text-[11px] text-muted-foreground mb-1">Total aprobado</p>
              <p className="text-sm font-bold">${totalApproved.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
              <p className="text-[11px] text-muted-foreground mb-1">Pagado</p>
              <p className="text-sm font-bold text-green-400">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border/20">
              <p className="text-[11px] text-muted-foreground mb-1">Saldo</p>
              <p className="text-sm font-bold text-amber-400">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label>Monto del pago *</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={!isApproved}
              className="bg-muted/30"
            />
          </div>

          {/* Method */}
          <div className="space-y-1.5">
            <Label>Método de pago</Label>
            <Select value={method} onValueChange={v => setMethod(v as PaymentMethod)} disabled={!isApproved}>
              <SelectTrigger className="bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label>Fecha de pago</Label>
            <Input
              type="date"
              value={paidAt}
              onChange={e => setPaidAt(e.target.value)}
              disabled={!isApproved}
              className="bg-muted/30"
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label>Nota (opcional)</Label>
            <Textarea
              placeholder="Referencia, número de transacción..."
              value={note}
              onChange={e => setNote(e.target.value)}
              disabled={!isApproved}
              className="bg-muted/30 resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/20 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!isApproved || submitting}>
            {submitting ? "Guardando..." : "Registrar Pago"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
