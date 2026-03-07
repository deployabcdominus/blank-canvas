import { Users, FileText, CheckCircle, DollarSign } from "lucide-react";
import { Lead } from "@/contexts/LeadsContext";
import { Proposal } from "@/contexts/ProposalsContext";

interface LeadsKPIBarProps {
  leads: Lead[];
  proposals: Proposal[];
  isMobile: boolean;
}

interface KPIItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

export const LeadsKPIBar = ({ leads, proposals, isMobile }: LeadsKPIBarProps) => {
  const leadsWithProposal = leads.filter(l =>
    proposals.some(p => p.leadId === l.id)
  ).length;

  const approvedProposals = proposals.filter(p => p.status === 'Aprobada').length;

  const totalPotentialValue = proposals
    .filter(p => p.status !== 'Rechazada')
    .reduce((sum, p) => sum + p.value, 0);

  const kpis: KPIItem[] = [
    {
      label: "Total Leads",
      value: leads.length,
      icon: <Users className="w-5 h-5 text-soft-blue-foreground" />,
    },
    {
      label: "Con Propuesta",
      value: leadsWithProposal,
      icon: <FileText className="w-5 h-5 text-lavender-foreground" />,
    },
    {
      label: "Aprobadas",
      value: approvedProposals,
      icon: <CheckCircle className="w-5 h-5 text-mint-foreground" />,
    },
    {
      label: "Valor Potencial",
      value: `$${totalPotentialValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-5 h-5 text-pale-pink-foreground" />,
    },
  ];

  return (
    <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="glass-card p-4 flex items-center gap-3 hover:glow-blue transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
            {kpi.icon}
          </div>
          <div>
            <p className="text-2xl font-bold leading-tight">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
