import re

def patch(path, lang):
    with open(path, 'r') as f:
        content = f.read()
    
    replacements = {
        'en': {
            r'title: "settings\.organization\.serviceTypes\.title"': 'title: "Service Types"',
            r'description: "settings\.organization\.serviceTypes\.description"': 'description: "Define the service types offered by your company. These are used in leads, proposals, and work orders."',
            r'placeholder: "settings\.organization\.serviceTypes\.placeholder"': 'placeholder: "New service type..."',
            r'title: "settings\.integrations\.title"': 'title: "Integrations"',
            r'description: "settings\.integrations\.description"': 'description: "Connect your favorite tools to streamline your workflow."',
            r'notifyMe: "settings\.integrations\.notifyMe"': 'notifyMe: "Notify me"',
            r'comingSoon: "settings\.integrations\.comingSoon"': 'comingSoon: "Coming Soon"',
            r'title: "production\.quickOrders\.title"': 'title: "Quick Orders"',
            r'welcome: "dashboard\.welcome"': 'welcome: "Welcome back"',
            r'todayOverview: "dashboard\.todayOverview"': 'todayOverview: "Here is your operation summary for today"',
        },
        'es': {
            r'title: "settings\.organization\.serviceTypes\.title"': 'title: "Tipos de Servicio"',
            r'description: "settings\.organization\.serviceTypes\.description"': 'description: "Define los tipos de servicio que ofrece tu empresa. Se usan en leads, propuestas y órdenes de trabajo."',
            r'placeholder: "settings\.organization\.serviceTypes\.placeholder"': 'placeholder: "Nuevo tipo de servicio..."',
            r'title: "settings\.integrations\.title"': 'title: "Integraciones"',
            r'description: "settings\.integrations\.description"': 'description: "Conecta tus herramientas favoritas para optimizar tu flujo de trabajo."',
            r'notifyMe: "settings\.integrations\.notifyMe"': 'notifyMe: "Notificarme"',
            r'comingSoon: "settings\.integrations\.comingSoon"': 'comingSoon: "Próximamente"',
            r'title: "production\.quickOrders\.title"': 'title: "Órdenes Rápidas"',
            r'welcome: "dashboard\.welcome"': 'welcome: "Bienvenido de nuevo"',
            r'todayOverview: "dashboard\.todayOverview"': 'todayOverview: "Aquí está el resumen de tu operación hoy"',
        }
    }
    
    for pattern, replacement in replacements[lang].items():
        content = re.sub(pattern, replacement, content)
        
    with open(path, 'w') as f:
        f.write(content)

patch('src/i18n/en.ts', 'en')
patch('src/i18n/es.ts', 'es')
