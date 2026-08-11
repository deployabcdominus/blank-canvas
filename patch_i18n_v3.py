import os
import re

def fix_translation_file(path, locale):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the missing or broken structures based on build errors
    
    # 1. Fix landing.seo (ensure it's an object, not a string)
    content = re.sub(r'seo: "landing.seo",', 'seo: { title: "SignFlow | Elite Operations Platform", description: "The elite operations platform for modern sign companies." },', content)
    
    # 2. Fix landing arrays and nested objects
    if locale == 'en':
        replacements = {
            r'features: "landing.pricing.start.features",': 'features: ["Lead Management", "Basic Proposals", "Production Tracking", "Up to 5 Users"],',
            r'features: "landing.pricing.pro.features",': 'features: ["Everything in Start", "Advanced Mockups", "Installation Mapping", "Unlimited Users"],',
            r'features: "landing.pricing.elite.features",': 'features: ["Everything in Pro", "White-label Portal", "AI Operations Briefing", "Priority Support"],',
            r'items: "landing.faq.items",': 'items: [{ q: "How long does setup take?", a: "Most teams are up and running in less than 24 hours." }, { q: "Do you offer custom integrations?", a: "Yes, our Elite plan includes custom API access and dedicated support." }],',
            r'productLinks: "landing.footer.productLinks",': 'productLinks: ["Features", "Pricing", "API Documentation", "Security"],',
            r'companyLinks: "landing.footer.companyLinks",': 'companyLinks: ["About Us", "Contact", "Careers", "Blog"],',
            r'legalLinks: "landing.footer.legalLinks",': 'legalLinks: ["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"],',
        }
    else:
        replacements = {
            r'features: "landing.pricing.start.features",': 'features: ["Gestión de Leads", "Propuestas Básicas", "Seguimiento de Producción", "Hasta 5 Usuarios"],',
            r'features: "landing.pricing.pro.features",': 'features: ["Todo en Start", "Mockups Avanzados", "Mapa de Instalaciones", "Usuarios Ilimitados"],',
            r'features: "landing.pricing.elite.features",': 'features: ["Todo en Pro", "Portal Marca Blanca", "Briefing de Operaciones IA", "Soporte Prioritario"],',
            r'items: "landing.faq.items",': 'items: [{ q: "¿Cuánto tiempo toma la configuración?", a: "La mayoría de los equipos están listos en menos de 24 horas." }, { q: "¿Ofrecen integraciones personalizadas?", a: "Sí, nuestro plan Elite incluye acceso a API personalizado y soporte dedicado." }],',
            r'productLinks: "landing.footer.productLinks",': 'productLinks: ["Funciones", "Precios", "Documentación API", "Seguridad"],',
            r'companyLinks: "landing.footer.companyLinks",': 'companyLinks: ["Sobre Nosotros", "Contacto", "Carreras", "Blog"],',
            r'legalLinks: "landing.footer.legalLinks",': 'legalLinks: ["Privacidad", "Términos", "Cookies", "RGPD"],',
        }

    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_translation_file('src/i18n/en.ts', 'en')
fix_translation_file('src/i18n/es.ts', 'es')
print("Patched i18n files for landing arrays.")
