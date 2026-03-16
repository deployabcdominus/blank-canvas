export const en = {
  /* ── Landing Page ── */
  landing: {
    nav: {
      industries: "Industries",
      pricing: "Pricing",
      demo: "Demo",
      login: "Login",
      freeTrial: "Start Free",
      goToDashboard: "Go to Dashboard",
    },
    hero: {
      badge: "Multi-industry management",
      titleLine1: "The platform for",
      titleLine2: "industry leaders.",
      subtitle:
        "Manage IT, HVAC & Signage operations in one intelligent interface. Total customization, absolute efficiency.",
      ctaPrimary: "Start Pro Trial",
      ctaSecondary: "See how it works",
    },
    trusted: "Companies that trust SignFlow",
    industries: {
      badge: "Industries",
      titleLine1: "Your industry, your language,",
      titleLine2: "your workflow",
      subtitle:
        "Automatically adapts to your sector with custom labels, statuses and processes.",
      it: {
        title: "IT Services",
        desc: "Manage tickets, infrastructure deployments and on-site technical support.",
        example: "From Tickets → to Deployment Orders",
      },
      hvac: {
        title: "HVAC / Climate Control",
        desc: "Track preventive maintenance, installations and equipment certifications.",
        example: "From Quote → to Delivery Certificate",
      },
      signage: {
        title: "Signage / Printing",
        desc: "From artwork design through production to on-site installation.",
        example: "From Mockup → to Installation Photo",
      },
      maintenance: {
        title: "Maintenance & Repairs",
        desc: "Schedule recurring services, assign specialists and document interventions.",
        example: "From Report → to Completed Work Order",
      },
    },
    features: {
      badge: "Crown Features",
      title: "The 3 crown jewels",
      subtitle:
        "Features that transform your operations and give you real competitive advantage.",
      techSheet: {
        title: "Intelligent Technical Sheet",
        desc: "Generate detailed technical sheets with materials, measurements, blueprint annotations and team assignments. All in one place.",
      },
      signature: {
        title: "Digital Signature Portal",
        desc: "Send professional proposals with approval links. Your client signs digitally from any device with legal validity.",
      },
      offline: {
        title: "Critical Offline Mode",
        desc: "Your field team captures photos, updates statuses and logs progress without connectivity. Auto-syncs when reconnected.",
      },
    },
    pricing: {
      badge: "Pricing",
      titleLine1: "Invest in your growth",
      titleLine2: "and efficiency",
      subtitle: "No contracts. No surprises. Cancel anytime.",
      monthly: "Monthly",
      annual: "Annual",
      save20: "Save 20%",
      perMonth: "/mo",
      billedAnnually: "Billed annually",
      mostPopular: "Most Popular",
      chosenBy: "Chosen by growing businesses",
      choose: "Choose",
      processing: "Processing...",
      start: {
        features: [
          "Up to 50 active leads",
          "1 admin user",
          "Basic work order pipeline",
          "Field service management",
          "Email support",
        ],
      },
      pro: {
        features: [
          "Unlimited leads",
          "Up to 5 users",
          "Digital signature portal",
          "Team roles & permissions",
          "Photo evidence",
          "Priority support",
        ],
      },
      elite: {
        features: [
          "Everything in Pro",
          "Unlimited users",
          "Advanced technical sheets",
          "Offline mode",
          "API & integrations",
          "Dedicated onboarding",
          "24/7 support",
        ],
      },
    },
    faq: {
      badge: "FAQ",
      title: "Have questions?",
      subtitle: "Here are the most common answers.",
      items: [
        {
          q: "Do I need technical knowledge to use Sign Flow?",
          a: "No. The platform is designed so any team, regardless of technical level, can configure their workflow in under 3 minutes. No code, no complications.",
        },
        {
          q: "Can I change plans at any time?",
          a: "Yes. You can upgrade or downgrade your plan anytime from the Configuration Hub. Changes apply immediately and billing is prorated automatically.",
        },
        {
          q: "Is my data secure?",
          a: "Absolutely. We use end-to-end encryption, secure authentication and Row-Level Security (RLS) data isolation policies. Each company can only access its own data.",
        },
        {
          q: "Does it work on mobile devices?",
          a: "Yes. Sign Flow is optimized to work like a native app on any device. Your field operators can use it from their phone or tablet without installing anything.",
        },
        {
          q: "Do you offer a free trial?",
          a: "Yes. All plans include a free trial period. You can start without a credit card and explore all features before committing.",
        },
        {
          q: "What if I need more than the Elite plan offers?",
          a: "Contact us directly. We offer custom Enterprise plans with dedicated integrations, guaranteed SLAs and tailored onboarding for large organizations.",
        },
      ],
    },
    cta: {
      titleLine1: "Ready to optimize your",
      titleLine2: " operations and scale",
      titleLine3: "your results?",
      subtitle:
        "Join hundreds of businesses already managing their operations end-to-end with Sign Flow.",
      button: "Start Free Now",
      note: "No credit card · Setup in 3 minutes",
    },
    footer: {
      tagline:
        "The comprehensive operations management platform for service and project businesses.",
      product: "Product",
      productLinks: ["Features", "Pricing", "Integrations", "Updates"],
      company: "Company",
      companyLinks: ["About Us", "Blog", "Contact", "Careers"],
      legal: "Legal",
      legalLinks: ["Terms of Service", "Privacy Policy", "Cookies", "Support"],
      copyright: "All rights reserved.",
    },
    mockup: {
      activeOrders: "Active orders",
      fieldOperators: "Field operators",
      inService: "In service",
      slaCritical: "SLA Critical",
      urgent: "Urgent",
      monthRevenue: "Monthly revenue",
      workOrders: "Work orders",
      activeSpecialists: "Active specialists",
      enRoute: "En route",
      onSite: "On site",
      available: "Available",
    },
  },

  /* ── Common / Shared ── */
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    filter: "Filter",
    loading: "Loading...",
    noResults: "No results",
    language: "Language",
    english: "English",
    spanish: "Español",
  },
};

// Use a deep string type so both locales can have different values
type DeepStringify<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? U extends string ? string[] : DeepStringify<U>[]
    : T extends object
      ? { [K in keyof T]: DeepStringify<T[K]> }
      : T;

export type TranslationKeys = DeepStringify<typeof en>;
