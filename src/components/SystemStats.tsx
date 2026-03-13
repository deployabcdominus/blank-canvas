import { motion } from "framer-motion";
import { useLeads } from "@/contexts/LeadsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { useWorkOrders } from "@/contexts/WorkOrdersContext";
import { useInstallations } from "@/contexts/InstallationsContext";
import { useInstallerCompanies } from "@/contexts/InstallerCompaniesContext";
import { statsConfig } from "@/constants/landingPageData";

export const SystemStats = () => {
  const { leads } = useLeads();
  const { proposals } = useProposals();
  const { orders } = useWorkOrders();
  const { installations } = useInstallations();
  const { companies } = useInstallerCompanies();

  const statsValues = [leads.length, proposals.length, orders.length, installations.length, members.length, companies.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="mb-12"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              className="glass-card p-4 text-center"
            >
              <Icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{statsValues[index]}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};