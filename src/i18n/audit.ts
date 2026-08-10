import { en } from './en';
import { es } from './es';

/**
 * Validates that all keys in the 'en' dictionary exist in the 'es' dictionary.
 * Returns an array of missing keys with their paths.
 */
export function validateTranslations() {
  const missingKeys: string[] = [];

  function compareObjects(source: any, target: any, path: string = '') {
    for (const key in source) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in target)) {
        missingKeys.push(currentPath);
        continue;
      }

      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        compareObjects(source[key], target[key], currentPath);
      }
    }
  }

  compareObjects(en, es);

  if (missingKeys.length > 0 && import.meta.env.DEV) {
    console.warn(
      `[i18n Audit] Missing Spanish translations for keys:\n- ${missingKeys.join('\n- ')}`
    );
  }

  return missingKeys;
}
