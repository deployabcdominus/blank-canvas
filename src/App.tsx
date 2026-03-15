import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantLayout } from "@/components/TenantLayout";
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
import Production from "./pages/Production";
import WorkerTabletView from "./components/production/WorkerTabletView";
import MobileTechnicianView from "./components/work-orders/MobileTechnicianView";
import ProposalApproval from "./pages/ProposalApproval";

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
                <Route path="/register" element={<Register />} />
                <Route path="/onboarding" element={<OnboardingGate><Onboarding /></OnboardingGate>} />
                <Route path="/p/:proposalId" element={<ProposalApproval />} />
                {/* Superadmin — no tenant providers needed */}
                <Route path="/superadmin" element={<ProtectedRoute><SuperadminDashboard /></ProtectedRoute>} />

                {/* Tenant routes — single TenantProviders wrapper via layout route */}
                <Route element={<ProtectedRoute><TenantLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/clients/:id" element={<ClientDetail />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/proposals" element={<Proposals />} />
                  <Route path="/work-orders" element={<WorkOrders />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/installation" element={<Installation />} />
                  <Route path="/map-hub" element={<MapHub />} />
                  <Route path="/installer-companies" element={<InstallerCompanies />} />
                  <Route path="/team-management" element={<TenantTeamManagement />} />
                  <Route path="/production" element={<Production />} />
                  <Route path="/taller" element={<div className="min-h-screen bg-background p-4"><WorkerTabletView /></div>} />
                  <Route path="/audit-log" element={<AuditLog />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

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
