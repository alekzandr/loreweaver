/**
 * Test Runner for Context-Aware Undo/Redo
 * Runs all tests including command history and context awareness
 */

// Polyfill window for Node.js environment
if (typeof window === 'undefined') {
    global.window = {
        currentPage: 'generate'
    };
}

import { runCommandHistoryTests } from './test-command-history.mjs';
import { runContextAwarenessTests } from './test-context-awareness.mjs';

console.log('\n' + '='.repeat(80));
console.log('🧪 LOREWEAVER - CONTEXT-AWARE UNDO/REDO TEST SUITE');
console.log('='.repeat(80));

// Run command history tests
const historyResults = runCommandHistoryTests();

// Run context awareness tests
const contextResults = runContextAwarenessTests();

// Summary
console.log('\n' + '='.repeat(80));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(80));

const totalPassed = historyResults.passed + contextResults.passed;
const totalFailed = historyResults.failed + contextResults.failed;
const totalTests = historyResults.total + contextResults.total;

console.log(`Command History Tests: ${historyResults.passed}/${historyResults.total} passed`);
console.log(`Context Awareness Tests: ${contextResults.passed}/${contextResults.total} passed`);
console.log('');
console.log(`TOTAL: ${totalPassed}/${totalTests} tests passed`);

if (totalFailed > 0) {
    console.log(`❌ ${totalFailed} tests failed`);
    console.log('='.repeat(80));
    process.exit(1);
} else {
    console.log('✅ All tests passed!');
    console.log('='.repeat(80));
}
