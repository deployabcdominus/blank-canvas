import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Eye, Edit, Trash2, Power, PowerOff, Building, UserPlus, KeyRound } from "lucide-react";
import { BulkActionBar } from "./BulkActionBar";

interface Company {
  id: string;
  name: string;
  user_id: string;
  plan_id: string | null;
  created_at: string;
  enable_network_index: boolean;
  is_active: boolean;
}

interface CompanyUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  company_name?: string;
  company_id?: string;
}

interface Props {
  companies: Company[];
  search: string;
  setSearch: (s: string) => void;
  selectedCompanyIds: Set<string>;
  toggleCompanySelection: (id: string) => void;
  toggleAllCompanies: (comps: Company[]) => void;
  bulkProcessing: boolean;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  clearSelection: () => void;
  setShowCreateCompany: (v: boolean) => void;
  selectedCompany: Company | null;
  onSelectCompany: (c: Company) => void;
  companyUsers: CompanyUser[];
  loadingUsers: boolean;
  loadingCompanies: boolean;
  onEditCompany: (c: Company) => void;
  onDeleteCompany: (c: Company) => void;
  onCreateUserForCompany: (companyId: string) => void;
  onToggleUserActive: (userId: string) => void;
  onChangeUserRole: (userId: string, role: string) => void;
  onDeleteUser: (u: CompanyUser) => void;
  onResetPassword: (u: CompanyUser) => void;
}

export function SuperadminCompanies({
  companies, search, setSearch, selectedCompanyIds, toggleCompanySelection,
  toggleAllCompanies, bulkProcessing, onBulkActivate, onBulkDeactivate,
  clearSelection, setShowCreateCompany, selectedCompany, onSelectCompany,
  companyUsers, loadingUsers, loadingCompanies, onEditCompany, onDeleteCompany,
  onCreateUserForCompany, onToggleUserActive, onChangeUserRole, onDeleteUser, onResetPassword,
}: Props) {
  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar empresas..." value={search} onChange={e => setSearch(e.target.value)} className="glass pl-10 w-80" />
        </div>
        <Button onClick={() => setShowCreateCompany(true)} className="btn-glass bg-soft-blue text-soft-blue-foreground gap-2">
          <Plus className="w-4 h-4" /> Nueva Empresa
        </Button>
      </div>

      <BulkActionBar count={selectedCompanyIds.size} onClear={clearSelection}>
        <Button size="sm" variant="outline" className="gap-1.5" disabled={bulkProcessing} onClick={onBulkActivate}>
          <Power className="w-3.5 h-3.5" /> Activar
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" disabled={bulkProcessing} onClick={onBulkDeactivate}>
          <PowerOff className="w-3.5 h-3.5" /> Desactivar
        </Button>
      </BulkActionBar>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="w-12">
                <Checkbox checked={filtered.length > 0 && selectedCompanyIds.size === filtered.length} onCheckedChange={() => toggleAllCompanies(filtered)} />
              </TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creada</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(company => (
              <TableRow key={company.id} className={`border-border/10 hover:bg-muted/20 ${selectedCompanyIds.has(company.id) ? "bg-primary/5" : ""}`}>
                <TableCell><Checkbox checked={selectedCompanyIds.has(company.id)} onCheckedChange={() => toggleCompanySelection(company.id)} /></TableCell>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-mono">{company.id.slice(0, 8)}...</TableCell>
                <TableCell>
                  <Badge variant="outline" className={company.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-muted/30 text-muted-foreground border-muted"}>
                    {company.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(company.created_at).toLocaleDateString("es")}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onSelectCompany(company)}><Eye className="w-4 h-4 mr-1" /> Usuarios</Button>
                  <Button variant="ghost" size="sm" onClick={() => onEditCompany(company)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDeleteCompany(company)}><Trash2 className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <Building className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">{loadingCompanies ? "Cargando empresas..." : "No se encontraron empresas"}</p>
            {!loadingCompanies && <p className="text-sm text-muted-foreground/60 mt-1">Crea la primera empresa para comenzar.</p>}
          </div>
        )}
      </div>

      {selectedCompany && (
        <Card className="glass-card mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedCompany.name} — Usuarios</CardTitle>
              <CardDescription>ID: {selectedCompany.id.slice(0, 12)}...</CardDescription>
            </div>
            <Button onClick={() => onCreateUserForCompany(selectedCompany.id)} size="sm" className="gap-2">
              <UserPlus className="w-4 h-4" /> Crear Usuario
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border/20">
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyUsers.map(u => (
                  <TableRow key={u.id} className="border-border/10 hover:bg-muted/20">
                    <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Select value={u.role} onValueChange={val => onChangeUserRole(u.id, val)}>
                        <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="sales">Ventas</SelectItem>
                          <SelectItem value="operations">Operaciones</SelectItem>
                          <SelectItem value="viewer">Visor</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={u.is_active ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                        {u.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString("es")}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => onResetPassword(u)} title="Resetear contraseña"><KeyRound className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => onToggleUserActive(u.id)}>{u.is_active ? "Desactivar" : "Activar"}</Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onDeleteUser(u)}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {loadingUsers && <div className="p-4"><TableSkeleton cols={4} rows={3} /></div>}
            {!loadingUsers && companyUsers.length === 0 && (
              <div className="p-8 text-center">
                <UserPlus className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No hay usuarios en esta empresa.</p>
                <p className="text-sm text-muted-foreground/60">Crea el primer admin para comenzar.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
