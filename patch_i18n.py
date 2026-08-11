import os
import re

def fix_translation_file(path, locale):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the missing or broken structures based on build errors
    # 1. dashboard.seo needs to be an object in case components use t.dashboard.seo (unlikely based on my check but good to be safe)
    # Actually, the error shows t.landing.seo.title.split is the problem because landing.seo might be a string.
    # Let's fix landing.seo to be an object with title and description if it's currently a string.
    
    # 2. production.filters.sort needs to be an object
    # 3. settings.integrations.[name].bullets needs to be an array
    # 4. leadCard.proposalStatus needs to be an object mapping status keys
    # 5. addLeadModal.intakeQualityOptions needs to be an object
    # 6. addProposalModal.statusLabels needs to be an object

    # Use regex to find and replace specific blocks that are strings but should be objects
    
    # Fix landing.seo (if it's a string)
    content = re.sub(r'seo: "landing.seo",', 'seo: { title: "SignFlow | Elite Operations Platform", description: "The elite operations platform for modern sign companies." },', content)
    
    # Fix settings.integrations bullets (must be arrays)
    integration_names = ['ai', 'docusign', 'gcal', 'quickbooks', 'stripe', 'whatsapp', 'zapier']
    for name in integration_names:
        # Match bullets: "some.string", and replace with array
        pattern = fr'{name}: \{{(.*?)bullets: ".*?",'
        def replace_bullets(m):
            bullets = '["Feature 1", "Feature 2"]' if locale == 'en' else '["Característica 1", "Característica 2"]'
            return f'{name}: {{{m.group(1)}bullets: {bullets},'
        content = re.sub(pattern, replace_bullets, content, flags=re.DOTALL)

    # Fix leadCard structures
    if locale == 'en':
        content = re.sub(r'proposalStatus: "leadCard.proposalStatus",', 'proposalStatus: { draft: "Draft", sent: "Sent", approved: "Approved", rejected: "Rejected" },', content)
        content = re.sub(r'intakeQualityOptions: "addLeadModal.intakeQualityOptions",', 'intakeQualityOptions: { poor: "Poor", fair: "Fair", good: "Good", complete: "Complete" },', content)
        content = re.sub(r'statusLabels: "addProposalModal.statusLabels",', 'statusLabels: { "Borrador": "Draft", "Enviada externamente": "Sent Externally", "Aprobada": "Approved", "Rechazada": "Rejected" },', content)
    else:
        content = re.sub(r'proposalStatus: "leadCard.proposalStatus",', 'proposalStatus: { draft: "Borrador", sent: "Enviado", approved: "Aprobado", rejected: "Rechazado" },', content)
        content = re.sub(r'intakeQualityOptions: "addLeadModal.intakeQualityOptions",', 'intakeQualityOptions: { poor: "Baja", fair: "Media", good: "Alta", complete: "Completa" },', content)
        content = re.sub(r'statusLabels: "addProposalModal.statusLabels",', 'statusLabels: { "Borrador": "Borrador", "Enviada externamente": "Enviada externamente", "Aprobada": "Aprobada", "Rechazada": "Rechazada" },', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_translation_file('src/i18n/en.ts', 'en')
fix_translation_file('src/i18n/es.ts', 'es')
print("Patched i18n files.")
