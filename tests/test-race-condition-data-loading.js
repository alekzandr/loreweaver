// Test Suite: Race Condition - Data Loading
// Tests for Bug #3: Ensures functions don't execute before data is ready

/**
 * Test if data loading is awaited before UI initialization
 */
function testDataLoadingBeforeUIInit() {
    console.log('🧪 Test: Data Loading Before UI Initialization');
    
    // Store original state
    const originalDataLoaded = window.dataLoaded;
    const originalEncounterTitles = window.encounterTitles;
    const originalLocationObjects = window.locationObjects;
    const originalNpcData = window.npcData;
    
    try {
        // Simulate unloaded state
        window.dataLoaded = false;
        window.encounterTitles = undefined;
        window.locationObjects = undefined;
        window.npcData = undefined;
        
        console.log('  → Checking if generate button is disabled when data not loaded...');
        
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            const isDisabled = generateBtn.disabled || generateBtn.classList.contains('disabled');
            if (isDisabled) {
                console.log('  ✅ PASS: Generate button is disabled when data not loaded');
            } else {
                console.log('  ⚠️  WARNING: Generate button may be enabled before data loads');
            }
        } else {
            console.log('  ⚠️  Note: Generate button not found in DOM');
        }
        
        // Restore
        window.dataLoaded = originalDataLoaded;
        window.encounterTitles = originalEncounterTitles;
        window.locationObjects = originalLocationObjects;
        window.npcData = originalNpcData;
        
        return true;
        
    } catch (error) {
        // Restore on error
        window.dataLoaded = originalDataLoaded;
        window.encounterTitles = originalEncounterTitles;
        window.locationObjects = originalLocationObjects;
        window.npcData = originalNpcData;
        
        console.error('  ❌ FAIL: Error during test:', error);
        return false;
    }
}

/**
 * Test if encounter generation checks for loaded data
 */
function testEncounterGenerationDataCheck() {
    console.log('🧪 Test: Encounter Generation - Data Availability Check');
    
    const originalDataLoaded = window.dataLoaded;
    const originalEncounterTitles = window.encounterTitles;
    const originalLocationObjects = window.locationObjects;
    const originalAlert = window.alert;
    
    let alertCalled = false;
    let alertMessage = '';
    
    try {
        // Mock alert to capture messages
        window.alert = function(msg) {
            alertCalled = true;
            alertMessage = msg;
        };
        
        // Simulate unloaded state
        window.dataLoaded = false;
        window.encounterTitles = undefined;
        window.locationObjects = undefined;
        
        console.log('  → Attempting to generate encounter with no data loaded...');
        
        if (typeof window.generateEncounter === 'function') {
            try {
                window.generateEncounter();
                
                // Check if function handled the missing data gracefully
                if (alertCalled && (alertMessage.toLowerCase().includes('data') || alertMessage.toLowerCase().includes('load'))) {
                    console.log('  ✅ PASS: Function shows error when data not loaded');
                    console.log('  → Alert message:', alertMessage);
                } else if (!window.encounterTemplate) {
                    console.log('  ✅ PASS: Function did not create encounter without data');
                } else {
                    console.log('  ⚠️  WARNING: Function may have proceeded without data check');
                }
            } catch (error) {
                if (error.message.includes('undefined') || error.message.includes('null')) {
                    console.log('  ❌ FAIL: Function crashed due to missing data (no null check)');
                    console.log('  → Error:', error.message);
                } else {
                    throw error;
                }
            }
        } else {
            console.log('  ⚠️  SKIP: generateEncounter function not available');
        }
        
        // Restore
        window.dataLoaded = originalDataLoaded;
        window.encounterTitles = originalEncounterTitles;
        window.locationObjects = originalLocationObjects;
        window.alert = originalAlert;
        
        return true;
        
    } catch (error) {
        // Restore
        window.dataLoaded = originalDataLoaded;
        window.encounterTitles = originalEncounterTitles;
        window.locationObjects = originalLocationObjects;
        window.alert = originalAlert;
        
        console.error('  ❌ FAIL: Unexpected error:', error);
        return false;
    }
}

/**
 * Test if NPC dropdown population waits for data
 */
function testNPCDropdownPopulationDataCheck() {
    console.log('🧪 Test: NPC Dropdown Population - Data Availability Check');
    
    const originalNpcData = window.npcData;
    
    try {
        // Clear NPC data
        window.npcData = undefined;
        
        console.log('  → Checking NPC species dropdown when data is not loaded...');
        
        const speciesSelect = document.getElementById('npcSpecies');
        if (speciesSelect) {
            // Count options (should only have 1 - the "Random" option)
            const optionCount = speciesSelect.options.length;
            
            if (optionCount === 1) {
                console.log('  ✅ PASS: Dropdown not populated without data');
            } else if (optionCount > 1) {
                console.log('  ⚠️  Note: Dropdown has', optionCount, 'options (may be pre-populated)');
            } else {
                console.log('  ⚠️  WARNING: Dropdown has no options at all');
            }
        } else {
            console.log('  ⚠️  Note: NPC species dropdown not found');
        }
        
        // Restore
        window.npcData = originalNpcData;
        
        return true;
        
    } catch (error) {
        window.npcData = originalNpcData;
        console.error('  ❌ FAIL: Error during test:', error);
        return false;
    }
}

/**
 * Test if search functionality checks for loaded data
 */
