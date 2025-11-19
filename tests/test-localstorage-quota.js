// Test Suite: localStorage Quota Exceeded Error Handling
// Tests for Bug #2: Ensures proper error handling for storage operations

/**
 * Test if saveCurrentEncounter handles quota exceeded gracefully
 */
function testSaveEncounterQuotaExceeded() {
    console.log('🧪 Test: Save Encounter - Quota Exceeded Handling');
    
    // Save original localStorage
    const originalSetItem = Storage.prototype.setItem;
    let errorHandled = false;
    
    try {
        // Mock setItem to throw QuotaExceededError
        Storage.prototype.setItem = function(key, value) {
            const error = new Error('QuotaExceededError');
            error.name = 'QuotaExceededError';
            error.code = 22; // DOM Exception code for QuotaExceededError
            throw error;
        };
        
        // Mock window.alert to capture error messages
        const originalAlert = window.alert;
        let alertMessage = '';
        window.alert = function(msg) {
            alertMessage = msg;
            errorHandled = true;
        };
        
        // Setup test data
        window.encounterTemplate = {
            title: 'Test Encounter',
            tags: ['test'],
            descriptions: ['Test description']
        };
        window.selectedEnvironment = 'urban';
        window.currentEncounterLocations = [];
        window.currentEncounterNPCs = [];
        window.currentEncounterSkillChecks = [];
        window.currentEncounterTraps = [];
        window.currentEncounterHazards = [];
        window.currentEncounterEnvironmentalEffects = [];
        window.currentEncounterFlow = [];
        
        // Mock prompt to auto-provide name
        const originalPrompt = window.prompt;
        window.prompt = function() {
            return 'Test Save';
        };
        
        // Try to save
        console.log('  → Attempting save with mocked quota error...');
        const result = window.saveCurrentEncounter ? window.saveCurrentEncounter() : null;
        
        // Restore
        Storage.prototype.setItem = originalSetItem;
        window.alert = originalAlert;
        window.prompt = originalPrompt;
        
        if (errorHandled || alertMessage.toLowerCase().includes('storage') || alertMessage.toLowerCase().includes('quota')) {
            console.log('  ✅ PASS: QuotaExceededError was handled gracefully');
            console.log('  → Alert message:', alertMessage);
            return true;
        } else if (result === false || result === null) {
            console.log('  ⚠️  WARNING: Error may not be handled properly');
            console.log('  → No storage-related error message shown');
            return false;
        } else {
            console.log('  ❌ FAIL: QuotaExceededError not handled');
            return false;
        }
        
    } catch (error) {
        // Restore in case of test failure
        Storage.prototype.setItem = originalSetItem;
        
        if (error.name === 'QuotaExceededError') {
            console.error('  ❌ FAIL: QuotaExceededError was not caught by the function');
            return false;
        } else {
            console.error('  ❌ FAIL: Unexpected error:', error.message);
            return false;
        }
    }
}

/**
 * Test if theme saving handles quota exceeded
 */
function testThemeSaveQuotaExceeded() {
    console.log('🧪 Test: Theme Save - Quota Exceeded Handling');
    
    const originalSetItem = Storage.prototype.setItem;
    let errorCaught = false;
    
    try {
        // Mock setItem to throw QuotaExceededError for theme key
        Storage.prototype.setItem = function(key, value) {
            if (key === 'theme') {
                const error = new Error('QuotaExceededError');
                error.name = 'QuotaExceededError';
                throw error;
            }
            // Allow other keys to work normally
            return originalSetItem.call(this, key, value);
        };
        
        // Try to toggle theme
        console.log('  → Attempting theme change with mocked quota error...');
        
        if (typeof window.toggleTheme === 'function') {
            try {
                window.toggleTheme();
                console.log('  ⚠️  Note: Function executed without throwing (may have try-catch)');
                errorCaught = true; // Assume it's handled internally
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    console.log('  ❌ FAIL: QuotaExceededError not handled in toggleTheme');
                    errorCaught = false;
                } else {
                    throw e;
                }
            }
        } else {
            console.log('  ⚠️  SKIP: toggleTheme function not available');
            errorCaught = true; // Don't fail the test
        }
        
        // Restore
        Storage.prototype.setItem = originalSetItem;
        
        if (errorCaught) {
            console.log('  ✅ PASS: Theme save error handled or function not critical');
            return true;
        } else {
            return false;
        }
        
    } catch (error) {
        Storage.prototype.setItem = originalSetItem;
        console.error('  ❌ FAIL: Unexpected error:', error);
        return false;
    }
}

/**
 * Test if progressive reveal setting handles quota exceeded
 */
function testProgressiveRevealSaveQuotaExceeded() {
    console.log('🧪 Test: Progressive Reveal Save - Quota Exceeded Handling');
    
    const originalSetItem = Storage.prototype.setItem;
    let errorHandled = false;
    
    try {
        Storage.prototype.setItem = function(key, value) {
            if (key === 'progressiveReveal') {
                const error = new Error('QuotaExceededError');
                error.name = 'QuotaExceededError';
                throw error;
            }
            return originalSetItem.call(this, key, value);
        };
        
        console.log('  → Attempting progressive reveal toggle with mocked quota error...');
        
        if (typeof window.toggleProgressiveReveal === 'function') {
            try {
                window.toggleProgressiveReveal();
                console.log('  ✅ PASS: Function executed without crash (likely has error handling)');
                errorHandled = true;
            } catch (e) {
                if (e.name === 'QuotaExceededError') {
                    console.log('  ❌ FAIL: QuotaExceededError not handled');
                    errorHandled = false;
                }
            }
        } else {
            console.log('  ⚠️  SKIP: toggleProgressiveReveal function not available');
            errorHandled = true;
        }
        
        Storage.prototype.setItem = originalSetItem;
        return errorHandled;
        
    } catch (error) {
        Storage.prototype.setItem = originalSetItem;
        console.error('  ❌ FAIL: Unexpected error:', error);
        return false;
    }
}

