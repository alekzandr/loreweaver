const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const files = [
  'encounters.json',
  'locations.json',
  'npcs.json',
  'skillchecks.json',
  'dangers.json'
];

let hasErrors = false;

// Helper function to check if first letter of each word is capitalized
function isProperlyCapitalized(str) {
  const words = str.split(' ');
  return words.every(word => {
    if (word.length === 0) return true;
    return word[0] === word[0].toUpperCase();
  });
}

// Recursive function to validate capitalization in objects
function validateCapitalization(obj, filePath, locationPath = '') {
  const errors = [];
  
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = locationPath ? `${locationPath}.${key}` : key;
      
      // Check if this is a primary, secondary, or tertiary array
      if ((key === 'primary' || key === 'secondary' || key === 'tertiary') && Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string' && !isProperlyCapitalized(item)) {
            errors.push(`${currentPath}[${index}]: "${item}" - first letter of each word must be capitalized`);
          }
        });
      } else if (typeof value === 'object') {
        // Recursively check nested objects
        errors.push(...validateCapitalization(value, filePath, currentPath));
      }
    }
  }
  
  return errors;
}

console.log('🔍 Validating JSON files...\n');

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Basic structure validation
    if (file === 'encounters.json') {
      const environments = Object.keys(data);
      if (environments.length === 0) {
        throw new Error('No environments defined');
      }
      environments.forEach(env => {
        if (!Array.isArray(data[env])) {
          throw new Error(`Environment "${env}" is not an array`);
        }
        data[env].forEach((encounter, idx) => {
          if (!encounter.title) {
            throw new Error(`Encounter ${idx} in "${env}" missing title`);
          }
          if (!encounter.descriptions && !encounter.description) {
            throw new Error(`Encounter "${encounter.title}" missing descriptions`);
          }
          if (!encounter.tags || !Array.isArray(encounter.tags)) {
            throw new Error(`Encounter "${encounter.title}" missing or invalid tags`);
          }
        });
      });
    }
    
    if (file === 'npcs.json') {
      if (!data.species || !data.professions || !data.alignments) {
        throw new Error('Missing required NPC data categories');
      }
    }
    
    // Validate capitalization for locations.json
    if (file === 'locations.json') {
      const capitalizationErrors = validateCapitalization(data, file);
      if (capitalizationErrors.length > 0) {
        console.error(`❌ ${file} - Capitalization errors:`);
        capitalizationErrors.forEach(err => console.error(`   ${err}`));
        hasErrors = true;
        return;
      }
    }
    
    console.log(`✅ ${file} - Valid (${Math.round(content.length / 1024)}KB)`);
  } catch (error) {
    console.error(`❌ ${file} - ERROR: ${error.message}`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('\n❌ JSON validation failed!');
  process.exit(1);
} else {
  console.log('\n✅ All JSON files are valid!');
  process.exit(0);
}
