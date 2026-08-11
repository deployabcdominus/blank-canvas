import re

def patch(path, lang):
    with open(path, 'r') as f:
        content = f.read()
    
    # Pricing Features Fix
    if lang == 'en':
        content = re.sub(r'start: "settings\.pricing\.features\.start"', 'start: ["Lead Management", "Basic Proposals", "Production Tracking", "Up to 5 Users"]', content)
        content = re.sub(r'pro: "settings\.pricing\.features\.pro"', 'pro: ["Everything in Start", "Advanced Mockups", "Installation Mapping", "Unlimited Users"]', content)
        content = re.sub(r'elite: "settings\.pricing\.features\.elite"', 'elite: ["Everything in Pro", "White-label Portal", "AI Operations Briefing", "Priority Support"]', content)
        content = re.sub(r'start: "settings\.pricing\.taglines\.start"', 'start: "Perfect for growing sign shops"', content)
        content = re.sub(r'pro: "settings\.pricing\.taglines\.pro"', 'pro: "Scalable operations for professional teams"', content)
        content = re.sub(r'elite: "settings\.pricing\.taglines\.elite"', 'elite: ["Maximum performance for industry leaders"]', content) # Note: elite tagline in code was being assigned an array by my logic if I wasn't careful
    else:
        content = re.sub(r'start: "settings\.pricing\.features\.start"', 'start: ["Gestión de Leads", "Propuestas Básicas", "Seguimiento de Producción", "Hasta 5 Usuarios"]', content)
        content = re.sub(r'pro: "settings\.pricing\.features\.pro"', 'pro: ["Todo en Start", "Mockups Avanzados", "Mapa de Instalaciones", "Usuarios Ilimitados"]', content)
        content = re.sub(r'elite: "settings\.pricing\.features\.elite"', 'elite: ["Todo en Pro", "Portal Marca Blanca", "Briefing de Operaciones IA", "Soporte Prioritario"]', content)
        content = re.sub(r'start: "settings\.pricing\.taglines\.start"', 'start: "Ideal para talleres en crecimiento"', content)
        content = re.sub(r'pro: "settings\.pricing\.taglines\.pro"', 'pro: "Operaciones escalables para equipos profesionales"', content)
        content = re.sub(r'elite: "settings\.pricing\.taglines\.elite"', 'elite: "Máximo rendimiento para líderes de la industria"', content)

    # Elite tagline fix (ensure it's not an array in EN if accidentally made one)
    if lang == 'en':
        content = content.replace('elite: ["Maximum performance for industry leaders"]', 'elite: "Maximum performance for industry leaders"')

    with open(path, 'w') as f:
        f.write(content)

patch('src/i18n/en.ts', 'en')
patch('src/i18n/es.ts', 'es')
