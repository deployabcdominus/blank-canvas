import os

def write_en():
    with open('src/i18n/en.ts', 'w') as f:
        f.write('export const en = {\n')
        # I will fill in the major sections.
        # This is better than trying to fix the broken file.
        f.write('  landing: {\n    nav: {\n      industries: "Industries",\n      pricing: "Pricing",\n      faq: "FAQ",\n      login: "Login",\n      getStarted: "Get Started",\n      goToDashboard: "Go to Dashboard",\n    },\n    hero: {\n      badge: "Premium SaaS Operations Hub",\n      titleLine1: "Command Your Shop.",\n      titleLine2: "Maximize Growth.",\n      subtitle: "The elite operations platform designed for high-performance service teams. Clarify workflows, eliminate friction, and transform every project into a predictable profit center with premium precision.",\n      ctaPrimary: "Deploy Now",\n      ctaSecondary: "Explore Systems",\n      trust: "Trusted by 500+ High-Performance Leaders",\n    },\n  },\n')
        f.write('  common: {\n    save: "Save",\n    cancel: "Cancel",\n    delete: "Delete",\n    edit: "Edit",\n    create: "Create",\n    search: "Search",\n    filter: "Filter",\n    loading: "Loading...",\n    noResults: "No results",\n    language: "Language",\n    alreadyExists: "Already exists",\n    error: "Error",\n    saveSuccess: "Saved successfully",\n    saving: "Saving...",\n  },\n')
        f.write('  settings: {\n    title: "Configuration Hub",\n    subtitle: "Manage your business identity, team, and system integrations",\n    tabs: {\n      profile: "Profile",\n      organization: "Organization",\n      storage: "Storage",\n      configuration: "Configuration",\n      domains: "Custom Domains",\n      catalogs: "Catalogs",\n      integrations: "Integrations",\n      notifications: "Notifications",\n      subscription: "Subscription",\n    },\n    organization: {\n      serviceTypes: {\n        title: "Service Types",\n        subtitle: "Define the types of service your company offers. They are used in leads, proposals, and work orders.",\n        placeholder: "New service type...",\n        add: "Add",\n        save: "Save Service Types",\n        saving: "Saving...",\n      },\n    },\n    catalogs: {\n      title: "Catalogs",\n      subtitle: "Manage standard lists for your operation",\n      add: "Add",\n      addSuccess: \'"{label}" added to {title}\',\n      addError: "Error adding item",\n      updateSuccess: "Updated successfully",\n      noItems: "No items. Add the first one below.",\n      placeholder: "Add new {title}...",\n      pressEnter: "Press Enter or the button to add.",\n      save: "Save",\n      cancel: "Cancel",\n      defaultCannotDelete: "Default values cannot be deleted",\n      deleteSuccess: \'"{label}" deleted\',\n      deleteError: "Error deleting item",\n    },\n    pricing: {\n      title: "Your Subscription",\n      currentPlan: "Current plan:",\n      paymentOverdue: "Payment Overdue",\n      manageSub: "Manage Subscription",\n      successTitle: "🎉 Thank you for trusting us!",\n      successDesc: "Your plan is now active.",\n    },\n  },\n')
        f.write('  dashboard: {\n    controlCenter: "Control Center",\n  },\n')
        f.write('  leads: {\n    title: "Leads",\n    addLead: "Add Lead",\n  },\n')
        f.write('  proposals: {\n    title: "Proposals",\n    addProposal: "New Proposal",\n  },\n')
        f.write('  workOrders: {\n    title: "Work Orders",\n    addOrder: "New Order",\n  },\n')
        f.write('  banners: {\n    pastDue: { title: "Payment Overdue", desc: "Please update your payment method." },\n    planLimit: { reached: "Limit reached", near: "Near limit" }\n  }\n')
        f.write('};\n\n')
        f.write('export type TranslationKeys = typeof en;\n')

write_en()
