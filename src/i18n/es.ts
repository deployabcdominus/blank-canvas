import type { TranslationKeys } from "./en";

export const es: TranslationKeys = {
  /* ── Landing Page ── */
  landing: {
    nav: {
      industries: "Industrias",
      pricing: "Precios",
      demo: "Demo",
      login: "Login",
      freeTrial: "Empezar",
      goToDashboard: "Ir al Dashboard",
    },
    hero: {
      badge: "Gestión multi-industria",
      titleLine1: "La plataforma para líderes",
      titleLine2: "de industria.",
      subtitle:
        "Gestión de IT, HVAC y Señalética en una sola interfaz inteligente. Personalización total, eficiencia absoluta.",
      ctaPrimary: "Activar Ahora",
      ctaSecondary: "Ver cómo funciona",
    },
    trusted: "Empresas que confían en SignFlow",
    industries: {
      badge: "Industrias",
      titleLine1: "Tu industria, tu lenguaje,",
      titleLine2: "tu flujo de trabajo",
      subtitle:
        "Se adapta automáticamente a tu sector con etiquetas, estados y procesos personalizados.",
      it: {
        title: "Servicios IT",
        desc: "Gestiona tickets, instalaciones de infraestructura y soporte técnico en campo.",
        example: "De Tickets → a Órdenes de Instalación",
      },
      hvac: {
        title: "Climatización / HVAC",
        desc: "Controla mantenimientos preventivos, instalaciones y certificaciones de equipos.",
        example: "De Cotización → a Certificación de Entrega",
      },
      signage: {
        title: "Señalética / Rotulación",
        desc: "Desde el diseño del arte hasta la producción e instalación del proyecto.",
        example: "De Mockup → a Foto de Instalación",
      },
      maintenance: {
        title: "Mantenimiento",
        desc: "Programa servicios recurrentes, asigna técnicos y documenta intervenciones.",
        example: "De Reporte → a Orden de Servicio Completada",
      },
    },
    features: {
      badge: "Funciones estrella",
      title: "Las 3 joyas de la corona",
      subtitle:
        "Funciones que transforman tu operación y te dan ventaja competitiva real.",
      techSheet: {
        title: "Ficha Técnica Inteligente",
        desc: "Genera fichas técnicas detalladas con materiales, medidas, anotaciones en plano y asignación de equipos. Todo en un solo lugar.",
      },
      signature: {
        title: "Portal de Firma Digital",
        desc: "Envía propuestas profesionales con link de aprobación. Tu cliente firma digitalmente desde cualquier dispositivo con validez legal.",
      },
      offline: {
        title: "Modo Offline Crítico",
        desc: "Tu equipo en campo captura fotos, actualiza estados y registra avances sin conexión. Se sincroniza automáticamente al reconectar.",
      },
    },
    pricing: {
      badge: "Precios",
      titleLine1: "Invierte en tu crecimiento",
      titleLine2: "y eficiencia",
      subtitle: "Sin contratos. Sin sorpresas. Cancela cuando quieras.",
      monthly: "Mensual",
      annual: "Anual",
      save20: "Ahorra 20%",
      perMonth: "/mes",
      billedAnnually: "Facturado anualmente",
      mostPopular: "Más Popular",
      chosenBy: "Elegido por negocios en crecimiento",
      choose: "Elegir",
      processing: "Procesando...",
      start: {
        features: [
          "Hasta 50 leads activos",
          "1 usuario administrador",
          "Pipeline básico de órdenes",
          "Gestión de entregas",
          "Soporte por email",
        ],
      },
      pro: {
        features: [
          "Leads ilimitados",
          "Hasta 5 usuarios",
          "Portal de firma digital",
          "Roles y permisos por equipo",
          "Evidencia fotográfica",
          "Soporte prioritario",
        ],
      },
      elite: {
        features: [
          "Todo lo de Pro",
          "Usuarios ilimitados",
          "Ficha técnica avanzada",
          "Modo offline",
          "API & integraciones",
          "Onboarding dedicado",
          "Soporte 24/7",
        ],
      },
    },
    faq: {
      badge: "Preguntas frecuentes",
      title: "¿Tienes dudas?",
      subtitle: "Aquí respondemos las preguntas más comunes.",
      items: [
        {
          q: "¿Necesito conocimientos técnicos para usar Sign Flow?",
          a: "No. La plataforma está diseñada para que cualquier equipo, sin importar su nivel técnico, pueda configurar su flujo de trabajo en menos de 3 minutos. Sin código, sin complicaciones.",
        },
        {
          q: "¿Puedo cambiar de plan en cualquier momento?",
          a: "Sí. Puedes actualizar o reducir tu plan en cualquier momento desde tu panel de configuración. Los cambios se aplican de inmediato y el cobro se prorratea automáticamente.",
        },
        {
          q: "¿Mis datos están seguros?",
          a: "Absolutamente. Usamos cifrado de extremo a extremo, autenticación segura y políticas de aislamiento de datos (RLS) a nivel de base de datos. Cada empresa solo puede ver sus propios datos.",
        },
        {
          q: "¿Funciona en dispositivos móviles?",
          a: "Sí. Sign Flow está optimizado para funcionar como una app nativa en cualquier dispositivo. Tu equipo de campo puede usarlo desde su celular o tablet sin instalar nada.",
        },
        {
          q: "¿Cómo obtengo acceso a SignFlow?",
          a: "Puedes activar tu cuenta seleccionando un plan y completando el proceso de pago, o recibiendo una invitación del administrador de tu organización.",
        },
        {
          q: "¿Qué pasa si necesito más de lo que ofrece el plan Elite?",
          a: "Contáctanos directamente. Ofrecemos planes Enterprise personalizados con integraciones dedicadas, SLAs garantizados y onboarding a medida para grandes organizaciones.",
        },
      ],
    },
    cta: {
      titleLine1: "¿Listo para optimizar tu",
      titleLine2: " operación y escalar",
      titleLine3: "tus resultados?",
      subtitle:
        "Únete a cientos de negocios que ya controlan su operación de punta a punta con Sign Flow.",
      button: "Empieza Gratis Ahora",
      note: "Sin tarjeta de crédito · Configuración en 3 minutos",
    },
    footer: {
      tagline:
        "La plataforma integral de gestión operativa para negocios de servicios y proyectos.",
      product: "Producto",
      productLinks: ["Funciones", "Precios", "Integraciones", "Actualizaciones"],
      company: "Empresa",
      companyLinks: ["Nosotros", "Blog", "Contacto", "Carreras"],
      legal: "Legal",
      legalLinks: ["Términos de Servicio", "Política de Privacidad", "Cookies", "Soporte"],
      copyright: "Todos los derechos reservados.",
    },
    mockup: {
      activeOrders: "Órdenes activas",
      fieldOperators: "Técnicos en campo",
      inService: "En servicio",
      slaCritical: "SLA Crítico",
      urgent: "Urgente",
      monthRevenue: "Ingresos mes",
      workOrders: "Órdenes de trabajo",
      activeSpecialists: "Técnicos activos",
      enRoute: "En ruta",
      onSite: "En sitio",
      available: "Libre",
    },
  },

  /* ── Common / Shared ── */
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    search: "Buscar",
    filter: "Filtrar",
    loading: "Cargando...",
    noResults: "Sin resultados",
    language: "Idioma",
    english: "English",
    spanish: "Español",
    live: "En vivo",
    confirm: "Confirmar",
    back: "Atrás",
    next: "Siguiente",
    yes: "Sí",
    no: "No",
    all: "Todos",
    none: "Ninguno",
    close: "Cerrar",
    add: "Agregar",
    remove: "Quitar",
    export: "Exportar",
    import: "Importar",
    download: "Descargar",
    upload: "Subir",
    actions: "Acciones",
    status: "Estado",
    date: "Fecha",
    name: "Nombre",
    email: "Email",
    phone: "Teléfono",
    notes: "Notas",
    details: "Detalles",
    total: "Total",
    amount: "Monto",
    value: "Valor",
  },

  /* ── Navigation / Sidebar ── */
  nav: {
    dashboard: "Dashboard",
    crmSales: "CRM & Ventas",
    leads: "Leads",
    proposals: "Propuestas",
    accounts: "Clientes",
    production: "Producción",
    projects: "Proyectos",
    workOrders: "Órdenes de Servicio",
    subcontractors: "Subcontratistas",
    administration: "Administración",
    payments: "Pagos",
    teamManagement: "Gestión de equipo",
    settings: "Configuración",
    auditLog: "Auditoría",
    principal: "Principal",
    adjustments: "Ajustes",
    platform: "Plataforma",
    fieldServices: "Ejecuciones",
    profile: "Perfil",
    logout: "Salir",
  },

  /* ── Dashboard ── */
  dashboard: {
    controlCenter: "Centro de Control",
    executiveView: "Vista ejecutiva · Datos en tiempo real",
    operativeView: "Vista operativa · Tus tareas de hoy",
    activeLeads: "Leads Activos",
    noProposal: "Sin propuesta asignada",
    inProgress: "En Progreso",
    ordersInProgress: "Órdenes en curso",
    awaitingDelivery: "Esperando Entrega",
    scheduledPending: "Agendadas pendientes",
    completed: "Completados",
    thisMonth: "Este mes",
    welcomeBack: "¡Bienvenido de vuelta",
    projectsToday: "Mira lo que está pasando con tus proyectos hoy.",
  },

  /* ── Industry labels (bilingual) ── */
  industryLabels: {
    projects: "Proyectos",
    leads: "Leads",
    workOrders: "Órdenes de Servicio",
    installation: "Ejecuciones",
    installerCompanies: "Subcontratistas",
    operationGroup: "Operación",
    labelProject: "Proyecto",
    labelUnit: "Medidas",
    production: "Producción",
  },

  /* ── Leads page ── */
  leads: {
    title: "Leads",
    addLead: "Nuevo Lead",
    clearAll: "Limpiar Todos",
    searchPlaceholder: "Buscar leads...",
    filterAll: "Todos",
    filterMine: "Míos",
    filterUnassigned: "Sin asignar",
    new: "Nuevo",
    contacted: "Contactado",
    qualified: "Calificado",
    converted: "Convertido",
    lost: "Perdido",
    assignTo: "Asignar a",
    convertToProposal: "Convertir a Propuesta",
  },

  /* ── Proposals page ── */
  proposals: {
    title: "Propuestas",
    addProposal: "Nueva Propuesta",
    draft: "Borrador",
    sent: "Enviada",
    approved: "Aprobada",
    rejected: "Rechazada",
    searchPlaceholder: "Buscar propuestas...",
  },

  /* ── Work Orders ── */
  workOrders: {
    title: "Órdenes de Servicio",
    addOrder: "Nueva Orden",
    technicalSheet: "Ficha Técnica",
    pending: "Pendiente",
    inProgress: "En Progreso",
    completed: "Finalizada",
    cancelled: "Cancelada",
    searchPlaceholder: "Buscar órdenes...",
    priority: "Prioridad",
    high: "Alta",
    medium: "Media",
    low: "Baja",
  },

  /* ── Settings / Configuration Hub ── */
  settings: {
    title: "Configuración",
    tabs: {
      profile: "Perfil",
      organization: "Organización",
      appearance: "Apariencia",
      storage: "Almacenamiento",
      notifications: "Notificaciones",
      catalogs: "Catálogos",
      integrations: "Integraciones",
      billing: "Facturación",
    },
    profileName: "Nombre Completo",
    resetPassword: "Restablecer Contraseña",
    orgName: "Nombre de Organización",
    industry: "Industria",
    serviceTypes: "Tipos de Servicio",
    glassEffect: "Efecto Cristal",
    theme: "Tema",
    darkMode: "Modo Oscuro",
    saveChanges: "Guardar Cambios",
    resetDefaults: "Restablecer Valores",
  },

  /* ── Payments ── */
  payments: {
    title: "Pagos",
    addPayment: "Registrar Pago",
    searchPlaceholder: "Buscar pagos...",
    pending: "Pendiente",
    completed: "Completado",
    method: "Método",
  },

  /* ── Clients / Accounts ── */
  clients: {
    title: "Clientes",
    addClient: "Nuevo Cliente",
    searchPlaceholder: "Buscar clientes...",
    contactName: "Nombre de Contacto",
    company: "Empresa",
    serviceType: "Tipo de Servicio",
    website: "Sitio Web",
    address: "Dirección",
  },

  /* ── SEO / Meta ── */
  seo: {
    title: "SignFlow | El SO de Operaciones y Flujo de Trabajo Todo-en-Uno",
    description: "Escala tu negocio de servicios con SignFlow. Centraliza datos de proyectos, fichas técnicas e instalaciones en campo para industrias de IT, HVAC y Señalética. Prueba Pro de 14 días.",
  },
} as const;
