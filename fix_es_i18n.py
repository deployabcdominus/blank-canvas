import re
with open('src/i18n/es.ts', 'r') as f:
    lines = f.readlines()

# Count { and }
l_count = 0
r_count = 0
new_lines = []
for line in lines:
    l_count += line.count('{')
    r_count += line.count('}')
    new_lines.append(line)

if r_count > l_count:
    print(f"Excess }} found: {r_count} vs {l_count}")
    # Usually it's at the end.
    if new_lines[-1].strip() == '};' and new_lines[-2].strip() == '}':
        # Check if we have triple closing } at the end of the object
        # The technician block:
        # technician: { ... } } } } };
        pass

with open('src/i18n/es.ts', 'w') as f:
    f.writelines(new_lines)
