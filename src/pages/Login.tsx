import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Eye, EyeOff, Loader2, LogIn, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { getHomeRouteForUser } from "@/lib/role-redirect";
import { hasCompany } from "@/lib/auth-helpers";
import { Checkbox } from "@/components/ui/checkbox";
import { PageTransition } from "@/components/PageTransition";

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
              <Lock className="w-7 h-7 text-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenido de vuelta</h1>
            <p className="text-muted-foreground/80 whitespace-pre-wrap">
              Inicia sesión para continuar en SignFlow. Analise completamente todo o projeto e identifique TODOS os bugs, erros, falhas, comportamentos inesperados e possíveis problemas existentes na aplicação.

Seu objetivo é realizar uma auditoria técnica profunda no sistema inteiro, corrigindo problemas de lógica, frontend, backend, integração, renderização, estado, banco de dados, responsividade e performance.

Antes de modificar qualquer coisa:
- Analise toda a estrutura do projeto
- Analise rotas
- Analise componentes
- Analise hooks
- Analise estados globais
- Analise integrações
- Analise Supabase
- Analise APIs
- Analise banco de dados
- Analise autenticação
- Analise permissões
- Analise carregamentos
- Analise console errors
- Analise warnings
- Analise logs
- Analise comportamento da interface
- Analise responsividade
- Analise possíveis falhas silenciosas
- Analise segurança básica
- Analise fluxos completos do sistema

Identifique e corrija:
- Bugs visuais
- Bugs de navegação
- Erros de console
- Warnings
- Loops infinitos
- Problemas de renderização
- Re-renderizações desnecessárias
- Falhas de autenticação
- Problemas de sessão
- Problemas de permissões
- Problemas de loading
- Problemas de estado
- Problemas de sincronização
- Problemas de responsividade
- Problemas de formulários
- Problemas de validação
- Problemas em chamadas API
- Problemas em queries Supabase
- Problemas de realtime
- Problemas de cache
- Problemas de tipagem
- Problemas de imports
- Problemas de dependências
- Problemas de performance
- Problemas de UX
- Problemas mobile
- Problemas de acessibilidade
- Memory leaks
- Requests duplicados
- Condições de corrida
- Falhas silenciosas
- Tratamento incorreto de erros
- Quebras em edge cases

Verifique especialmente:
- Fluxos de login/logout
- Persistência de sessão
- Proteção de rotas
- Navegação entre páginas
- CRUDs completos
- Uploads
- Modais
- Estados assíncronos
- Atualizaciones em tempo real
- Compatibilidade mobile
- Responsividade geral
- Componentes reutilizáveis
- Integrações externas
- Webhooks
- Fluxos críticos do sistema

Durante a análise:
1. Liste os problemas encontrados
2. Explique a causa de cada problema
3. Explique o impacto no sistema
4. Corrija utilizando boas práticas modernas
5. Garanta que a correção não quebre funcionalidades existentes

Regras importantes:
- NÃO remover funcionalidades sem necessidade
- NÃO alterar design sem motivo
- NÃO criar soluções temporárias ou gambiarra
- Sempre aplicar soluções profissionais
- Priorizar estabilidade, segurança e confiabilidade
- Garantir código limpo e sustentável
- Melhorar tratamento de erros em toda aplicação
- Validar edge cases importantes
- Garantir compatibilidade mobile e desktop

Após finalizar:
- Faça uma nova varredura completa
- Verifique se ainda existem erros
- Verifique possíveis regressões
- Garanta estabilidade geral do sistema

O resultado final deve deixar a aplicação:
- Estável
- Confiável
- Sem erros visíveis
- Sem warnings desnecessários
- Sem bugs críticos
- Fluida
- Responsiva
- Profissional
- Pronta para produção
            </p>
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
