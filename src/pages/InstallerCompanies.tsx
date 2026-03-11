import React, { useState } from 'react';
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useInstallerCompanies } from "@/contexts/InstallerCompaniesContext";
import { useUserRole } from "@/hooks/useUserRole";
import { InstallerCompanyModal } from "@/components/InstallerCompanyModal";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const InstallerCompanies = () => {
  const { companies, deleteCompany } = useInstallerCompanies();
  const { canEdit, canDelete } = useUserRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (company.phone?.includes(searchTerm) || false)
  );

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    try {
      deleteCompany(id);
      setCompanyToDelete(null);
      toast({
        title: "Empresa eliminada",
        description: "Empresa instaladora eliminada con éxito.",
      });
    } catch (error) {
      setCompanyToDelete(null);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No fue posible eliminar la empresa",
        variant: "destructive"
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <ResponsiveLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Empresas Instaladoras</h1>
            <p className="text-muted-foreground">Gestione sus empresas asociadas de instalación</p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Empresa
          </Button>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-input"
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16">Logo</TableHead>
                  <TableHead>Nombre de la Empresa</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="w-24">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id} className="hover:bg-muted/20">
                    <TableCell>
                      <Avatar className="w-10 h-10">
                        {company.logoUrl && (
                          <AvatarImage src={company.logoUrl} alt={`Logo ${company.name}`} />
                        )}
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {getInitials(company.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {company.name}
                        {false && (
                          <Badge variant="secondary" className="text-xs">Mi Empresa</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{company.email || "-"}</TableCell>
                    <TableCell>{company.phone || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(company)} className="h-8 w-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setCompanyToDelete(company.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredCompanies.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                {searchTerm ? "Ninguna empresa encontrada." : "Ninguna empresa registrada aún."}
              </div>
            )}
          </div>
        </div>
      </div>

      <InstallerCompanyModal isOpen={isModalOpen} onClose={handleModalClose} company={editingCompany} />

      <AlertDialog open={companyToDelete !== null} onOpenChange={(open) => !open && setCompanyToDelete(null)}>
        <AlertDialogContent className="bg-white border shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Empresa</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de que desea eliminar esta empresa instaladora? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white border-input hover:bg-gray-50">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => companyToDelete && handleDelete(companyToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ResponsiveLayout>
  );
};

export default InstallerCompanies;