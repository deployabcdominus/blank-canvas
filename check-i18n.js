import { en } from './src/i18n/en';
import { es } from './src/i18n/es';

const checkKeys = (obj1, obj2, path = '') => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  keys1.forEach(key => {
    if (!keys2.includes(key)) {
      console.log(`Missing key in ES: ${path}${key}`);
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
      checkKeys(obj1[key], obj2[key], `${path}${key}.`);
    }
  });
  
  keys2.forEach(key => {
    if (!keys1.includes(key)) {
      console.log(`Missing key in EN: ${path}${key}`);
    }
  });
};

console.log('Checking translation keys parity...');
checkKeys(en, es);
console.log('Done.');
