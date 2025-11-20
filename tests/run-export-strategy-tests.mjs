/**
 * Export Strategies Test Runner
 * Node.js compatible wrapper for export strategy tests
 */

// Mock browser APIs for Node.js environment
global.window = global;
global.document = {
    readyState: 'complete',
    addEventListener: () => {},
    dispatchEvent: () => {},
    createElement: () => ({
        href: '',
        download: '',
        click: () => {},
        remove: () => {}
    }),
    body: {
        appendChild: () => {},
        removeChild: () => {}
    }
};
global.Blob = class Blob {
    constructor(parts, options) {
        this.parts = parts;
        this.options = options;
    }
};
global.URL = {
    createObjectURL: () => 'blob:test',
    revokeObjectURL: () => {}
};

// Mock capitalizeSpecies utility function for Node.js environment
global.capitalizeSpecies = function(species) {
    if (!species) return species;
    return species
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');
};

// Import and run tests
import('./test-export-strategies.mjs')
    .then(module => {
        module.runExportStrategyTests();
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });
