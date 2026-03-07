import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProviders } from "@/components/TenantProviders";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { OnboardingGate } from "@/components/OnboardingGate";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Access from "./pages/Access";
import Invite from "./pages/Invite";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SuperadminDashboard from "./pages/SuperadminDashboard";
import TenantTeamManagement from "./pages/TenantTeamManagement";
import Onboarding from "./pages/Onboarding";
import Leads from "./pages/Leads";
import Proposals from "./pages/Proposals";
import WorkOrders from "./pages/WorkOrders";
import Installation from "./pages/Installation";
import InstallerCompanies from "./pages/InstallerCompanies";
import Settings from "./pages/Settings";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";
import MapHub from "./pages/MapHub";
import Payments from "./pages/Payments";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SettingsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatePresence>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/checkout" element={<PublicRoute><Checkout /></PublicRoute>} />
                <Route path="/success" element={<Success />} />
                <Route path="/access" element={<Access />} />
                <Route path="/invite" element={<Invite />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/onboarding" element={<OnboardingGate><Onboarding /></OnboardingGate>} />

                {/* Superadmin — no tenant providers needed */}
                <Route path="/superadmin" element={<ProtectedRoute><SuperadminDashboard /></ProtectedRoute>} />

                {/* Tenant routes — wrapped in domain providers */}
                <Route path="/dashboard" element={<ProtectedRoute><TenantProviders><Dashboard /></TenantProviders></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><TenantProviders><Clients /></TenantProviders></ProtectedRoute>} />
                <Route path="/clients/:id" element={<ProtectedRoute><TenantProviders><ClientDetail /></TenantProviders></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><TenantProviders><Projects /></TenantProviders></ProtectedRoute>} />
                <Route path="/leads" element={<ProtectedRoute><TenantProviders><Leads /></TenantProviders></ProtectedRoute>} />
                <Route path="/proposals" element={<ProtectedRoute><TenantProviders><Proposals /></TenantProviders></ProtectedRoute>} />
                <Route path="/work-orders" element={<ProtectedRoute><TenantProviders><WorkOrders /></TenantProviders></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><TenantProviders><Payments /></TenantProviders></ProtectedRoute>} />
                <Route path="/installation" element={<ProtectedRoute><TenantProviders><Installation /></TenantProviders></ProtectedRoute>} />
                <Route path="/map-hub" element={<ProtectedRoute><TenantProviders><MapHub /></TenantProviders></ProtectedRoute>} />
                <Route path="/installer-companies" element={<ProtectedRoute><TenantProviders><InstallerCompanies /></TenantProviders></ProtectedRoute>} />
                <Route path="/team-management" element={<ProtectedRoute><TenantProviders><TenantTeamManagement /></TenantProviders></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><TenantProviders><Settings /></TenantProviders></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
