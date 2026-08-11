import re

def fix_quotes(path):
    with open(path, 'r') as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        # Count non-escaped quotes
        q_count = len(re.findall(r'(?<!\\)"', line))
        if q_count % 2 != 0:
            # Odd number of quotes. Check if it ends with a comma or brace.
            stripped = line.rstrip()
            if stripped.endswith(','):
                 # Try adding a quote before the comma
                 line = stripped[:-1].rstrip() + '",\n'
            elif stripped.endswith(':'):
                 pass # Key definition, usually doesn't have an odd number of quotes unless it's a key name
            else:
                 # Just add a quote at the end
                 line = stripped + '",\n'
        new_lines.append(line)
        
    with open(path, 'w') as f:
        f.writelines(new_lines)

fix_quotes('src/i18n/en.ts')
fix_quotes('src/i18n/es.ts')
