const fs = require('fs');

function parseTranslations(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  // Remove export and type definitions to get a clean object string
  const jsonMatch = content.match(/export const (en|es) = ({[\s\S]*});/);
  if (!jsonMatch) throw new Error('Could not parse ' + filePath);
  
  // This is a dirty hack but safer than eval for sandboxed JS if it's just keys we want
  // We'll use a regex to find all keys
  const keys = [];
  const lines = content.split('\n');
  lines.forEach(line => {
    const keyMatch = line.match(/^\s*([a-zA-Z0-9_]+):/);
    if (keyMatch) keys.push(keyMatch[1]);
  });
  return keys;
}

const enKeys = parseTranslations('src/i18n/en.ts');
const esKeys = parseTranslations('src/i18n/es.ts');

console.log('EN keys count:', enKeys.length);
console.log('ES keys count:', esKeys.length);

const missingInEs = enKeys.filter(k => !esKeys.includes(k));
const missingInEn = esKeys.filter(k => !enKeys.includes(k));

if (missingInEs.length > 0) console.log('Missing in ES:', missingInEs);
if (missingInEn.length > 0) console.log('Missing in EN:', missingInEn);

if (missingInEs.length === 0 && missingInEn.length === 0) {
  console.log('Parity check passed!');
} else {
  process.exit(1);
}
