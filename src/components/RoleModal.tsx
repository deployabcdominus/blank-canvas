import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTeam, Role, PermissionFlags } from "@/contexts/TeamContext";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  role?: Role;
}

export function RoleModal({ isOpen, onClose, role }: RoleModalProps) {
  const { addRole, updateRole } = useTeam();
  
  const [formData, setFormData] = useState({
    name: "", description: "",
    permissions: {
      canViewDashboard: false, canManageLeads: false, canManageProposals: false,
      canManageProduction: false, canManageInstallations: false, canManageTeam: false,
      canManageInstallerCompanies: false, canViewReports: false,
    } as PermissionFlags
  });

  const isEditing = !!role;

  useEffect(() => {
    if (role) {
      setFormData({ name: role.name, description: role.description, permissions: { ...role.permissions } });
    } else {
      setFormData({
        name: "", description: "",
        permissions: {
          canViewDashboard: false, canManageLeads: false, canManageProposals: false,
          canManageProduction: false, canManageInstallations: false, canManageTeam: false,
          canManageInstallerCompanies: false, canViewReports: false,
        }
      });
    }
  }, [role, isOpen]);

  const handlePermissionChange = (permission: keyof PermissionFlags, value: boolean) => {
    setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, [permission]: value } }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "El nombre del cargo es obligatorio", variant: "destructive" });
      return;
    }
    const roleData = { name: formData.name.trim(), description: formData.description.trim(), permissions: formData.permissions };
    if (isEditing && role) {
      updateRole(role.id, roleData);
      toast({ title: "Éxito", description: "¡Cargo actualizado con éxito!" });
    } else {
      addRole(roleData);
      toast({ title: "Éxito", description: "¡Cargo creado con éxito!" });
    }
    onClose();
  };

  const permissionLabels = {
    canViewDashboard: "Ver Dashboard",
    canManageLeads: "Gestionar Leads",
    canManageProposals: "Gestionar Propuestas",
    canManageProduction: "Gestionar Producción",
    canManageInstallations: "Gestionar Instalaciones",
    canManageTeam: "Gestionar Equipo",
    canManageInstallerCompanies: "Gestionar Empresas Instaladoras",
    canViewReports: "Ver Informes",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? "Editar Cargo" : "Nuevo Cargo"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del Cargo</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ej: Supervisor, Instalador" className="glass" />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Describa las responsabilidades de este cargo" className="glass" rows={3} />
          </div>
          <Separator />
          <div>
            <Label className="text-base font-semibold">Permisos</Label>
            <p className="text-sm text-muted-foreground mb-4">Defina qué funcionalidades puede acceder este cargo</p>
            <div className="space-y-3">
              {Object.entries(permissionLabels).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="text-sm font-normal cursor-pointer">{label}</Label>
                  <Switch id={key} checked={formData.permissions[key as keyof PermissionFlags]} onCheckedChange={(checked) => handlePermissionChange(key as keyof PermissionFlags, checked)} />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="btn-glass">Cancelar</Button>
            <Button type="submit" className="btn-glass bg-lavender text-lavender-foreground hover:bg-lavender-hover">{isEditing ? "Actualizar" : "Crear Cargo"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}