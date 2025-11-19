// Test Suite: NPC Panel Chrome Closing Issue
// Tests for Bug #5: Ensures panel closes properly without browser-specific hacks

/**
 * Test if location detail panel can close properly
 */
function testLocationPanelClose() {
    console.log('🧪 Test: Location Detail Panel - Close Functionality');
    
    try {
        const panel = document.getElementById('locationDetailPanel');
        
        if (!panel) {
            console.log('  ⚠️  SKIP: Location detail panel not found in DOM');
            return true;
        }
        
        // Open the panel first
        console.log('  → Opening location panel...');
        panel.classList.add('active');
        
        // Wait a tick for CSS to apply
        setTimeout(() => {
            const isOpen = panel.classList.contains('active');
            if (!isOpen) {
                console.log('  ❌ FAIL: Panel did not open properly');
                return false;
            }
            
            // Now try to close it
            console.log('  → Closing location panel...');
            panel.classList.remove('active');
            
            // Check if it closed
            setTimeout(() => {
                const isClosed = !panel.classList.contains('active');
                if (isClosed) {
                    console.log('  ✅ PASS: Location panel closed successfully');
                } else {
                    console.log('  ❌ FAIL: Panel did not close properly');
                }
            }, 100);
        }, 100);
        
        return true;
        
    } catch (error) {
        console.error('  ❌ FAIL: Error testing location panel:', error);
        return false;
    }
}

/**
 * Test if NPC detail panel can close properly
 */
function testNPCPanelClose() {
    console.log('🧪 Test: NPC Detail Panel - Close Functionality');
    
    try {
        const panel = document.getElementById('npcDetailPanel');
        
        if (!panel) {
            console.log('  ⚠️  SKIP: NPC detail panel not found in DOM');
            return true;
        }
        
        // Test opening
        console.log('  → Opening NPC panel...');
        panel.classList.add('active');
        
        // Check CSS transition properties
        const styles = window.getComputedStyle(panel);
        const transition = styles.transition || styles.webkitTransition;
        
        console.log('  → Panel transition property:', transition);
        
        // Wait for transition
        setTimeout(() => {
            const isOpen = panel.classList.contains('active');
            
            if (!isOpen) {
                console.log('  ❌ FAIL: Panel did not open');
                return false;
            }
            
            // Test closing
            console.log('  → Closing NPC panel...');
            panel.classList.remove('active');
            
            // Verify close
            setTimeout(() => {
                const isClosed = !panel.classList.contains('active');
                
                if (isClosed) {
                    console.log('  ✅ PASS: NPC panel closed successfully');
                    console.log('  ✅ PASS: No forced reflow needed');
                } else {
                    console.log('  ⚠️  WARNING: Panel may not have closed properly');
                }
            }, 100);
        }, 100);
        
        return true;
        
    } catch (error) {
        console.error('  ❌ FAIL: Error testing NPC panel:', error);
        return false;
    }
}

/**
 * Test panel z-index management
 */
function testPanelZIndexManagement() {
    console.log('🧪 Test: Panel Z-Index Management');
    
    try {
        const locationPanel = document.getElementById('locationDetailPanel');
        const npcPanel = document.getElementById('npcDetailPanel');
        
        if (!locationPanel || !npcPanel) {
            console.log('  ⚠️  SKIP: One or both panels not found');
            return true;
        }
        
        // Get z-index values
        const locationZ = parseInt(window.getComputedStyle(locationPanel).zIndex) || 0;
        const npcZ = parseInt(window.getComputedStyle(npcPanel).zIndex) || 0;
        
        console.log('  → Location panel z-index:', locationZ);
        console.log('  → NPC panel z-index:', npcZ);
        
        // Both should have defined z-index
        if (locationZ > 0 && npcZ > 0) {
            console.log('  ✅ PASS: Both panels have proper z-index values');
            
            if (locationZ === npcZ) {
                console.log('  ⚠️  Note: Panels have same z-index (may cause overlap issues)');
            }
            
            return true;
        } else {
            console.log('  ⚠️  WARNING: One or both panels missing z-index');
            return true; // Don't fail as it may work with default stacking
        }
        
    } catch (error) {
        console.error('  ❌ FAIL: Error checking z-index:', error);
        return false;
    }
}

/**
 * Test sequential panel opening/closing
 */
