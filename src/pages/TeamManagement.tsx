import { useState } from "react";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  UserCog, Users, Shield, Settings, Plus, Search, Edit, Trash2, UserPlus, UserMinus, Mail
} from "lucide-react";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { useUserRole } from "@/hooks/useUserRole";
import RolePermissionsGuide from "@/components/team/RolePermissionsGuide";
import { useTeam } from "@/contexts/TeamContext";
import { useInstallerCompanies } from "@/contexts/InstallerCompaniesContext";
import { useSettings } from "@/contexts/SettingsContext";
import { TeamMemberModal } from "@/components/TeamMemberModal";
import { RoleModal } from "@/components/RoleModal";
import { toast } from "@/hooks/use-toast";

export default function TeamManagement() {
  const { roles, members, installations, allocations, deleteMember, deleteRole, allocateMember, deallocateMember, getMembersForInstallation } = useTeam();
  const { companies } = useInstallerCompanies();
  const { settings } = useSettings();
  
  const [activeTab, setActiveTab] = useState("members");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { isAdmin } = useUserRole();

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (roles.find(r => r.id === member.role)?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setIsMemberModalOpen(true);
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setIsRoleModalOpen(true);
  };

  const handleDeleteMember = (member: any) => {
    if (confirm(`¿Está seguro de que desea eliminar al miembro ${member.name}?`)) {
      deleteMember(member.id);
      toast({
        title: "Miembro eliminado",
        description: `${member.name} fue removido del equipo.`
      });
    }
  };

  const handleDeleteRole = (role: any) => {
    const membersWithRole = members.filter(m => m.role === role.id);
    if (membersWithRole.length > 0) {
      toast({
        title: "Error",
        description: `No es posible eliminar el cargo ${role.name} ya que existen miembros asociados a él.`,
        variant: "destructive"
      });
      return;
    }

    if (confirm(`¿Está seguro de que desea eliminar el cargo ${role.name}?`)) {
      deleteRole(role.id);
      toast({
        title: "Cargo eliminado",
        description: `El cargo ${role.name} fue removido.`
      });
    }
  };

  const closeModals = () => {
    setIsMemberModalOpen(false);
    setIsRoleModalOpen(false);
    setSelectedMember(null);
    setSelectedRole(null);
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <UserCog className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestión de equipo</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Miembros
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Funciones y permisos
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Asignación en proyectos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar miembros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="glass pl-10 w-80"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {isAdmin && (
                  <Button
                    onClick={() => setIsInviteModalOpen(true)}
                    variant="outline"
                    className="btn-glass"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Invitar por Email
                  </Button>
                )}
                <Button
                  onClick={() => setIsMemberModalOpen(true)}
                  className="btn-glass bg-soft-blue text-soft-blue-foreground hover:bg-soft-blue-hover"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar miembro
                </Button>
              </div>
            </div>

            <div className="glass-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const company = companies.find(c => c.id === member.companyId);
                    const isMainCompany = companies.indexOf(company!) === 0;
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{roles.find(r => r.id === member.role)?.name || member.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {company?.name}
                            {isMainCompany && (
                              <Badge variant="outline" className="text-xs">Mi Empresa</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleEditMember(member)} className="p-2">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMember(member)} className="p-2 text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredMembers.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Ningún miembro encontrado</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Intente ajustar los términos de búsqueda" : "Registre el primer miembro del equipo"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cargos y Permisos</h2>
              <Button
                onClick={() => setIsRoleModalOpen(true)}
                className="btn-glass bg-lavender text-lavender-foreground hover:bg-lavender-hover"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo cargo
              </Button>
            </div>

            <div className="grid gap-4">
              {roles.map((role) => (
                <div key={role.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{role.name}</h3>
                      <p className="text-muted-foreground">{role.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(role.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${value ? 'bg-mint' : 'bg-muted'}`} />
                        <span className="text-sm">{
                          key.replace(/^can/, '').replace(/([A-Z])/g, ' $1').trim()
                        }</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6">
            <h2 className="text-xl font-semibold">Asignación en Proyectos</h2>
            
            <div className="grid gap-6">
              {installations.map((installation) => {
                const assignedMembers = getMembersForInstallation(installation.id);
                const availableMembers = members.filter(
                  member => !assignedMembers.some(assigned => assigned.id === member.id)
                );

                return (
                  <div key={installation.id} className="glass-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{installation.client}</h3>
                        <p className="text-soft-blue-foreground">{installation.project}</p>
                        <p className="text-sm text-muted-foreground">{installation.address}</p>
                        <Badge className="mt-2" variant={
                          installation.status === 'Completed' ? 'default' : 
                          installation.status === 'In Progress' ? 'secondary' : 'outline'
                        }>
                          {installation.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Miembros Asignados</Label>
                        {assignedMembers.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {assignedMembers.map((member) => (
                              <Badge key={member.id} variant="secondary" className="flex items-center gap-2">
                                {member.name}
                                <button
                                  onClick={() => deallocateMember(installation.id, member.id)}
                                  className="ml-1 hover:text-destructive"
                                >
                                  <UserMinus className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Ningún miembro asignado</p>
                        )}
                      </div>

                      {availableMembers.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Agregar Miembro</Label>
                          <div className="flex flex-wrap gap-2">
                            {availableMembers.map((member) => (
                              <Badge 
                                key={member.id} 
                                variant="outline" 
                                className="cursor-pointer hover:bg-mint hover:text-mint-foreground flex items-center gap-2"
                                onClick={() => allocateMember(installation.id, member.id)}
                              >
                                {member.name}
                                <UserPlus className="w-3 h-3" />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <TeamMemberModal isOpen={isMemberModalOpen} onClose={closeModals} member={selectedMember} />
      <RoleModal isOpen={isRoleModalOpen} onClose={closeModals} role={selectedRole} />
      <InviteMemberModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </ResponsiveLayout>
  );
}