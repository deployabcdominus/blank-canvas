import { useState, useEffect, useCallback } from "react";
import { FullPageSpinnerSkeleton } from "@/components/ui/skeleton-card";
import { motion } from "framer-motion";
import { useSearchParams, Navigate } from "react-router-dom";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { Shield, Building, Users, Globe, ServerCog, ScrollText } from "lucide-react";
import { SuperadminOverview } from "@/components/superadmin/SuperadminOverview";
import { SuperadminCompanies } from "@/components/superadmin/SuperadminCompanies";
import { SuperadminUsers } from "@/components/superadmin/SuperadminUsers";
import { SuperadminProvisioning } from "@/components/superadmin/SuperadminProvisioning";
import { SuperadminAuditLogs } from "@/components/superadmin/SuperadminAuditLogs";
import { ChangePlanModal } from "@/components/superadmin/ChangePlanModal";

interface Company {
  id: string; name: string; user_id: string; plan_id: string | null;
  created_at: string; enable_network_index: boolean; is_active: boolean;
  subscription_status: string | null; billing_type: string | null;
}

interface CompanyUser {
  id: string; full_name: string; email: string; role: string;
  is_active: boolean; created_at: string; company_name?: string; company_id?: string;
}

export default function SuperadminDashboard() {
  const { user } = useAuth();
  const { isSuperadmin, loading: roleLoading } = useUserRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [allUsers, setAllUsers] = useState<CompanyUser[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false);
  const [bulkRole, setBulkRole] = useState("admin");
  const [showBulkAssignCompanyDialog, setShowBulkAssignCompanyDialog] = useState(false);
  const [bulkAssignCompanyId, setBulkAssignCompanyId] = useState("");
  const [bulkConfirm, setBulkConfirm] = useState<{ title: string; description: string; onConfirm: () => void } | null>(null);

  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyEmail, setNewCompanyEmail] = useState("");
  const [newCompanyIndustry, setNewCompanyIndustry] = useState("");
  const [newCompanyPlan, setNewCompanyPlan] = useState("start");
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState(false);
  const [userToDelete, setUserToDelete] = useState<CompanyUser | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<CompanyUser | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);
  const [editCompanyName, setEditCompanyName] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserCompanyId, setCreateUserCompanyId] = useState("");
  const [newUserData, setNewUserData] = useState({ email: "", password: "", fullName: "", role: "admin" });
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true);
    const { data, error } = await supabase.from("companies").select("*").order("created_at", { ascending: false });
    if (!error) setCompanies((data || []) as Company[]);
    setLoadingCompanies(false);
  }, []);

  const fetchAllUsers = useCallback(async () => {
    setLoadingAllUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", { body: { action: "list-all-users" } });
      if (error) throw error;
      setAllUsers(data.users || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoadingAllUsers(false);
  }, []);

  useEffect(() => {
    if (isSuperadmin) { fetchCompanies(); fetchAllUsers(); }
  }, [isSuperadmin, fetchCompanies, fetchAllUsers]);

  useEffect(() => {
    setSearch(""); setSelectedUserIds(new Set()); setSelectedCompanyIds(new Set());
  }, [activeTab]);

  const fetchCompanyUsers = async (companyId: string) => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", { body: { action: "list-company-users", companyId } });
      if (error) throw error;
      setCompanyUsers(data.users || []);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setLoadingUsers(false);
  };

  const logAudit = useCallback(async (action_type: string, target_name: string, details?: Record<string, any>) => {
    if (!user) return;
    await supabase.from("platform_audit_logs").insert({ actor_id: user.id, action_type, target_name, details: details || {} });
  }, [user]);

  // ── Actions ──
  const handleCreateCompany = async () => {
    if (!newCompanyName.trim() || !user) return;
    setCreatingCompany(true);
    try {
      const { error } = await supabase.from("companies").insert({
        name: newCompanyName.trim(),
        user_id: user.id,
        industry: newCompanyIndustry || null,
        plan_id: newCompanyPlan || "start",
      });
      if (error) throw error;

      // If admin email provided, create user for this company
      if (newCompanyEmail.trim()) {
        // We'll handle this via the existing manage-user edge function after company is created
        const { data: newCompanies } = await supabase.from("companies").select("id").eq("name", newCompanyName.trim()).order("created_at", { ascending: false }).limit(1);
        if (newCompanies?.[0]) {
          // Generate a temp password
          const tempPassword = crypto.randomUUID().slice(0, 12);
          await supabase.functions.invoke("manage-user", {
            body: {
              action: "create",
              email: newCompanyEmail.trim(),
              password: tempPassword,
              fullName: "Admin",
              companyId: newCompanies[0].id,
              role: "admin",
            },
          });
        }
      }

      await logAudit("COMPANY_CREATED", newCompanyName.trim(), { industry: newCompanyIndustry, plan: newCompanyPlan, adminEmail: newCompanyEmail });
      toast({
        title: "🏢 Empresa creada exitosamente",
        description: `Empresa "${newCompanyName}" creada con Plan ${newCompanyPlan.charAt(0).toUpperCase() + newCompanyPlan.slice(1)}`,
      });
      setNewCompanyName(""); setNewCompanyEmail(""); setNewCompanyIndustry(""); setNewCompanyPlan("start");
      setShowCreateCompany(false); fetchCompanies();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setCreatingCompany(false);
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    setDeletingCompany(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", { body: { action: "delete-company", companyId: companyToDelete.id } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await logAudit("COMPANY_DELETED", companyToDelete.name);
      toast({ title: "Empresa eliminada", description: `"${companyToDelete.name}" fue eliminada.` });
      setCompanyToDelete(null); fetchCompanies();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setDeletingCompany(false);
  };

  const handleEditCompany = async () => {
    if (!companyToEdit || !editCompanyName.trim()) return;
    setSavingCompany(true);
    try {
      const { error } = await supabase.from("companies").update({ name: editCompanyName.trim() }).eq("id", companyToEdit.id);
      if (error) throw error;
      await logAudit("COMPANY_UPDATED", editCompanyName.trim(), { previous_name: companyToEdit.name });
      toast({ title: "Empresa actualizada" }); setCompanyToEdit(null); fetchCompanies();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setSavingCompany(false);
  };

  const handleCreateUser = async () => {
    const targetCompanyId = createUserCompanyId;
    if (!targetCompanyId) return;
    setCreatingUser(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", {
        body: { action: "create", email: newUserData.email, password: newUserData.password, fullName: newUserData.fullName, companyId: targetCompanyId, role: newUserData.role },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await logAudit("USER_CREATED", newUserData.email, { fullName: newUserData.fullName, role: newUserData.role });
      toast({ title: "Usuario creado", description: `${newUserData.email} fue agregado.` });
      setNewUserData({ email: "", password: "", fullName: "", role: "admin" });
      setShowCreateUser(false); setCreateUserCompanyId("");
      if (activeTab === "users") fetchAllUsers();
      if (selectedCompany?.id === targetCompanyId) fetchCompanyUsers(targetCompanyId);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setCreatingUser(false);
  };

  const handleToggleActive = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", { body: { action: "toggle-active", userId } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const targetUser = allUsers.find(u => u.id === userId);
      await logAudit("USER_TOGGLED", targetUser?.email || userId, { isActive: data.isActive });
      toast({ title: "Estado actualizado", description: `Usuario ${data.isActive ? "activado" : "desactivado"}.` });
      if (activeTab === "users") fetchAllUsers();
      if (selectedCompany) fetchCompanyUsers(selectedCompany.id);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", { body: { action: "update-role", userId, role: newRole } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const targetUser = allUsers.find(u => u.id === userId);
      await logAudit("ROLE_CHANGED", targetUser?.email || userId, { newRole });
      toast({ title: "Rol actualizado" });
      if (activeTab === "users") fetchAllUsers();
      if (selectedCompany) fetchCompanyUsers(selectedCompany.id);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete || userToDelete.id === user?.id) return;
    setDeletingUser(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", { body: { action: "delete-user", userId: userToDelete.id } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await logAudit("USER_DELETED", userToDelete.full_name || userToDelete.email, { email: userToDelete.email });
      toast({ title: "Usuario eliminado", description: `${userToDelete.full_name || userToDelete.email} ha sido eliminado permanentemente.` });
      setUserToDelete(null);
      if (activeTab === "users") fetchAllUsers();
      if (selectedCompany) fetchCompanyUsers(selectedCompany.id);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setDeletingUser(false);
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser || !resetPasswordValue || resetPasswordValue.length < 6) return;
    setResettingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", {
        body: { action: "reset-password", userId: resetPasswordUser.id, password: resetPasswordValue },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await logAudit("PASSWORD_RESET", resetPasswordUser.email);
      toast({ title: "Contraseña reseteada", description: `Nueva contraseña asignada a ${resetPasswordUser.email}.` });
      setResetPasswordUser(null); setResetPasswordValue("");
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setResettingPassword(false);
  };

  const runBulkUserAction = async (actionName: string, extraBody: Record<string, any> = {}) => {
    const ids = Array.from(selectedUserIds);
    if (ids.length === 0) return;
    setBulkProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", { body: { action: actionName, userIds: ids, ...extraBody } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Acción completada", description: `${data.count || ids.length} usuarios actualizados.` });
      setSelectedUserIds(new Set()); fetchAllUsers();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setBulkProcessing(false);
  };

  const runBulkCompanyAction = async (action: "activate" | "deactivate") => {
    const ids = Array.from(selectedCompanyIds);
    if (ids.length === 0) return;
    setBulkProcessing(true);
    try {
      const { error } = await supabase.from("companies").update({ is_active: action === "activate" }).in("id", ids);
      if (error) throw error;
      toast({ title: "Empresas actualizadas", description: `${ids.length} empresas ${action === "activate" ? "activadas" : "desactivadas"}.` });
      setSelectedCompanyIds(new Set()); fetchCompanies();
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setBulkProcessing(false);
  };

  const toggleUserSelection = (id: string) => setSelectedUserIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAllUsers = (users: CompanyUser[]) => setSelectedUserIds(prev => prev.size === users.length ? new Set() : new Set(users.map(u => u.id)));
  const toggleCompanySelection = (id: string) => setSelectedCompanyIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAllCompanies = (comps: Company[]) => setSelectedCompanyIds(prev => prev.size === comps.length ? new Set() : new Set(comps.map(c => c.id)));

  const setTab = (tab: string) => setSearchParams({ tab });

  if (roleLoading) return <FullPageSpinnerSkeleton />;
  if (!isSuperadmin) return <Navigate to="/dashboard" replace />;

  const handleSelectCompanyWithFetch = (c: Company) => {
    setSelectedCompany(c);
    fetchCompanyUsers(c.id);
  };

  return (
    <ResponsiveLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Shield className="w-8 h-8 text-red-400" />
          <h1 className="font-bold text-2xl text-foreground">Panel Superadmin</h1>
        </div>
        <p className="text-muted-foreground text-sm">Gestión de plataforma · Empresas y usuarios</p>
      </motion.div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "overview", label: "Overview", icon: Globe },
          { key: "companies", label: "Companies", icon: Building },
          { key: "users", label: "Users", icon: Users },
          { key: "provisioning", label: "Provisioning", icon: ServerCog },
          { key: "audit", label: "Auditoría", icon: ScrollText },
        ].map(t => (
          <Button key={t.key} variant={activeTab === t.key ? "default" : "outline"} size="sm" onClick={() => setTab(t.key)} className="gap-2">
            <t.icon className="w-4 h-4" />{t.label}
          </Button>
        ))}
      </div>

      {activeTab === "overview" && (
        <SuperadminOverview
          companies={companies} allUsers={allUsers} setTab={setTab}
          onSelectCompany={handleSelectCompanyWithFetch}
          setShowCreateCompany={setShowCreateCompany}
        />
      )}
      {activeTab === "companies" && (
        <SuperadminCompanies
          companies={companies} search={search} setSearch={setSearch}
          selectedCompanyIds={selectedCompanyIds} toggleCompanySelection={toggleCompanySelection}
          toggleAllCompanies={toggleAllCompanies} bulkProcessing={bulkProcessing}
          onBulkActivate={() => setBulkConfirm({ title: "Activar empresas", description: `¿Activar ${selectedCompanyIds.size} empresa(s)?`, onConfirm: () => { runBulkCompanyAction("activate"); setBulkConfirm(null); } })}
          onBulkDeactivate={() => setBulkConfirm({ title: "Desactivar empresas", description: `¿Desactivar ${selectedCompanyIds.size} empresa(s)?`, onConfirm: () => { runBulkCompanyAction("deactivate"); setBulkConfirm(null); } })}
          clearSelection={() => setSelectedCompanyIds(new Set())}
          setShowCreateCompany={setShowCreateCompany}
          selectedCompany={selectedCompany} onSelectCompany={handleSelectCompanyWithFetch}
          companyUsers={companyUsers} loadingUsers={loadingUsers} loadingCompanies={loadingCompanies}
          onEditCompany={(c) => { setCompanyToEdit(c); setEditCompanyName(c.name); }}
          onDeleteCompany={setCompanyToDelete}
          onCreateUserForCompany={(id) => { setCreateUserCompanyId(id); setShowCreateUser(true); }}
          onToggleUserActive={handleToggleActive} onChangeUserRole={handleChangeRole} onDeleteUser={setUserToDelete}
          onResetPassword={setResetPasswordUser}
        />
      )}
      {activeTab === "users" && (
        <SuperadminUsers
          allUsers={allUsers} search={search} setSearch={setSearch}
          selectedUserIds={selectedUserIds} toggleUserSelection={toggleUserSelection}
          toggleAllUsers={toggleAllUsers} bulkProcessing={bulkProcessing}
          clearSelection={() => setSelectedUserIds(new Set())}
          loadingAllUsers={loadingAllUsers}
          currentUserId={user?.id}
          onToggleUserActive={handleToggleActive} onDeleteUser={setUserToDelete}
          onBulkActivate={() => setBulkConfirm({ title: "Activar usuarios", description: `¿Activar ${selectedUserIds.size} usuario(s)?`, onConfirm: () => { runBulkUserAction("bulk-activate-users"); setBulkConfirm(null); } })}
          onBulkDeactivate={() => setBulkConfirm({ title: "Desactivar usuarios", description: `¿Desactivar ${selectedUserIds.size} usuario(s)?`, onConfirm: () => { runBulkUserAction("bulk-deactivate-users"); setBulkConfirm(null); } })}
          onBulkChangeRole={() => setShowBulkRoleDialog(true)}
          onBulkAssignCompany={() => setShowBulkAssignCompanyDialog(true)}
          onBulkRemoveCompany={() => setBulkConfirm({ title: "Quitar empresa", description: `¿Desvincular ${selectedUserIds.size} usuario(s)?`, onConfirm: () => { runBulkUserAction("bulk-remove-company"); setBulkConfirm(null); } })}
          onResetPassword={setResetPasswordUser}
        />
      )}
      {activeTab === "provisioning" && (
        <SuperadminProvisioning
          companies={companies} createUserCompanyId={createUserCompanyId}
          setCreateUserCompanyId={setCreateUserCompanyId}
          newUserData={newUserData} setNewUserData={setNewUserData}
          onCreateUser={handleCreateUser} creatingUser={creatingUser} setTab={setTab}
        />
      )}
      {activeTab === "audit" && <SuperadminAuditLogs />}

      <Dialog open={showCreateCompany} onOpenChange={setShowCreateCompany}>
        <DialogContent className="glass-card border-white/20 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Building className="w-5 h-5" /> Crear Tenant Manual</DialogTitle>
            <DialogDescription>Crea una empresa con plan asignado manualmente (bypass de Stripe).</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre de la Empresa</Label>
              <Input value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} placeholder="Ej: Acme Corp" className="glass mt-1" />
            </div>
            <div>
              <Label>Email del Admin <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input type="email" value={newCompanyEmail} onChange={e => setNewCompanyEmail(e.target.value)} placeholder="admin@empresa.com" className="glass mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Se creará un usuario admin con contraseña temporal.</p>
            </div>
            <div>
              <Label>Industria</Label>
              <Select value={newCompanyIndustry} onValueChange={setNewCompanyIndustry}>
                <SelectTrigger className="glass mt-1"><SelectValue placeholder="Selecciona industria" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="signage">Señalética / Rotulación</SelectItem>
                  <SelectItem value="it_services">IT / Servicios Técnicos</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                  <SelectItem value="construction">Construcción</SelectItem>
                  <SelectItem value="hvac">HVAC / Climatización</SelectItem>
                  <SelectItem value="other">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan a Asignar</Label>
              <Select value={newCompanyPlan} onValueChange={setNewCompanyPlan}>
                <SelectTrigger className="glass mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Start ($29/mes)</SelectItem>
                  <SelectItem value="pro">Pro ($79/mes)</SelectItem>
                  <SelectItem value="elite">Elite ($149/mes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCompany(false)}>Cancelar</Button>
            <Button onClick={handleCreateCompany} disabled={creatingCompany || !newCompanyName.trim()}>{creatingCompany ? "Creando..." : "Crear Tenant"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!companyToEdit} onOpenChange={(open) => !open && setCompanyToEdit(null)}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader><DialogTitle>Editar Empresa</DialogTitle></DialogHeader>
          <div className="space-y-4"><div><Label>Nombre</Label><Input value={editCompanyName} onChange={e => setEditCompanyName(e.target.value)} className="glass mt-1" /></div></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompanyToEdit(null)}>Cancelar</Button>
            <Button onClick={handleEditCompany} disabled={savingCompany || !editCompanyName.trim()}>{savingCompany ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!companyToDelete} onOpenChange={(open) => !open && setCompanyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle><AlertDialogDescription>Se eliminará "{companyToDelete?.name}" y se desvinculará a todos sus usuarios.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCompany} disabled={deletingCompany} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deletingCompany ? "Eliminando..." : "Eliminar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar usuario permanentemente?</AlertDialogTitle><AlertDialogDescription>Se eliminará a &quot;{userToDelete?.full_name || userToDelete?.email}&quot; de forma permanente.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={deletingUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deletingUser ? "Eliminando..." : "Eliminar"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader><DialogTitle>Crear Usuario</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nombre completo</Label><Input value={newUserData.fullName} onChange={e => setNewUserData(d => ({ ...d, fullName: e.target.value }))} placeholder="Juan Pérez" className="glass mt-1" /></div>
            <div><Label>Email</Label><Input type="email" value={newUserData.email} onChange={e => setNewUserData(d => ({ ...d, email: e.target.value }))} placeholder="juan@empresa.com" className="glass mt-1" /></div>
            <div><Label>Contraseña temporal</Label><Input type="text" value={newUserData.password} onChange={e => setNewUserData(d => ({ ...d, password: e.target.value }))} placeholder="Min. 6 caracteres" className="glass mt-1" /></div>
            <div><Label>Rol</Label>
              <Select value={newUserData.role} onValueChange={val => setNewUserData(d => ({ ...d, role: val }))}>
                <SelectTrigger className="glass mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="operations">Operaciones</SelectItem>
                  <SelectItem value="viewer">Visor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateUser(false)}>Cancelar</Button>
            <Button onClick={handleCreateUser} disabled={creatingUser || !newUserData.email || !newUserData.password || !newUserData.fullName}>{creatingUser ? "Creando..." : "Crear Usuario"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetPasswordUser} onOpenChange={(open) => { if (!open) { setResetPasswordUser(null); setResetPasswordValue(""); } }}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader>
            <DialogTitle>Resetear Contraseña</DialogTitle>
            <DialogDescription>Asigna una nueva contraseña temporal para {resetPasswordUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nueva contraseña temporal</Label>
              <Input type="text" value={resetPasswordValue} onChange={e => setResetPasswordValue(e.target.value)} placeholder="Min. 6 caracteres" className="glass mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetPasswordUser(null); setResetPasswordValue(""); }}>Cancelar</Button>
            <Button onClick={handleResetPassword} disabled={resettingPassword || resetPasswordValue.length < 6}>{resettingPassword ? "Reseteando..." : "Resetear Contraseña"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!bulkConfirm} onOpenChange={(open) => !open && setBulkConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>{bulkConfirm?.title}</AlertDialogTitle><AlertDialogDescription>{bulkConfirm?.description}</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={bulkConfirm?.onConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showBulkRoleDialog} onOpenChange={setShowBulkRoleDialog}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader><DialogTitle>Cambiar rol masivo</DialogTitle><DialogDescription>Se cambiará el rol de {selectedUserIds.size} usuario(s).</DialogDescription></DialogHeader>
          <div>
            <Label>Nuevo rol</Label>
            <Select value={bulkRole} onValueChange={setBulkRole}>
              <SelectTrigger className="glass mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sales">Ventas</SelectItem>
                <SelectItem value="operations">Operaciones</SelectItem>
                <SelectItem value="member">Miembro</SelectItem>
                <SelectItem value="viewer">Visor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkRoleDialog(false)}>Cancelar</Button>
            <Button disabled={bulkProcessing} onClick={() => { runBulkUserAction("bulk-update-role", { role: bulkRole }); setShowBulkRoleDialog(false); }}>{bulkProcessing ? "Procesando..." : "Aplicar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkAssignCompanyDialog} onOpenChange={setShowBulkAssignCompanyDialog}>
        <DialogContent className="glass-card border-white/20">
          <DialogHeader><DialogTitle>Asignar empresa masivo</DialogTitle><DialogDescription>Se asignará una empresa a {selectedUserIds.size} usuario(s).</DialogDescription></DialogHeader>
          <div>
            <Label>Empresa</Label>
            <Select value={bulkAssignCompanyId} onValueChange={setBulkAssignCompanyId}>
              <SelectTrigger className="glass mt-1"><SelectValue placeholder="Selecciona empresa" /></SelectTrigger>
              <SelectContent>{companies.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkAssignCompanyDialog(false)}>Cancelar</Button>
            <Button disabled={bulkProcessing || !bulkAssignCompanyId} onClick={() => { runBulkUserAction("bulk-assign-company", { companyId: bulkAssignCompanyId }); setShowBulkAssignCompanyDialog(false); }}>{bulkProcessing ? "Procesando..." : "Asignar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ResponsiveLayout>
  );
}
