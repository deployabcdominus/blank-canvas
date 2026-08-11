import os
import re

def fix_translation_file(path, locale):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

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

    # 3. Fix missing objects reported as "map" or "split" or "toUpperCase" errors
    # Add statusLabels and other required objects
    if locale == 'en':
        content = re.sub(r'proposalStatus: "leadCard.proposalStatus",', 'proposalStatus: { draft: "Draft", sent: "Sent", approved: "Approved", rejected: "Rejected" },', content)
        content = re.sub(r'intakeQualityOptions: "addLeadModal.intakeQualityOptions",', 'intakeQualityOptions: { poor: "Poor", fair: "Fair", good: "Good", complete: "Complete" },', content)
        content = re.sub(r'statusLabels: "addProposalModal.statusLabels",', 'statusLabels: { "Borrador": "Draft", "Enviada externamente": "Sent Externally", "Aprobada": "Approved", "Rechazada": "Rejected" },', content)
        content = re.sub(r'statusLabels: "workOrders.statusLabels",', 'statusLabels: { inProduction: "In Production", installed: "Installed", pending: "Pending", qc: "QC", ready: "Ready" },', content)
    else:
        content = re.sub(r'proposalStatus: "leadCard.proposalStatus",', 'proposalStatus: { draft: "Borrador", sent: "Enviado", approved: "Aprobado", rejected: "Rechazado" },', content)
        content = re.sub(r'intakeQualityOptions: "addLeadModal.intakeQualityOptions",', 'intakeQualityOptions: { poor: "Baja", fair: "Media", good: "Alta", complete: "Completa" },', content)
        content = re.sub(r'statusLabels: "addProposalModal.statusLabels",', 'statusLabels: { "Borrador": "Borrador", "Enviada externamente": "Enviada externamente", "Aprobada": "Aprobada", "Rechazada": "Rechazada" },', content)
        content = re.sub(r'statusLabels: "workOrders.statusLabels",', 'statusLabels: { inProduction: "En Producción", installed: "Instalado", pending: "Pendiente", qc: "QC", ready: "Listo" },', content)

    # 4. Fix teamActivity timeAgo and other UI objects
    if locale == 'en':
        content = re.sub(r'timeAgo: "teamActivity.timeAgo",', 'timeAgo: { now: "just now", minutes: "{{count}}m ago", hours: "{{count}}h ago", days: "{{count}}d ago" },', content)
        content = re.sub(r'installStatus: "pipelineKanban.installStatus",', 'installStatus: { completed: "Completed", inProgress: "In Progress", scheduled: "Scheduled" },', content)
    else:
        content = re.sub(r'timeAgo: "teamActivity.timeAgo",', 'timeAgo: { now: "ahora mismo", minutes: "hace {{count}}m", hours: "hace {{count}}h", days: "hace {{count}}d" },', content)
        content = re.sub(r'installStatus: "pipelineKanban.installStatus",', 'installStatus: { completed: "Completado", inProgress: "En Progreso", scheduled: "Programado" },', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_translation_file('src/i18n/en.ts', 'en')
fix_translation_file('src/i18n/es.ts', 'es')
print("Patched i18n files.")
