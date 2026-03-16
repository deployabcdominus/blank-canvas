import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Sparkles, Crown, Loader2, Check } from "lucide-react";
import { STRIPE_TIERS, type StripeTier } from "@/lib/stripe-tiers";

interface Company {
  id: string;
  name: string;
  plan_id: string | null;
  subscription_status: string | null;
  billing_type: string | null;
}

interface Props {
  company: Company | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (companyId: string, planKey: string) => Promise<void>;
}

const PLAN_OPTIONS: { key: StripeTier; icon: React.ElementType; color: string }[] = [
  { key: "start", icon: Zap, color: "text-blue-400" },
  { key: "pro", icon: Sparkles, color: "text-purple-400" },
  { key: "elite", icon: Crown, color: "text-amber-400" },
];

export function ChangePlanModal({ company, open, onOpenChange, onConfirm }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const currentPlan = company?.plan_id || "";

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) setSelected(null);
    onOpenChange(isOpen);
  };

  const handleConfirm = async () => {
    if (!company || !selected || selected === currentPlan) return;
    setSaving(true);
    await onConfirm(company.id, selected);
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md border-purple-500/10 bg-zinc-900/80 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Cambiar Plan — {company?.name}
          </DialogTitle>
          <DialogDescription>
            Selecciona el nuevo plan. Esto se registrará como cambio manual del Superadmin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {PLAN_OPTIONS.map(({ key, icon: Icon, color }) => {
            const tier = STRIPE_TIERS[key];
            const isCurrent = currentPlan === key;
            const isSelected = selected === key;

            return (
              <button
                key={key}
                onClick={() => !isCurrent && setSelected(key)}
                disabled={isCurrent}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
                  isSelected
                    ? "border-purple-500/40 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                    : isCurrent
                      ? "border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? "bg-purple-500/15" : "bg-white/[0.06]"}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? "text-purple-400" : color}`} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{tier.name}</span>
                    <span className="text-xs text-zinc-500">{tier.price}/mes</span>
                    {isCurrent && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-zinc-700 text-zinc-500">
                        Actual
                      </Badge>
                    )}
                  </div>
                </div>
                {isSelected && <Check className="w-5 h-5 text-purple-400" />}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/[0.06]">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={saving || !selected || selected === currentPlan}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-[0_0_16px_rgba(168,85,247,0.25)]"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {saving ? "Guardando..." : "Confirmar Cambio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
