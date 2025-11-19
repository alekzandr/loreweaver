/**
 * Changelog Display Tests
 */

import { VersionManager, ChangelogModal } from '../assets/js/changelog.js';

export function runChangelogTests() {
    console.log('\n🧪 Testing Changelog System\n');
    
    let passed = 0;
    let failed = 0;
    
    const tests = [
        testVersionParsing,
        testVersionComparison,
        testChangelogParsing,
        testShouldShowChangelog,
        testMajorMinorFiltering,
        testLocalStoragePersistence,
        testModalCreation
    ];
    
    for (const test of tests) {
        try {
            if (test()) {
                passed++;
            } else {
                failed++;
            }
        } catch (error) {
            console.log(`  ❌ EXCEPTION: ${error.message}`);
            failed++;
        }
    }
    
    console.log(`\n📊 Changelog Tests: ${passed} passed, ${failed} failed\n`);
    return failed === 0;
}

function testVersionParsing() {
    console.log('🧪 Test: Version Parsing');
    
    const vm = new VersionManager();
    const version = vm.parseVersion('1.2.3');
    
    if (version.major === 1 && version.minor === 2 && version.patch === 3) {
        console.log('  ✅ PASS: Version parsed correctly');
        return true;
    } else {
        console.log('  ❌ FAIL: Version parsing failed');
        return false;
    }
}

function testVersionComparison() {
    console.log('🧪 Test: Version Comparison');
    
    const vm = new VersionManager();
    
    const tests = [
        { v1: '2.0.0', v2: '1.9.9', expected: true },
        { v1: '1.5.0', v2: '1.4.9', expected: true },
        { v1: '1.0.5', v2: '1.0.4', expected: true },
        { v1: '1.0.0', v2: '1.0.0', expected: false },
        { v1: '1.0.0', v2: '2.0.0', expected: false }
    ];
    
    let allPass = true;
    for (const test of tests) {
        const result = vm.isVersionNewer(test.v1, test.v2);
        if (result !== test.expected) {
            console.log(`  ❌ FAIL: ${test.v1} vs ${test.v2} expected ${test.expected}, got ${result}`);
            allPass = false;
        }
    }
    
    if (allPass) {
        console.log('  ✅ PASS: All version comparisons correct');
        return true;
    }
    return false;
}

function testChangelogParsing() {
    console.log('🧪 Test: Changelog Parsing');
    
    const mockChangelog = `# Changelog

## [1.2.0] - 2024-11-18

### Added
- New feature A
- New feature B

### Changed
- Updated feature C

### Fixed
- Bug fix D
`;
    
    const vm = new VersionManager();
    const parsed = vm.parseChangelog(mockChangelog);
    
    if (parsed.length === 1 &&
        parsed[0].version === '1.2.0' &&
        parsed[0].added.length === 2 &&
        parsed[0].changed.length === 1 &&
        parsed[0].fixed.length === 1) {
        console.log('  ✅ PASS: Changelog parsed correctly');
        return true;
    } else {
        console.log('  ❌ FAIL: Changelog parsing failed');
        console.log(`    Expected: 1 version with 2 added, 1 changed, 1 fixed`);
        console.log(`    Got: ${parsed.length} versions`);
        if (parsed[0]) {
            console.log(`    Version: ${parsed[0].version}, added: ${parsed[0].added.length}, changed: ${parsed[0].changed.length}, fixed: ${parsed[0].fixed.length}`);
        }
        return false;
    }
}

function testShouldShowChangelog() {
    console.log('🧪 Test: Should Show Changelog Logic');
    
    const vm = new VersionManager();
    vm.currentVersion = '1.5.0';
    
    // Test major version increase
    vm.lastSeenVersion = '0.9.0';
    if (!vm.shouldShowChangelog()) {
        console.log('  ❌ FAIL: Should show for major version increase');
        return false;
    }
    
    // Test minor version increase
    vm.lastSeenVersion = '1.4.0';
    if (!vm.shouldShowChangelog()) {
        console.log('  ❌ FAIL: Should show for minor version increase');
        return false;
    }
    
    // Test same version (should NOT show)
    vm.lastSeenVersion = '1.5.0';
    if (vm.shouldShowChangelog()) {
        console.log('  ❌ FAIL: Should NOT show for same version');
        return false;
    }
    
    // Test patch only increase (should NOT show)
    vm.currentVersion = '1.5.1';
    vm.lastSeenVersion = '1.5.0';
    if (vm.shouldShowChangelog()) {
        console.log('  ❌ FAIL: Should NOT show for patch-only increase');
        return false;
    }
    
    console.log('  ✅ PASS: Changelog display logic correct');
    return true;
}

function testMajorMinorFiltering() {
    console.log('🧪 Test: Major/Minor Version Filtering');
    
    const vm = new VersionManager();
    vm.lastSeenVersion = '1.0.0';
    vm.changelogData = [
        { version: '1.2.1', added: ['Patch fix'] },
        { version: '1.2.0', added: ['Minor feature'] },
        { version: '1.1.5', added: ['Patch fix'] },
        { version: '1.1.0', added: ['Minor feature'] }
    ];
    
    const changes = vm.getChangesSinceLastVersion();
    
    // Should include all versions after 1.0.0
    if (changes.length === 4) {
        console.log('  ✅ PASS: Correctly filtered versions');
        return true;
    } else {
        console.log(`  ❌ FAIL: Expected 4 versions, got ${changes.length}`);
        return false;
    }
}

function testLocalStoragePersistence() {
    console.log('🧪 Test: LocalStorage Persistence');
    
    const vm = new VersionManager();
    vm.currentVersion = '1.5.0';
    
    // Clear previous value
    localStorage.removeItem('loreweaver_last_seen_version');
    
    vm.markChangelogAsSeen();
    const stored = localStorage.getItem('loreweaver_last_seen_version');
    
    if (stored === '1.5.0') {
        console.log('  ✅ PASS: Version persisted to localStorage');
        // Cleanup
        localStorage.removeItem('loreweaver_last_seen_version');
        return true;
    } else {
        console.log(`  ❌ FAIL: Expected '1.5.0', got '${stored}'`);
        // Cleanup
        localStorage.removeItem('loreweaver_last_seen_version');
        return false;
    }
}

function testModalCreation() {
    console.log('🧪 Test: Modal Creation');
    
    const vm = new VersionManager();
    vm.currentVersion = '1.5.0';
    vm.lastSeenVersion = '1.0.0';
    vm.changelogData = [
        {
            version: '1.5.0',
            date: '2024-11-18',
            added: ['Feature A'],
            changed: [],
            fixed: [],
            removed: []
        }
    ];
    
    const modal = new ChangelogModal(vm);
    const element = modal.createModal();
    
    if (element &&
        element.classList.contains('changelog-overlay') &&
        element.querySelector('.changelog-modal') &&
        element.querySelector('h2').textContent.includes("What's New")) {
        console.log('  ✅ PASS: Modal created with correct structure');
        return true;
    } else {
        console.log('  ❌ FAIL: Modal creation failed');
        return false;
    }
}

// Run tests if executed directly
if (typeof window !== 'undefined' && window.location.search.includes('test=changelog')) {
    runChangelogTests();
}
