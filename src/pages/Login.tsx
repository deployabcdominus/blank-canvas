import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { getHomeRouteForUser } from "@/lib/role-redirect";
import { hasCompany } from "@/lib/auth-helpers";
import { Checkbox } from "@/components/ui/checkbox";
import { PageTransition } from "@/components/PageTransition";
import { SignFlowLogo } from "@/components/SignFlowLogo";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const inviteToken = searchParams.get("invite") || searchParams.get("token");

  useEffect(() => {
    // Clean up potentially sensitive data from storage on reach
    localStorage.removeItem("invite_token");
    localStorage.removeItem("invite_email");
    sessionStorage.removeItem("pendingInviteToken");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(formData.email, formData.password);

    if (!error) {
      toast({
        title: "¡Bienvenido de vuelta!",
        description: "Inicio de sesión exitoso.",
      });

      // If there's an invite token in the URL, pass it to the invite validation page
      if (inviteToken) {
        navigate(`/invite?token=${inviteToken}`);
        setIsLoading(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const homeRoute = await getHomeRouteForUser(authData.user.id);
        if (homeRoute === "/superadmin") {
          navigate("/superadmin");
        } else {
          const userHasCompany = await hasCompany(authData.user.id);
          navigate(userHasCompany ? "/dashboard" : "/onboarding");
        }
      }
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim()) {
      toast({
        title: "Ingresa tu email",
        description: "Escribe tu email en el campo de arriba y luego haz clic en '¿Olvidaste tu contraseña?'",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/settings?tab=perfil`,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Email enviado",
        description: "Revisa tu correo para restablecer tu contraseña.",
      });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-w-md relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-16 h-16 mx-auto mb-6 glass-card rounded-2xl flex items-center justify-center border-primary/20 shadow-lg shadow-primary/5"
            >
              <SignFlowLogo variant="technical" className="w-7 h-7 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight mb-4">Bienvenido de vuelta</h1>
            <div className="text-[10px] text-muted-foreground/60 max-w-xs mx-auto text-left whitespace-pre-wrap leading-relaxed opacity-50 hover:opacity-100 transition-opacity">
              {`Analise toda a aplicação antes de realizar qualquer alteração e torne TODAS as páginas, componentes e fluxos 100% responsivos em todos os dispositivos.

Seu objetivo é garantir que o sistema funcione perfeitamente em qualquer tamanho de tela, incluindo mobile (pequenos smartphones), tablets, notebooks, desktops e telas ultrawide, sem quebras de layout, overflow ou perda de usabilidade.

━━━━━━━━━━━━━━━━━━━
OBJETIVO PRINCIPAL
━━━━━━━━━━━━━━━━━━━

Transformar toda a aplicação em uma interface totalmente responsiva, fluida e adaptativa, com excelente experiência de uso em qualquer dispositivo.

━━━━━━━━━━━━━━━━━━━
ANÁLISE OBRIGATÓRIA
━━━━━━━━━━━━━━━━━━━

Antes de qualquer alteração, analise:

- Todas as páginas e rotas do sistema
- Layouts principais e secundários
- Componentes reutilizáveis
- Containers e grids
- Breakpoints atuais (ou ausência deles)
- Uso de width/height fixos (px)
- Overflow horizontal ou vertical
- Elementos quebrando em telas pequenas
- Tipografia em diferentes tamanhos de tela
- Botões e áreas clicáveis em mobile
- Formulários e inputs
- Modais, dropdowns e menus
- Imagens e assets
- Tabelas e listas complexas
- Navegação e sidebar
- Espaçamentos fixos vs flexíveis

━━━━━━━━━━━━━━━━━━━
OBJETIVOS DE RESPONSIVIDADE
━━━━━━━━━━━━━━━━━━━

- Eliminar qualquer overflow horizontal
- Garantir leitura perfeita em telas pequenas
- Adaptar todos os layouts dinamicamente
- Manter consistência visual entre dispositivos
- Garantir usabilidade total no mobile
- Otimizar interação por toque (touch)
- Garantir boa hierarquia visual em qualquer tela

━━━━━━━━━━━━━━━━━━━
MELHORIAS OBRIGATÓRIAS
━━━━━━━━━━━━━━━━━━━

LAYOUT E ESTRUTURA:
- Substituir widths fixos por layouts flexíveis
- Usar Flexbox e Grid corretamente
- Aplicar containers responsivos
- Ajustar breakpoints consistentes
- Reorganizar layouts para mobile-first quando necessário

MOBILE (PRIORIDADE MÁXIMA):
- Ajustar espaçamentos para telas pequenas
- Garantir botões com tamanho adequado para toque
- Evitar elementos muito próximos
- Melhorar menus mobile (hamburger/drawer)
- Simplificar layouts complexos no mobile
- Evitar tabelas quebradas (usar scroll ou cards)

TIPOGRAFIA:
- Ajustar tamanhos de fonte por breakpoint
- Garantir legibilidade em telas pequenas
- Evitar textos longos sem quebra
- Ajustar line-height responsivo

IMAGENS E MÍDIA:
- Garantir imagens fluidas (max-width: 100%)
- Evitar distorção de proporção
- Otimizar visualização em diferentes telas
- Ajustar vídeos e embeds responsivos

COMPONENTES:
- Tornar todos os componentes adaptáveis
- Ajustar cards para colunas responsivas
- Melhorar modais em mobile (fullscreen quando necessário)
- Ajustar dropdowns e menus flutuantes

FORMULÁRIOS:
- Inputs ocupando largura correta em mobile
- Melhor espaçamento entre campos
- Botões full-width quando necessário
- Melhor UX de preenchimento em telas pequenas

NAVEGAÇÃO:
- Sidebar adaptativa (colapsável no mobile)
- Menus responsivos e acessíveis
- Navegação simplificada no mobile
- Evitar excesso de elementos na header

━━━━━━━━━━━━━━━━━━━
BREAKPOINTS PADRÃO (SE NECESSÁRIO)
━━━━━━━━━━━━━━━━━━━

- Mobile: até 480px
- Mobile large: até 640px
- Tablet: até 768px
- Laptop: até 1024px
- Desktop: até 1280px+
- Large screens: 1536px+

━━━━━━━━━━━━━━━━━━━
REGRAS IMPORTANTES
━━━━━━━━━━━━━━━━━━━

- NÃO quebrar funcionalidades existentes
- NÃO remover componentes ou features
- NÃO alterar o design base sem necessidade
- Priorizar adaptação, não reconstrução total
- Manter consistência visual em todos os tamanhos
- Evitar soluções temporárias ou gambiarras
- Usar boas práticas modernas (Flexbox/Grid)
- Garantir performance junto com responsividade

━━━━━━━━━━━━━━━━━━━
VALIDAÇÃO FINAL OBRIGATÓRIA
━━━━━━━━━━━━━━━━━━━

Após aplicar melhorias:

- Testar todas as páginas em mobile, tablet e desktop
- Verificar ausência de overflow
- Verificar legibilidade geral
- Verificar usabilidade no toque
- Verificar consistência de layout
- Garantir que nada quebrou visualmente
- Garantir navegação fluida em qualquer tela

━━━━━━━━━━━━━━━━━━━
RESULTADO ESPERADO
━━━━━━━━━━━━━━━━━━━

O sistema deve estar:

- 100% responsivo
- Totalmente adaptável a qualquer tela
- Sem quebras de layout
- Sem scroll horizontal indesejado
- Com excelente UX em mobile
- Visualmente consistente em todos os dispositivos
- Pronto para produção profissional`}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="glass-card p-8 border-white/10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Email</Label>
                <Input
                  id="email" type="email" placeholder="Ingresa tu email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required className="glass input-glow h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Contraseña</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Ingresa tu contraseña"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required className="glass input-glow h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe} 
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="remember" className="text-sm font-medium leading-none cursor-pointer text-muted-foreground/80 hover:text-foreground transition-colors">
                    Recuérdame
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  className="w-full btn-violet h-12 shadow-lg shadow-primary/20"
                  size="lg" disabled={isLoading}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {isLoading ? "Ingresando..." : "Ingresar"}
                </Button>
              </motion.div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <button onClick={() => navigate('/register')} className="font-semibold text-primary hover:underline underline-offset-4">
                Regístrate aquí
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
