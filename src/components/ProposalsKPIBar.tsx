import { FileText, ExternalLink, CheckCircle, DollarSign } from "lucide-react";
import { Proposal } from "@/contexts/ProposalsContext";

interface ProposalsKPIBarProps {
  proposals: Proposal[];
}

export const ProposalsKPIBar = ({ proposals }: ProposalsKPIBarProps) => {
  const total = proposals.length;
  const sent = proposals.filter(p => p.status === 'Enviada externamente').length;
  const approved = proposals.filter(p => p.status === 'Aprobada').length;
  const activeValue = proposals
    .filter(p => p.status !== 'Rechazada')
    .reduce((sum, p) => sum + p.value, 0);

  const kpis = [
    {
      label: "Total Propuestas",
      value: total,
      icon: <FileText className="w-5 h-5 text-soft-blue-foreground" />,
    },
    {
      label: "Enviadas",
      value: sent,
      icon: <ExternalLink className="w-5 h-5 text-lavender-foreground" />,
    },
    {
      label: "Aprobadas",
      value: approved,
      icon: <CheckCircle className="w-5 h-5 text-mint-foreground" />,
    },
    {
      label: "Valor Activo",
      value: `$${activeValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: <DollarSign className="w-5 h-5 text-pale-pink-foreground" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
