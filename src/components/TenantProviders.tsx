import { ReactNode } from "react";
import { LeadsProvider } from "@/contexts/LeadsContext";
import { ProposalsProvider } from "@/contexts/ProposalsContext";
import { PaymentsProvider } from "@/contexts/PaymentsContext";
import { WorkOrdersProvider } from "@/contexts/WorkOrdersContext";
import { InstallationsProvider } from "@/contexts/InstallationsContext";
import { InstallerCompaniesProvider } from "@/contexts/InstallerCompaniesContext";

import { ClientsProvider } from "@/contexts/ClientsContext";
import { ProjectsProvider } from "@/contexts/ProjectsContext";

/**
 * Wraps all tenant-specific domain providers.
 * Only mounted when user is NOT superadmin, avoiding unnecessary
 * DB queries and re-renders for platform admins.
 */
export const TenantProviders = ({ children }: { children: ReactNode }) => (
  <ClientsProvider>
    <ProjectsProvider>
      <LeadsProvider>
        <ProposalsProvider>
          <PaymentsProvider>
            <WorkOrdersProvider>
              <InstallationsProvider>
                <InstallerCompaniesProvider>
                  <TeamProvider>
                    {children}
                  </TeamProvider>
                </InstallerCompaniesProvider>
              </InstallationsProvider>
            </WorkOrdersProvider>
          </PaymentsProvider>
        </ProposalsProvider>
      </LeadsProvider>
    </ProjectsProvider>
  </ClientsProvider>
);