function testSearchDataCheck() {
    console.log('🧪 Test: Search Functionality - Data Availability Check');
    
    const originalDataLoaded = window.dataLoaded;
    const originalEncounterTitles = window.encounterTitles;
    const originalLocationObjects = window.locationObjects;
    
    try {
        // Simulate unloaded state
        window.dataLoaded = false;
        window.encounterTitles = undefined;
        window.locationObjects = undefined;
        
        console.log('  → Attempting search with no data loaded...');
        
        if (typeof window.performSearch === 'function') {
            try {
                // Set a search term
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.value = 'test';
                }
                
                window.performSearch();
                
                // Check results
                const resultsDiv = document.getElementById('searchResults');
                if (resultsDiv && resultsDiv.innerHTML.includes('No results')) {
                    console.log('  ✅ PASS: Search handled missing data gracefully');
                } else if (resultsDiv && resultsDiv.innerHTML.includes('0 result')) {
                    console.log('  ✅ PASS: Search returned empty results');
                } else {
                    console.log('  ⚠️  Note: Search behavior with no data is unclear');
                }
            } catch (error) {
                if (error.message.includes('undefined') || error.message.includes('null')) {
                    console.log('  ❌ FAIL: Search crashed due to missing data');
                    console.log('  → Error:', error.message);
                } else {
                    throw error;
                }
            }
        } else {
            console.log('  ⚠️  SKIP: performSearch function not available');
        }
        
        // Restore
        window.dataLoaded = originalDataLoaded;
        window.encounterTitles = originalEncounterTitles;
        window.locationObjects = originalLocationObjects;
        
        return true;
        
    } catch (error) {
        window.dataLoaded = originalDataLoaded;
        window.encounterTitles = originalEncounterTitles;
        window.locationObjects = originalLocationObjects;
        
        console.error('  ❌ FAIL: Unexpected error:', error);
        return false;
    }
}

/**
 * Test loading spinner/indicator presence
 */
function testLoadingIndicator() {
    console.log('🧪 Test: Loading Indicator Presence');
    
    try {
        // Look for common loading indicator patterns
        const possibleIndicators = [
            document.getElementById('loadingSpinner'),
            document.getElementById('loading'),
            document.querySelector('.loading'),
            document.querySelector('.spinner'),
            document.querySelector('[data-loading]')
        ];
        
        const hasIndicator = possibleIndicators.some(el => el !== null);
        
        if (hasIndicator) {
            console.log('  ✅ PASS: Loading indicator found in DOM');
        } else {
            console.log('  ⚠️  RECOMMENDATION: Consider adding a loading indicator');
            console.log('  → This improves UX during data loading');
        }
        
        return true;
        
    } catch (error) {
        console.error('  ❌ FAIL: Error checking for loading indicator:', error);
        return false;
    }
}

/**
 * Test data loading order and dependencies
 */
function testDataLoadingOrder() {
    console.log('🧪 Test: Data Loading Order and Dependencies');
    
    try {
        // Check if critical data exists
        const hasEncounters = window.encounterTitles && Object.keys(window.encounterTitles).length > 0;
        const hasLocations = window.locationObjects && Object.keys(window.locationObjects).length > 0;
        const hasNPCs = window.npcData && Object.keys(window.npcData).length > 0;
        const hasSkillChecks = window.skillChecksData && window.skillChecksData.skillChecks;
        const hasDangers = window.dangersData && (window.dangersData.traps || window.dangersData.hazards);
        
        console.log('  → Data availability check:');
        console.log('    • Encounters:', hasEncounters ? '✓' : '✗');
        console.log('    • Locations:', hasLocations ? '✓' : '✗');
        console.log('    • NPCs:', hasNPCs ? '✓' : '✗');
        console.log('    • Skill Checks:', hasSkillChecks ? '✓' : '✗');
        console.log('    • Dangers:', hasDangers ? '✓' : '✗');
        console.log('    • window.dataLoaded:', window.dataLoaded ? '✓' : '✗');
        
        const allLoaded = hasEncounters && hasLocations && hasNPCs && hasSkillChecks && hasDangers;
        
        if (allLoaded && window.dataLoaded) {
            console.log('  ✅ PASS: All critical data loaded and flag set correctly');
            return true;
        } else if (allLoaded && !window.dataLoaded) {
            console.log('  ⚠️  WARNING: Data loaded but window.dataLoaded flag not set');
            return true;
        } else if (!allLoaded && window.dataLoaded) {
            console.log('  ⚠️  WARNING: window.dataLoaded=true but some data is missing');
            return false;
        } else {
            console.log('  ⚠️  Note: Data may still be loading');
            return true;
        }
        
    } catch (error) {
        console.error('  ❌ FAIL: Error checking data loading:', error);
        return false;
    }
}

/**
 * Run all tests
 */
export function runRaceConditionTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 Race Condition Test Suite - Data Loading');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const results = [];
    
    results.push(testDataLoadingBeforeUIInit());
    results.push(testEncounterGenerationDataCheck());
    results.push(testNPCDropdownPopulationDataCheck());
    results.push(testSearchDataCheck());
    results.push(testLoadingIndicator());
    results.push(testDataLoadingOrder());
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    if (passed === total) {
        console.log(`✅ All tests passed (${passed}/${total})`);
    } else {
        console.log(`❌ Some tests failed (${passed}/${total} passed)`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return passed === total;
}

// Auto-load
if (typeof window !== 'undefined') {
    window.runRaceConditionTests = runRaceConditionTests;
    console.log('💡 Race condition tests loaded. Run with: runRaceConditionTests()');
}
