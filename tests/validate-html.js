const fs = require('fs');
const path = require('path');

console.log('🔍 Validating HTML structure...\n');

const htmlPath = path.join(__dirname, '../index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

let hasErrors = false;

// Check for required elements
const requiredElements = [
  'generatePage',
  'npcPage',
  'searchPage',
  'settingsPage',
  'encounterDisplay',
  'locationDetailPanel',
  'npcDetailPanel'
];

requiredElements.forEach(id => {
  if (!html.includes(`id="${id}"`)) {
    console.error(`❌ Missing required element: #${id}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found element: #${id}`);
  }
});

// Check for required scripts
const requiredScripts = [
  'data-loader.js',
  'utils.js',
  'storage.js',
  'app.js',
  'export.js',
  'core.js',
  'ui.js'
];

requiredScripts.forEach(script => {
  if (!html.includes(script)) {
    console.error(`❌ Missing script: ${script}`);
    hasErrors = true;
  } else {
    console.log(`✅ Found script: ${script}`);
  }
});

// Check for broken image references
const imageMatches = html.match(/src="([^"]*\.png)"/g);
if (imageMatches) {
  imageMatches.forEach(match => {
    const src = match.match(/src="([^"]*)"/)[1];
    const imgPath = path.join(__dirname, '..', src);
    if (!fs.existsSync(imgPath)) {
      console.error(`❌ Missing image: ${src}`);
      hasErrors = true;
    } else {
      console.log(`✅ Found image: ${src}`);
    }
  });
}

if (hasErrors) {
  console.error('\n❌ HTML validation failed!');
  process.exit(1);
} else {
  console.log('\n✅ HTML validation passed!');
  process.exit(0);
}
