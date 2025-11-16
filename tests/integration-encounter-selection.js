/**
 * LoreWeaver - Integration Test for Encounter Selection Feature
 * This test runs in a browser environment and verifies the complete flow
 * of selecting an encounter from search results and generating with it.
 */

// Wait for DOM to be ready
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout waiting for element: ${selector}`));
        }, timeout);
    });
}

// Test suite
async function runIntegrationTests() {
    console.log('🧪 Starting Encounter Selection Integration Tests...\n');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Helper to record test results
    function recordTest(name, passed, error = null) {
        results.tests.push({ name, passed, error });
        if (passed) {
            console.log(`✅ ${name}`);
            results.passed++;
        } else {
            console.error(`❌ ${name}:`, error);
            results.failed++;
        }
    }

    // Test 1: Verify useEncounterForGeneration function exists
    try {
        if (typeof window.useEncounterForGeneration !== 'function') {
            throw new Error('useEncounterForGeneration function not found');
        }
        recordTest('useEncounterForGeneration function exists', true);
    } catch (error) {
        recordTest('useEncounterForGeneration function exists', false, error.message);
    }

    // Test 2: Verify environment selector exists
    try {
        const envSelect = document.getElementById('environmentSelect');
        if (!envSelect) {
            throw new Error('Environment selector not found');
        }
        recordTest('Environment selector exists', true);
    } catch (error) {
        recordTest('Environment selector exists', false, error.message);
    }

    // Test 3: Verify seed input exists
    try {
        const seedInput = document.getElementById('encounterSeed');
        if (!seedInput) {
            throw new Error('Seed input not found');
        }
        recordTest('Seed input exists', true);
    } catch (error) {
        recordTest('Seed input exists', false, error.message);
    }

    // Test 4: Test encounter selection flow
    try {
        const testEncounter = {
            title: 'Integration Test Encounter',
            descriptions: ['This is a test encounter for integration testing'],
            tags: ['test', 'integration'],
            weight: 1.0,
            resolutions: []
        };
        const environment = 'urban';

        // Call the function
        window.useEncounterForGeneration(environment, testEncounter);

        // Verify preselectedEncounter was set
        if (!window.preselectedEncounter) {
            throw new Error('preselectedEncounter not set');
        }
        if (window.preselectedEncounter.environment !== environment) {
            throw new Error(`Expected environment '${environment}', got '${window.preselectedEncounter.environment}'`);
        }
        if (window.preselectedEncounter.template.title !== testEncounter.title) {
            throw new Error('Encounter template not set correctly');
        }

        recordTest('Encounter selection sets preselectedEncounter', true);
    } catch (error) {
        recordTest('Encounter selection sets preselectedEncounter', false, error.message);
    }

    // Test 5: Verify environment selector is updated
    try {
        const envSelect = document.getElementById('environmentSelect');
        const testEnvironment = 'forest';
        const testEncounter = {
            title: 'Forest Test',
            descriptions: ['Forest description'],
            tags: ['forest'],
            weight: 1.0
        };

        window.useEncounterForGeneration(testEnvironment, testEncounter);

        if (envSelect.value !== testEnvironment) {
            throw new Error(`Expected environment selector to be '${testEnvironment}', got '${envSelect.value}'`);
        }
        if (window.selectedEnvironment !== testEnvironment) {
            throw new Error(`Expected selectedEnvironment to be '${testEnvironment}', got '${window.selectedEnvironment}'`);
        }

        recordTest('Environment selector updates correctly', true);
    } catch (error) {
        recordTest('Environment selector updates correctly', false, error.message);
    }

    // Test 6: Verify seed input is cleared
    try {
        const seedInput = document.getElementById('encounterSeed');
        seedInput.value = 'test-seed-value';

        const testEncounter = {
            title: 'Seed Clear Test',
            descriptions: ['Test'],
            tags: ['test'],
            weight: 1.0
        };

        window.useEncounterForGeneration('urban', testEncounter);

        if (seedInput.value !== '') {
            throw new Error(`Expected seed input to be empty, got '${seedInput.value}'`);
        }

        recordTest('Seed input is cleared', true);
    } catch (error) {
        recordTest('Seed input is cleared', false, error.message);
    }

    // Test 7: Verify page switches to Generate
    try {
        const generatePage = document.getElementById('generatePage');
        if (!generatePage) {
            throw new Error('Generate page not found');
        }

        const testEncounter = {
            title: 'Page Switch Test',
            descriptions: ['Test'],
            tags: ['test'],
            weight: 1.0
        };

        window.useEncounterForGeneration('urban', testEncounter);

        // Give it a moment for the page switch
        await new Promise(resolve => setTimeout(resolve, 100));

        if (generatePage.style.display === 'none') {
            throw new Error('Generate page not visible after encounter selection');
        }

        recordTest('Page switches to Generate', true);
    } catch (error) {
        recordTest('Page switches to Generate', false, error.message);
    }

    // Test 8: Verify banner is created
    try {
        const testEncounter = {
            title: 'Banner Test Encounter',
            descriptions: ['Test'],
            tags: ['test'],
            weight: 1.0
        };

        window.useEncounterForGeneration('urban', testEncounter);

        // Give it a moment for the banner to be created
        await new Promise(resolve => setTimeout(resolve, 100));

        const banner = document.getElementById('encounterSelectedBanner');
        if (!banner) {
            throw new Error('Encounter selected banner not created');
        }
        if (!banner.textContent.includes('Banner Test Encounter')) {
            throw new Error('Banner does not contain encounter title');
        }

        recordTest('Encounter selected banner is created', true);
    } catch (error) {
        recordTest('Encounter selected banner is created', false, error.message);
    }

    // Test 9: Verify banner can be closed
    try {
        const banner = document.getElementById('encounterSelectedBanner');
        if (!banner) {
            throw new Error('Banner not found for close test');
        }

        const closeButton = banner.querySelector('.banner-close');
        if (!closeButton) {
            throw new Error('Banner close button not found');
        }

        closeButton.click();

        // Give it a moment for the removal
        await new Promise(resolve => setTimeout(resolve, 100));

        const bannerAfterClose = document.getElementById('encounterSelectedBanner');
        if (bannerAfterClose) {
            throw new Error('Banner still exists after close');
        }

        recordTest('Banner can be closed', true);
    } catch (error) {
        recordTest('Banner can be closed', false, error.message);
    }

    // Test 10: Verify preselectedEncounter is used in generation
    try {
        if (!window.dataLoaded) {
            throw new Error('Data not loaded, skipping generation test');
        }

        const testEncounter = {
            title: 'Generation Test Encounter',
            descriptions: ['This encounter should be used for generation'],
            tags: ['test', 'generation'],
            weight: 1.0,
            resolutions: []
        };

        window.useEncounterForGeneration('urban', testEncounter);

        // Verify it's set before generation
        if (!window.preselectedEncounter) {
            throw new Error('preselectedEncounter not set before generation');
        }

        const preselectedTitle = window.preselectedEncounter.template.title;
        if (preselectedTitle !== 'Generation Test Encounter') {
            throw new Error('Wrong encounter in preselectedEncounter');
        }

        recordTest('Preselected encounter ready for generation', true);
    } catch (error) {
        recordTest('Preselected encounter ready for generation', false, error.message);
    }

    // Print results
    console.log('\n' + '='.repeat(50));
    console.log('📊 Integration Test Results');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📝 Total:  ${results.tests.length}`);
    
    if (results.failed > 0) {
        console.log('\n❌ Failed Tests:');
        results.tests.filter(t => !t.passed).forEach(t => {
            console.log(`  - ${t.name}: ${t.error}`);
        });
    }

    console.log('='.repeat(50));

    return results;
}

// Export for use in CI or run directly
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runIntegrationTests };
}

// Auto-run if loaded directly in browser
if (typeof window !== 'undefined') {
    window.runEncounterSelectionTests = runIntegrationTests;
    
    // Add a button to run tests manually
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addTestButton);
    } else {
        addTestButton();
    }
}

function addTestButton() {
    // Only add in development/test mode
    if (window.location.search.includes('test=true')) {
        const button = document.createElement('button');
        button.textContent = '🧪 Run Encounter Selection Tests';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.zIndex = '10000';
        button.style.padding = '10px 20px';
        button.onclick = async () => {
            button.disabled = true;
            button.textContent = '⏳ Running tests...';
            await runIntegrationTests();
            button.disabled = false;
            button.textContent = '✅ Tests complete';
        };
        document.body.appendChild(button);
    }
}
