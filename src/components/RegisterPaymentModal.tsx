import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePaymentsQuery } from "@/hooks/queries/usePaymentsQuery";
import { Proposal } from "@/types/domain";
import { toast } from "sonner";
import { DollarSign, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface RegisterPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: Proposal | null;
  companyId: string | null;
}

const METHOD_KEYS: string[] = ['cash', 'zelle', 'card', 'transfer', 'check', 'other'];

export const RegisterPaymentModal = ({ isOpen, onClose, proposal, companyId }: RegisterPaymentModalProps) => {
  const { t } = useLanguage();
  const m = t.registerPaymentModal;

  const { payments, createPaymentMutation } = usePaymentsQuery(companyId);
  const addPayment = (p: any) => createPaymentMutation.mutateAsync(p);
  const getTotalPaidForProposal = (proposalId: string) => {
    return payments
      .filter(p => p.proposalId === proposalId && p.status === 'Completed')
      .reduce((sum, p) => sum + p.amount, 0);
  };
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("transfer");
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
      toast.error(m.amountError);
      return;
    }

    setSubmitting(true);
    try {
      await addPayment({
        proposal_id: proposal.id,
        company_id: companyId!,
        amount: parsed,
        method: method,
        paid_at: paidAt,
        note: note,
        status: 'Completed'
      });
      onClose();
      setAmount("");
      setNote("");
    } catch (err) {
      // Handled by mutation
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden bg-zinc-950 border-white/[0.1] shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <DollarSign className="w-5 h-5 text-primary" />
            {m.title}
          </DialogTitle>
          {!isApproved && (
            <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-amber-200/80 leading-relaxed">
                {m.notApprovedWarning}
              </p>
            </div>
          )}
        </DialogHeader>

        <div className="px-6 py-2 space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{m.totalApproved}</p>
              <p className="text-sm font-bold">${totalApproved.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{m.paid}</p>
              <p className="text-sm font-bold text-green-400">${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{m.balance}</p>
              <p className="text-sm font-bold text-amber-400">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-400">{m.amountLabel}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={!isApproved}
                className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 transition-colors h-11"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-zinc-400">{m.dateLabel}</Label>
              <Input
                type="date"
                value={paidAt}
                onChange={e => setPaidAt(e.target.value)}
                disabled={!isApproved}
                className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 transition-colors h-11"
              />
            </div>
          </div>

          {/* Method */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-400">{m.methodLabel}</Label>
            <Select value={method} onValueChange={v => setMethod(v)} disabled={!isApproved}>
              <SelectTrigger className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 transition-colors h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/[0.1]">
                {METHOD_KEYS.map(key => (
                  <SelectItem key={key} value={key} className="focus:bg-primary/10 focus:text-white">
                    {m.methods[key as keyof typeof m.methods]?.toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-zinc-400">{m.noteLabel}</Label>
            <Textarea
              placeholder={m.notePlaceholder}
              value={note}
              onChange={e => setNote(e.target.value)}
              disabled={!isApproved}
              className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 transition-colors resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="px-6 py-6 mt-2 flex justify-end gap-3 bg-white/[0.02]">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-white/[0.05]"
          >
            {m.cancel}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isApproved || submitting}
            className="bg-primary hover:bg-primary/90 text-white px-8 font-bold shadow-lg shadow-primary/20"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                {m.saving}
              </div>
            ) : m.save}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