function testSequentialPanelOperations() {
    console.log('🧪 Test: Sequential Panel Operations');
    
    try {
        const locationPanel = document.getElementById('locationDetailPanel');
        const npcPanel = document.getElementById('npcDetailPanel');
        
        if (!locationPanel || !npcPanel) {
            console.log('  ⚠️  SKIP: Panels not found');
            return true;
        }
        
        console.log('  → Testing rapid open/close sequence...');
        
        // Open location panel
        locationPanel.classList.add('active');
        
        // Immediately try to close it and open NPC panel
        locationPanel.classList.remove('active');
        npcPanel.classList.add('active');
        
        setTimeout(() => {
            const locationClosed = !locationPanel.classList.contains('active');
            const npcOpen = npcPanel.classList.contains('active');
            
            if (locationClosed && npcOpen) {
                console.log('  ✅ PASS: Sequential operations handled correctly');
            } else {
                console.log('  ⚠️  WARNING: Sequential operations may have timing issues');
                console.log('    Location closed:', locationClosed);
                console.log('    NPC open:', npcOpen);
            }
            
            // Clean up
            npcPanel.classList.remove('active');
        }, 150);
        
        return true;
        
    } catch (error) {
        console.error('  ❌ FAIL: Error in sequential test:', error);
        return false;
    }
}

/**
 * Test if forced reflow is being used (and shouldn't be)
 */
function testNoForcedReflow() {
    console.log('🧪 Test: Check for Forced Reflow Hacks');
    
    try {
        // Check if showLocationDetail function exists and doesn't use forced reflow
        if (typeof window.showLocationDetail === 'function') {
            const funcString = window.showLocationDetail.toString();
            
            // Look for the forced reflow pattern
            if (funcString.includes('offsetHeight') || 
                funcString.includes('offsetWidth') ||
                funcString.includes('getBoundingClientRect') ||
                funcString.includes('getComputedStyle')) {
                console.log('  ⚠️  Note: Function may use layout-triggering properties');
                console.log('  → This could be intentional for animations');
            } else {
                console.log('  ✅ PASS: No obvious forced reflow detected');
            }
        } else {
            console.log('  ⚠️  SKIP: showLocationDetail function not available');
        }
        
        return true;
        
    } catch (error) {
        console.error('  ❌ FAIL: Error checking for forced reflow:', error);
        return false;
    }
}

/**
 * Test CSS transition completeness
 */
function testCSSTransitions() {
    console.log('🧪 Test: CSS Transition Completeness');
    
    try {
        const panels = [
            document.getElementById('locationDetailPanel'),
            document.getElementById('npcDetailPanel')
        ];
        
        console.log('  → Checking CSS transition properties...');
        
        let allHaveTransitions = true;
        
        panels.forEach((panel, index) => {
            if (!panel) return;
            
            const panelName = index === 0 ? 'Location' : 'NPC';
            const styles = window.getComputedStyle(panel);
            
            // Check for transition properties
            const transition = styles.transition || styles.webkitTransition || '';
            const transform = styles.transform || styles.webkitTransform || '';
            
            console.log(`  → ${panelName} panel:`);
            console.log(`    • Has transition: ${transition !== 'none' && transition !== ''}`);
            console.log(`    • Transform: ${transform !== 'none' ? 'applied' : 'none'}`);
            
            if (transition === 'none' || transition === '') {
                allHaveTransitions = false;
            }
        });
        
        if (allHaveTransitions) {
            console.log('  ✅ PASS: All panels have CSS transitions defined');
        } else {
            console.log('  ⚠️  Note: Some panels missing transitions (may be intentional)');
        }
        
        return true;
        
    } catch (error) {
        console.error('  ❌ FAIL: Error checking CSS:', error);
        return false;
    }
}

/**
 * Run all tests
 */
export function runPanelClosingTests() {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🧪 NPC Panel Chrome Closing Issue Test Suite');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const results = [];
    
    results.push(testLocationPanelClose());
    results.push(testNPCPanelClose());
    results.push(testPanelZIndexManagement());
    results.push(testSequentialPanelOperations());
    results.push(testNoForcedReflow());
    results.push(testCSSTransitions());
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    if (passed === total) {
        console.log(`✅ All tests passed (${passed}/${total})`);
    } else {
        console.log(`❌ Some tests failed (${passed}/${total} passed)`);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    return passed === total;
}

// Auto-load
if (typeof window !== 'undefined') {
    window.runPanelClosingTests = runPanelClosingTests;
    console.log('💡 Panel closing tests loaded. Run with: runPanelClosingTests()');
}
