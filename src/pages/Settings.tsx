import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useUserSettingsQuery } from "@/hooks/queries/useUserSettingsQuery";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useCompany } from "@/hooks/useCompany";
import { useLanguage } from "@/i18n/LanguageContext";
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
import { RotateCcw, Save, Settings as SettingsIcon, User, Mail, Building2, Calendar, FolderOpen, Shield, KeyRound, Plug, CheckCircle2, Bell, List, Moon, CreditCard, Upload, Loader2, ImageIcon, Trash2 } from "lucide-react";
import { AvatarUpload } from "@/components/AvatarUpload";
import { ServiceTypesSettings } from "@/components/settings/ServiceTypesSettings";
import IntegrationsCards from "@/components/settings/IntegrationsCards";
import { CatalogManager } from "@/components/settings/CatalogManager";
import { useSeedCatalogs } from "@/hooks/useSeedCatalogs";
import { supabase } from "@/integrations/supabase/client";
import { PricingSection } from "@/components/settings/PricingSection";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MFASettings } from "@/components/settings/MFASettings";


export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { settings, updateSettingsMutation, resetToDefaultsMutation } = useUserSettingsQuery(user?.id);
  const updateSettings = (updates: any) => updateSettingsMutation.mutate(updates);
  const resetToDefaults = () => resetToDefaultsMutation.mutate();
  const { isAdmin, isSuperadmin, role } = useUserRole();
  const { company, updateCompanyName, updateCompanySettings } = useCompany();
  const { t, locale } = useLanguage();
  const isEn = locale === "en";
  const planLimits = usePlanLimits();
  const { toast } = useToast();
  
  
  const [formData, setFormData] = useState(settings);
  const [showPassword, setShowPassword] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [savingOrg, setSavingOrg] = useState(false);
  const [networkEnabled, setNetworkEnabled] = useState(false);
  const [networkBasePath, setNetworkBasePath] = useState('');
  const [savingStorage, setSavingStorage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Editable full name
  const [fullName, setFullName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const activeTab = searchParams.get('tab') || (isAdmin ? 'configuracion' : 'perfil');

  // Seed default catalog items when admin visits settings
  useSeedCatalogs();


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
      title: isEn ? "Settings saved" : "Configuración guardada",
      description: isEn ? "Settings updated successfully." : "La configuración se actualizó correctamente.",
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

      toast({ title: isEn ? "Name updated" : "Nombre actualizado", description: isEn ? "Your name was saved successfully." : "Tu nombre se guardó correctamente." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || (isEn ? "Could not save." : "No se pudo guardar."), variant: "destructive" });
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
      toast({ title: isEn ? "Email sent" : "Email enviado", description: isEn ? "Check your inbox to change your password." : "Revisa tu correo para cambiar la contraseña." });
    }
  };

  const roleLabel = isSuperadmin ? 'Superadmin' : role === 'admin' ? 'Admin' : role === 'sales' ? 'Sales' : role === 'operations' ? 'Operations' : role === 'viewer' ? 'Viewer' : role === 'member' ? 'Member' : '—';

  return (
    <ResponsiveLayout
      title={t.settings.title}
      subtitle={t.settings.subtitle}
      icon={SettingsIcon}
    >
      <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })} className="w-full">
         <TabsList className="mb-6">
          <TabsTrigger value="perfil">
            <User className="w-4 h-4 mr-2" />
            {t.settings.tabs.profile}
          </TabsTrigger>
           {isAdmin && !isSuperadmin && (
            <TabsTrigger value="organizacion">
              <Building2 className="w-4 h-4 mr-2" />
              {t.settings.tabs.organization}
            </TabsTrigger>
          )}
          {isAdmin && !isSuperadmin && (
            <TabsTrigger value="storage">
              <FolderOpen className="w-4 h-4 mr-2" />
              {t.settings.tabs.storage}
            </TabsTrigger>
          )}
           {isAdmin && (
            <TabsTrigger value="configuracion">
              <SettingsIcon className="w-4 h-4 mr-2" />
              {t.settings.tabs.configuration}
            </TabsTrigger>
          )}
          {isAdmin && !isSuperadmin && (
            <TabsTrigger value="catalogos">
              <List className="w-4 h-4 mr-2" />
              {t.settings.tabs.catalogs}
            </TabsTrigger>
          )}
           {isAdmin && !isSuperadmin && (
            <TabsTrigger value="integraciones">
              <Plug className="w-4 h-4 mr-2" />
              {t.settings.tabs.integrations}
            </TabsTrigger>
          )}
          {isAdmin && !isSuperadmin && (
            <TabsTrigger value="suscripcion">
              <CreditCard className="w-4 h-4 mr-2" />
              {t.settings.tabs.subscription}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="perfil">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.settings.profile.title}</CardTitle>
                <CardDescription>
                  {isSuperadmin ? t.settings.profile.subtitleSuperadmin : t.settings.profile.subtitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AvatarUpload />
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      {t.settings.profile.fullName}
                    </Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t.settings.profile.fullNamePlaceholder}
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      disabled={savingName || !fullName.trim() || fullName.trim() === (user?.user_metadata?.full_name || '')}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-3 h-3" />
                      {savingName ? t.settings.profile.saving : t.settings.profile.saveName}
                    </Button>
                  </div>

                  {isSuperadmin ? (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        {t.settings.profile.currentContext}
                      </Label>
                      <div className="flex items-center gap-2 h-10">
                        <Badge variant="outline" className="text-sm border-primary/30 text-primary px-3 py-1.5">
                          <Shield className="w-3.5 h-3.5 mr-1.5" />
                          {t.settings.profile.platformSuperadmin}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        {t.settings.profile.company}
                      </Label>
                      <Input
                        value={company?.name || t.settings.profile.notAvailable}
                        readOnly
                        className="glass bg-muted/50"
                      />
                      {!isAdmin && (
                        <p className="text-xs text-muted-foreground">
                          {t.settings.profile.adminOnlyNote}
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
                      {t.settings.profile.role}
                    </Label>
                    <Badge className="text-sm px-3 py-1.5 font-bold bg-primary/10 text-primary border border-primary/30 rounded-full">
                      {roleLabel}
                    </Badge>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 500 }}>{t.settings.profile.preferredLanguage}</p>
                    <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                      {t.settings.profile.languageSubtitle}
                    </p>
                  </div>
                  <LanguageSwitcher />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t.settings.profile.credentials}</h3>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {t.common.email}
                    </Label>
                    <Input
                      value={user?.email || t.settings.profile.notAvailable}
                      readOnly
                      className="glass bg-muted/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <KeyRound className="w-4 h-4" />
                      {t.settings.profile.password}
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
                        {resetSent ? t.settings.profile.emailSent : t.settings.profile.changePassword}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.settings.profile.resetPasswordNote}
                    </p>
                  </div>
                </div>
                <Separator />
                <MFASettings />
                <Separator />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {t.settings.profile.accountCreated}
                  </Label>
                  <Input
                    value={user?.created_at ? new Date(user.created_at).toLocaleDateString(isEn ? 'en-US' : 'es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : t.settings.profile.notAvailable}
                    readOnly
                    className="glass bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">{t.settings.profile.userId}</Label>
                  <Input
                    value={user?.id || t.settings.profile.notAvailable}
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
                  <CardTitle>{t.settings.org.title}</CardTitle>
                  <CardDescription>{t.settings.org.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Company Logo */}
                  <div className="space-y-3">
                    <Label>{t.settings.org.logo}</Label>
                    <div className="flex items-center gap-4">
                      {company?.logo_url ? (
                        <div className="relative group">
                          <img
                            src={company.logo_url}
                            alt={company.name}
                            className="h-16 max-w-[200px] object-contain rounded-lg border border-border p-2 bg-muted/30"
                          />
                          <button
                            onClick={async () => {
                              if (!company) return;
                              try {
                                await supabase.from('companies').update({ logo_url: null }).eq('id', company.id);
                                toast({ title: isEn ? "Logo removed" : "Logo eliminado" });
                                window.location.reload();
                              } catch { /* noop */ }
                            }}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-16 w-32 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/20">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={uploadingLogo}
                          onClick={() => document.getElementById('company-logo-input')?.click()}
                          className="flex items-center gap-2"
                        >
                          {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploadingLogo ? t.settings.org.uploading : company?.logo_url ? t.settings.org.changeLogo : t.settings.org.uploadLogo}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">{t.settings.org.logoNote}</p>
                        <input
                          id="company-logo-input"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !company || !user) return;
                            if (file.size > 2 * 1024 * 1024) {
                              toast({ title: "Error", description: isEn ? "File is too large. Maximum 2MB." : "El archivo es muy grande. Máximo 2MB.", variant: "destructive" });
                              return;
                            }
                            setUploadingLogo(true);
                            try {
                              const ext = file.name.split('.').pop() || 'png';
                              const path = `${user.id}/logo.${ext}`;
                              const { error: upErr } = await supabase.storage.from('company-logos').upload(path, file, { upsert: true });
                              if (upErr) throw upErr;
                              const { data: urlData } = supabase.storage.from('company-logos').getPublicUrl(path);
                              const logoUrl = urlData.publicUrl + '?t=' + Date.now();
                              await supabase.from('companies').update({ logo_url: logoUrl }).eq('id', company.id);
                              toast({ title: isEn ? "Logo updated" : "Logo actualizado", description: isEn ? "Logo saved successfully." : "El logo se guardó correctamente." });
                              window.location.reload();
                            } catch (err: any) {
                              toast({ title: "Error", description: err.message, variant: "destructive" });
                            } finally {
                              setUploadingLogo(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="org-name">{t.settings.org.companyName}</Label>
                    <Input
                      id="org-name"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder={t.settings.org.namePlaceholder}
                    />
                  </div>
                  <Button
                    onClick={async () => {
                      if (!orgName.trim()) return;
                      setSavingOrg(true);
                      try {
                        await updateCompanyName(orgName.trim());
                        toast({ title: isEn ? "Company updated" : "Empresa actualizada", description: isEn ? "Company name saved successfully." : "El nombre de la empresa se guardó correctamente." });
                      } catch (err: any) {
                        toast({ title: "Error", description: err.message || (isEn ? "Could not save." : "No se pudo guardar."), variant: "destructive" });
                      } finally {
                        setSavingOrg(false);
                      }
                    }}
                    disabled={savingOrg || !orgName.trim() || orgName.trim() === company?.name}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {savingOrg ? t.settings.org.saving : t.settings.org.save}
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
                  <CardTitle>{t.settings.storage.title}</CardTitle>
                  <CardDescription>{t.settings.storage.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t.settings.storage.enableNetwork}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t.settings.storage.enableNetworkDesc}
                      </p>
                    </div>
                    <Switch
                      checked={networkEnabled}
                      onCheckedChange={setNetworkEnabled}
                    />
                  </div>

                  {networkEnabled && (
                    <div className="space-y-2">
                      <Label>{t.settings.storage.networkPath}</Label>
                      <Input
                        value={networkBasePath}
                        onChange={e => setNetworkBasePath(e.target.value)}
                        placeholder="\\dropbox\The Sign Space\Projects\"
                      />
                      <p className="text-xs text-muted-foreground">
                        {t.settings.storage.networkPathNote}
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
                        toast({ title: isEn ? "Storage settings saved" : "Configuración de storage guardada" });
                      } catch (err: any) {
                        toast({ title: "Error", description: err.message, variant: "destructive" });
                      } finally { setSavingStorage(false); }
                    }}
                    disabled={savingStorage}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {savingStorage ? t.settings.storage.saving : t.settings.storage.save}
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
                  <CardTitle>{t.settings.config.appearanceTitle}</CardTitle>
                  <CardDescription>{t.settings.config.appearanceSubtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>{t.settings.config.theme}</Label>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Moon className="w-4 h-4" />
                      <span>{t.settings.config.darkModePermanent}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t.settings.config.glassEffect}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t.settings.config.glassEffectDesc}
                      </p>
                    </div>
                    <Switch
                      checked={formData.glassEffect}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, glassEffect: checked }))}
                    />
                  </div>

                  <Button onClick={handleSave} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {t.settings.config.saveAppearance}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.settings.config.restoreTitle}</CardTitle>
                  <CardDescription>{t.settings.config.restoreSubtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        {t.settings.config.restoreButton}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.settings.config.restoreConfirmTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t.settings.config.restoreConfirmDesc}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                          resetToDefaults();
                          setFormData(settings);
                          toast({ title: isEn ? "Settings restored" : "Configuración restaurada", description: isEn ? "Settings have been restored to defaults." : "La configuración fue restaurada a los valores predeterminados." });
                        }}>
                          {t.settings.config.restore}
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
          <TabsContent value="catalogos">
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">{t.settings.catalogs.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.settings.catalogs.subtitle}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CatalogManager
                  type="lead_service"
                  title={isEn ? "Services" : "Servicios"}
                  description={isEn ? "Types of work you offer. Shown when creating a lead." : "Tipos de trabajo que ofreces. Aparece al crear un lead."}
                />
                <CatalogManager
                  type="lead_source"
                  title={isEn ? "Lead sources" : "Fuentes de leads"}
                  description={isEn ? "How the client found you. Shown when creating a lead." : "Cómo te encontró el cliente. Aparece al crear un lead."}
                />
                <CatalogManager
                  type="lead_status"
                  title={isEn ? "Lead statuses" : "Estados de leads"}
                  description={isEn ? "Stages of the sales process." : "Etapas del proceso de venta."}
                  hasColor
                />
                <CatalogManager
                  type="order_status"
                  title={isEn ? "Order statuses" : "Estados de órdenes"}
                  description={isEn ? "Stages of the production and installation process." : "Etapas del proceso de producción e instalación."}
                  hasColor
                />
                <CatalogManager
                  type="material_type"
                  title={isEn ? "Material types" : "Tipos de materiales"}
                  description={isEn ? "Materials available when building a proposal." : "Materiales disponibles al armar una propuesta."}
                />
              </div>
            </div>
          </TabsContent>
        )}
        {isAdmin && !isSuperadmin && (
          <TabsContent value="integraciones">
            <IntegrationsCards />
          </TabsContent>
        )}
        {isAdmin && !isSuperadmin && (
          <TabsContent value="suscripcion">
            <div className="grid gap-6">
              {!planLimits.loading && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <CardTitle>{t.settings.planUsage.title}</CardTitle>
                        <CardDescription>{t.settings.planUsage.subtitle}</CardDescription>
                      </div>
                      <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/30 px-3 py-1 text-sm font-semibold">
                        {t.settings.planUsage.plan} {planLimits.planName}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {(
                      [
                        { key: "work_orders" as const, label: t.settings.planUsage.workOrders },
                        { key: "leads" as const, label: t.settings.planUsage.leads },
                        { key: "users" as const, label: t.settings.planUsage.users },
                        { key: "proposals" as const, label: t.settings.planUsage.proposals },
                      ] as const
                    ).map(({ key, label }) => {
                      const lim = planLimits[key];
                      const pct = lim.isUnlimited ? 0 : Math.min((lim.current / lim.max) * 100, 100);
                      const barColor = lim.isAtLimit
                        ? "#ef4444"
                        : lim.isNearLimit
                        ? "#f59e0b"
                        : "#8b5cf6";
                      return (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{label}</span>
                            <span className={lim.isAtLimit ? "text-red-400 font-semibold" : lim.isNearLimit ? "text-amber-400 font-semibold" : "text-foreground"}>
                              {lim.isUnlimited ? t.settings.planUsage.unlimited : `${lim.current} / ${lim.max}`}
                            </span>
                          </div>
                          {!lim.isUnlimited && (
                            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, backgroundColor: barColor }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {planLimits.planName !== "Empresarial" && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {}}
                          className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                        >
                          {t.settings.planUsage.upgradeButton}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              <PricingSection />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </ResponsiveLayout>
  );
}
