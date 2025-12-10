const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets', 'js');
const HTML_FILE = path.join(ROOT_DIR, 'index.html');

const IGNORED_FILES = [
    'changelog.js', // Historical data
    'test-terminology.js', // This file
    'README.md',
    'USAGE.md', // Has "Encounter" in historical context or not updated yet? Wait, I should update USAGE.md too.
    'TODO.md',
    'task.md',
    'implementation_plan.md'
];

const ALLOWED_CONTEXTS = [
    'Encounter Flow', // Might appear in comments or logs if not fully stripped, but we prefer Adventure Flow
    'encounter-section', // CSS class? Check if I renamed CSS classes. I didn't rename CSS classes in the plan.
    'encounter-card',
    'encounter-result',
    'encounter-template',
    'encounter-controls',
    'class="encounter-', // CSS classes are often hyphenated
    'id="encounter-',
    'encounters.json', // Old file reference in comments?
    'Encounter(s)', // Grammar
    'Combat Encounter', // Valid RPG term?
    'Random Encounter', // Valid RPG term?
    'savedEncounters', // Legacy local storage key
];

function checkFileForTerminology(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let errors = [];

    lines.forEach((line, index) => {
        // Simple check for "Encounter" (case insensitive? No, let's look for "Encounter" and "encounter")
        // We want to move to "Adventure", so "encounter" should be rare or non-existent in UI/logic variables.

        // Skip comments if possible? Hard with regex.
        // Let's just flag all occurrences and whitelist.

        const regex = /Encounter/ig;
        let match;
        while ((match = regex.exec(line)) !== null) {
            // Check context
            const snippet = line.substring(Math.max(0, match.index - 20), Math.min(line.length, match.index + 30));
            const isAllowed = ALLOWED_CONTEXTS.some(ctx => line.includes(ctx));

            // Also allow CSS selectors
            if (line.includes('.encounter-') || line.includes('#encounter-')) {
                continue;
            }

            if (!isAllowed) {
                // Heuristic: If it looks like a variable name `currentEncounter`
                if (/currentEncounter/i.test(line)) {
                    errors.push(`Line ${index + 1}: Found '${match[0]}' in variable? '${snippet.trim()}'`);
                }
                // Heuristic: User facing text
                else if (/>.*Encounter.*</.test(line) || /'[^']*Encounter[^']*'/.test(line) || /"[^"]*Encounter[^"]*"/.test(line)) {
                    errors.push(`Line ${index + 1}: Found '${match[0]}' in text/string? '${snippet.trim()}'`);
                }
                // Function name
                else if (/function\s+.*Encounter/.test(line)) {
                    errors.push(`Line ${index + 1}: Found '${match[0]}' in function name? '${snippet.trim()}'`);
                }
            }
        }
    });

    return errors;
}

function runTest() {
    console.log('🔍 Starting Terminology Scan...');
    let totalErrors = 0;

    // Check index.html
    console.log(`Checking ${HTML_FILE}...`);
    const htmlErrors = checkFileForTerminology(HTML_FILE);
    if (htmlErrors.length > 0) {
        console.error(`❌ Found ${htmlErrors.length} issues in index.html:`);
        htmlErrors.forEach(e => console.error(`  ${e}`));
        totalErrors += htmlErrors.length;
    } else {
        console.log('✅ index.html clean');
    }

    // Check JS files
    const jsFiles = fs.readdirSync(ASSETS_DIR).filter(f => f.endsWith('.js') || f.endsWith('.mjs'));
    for (const file of jsFiles) {
        if (IGNORED_FILES.includes(file)) continue;

        const filePath = path.join(ASSETS_DIR, file);
        console.log(`Checking ${file}...`);
        const errors = checkFileForTerminology(filePath);

        if (errors.length > 0) {
            console.error(`❌ Found ${errors.length} issues in ${file}:`);
            errors.forEach(e => console.error(`  ${e}`));
            totalErrors += errors.length;
        } else {
            console.log(`✅ ${file} clean`);
        }
    }

    if (totalErrors > 0) {
        console.error(`\n❌ Terminology Check FAILED with ${totalErrors} potential issues.`);
        process.exit(1);
    } else {
        console.log('\n✅ Terminology Check PASSED!');
    }
}

runTest();
