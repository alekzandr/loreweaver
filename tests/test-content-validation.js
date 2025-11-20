/**
 * Test Suite: Content Validation System
 * Tests schemas, validation script, and content submission workflow
 */

const fs = require('fs');
const path = require('path');

// Test results
let passed = 0;
let failed = 0;
const failures = [];

/**
 * Test helper
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

console.log('\\n🧪 Running Content Validation Tests...\\n');

// Test 1: Required directories exist
test('content-submissions directories exist', () => {
    const dirs = [
        'content-submissions/encounters',
        'content-submissions/locations',
        'content-submissions/npcs',
        'content-submissions/skillchecks',
        'content-submissions/dangers'
    ];
    
    dirs.forEach(dir => {
        const fullPath = path.join(__dirname, '..', dir);
        assert(fs.existsSync(fullPath), `Directory should exist: ${dir}`);
    });
});

// Test 2: Schema files exist
test('all schema files exist', () => {
    const schemas = [
        'schemas/encounter-schema.json',
        'schemas/location-schema.json',
        'schemas/npc-schema.json',
        'schemas/skillcheck-schema.json',
        'schemas/danger-schema.json'
    ];
    
    schemas.forEach(schema => {
        const fullPath = path.join(__dirname, '..', schema);
        assert(fs.existsSync(fullPath), `Schema should exist: ${schema}`);
    });
});

// Test 3: Schemas are valid JSON
test('all schemas are valid JSON', () => {
    const schemaDir = path.join(__dirname, '..', 'schemas');
    const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.json'));
    
    files.forEach(file => {
        const content = fs.readFileSync(path.join(schemaDir, file), 'utf8');
        JSON.parse(content); // Will throw if invalid
    });
});

// Test 4: Schemas have required properties
test('schemas have required JSON Schema properties', () => {
    const schemaDir = path.join(__dirname, '..', 'schemas');
    const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.json'));
    
    files.forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(schemaDir, file), 'utf8'));
        assert(content.$schema, `${file} should have $schema property`);
        assert(content.$id, `${file} should have $id property`);
        assert(content.title, `${file} should have title property`);
        assert(content.description, `${file} should have description property`);
    });
});

// Test 5: Example templates exist
test('example templates exist for all content types', () => {
    const examples = [
        'examples/encounter-template.json',
        'examples/location-template.json',
        'examples/npc-species-template.json',
        'examples/npc-profession-template.json',
        'examples/skillcheck-template.json',
        'examples/danger-trap-template.json',
        'examples/danger-hazard-template.json'
    ];
    
    examples.forEach(example => {
        const fullPath = path.join(__dirname, '..', example);
        assert(fs.existsSync(fullPath), `Example should exist: ${example}`);
    });
});

// Test 6: Example templates are valid JSON
test('all example templates are valid JSON', () => {
    const examplesDir = path.join(__dirname, '..', 'examples');
    const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.json'));
    
    files.forEach(file => {
        const content = fs.readFileSync(path.join(examplesDir, file), 'utf8');
        JSON.parse(content); // Will throw if invalid
    });
});

// Test 7: Validation script exists
test('validation script exists and is executable', () => {
    const scriptPath = path.join(__dirname, '..', 'scripts', 'validate-content.js');
    assert(fs.existsSync(scriptPath), 'validate-content.js should exist');
    
    const content = fs.readFileSync(scriptPath, 'utf8');
    assert(content.includes('Ajv'), 'Script should import Ajv');
    assert(content.includes('validateFile'), 'Script should have validateFile function');
    assert(content.includes('checkForDuplicates'), 'Script should have checkForDuplicates function');
});

// Test 8: package.json has validation script
test('package.json includes validate:content script', () => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    assert(pkg.scripts['validate:content'], 'Should have validate:content script');
    assert(pkg.scripts['validate:content'].includes('validate-content.js'), 
           'Script should reference validate-content.js');
});

// Test 9: package.json has required dependencies
test('package.json includes Ajv dependencies', () => {
    const packagePath = path.join(__dirname, '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const hasDep = pkg.dependencies?.ajv || pkg.devDependencies?.ajv;
    const hasFormats = pkg.dependencies?.['ajv-formats'] || pkg.devDependencies?.['ajv-formats'];
    
    assert(hasDep, 'Should have ajv as dependency');
    assert(hasFormats, 'Should have ajv-formats as dependency');
});

// Test 10: Contributing guide exists
test('CONTRIBUTING_CONTENT.md exists and has required sections', () => {
    const guidePath = path.join(__dirname, '..', 'CONTRIBUTING_CONTENT.md');
    assert(fs.existsSync(guidePath), 'Contributing guide should exist');
    
    const content = fs.readFileSync(guidePath, 'utf8');
    assert(content.includes('Quick Start'), 'Should have Quick Start section');
    assert(content.includes('Content Types'), 'Should have Content Types section');
    assert(content.includes('Validation'), 'Should have Validation section');
    assert(content.includes('Best Practices'), 'Should have Best Practices section');
    assert(content.includes('npm run validate:content'), 'Should reference validation command');
});

// Test 11: Schemas directory structure
test('schemas directory has proper structure', () => {
    const schemaDir = path.join(__dirname, '..', 'schemas');
    const files = fs.readdirSync(schemaDir);
    
    // Should only contain schema files
    files.forEach(file => {
        assert(file.endsWith('-schema.json'), `Schema files should end with -schema.json: ${file}`);
    });
    
    // Minimum expected schemas
    assert(files.length >= 5, 'Should have at least 5 schema files');
});

// Test 12: Example templates match schema requirements (basic check)
test('example encounter template has required fields', () => {
    const templatePath = path.join(__dirname, '..', 'examples', 'encounter-template.json');
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    
    assert(template.title, 'Template should have title');
    assert(template.tags && Array.isArray(template.tags), 'Template should have tags array');
    assert(template.descriptions && Array.isArray(template.descriptions), 'Template should have descriptions array');
    assert(typeof template.weight === 'number', 'Template should have weight number');
    assert(template.resolutions && Array.isArray(template.resolutions), 'Template should have resolutions array');
});

// Summary
console.log('\\n' + '='.repeat(50));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('='.repeat(50));

if (failed > 0) {
    console.log('\\n❌ FAILURES:\\n');
    failures.forEach(f => {
        console.log(`  • ${f.description}`);
        console.log(`    ${f.error}\\n`);
    });
    process.exit(1);
} else {
    console.log('\\n✅ All content validation tests passed!\\n');
    process.exit(0);
}
