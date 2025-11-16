const fs = require('fs');
const path = require('path');

// List of vital files that must exist
const vitalFiles = [
  // HTML
  'index.html',
  
  // CSS
  'assets/css/base.css',
  'assets/css/components.css',
  'assets/css/pages.css',
  'assets/css/themes.css',
  'assets/css/mobile.css',
  
  // JavaScript
  'assets/js/app.js',
  'assets/js/core.js',
  'assets/js/data-loader.js',
  'assets/js/export.js',
  'assets/js/storage.js',
  'assets/js/ui.js',
  'assets/js/utils.js',
  'assets/js/mobile.js',
  
  // Data files
  'data/encounters.json',
  'data/locations.json',
  'data/npcs.json',
  'data/skillchecks.json',
  'data/dangers.json',
  
  // Images
  'assets/img/d20.png',
  'assets/img/character.png',
  
  // Configuration
  'package.json',
  '.eslintrc.json',
  
  // Documentation
  'README.md',
  'TESTING.md'
];

let hasErrors = false;
const rootDir = path.join(__dirname, '..');

console.log('🔍 Validating vital files exist...\n');

vitalFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const size = stats.size > 1024 
      ? `${Math.round(stats.size / 1024)}KB` 
      : `${stats.size}B`;
    console.log(`✅ ${file} (${size})`);
  } else {
    console.error(`❌ ${file} - MISSING`);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.error('\n❌ File validation failed! Some vital files are missing.');
  process.exit(1);
} else {
  console.log('\n✅ All vital files exist!');
  process.exit(0);
}
