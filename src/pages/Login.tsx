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
            <p className="text-muted-foreground/80">
              Inicia sesión para continuar en SignFlow. Analise completamente toda a aplicação antes de realizar qualquer alteração e execute uma auditoria profunda de SEGURANÇA e BANCO DE DADOS em todo o sistema.

Seu objetivo é identificar vulnerabilidades, falhas de segurança, riscos de exposição de dados, problemas de autenticação/autorização e otimizar toda a estrutura do banco de dados para garantir máxima segurança, integridade e confiabilidade.

━━━━━━━━━━━━━━━━━━━
OBJETIVO PRINCIPAL
━━━━━━━━━━━━━━━━━━━

Transformar o sistema em uma aplicação:
- Segura contra ataques e exploração
- Com regras de acesso bem definidas
- Com banco de dados consistente e otimizado
- Com proteção contra vazamento de dados
- Com autenticação e autorização robustas
- Pronta para produção em ambiente real

━━━━━━━━━━━━━━━━━━━
ANÁLISE OBRIGATÓRIA
━━━━━━━━━━━━━━━━━━━

Antes de qualquer modificação, analise:

- Estrutura completa do banco de dados
- Tabelas, relações e constraints
- Políticas de acesso (RLS no Supabase, se existir)
- Queries (SELECT, INSERT, UPDATE, DELETE)
- Endpoints e APIs
- Autenticação e sessão de usuários
- Autorização e permissões por role
- Exposição de dados sensíveis
- Validação de inputs
- Upload de arquivos e storage
- Logs e tratamento de erros
- Integrações externas
- Webhooks
- Tokens e chaves de API
- Uso de variáveis de ambiente
- Possíveis pontos de injeção (SQL/NoSQL/logic injection)
- Proteção contra acesso não autorizado
- Regras de negócio no backend vs frontend

━━━━━━━━━━━━━━━━━━━
SEGURANÇA (PRIORIDADE MÁXIMA)
━━━━━━━━━━━━━━━━━━━

Identifique e corrija:

- Falhas de autenticação (login, sessão, token)
- Falhas de autorização (acesso indevido a dados)
- Falta de RLS ou regras mal configuradas (Supabase)
- Exposição de dados sensíveis no frontend
- Queries inseguras ou mal filtradas
- Possíveis SQL injection / manipulação de query
- Endpoints sem validação adequada
- Falta de validação de inputs do usuário
- Upload de arquivos sem validação
- Acesso direto a tabelas sem controle
- Vazamento de IDs, emails ou dados privados
- Falta de controle por roles (admin/user/etc)
- Tokens expostos o mal armazenados
- Uso inseguro de localStorage/sessionStorage
- Falta de expiração de sessão
- Falta de proteção em rotas sensíveis
- Falta de rate limiting (quando aplicável)
- Webhooks sem validação de origem

━━━━━━━━━━━━━━━━━━━
BANCO DE DADOS (OTIMIZAÇÃO E CONSISTÊNCIA)
━━━━━━━━━━━━━━━━━━━

Melhorar estrutura de dados:

- Normalização das tabelas
- Relações corretas entre entidades
- Uso correto de foreign keys
- Indexação de colunas críticas
- Remoção de redundância de dados
- Melhor organização de schemas
- Padronização de nomes de tabelas e colunas
- Otimização de queries pesadas
- Redução de consultas desnecessárias
- Melhor uso de joins e filtros
- Paginação eficiente de dados
- Cache de consultas quando aplicável
- Evitar N+1 queries
- Melhor estrutura de dados para escalabilidade

━━━━━━━━━━━━━━━━━━━
SUPABASE (SE APLICÁVEL)
━━━━━━━━━━━━━━━━━━━

- Revisar todas as políticas RLS
- Garantir que TODAS as tabelas sensíveis possuem RLS ativo
- Garantir policies por role (user/admin/system)
- Validar acessos por user_id corretamente
- Proteger dados multi-tenant
- Revisar Storage policies (uploads)
- Garantir segurança em realtime subscriptions
- Revisar service_role usage (evitar exposição no frontend)

━━━━━━━━━━━━━━━━━━━
VALIDAÇÃO E INPUTS
━━━━━━━━━━━━━━━━━━━

- Validar todos os inputs do usuário
- Sanitizar dados antes de salvar no banco
- Impedir dados inválidos ou maliciosos
- Garantir tipagem correta (se TypeScript)
- Evitar campos opcionais mal tratados
- Validar payloads de APIs e webhooks

━━━━━━━━━━━━━━━━━━━
BOAS PRÁTICAS OBRIGATÓRIAS
━━━━━━━━━━━━━━━━━━━

- NUNCA expor secrets no frontend
- NUNCA confiar em validação apenas no client-side
- SEMPRE validar no backend/banco
- SEMPRE aplicar princípio de menor privilégio
- SEMPRE restringir acesso por contexto de usuário
- SEMPRE proteger dados sensíveis
- SEMPRE revisar impacto de qualquer alteração

━━━━━━━━━━━━━━━━━━━
PROCESSO DE EXECUÇÃO
━━━━━━━━━━━━━━━━━━━

1. Faça uma varredura completa do sistema
2. Liste vulnerabilidades e riscos encontrados
3. Classifique por criticidade (alto / médio / baixo)
4. Explique a causa de cada problema
5. Corrija todos os problemas de segurança
6. Otimize o banco de dados quando necessário
7. Revalide segurança após alterações
8. Garanta que nada do sistema quebre

━━━━━━━━━━━━━━━━━━━
RESULTADO ESPERADO
━━━━━━━━━━━━━━━━━━━

Ao final, o sistema deve estar:

- Seguro contra acessos indevidos
- Protegido contra exposição de dados
- Com banco de dados otimizado e escalável
- Com autenticação e autorização robustas
- Com regras bem definidas e consistentes
- Pronto para produção real com segurança profissional
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
