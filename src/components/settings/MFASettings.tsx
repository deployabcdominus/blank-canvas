import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ShieldCheck, ShieldAlert, Loader2, QrCode, Trash2, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

export function MFASettings() {
  const { locale } = useLanguage();
  const isEn = locale === "en";
  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState("");
  const [verifying, setVerifying] = useState(false);

  const fetchFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setFactors(data.all || []);
    } catch (err: any) {
      console.error("Error listing MFA factors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactors();
  }, []);

  const startEnrollment = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });
      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
    } catch (err: any) {
      toast.error(err.message);
      setEnrolling(false);
    }
  };

  const verifyEnrollment = async () => {
    if (!factorId) return;
    setVerifying(true);
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: factorId, // In Supabase TOTP enrollment, factorId is used for challenge
        code: otpValue,
      });
      if (error) throw error;

      toast.success(t.settings.mfa.toasts.enabled);
      setEnrolling(false);
      setQrCode(null);
      setFactorId(null);
      setOtpValue("");
      fetchFactors();
    } catch (err: any) {
      toast.error(t.settings.mfa.toasts.invalidCode);
    } finally {
      setVerifying(false);
    }
  };

  const unenrollFactor = async (fId: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: fId });
      if (error) throw error;
      toast.success(t.settings.mfa.toasts.removed);
      fetchFactors();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const activeFactors = factors.filter(f => f.status === 'verified');
  const { t } = useLanguage();

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${activeFactors.length > 0 ? 'bg-mint/20 text-mint' : 'bg-muted text-muted-foreground'}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>{t.settings.mfa.title}</CardTitle>
            <CardDescription>
              {t.settings.mfa.subtitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeFactors.length > 0 ? (
          <div className="space-y-4">
            {activeFactors.map(factor => (
              <div key={factor.id} className="flex items-center justify-between p-4 rounded-lg bg-background border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center text-mint">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{factor.friendly_name || t.settings.mfa.authenticatorApp}</p>
                    <p className="text-xs text-muted-foreground">{t.settings.mfa.verified} • {new Date(factor.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => unenrollFactor(factor.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t.settings.mfa.disable}
                </Button>
              </div>
            ))}
          </div>
        ) : !enrolling ? (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">{t.settings.mfa.notEnabled}</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t.settings.mfa.recommendation}
              </p>
            </div>
            <Button onClick={startEnrollment} className="mt-2">
              <QrCode className="w-4 h-4 mr-2" />
              {t.settings.mfa.enable}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
            {qrCode && (
              <div className="p-4 bg-white rounded-xl border border-border shadow-sm">
                <QRCodeSVG value={qrCode} size={180} />
              </div>
            )}
            
            <div className="text-center space-y-2">
              <p className="text-sm font-medium">
                {isEn ? "Scan the QR code with your authenticator app" : "Escanea el código QR con tu app de autenticación"}
              </p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {isEn 
                  ? "Open Google Authenticator, Authy, or similar and scan this code, then enter the 6-digit verification code below." 
                  : "Abre Google Authenticator, Authy o similar y escanea este código, luego ingresa el código de 6 dígitos abajo."}
              </p>
            </div>

            <div className="space-y-4 flex flex-col items-center">
              <InputOTP 
                maxLength={6} 
                value={otpValue} 
                onChange={setOtpValue}
                onComplete={verifyEnrollment}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => { setEnrolling(false); setQrCode(null); }}
                  disabled={verifying}
                >
                  {isEn ? "Cancel" : "Cancelar"}
                </Button>
                <Button 
                  onClick={verifyEnrollment} 
                  disabled={otpValue.length !== 6 || verifying}
                >
                  {verifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isEn ? "Verify & Activate" : "Verificar y Activar"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
