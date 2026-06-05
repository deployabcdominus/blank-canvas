import { ReactNode } from "react";

/**
 * TenantProviders now serves as a central point for any global tenant-level configuration
 * or providers that don't depend on direct database row loading (which is now handled by React Query).
 */
export const TenantProviders = ({ children }: { children: ReactNode }) => (
  <>
    {children}
  </>
);
