import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeads } from "@/contexts/LeadsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { useWorkOrders } from "@/contexts/WorkOrdersContext";
import { useInstallations } from "@/contexts/InstallationsContext";
import { useInstallerCompanies } from "@/contexts/InstallerCompaniesContext";
import { systemModulesConfig } from "@/constants/landingPageData";

export const SystemModules = () => {
  const navigate = useNavigate();
  const { leads } = useLeads();
  const { proposals } = useProposals();
  const { orders } = useWorkOrders();
  const { installations } = useInstallations();
  const { companies } = useInstallerCompanies();

  const moduleCounts = [leads.length, proposals.length, orders.length, installations.length, 0, companies.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="mb-16"
    >
      <h2 className="text-3xl font-bold mb-8">Módulos del Sistema</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {systemModulesConfig.map((module, index) => {
          const Icon = module.icon;
          return (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(module.path)}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="flex items-center justify-between">
                    <span>{module.title}</span>
                    <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {moduleCounts[index]}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{module.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
