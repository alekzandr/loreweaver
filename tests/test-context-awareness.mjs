/**
 * Context-Aware Undo/Redo Tests
 * Tests for window.currentPage detection and context switching
 */

import {
    generateHistory,
    npcHistory,
    searchHistory,
    getActiveHistory,
    executeInContext,
    undoInContext,
    redoInContext,
    canUndoInContext,
    canRedoInContext,
    clearContext
} from '../assets/js/command-history.mjs';

/**
 * Assert helper
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`❌ Assertion failed: ${message}`);
    }
}

/**
 * Run all context awareness tests
 */
export function runContextAwarenessTests() {
    console.log('\n🧪 Testing Context-Aware Undo/Redo\n');
    console.log('='.repeat(60));
    
    const tests = [
        testWindowCurrentPageDetection,
        testGetActiveHistoryWithCurrentPage,
        testContextSwitching,
        testUndoInContextWithPageSwitch,
        testRedoInContextWithPageSwitch,
        testCanUndoRedoInContext,
        testExecuteInContextExplicit,
        testClearContextAcrossPages,
        testHistoryIsolation,
        testMultiplePageSwitches,
        testUndefinedCurrentPage,
        testInvalidCurrentPage
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
    console.log(`✅ Passed: ${passed}/${tests.length}`);
    if (failed > 0) {
        console.log(`❌ Failed: ${failed}/${tests.length}`);
    }
    console.log('='.repeat(60));
    
    return { passed, failed, total: tests.length };
}

/**
 * Test 1: window.currentPage is properly detected
 */
function testWindowCurrentPageDetection() {
    console.log('🧪 Test: window.currentPage Detection');
    
    // Clean slate
    delete window.currentPage;
    clearContext('all');
    
    // Test undefined defaults to 'generate'
    const history1 = getActiveHistory();
    assert(history1 === generateHistory, 'Undefined currentPage should default to generateHistory');
    
    // Test explicit 'generate'
    window.currentPage = 'generate';
    const history2 = getActiveHistory();
    assert(history2 === generateHistory, 'currentPage="generate" should return generateHistory');
    
    // Test 'npc'
    window.currentPage = 'npc';
    const history3 = getActiveHistory();
    assert(history3 === npcHistory, 'currentPage="npc" should return npcHistory');
    
    // Test 'search'
    window.currentPage = 'search';
    const history4 = getActiveHistory();
    assert(history4 === searchHistory, 'currentPage="search" should return searchHistory');
    
    // Clean up
    window.currentPage = 'generate';
    
    console.log('  ✅ PASS: window.currentPage detection works correctly\n');
}

/**
 * Test 2: getActiveHistory returns correct instance based on currentPage
 */
function testGetActiveHistoryWithCurrentPage() {
    console.log('🧪 Test: getActiveHistory with currentPage');
    
    clearContext('all');
    
    // Test all page contexts
    const pages = [
        { page: 'generate', expected: generateHistory, name: 'Generate' },
        { page: 'npc', expected: npcHistory, name: 'NPC' },
        { page: 'search', expected: searchHistory, name: 'Search' }
    ];
    
    for (const { page, expected, name } of pages) {
        window.currentPage = page;
        const active = getActiveHistory();
        assert(active === expected, `${name} page should return ${name.toLowerCase()}History`);
    }
    
    // Reset
    window.currentPage = 'generate';
    
    console.log('  ✅ PASS: getActiveHistory returns correct history for each page\n');
}

/**
 * Test 3: Context switching maintains separate histories
 */
function testContextSwitching() {
    console.log('🧪 Test: Context Switching');
    
    clearContext('all');
    window.currentPage = 'generate';
    
    // Execute commands in generate context
    let generateValue = 0;
    const genCmd = {
        execute: () => { generateValue++; },
        undo: () => { generateValue--; },
        redo: () => { generateValue++; }
    };
    
    executeInContext(genCmd);
    assert(generateValue === 1, 'Generate command should execute');
    assert(canUndoInContext(), 'Should be able to undo in generate context');
    
    // Switch to NPC page
    window.currentPage = 'npc';
    
    // Execute commands in NPC context
    let npcValue = 0;
    const npcCmd = {
        execute: () => { npcValue++; },
        undo: () => { npcValue--; },
        redo: () => { npcValue++; }
    };
    
    executeInContext(npcCmd);
    assert(npcValue === 1, 'NPC command should execute');
    assert(canUndoInContext(), 'Should be able to undo in NPC context');
    
    // Switch back to generate
    window.currentPage = 'generate';
    assert(canUndoInContext(), 'Generate context should still have undo available');
    assert(generateValue === 1, 'Generate value should be unchanged');
    
    // Undo in generate context
    undoInContext();
    assert(generateValue === 0, 'Generate value should be undone');
    assert(npcValue === 1, 'NPC value should be unaffected');
    
    // Switch to NPC and verify
    window.currentPage = 'npc';
    assert(canUndoInContext(), 'NPC context should still have undo available');
    
    // Clean up
    clearContext('all');
    window.currentPage = 'generate';
    
    console.log('  ✅ PASS: Context switching maintains separate histories\n');
}

/**
 * Test 4: undoInContext works with page switching
 */
function testUndoInContextWithPageSwitch() {
    console.log('🧪 Test: undoInContext with Page Switching');
    
    clearContext('all');
    
    // Create test values for each page
    const values = { generate: 0, npc: 0, search: 0 };
    
    // Add commands to each context
    ['generate', 'npc', 'search'].forEach(page => {
        window.currentPage = page;
        const cmd = {
            execute: () => { values[page]++; },
            undo: () => { values[page]--; },
            redo: () => { values[page]++; }
        };
        executeInContext(cmd);
        assert(values[page] === 1, `${page} value should be 1`);
    });
    
    // Undo in each context
    window.currentPage = 'generate';
    undoInContext();
    assert(values.generate === 0, 'Generate value should be 0 after undo');
    assert(values.npc === 1, 'NPC value should be unchanged');
    assert(values.search === 1, 'Search value should be unchanged');
    
    window.currentPage = 'npc';
    undoInContext();
    assert(values.npc === 0, 'NPC value should be 0 after undo');
    assert(values.generate === 0, 'Generate value should remain 0');
    assert(values.search === 1, 'Search value should be unchanged');
    
    window.currentPage = 'search';
    undoInContext();
    assert(values.search === 0, 'Search value should be 0 after undo');
    assert(values.generate === 0, 'Generate value should remain 0');
    assert(values.npc === 0, 'NPC value should remain 0');
    
    // Clean up
    clearContext('all');
    window.currentPage = 'generate';
    
    console.log('  ✅ PASS: undoInContext respects page context\n');
}

/**
 * Test 5: redoInContext works with page switching
 */
function testRedoInContextWithPageSwitch() {
    console.log('🧪 Test: redoInContext with Page Switching');
    
    clearContext('all');
    
    const values = { generate: 0, npc: 0, search: 0 };
    
    // Add and undo commands in each context
    ['generate', 'npc', 'search'].forEach(page => {
        window.currentPage = page;
        const cmd = {
            execute: () => { values[page]++; },
            undo: () => { values[page]--; },
            redo: () => { values[page]++; }
        };
        executeInContext(cmd);
        undoInContext();
        assert(values[page] === 0, `${page} value should be 0 after undo`);
    });
    
    // Redo in each context
    window.currentPage = 'generate';
    redoInContext();
    assert(values.generate === 1, 'Generate value should be 1 after redo');
    assert(values.npc === 0, 'NPC value should be unchanged');
    assert(values.search === 0, 'Search value should be unchanged');
    
    window.currentPage = 'npc';
    redoInContext();
    assert(values.npc === 1, 'NPC value should be 1 after redo');
    assert(values.generate === 1, 'Generate value should remain 1');
    assert(values.search === 0, 'Search value should be unchanged');
    
    window.currentPage = 'search';
    redoInContext();
    assert(values.search === 1, 'Search value should be 1 after redo');
    
    // Clean up
    clearContext('all');
    window.currentPage = 'generate';
    
    console.log('  ✅ PASS: redoInContext respects page context\n');
}

/**
 * Test 6: canUndoInContext and canRedoInContext
 */
function testCanUndoRedoInContext() {
    console.log('🧪 Test: canUndoInContext and canRedoInContext');
    
    clearContext('all');
    
    // Initially nothing to undo/redo
    window.currentPage = 'generate';
    assert(!canUndoInContext(), 'Should not be able to undo initially');
    assert(!canRedoInContext(), 'Should not be able to redo initially');
    
    // Execute a command
    let value = 0;
    const cmd = {
        execute: () => { value++; },
        undo: () => { value--; },
        redo: () => { value++; }
    };
    
    executeInContext(cmd);
    assert(canUndoInContext(), 'Should be able to undo after execute');
    assert(!canRedoInContext(), 'Should not be able to redo after execute');
    
    // Undo
    undoInContext();
    assert(!canUndoInContext(), 'Should not be able to undo after undoing once');
    assert(canRedoInContext(), 'Should be able to redo after undo');
    
    // Switch context
    window.currentPage = 'npc';
    assert(!canUndoInContext(), 'NPC context should have no undo');
    assert(!canRedoInContext(), 'NPC context should have no redo');
    
    // Switch back
    window.currentPage = 'generate';
    assert(!canUndoInContext(), 'Generate context should still have no undo');
    assert(canRedoInContext(), 'Generate context should still have redo');
    
    // Clean up
    clearContext('all');
    
    console.log('  ✅ PASS: canUndoInContext and canRedoInContext work correctly\n');
}

/**
 * Test 7: executeInContext with explicit context parameter
 */
function testExecuteInContextExplicit() {
    console.log('🧪 Test: executeInContext with Explicit Context');
    
    clearContext('all');
    window.currentPage = 'generate';
    
    let value = 0;
    const cmd = {
        execute: () => { value++; },
        undo: () => { value--; },
        redo: () => { value++; }
    };
    
    // Execute in NPC context explicitly, even though currentPage is 'generate'
    executeInContext(cmd, 'npc');
    assert(value === 1, 'Command should execute');
    assert(!canUndoInContext(), 'Generate context should not have undo');
    
    // Switch to NPC and verify it has the command
    window.currentPage = 'npc';
    assert(canUndoInContext(), 'NPC context should have undo');
    
    undoInContext();
    assert(value === 0, 'Value should be undone');
    
    // Clean up
    clearContext('all');
    window.currentPage = 'generate';
    
    console.log('  ✅ PASS: executeInContext with explicit context parameter works\n');
}

/**
 * Test 8: clearContext across pages
 */
function testClearContextAcrossPages() {
    console.log('🧪 Test: clearContext Across Pages');
    
    clearContext('all');
    
    // Add commands to all contexts
    let value = 0;
    ['generate', 'npc', 'search'].forEach(page => {
        window.currentPage = page;
        executeInContext({
            execute: () => { value++; },
            undo: () => { value--; },
            redo: () => { value++; }
        });
    });
    
    assert(value === 3, 'All commands should have executed');
    
    // Clear only NPC context
    clearContext('npc');
    
    window.currentPage = 'npc';
    assert(!canUndoInContext(), 'NPC context should be cleared');
    
    window.currentPage = 'generate';
    assert(canUndoInContext(), 'Generate context should not be cleared');
    
    window.currentPage = 'search';
    assert(canUndoInContext(), 'Search context should not be cleared');
    
    // Clear all
    clearContext('all');
    
    window.currentPage = 'generate';
    assert(!canUndoInContext(), 'Generate context should be cleared');
    
    window.currentPage = 'npc';
    assert(!canUndoInContext(), 'NPC context should be cleared');
    
    window.currentPage = 'search';
    assert(!canUndoInContext(), 'Search context should be cleared');
    
    window.currentPage = 'generate';
    
    console.log('  ✅ PASS: clearContext works across pages\n');
}

/**
 * Test 9: History isolation between pages
 */
function testHistoryIsolation() {
    console.log('🧪 Test: History Isolation Between Pages');
    
    clearContext('all');
    
    const values = { a: 0, b: 0, c: 0 };
    
    // Add 3 commands to generate page
    window.currentPage = 'generate';
    for (let i = 0; i < 3; i++) {
        executeInContext({
            execute: () => { values.a++; },
            undo: () => { values.a--; },
            redo: () => { values.a++; }
        });
    }
    
    // Add 2 commands to NPC page
    window.currentPage = 'npc';
    for (let i = 0; i < 2; i++) {
        executeInContext({
            execute: () => { values.b++; },
            undo: () => { values.b--; },
            redo: () => { values.b++; }
        });
    }
    
    // Add 1 command to search page
    window.currentPage = 'search';
    executeInContext({
        execute: () => { values.c++; },
        undo: () => { values.c--; },
        redo: () => { values.c++; }
    });
    
    assert(values.a === 3, 'Generate should have 3 commands');
    assert(values.b === 2, 'NPC should have 2 commands');
    assert(values.c === 1, 'Search should have 1 command');
    
    // Undo all in each context
    window.currentPage = 'generate';
    while (canUndoInContext()) {
        undoInContext();
    }
    assert(values.a === 0, 'Generate should be fully undone');
    assert(values.b === 2, 'NPC should be unaffected');
    assert(values.c === 1, 'Search should be unaffected');
    
    window.currentPage = 'npc';
    while (canUndoInContext()) {
        undoInContext();
    }
    assert(values.b === 0, 'NPC should be fully undone');
    assert(values.a === 0, 'Generate should remain undone');
    assert(values.c === 1, 'Search should be unaffected');
    
    window.currentPage = 'search';
    undoInContext();
    assert(values.c === 0, 'Search should be undone');
    
    // Clean up
    clearContext('all');
    window.currentPage = 'generate';
    
    console.log('  ✅ PASS: Histories are properly isolated between pages\n');
}

/**
 * Test 10: Multiple page switches
 */
function testMultiplePageSwitches() {
    console.log('🧪 Test: Multiple Page Switches');
    
    clearContext('all');
    
    let value = 0;
    const cmd = {
        execute: () => { value++; },
        undo: () => { value--; },
        redo: () => { value++; }
    };
    
    // Rapidly switch pages and execute commands
    const sequence = ['generate', 'npc', 'search', 'generate', 'npc', 'search'];
    
    sequence.forEach(page => {
        window.currentPage = page;
        executeInContext(cmd);
    });
    
    assert(value === 6, 'All commands should have executed');
    
    // Verify each context has the right number of commands
    window.currentPage = 'generate';
    let genCount = 0;
    while (canUndoInContext()) {
        undoInContext();
        genCount++;
    }
    assert(genCount === 2, 'Generate should have 2 commands');
    
    window.currentPage = 'npc';
    let npcCount = 0;
    while (canUndoInContext()) {
        undoInContext();
        npcCount++;
    }
    assert(npcCount === 2, 'NPC should have 2 commands');
    
    window.currentPage = 'search';
    let searchCount = 0;
    while (canUndoInContext()) {
        undoInContext();
        searchCount++;
    }
    assert(searchCount === 2, 'Search should have 2 commands');
    
    assert(value === 0, 'All commands should be undone');
    
    // Clean up
    clearContext('all');
    window.currentPage = 'generate';
    
    console.log('  ✅ PASS: Multiple page switches work correctly\n');
}

/**
 * Test 11: Undefined currentPage defaults to generate
 */
function testUndefinedCurrentPage() {
    console.log('🧪 Test: Undefined currentPage Defaults to Generate');
    
    clearContext('all');
    delete window.currentPage;
    
    let value = 0;
    const cmd = {
        execute: () => { value++; },
        undo: () => { value--; },
        redo: () => { value++; }
    };
    
    executeInContext(cmd);
    assert(value === 1, 'Command should execute');
    assert(canUndoInContext(), 'Should be able to undo');
    
    // Verify it went to generate history
    window.currentPage = 'generate';
    assert(canUndoInContext(), 'Generate context should have the command');
    
    window.currentPage = 'npc';
    assert(!canUndoInContext(), 'NPC context should not have the command');
    
    // Clean up
    clearContext('all');
    window.currentPage = 'generate';
    
    console.log('  ✅ PASS: Undefined currentPage defaults to generate\n');
}

/**
 * Test 12: Invalid currentPage defaults to generate
 */
function testInvalidCurrentPage() {
    console.log('🧪 Test: Invalid currentPage Defaults to Generate');
    
    clearContext('all');
    window.currentPage = 'invalid-page';
    
    let value = 0;
    const cmd = {
        execute: () => { value++; },
        undo: () => { value--; },
        redo: () => { value++; }
    };
    
    executeInContext(cmd);
    assert(value === 1, 'Command should execute');
    
    // Verify it went to generate history (default)
    window.currentPage = 'generate';
    assert(canUndoInContext(), 'Generate context should have the command');
    
    // Clean up
    clearContext('all');
    window.currentPage = 'generate';
    
    console.log('  ✅ PASS: Invalid currentPage defaults to generate\n');
}
