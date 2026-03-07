import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ServerCog, UserPlus, Building } from "lucide-react";

interface Company {
  id: string;
  name: string;
}

interface NewUserData {
  email: string;
  password: string;
  fullName: string;
  role: string;
}

interface Props {
  companies: Company[];
  createUserCompanyId: string;
  setCreateUserCompanyId: (v: string) => void;
  newUserData: NewUserData;
  setNewUserData: (fn: (d: NewUserData) => NewUserData) => void;
  onCreateUser: () => void;
  creatingUser: boolean;
  setTab: (tab: string) => void;
}

export function SuperadminProvisioning({
  companies, createUserCompanyId, setCreateUserCompanyId,
  newUserData, setNewUserData, onCreateUser, creatingUser, setTab,
}: Props) {
  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ServerCog className="w-5 h-5" /> Provisionar nuevo usuario</CardTitle>
          <CardDescription>Crea un usuario y asígnalo a una empresa existente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-lg">
          <div>
            <Label>Empresa</Label>
            <Select value={createUserCompanyId} onValueChange={setCreateUserCompanyId}>
              <SelectTrigger className="glass mt-1"><SelectValue placeholder="Selecciona una empresa" /></SelectTrigger>
              <SelectContent>{companies.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Nombre completo</Label>
            <Input value={newUserData.fullName} onChange={e => setNewUserData(d => ({ ...d, fullName: e.target.value }))} placeholder="Juan Pérez" className="glass mt-1" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={newUserData.email} onChange={e => setNewUserData(d => ({ ...d, email: e.target.value }))} placeholder="juan@empresa.com" className="glass mt-1" />
          </div>
          <div>
            <Label>Contraseña temporal</Label>
            <Input type="text" value={newUserData.password} onChange={e => setNewUserData(d => ({ ...d, password: e.target.value }))} placeholder="Min. 6 caracteres" className="glass mt-1" />
          </div>
          <div>
            <Label>Rol</Label>
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
          <Button onClick={onCreateUser} disabled={creatingUser || !newUserData.email || !newUserData.password || !newUserData.fullName || !createUserCompanyId} className="gap-2">
            <UserPlus className="w-4 h-4" />{creatingUser ? "Creando..." : "Crear Usuario"}
          </Button>
        </CardContent>
      </Card>
      {companies.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Building className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No hay empresas registradas.</p>
            <Button variant="link" onClick={() => setTab("companies")}>Crea una empresa primero.</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
