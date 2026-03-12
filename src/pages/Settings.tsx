import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useCompany } from "@/hooks/useCompany";
import { useInstallerCompanies } from "@/contexts/InstallerCompaniesContext";
import { useTeam } from "@/contexts/TeamContext";
import { useLeads } from "@/contexts/LeadsContext";
import { useProposals } from "@/contexts/ProposalsContext";
import { useWorkOrders } from "@/contexts/WorkOrdersContext";
import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { RotateCcw, Save, Settings as SettingsIcon, User, Mail, Building2, Calendar, Eye, EyeOff, FolderOpen, Shield, KeyRound, Plug, RefreshCw, Unplug, CheckCircle2, XCircle, Bell } from "lucide-react";
import { AvatarUpload } from "@/components/AvatarUpload";
import { ServiceTypesSettings } from "@/components/settings/ServiceTypesSettings";
import { supabase } from "@/integrations/supabase/client";


export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, updateSettings, resetToDefaults } = useSettings();
  const { user } = useAuth();
  const { isAdmin, isSuperadmin, role } = useUserRole();
  const { company, updateCompanyName, updateCompanySettings } = useCompany();
  const { companies, updateCompany } = useInstallerCompanies();
  const { roles, members, installations, allocations } = useTeam();
  const { leads } = useLeads();
  const { proposals } = useProposals();
  const { orders } = useWorkOrders();
  const { toast } = useToast();
  
  
  const [formData, setFormData] = useState(settings);
  const [showPassword, setShowPassword] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [savingOrg, setSavingOrg] = useState(false);
  const [networkEnabled, setNetworkEnabled] = useState(false);
  const [networkBasePath, setNetworkBasePath] = useState('');
  const [savingStorage, setSavingStorage] = useState(false);

  // Editable full name
  const [fullName, setFullName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const activeTab = searchParams.get('tab') || (isAdmin ? 'configuracion' : 'perfil');

  // Handle QBO OAuth callback
  useEffect(() => {
    if (searchParams.get('qbo') === 'connected') {
      toast({
        title: 'QuickBooks conectado exitosamente',
        description: 'La integración con QuickBooks Online está activa.',
      });
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('qbo');
      newParams.set('tab', 'integraciones');
      setSearchParams(newParams, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (company?.name) setOrgName(company.name);
    if (company) {
      setNetworkEnabled((company as any).enable_network_index ?? false);
      setNetworkBasePath((company as any).network_base_path ?? '');
    }
  }, [company]);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setFullName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleSave = () => {
    updateSettings(formData);
    toast({
      title: "Configuración guardada",
      description: "La configuración se actualizó correctamente.",
    });
  };

  const handleSaveName = async () => {
    if (!fullName.trim() || !user) return;
    setSavingName(true);
    try {
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() }
      });
      if (authError) throw authError;

      // Update profiles table
      await supabase.from('profiles').update({ full_name: fullName.trim() }).eq('id', user.id);

      toast({ title: "Nombre actualizado", description: "Tu nombre se guardó correctamente." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo guardar.", variant: "destructive" });
    } finally {
      setSavingName(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setResetSent(true);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: window.location.origin + '/settings?tab=perfil',
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setResetSent(false);
    } else {
      toast({ title: "Email enviado", description: "Revisa tu correo para cambiar la contraseña." });
    }
  };

  const roleLabel = isSuperadmin ? 'Superadmin' : role === 'admin' ? 'Admin' : role === 'sales' ? 'Sales' : role === 'operations' ? 'Operations' : role === 'viewer' ? 'Viewer' : role === 'member' ? 'Member' : '—';

  return (
    <ResponsiveLayout
      title="Configuración"
      subtitle="Gestione la configuración del sistema"
      icon={SettingsIcon}
    >
      <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })} className="w-full">
         <TabsList className="mb-6">
          <TabsTrigger value="perfil">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
           {isAdmin && !isSuperadmin && (
            <TabsTrigger value="organizacion">
              <Building2 className="w-4 h-4 mr-2" />
              Organización
            </TabsTrigger>
          )}
          {isAdmin && !isSuperadmin && (
            <TabsTrigger value="storage">
              <FolderOpen className="w-4 h-4 mr-2" />
              Storage
            </TabsTrigger>
          )}
           {isAdmin && (
            <TabsTrigger value="configuracion">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Configuración
            </TabsTrigger>
          )}
          {isAdmin && !isSuperadmin && (
            <TabsTrigger value="integraciones">
              <Plug className="w-4 h-4 mr-2" />
              Integraciones
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="perfil">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Usuario</CardTitle>
                <CardDescription>
                  {isSuperadmin ? 'Datos de tu cuenta de administración de plataforma' : 'Datos de tu cuenta y credenciales de acceso'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AvatarUpload />
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      Nombre completo
                    </Label>
                    <Input 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tu nombre completo"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={savingName || !fullName.trim() || fullName.trim() === (user?.user_metadata?.full_name || '')}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-3 h-3" />
                      {savingName ? 'Guardando...' : 'Guardar nombre'}
                    </Button>
                  </div>

                  {isSuperadmin ? (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        Contexto actual
                      </Label>
                      <div className="flex items-center gap-2 h-10">
                        <Badge variant="outline" className="text-sm border-primary/30 text-primary px-3 py-1.5">
                          <Shield className="w-3.5 h-3.5 mr-1.5" />
                          Plataforma — Superadmin
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        Empresa
                      </Label>
                      <Input 
                        value={company?.name || 'No disponible'} 
                        readOnly 
                        className="glass bg-muted/50"
                      />
                      {!isAdmin && (
                        <p className="text-xs text-muted-foreground">
                          Solo el administrador puede editar el nombre de la empresa.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Role badge for non-superadmin */}
                {!isSuperadmin && role && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="w-4 h-4" />
                      Rol
                    </Label>
                    <Badge variant="secondary" className="text-sm px-3 py-1.5">
                      {roleLabel}
                    </Badge>
                  </div>
                )}

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Credenciales de Acceso</h3>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      Email
                    </Label>
                    <Input 
                      value={user?.email || 'No disponible'} 
                      readOnly 
                      className="glass bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <KeyRound className="w-4 h-4" />
                      Contraseña
                    </Label>
                    <div className="flex items-center gap-3">
                      <Input 
                        type="password"
                        value="••••••••••••"
                        readOnly 
                        className="glass bg-muted/50 max-w-xs"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetPassword}
                        disabled={resetSent}
                        className="flex items-center gap-2 whitespace-nowrap"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        {resetSent ? 'Email enviado' : 'Cambiar contraseña'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Se enviará un enlace de restablecimiento a tu correo.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Cuenta creada
                  </Label>
                  <Input 
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No disponible'} 
                    readOnly 
                    className="glass bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">ID de usuario</Label>
                  <Input 
                    value={user?.id || 'No disponible'} 
                    readOnly 
                    className="glass bg-muted/50 text-xs font-mono"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isAdmin && !isSuperadmin && (
          <TabsContent value="organizacion">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Datos de la Organización</CardTitle>
                  <CardDescription>
                    Edita el nombre de tu empresa. Este cambio se refleja para todos los miembros.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Nombre de la empresa</Label>
                    <Input
                      id="org-name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      if (!orgName.trim()) return;
                      setSavingOrg(true);
                      try {
                        await updateCompanyName(orgName.trim());
                        toast({ title: "Empresa actualizada", description: "El nombre de la empresa se guardó correctamente." });
                      } catch (err: any) {
                        toast({ title: "Error", description: err.message || "No se pudo guardar.", variant: "destructive" });
                      } finally {
                        setSavingOrg(false);
                      }
                    }}
                    disabled={savingOrg || !orgName.trim() || orgName.trim() === company?.name}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {savingOrg ? 'Guardando...' : 'Guardar'}
                  </Button>
                </CardContent>
              </Card>
              <ServiceTypesSettings />
            </div>
          </TabsContent>
        )}

        {isAdmin && !isSuperadmin && (
          <TabsContent value="storage">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storage / File Index</CardTitle>
                  <CardDescription>
                    Configure el índice de carpetas de red para sus proyectos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Habilitar índice de carpetas de red</Label>
                      <p className="text-sm text-muted-foreground">
                        Permite asociar rutas de carpetas de red a cada proyecto.
                      </p>
                    </div>
                    <Switch
                      checked={networkEnabled}
                      onCheckedChange={setNetworkEnabled}
                    />
                  </div>

                  {networkEnabled && (
                    <div className="space-y-2">
                      <Label>Ruta base de red (UNC/SMB)</Label>
                      <Input
                        value={networkBasePath}
                        onChange={e => setNetworkBasePath(e.target.value)}
                        placeholder="\\dropbox\The Sign Space\Projects\"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ruta UNC SMB para Windows LAN. Solo referencia. No sube archivos.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={async () => {
                      setSavingStorage(true);
                      try {
                        await updateCompanySettings({
                          enable_network_index: networkEnabled,
                          network_base_path: networkBasePath.trim() || null,
                        });
                        toast({ title: "Configuración de storage guardada" });
                      } catch (err: any) {
                        toast({ title: "Error", description: err.message, variant: "destructive" });
                      } finally { setSavingStorage(false); }
                    }}
                    disabled={savingStorage}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {savingStorage ? 'Guardando...' : 'Guardar'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="configuracion">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Apariencia</CardTitle>
                <CardDescription>
                  Configure el tema y efectos visuales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Tema</Label>
                  <RadioGroup
                    value={formData.theme}
                    onValueChange={(value: 'light' | 'dark') => setFormData(prev => ({ ...prev, theme: value }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Claro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Oscuro</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Efecto Cristal (Glass)</Label>
                    <p className="text-sm text-muted-foreground">
                      Activa o desactiva los efectos de cristal translúcido
                    </p>
                  </div>
                  <Switch
                    checked={formData.glassEffect}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, glassEffect: checked }))}
                  />
                </div>

                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Guardar Apariencia
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restauración</CardTitle>
                <CardDescription>
                  Restaure la configuración de apariencia a los valores predeterminados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Restaurar Valores Predeterminados
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Restaurar configuración predeterminada?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción restaurará la configuración de apariencia a los valores predeterminados.
                        Los datos de negocio no se verán afectados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        resetToDefaults();
                        setFormData(settings);
                        toast({ title: "Configuración restaurada", description: "La configuración fue restaurada a los valores predeterminados." });
                      }}>
                        Restaurar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
          </TabsContent>
        )}
        {isAdmin && !isSuperadmin && (
          <TabsContent value="integraciones">
            <div className="grid gap-6">
              <Card className="relative overflow-hidden border-0 bg-card/80 backdrop-blur-sm">
                {/* Animated gradient border */}
                <div className="absolute inset-0 rounded-lg p-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] -z-10" />
                <div className="absolute inset-[1px] rounded-[7px] bg-card -z-[5]" />

                {/* Q2 2026 badge */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs font-semibold">
                    Q2 2026
                  </Badge>
                </div>

                <CardHeader>
                  <div className="flex items-center gap-4">
                    {/* QB Logo */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold opacity-60"
                      style={{ backgroundColor: '#2CA01C', color: 'white' }}>
                      QB
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">QuickBooks Online</CardTitle>
                        <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30 text-xs">
                          Próximamente
                        </Badge>
                      </div>
                      <CardDescription>
                        Sincronización bidireccional automática de clientes, propuestas e invoices
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                      Clientes sincronizados en tiempo real
                    </li>
                    <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                      Propuestas convertidas a Estimates en QBO
                    </li>
                    <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-muted-foreground/60 flex-shrink-0" />
                      Pagos registrados como Invoices automáticamente
                    </li>
                  </ul>

                  <Button
                    className="flex items-center gap-2"
                    onClick={() => {
                      toast({
                        title: '¡Te avisaremos cuando esté listo!',
                        description: 'Recibirás una notificación cuando la integración con QuickBooks esté disponible.',
                      });
                    }}
                  >
                    <Bell className="w-4 h-4" />
                    Notificarme cuando esté disponible
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </ResponsiveLayout>
  );
}
