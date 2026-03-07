import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Activity, Shield, Plus, UserPlus, Eye } from "lucide-react";

interface Company {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface CompanyUser {
  id: string;
  role: string;
}

interface Props {
  companies: Company[];
  allUsers: CompanyUser[];
  setTab: (tab: string) => void;
  onSelectCompany: (company: Company) => void;
  setShowCreateCompany: (v: boolean) => void;
}

export function SuperadminOverview({ companies, allUsers, setTab, onSelectCompany, setShowCreateCompany }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => setTab("companies")}>
          <CardContent className="p-4 flex items-center gap-3">
            <Building className="w-8 h-8 text-primary" />
            <div><p className="text-2xl font-bold">{companies.length}</p><p className="text-xs text-muted-foreground">Empresas</p></div>
          </CardContent>
        </Card>
        <Card className="glass-card cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => setTab("users")}>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <div><p className="text-2xl font-bold">{allUsers.length || "—"}</p><p className="text-xs text-muted-foreground">Usuarios</p></div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-400" />
            <div><p className="text-2xl font-bold">{companies.filter(c => c.is_active).length}</p><p className="text-xs text-muted-foreground">Activas</p></div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            <div><p className="text-2xl font-bold">{allUsers.filter(u => u.role === "superadmin").length || 1}</p><p className="text-xs text-muted-foreground">Superadmins</p></div>
          </CardContent>
        </Card>
      </div>
      <Card className="glass-card">
        <CardHeader><CardTitle className="text-lg">Acciones rápidas</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => { setTab("companies"); setTimeout(() => setShowCreateCompany(true), 100); }} variant="outline" className="gap-2"><Plus className="w-4 h-4" /> Nueva empresa</Button>
          <Button onClick={() => setTab("provisioning")} variant="outline" className="gap-2"><UserPlus className="w-4 h-4" /> Provisionar usuario</Button>
          <Button onClick={() => setTab("users")} variant="outline" className="gap-2"><Users className="w-4 h-4" /> Ver todos los usuarios</Button>
        </CardContent>
      </Card>
      {companies.length > 0 && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Empresas recientes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {companies.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{c.name}</p>
                    {!c.is_active && <Badge variant="outline" className="text-xs bg-muted/30">Inactiva</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("es")}</p>
                    <Button variant="ghost" size="sm" onClick={() => { onSelectCompany(c); setTab("companies"); }}><Eye className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
