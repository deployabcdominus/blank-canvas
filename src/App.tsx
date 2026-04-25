import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantLayout } from "@/components/TenantLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { OnboardingGate } from "@/components/OnboardingGate";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { lazy, Suspense } from "react";
const Index = lazy(() => import("./pages/Index"));
const PostPaymentSetup = lazy(() => import("./pages/PostPaymentSetup"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Success = lazy(() => import("./pages/Success"));
const Access = lazy(() => import("./pages/Access"));
const Invite = lazy(() => import("./pages/Invite"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SuperadminDashboard = lazy(() => import("./pages/SuperadminDashboard"));
const TenantTeamManagement = lazy(() => import("./pages/TenantTeamManagement"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Leads = lazy(() => import("./pages/Leads"));
const Proposals = lazy(() => import("./pages/Proposals"));
const WorkOrders = lazy(() => import("./pages/WorkOrders"));
const WorkOrderDetail = lazy(() => import("./pages/WorkOrderDetail"));
const Installation = lazy(() => import("./pages/Installation"));
const InstallerCompanies = lazy(() => import("./pages/InstallerCompanies"));
const Settings = lazy(() => import("./pages/Settings"));
const Clients = lazy(() => import("./pages/Clients"));
const ClientDetail = lazy(() => import("./pages/ClientDetail"));
const Projects = lazy(() => import("./pages/Projects"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MapHub = lazy(() => import("./pages/MapHub"));
const Payments = lazy(() => import("./pages/Payments"));
const Production = lazy(() => import("./pages/Production"));
const OperatorStation = lazy(() => import("./components/production/OperatorStation"));
const MobileTechnicianView = lazy(() => import("./components/work-orders/MobileTechnicianView"));
const AuditLog = lazy(() => import("./pages/AuditLog"));
const LeadsRecycleBin = lazy(() => import("./pages/LeadsRecycleBin"));
const ProposalApproval = lazy(() => import("./pages/ProposalApproval"));
const POIPage = lazy(() => import("./pages/POIPage"));
const PrintPage = lazy(() => import("./pages/PrintPage"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
      <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const App = () => {
  const isPOIRoute = window.location.pathname.startsWith("/poi/");
  const isProposalRoute = window.location.pathname.startsWith("/p/");
  const isPrintRoute = window.location.pathname.startsWith("/print/");

  if (isPOIRoute) {
    return (
      <GlobalErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/poi/:orderId" element={<POIPage />} />
          </Routes>
        </BrowserRouter>
      </GlobalErrorBoundary>
    );
  }

  if (isProposalRoute) {
    return (
      <GlobalErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/p/:proposalId" element={<ProposalApproval />} />
          </Routes>
        </BrowserRouter>
      </GlobalErrorBoundary>
    );
  }

  if (isPrintRoute) {
    return (
      <GlobalErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/print/:orderId" element={<PrintPage />} />
          </Routes>
        </BrowserRouter>
      </GlobalErrorBoundary>
    );
  }

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <LanguageProvider>
              <SettingsProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AnimatePresence>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/checkout" element={<PublicRoute><Checkout /></PublicRoute>} />
                      <Route path="/success" element={<Success />} />
                      <Route path="/setup" element={<PostPaymentSetup />} />
                      <Route path="/access" element={<Access />} />
                      <Route path="/invite" element={<Invite />} />
                      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/onboarding" element={<OnboardingGate><Onboarding /></OnboardingGate>} />
                      <Route path="/p/:proposalId" element={<ProposalApproval />} />
                      <Route path="/poi/:orderId" element={<POIPage />} />

                      <Route path="/superadmin" element={<ProtectedRoute><SuperadminDashboard /></ProtectedRoute>} />
                      <Route path="/superadmin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                      <Route element={<ProtectedRoute><TenantLayout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/clients" element={<Clients />} />
                        <Route path="/clients/:id" element={<ClientDetail />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/leads" element={<Leads />} />
                        <Route path="/leads/recycle-bin" element={<LeadsRecycleBin />} />
                        <Route path="/proposals" element={<Proposals />} />
                        <Route path="/work-orders" element={<WorkOrders />} />
                        <Route path="/work-orders/:id" element={<WorkOrderDetail />} />
                        <Route path="/payments" element={<Payments />} />
                        <Route path="/installation" element={<Installation />} />
                        <Route path="/map-hub" element={<MapHub />} />
                        <Route path="/installer-companies" element={<InstallerCompanies />} />
                        <Route path="/team-management" element={<TenantTeamManagement />} />
                        <Route path="/production" element={<Production />} />
                        <Route path="/taller" element={<div className="min-h-screen bg-background p-4"><OperatorStation /></div>} />
                        <Route path="/tecnico" element={<MobileTechnicianView />} />
                        <Route path="/audit-log" element={<AuditLog />} />
                        <Route path="/settings" element={<Settings />} />
                      </Route>

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AnimatePresence>
                </BrowserRouter>
              </SettingsProvider>
            </LanguageProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;