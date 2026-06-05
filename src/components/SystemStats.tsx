import { motion } from "framer-motion";
import { useLeadsQuery } from "@/hooks/queries/useLeadsQuery";
import { useProposalsQuery } from "@/hooks/queries/useProposalsQuery";
import { useWorkOrdersQuery } from "@/hooks/queries/useWorkOrdersQuery";
import { useUserRole } from "@/hooks/useUserRole";
import { useInstallationsQuery } from "@/hooks/queries/useInstallationsQuery";
import { useInstallerCompaniesQuery } from "@/hooks/queries/useInstallerCompaniesQuery";
import { statsConfig } from "@/constants/landingPageData";

export const SystemStats = () => {
  const { leads } = useLeadsQuery(companyId);
  const { proposals } = useProposalsQuery(companyId);
  const { orders } = useWorkOrdersQuery(companyId);
  const { installations } = useInstallationsQuery(companyId);
  const { installerCompanies: companies } = useInstallerCompaniesQuery(companyId);

  const statsValues = [leads.length, proposals.length, orders.length, installations.length, 0, companies.length];

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