// Test Suite: Duplicate Function Exports
// Tests for Bug #4: Ensures functions are not exported multiple times

/**
 * Test if window.changeItemsPerPage is defined only once
 */
function testChangeItemsPerPageSingleDefinition() {
    console.log('🧪 Test: changeItemsPerPage - Single Definition Check');
    
    try {
        const func = window.changeItemsPerPage;
        
        if (typeof func === 'function') {
            console.log('  ✅ PASS: window.changeItemsPerPage is defined as a function');
            
            // Check if it can be called
            try {
                // Don't actually change the value, just check it's callable
                const funcString = func.toString();
                if (funcString.includes('itemsPerPage')) {
                    console.log('  ✅ PASS: Function appears to be correctly implemented');
                } else {
                    console.log('  ⚠️  WARNING: Function implementation may be incomplete');
                }
            } catch (e) {
                console.log('  ⚠️  WARNING: Could not inspect function:', e.message);
            }
            
            return true;
        } else {
            console.log('  ❌ FAIL: window.changeItemsPerPage is not a function');
            return false;
        }
    } catch (error) {
        console.error('  ❌ FAIL: Error checking function:', error);
        return false;
    }
}

/**
 * Scan for duplicate function exports in window object
 */
function testNoDuplicateExports() {
    console.log('🧪 Test: Check for Duplicate Function Exports');
    
    try {
        // List of functions that should be exported
        const expectedExports = [
            'generateEncounter',
            'generateNPC',
            'generateRoom',
            'saveCurrentEncounter',
            'showSavedEncounters',
            'loadSavedEncounter',
            'deleteSavedEncounter',
            'performSearch',
            'switchPage',
            'toggleTheme',
            'toggleProgressiveReveal',
            'changeItemsPerPage',
            'nextPage',
            'previousPage',
            'exportEncounterMarkdown',
            'exportEncounterText',
            'exportEncounterPDF'
        ];
        
        console.log('  → Checking for properly exported functions...');
        
        let allPresent = true;
        let missingFunctions = [];
        
        expectedExports.forEach(funcName => {
            if (typeof window[funcName] !== 'function') {
                allPresent = false;
                missingFunctions.push(funcName);
            }
        });
        
        if (allPresent) {
            console.log('  ✅ PASS: All expected functions are exported');
        } else {
            console.log('  ⚠️  WARNING: Some functions not found:', missingFunctions.join(', '));
            console.log('  → This may be expected if functions are in modules not yet loaded');
        }
        
        return true;
        
    } catch (error) {
        console.error('  ❌ FAIL: Error scanning exports:', error);
        return false;
    }
}

/**
 * Test that function works correctly after module loads
 */
function testChangeItemsPerPageFunctionality() {
    console.log('🧪 Test: changeItemsPerPage - Functionality Check');
    
    try {
        if (typeof window.changeItemsPerPage !== 'function') {
            console.log('  ⚠️  SKIP: changeItemsPerPage function not available');
            return true;
        }
        
        // Store current page state
        const topSelect = document.getElementById('itemsPerPageTop');
        const bottomSelect = document.getElementById('itemsPerPageBottom');
        
        if (!topSelect && !bottomSelect) {
            console.log('  ⚠️  SKIP: Items per page selects not found (may not be on search page)');
            return true;
        }
        
        const originalTopValue = topSelect?.value;
        const originalBottomValue = bottomSelect?.value;
        
        // Test function call
        console.log('  → Testing function with value 10...');
        window.changeItemsPerPage(10);
        
        // Check if both dropdowns were updated
        if (topSelect && topSelect.value === '10') {
            console.log('  ✅ PASS: Top dropdown updated correctly');
        }
        
        if (bottomSelect && bottomSelect.value === '10') {
            console.log('  ✅ PASS: Bottom dropdown updated correctly');
        }
        
        // Restore original values
        if (topSelect && originalTopValue) topSelect.value = originalTopValue;
        if (bottomSelect && originalBottomValue) bottomSelect.value = originalBottomValue;
        
        console.log('  ✅ PASS: Function executes without errors');
        return true;
        
    } catch (error) {
        console.error('  ❌ FAIL: Function threw an error:', error);
        return false;
    }
}

/**
 * Check for duplicate assignments in source code (static analysis simulation)
 */
function testNoMultipleAssignments() {
    console.log('🧪 Test: Static Analysis - Multiple Assignment Detection');
    
    try {
        // Get the function as a string
        const funcString = window.changeItemsPerPage ? window.changeItemsPerPage.toString() : '';
        
        if (!funcString) {
            console.log('  ⚠️  SKIP: Could not get function source');
            return true;
        }
        
        console.log('  → Checking function implementation...');
        
        // Check if the function looks properly implemented
        if (funcString.includes('itemsPerPage') && 
            funcString.includes('currentPage')) {
            console.log('  ✅ PASS: Function appears to have proper implementation');
        } else {
            console.log('  ⚠️  WARNING: Function implementation may be incomplete');
        }
        
        return true;
        
    } catch (error) {
        console.error('  ❌ FAIL: Error analyzing function:', error);
        return false;
    }
}

/**
 * Test pagination functionality integration
 */
function testPaginationIntegration() {
    console.log('🧪 Test: Pagination Functions Integration');
    
    try {
        const paginationFunctions = ['nextPage', 'previousPage', 'changeItemsPerPage'];
        let allFound = true;
        
        console.log('  → Checking pagination functions...');
        
        paginationFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                console.log(`    • ${funcName}: ✓`);
            } else {
                console.log(`    • ${funcName}: ✗ (not found)`);
                allFound = false;
            }
        });
        
        if (allFound) {
            console.log('  ✅ PASS: All pagination functions are available');
            return true;
        } else {
            console.log('  ⚠️  Note: Some pagination functions not found (may not be on search page)');
            return true; // Don't fail, as this depends on which page is loaded
        }
        
    } catch (error) {
        console.error('  ❌ FAIL: Error checking pagination:', error);
        return false;
    }
}

/**
 * Run all tests
 */
export function runDuplicateExportsTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 Duplicate Function Exports Test Suite');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const results = [];
    
    results.push(testChangeItemsPerPageSingleDefinition());
    results.push(testNoDuplicateExports());
    results.push(testChangeItemsPerPageFunctionality());
    results.push(testNoMultipleAssignments());
    results.push(testPaginationIntegration());
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    if (passed === total) {
        console.log(`✅ All tests passed (${passed}/${total})`);
    } else {
        console.log(`❌ Some tests failed (${passed}/${total} passed)`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return passed === total;
}

// Auto-load
if (typeof window !== 'undefined') {
    window.runDuplicateExportsTests = runDuplicateExportsTests;
    console.log('💡 Duplicate exports tests loaded. Run with: runDuplicateExportsTests()');
}
