import { Outlet } from "react-router-dom";
import { TenantProviders } from "@/components/TenantProviders";

/**
 * Wraps all tenant routes in a single TenantProviders instance.
 * This prevents re-mounting providers on every route change,
 * eliminating redundant data fetches.
 */
export const TenantLayout = () => (
  <TenantProviders>
    <Outlet />
  </TenantProviders>
);
