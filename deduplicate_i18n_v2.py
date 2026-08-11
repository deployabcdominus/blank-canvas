import re
import sys

def deduplicate(filepath, var_name):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extract the object content (everything between 'export const var_name ... = {' and '};')
    # Using a non-greedy match for the export declaration and a stack-based for the body
    start_pattern = f'export const {var_name}(?:: [\w\[\]]+)? = \\{{'
    match = re.search(start_pattern, content)
    if not match:
        print(f"Could not find object {var_name} in {filepath}")
        return
    
    start_pos = match.end()
    
    # Find the matching closing brace for the main object
    brace_count = 1
    end_pos = -1
    for i in range(start_pos, len(content)):
        if content[i] == '{':
            brace_count += 1
        elif content[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_pos = i
                break
    
    if end_pos == -1:
        print(f"Could not find end for object {var_name} in {filepath}")
        return
    
    body = content[start_pos:end_pos]
    
    # Find all top level keys
    blocks = {}
    pos = 0
    while pos < len(body):
        # Look for key: {
        key_match = re.search(r'\n  (\w+): \{', body[pos:])
        if not key_match:
            break
        
        key = key_match.group(1)
        key_start_in_body = pos + key_match.start()
        
        # Find end of this block
        inner_brace_count = 0
        block_end = -1
        for i in range(key_start_in_body + key_match.end() - 1, len(body)):
            if body[i] == '{':
                inner_brace_count += 1
            elif body[i] == '}':
                inner_brace_count -= 1
                if inner_brace_count == 0:
                    block_end = i + 1
                    break
        
        if block_end == -1:
            pos += 1
            continue
            
        block_content = body[key_start_in_body:block_end]
        if key not in blocks or len(block_content) > len(blocks[key]):
            blocks[key] = block_content
            
        pos = block_end

    new_body = "\n"
    order = ['landing', 'auth', 'common', 'nav', 'settings', 'dashboard', 'industryLabels', 'leads', 'proposals', 'workOrders', 'banners', 'payments', 'clients', 'projectMap', 'hudCard', 'aiBriefing', 'hudPipeline', 'revenueChart', 'workOrdersRadial', 'geoHeatmap', 'teamActivity', 'weeklyReport', 'addProposalModal', 'editProposalModal', 'registerPaymentModal', 'assignLeadModal', 'convertLeadModal', 'inviteMember', 'leadCard', 'proposalCard', 'installationPhotos', 'notificationBell', 'addLeadModal', 'editLeadModal', 'pipelineKanban', 'scheduleInstallationModal', 'installerCompanyModal', 'newWorkOrderModal', 'seo', 'production']
    
    for key in order:
        if key in blocks:
            new_body += blocks[key] + ",\n"
            del blocks[key]
            
    for key, block in blocks.items():
        new_body += block + ",\n"
        
    new_content = content[:start_pos] + new_body + content[end_pos:]
    
    with open(filepath, 'w') as f:
        f.write(new_content)

deduplicate('src/i18n/en.ts', 'en')
deduplicate('src/i18n/es.ts', 'es')
