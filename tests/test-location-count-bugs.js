const fs = require('fs');
const path = require('path');
const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf-8');
let passed = 0, failed = 0;

console.log('Testing Location Count Bug Fixes...\n');

// Test 1: Custom locations limited
if (htmlContent.includes('limitedCustomLocations') && htmlContent.includes('.slice(0, numLocations)')) {
    console.log('PASS: Custom location limiting fix present');
    passed++;
} else {
    console.log('FAIL: Custom location fix missing');
    failed++;
}

// Test 2: Resolution not counted
if (htmlContent.includes('actualLocationCount') && htmlContent.includes('currentEncounterLocations.length')) {
    console.log('PASS: Resolution counting fix present');
    passed++;
} else {
    console.log('FAIL: Resolution count fix missing');
    failed++;
}

console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed);
