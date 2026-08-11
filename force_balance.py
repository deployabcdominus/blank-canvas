import sys

def balance(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    l = content.count('{')
    r = content.count('}')
    
    if l > r:
        print(f"Adding {l-r} braces to {filepath}")
        # Insert them before the end of the object
        # We find the last };
        if '};' in content:
            parts = content.rsplit('};', 1)
            content = parts[0] + ('\n  }' * (l - r)) + '\n};' + parts[1]
        else:
            content += ('\n}' * (l-r)) + ';'
            
    with open(filepath, 'w') as f:
        f.write(content)

balance('src/i18n/en.ts')
balance('src/i18n/es.ts')
