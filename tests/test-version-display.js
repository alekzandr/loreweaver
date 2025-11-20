/**
 * Test Suite: Version Display Feature
 * Tests version display in footer and manual changelog access
 */

const fs = require('fs');
const path = require('path');

// Test results
let passed = 0;
let failed = 0;
const failures = [];

/**
 * Test helper function
 */
function test(description, testFn) {
    try {
        testFn();
        passed++;
        console.log(`✅ ${description}`);
    } catch (error) {
        failed++;
        failures.push({ description, error: error.message });
        console.error(`❌ ${description}`);
        console.error(`   ${error.message}`);
    }
}

/**
 * Assert helper
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

console.log('\n🧪 Running Version Display Tests...\n');

// Test 1: Version.json exists and is valid
test('version.json file exists and is valid JSON', () => {
    const versionPath = path.join(__dirname, '..', 'data', 'version.json');
    assert(fs.existsSync(versionPath), 'version.json file should exist');
    
    const content = fs.readFileSync(versionPath, 'utf8');
    const versionData = JSON.parse(content);
    
    assert(versionData.version, 'version property should exist');
    assert(typeof versionData.version === 'string', 'version should be a string');
    assert(/^\d+\.\d+\.\d+$/.test(versionData.version), 'version should follow semver format (x.y.z)');
});

// Test 2: index.html has version display element
test('index.html contains versionDisplay element', () => {
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');
    
    assert(content.includes('id="versionDisplay"'), 'HTML should contain element with id="versionDisplay"');
    assert(content.includes('onclick="window.showChangelogManual()"'), 'Version element should have onclick handler');
});

// Test 3: Footer element has proper accessibility attributes
test('Footer version display has proper ARIA labels', () => {
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');
    
    const versionDisplayMatch = content.match(/id="versionDisplay"[^>]*>/);
    assert(versionDisplayMatch, 'versionDisplay element should exist');
    
    const element = versionDisplayMatch[0];
    assert(element.includes('role="button"'), 'Version display should have role="button"');
    assert(element.includes('aria-label'), 'Version display should have aria-label');
    assert(element.includes('tabindex'), 'Version display should have tabindex for keyboard navigation');
});

// Test 4: Footer element has keyboard support
test('Footer version display has keyboard event handlers', () => {
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');
    
    const versionDisplayMatch = content.match(/id="versionDisplay"[^>]*>/);
    assert(versionDisplayMatch, 'versionDisplay element should exist');
    
    const element = versionDisplayMatch[0];
    assert(element.includes('onkeypress'), 'Version display should have onkeypress handler');
});

// Test 5: Settings page has "What's New" button
test('Settings page contains "What\'s New" button', () => {
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');
    
    assert(content.includes('What\'s New'), 'Settings page should contain "What\'s New" button');
    
    // Find the button and verify it calls showChangelogManual
    const buttonMatch = content.match(/What's New[^<]*<\/button>/);
    assert(buttonMatch, '"What\'s New" button should exist');
    
    // Look backwards from the match to find the onclick handler
    const beforeButton = content.substring(0, content.indexOf('What\'s New'));
    const buttonStart = beforeButton.lastIndexOf('<button');
    const buttonHTML = content.substring(buttonStart, content.indexOf('What\'s New') + 100);
    
    assert(buttonHTML.includes('showChangelogManual'), 'Button should call showChangelogManual()');
});

// Test 6: app.js has displayVersion function
test('app.js contains displayVersion function', () => {
    const appJsPath = path.join(__dirname, '..', 'assets', 'js', 'app.js');
    const content = fs.readFileSync(appJsPath, 'utf8');
    
    assert(content.includes('function displayVersion'), 'app.js should have displayVersion function');
    assert(content.includes('displayVersion()'), 'displayVersion should be called in initApp');
    assert(content.includes('data/version.json'), 'displayVersion should fetch version.json');
});

// Test 7: changelog.js exports showChangelogManual
test('changelog.js exports showChangelogManual function', () => {
    const changelogPath = path.join(__dirname, '..', 'assets', 'js', 'changelog.js');
    const content = fs.readFileSync(changelogPath, 'utf8');
    
    assert(content.includes('export async function showChangelogManual'), 'changelog.js should export showChangelogManual');
    assert(content.includes('showAllVersions'), 'showChangelogManual should accept showAllVersions parameter');
});

// Test 8: index.html imports and exposes showChangelogManual
test('index.html imports and exposes showChangelogManual to window', () => {
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');
    
    assert(content.includes('import { initializeChangelog, showChangelogManual }'), 
           'index.html should import showChangelogManual');
    assert(content.includes('window.showChangelogManual = showChangelogManual'), 
           'index.html should expose showChangelogManual to window');
});

// Test 9: changelog.css has patch badge styling
test('changelog.css has styling for patch version badge', () => {
    const cssPath = path.join(__dirname, '..', 'assets', 'css', 'changelog.css');
    const content = fs.readFileSync(cssPath, 'utf8');
    
    assert(content.includes('.version-badge.patch'), 'CSS should have .version-badge.patch class');
    assert(content.includes('.version-badge.major'), 'CSS should have .version-badge.major class');
    assert(content.includes('.version-badge.minor'), 'CSS should have .version-badge.minor class');
});

// Test 10: Footer styling is responsive
test('Footer has responsive styling', () => {
    const htmlPath = path.join(__dirname, '..', 'index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');
    
    // Find footer element
    const footerMatch = content.match(/<footer[^>]*>/);
    assert(footerMatch, 'Footer element should exist');
    
    const footer = footerMatch[0];
    // Check for basic responsive properties (not enforcing specific values)
    assert(footer.includes('style='), 'Footer should have inline styles');
});

// Test 11: Version display handles errors gracefully
test('displayVersion function has error handling', () => {
    const appJsPath = path.join(__dirname, '..', 'assets', 'js', 'app.js');
    const content = fs.readFileSync(appJsPath, 'utf8');
    
    // Find displayVersion function
    const functionStart = content.indexOf('async function displayVersion');
    const functionEnd = content.indexOf('\n}', functionStart);
    const functionBody = content.substring(functionStart, functionEnd);
    
    assert(functionBody.includes('try'), 'displayVersion should have try-catch block');
    assert(functionBody.includes('catch'), 'displayVersion should handle errors');
    assert(functionBody.includes('console.error'), 'displayVersion should log errors');
});

// Test 12: showChangelogManual has proper error handling
test('showChangelogManual has error handling', () => {
    const changelogPath = path.join(__dirname, '..', 'assets', 'js', 'changelog.js');
    const content = fs.readFileSync(changelogPath, 'utf8');
    
    // Find showChangelogManual function
    const functionStart = content.indexOf('export async function showChangelogManual');
    const functionEnd = content.indexOf('\n}', content.indexOf('\n}', functionStart) + 1);
    const functionBody = content.substring(functionStart, functionEnd);
    
    assert(functionBody.includes('try'), 'showChangelogManual should have try-catch block');
    assert(functionBody.includes('catch'), 'showChangelogManual should handle errors');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('='.repeat(50));

if (failed > 0) {
    console.log('\n❌ FAILURES:\n');
    failures.forEach(f => {
        console.log(`  • ${f.description}`);
        console.log(`    ${f.error}\n`);
    });
    process.exit(1);
} else {
    console.log('\n✅ All tests passed!\n');
    process.exit(0);
}
