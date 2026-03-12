import { useState, useEffect, useCallback } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCog, Users, Search, UserPlus, Mail, Clock, Trash2, RefreshCw, ShieldAlert } from "lucide-react";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface CompanyUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  sales: "Ventas",
  operations: "Operaciones",
  member: "Comercial",
  viewer: "Visor",
};

export default function TenantTeamManagement() {
  const { user } = useAuth();
  const { isAdmin, companyId, loading: roleLoading } = useUserRole();
  const { company } = useCompany();
  const { toast } = useToast();

  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [tab, setTab] = useState("members");

  const fetchUsers = useCallback(async () => {
    if (!companyId) return;
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", {
        body: { action: "list-company-users", companyId },
      });
      if (error) throw error;
      setUsers(data.users || []);
    } catch (e: any) {
      console.error("Error fetching users:", e);
    }
    setLoadingUsers(false);
  }, [companyId]);

  const fetchInvitations = useCallback(async () => {
    if (!companyId) return;
    setLoadingInvitations(true);
    try {
      const { data, error } = await supabase
        .from("invitations")
        .select("id, email, role, token, expires_at, accepted_at, created_at")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setInvitations((data as Invitation[]) || []);
    } catch (e: any) {
      console.error("Error fetching invitations:", e);
    }
    setLoadingInvitations(false);
  }, [companyId]);

  useEffect(() => {
    if (companyId && isAdmin) {
      fetchUsers();
      fetchInvitations();
    }
  }, [companyId, isAdmin, fetchUsers, fetchInvitations]);

  const handleToggleActive = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", {
        body: { action: "toggle-active", userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Estado actualizado" });
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", {
        body: { action: "update-role", userId, role: newRole },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Rol actualizado" });
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("manage-user", {
        body: { action: "remove-from-company", userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Usuario removido", description: "El usuario fue removido de la empresa." });
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from("invitations")
        .delete()
        .eq("id", invitationId);
      if (error) throw error;
      toast({ title: "Invitación eliminada" });
      fetchInvitations();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleClearHistory = async () => {
    if (!companyId) return;
    try {
      // Delete accepted invitations
      const { error: err1 } = await supabase
        .from("invitations")
        .delete()
        .eq("company_id", companyId)
        .not("accepted_at", "is", null);

      // Delete expired invitations (accepted_at is null but expired)
      const { error: err2 } = await supabase
        .from("invitations")
        .delete()
        .eq("company_id", companyId)
        .is("accepted_at", null)
        .lt("expires_at", new Date().toISOString());

      if (err1) throw err1;
      if (err2) throw err2;

      toast({ title: "Historial limpiado", description: "Se eliminaron las invitaciones aceptadas y expiradas." });
      fetchInvitations();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    const link = `${window.location.origin}/invite?token=${invitation.token}`;
    try {
      await navigator.clipboard.writeText(link);
      toast({ title: "Link copiado", description: "El link de invitación fue copiado al portapapeles." });
    } catch {
      toast({ title: "Link de invitación", description: link });
    }
  };

  const getInvitationStatus = (inv: Invitation) => {
    if (inv.accepted_at) return { label: "Aceptada", variant: "default" as const, className: "bg-green-500/20 text-green-400 border-green-500/30" };
    if (new Date(inv.expires_at) < new Date()) return { label: "Expirada", variant: "destructive" as const, className: "bg-red-500/20 text-red-400 border-red-500/30" };
    return { label: "Pendiente", variant: "secondary" as const, className: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
  };

  const filteredUsers = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const pendingInvitations = invitations.filter(i => !i.accepted_at);
  const filteredInvitations = invitations.filter(i =>
    i.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAdmin && !roleLoading) {
    return (
      <PageTransition>
        <ResponsiveLayout>
          <div className="flex flex-col items-center justify-center py-20">
            <ShieldAlert className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso restringido</h2>
            <p className="text-muted-foreground">Solo los administradores pueden gestionar el equipo.</p>
          </div>
        </ResponsiveLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <ResponsiveLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <UserCog className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Gestión de Equipo</h1>
              <p className="text-sm text-muted-foreground">
                {company?.name ? `Equipo de ${company.name}` : "Administra los usuarios de tu empresa"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-10 w-80" />
            </div>
            <Button onClick={() => setShowInviteModal(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Mail className="w-4 h-4 mr-2" /> Invitar Miembro
            </Button>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="members" className="gap-2">
                <Users className="w-4 h-4" />
                Miembros ({users.length})
              </TabsTrigger>
              <TabsTrigger value="invitations" className="gap-2">
                <Mail className="w-4 h-4" />
                Invitaciones ({pendingInvitations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(u => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell>
                          {u.id !== user?.id ? (
                            <Select value={u.role} onValueChange={val => handleChangeRole(u.id, val)}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="sales">Ventas</SelectItem>
                                <SelectItem value="operations">Operaciones</SelectItem>
                                <SelectItem value="member">Comercial</SelectItem>
                                <SelectItem value="viewer">Visor</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Badge variant="outline">{ROLE_LABELS[u.role] || u.role}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={u.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                            {u.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString("es")}
                        </TableCell>
                        <TableCell className="text-right">
                          {u.id !== user?.id && (
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => handleToggleActive(u.id)}>
                                {u.is_active ? "Desactivar" : "Activar"}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Remover usuario?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {u.full_name || u.email} será removido de la empresa. Podrá ser re-invitado después.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveUser(u.id)} className="bg-destructive text-destructive-foreground">
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {loadingUsers && <div className="p-8 text-center text-muted-foreground">Cargando...</div>}
                {!loadingUsers && filteredUsers.length === 0 && (
                  <div className="p-8 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No hay miembros</h3>
                    <p className="text-muted-foreground mb-4">Invita al primer miembro de tu equipo</p>
                    <Button onClick={() => setShowInviteModal(true)} variant="outline">
                      <Mail className="w-4 h-4 mr-2" /> Invitar
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="invitations">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Enviada</TableHead>
                      <TableHead>Expira</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvitations.map(inv => {
                      const status = getInvitationStatus(inv);
                      const isPending = !inv.accepted_at && new Date(inv.expires_at) >= new Date();
                      return (
                        <TableRow key={inv.id}>
                          <TableCell className="font-medium">{inv.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{ROLE_LABELS[inv.role] || inv.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className={status.className}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(inv.created_at || "").toLocaleDateString("es")}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(inv.expires_at).toLocaleDateString("es")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isPending && (
                                <Button variant="ghost" size="sm" onClick={() => handleResendInvitation(inv)} title="Copiar link">
                                  <RefreshCw className="w-4 h-4" />
                                </Button>
                              )}
                              {!inv.accepted_at && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" title="Revocar">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Revocar invitación?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        La invitación para {inv.email} será eliminada y el link dejará de funcionar.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleRevokeInvitation(inv.id)} className="bg-destructive text-destructive-foreground">
                                        Revocar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {loadingInvitations && <div className="p-8 text-center text-muted-foreground">Cargando...</div>}
                {!loadingInvitations && filteredInvitations.length === 0 && (
                  <div className="p-8 text-center">
                    <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No hay invitaciones</h3>
                    <p className="text-muted-foreground">Las invitaciones enviadas aparecerán aquí</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            fetchInvitations();
          }}
        />
      </ResponsiveLayout>
    </PageTransition>
  );
}
