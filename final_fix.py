import re

def fix(path):
    with open(path, 'r') as f:
        content = f.read()
    
    # Keep only up to the first '};' that is at the root level
    # Actually, let's just count braces from start
    brace_count = 0
    end_idx = -1
    for i in range(len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0 and i > 100: # heuristic for main object end
                end_idx = i + 1
                break
    
    if end_idx != -1:
        prefix = content[:end_idx]
        if 'export const' in prefix:
            with open(path, 'w') as f:
                f.write(prefix + ";\n")
                if 'en.ts' in path:
                    f.write("\nexport type TranslationKeys = typeof en;\n")
    else:
        print(f"Failed to find end of object in {path}")

fix('src/i18n/en.ts')
fix('src/i18n/es.ts')
