/**
 * Export Strategies Test Suite
 * Comprehensive tests for Strategy Pattern implementation
 * 
 * @module test-export-strategies
 * @version 1.5.0
 */

import {
    ExportStrategy,
    MarkdownExportStrategy,
    TextExportStrategy,
    HTMLExportStrategy,
    JSONExportStrategy,
    ExportManager,
    exportManager
} from '../assets/js/export-strategies.mjs';

/**
 * Assert helper
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`❌ Assertion failed: ${message}`);
    }
}

/**
 * Run all export strategy tests
 */
export function runExportStrategyTests() {
    console.log('\n🧪 Testing Export Strategies\n');
    console.log('='.repeat(60));

    const tests = [
        testExportStrategyAbstract,
        testMarkdownExportStrategy,
        testTextExportStrategy,
        testHTMLExportStrategy,
        testJSONExportStrategy,
        testExportManagerRegistration,
        testExportManagerExecution,
        testStrategyOptions,
        testFilenameGeneration,
        testDataValidation,
        testErrorHandling,
        testSecuritySanitization,
        testStrategySwapping,
        testFormatConsistency
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            test();
            passed++;
        } catch (error) {
            console.error(`❌ FAIL: ${error.message}\n`);
            failed++;
        }
    }

    console.log('='.repeat(60));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60));

    if (failed > 0) {
        throw new Error(`${failed} test(s) failed`);
    }

    return { passed, failed, total: tests.length };
}

/**
 * Test 1: ExportStrategy abstract class
 */
function testExportStrategyAbstract() {
    console.log('🧪 Test: ExportStrategy Abstract Class');

    // Should not be able to instantiate abstract class
    let threw = false;
    try {
        new ExportStrategy('test', 'txt', 'text/plain');
    } catch (error) {
        threw = true;
        assert(error.message.includes('abstract class'), 'Should throw abstract class error');
    }
    assert(threw, 'Should throw error when instantiating abstract class');

    console.log('  ✅ PASS: ExportStrategy is properly abstract\n');
}

/**
 * Test 2: MarkdownExportStrategy
 */
