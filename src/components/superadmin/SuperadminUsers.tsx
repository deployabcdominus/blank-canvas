import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Trash2, Users, UserCheck, UserMinus, Shield, Briefcase, Archive, KeyRound } from "lucide-react";
import { BulkActionBar } from "./BulkActionBar";

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Superadmin", admin: "Admin", sales: "Ventas",
  operations: "Operaciones", member: "Miembro", viewer: "Visor",
};

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
  allUsers: CompanyUser[];
  search: string;
  setSearch: (s: string) => void;
  selectedUserIds: Set<string>;
  toggleUserSelection: (id: string) => void;
  toggleAllUsers: (users: CompanyUser[]) => void;
  bulkProcessing: boolean;
  clearSelection: () => void;
  loadingAllUsers: boolean;
  onToggleUserActive: (userId: string) => void;
  onDeleteUser: (u: CompanyUser) => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkChangeRole: () => void;
  onBulkAssignCompany: () => void;
  onBulkRemoveCompany: () => void;
  onResetPassword: (u: CompanyUser) => void;
}

export function SuperadminUsers({
  allUsers, search, setSearch, selectedUserIds, toggleUserSelection,
  toggleAllUsers, bulkProcessing, clearSelection, loadingAllUsers,
  onToggleUserActive, onDeleteUser, onBulkActivate, onBulkDeactivate,
  onBulkChangeRole, onBulkAssignCompany, onBulkRemoveCompany, onResetPassword,
}: Props) {
  const filtered = allUsers.filter(u =>
    (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar usuarios..." value={search} onChange={e => setSearch(e.target.value)} className="glass pl-10 w-80" />
        </div>
      </div>

      <BulkActionBar count={selectedUserIds.size} onClear={clearSelection}>
        <Button size="sm" variant="outline" className="gap-1.5" disabled={bulkProcessing} onClick={onBulkActivate}><UserCheck className="w-3.5 h-3.5" /> Activar</Button>
        <Button size="sm" variant="outline" className="gap-1.5" disabled={bulkProcessing} onClick={onBulkDeactivate}><UserMinus className="w-3.5 h-3.5" /> Desactivar</Button>
        <Button size="sm" variant="outline" className="gap-1.5" disabled={bulkProcessing} onClick={onBulkChangeRole}><Shield className="w-3.5 h-3.5" /> Cambiar rol</Button>
        <Button size="sm" variant="outline" className="gap-1.5" disabled={bulkProcessing} onClick={onBulkAssignCompany}><Briefcase className="w-3.5 h-3.5" /> Asignar empresa</Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-destructive" disabled={bulkProcessing} onClick={onBulkRemoveCompany}><Archive className="w-3.5 h-3.5" /> Quitar empresa</Button>
      </BulkActionBar>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="w-12">
                <Checkbox checked={filtered.length > 0 && selectedUserIds.size === filtered.length} onCheckedChange={() => toggleAllUsers(filtered)} />
              </TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u.id} className={`border-border/10 hover:bg-muted/20 ${selectedUserIds.has(u.id) ? "bg-primary/5" : ""}`}>
                <TableCell><Checkbox checked={selectedUserIds.has(u.id)} onCheckedChange={() => toggleUserSelection(u.id)} /></TableCell>
                <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.company_name || "Sin empresa"}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{ROLE_LABELS[u.role] || u.role}</Badge></TableCell>
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
        {loadingAllUsers && (
          <div className="p-4">
            <TableSkeleton cols={6} rows={5} />
          </div>
        )}
        {!loadingAllUsers && filtered.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground font-medium">No se encontraron usuarios</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Los usuarios aparecerán aquí cuando sean creados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
