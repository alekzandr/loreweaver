/**
 * Command History Test Runner
 * Node.js compatible wrapper for command history tests
 */

// Mock browser APIs for Node.js environment
global.window = global;
global.document = {
    readyState: 'complete',
    addEventListener: () => {},
    dispatchEvent: () => {}
};
global.HTMLElement = class HTMLElement {};

// Simple structuredClone polyfill for Node.js
if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Import and run tests
import('./test-command-history.mjs')
    .then(module => {
        module.runCommandHistoryTests();
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });
