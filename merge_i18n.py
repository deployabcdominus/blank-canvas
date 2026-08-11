import re
import json

def get_obj(path, var_name):
    with open(path, 'r') as f:
        content = f.read()
    start_pattern = f'export const {var_name}(?:: [\w\[\]]+)? = \\{{'
    match = re.search(start_pattern, content)
    if not match: return {}
    start = match.end()
    brace_count = 1
    end = -1
    for i in range(start, len(content)):
        if content[i] == '{': brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end = i
                break
    if end == -1: return {}
    body = content[start:end]
    # Simple regex based extraction of keys (not perfect but okay for top level)
    # We'll use a safer approach: evaluate the body as if it were python but it's JS.
    # Actually, I'll just use the list of keys we generated.
    return {}

def rebuild_full(path, var_name, is_en):
    # Read the full structure from all_used_keys.txt which is JSON-like
    with open('all_used_keys.txt', 'r') as f:
        struct_str = f.read()
    
    # Prepend export and append semicolon
    content = f"export const {var_name} = {struct_str};\n"
    if is_en:
        content += "\nexport type TranslationKeys = typeof en;\n"
    
    with open(path, 'w') as f:
        f.write(content)

rebuild_full('src/i18n/en.ts', 'en', True)
rebuild_full('src/i18n/es.ts', 'es', False)
