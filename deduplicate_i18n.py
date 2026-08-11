import re
import sys

def deduplicate(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extract the object content (everything between 'export const en = {' and '};')
    match = re.search(r'export const \w+ = \{(.*)\};', content, re.DOTALL)
    if not match:
        print(f"Could not find object in {filepath}")
        return
    
    body = match.group(1)
    
    # Find all top level keys
    # They usually look like '  key: {'
    keys = re.findall(r'\n  (\w+): \{', body)
    
    # We will split the body by these keys.
    # This is tricky because of nested objects.
    # We'll use a stack-based parser to find the end of each top-level block.
    blocks = {}
    
    pos = 0
    while True:
        key_match = re.search(r'\n  (\w+): \{', body[pos:])
        if not key_match:
            break
        
        key = key_match.group(1)
        key_start = pos + key_match.start()
        
        # Find the matching closing brace for this block
        brace_count = 0
        block_end = -1
        for i in range(key_start + key_match.end() - 1, len(body)):
            if body[i] == '{':
                brace_count += 1
            elif body[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    block_end = i + 1
                    break
        
        if block_end == -1:
            print(f"Could not find end for key {key} in {filepath}")
            pos += 1
            continue
            
        block_content = body[key_start:block_end]
        
        # If we have multiple blocks for the same key, we take the largest one (usually the most complete)
        if key not in blocks or len(block_content) > len(blocks[key]):
            blocks[key] = block_content
            
        pos = block_end

    # Rebuild the body
    new_body = ""
    # Define the order we want
    order = ['landing', 'auth', 'common', 'nav', 'settings', 'dashboard', 'industryLabels', 'leads', 'proposals', 'workOrders', 'banners', 'payments', 'clients', 'projectMap', 'hudCard', 'aiBriefing', 'hudPipeline', 'revenueChart', 'workOrdersRadial', 'geoHeatmap', 'teamActivity', 'weeklyReport', 'addProposalModal', 'editProposalModal', 'registerPaymentModal', 'assignLeadModal', 'convertLeadModal', 'inviteMember', 'leadCard', 'proposalCard', 'installationPhotos', 'notificationBell', 'addLeadModal', 'editLeadModal', 'pipelineKanban', 'scheduleInstallationModal', 'installerCompanyModal', 'newWorkOrderModal', 'seo', 'production']
    
    for key in order:
        if key in blocks:
            new_body += blocks[key] + ",\n"
            del blocks[key]
            
    # Add any remaining keys
    for key, block in blocks.items():
        new_body += block + ",\n"
        
    # Re-insert into content
    prefix = content[:match.start(1)]
    suffix = content[match.end(1):]
    
    with open(filepath, 'w') as f:
        f.write(prefix + new_body + suffix)

deduplicate('src/i18n/en.ts')
deduplicate('src/i18n/es.ts')
