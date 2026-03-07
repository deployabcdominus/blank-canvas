import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTeam, TeamMember } from "@/contexts/TeamContext";
import { useInstallerCompanies } from "@/contexts/InstallerCompaniesContext";
import { useSettings } from "@/contexts/SettingsContext";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: TeamMember;
}

export function TeamMemberModal({ isOpen, onClose, member }: TeamMemberModalProps) {
  const { roles, addMember, updateMember } = useTeam();
  const { companies } = useInstallerCompanies();
  const { settings } = useSettings();
  
  const [formData, setFormData] = useState({ name: "", role: "", phone: "", email: "" });
  const isEditing = !!member;

  useEffect(() => {
    if (member) {
      setFormData({ name: member.name, role: member.role, phone: member.phone, email: member.email });
    } else {
      setFormData({ name: "", role: "", phone: "", email: "" });
    }
  }, [member, isOpen]);

  const mainCompany = companies[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.phone || !formData.email) {
      toast({ title: "Error", description: "Todos los campos son obligatorios", variant: "destructive" });
      return;
    }
    if (!mainCompany) {
      toast({ title: "Error", description: "Empresa principal no encontrada. Complete el onboarding primero.", variant: "destructive" });
      return;
    }
    const memberData = { name: formData.name, role: formData.role, companyId: mainCompany.id, phone: formData.phone, email: formData.email };
    if (isEditing && member) {
      updateMember(member.id, memberData);
      toast({ title: "Éxito", description: "¡Miembro actualizado con éxito!" });
    } else {
      addMember(memberData);
      toast({ title: "Éxito", description: "¡Miembro registrado con éxito!" });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#E5E4E2] text-zinc-900 border border-border/20">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Miembro" : "Registrar Miembro"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Nombre completo del miembro" className="bg-white border-zinc-300" />
          </div>
          <div>
            <Label htmlFor="role">Cargo</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger className="bg-white border-zinc-300"><SelectValue placeholder="Seleccione un cargo" /></SelectTrigger>
              <SelectContent>
                {roles.map((role) => (<SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="company">Empresa</Label>
            <div className="p-3 rounded-lg bg-white/80 border border-zinc-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{mainCompany?.name || "Empresa no configurada"}</span>
              <Badge variant="secondary" className="ml-auto">Mi Empresa</Badge>
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} placeholder="(11) 99999-9999" className="bg-white border-zinc-300" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} placeholder="email@ejemplo.com" className="bg-white border-zinc-300" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="bg-white border-zinc-300 text-zinc-900 hover:bg-zinc-100">Cancelar</Button>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">{isEditing ? "Actualizar" : "Registrar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}