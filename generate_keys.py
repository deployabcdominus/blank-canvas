import os
import re

used_keys = set()
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
                # Find t.dashboard.title, t.common.save, etc.
                keys = re.findall(r't\.(\w+(?:\.\w+)+)', content)
                for k in keys:
                    used_keys.add(k)

# Organize keys into a nested dict
i18n_struct = {}
for full_key in sorted(used_keys):
    parts = full_key.split('.')
    curr = i18n_struct
    for i, part in enumerate(parts):
        if i == len(parts) - 1:
            curr[part] = f"FIXME: {full_key}"
        else:
            if part not in curr:
                curr[part] = {}
            curr = curr[part]

def dict_to_str(d, indent=2):
    res = "{\n"
    for k, v in d.items():
        if isinstance(v, dict):
            res += " " * indent + f"{k}: {dict_to_str(v, indent + 2)},\n"
        else:
            res += " " * indent + f'{k}: "{v}",\n'
    res += " " * (indent - 2) + "}"
    return res

print(dict_to_str(i18n_struct))
