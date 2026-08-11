import os
import re

def fix_translation_file(path, locale):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the missing or broken structures based on build errors
    
    # 1. Fix landing.seo (ensure it's an object, not a string)
    content = re.sub(r'seo: "landing.seo",', 'seo: { title: "SignFlow | Elite Operations Platform", description: "The elite operations platform for modern sign companies." },', content)
    
    # 2. Fix settings.integrations bullets (ensure they are arrays)
    integration_names = ['ai', 'docusign', 'gcal', 'quickbooks', 'stripe', 'whatsapp', 'zapier']
    for name in integration_names:
        pattern = fr'{name}: \{{(.*?)bullets: ".*?",'
        def replace_bullets(m):
            bullets = '["Feature 1", "Feature 2"]' if locale == 'en' else '["Característica 1", "Característica 2"]'
            return f'{name}: {{{m.group(1)}bullets: {bullets},'
        content = re.sub(pattern, replace_bullets, content, flags=re.DOTALL)

    # 3. Add required objects for components
    if locale == 'en':
        replacements = {
            r'proposalStatus: "leadCard.proposalStatus",': 'proposalStatus: { draft: "Draft", sent: "Sent", approved: "Approved", rejected: "Rejected" },',
            r'intakeQualityOptions: "addLeadModal.intakeQualityOptions",': 'intakeQualityOptions: { poor: "Poor", fair: "Fair", good: "Good", complete: "Complete" },',
            r'statusLabels: "addProposalModal.statusLabels",': 'statusLabels: { "Borrador": "Draft", "Enviada externamente": "Sent Externally", "Aprobada": "Approved", "Rechazada": "Rejected" },',
            r'statusLabels: "workOrders.statusLabels",': 'statusLabels: { inProduction: "In Production", installed: "Installed", pending: "Pending", qc: "QC", ready: "Ready" },',
            r'timeAgo: "teamActivity.timeAgo",': 'timeAgo: { now: "just now", minutes: "{{count}}m ago", hours: "{{count}}h ago", days: "{{count}}d ago" },',
            r'installStatus: "pipelineKanban.installStatus",': 'installStatus: { completed: "Completed", inProgress: "In Progress", scheduled: "Scheduled" },',
            r'methods: "registerPaymentModal.methods",': 'methods: { cash: "Cash", check: "Check", card: "Card", transfer: "Transfer" },',
            r'priority: "production.operatorStation.priority",': 'priority: { low: "Low", medium: "Medium", high: "High", critical: "Critical" },',
            r'sort: "production.filters.sort",': 'sort: { newest: "Newest", oldest: "Oldest", priority: "Priority", status: "Status", targetDate: "Target Date" },',
            r'status: "production.filters.status",': 'status: { inProduction: "In Production", materialsOrdered: "Materials Ordered", produced: "Produced", qualityControl: "Quality Control" },',
            r'statusLabels: "projectMap.statusLabels",': 'statusLabels: { completed: "Completed", inProgress: "In Progress", scheduled: "Scheduled" },',
        }
    else:
        replacements = {
            r'proposalStatus: "leadCard.proposalStatus",': 'proposalStatus: { draft: "Borrador", sent: "Enviado", approved: "Aprobado", rejected: "Rechazado" },',
            r'intakeQualityOptions: "addLeadModal.intakeQualityOptions",': 'intakeQualityOptions: { poor: "Baja", fair: "Media", good: "Alta", complete: "Completa" },',
            r'statusLabels: "addProposalModal.statusLabels",': 'statusLabels: { "Borrador": "Borrador", "Enviada externamente": "Enviada externamente", "Aprobada": "Aprobada", "Rechazada": "Rechazada" },',
            r'statusLabels: "workOrders.statusLabels",': 'statusLabels: { inProduction: "En Producción", installed: "Instalado", pending: "Pendiente", qc: "QC", ready: "Listo" },',
            r'timeAgo: "teamActivity.timeAgo",': 'timeAgo: { now: "ahora mismo", minutes: "hace {{count}}m", hours: "hace {{count}}h", days: "hace {{count}}d" },',
            r'installStatus: "pipelineKanban.installStatus",': 'installStatus: { completed: "Completado", inProgress: "En Progreso", scheduled: "Programado" },',
            r'methods: "registerPaymentModal.methods",': 'methods: { cash: "Efectivo", check: "Cheque", card: "Tarjeta", transfer: "Transferencia" },',
            r'priority: "production.operatorStation.priority",': 'priority: { low: "Baja", medium: "Media", high: "Alta", critical: "Crítica" },',
            r'sort: "production.filters.sort",': 'sort: { newest: "Más reciente", oldest: "Más antiguo", priority: "Prioridad", status: "Estado", targetDate: "Fecha objetivo" },',
            r'status: "production.filters.status",': 'status: { inProduction: "En Producción", materialsOrdered: "Materiales Pedidos", produced: "Producido", qualityControl: "Control de Calidad" },',
            r'statusLabels: "projectMap.statusLabels",': 'statusLabels: { completed: "Completado", inProgress: "En Progreso", scheduled: "Programado" },',
        }

    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)

    # 4. Correct Pricing tags
    if locale == 'en':
        content = re.sub(r'taglines: "settings.pricing.taglines",', 'taglines: { start: "Perfect for growing sign shops", pro: "Scalable operations for professional teams", elite: "Maximum performance for industry leaders" },', content)
    else:
        content = re.sub(r'taglines: "settings.pricing.taglines",', 'taglines: { start: "Ideal para talleres en crecimiento", pro: "Operaciones escalables para equipos profesionales", elite: "Máximo rendimiento para líderes de la industria" },', content)

    # 5. Fix Settings Custom Domains structure
    if locale == 'en':
        content = re.sub(r'domains: \{(.*?)setupTitle: "settings.domains.setupTitle",', r'domains: {\1title: "Custom Domains", subtitle: "Configure your own domain for a professional experience.", setupTitle: "settings.domains.setupTitle",', content, flags=re.DOTALL)
    else:
        content = re.sub(r'domains: \{(.*?)setupTitle: "settings.domains.setupTitle",', r'domains: {\1title: "Dominios Personalizados", subtitle: "Configura tu propio dominio para una experiencia profesional.", setupTitle: "settings.domains.setupTitle",', content, flags=re.DOTALL)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_translation_file('src/i18n/en.ts', 'en')
fix_translation_file('src/i18n/es.ts', 'es')
print("Patched i18n files.")
