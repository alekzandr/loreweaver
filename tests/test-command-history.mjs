/**
 * Command Pattern History Tests
 * Comprehensive test suite for the Command Pattern implementation
 */

import {
    CommandHistory,
    Command,
    GenerateAdventureCommand,
    GenerateNPCCommand,
    FilterChangeCommand,
    SearchCommand,
    BatchCommand,
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
 * Run all command history tests
 */
export function runCommandHistoryTests() {
    console.log('\n🧪 Testing Command Pattern History\n');
    console.log('='.repeat(60));

    const tests = [
        testCommandHistoryConstruction,
        testCommandExecution,
        testUndoFunctionality,
        testRedoFunctionality,
        testCanUndoCanRedo,
        testHistoryLimit,
        testHistoryClear,
        testCommandChaining,
        testGenerateAdventureCommand,
        testGenerateNPCCommand,
        testFilterChangeCommand,
        testSearchCommand,
        testBatchCommand,
        testContextAwareHistory,
        testErrorHandling,
        testMemoryManagement,
        testHistorySubscription,
        testSecurityValidation
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            test();
            passed++;
        } catch (error) {
            failed++;
            console.error(`\n❌ Test failed: ${error.message}`);
            console.error(error.stack);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
    console.log('='.repeat(60) + '\n');

    if (failed > 0) {
        throw new Error(`${failed} test(s) failed`);
    }
}

/**
 * Test: CommandHistory construction
 */
function testCommandHistoryConstruction() {
    console.log('🧪 Test: CommandHistory Construction');

    // Valid construction
    const history1 = new CommandHistory();
    assert(history1.maxHistorySize === 50, 'Default max size should be 50');

    const history2 = new CommandHistory(100);
    assert(history2.maxHistorySize === 100, 'Custom max size should be set');

    // Invalid construction
    try {
        new CommandHistory(0);
        throw new Error('Should have thrown error for invalid size');
    } catch (error) {
        assert(error.message.includes('between 1 and 200'), 'Should validate min size');
    }

    try {
        new CommandHistory(300);
        throw new Error('Should have thrown error for size too large');
    } catch (error) {
        assert(error.message.includes('between 1 and 200'), 'Should validate max size');
    }

    console.log('  ✅ PASS: CommandHistory construction works correctly\n');
}

/**
 * Test: Command execution
 */
function testCommandExecution() {
    console.log('🧪 Test: Command Execution');

    const history = new CommandHistory();
    let executedValue = null;

    const testCommand = {
        execute: () => { executedValue = 'executed'; return executedValue; },
        undo: () => { executedValue = null; }
    };

    const result = history.execute(testCommand);

    assert(executedValue === 'executed', 'Command should be executed');
    assert(result === 'executed', 'Execute should return result');
    assert(history.currentIndex === 0, 'Current index should be 0');
    assert(history.history.length === 1, 'History should have 1 command');

    console.log('  ✅ PASS: Command execution works correctly\n');
}

/**
 * Test: Undo functionality
 */
function testUndoFunctionality() {
    console.log('🧪 Test: Undo Functionality');

    const history = new CommandHistory();
    let value = 0;

    const incrementCommand = {
        execute: () => { value++; },
        undo: () => { value--; }
    };

    history.execute(incrementCommand);
    history.execute(incrementCommand);
    history.execute(incrementCommand);

    assert(value === 3, 'Value should be 3 after 3 executions');

    const undoResult1 = history.undo();
    assert(undoResult1 === true, 'Undo should return true');
    assert(value === 2, 'Value should be 2 after first undo');

    history.undo();
    assert(value === 1, 'Value should be 1 after second undo');

    history.undo();
    assert(value === 0, 'Value should be 0 after third undo');

    const undoResult2 = history.undo();
    assert(undoResult2 === false, 'Undo should return false when no more undos');

    console.log('  ✅ PASS: Undo functionality works correctly\n');
}

/**
 * Test: Redo functionality
 */
function testRedoFunctionality() {
    console.log('🧪 Test: Redo Functionality');

    const history = new CommandHistory();
    let value = 0;
    let executeCount = 0;

    const incrementCommand = {
        execute: () => {
            value++;
            executeCount++;
        },
        undo: () => { value--; },
        redo: () => { value++; } // Redo restores state without incrementing executeCount
    };

    history.execute(incrementCommand);
    assert(value === 1 && executeCount === 1, 'Initial execute should work');

    history.execute(incrementCommand);
    assert(value === 2 && executeCount === 2, 'Second execute should work');

    history.undo();
    assert(value === 1, 'Value should be 1 after undo');

    const redoResult1 = history.redo();
    assert(redoResult1 === true, 'Redo should return true');
    assert(value === 2, 'Value should be 2 after redo');
    assert(executeCount === 2, 'Redo should not call execute() again');

    const redoResult2 = history.redo();
    assert(redoResult2 === false, 'Redo should return false when no more redos');

    console.log('  ✅ PASS: Redo functionality works correctly\n');
}

/**
 * Test: canUndo and canRedo state management
 */
function testCanUndoCanRedo() {
    console.log('🧪 Test: canUndo/canRedo State Management');

    const history = new CommandHistory();
    const dummyCommand = {
        execute: () => { },
        undo: () => { },
        redo: () => { }
    };

    assert(!history.canUndo(), 'Should not be able to undo empty history');
    assert(!history.canRedo(), 'Should not be able to redo empty history');

    history.execute(dummyCommand);
    assert(history.canUndo(), 'Should be able to undo after execution');
    assert(!history.canRedo(), 'Should not be able to redo after execution');

    history.undo();
    assert(!history.canUndo(), 'Should not be able to undo after undoing all');
    assert(history.canRedo(), 'Should be able to redo after undo');

    history.redo();
    assert(history.canUndo(), 'Should be able to undo after redo');
    assert(!history.canRedo(), 'Should not be able to redo after redoing all');

    console.log('  ✅ PASS: canUndo/canRedo state management works correctly\n');
}

/**
 * Test: History size limit
 */
function testHistoryLimit() {
    console.log('🧪 Test: History Size Limit');

    const history = new CommandHistory(5); // Limit to 5
    const dummyCommand = {
        execute: () => { },
        undo: () => { }
    };

    // Execute 10 commands
    for (let i = 0; i < 10; i++) {
        history.execute(dummyCommand);
    }

    assert(history.history.length === 5, 'History should be limited to 5');
    assert(history.currentIndex === 4, 'Current index should be 4');

    console.log('  ✅ PASS: History size limit works correctly\n');
}

/**
 * Test: History clear
 */
function testHistoryClear() {
    console.log('🧪 Test: History Clear');

    const history = new CommandHistory();
    const dummyCommand = {
        execute: () => { },
        undo: () => { }
    };

    history.execute(dummyCommand);
    history.execute(dummyCommand);

    assert(history.history.length === 2, 'Should have 2 commands');

    history.clear();

    assert(history.history.length === 0, 'History should be empty');
    assert(history.currentIndex === -1, 'Current index should be -1');
    assert(!history.canUndo(), 'Should not be able to undo');
    assert(!history.canRedo(), 'Should not be able to redo');

    console.log('  ✅ PASS: History clear works correctly\n');
}

/**
 * Test: Command chaining (undo/redo sequence)
 */
function testCommandChaining() {
    console.log('🧪 Test: Command Chaining');

    const history = new CommandHistory();
    let value = 0;

    const addCommand = {
        execute: () => { value += 5; },
        undo: () => { value -= 5; },
        redo: () => { value += 5; }
    };

    const multiplyCommand = {
        execute: () => { value *= 2; },
        undo: () => { value /= 2; },
        redo: () => { value *= 2; }
    };

    history.execute(addCommand);    // value = 5
    history.execute(multiplyCommand); // value = 10

    assert(value === 10, 'Value should be 10');

    history.undo();                  // value = 5
    assert(value === 5, 'Value should be 5 after undo');

    history.undo();                  // value = 0
    assert(value === 0, 'Value should be 0 after second undo');

    history.redo();                  // value = 5
    assert(value === 5, 'Value should be 5 after redo');

    history.redo();                  // value = 10
    assert(value === 10, 'Value should be 10 after second redo');

    console.log('  ✅ PASS: Command chaining works correctly\n');
}

/**
 * Test: GenerateAdventureCommand
 */
function testGenerateAdventureCommand() {
    console.log('🧪 Test: GenerateAdventureCommand');

    let currentEncounter = { id: 1, name: 'Old Encounter' };
    let generateCount = 0;

    const generateFn = () => {
        generateCount++;
        currentEncounter = { id: 2, name: 'New Encounter', generatedAt: generateCount };
        return currentEncounter;
    };

    const getStateFn = () => {
        return currentEncounter;
    };

    const setStateFn = (state) => {
        currentEncounter = state ? { ...state } : null;
    };

    const command = new GenerateAdventureCommand(generateFn, getStateFn, setStateFn);

    command.execute();
    assert(currentEncounter.id === 2, 'New encounter should be generated');
    assert(generateCount === 1, 'Generate should be called once');

    command.undo();
    assert(currentEncounter.id === 1, 'Old encounter should be restored');
    assert(generateCount === 1, 'Undo should not call generate');

    command.redo();
    assert(currentEncounter.id === 2, 'New encounter should be restored');
    assert(currentEncounter.generatedAt === 1, 'Should restore same encounter');
    assert(generateCount === 1, 'Redo should not call generate again');

    console.log('  ✅ PASS: GenerateAdventureCommand works correctly\n');
}

/**
 * Test: GenerateNPCCommand
 */
function testGenerateNPCCommand() {
    console.log('🧪 Test: GenerateNPCCommand');

    let currentNPC = { id: 1, name: 'Old NPC', species: 'human' };
    let generateCount = 0;

    const generateFn = () => {
        generateCount++;
        currentNPC = { id: 2, name: 'New NPC', species: 'elf', generatedAt: generateCount };
        return currentNPC;
    };

    const getStateFn = () => {
        return currentNPC;
    };

    const setStateFn = (state) => {
        currentNPC = state ? { ...state } : null;
    };

    const command = new GenerateNPCCommand(generateFn, getStateFn, setStateFn);

    command.execute();
    assert(currentNPC.id === 2, 'New NPC should be generated');
    assert(currentNPC.species === 'elf', 'NPC should be an elf');
    assert(generateCount === 1, 'Generate should be called once');

    command.undo();
    assert(currentNPC.id === 1, 'Old NPC should be restored');
    assert(currentNPC.species === 'human', 'NPC should be human again');
    assert(generateCount === 1, 'Undo should not call generate');

    command.redo();
    assert(currentNPC.id === 2, 'New NPC should be restored');
    assert(currentNPC.generatedAt === 1, 'Should restore same NPC');
    assert(generateCount === 1, 'Redo should not call generate again');

    console.log('  ✅ PASS: GenerateNPCCommand works correctly\n');
}

/**
 * Test: FilterChangeCommand
 */
function testFilterChangeCommand() {
    console.log('🧪 Test: FilterChangeCommand');

    let currentFilter = 'all';

    const applyFn = (type, value) => {
        currentFilter = value;
    };

    const command = new FilterChangeCommand('environment', 'all', 'forest', applyFn);

    command.execute();
    assert(currentFilter === 'forest', 'Filter should be changed to forest');

    command.undo();
    assert(currentFilter === 'all', 'Filter should be restored to all');

    command.redo();
    assert(currentFilter === 'forest', 'Filter should be changed to forest again');

    console.log('  ✅ PASS: FilterChangeCommand works correctly\n');
}

/**
 * Test: SearchCommand
 */
function testSearchCommand() {
    console.log('🧪 Test: SearchCommand');

    let currentQuery = '';

    const searchFn = (query) => {
        currentQuery = query;
    };

    const command = new SearchCommand('', 'dragon', searchFn);

    command.execute();
    assert(currentQuery === 'dragon', 'Search query should be set');

    command.undo();
    assert(currentQuery === '', 'Search query should be cleared');

    // Test XSS sanitization
    const maliciousCommand = new SearchCommand('', '<script>alert("xss")</script>', searchFn);
    maliciousCommand.execute();
    assert(!currentQuery.includes('<script>'), 'XSS should be prevented');

    console.log('  ✅ PASS: SearchCommand works correctly\n');
}

/**
 * Test: BatchCommand
 */
function testBatchCommand() {
    console.log('🧪 Test: BatchCommand');

    let value = 0;

    const cmd1 = {
        execute: () => { value += 5; },
        undo: () => { value -= 5; }
    };

    const cmd2 = {
        execute: () => { value *= 2; },
        undo: () => { value /= 2; }
    };

    const batchCommand = new BatchCommand([cmd1, cmd2], 'Add and Multiply');

    batchCommand.execute();
    assert(value === 10, 'Batch command should execute all commands');

    batchCommand.undo();
    assert(value === 0, 'Batch command should undo all commands in reverse');

    console.log('  ✅ PASS: BatchCommand works correctly\n');
}

/**
 * Test: Context-aware history
 */
function testContextAwareHistory() {
    console.log('🧪 Test: Context-Aware History');

    // Clear all contexts first
    clearContext('all');

    // Verify separate instances
    assert(generateHistory !== npcHistory, 'Generate and NPC histories should be separate');
    assert(generateHistory !== searchHistory, 'Generate and Search histories should be separate');
    assert(npcHistory !== searchHistory, 'NPC and Search histories should be separate');

    // Test generate context
    let value = 0;
    const incrementCommand = {
        execute: () => { value++; },
        undo: () => { value--; },
        redo: () => { value++; }
    };

    generateHistory.execute(incrementCommand);
    assert(value === 1, 'Value should be 1');
    assert(generateHistory.canUndo(), 'Generate history should have undo');
    assert(!npcHistory.canUndo(), 'NPC history should not have undo');

    // Test NPC context
    let npcValue = 0;
    const npcCommand = {
        execute: () => { npcValue++; },
        undo: () => { npcValue--; },
        redo: () => { npcValue++; }
    };

    npcHistory.execute(npcCommand);
    assert(npcValue === 1, 'NPC value should be 1');
    assert(npcHistory.canUndo(), 'NPC history should have undo');
    assert(generateHistory.canUndo(), 'Generate history should still have undo');

    // Test undo in NPC context doesn't affect generate
    npcHistory.undo();
    assert(npcValue === 0, 'NPC value should be 0 after undo');
    assert(value === 1, 'Generate value should still be 1');

    // Test context clearing
    clearContext('npc');
    assert(!npcHistory.canUndo(), 'NPC history should be cleared');
    assert(!npcHistory.canRedo(), 'NPC history should have no redo');
    assert(generateHistory.canUndo(), 'Generate history should not be affected');

    // Test executeInContext
    const testCommand = {
        execute: () => { value += 10; },
        undo: () => { value -= 10; },
        redo: () => { value += 10; }
    };

    executeInContext(testCommand, 'search');
    assert(value === 11, 'Value should be 11');
    assert(searchHistory.canUndo(), 'Search history should have undo');

    clearContext('all');

    console.log('  ✅ PASS: Context-aware history works correctly\n');
}

/**
 * Test: Error handling
 */
function testErrorHandling() {
    console.log('🧪 Test: Error Handling');

    const history = new CommandHistory();

    // Test invalid command
    try {
        history.execute(null);
        throw new Error('Should have thrown error for null command');
    } catch (error) {
        assert(error.message.includes('execute method'), 'Should validate command');
    }

    // Test command with missing undo
    try {
        history.execute({ execute: () => { } });
        throw new Error('Should have thrown error for missing undo');
    } catch (error) {
        assert(error.message.includes('undo method'), 'Should validate undo method');
    }

    // Test error during undo
    const failingCommand = {
        execute: () => { },
        undo: () => { throw new Error('Undo failed'); }
    };

    history.execute(failingCommand);
    const undoResult = history.undo();
    assert(undoResult === false, 'Undo should return false on error');

    console.log('  ✅ PASS: Error handling works correctly\n');
}

/**
 * Test: Memory management
 */
function testMemoryManagement() {
    console.log('🧪 Test: Memory Management');

    const history = new CommandHistory(10);

    // Create commands with large data
    for (let i = 0; i < 20; i++) {
        const largeData = new Array(1000).fill(i);
        const command = {
            data: largeData,
            execute: () => { },
            undo: () => { }
        };
        history.execute(command);
    }

    assert(history.history.length === 10, 'History should be limited');

    // Verify oldest commands are removed
    const metadata = history.getMetadata();
    assert(metadata.size === 10, 'Metadata should show correct size');
    assert(metadata.maxSize === 10, 'Metadata should show max size');

    console.log('  ✅ PASS: Memory management works correctly\n');
}

/**
 * Test: History subscription
 */
function testHistorySubscription() {
    console.log('🧪 Test: History Subscription');

    const history = new CommandHistory();
    let notificationCount = 0;
    let lastMetadata = null;

    const unsubscribe = history.subscribe((metadata) => {
        notificationCount++;
        lastMetadata = metadata;
    });

    const dummyCommand = {
        execute: () => { },
        undo: () => { }
    };

    history.execute(dummyCommand);
    assert(notificationCount === 1, 'Listener should be notified on execute');
    assert(lastMetadata.canUndo === true, 'Metadata should reflect state');

    history.undo();
    assert(notificationCount === 2, 'Listener should be notified on undo');

    unsubscribe();
    history.execute(dummyCommand);
    assert(notificationCount === 2, 'Listener should not be notified after unsubscribe');

    console.log('  ✅ PASS: History subscription works correctly\n');
}

/**
 * Test: Security validation
 */
function testSecurityValidation() {
    console.log('🧪 Test: Security Validation');

    // Test FilterChangeCommand validation
    try {
        new FilterChangeCommand('', 'old', 'new', () => { });
        throw new Error('Should have thrown error for empty filterType');
    } catch (error) {
        assert(error.message.includes('non-empty string'), 'Should validate filterType');
    }

    // Test GenerateAdventureCommand validation
    try {
        new GenerateAdventureCommand(null, () => { });
        throw new Error('Should have thrown error for invalid generateFn');
    } catch (error) {
        assert(error.message.includes('function'), 'Should validate generateFn');
    }

    // Test BatchCommand validation
    try {
        new BatchCommand([]);
        throw new Error('Should have thrown error for empty commands array');
    } catch (error) {
        assert(error.message.includes('non-empty array'), 'Should validate commands array');
    }

    // Test listener validation
    const history = new CommandHistory();
    try {
        history.subscribe('not a function');
        throw new Error('Should have thrown error for invalid listener');
    } catch (error) {
        assert(error.message.includes('function'), 'Should validate listener');
    }

    console.log('  ✅ PASS: Security validation works correctly\n');
}

/**
 * Simple assertion helper
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location && window.location.search && window.location.search.includes('test=command')) {
    runCommandHistoryTests();
}
