
// Regression test to ensure internal functions are correctly exported to window
// This prevents ReferenceErrors where the exported name matches a non-existent local variable

export function testWindowExports() {
    console.log('🧪 Testing Window Exports...');

    const requiredExports = [
        'toggleSection',
        'toggleAdventureMenu', // Was toggleEncounterMenu
        'closeAdventureMenu',  // Was closeEncounterMenu
        'toggleFlowNavigator',
        'scrollToFlowStep',
        'populateFlowNavigator',
        'showLocationDetail',
        'hideLocationDetail',
        'showNPCDetail',
        'hideNPCDetail',
        'showNPCTooltip',
        'hideNPCTooltip',
        'showNPCDetailFromObject',
        'initializeSearchFilters'
    ];

    const missingExports = [];
    const undefinedExports = [];

    requiredExports.forEach(funcName => {
        // Check if the property exists on window
        if (!window.hasOwnProperty(funcName) && window[funcName] === undefined) {
            // It might be on the prototype chain or just strictly undefined? 
            // Simplest check:
            if (typeof window[funcName] === 'undefined') {
                missingExports.push(funcName);
            }
        } else if (window[funcName] === undefined) {
            undefinedExports.push(funcName);
        }
    });

    if (missingExports.length > 0 || undefinedExports.length > 0) {
        console.error('❌ Window Export Test FAILED');
        if (missingExports.length > 0) console.error('Missing exports:', missingExports);
        if (undefinedExports.length > 0) console.error('Undefined exports (property exists but is undefined):', undefinedExports);

        // Add a visual indicator for failure
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '10px';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translateX(-50%)';
        errorDiv.style.backgroundColor = 'red';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '20px';
        errorDiv.style.zIndex = '99999';
        errorDiv.style.fontWeight = 'bold';
        errorDiv.innerText = '❌ TEST FAILED: UI Exports Missing. Check Console.';
        document.body.appendChild(errorDiv);

        throw new Error('Window Export Test Failed');
    } else {
        console.log('✅ Window Export Test PASSED');
    }
}

// Run immediately
testWindowExports();
