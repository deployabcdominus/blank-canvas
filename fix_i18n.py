import os
import re

def clean_i18n(path, lang):
    with open(path, 'r', errors='ignore') as f:
        lines = f.readlines()
    
    # We want to find the lines starting with ": {" or similar and remove them
    # But wait, looking at the previous output:
    # 1: export const en = {
    # 2:   : {
    # 3:     : {
    # 4:       : "..",
    # 5:     },
    # 6:   },
    # This is clearly broken.
    
    # I'll just write a fresh template and populate it with the keys we found earlier.
    # I'll use the used_keys logic to get a baseline structure.
    pass

def generate_full_i18n(lang):
    # This is the most robust way: rescan everything and build the structure
    ignored_methods = {'replace', 'toUpperCase', 'toLowerCase', 'charAt', 'slice', 'includes', 'split', 'trim', 'map', 'filter', 'join', 'toString'}

    all_paths = set()
    for root, dirs, files in os.walk('src'):
        for file in files:
            if file.endswith(('.tsx', '.ts')) and 'i18n' not in root:
                path = os.path.join(root, file)
                with open(path, 'r', errors='ignore') as f:
                    content = f.read()
                    
                    # 1. Direct usage: t.foo.bar
                    matches = re.findall(r't\.([a-zA-Z0-9_\.]+)', content)
                    for m in matches:
                        parts = m.split('.')
                        # Filter out numbers and single dots at the start
                        while parts and parts[-1] in ignored_methods:
                            parts.pop()
                        if parts and all(re.match(r'^[a-zA-Z]\w*$', p) for p in parts):
                            all_paths.add('.'.join(parts))
                    
                    # 2. Alias usage
                    aliased = re.findall(r'const (\w+) = t\.([a-zA-Z0-9_\.]+)', content)
                    for alias, key in aliased:
                        submatches = re.findall(rf'{alias}\.([a-zA-Z0-9_\.]+)', content)
                        for sm in submatches:
                            full = key + "." + sm
                            parts = full.split('.')
                            while parts and parts[-1] in ignored_methods:
                                parts.pop()
                            if parts and all(re.match(r'^[a-zA-Z]\w*$', p) for p in parts):
                                all_paths.add('.'.join(parts))

    # Add mandatory keys
    all_paths.add("seo.title")
    all_paths.add("seo.description")
    all_paths.add("common.save")
    all_paths.add("common.cancel")
    all_paths.add("common.error")
    all_paths.add("common.success")

    # Build tree
    tree = {}
    for path in sorted(all_paths):
        parts = path.split('.')
        curr = tree
        for i, part in enumerate(parts):
            if i == len(parts) - 1:
                if part not in curr:
                    curr[part] = path
            else:
                if part not in curr or not isinstance(curr[part], dict):
                    curr[part] = {}
                curr = curr[part]

    def dict_to_ts(d, indent=2):
        res = "{\n"
        for k, v in sorted(d.items()):
            if isinstance(v, dict):
                res += " " * indent + f"{k}: {dict_to_ts(v, indent + 2)},\n"
            else:
                # Value mapping
                val = v
                if lang == 'en':
                    # Heuristics for common values
                    if k == 'save': val = "Save"
                    elif k == 'cancel': val = "Cancel"
                    elif k == 'error': val = "Error"
                    elif k == 'success': val = "Success"
                    elif k == 'title' and 'seo' in v: val = "SignFlow | Elite Operations Platform"
                    elif k == 'description' and 'seo' in v: val = "The elite operations platform for modern sign companies."
                    elif k == 'saving': val = "Saving..."
                    elif k == 'date': val = "Date"
                    elif k == 'notes': val = "Notes"
                    elif k == 'measurements': val = "Measurements"
                    elif k == 'width': val = "Width"
                    elif k == 'height': val = "Height"
                    elif k == 'depth': val = "Depth"
                    elif k == 'add': val = "Add"
                    elif k == 'select': val = "Select"
                    elif k == 'selected': val = "Selected"
                    elif k == 'status': val = "Status"
                    elif k == 'next': val = "Next"
                    elif k == 'view': val = "View"
                    elif k == 'create': val = "Create"
                else:
                    if k == 'save': val = "Guardar"
                    elif k == 'cancel': val = "Cancelar"
                    elif k == 'error': val = "Error"
                    elif k == 'success': val = "Éxito"
                    elif k == 'title' and 'seo' in v: val = "SignFlow | Plataforma de Operaciones de Élite"
                    elif k == 'description' and 'seo' in v: val = "La plataforma de operaciones de élite para empresas de rotulación modernas."
                    elif k == 'saving': val = "Guardando..."
                    elif k == 'date': val = "Fecha"
                    elif k == 'notes': val = "Notas"
                    elif k == 'measurements': val = "Medidas"
                    elif k == 'width': val = "Ancho"
                    elif k == 'height': val = "Alto"
                    elif k == 'depth': val = "Profundidad"
                    elif k == 'add': val = "Agregar"
                    elif k == 'select': val = "Seleccionar"
                    elif k == 'selected': val = "Seleccionado"
                    elif k == 'status': val = "Estado"
                    elif k == 'next': val = "Siguiente"
                    elif k == 'view': val = "Ver"
                    elif k == 'create': val = "Crear"
                
                res += " " * indent + f'{k}: "{val}",\n'
        res += " " * (indent - 2) + "}"
        return res

    header = f"export const {lang} = {dict_to_ts(tree, 2)};\n"
    if lang == 'en':
        header += "\nexport type TranslationKeys = typeof en;\n"
    return header

with open('src/i18n/en.ts', 'w') as f:
    f.write(generate_full_i18n('en'))
with open('src/i18n/es.ts', 'w') as f:
    f.write(generate_full_i18n('es'))
