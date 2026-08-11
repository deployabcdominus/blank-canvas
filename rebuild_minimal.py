def rebuild(path, var_name, is_en):
    content = f"export const {var_name} = {{\n"
    
    # Critical sections
    sections = {
        "landing": {
            "en": '    nav: { industries: "Industries", pricing: "Pricing", faq: "FAQ", login: "Login", getStarted: "Get Started", goToDashboard: "Go to Dashboard" }, hero: { badge: "Premium SaaS Operations Hub", titleLine1: "Command Your Shop.", titleLine2: "Maximize Growth.", subtitle: "The elite operations platform designed for high-performance service teams.", ctaPrimary: "Deploy Now", ctaSecondary: "Explore Systems", trust: "Trusted by 500+ High-Performance Leaders" }',
            "es": '    nav: { industries: "Industrias", pricing: "Precios", faq: "Preguntas", login: "Login", getStarted: "Empezar", goToDashboard: "Ir al Dashboard" }, hero: { badge: "Premium SaaS Operations Hub", titleLine1: "Domina tu Taller.", titleLine2: "Maximiza el Crecimiento.", subtitle: "La plataforma operativa de élite diseñada para equipos de servicios de alto rendimiento.", ctaPrimary: "Desplegar Ahora", ctaSecondary: "Explorar Sistemas", trust: "Confiado por más de 500 líderes" }'
        },
        "common": {
            "en": '    save: "Save", cancel: "Cancel", delete: "Delete", edit: "Edit", create: "Create", search: "Search", filter: "Filter", loading: "Loading...", noResults: "No results", language: "Language", alreadyExists: "Already exists", error: "Error", saveSuccess: "Saved successfully", saving: "Saving..."',
            "es": '    save: "Guardar", cancel: "Cancelar", delete: "Eliminar", edit: "Editar", create: "Crear", search: "Buscar", filter: "Filtrar", loading: "Cargando...", noResults: "Sin resultados", alreadyExists: "Ya existe", error: "Error", saveSuccess: "Guardado correctamente", saving: "Guardando..."'
        },
        "settings": {
            "en": '    title: "Configuration Hub", subtitle: "Manage your business", tabs: { profile: "Profile", organization: "Organization", storage: "Storage", configuration: "Configuration", domains: "Custom Domains", catalogs: "Catalogs", integrations: "Integrations", notifications: "Notifications", subscription: "Subscription" }, organization: { title: "Organization Details", subtitle: "General business information", serviceTypes: { title: "Service Types", subtitle: "Define service types", placeholder: "New service type...", add: "Add", save: "Save Service Types", saving: "Saving..." } }, pricing: { title: "Your Subscription", currentPlan: "Current plan:", paymentOverdue: "Payment Overdue", successTitle: "Success", successDesc: "Plan active", loginRequired: "Login required", paymentError: "Payment error", portalError: "Portal error", taglines: { start: "Start tagline", pro: "Pro tagline", elite: "Elite tagline" }, features: { start: ["f1"], pro: ["f2"], elite: ["f3"] } }',
            "es": '    title: "Configuration Hub", subtitle: "Gestiona tu negocio", tabs: { profile: "Perfil", organization: "Organización", storage: "Almacenamiento", configuration: "Configuración", domains: "Dominios", catalogs: "Catálogos", integrations: "Integraciones", notifications: "Notificaciones", subscription: "Suscripción" }, organization: { title: "Detalles", subtitle: "Información general", serviceTypes: { title: "Tipos de Servicio", subtitle: "Define tipos", placeholder: "Nuevo tipo...", add: "Agregar", save: "Guardar", saving: "Guardando..." } }, pricing: { title: "Tu Suscripción", currentPlan: "Plan actual:", paymentOverdue: "Pago Pendiente", successTitle: "Éxito", successDesc: "Plan activo", loginRequired: "Sesión requerida", paymentError: "Error de pago", portalError: "Error de portal", taglines: { start: "Start desc", pro: "Pro desc", elite: "Elite desc" }, features: { start: ["f1"], pro: ["f2"], elite: ["f3"] } }'
        },
        "editProposalModal": {
            "en": '    title: "Edit Proposal", clientLabel: "Client *", projectLabel: "Project *", amountLabel: "Amount *", statusLabel: "Status *", descriptionLabel: "Description", cancel: "Cancel", save: "Save Changes"',
            "es": '    title: "Editar Propuesta", clientLabel: "Cliente *", projectLabel: "Proyecto *", amountLabel: "Monto *", statusLabel: "Estado *", descriptionLabel: "Descripción", cancel: "Cancelar", save: "Guardar Cambios"'
        }
    }
    
    for key, val in sections.items():
        lang_val = val["en" if is_en else "es"]
        content += f"  {key}: {{\n{lang_val}\n  }},\n"
    
    content += "};\n"
    if is_en:
        content += "\nexport type TranslationKeys = typeof en;\n"
    
    with open(path, 'w') as f:
        f.write(content)

rebuild('src/i18n/en.ts', 'en', True)
rebuild('src/i18n/es.ts', 'es', False)
