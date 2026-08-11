import os
import re

def fix_translation_file(path, locale):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacements to ensure objects where expected
    if locale == 'en':
        replacements = {
            r'filter: "production.filters.filter",': 'filter: "Filter",',
            r'active: "settings.domains.active",': 'active: "Active",',
        }
    else:
        replacements = {
            r'filter: "production.filters.filter",': 'filter: "Filtrar",',
            r'active: "settings.domains.active",': 'active: "Activo",',
        }

    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_translation_file('src/i18n/en.ts', 'en')
fix_translation_file('src/i18n/es.ts', 'es')
print("Patched i18n files for filter/active.")
