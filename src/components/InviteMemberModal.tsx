import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/hooks/useCompany";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEmail } from "@/hooks/useEmail";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Mail } from "lucide-react";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal = ({ isOpen, onClose }: InviteMemberModalProps) => {
  const { user } = useAuth();
  const { company } = useCompany();
  const { fullName } = useUserProfile();
  const { sendInvitationEmail } = useEmail();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [isLoading, setIsLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    if (!email.trim() || !user || !company) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("invitations")
        .insert({
          company_id: company.id,
          email: email.trim().toLowerCase(),
          role,
          created_by_user_id: user.id,
        } as any)
        .select("token")
        .single();

      if (error) throw error;

      const productionDomain = import.meta.env.VITE_APP_URL ?? window.location.origin;
      const link = `${productionDomain}/invite?token=${(data as any).token}`;
      setInviteLink(link);

      const ROLE_LABELS: Record<string, string> = {
        admin: "Admin", sales: "Ventas", operations: "Operaciones",
        member: "Comercial", viewer: "Visor",
      };

      // Fire-and-forget: email never blocks the invitation flow
      sendInvitationEmail(email.trim().toLowerCase(), {
        inviterName: fullName,
        companyName: company.name,
        logoUrl: company.logo_url || "",
        roleName: ROLE_LABELS[role] || role,
        inviteUrl: link,
      });

      toast({ title: "Invitación creada", description: `Link de invitación generado para ${email}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "No se pudo crear la invitación", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setEmail("");
    setRole("member");
    setInviteLink(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Invitar Miembro
          </DialogTitle>
        </DialogHeader>

        {!inviteLink ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email del invitado *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
              <p className="text-xs text-muted-foreground">
                El invitado solo podrá registrarse con este email exacto.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sales">Ventas</SelectItem>
                  <SelectItem value="operations">Operaciones</SelectItem>
                  <SelectItem value="member">Comercial</SelectItem>
                  <SelectItem value="viewer">Visor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button
                onClick={handleInvite}
                disabled={!email.trim() || isLoading}
              >
                {isLoading ? "Creando..." : "Generar Invitación"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium mb-2">Link de invitación para {email}:</p>
              <div className="flex items-center gap-2">
                <Input value={inviteLink} readOnly className="text-xs" />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Este link expira en 7 días. Compártelo solo con {email}.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full" variant="outline">Cerrar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
