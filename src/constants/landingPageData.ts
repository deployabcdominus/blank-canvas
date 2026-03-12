import { 
  Target, 
  FileText, 
  Wrench, 
  Building, 
  Users, 
  ClipboardList,
  Compass,
  PenTool,
  Ruler,
  Scissors,
  Flame,
  HardHat
} from "lucide-react";

export const pricingPlans = [
  {
    plan: "Starter",
    priceMonthly: 49,
    priceAnnual: 39,
    features: [
      "Hasta 50 leads activos",
      "1 usuario administrador",
      "Pipeline básico de órdenes",
      "Gestión de entregas",
      "Soporte por email"
    ],
    glowColor: "mint" as const,
    delay: 0.2,
    recommended: false,
  },
  {
    plan: "Professional",
    priceMonthly: 99,
    priceAnnual: 79,
    features: [
      "Leads ilimitados",
      "Hasta 5 usuarios",
      "Pipeline avanzado + reportes",
      "Roles y permisos por equipo",
      "Evidencia fotográfica",
      "Soporte prioritario"
    ],
    glowColor: "blue" as const,
    delay: 0.4,
    recommended: true,
  },
  {
    plan: "Enterprise",
    priceMonthly: 199,
    priceAnnual: 159,
    features: [
      "Todo lo de Professional",
      "Usuarios ilimitados",
      "Multi-tenant completo",
      "Integraciones personalizadas",
      "Onboarding dedicado",
      "Soporte 24/7 por teléfono"
    ],
    glowColor: "lavender" as const,
    delay: 0.6,
    recommended: false,
  }
];

export const benefitsData = [
  {
    icon: Compass,
    title: "Pipeline visual",
    description: "De lead a entrega, cada proyecto avanza por etapas claras. Sin nada que se pierda.",
  },
  {
    icon: PenTool,
    title: "Propuestas organizadas",
    description: "Historial de precios y propuestas por cliente. Nunca más buscar en emails.",
  },
  {
    icon: Ruler,
    title: "Órdenes de servicio",
    description: "Genera órdenes con recursos, medidas y fechas para tu equipo.",
  },
  {
    icon: Scissors,
    title: "Multi-equipo & permisos",
    description: "Admin, comercial, operaciones. Cada rol ve solo lo que necesita.",
  },
  {
    icon: Flame,
    title: "Evidencia de trabajo",
    description: "Fotos de antes y después de cada entrega. Documentación automática.",
  },
  {
    icon: HardHat,
    title: "Control de ejecuciones",
    description: "Agenda, asigna equipos y da seguimiento a cada ejecución en campo.",
  },
];

export const stepsData = [
  {
    step: "01",
    title: "Captura el lead",
    description: "Registra cada oportunidad con datos de contacto, servicio y valor estimado.",
  },
  {
    step: "02",
    title: "Envía la propuesta",
    description: "Crea propuestas profesionales, da seguimiento y aprueba con un click.",
  },
  {
    step: "03",
    title: "Ejecuta y entrega",
    description: "Genera la orden de trabajo, agenda la entrega y asigna tu equipo.",
  },
];

export const systemModulesConfig = [
  { 
    icon: Target, 
    title: "Leads", 
    description: "Gestione leads y oportunidades", 
    path: "/leads", 
    color: "blue"
  },
  { 
    icon: FileText, 
    title: "Propuestas", 
    description: "Cree y haga seguimiento de propuestas", 
    path: "/proposals", 
    color: "green"
  },
  { 
    icon: Wrench, 
    title: "Órdenes de Trabajo", 
    description: "Controle órdenes de trabajo", 
    path: "/work-orders", 
    color: "orange"
  },
  { 
    icon: Building, 
    title: "Entregas", 
    description: "Agende y gestione entregas", 
    path: "/installation", 
    color: "purple"
  },
  { 
    icon: Users, 
    title: "Equipo", 
    description: "Gestione miembros del equipo", 
    path: "/team", 
    color: "indigo"
  },
  { 
    icon: ClipboardList, 
    title: "Empresas", 
    description: "Registre empresas colaboradoras", 
    path: "/installer-companies", 
    color: "pink"
  }
];

export const statsConfig = [
  { icon: Target, label: "Leads", color: "text-blue-400" },
  { icon: FileText, label: "Propuestas", color: "text-green-400" },
  { icon: Wrench, label: "Órdenes", color: "text-orange-400" },
  { icon: Building, label: "Entregas", color: "text-purple-400" },
  { icon: Users, label: "Equipo", color: "text-indigo-400" },
  { icon: ClipboardList, label: "Empresas", color: "text-pink-400" }
];