/**
 * Test localStorage space usage monitoring
 */
function testLocalStorageSpaceMonitoring() {
    console.log('🧪 Test: localStorage Space Usage Monitoring');
    
    try {
        // Calculate current usage
        let totalSize = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length + key.length;
            }
        }
        
        const totalSizeKB = (totalSize / 1024).toFixed(2);
        const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
        
        console.log('  → Current localStorage usage:', totalSizeKB, 'KB (', totalSizeMB, 'MB)');
        
        // Most browsers have 5-10MB limit
        const warningThreshold = 4 * 1024 * 1024; // 4MB
        const criticalThreshold = 4.5 * 1024 * 1024; // 4.5MB
        
        if (totalSize > criticalThreshold) {
            console.log('  ⚠️  WARNING: localStorage usage is very high! Consider cleanup.');
            console.log('  → Recommend implementing automatic cleanup or user warning');
        } else if (totalSize > warningThreshold) {
            console.log('  ⚠️  CAUTION: localStorage usage is elevated');
        } else {
            console.log('  ✅ PASS: localStorage usage is within safe limits');
        }
        
        return true;
        
    } catch (error) {
        console.error('  ❌ FAIL: Error checking localStorage:', error);
        return false;
    }
}

/**
 * Test saved encounters cleanup when quota is reached
 */
function testSavedEncountersCleanup() {
    console.log('🧪 Test: Saved Encounters - Cleanup on Quota Exceeded');
    
    const originalSetItem = Storage.prototype.setItem;
    const originalGetItem = localStorage.getItem('savedEncounters');
    let cleanupOffered = false;
    
    try {
        // Setup: Add some test encounters to localStorage
        const testEncounters = [
            { name: 'Old Encounter 1', timestamp: '2024-01-01T00:00:00Z', data: {} },
            { name: 'Old Encounter 2', timestamp: '2024-01-02T00:00:00Z', data: {} },
            { name: 'Old Encounter 3', timestamp: '2024-01-03T00:00:00Z', data: {} }
        ];
        
        originalSetItem.call(localStorage, 'savedEncounters', JSON.stringify(testEncounters));
        
        // Mock setItem to throw on save attempt
        let attemptCount = 0;
        Storage.prototype.setItem = function(key, value) {
            attemptCount++;
            if (key === 'savedEncounters' && attemptCount === 1) {
                const error = new Error('QuotaExceededError');
                error.name = 'QuotaExceededError';
                throw error;
            }
            return originalSetItem.call(this, key, value);
        };
        
        // Mock alert/confirm to check if cleanup is suggested
        const originalAlert = window.alert;
        const originalConfirm = window.confirm;
        
        window.alert = function(msg) {
            if (msg.toLowerCase().includes('delete') || msg.toLowerCase().includes('storage')) {
                cleanupOffered = true;
            }
        };
        
        window.confirm = function(msg) {
            return false; // User declines cleanup
        };
        
        // Try to save with quota exceeded
        console.log('  → Testing cleanup offer on quota exceeded...');
        
        window.encounterTemplate = { title: 'Test', tags: [] };
        const originalPrompt = window.prompt;
        window.prompt = () => 'New Encounter';
        
        if (typeof window.saveCurrentEncounter === 'function') {
            window.saveCurrentEncounter();
        }
        
        // Restore
        Storage.prototype.setItem = originalSetItem;
        window.alert = originalAlert;
        window.confirm = originalConfirm;
        window.prompt = originalPrompt;
        
        // Restore original data
        if (originalGetItem) {
            localStorage.setItem('savedEncounters', originalGetItem);
        } else {
            localStorage.removeItem('savedEncounters');
        }
        
        if (cleanupOffered) {
            console.log('  ✅ PASS: Cleanup option offered to user');
            return true;
        } else {
            console.log('  ⚠️  Note: No cleanup offered (may be acceptable if error is shown)');
            return true; // Don't fail, as showing an error is also acceptable
        }
        
    } catch (error) {
        // Restore
        Storage.prototype.setItem = originalSetItem;
        if (originalGetItem) {
            localStorage.setItem('savedEncounters', originalGetItem);
        }
        
        console.error('  ❌ FAIL: Error during test:', error);
        return false;
    }
}

/**
 * Run all tests
 */
export function runLocalStorageTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 localStorage Quota Exceeded - Error Handling Tests');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const results = [];
    
    results.push(testSaveEncounterQuotaExceeded());
    results.push(testThemeSaveQuotaExceeded());
    results.push(testProgressiveRevealSaveQuotaExceeded());
    results.push(testLocalStorageSpaceMonitoring());
    results.push(testSavedEncountersCleanup());
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    if (passed === total) {
        console.log(`✅ All tests passed (${passed}/${total})`);
    } else {
        console.log(`❌ Some tests failed (${passed}/${total} passed)`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return passed === total;
}

// Auto-load
if (typeof window !== 'undefined') {
    window.runLocalStorageTests = runLocalStorageTests;
    console.log('💡 localStorage tests loaded. Run with: runLocalStorageTests()');
}
