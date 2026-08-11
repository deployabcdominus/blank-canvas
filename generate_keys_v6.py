import os
import re

ignored_methods = {'replace', 'toUpperCase', 'toLowerCase', 'charAt', 'slice', 'includes', 'split', 'trim', 'map', 'filter', 'join'}

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
                    while parts and parts[-1] in ignored_methods:
                        parts.pop()
                    if parts:
                        all_paths.add('.'.join(parts))
                
                # 2. Indirect usage: const m = t.foo; ... m.bar
                # Find "const {name} = t.{key}" or "const {name} = t"
                # Actually, common pattern: const { t } = useLanguage(); const m = t.key;
                aliased = re.findall(r'const (\w+) = t\.([a-zA-Z0-9_\.]+)', content)
                for alias, key in aliased:
                    # Now find all alias.subkey
                    submatches = re.findall(rf'{alias}\.([a-zA-Z0-9_\.]+)', content)
                    for sm in submatches:
                        full = key + "." + sm
                        parts = full.split('.')
                        while parts and parts[-1] in ignored_methods:
                            parts.pop()
                        if parts:
                            all_paths.add('.'.join(parts))

i18n_struct = {}
for path in sorted(all_paths):
    parts = path.split('.')
    curr = i18n_struct
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
    for k, v in d.items():
        if isinstance(v, dict):
            res += " " * indent + f"{k}: {dict_to_ts(v, indent + 2)},\n"
        else:
            res += " " * indent + f'{k}: "{v}",\n'
    res += " " * (indent - 2) + "}"
    return res

print(dict_to_ts(i18n_struct))
