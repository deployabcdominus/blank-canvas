import re

def clean_file(path, var_name):
    with open(path, 'r') as f:
        content = f.read()
    
    # Try to find the export declaration
    pattern = rf'export const {var_name}(?:: [\w\[\]]+)? = \{{'
    match = re.search(pattern, content)
    if not match:
        print(f"Could not find start of {var_name}")
        return
    
    prefix = content[:match.end()]
    
    # Find the VERY LAST }; in the file
    last_brace_idx = content.rfind('};')
    if last_brace_idx == -1:
         # Fallback to just balance braces
         pass
    
    # Extract the core object content
    body = content[match.end():last_brace_idx]
    
    # Remove any line that looks like an export or type definition that shouldn't be inside the object
    lines = body.split('\n')
    clean_lines = []
    for line in lines:
        if 'export const' in line or 'export type' in line:
            continue
        clean_lines.append(line)
    
    new_body = '\n'.join(clean_lines)
    
    # Now, attempt to deduplicate top level keys in new_body
    blocks = {}
    pos = 0
    while pos < len(new_body):
        key_match = re.search(r'\n  (\w+): \{', new_body[pos:])
        if not key_match:
            break
        key = key_match.group(1)
        k_start = pos + key_match.start()
        
        # Find matching brace
        bc = 0
        k_end = -1
        for i in range(k_start + key_match.end() - 1, len(new_body)):
            if new_body[i] == '{': bc += 1
            elif new_body[i] == '}':
                bc -= 1
                if bc == 0:
                    k_end = i + 1
                    break
        if k_end == -1:
            pos += 1
            continue
        
        block = new_body[k_start:k_end]
        if key not in blocks or len(block) > len(blocks[key]):
            blocks[key] = block
        pos = k_end
        
    final_body = "\n"
    for key in blocks:
        final_body += blocks[key] + ",\n"
        
    with open(path, 'w') as f:
        f.write(prefix + final_body + "\n};\n")
        if var_name == 'en':
            f.write("\nexport type TranslationKeys = typeof en;\n")
        else:
            # es.ts might need its imports back if I stripped them
            pass

clean_file('src/i18n/en.ts', 'en')
clean_file('src/i18n/es.ts', 'es')
