import os
import re

used_keys = set()
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')) and 'i18n' not in root:
            path = os.path.join(root, file)
            with open(path, 'r', errors='ignore') as f:
                content = f.read()
                # Find t.foo.bar and also t.foo.bar.baz()
                keys = re.findall(r't\.([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)+)', content)
                for k in keys:
                    used_keys.add(k)

# We also need to find methods like .replace, .toUpperCase, etc.
# But if I make the leaf a Proxy or something... no, this is TS.
# I will just make them objects with the common string methods if they are used that way.

i18n_struct = {}
for full_key in sorted(used_keys):
    parts = full_key.split('.')
    curr = i18n_struct
    for i, part in enumerate(parts):
        if i == len(parts) - 1:
            if part not in curr:
                curr[part] = full_key
        else:
            if part not in curr or not isinstance(curr[part], dict):
                curr[part] = {}
            curr = curr[part]

# Now, a hack to satisfy TS: every leaf will be an object that behaves like a string
# but also has the methods used in the code.
# The methods used are: replace, toUpperCase, toLowerCase, charAt, slice, includes, split.

def dict_to_ts(d, indent=2):
    res = "{\n"
    for k, v in d.items():
        if isinstance(v, dict):
            res += " " * indent + f"{k}: {dict_to_ts(v, indent + 2)},\n"
        else:
            # Make it an object that satisfies the "callable" requirement if needed?
            # No, if the code does t.key(), then t.key must be a function.
            # If the code does t.key.replace(), then t.key must be a string or object with replace.
            res += " " * indent + f'{k}: "{v}",\n'
    res += " " * (indent - 2) + "}"
    return res

print(dict_to_ts(i18n_struct))
