import re

def add_pricing(path, is_en):
    with open(path, 'r') as f:
        content = f.read()
    
    if is_en:
        pricing_data = """
      taglines: {
        start: "Freelancers / Self-employed",
        pro: "Small & Medium Businesses",
        elite: "Enterprise & Multi-team",
      },
      features: {
        start: ["CRM + Manual Management", "Up to 3 users", "Standard labels", "File uploads", "Basic security"],
        pro: ["Everything in Start, plus:", "Digital signature portal", "Mockup generator", "Advanced automation", "Custom dictionaries", "Daily backup", "Up to 15 users"],
        elite: ["Everything in Pro, plus:", "Pro Plans & Annotations", "Unlimited fields", "Subcontractors / Logistics", "API & Webhooks", "Full Audit Logs", "Unlimited users", "Priority support"],
      },"""
    else:
        pricing_data = """
      taglines: {
        start: "Auto-empleados / Freelance",
        pro: "Pequeñas y Medianas Empresas",
        elite: "Empresas con múltiples equipos",
      },
      features: {
        start: ["CRM + Gestión Manual", "Hasta 3 usuarios", "Etiquetas estándar", "Subida de archivos", "Seguridad básica"],
        pro: ["Todo en Start, más:", "Portal de firma digital", "Generador de Mockups", "Automatización avanzada", "Diccionarios personalizados", "Backup diario", "Hasta 15 usuarios"],
        elite: ["Todo en Pro, más:", "Planos y Anotaciones Pro", "Campos ilimitados", "Subcontratistas / Logística", "API y Webhooks", "Audit Logs completos", "Usuarios ilimitados", "Soporte prioritario"],
      },"""

    # Insert after 'pricing: {'
    content = content.replace('pricing: {', 'pricing: {' + pricing_data)
    
    with open(path, 'w') as f:
        f.write(content)

add_pricing('src/i18n/en.ts', True)
add_pricing('src/i18n/es.ts', False)