function testMarkdownExportStrategy() {
    console.log('🧪 Test: MarkdownExportStrategy');

    const strategy = new MarkdownExportStrategy();

    assert(strategy.name === 'Markdown', 'Name should be Markdown');
    assert(strategy.fileExtension === 'md', 'File extension should be md');
    assert(strategy.mimeType === 'text/markdown', 'MIME type should be text/markdown');

    // Test export
    const testData = {
        encounterTemplate: { title: 'Test Encounter' },
        selectedEnvironment: 'Forest',
        partyLevel: '5',
        currentAdventureFlow: [],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    const output = strategy.export(testData);
    assert(typeof output === 'string', 'Output should be string');
    assert(output.includes('# Test Encounter'), 'Should include title');
    assert(output.includes('Forest'), 'Should include environment');
    assert(output.includes('Party Level'), 'Should include party level');

    console.log('  ✅ PASS: MarkdownExportStrategy works correctly\n');
}

/**
 * Test 3: TextExportStrategy
 */
function testTextExportStrategy() {
    console.log('🧪 Test: TextExportStrategy');

    const strategy = new TextExportStrategy();

    assert(strategy.name === 'Plain Text', 'Name should be Plain Text');
    assert(strategy.fileExtension === 'txt', 'File extension should be txt');
    assert(strategy.mimeType === 'text/plain', 'MIME type should be text/plain');

    // Test export
    const testData = {
        encounterTemplate: { title: 'Test Encounter' },
        selectedEnvironment: 'Mountain',
        partyLevel: '10',
        currentAdventureFlow: [],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    const output = strategy.export(testData);
    assert(typeof output === 'string', 'Output should be string');
    assert(output.includes('Test Encounter'), 'Should include title');
    assert(output.includes('Mountain'), 'Should include environment');
    assert(output.includes('='), 'Should include dividers');

    // Test text wrapping
    const longText = 'This is a very long line that should be wrapped when exported because it exceeds the specified line length limit for the plain text export format.';
    const wrapped = strategy.wrapText(longText);
    const lines = wrapped.split('\n');
    assert(lines.length > 1, 'Long text should be wrapped into multiple lines');
    assert(lines.every(line => line.length <= strategy.options.lineLength), 'All lines should respect line length');

    console.log('  ✅ PASS: TextExportStrategy works correctly\n');
}

/**
 * Test 4: HTMLExportStrategy
 */
function testHTMLExportStrategy() {
    console.log('🧪 Test: HTMLExportStrategy');

    const strategy = new HTMLExportStrategy();

    assert(strategy.name === 'HTML', 'Name should be HTML');
    assert(strategy.fileExtension === 'html', 'File extension should be html');
    assert(strategy.mimeType === 'text/html', 'MIME type should be text/html');

    // Test export
    const testData = {
        encounterTemplate: { title: 'Test Encounter' },
        selectedEnvironment: 'Desert',
        partyLevel: '8',
        currentAdventureFlow: [],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    const output = strategy.export(testData);
    assert(typeof output === 'string', 'Output should be string');
    assert(output.includes('<h1>'), 'Should include HTML heading');
    assert(output.includes('Test Encounter'), 'Should include title');
    assert(output.includes('Desert'), 'Should include environment');
    assert(output.includes('<style>') || !strategy.options.includeStyles, 'Should include styles if enabled');

    console.log('  ✅ PASS: HTMLExportStrategy works correctly\n');
}

/**
 * Test 5: JSONExportStrategy
 */
function testJSONExportStrategy() {
    console.log('🧪 Test: JSONExportStrategy');

    const strategy = new JSONExportStrategy();

    assert(strategy.name === 'JSON', 'Name should be JSON');
    assert(strategy.fileExtension === 'json', 'File extension should be json');
    assert(strategy.mimeType === 'application/json', 'MIME type should be application/json');

    // Test export
    const testData = {
        encounterTemplate: { title: 'Test Encounter', description: 'A test' },
        selectedEnvironment: 'Swamp',
        partyLevel: '6',
        currentAdventureFlow: [{ step: 1, title: 'Start' }],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    const output = strategy.export(testData);
    assert(typeof output === 'string', 'Output should be string');

    // Should be valid JSON
    const parsed = JSON.parse(output);
    assert(parsed.adventure.title === 'Test Encounter', 'Should include title in JSON');
    assert(parsed.adventure.environment === 'Swamp', 'Should include environment in JSON');
    assert(parsed.flow.length === 1, 'Should include flow in JSON');

    // Test pretty vs compact
    strategy.setOptions({ pretty: true });
    const prettyOutput = strategy.export(testData);
    assert(prettyOutput.includes('\n'), 'Pretty format should include newlines');

    strategy.setOptions({ pretty: false });
    const compactOutput = strategy.export(testData);
    assert(!compactOutput.includes('\n  '), 'Compact format should not include indentation');

    console.log('  ✅ PASS: JSONExportStrategy works correctly\n');
}

/**
 * Test 6: ExportManager strategy registration
 */
function testExportManagerRegistration() {
    console.log('🧪 Test: ExportManager Strategy Registration');

    const manager = new ExportManager();

    // Should have default strategies registered
    assert(manager.getStrategy('markdown') !== null, 'Should have markdown strategy');
    assert(manager.getStrategy('text') !== null, 'Should have text strategy');
    assert(manager.getStrategy('html') !== null, 'Should have html strategy');
    assert(manager.getStrategy('json') !== null, 'Should have json strategy');

    // Test registering custom strategy
    const customStrategy = new MarkdownExportStrategy();
    manager.registerStrategy('custom', customStrategy);
    assert(manager.getStrategy('custom') === customStrategy, 'Should be able to register custom strategy');

    // Test invalid strategy registration
    let threw = false;
    try {
        manager.registerStrategy('invalid', {});
    } catch (error) {
        threw = true;
        assert(error.message.includes('ExportStrategy'), 'Should validate strategy type');
    }
    assert(threw, 'Should throw error for invalid strategy');

    // Test getAllStrategies
    const strategies = manager.getAllStrategies();
    assert(Array.isArray(strategies), 'getAllStrategies should return array');
    assert(strategies.length >= 4, 'Should have at least 4 strategies');
    assert(strategies.every(s => s.key && s.name && s.fileExtension), 'Each strategy should have key, name, and fileExtension');

    console.log('  ✅ PASS: ExportManager registration works correctly\n');
}

/**
 * Test 7: ExportManager execution
 */
function testExportManagerExecution() {
    console.log('🧪 Test: ExportManager Execution');

    const manager = new ExportManager();

    const testData = {
        encounterTemplate: { title: 'Test Encounter' },
        selectedEnvironment: 'Cave',
        partyLevel: '7',
        currentAdventureFlow: [],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    // Test markdown export
    const mdResult = manager.export(testData, 'markdown');
    assert(mdResult.success === true, 'Export should succeed');
    assert(typeof mdResult.content === 'string', 'Should return content');
    assert(typeof mdResult.filename === 'string', 'Should return filename');
    assert(mdResult.filename.endsWith('.md'), 'Filename should have correct extension');
    assert(mdResult.mimeType === 'text/markdown', 'Should return correct MIME type');
    assert(mdResult.strategy === 'Markdown', 'Should return strategy name');

    // Test JSON export
    const jsonResult = manager.export(testData, 'json');
    assert(jsonResult.success === true, 'JSON export should succeed');
    assert(jsonResult.filename.endsWith('.json'), 'JSON filename should have correct extension');

    // Test default strategy
    manager.setDefaultStrategy('text');
    const defaultResult = manager.export(testData);
    assert(defaultResult.filename.endsWith('.txt'), 'Should use default strategy');

    // Test export with options
    const optionsResult = manager.export(testData, 'markdown', { includeIcons: false });
    assert(optionsResult.success === true, 'Export with options should succeed');

    console.log('  ✅ PASS: ExportManager execution works correctly\n');
}

/**
 * Test 8: Strategy options
 */
function testStrategyOptions() {
    console.log('🧪 Test: Strategy Options');

    const strategy = new MarkdownExportStrategy();

    // Test default options
    const defaultOptions = strategy.getOptions();
    assert(typeof defaultOptions === 'object', 'Should return options object');
    assert(defaultOptions.includeMetadata === true, 'Should have default options');

    // Test setting options
    strategy.setOptions({ includeIcons: false });
    const newOptions = strategy.getOptions();
    assert(newOptions.includeIcons === false, 'Should update option');
    assert(newOptions.includeMetadata === true, 'Should preserve other options');

    // Test export respects options
    const testData = {
        encounterTemplate: { title: 'Test' },
        selectedEnvironment: 'Test',
        partyLevel: '1',
        currentAdventureFlow: [],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    strategy.setOptions({ includeMetadata: false });
    const output = strategy.export(testData);
    assert(!output.includes('Environment:'), 'Should respect includeMetadata option');

    console.log('  ✅ PASS: Strategy options work correctly\n');
}

/**
 * Test 9: Filename generation
 */
function testFilenameGeneration() {
    console.log('🧪 Test: Filename Generation');

    const strategy = new MarkdownExportStrategy();

    // Test normal title
    const testData1 = {
        encounterTemplate: { title: 'Ancient Temple' },
        selectedEnvironment: 'Test',
        partyLevel: '1',
        currentAdventureFlow: [],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    const filename1 = strategy.generateFilename(testData1);
    assert(filename1.includes('ancient-temple'), 'Should generate safe filename');
    assert(filename1.endsWith('.md'), 'Should have correct extension');
    assert(/\d+/.test(filename1), 'Should include timestamp');

    // Test special characters
    const testData2 = {
        encounterTemplate: { title: 'The Dragon\'s Lair! (Part 2)' },
        selectedEnvironment: 'Test',
        partyLevel: '1',
        currentAdventureFlow: [],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    const filename2 = strategy.generateFilename(testData2);
    assert(!/[^a-z0-9\-.]/.test(filename2), 'Should sanitize special characters');
    assert(filename2.includes('the-dragon-s-lair'), 'Should handle special characters');

    // Test missing title
    const testData3 = {
        encounterTemplate: {},
        selectedEnvironment: 'Test',
        partyLevel: '1',
        currentAdventureFlow: [],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    const filename3 = strategy.generateFilename(testData3);
    assert(filename3.includes('adventure'), 'Should use default title');

    console.log('  ✅ PASS: Filename generation works correctly\n');
}

/**
 * Test 10: Data validation
 */
function testDataValidation() {
    console.log('🧪 Test: Data Validation');

    const strategy = new MarkdownExportStrategy();

    // Test null data
    let threw = false;
    try {
        strategy.export(null);
    } catch (error) {
        threw = true;
        assert(error.message.includes('required'), 'Should throw validation error');
    }
    assert(threw, 'Should throw error for null data');

    // Test undefined data
    threw = false;
    try {
        strategy.export(undefined);
    } catch (error) {
        threw = true;
    }
    assert(threw, 'Should throw error for undefined data');

    // Test empty object (should work)
    const emptyData = {
        encounterTemplate: {},
        currentAdventureFlow: [],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };
    const output = strategy.export(emptyData);
    assert(typeof output === 'string', 'Should handle empty data gracefully');

    console.log('  ✅ PASS: Data validation works correctly\n');
}

/**
 * Test 11: Error handling
 */
function testErrorHandling() {
    console.log('🧪 Test: Error Handling');

    const manager = new ExportManager();

    // Test invalid strategy
    let threw = false;
    try {
        manager.export({}, 'nonexistent');
    } catch (error) {
        threw = true;
        assert(error.message.includes('not found'), 'Should throw error for invalid strategy');
    }
    assert(threw, 'Should throw error for invalid strategy');

    // Test invalid data
    threw = false;
    try {
        manager.export(null, 'markdown');
    } catch (error) {
        threw = true;
        assert(error.message.includes('failed'), 'Should throw error for invalid data');
    }
    assert(threw, 'Should throw error for invalid data');

    // Test setting invalid default strategy
    threw = false;
    try {
        manager.setDefaultStrategy('nonexistent');
    } catch (error) {
        threw = true;
        assert(error.message.includes('not found'), 'Should validate default strategy');
    }
    assert(threw, 'Should throw error for invalid default strategy');

    console.log('  ✅ PASS: Error handling works correctly\n');
}

/**
 * Test 12: Security sanitization
 */
function testSecuritySanitization() {
    console.log('🧪 Test: Security Sanitization');

    const strategy = new HTMLExportStrategy();

    // Test XSS prevention
    const malicious = '<script>alert("XSS")</script>';
    const sanitized = strategy.sanitize(malicious);
    assert(!sanitized.includes('<script>'), 'Should escape script tags');
    assert(sanitized.includes('&lt;script&gt;'), 'Should convert to HTML entities');

    // Test various XSS vectors
    const vectors = [
        '<img src=x onerror=alert(1)>',
        '<a href="javascript:alert(1)">',
        '"><script>alert(1)</script>',
        '<iframe src="javascript:alert(1)">',
        '<div onclick="alert(1)">'
    ];

    vectors.forEach(vector => {
        const clean = strategy.sanitize(vector);
        assert(!clean.includes('<'), 'Should escape all HTML tags');
        assert(!clean.includes('>'), 'Should escape all HTML tags');
    });

    // Test HTML export sanitization
    const testData = {
        encounterTemplate: { title: '<script>alert("XSS")</script>' },
        selectedEnvironment: '<img src=x onerror=alert(1)>',
        partyLevel: '5',
        currentAdventureFlow: [],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    const output = strategy.export(testData);
    assert(!output.includes('<script>alert'), 'Export should sanitize malicious content');
    assert(output.includes('&lt;script&gt;'), 'Export should use HTML entities');

    console.log('  ✅ PASS: Security sanitization works correctly\n');
}

/**
 * Test 13: Strategy swapping
 */
function testStrategySwapping() {
    console.log('🧪 Test: Strategy Swapping');

    const manager = new ExportManager();

    const testData = {
        encounterTemplate: { title: 'Test Encounter' },
        selectedEnvironment: 'Forest',
        partyLevel: '5',
        currentAdventureFlow: [],
        currentAdventureLocations: [],
        currentAdventureNPCs: [],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    // Export with different strategies
    const mdResult = manager.export(testData, 'markdown');
    const txtResult = manager.export(testData, 'text');
    const htmlResult = manager.export(testData, 'html');
    const jsonResult = manager.export(testData, 'json');

    // Should produce different outputs
    assert(mdResult.content !== txtResult.content, 'Different strategies should produce different content');
    assert(mdResult.content !== htmlResult.content, 'Markdown and HTML should differ');
    assert(mdResult.mimeType !== jsonResult.mimeType, 'Should have different MIME types');

    // Should have different file extensions
    assert(mdResult.filename.endsWith('.md'), 'Markdown should have .md extension');
    assert(txtResult.filename.endsWith('.txt'), 'Text should have .txt extension');
    assert(htmlResult.filename.endsWith('.html'), 'HTML should have .html extension');
    assert(jsonResult.filename.endsWith('.json'), 'JSON should have .json extension');

    console.log('  ✅ PASS: Strategy swapping works correctly\n');
}

/**
 * Test 14: Format consistency
 */
function testFormatConsistency() {
    console.log('🧪 Test: Format Consistency');

    const testData = {
        encounterTemplate: {
            title: 'Complex Encounter',
            description: 'A complex test encounter'
        },
        selectedEnvironment: 'Dungeon',
        partyLevel: '10',
        currentAdventureFlow: [
            { step: 1, title: 'Entrance', description: 'The entrance hall' },
            { step: 2, title: 'Main Room', description: 'The main chamber' }
        ],
        currentAdventureLocations: [
            { name: 'Test Location', data: { description: 'A test location' } }
        ],
        currentAdventureNPCs: [
            { name: 'Test NPC', data: { species: 'human', class: 'Fighter' } }
        ],
        currentAdventureSkillChecks: [],
        currentAdventureDangers: []
    };

    // All strategies should handle the same data structure
    const strategies = ['markdown', 'text', 'html', 'json'];
    const manager = new ExportManager();

    strategies.forEach(strategy => {
        const result = manager.export(testData, strategy);
        assert(result.success === true, `${strategy} export should succeed`);
        assert(result.content.length > 0, `${strategy} should produce content`);
        assert(result.content.includes('Complex Encounter'), `${strategy} should include title`);
        assert(result.content.includes('Dungeon'), `${strategy} should include environment`);

        // Check that encounter flow is included (except JSON which has different structure)
        if (strategy !== 'json') {
            assert(result.content.includes('Entrance') || result.content.includes('ADVENTURE FLOW') || result.content.includes('Adventure Flow'),
                `${strategy} should include adventure flow`);
        }
    });

    console.log('  ✅ PASS: Format consistency verified\n');
}
