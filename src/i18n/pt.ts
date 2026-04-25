import { en } from "./en";

export const pt: typeof en = {
  ...en,
  /* ── Landing Page ── */
  landing: {
    nav: {
      industries: "Setores",
      pricing: "Preços",
      demo: "Demonstração",
      login: "Entrar",
      getStarted: "Começar Agora",
      goToDashboard: "Ir para o Painel",
    },
    hero: {
      badge: "O Hub de Operações #1 para Empresas de Serviços",
      titleLine1: "Automatize suas operações.",
      titleLine2: "Escale seus resultados.",
      subtitle:
        "A plataforma completa para gerenciar operações de TI, Climatização e Comunicação Visual com precisão absoluta. Pare de perder tempo e comece a crescer hoje.",
      ctaPrimary: "Começar Agora",
      ctaSecondary: "Ver Demonstração",
    },
    trusted: "Junte-se a mais de 500 líderes do setor em todo o mundo",
    industries: {
      badge: "Setores",
      titleLine1: "Seu setor, sua linguagem,",
      titleLine2: "seu fluxo de trabalho",
      subtitle:
        "Adapta-se automaticamente ao seu setor com etiquetas, status e processos personalizados.",
      it: {
        title: "Serviços de TI",
        desc: "Gerencie tickets, implantações de infraestrutura e suporte técnico no local.",
        example: "De Tickets → para Ordens de Implantação",
      },
      hvac: {
        title: "Climatização / HVAC",
        desc: "Acompanhe manutenções preventivas, instalações e certificações de equipamentos.",
        example: "De Orçamento → para Certificado de Entrega",
      },
      signage: {
        title: "Comunicação Visual",
        desc: "Desde o design da arte até a produção e instalação no local.",
        example: "De Mockup → para Foto de Instalação",
      },
      maintenance: {
        title: "Manutenção e Reparos",
        desc: "Agende serviços recorrentes, atribua especialistas e documente intervenções.",
        example: "De Relatório → para Ordem de Serviço Concluída",
      },
    },
    features: {
      badge: "Recursos Premium",
      title: "As 3 Joias da Coroa",
      subtitle:
        "Recursos que transformam suas operações e oferecem uma vantagem competitiva real.",
      techSheet: {
        title: "Ficha Técnica Inteligente",
        desc: "Gere fichas técnicas detalhadas com materiais, medidas, anotações em plantas e atribuições de equipe. Tudo em um só lugar.",
      },
      signature: {
        title: "Portal de Assinatura Digital",
        desc: "Envie propostas profissionais com links de aprovação. Seu cliente assina digitalmente de qualquer dispositivo com validade jurídica.",
      },
      offline: {
        title: "Modo Offline Crítico",
        desc: "Sua equipe de campo captura fotos, atualiza status e registra o progresso sem conectividade. Sincroniza automaticamente ao reconectar.",
      },
    },
    pricing: {
      badge: "Planos Flexíveis",
      titleLine1: "Preços simples e transparentes",
      titleLine2: "para cada etapa",
      subtitle: "Escolha o plano que se adapta ao seu crescimento. Sem taxas ocultas, sem contratos de longo prazo.",
      monthly: "Mensal",
      annual: "Faturamento Anual",
      save20: "Ganhe 2 meses grátis",
      perMonth: "/mês",
      billedAnnually: "Faturado anualmente",
      mostPopular: "Melhor Valor",
      chosenBy: "A escolha para equipes de alto desempenho",
      choose: "Selecionar Plano",
      processing: "Garantindo sua vaga...",
      start: {
        features: [
          "Até 50 leads ativos",
          "1 usuário administrador",
          "Pipeline básico de ordens de serviço",
          "Gestão de serviços de campo",
          "Suporte via e-mail",
        ],
      },
      pro: {
        features: [
          "Leads ilimitados",
          "Até 5 usuários",
          "Portal de assinatura digital",
          "Funções e permissões de equipe",
          "Evidências fotográficas",
          "Suporte prioritário",
        ],
      },
      elite: {
        features: [
          "Tudo no Pro",
          "Usuários ilimitados",
          "Fichas técnicas avançadas",
          "Modo offline",
          "API e integrações",
          "Onboarding dedicado",
          "Suporte 24/7",
        ],
      },
    },
    faq: {
      badge: "Perguntas Frequentes",
      title: "Ficou com dúvidas?",
      subtitle: "Aqui estão as respostas mais comuns.",
      items: [
        {
          q: "Preciso de conhecimento técnico para usar o Sign Flow?",
          a: "Não. A plataforma foi projetada para que qualquer equipe, independentemente do nível técnico, possa configurar seu fluxo de trabalho em menos de 3 minutos. Sem código, sem complicações.",
        },
        {
          q: "Posso mudar de plano a qualquer momento?",
          a: "Sim. Você pode fazer upgrade ou downgrade do seu plano a qualquer momento no Painel de Configuração. As alterações são aplicadas imediatamente.",
        },
        {
          q: "Meus dados estão seguros?",
          a: "Absolutamente. Utilizamos criptografia de ponta a ponta, autenticação segura e políticas de isolamento de dados RLS. Cada empresa acessa apenas seus próprios dados.",
        },
        {
          q: "Funciona em dispositivos móveis?",
          a: "Sim. O Sign Flow é otimizado para funcionar como um aplicativo nativo em qualquer dispositivo. Sua equipe de campo pode usá-lo do celular ou tablet.",
        },
        {
          q: "Como obtenho acesso ao Sign Flow?",
          a: "Você pode ativar sua conta selecionando um plano e concluindo o pagamento, ou recebendo um convite do administrador da sua organização.",
        },
        {
          q: "E se eu precisar de mais do que o plano Elite oferece?",
          a: "Entre em contato conosco diretamente. Oferecemos planos Enterprise personalizados com integrações dedicadas e SLAs garantidos.",
        },
      ],
    },
    cta: {
      titleLine1: "Pronto para otimizar suas",
      titleLine2: " operações e escalar",
      titleLine3: "seus resultados?",
      subtitle:
        "Junte-se a centenas de empresas que já gerenciam suas operações de ponta a ponta com o Sign Flow.",
      button: "Começar Agora",
      note: "Ferramentas de nível profissional · Configuração em 3 minutos",
    },
    footer: {
      tagline:
        "A plataforma completa de gestão de operações para empresas de serviços e projetos.",
      product: "Produto",
      productLinks: ["Recursos", "Preços", "Integrações", "Atualizações"],
      company: "Empresa",
      companyLinks: ["Sobre Nós", "Blog", "Contato", "Carreiras"],
      legal: "Jurídico",
      legalLinks: ["Termos de Serviço", "Política de Privacidade", "Cookies", "Suporte"],
      copyright: "Todos os direitos reservados.",
    },
    mockup: {
      activeOrders: "Ordens ativas",
      fieldOperators: "Operadores de campo",
      inService: "Em serviço",
      slaCritical: "SLA Crítico",
      urgent: "Urgente",
      monthRevenue: "Receita mensal",
      workOrders: "Ordens de serviço",
      activeSpecialists: "Especialistas ativos",
      enRoute: "Em rota",
      onSite: "No local",
      available: "Disponível",
    },
    seo: {
      title: "SignFlow | Gestão de Operações de Alta Performance",
      description: "A plataforma #1 para automatizar operações de serviços, TI e manutenção. Escale seu negócio com precisão absoluta.",
    }
  },

  /* ── Common / Shared ── */
  common: {
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    create: "Criar",
    search: "Buscar",
    filter: "Filtrar",
    loading: "Carregando...",
    noResults: "Sem resultados",
    language: "Idioma",
    english: "Inglês",
    spanish: "Espanhol",
    portuguese: "Português",
    live: "Ao vivo",
    confirm: "Confirmar",
    back: "Voltar",
    next: "Próximo",
    yes: "Sim",
    no: "Não",
    all: "Todos",
    none: "Nenhum",
    close: "Fechar",
    add: "Adicionar",
    remove: "Remover",
    export: "Exportar",
    import: "Importar",
    download: "Baixar",
    upload: "Enviar",
    actions: "Ações",
    status: "Status",
    date: "Data",
    name: "Nome",
    email: "E-mail",
    phone: "Telefone",
    notes: "Notas",
    details: "Detalhes",
    total: "Total",
    amount: "Quantia",
    value: "Valor",
  },
};
