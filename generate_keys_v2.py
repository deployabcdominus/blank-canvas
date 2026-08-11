import os
import re

used_keys = set()
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')) and 'i18n' not in root:
            path = os.path.join(root, file)
            with open(path, 'r', errors='ignore') as f:
                content = f.read()
                keys = re.findall(r't\.([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)', content)
                for k in keys:
                    used_keys.add(k)

i18n_struct = {}
for full_key in sorted(used_keys):
    parts = full_key.split('.')
    curr = i18n_struct
    for i, part in enumerate(parts):
        if i == len(parts) - 1:
            if part not in curr: # Avoid overwriting if it's already a dict
                curr[part] = full_key
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
