import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import { NavigationProgressBar } from "@/components/NavigationProgressBar";
import { PageTransition } from "@/components/transitions/PageTransition";

const Index = lazy(() => import("./pages/Index"));
const PostPaymentSetup = lazy(() => import("./pages/PostPaymentSetup"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Success = lazy(() => import("./pages/Success"));
const Access = lazy(() => import("./pages/Access"));
const Invite = lazy(() => import("./pages/Invite"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
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
const Reports = lazy(() => import("./pages/Reports"));
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

const PilotDashboard = lazy(() => import("./pages/PilotDashboard"));
const Inventory = lazy(() => import("./pages/Inventory"));

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
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      placeholderData: (previousData: any) => previousData,
    },
  },
});

const AppContent = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Landing & Public Routes */}
          <Route path="/" element={<PageTransition type="fade"><Index /></PageTransition>} />
          <Route path="/checkout" element={<PublicRoute><PageTransition type="slide-up"><Checkout /></PageTransition></PublicRoute>} />
          <Route path="/success" element={<PageTransition type="zoom"><Success /></PageTransition>} />
          <Route path="/setup" element={<PageTransition type="fade"><PostPaymentSetup /></PageTransition>} />
          <Route path="/access" element={<PageTransition type="fade"><Access /></PageTransition>} />
          <Route path="/invite" element={<PageTransition type="fade"><Invite /></PageTransition>} />
          <Route path="/login" element={<PublicRoute><PageTransition type="slide-left"><Login /></PageTransition></PublicRoute>} />
          <Route path="/register" element={<PageTransition type="slide-right"><Register /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition type="fade"><ResetPassword /></PageTransition>} />
          <Route path="/onboarding" element={<OnboardingGate><PageTransition type="parallax"><Onboarding /></PageTransition></OnboardingGate>} />
          
          <Route path="/p/:proposalId" element={<PageTransition type="fade"><ProposalApproval /></PageTransition>} />
          <Route path="/poi/:orderId" element={<PageTransition type="fade"><POIPage /></PageTransition>} />
          <Route path="/print/:orderId" element={<PageTransition type="fade"><PrintPage /></PageTransition>} />

          <Route path="/superadmin" element={<ProtectedRoute><PageTransition type="fade"><SuperadminDashboard /></PageTransition></ProtectedRoute>} />
          <Route path="/superadmin/settings" element={<ProtectedRoute><PageTransition type="fade"><Settings /></PageTransition></ProtectedRoute>} />

          <Route element={<ProtectedRoute><TenantLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<PageTransition type="parallax"><Dashboard /></PageTransition>} />
            <Route path="/clients" element={<PageTransition type="fade"><Clients /></PageTransition>} />
            <Route path="/clients/:id" element={<PageTransition type="fade"><ClientDetail /></PageTransition>} />
            <Route path="/projects" element={<PageTransition type="fade"><Projects /></PageTransition>} />
            <Route path="/leads" element={<PageTransition type="slide-left"><Leads /></PageTransition>} />
            <Route path="/leads/recycle-bin" element={<PageTransition type="fade"><LeadsRecycleBin /></PageTransition>} />
            <Route path="/proposals" element={<PageTransition type="slide-left"><Proposals /></PageTransition>} />
            <Route path="/work-orders" element={<PageTransition type="fade"><WorkOrders /></PageTransition>} />
            <Route path="/work-orders/:id" element={<PageTransition type="fade"><WorkOrderDetail /></PageTransition>} />
            <Route path="/payments" element={<PageTransition type="fade"><Payments /></PageTransition>} />
            <Route path="/installation" element={<PageTransition type="fade"><Installation /></PageTransition>} />
            <Route path="/map-hub" element={<PageTransition type="fade"><MapHub /></PageTransition>} />
            <Route path="/installer-companies" element={<PageTransition type="fade"><InstallerCompanies /></PageTransition>} />
            <Route path="/team-management" element={<PageTransition type="fade"><TenantTeamManagement /></PageTransition>} />
            <Route path="/production" element={<PageTransition type="fade"><Production /></PageTransition>} />
            <Route path="/taller" element={<PageTransition type="fade"><div className="min-h-screen bg-background p-4"><OperatorStation /></div></PageTransition>} />
            <Route path="/tecnico" element={<PageTransition type="fade"><MobileTechnicianView /></PageTransition>} />
            <Route path="/audit-log" element={<PageTransition type="fade"><AuditLog /></PageTransition>} />
            <Route path="/settings" element={<PageTransition type="fade"><Settings /></PageTransition>} />
            <Route path="/reports" element={<PageTransition type="fade"><Reports /></PageTransition>} />
            <Route path="/pilot" element={<PageTransition type="fade"><PilotDashboard /></PageTransition>} />
            <Route path="/inventory" element={<PageTransition type="fade"><Inventory /></PageTransition>} />
          </Route>

          <Route path="*" element={<PageTransition type="fade"><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <LanguageProvider>
                <SettingsProvider>
                  <Toaster />
                  <Sonner />
                  <NavigationProgressBar />
                  <AppContent />
                </SettingsProvider>
              </LanguageProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
