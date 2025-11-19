# Web App Design Patterns - Enhancement TODO

## 🎯 Overview

This document outlines 4 modern web app design patterns that will improve the LoreWeaver application's architecture, maintainability, and user experience.

---

## Pattern #0: Changelog Display Screen with Semantic Versioning

### 📋 Current Problem
- No way to communicate updates to returning users
- Users unaware of new features and changes
- No version tracking system
- No mechanism to show important updates on first visit after deployment

### ✅ Proposed Solution
Implement a changelog overlay system with semantic versioning (major.minor.patch) that displays on first visit after major/minor updates.

### 🔧 Implementation Plan

#### File: `CHANGELOG.md` (NEW)
```markdown
# Changelog

All notable changes to LoreWeaver will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-11-18

### Added
- Performance optimizations: search debouncing, DOM caching, image preloading
- Filter memoization for faster search results
- Progressive reveal feature for exploration mode

### Changed
- Improved search response time by 60%
- Optimized filter calculations

### Fixed
- Species capitalization consistency across all modules
- Filter state persistence issues
- Search result pagination edge cases

## [1.1.0] - 2025-11-10

### Added
- NPC generator with personality traits
- Location detail exploration
- Flow navigator for quick navigation

### Changed
- Redesigned search interface
- Improved mobile responsiveness

## [1.0.0] - 2025-11-01

### Added
- Initial release
- Encounter generator for D&D 5e
- Environment-based generation
- Export to Markdown and PDF
- Dark/Light theme toggle
```

#### File: `data/version.json` (NEW)
```json
{
  "version": "1.2.0",
  "releaseDate": "2024-11-18",
  "showChangelog": true,
  "minimumVersion": "1.0.0"
}
```

#### File: `assets/js/changelog.js` (NEW)
```javascript
/**
 * Changelog Display with Semantic Versioning
 */

const STORAGE_KEY = 'loreweaver_last_seen_version';

export class VersionManager {
    constructor() {
        this.currentVersion = null;
        this.lastSeenVersion = null;
        this.changelogData = null;
    }
    
    async initialize() {
        // Load current version
        const versionResponse = await fetch('data/version.json');
        const versionData = await versionResponse.json();
        this.currentVersion = versionData.version;
        
        // Get last seen version from localStorage
        this.lastSeenVersion = localStorage.getItem(STORAGE_KEY) || '0.0.0';
        
        // Load changelog
        const changelogResponse = await fetch('CHANGELOG.md');
        const changelogText = await changelogResponse.text();
        this.changelogData = this.parseChangelog(changelogText);
        
        return this;
    }
    
    parseChangelog(markdown) {
        const versions = [];
        const lines = markdown.split('\n');
        let currentVersion = null;
        let currentSection = null;
        
        for (const line of lines) {
            // Match version headers like ## [1.2.0] - 2024-11-18
            const versionMatch = line.match(/##\s*\[(\d+\.\d+\.\d+)\]\s*-\s*(.+)/);
            if (versionMatch) {
                if (currentVersion) {
                    versions.push(currentVersion);
                }
                currentVersion = {
                    version: versionMatch[1],
                    date: versionMatch[2],
                    added: [],
                    changed: [],
                    fixed: [],
                    removed: []
                };
                currentSection = null;
                continue;
            }
            
            // Match section headers
            const sectionMatch = line.match(/###\s*(Added|Changed|Fixed|Removed)/);
            if (sectionMatch && currentVersion) {
                currentSection = sectionMatch[1].toLowerCase();
                continue;
            }
            
            // Match list items
            const itemMatch = line.match(/^-\s*(.+)/);
            if (itemMatch && currentVersion && currentSection) {
                currentVersion[currentSection].push(itemMatch[1]);
            }
        }
        
        if (currentVersion) {
            versions.push(currentVersion);
        }
        
        return versions;
    }
    
    parseVersion(versionString) {
        const [major, minor, patch] = versionString.split('.').map(Number);
        return { major, minor, patch };
    }
    
    shouldShowChangelog() {
        const current = this.parseVersion(this.currentVersion);
        const lastSeen = this.parseVersion(this.lastSeenVersion);
        
        // Show for major or minor version increases
        if (current.major > lastSeen.major) return true;
        if (current.major === lastSeen.major && current.minor > lastSeen.minor) return true;
        
        return false;
    }
    
    getChangesSinceLastVersion() {
        const current = this.parseVersion(this.currentVersion);
        const lastSeen = this.parseVersion(this.lastSeenVersion);
        
        return this.changelogData.filter(version => {
            const v = this.parseVersion(version.version);
            
            // Include if version is newer than last seen
            if (v.major > lastSeen.major) return true;
            if (v.major === lastSeen.major && v.minor > lastSeen.minor) return true;
            if (v.major === lastSeen.major && v.minor === lastSeen.minor && v.patch > lastSeen.patch) return true;
            
            return false;
        });
    }
    
    markChangelogAsSeen() {
        localStorage.setItem(STORAGE_KEY, this.currentVersion);
        this.lastSeenVersion = this.currentVersion;
    }
    
    isVersionNewer(v1, v2) {
        const version1 = this.parseVersion(v1);
        const version2 = this.parseVersion(v2);
        
        if (version1.major !== version2.major) return version1.major > version2.major;
        if (version1.minor !== version2.minor) return version1.minor > version2.minor;
        return version1.patch > version2.patch;
    }
}

export class ChangelogModal {
    constructor(versionManager) {
        this.versionManager = versionManager;
        this.modal = null;
    }
    
    createModal() {
        const changes = this.versionManager.getChangesSinceLastVersion();
        
        // Filter to only major/minor updates
        const majorMinorChanges = changes.filter(version => {
            const v = this.versionManager.parseVersion(version.version);
            const lastSeen = this.versionManager.parseVersion(this.versionManager.lastSeenVersion);
            return v.major > lastSeen.major || 
                   (v.major === lastSeen.major && v.minor > lastSeen.minor);
        });
        
        if (majorMinorChanges.length === 0) return null;
        
        const overlay = document.createElement('div');
        overlay.className = 'changelog-overlay';
        overlay.innerHTML = `
            <div class="changelog-modal">
                <div class="changelog-header">
                    <h2>🎉 What's New in LoreWeaver</h2>
                    <button class="changelog-close" aria-label="Close">&times;</button>
                </div>
                <div class="changelog-content">
                    ${this.renderVersions(majorMinorChanges)}
                </div>
                <div class="changelog-footer">
                    <button class="changelog-btn-primary" id="changelog-got-it">Got it!</button>
                    <a href="CHANGELOG.md" target="_blank" class="changelog-link">View Full Changelog</a>
                </div>
            </div>
        `;
        
        this.modal = overlay;
        this.attachEventListeners();
        
        return overlay;
    }
    
    renderVersions(versions) {
        return versions.map(version => {
            const v = this.versionManager.parseVersion(version.version);
            const badge = v.minor === 0 ? 
                '<span class="version-badge major">MAJOR UPDATE</span>' : 
                '<span class="version-badge minor">NEW FEATURES</span>';
            
            return `
                <div class="changelog-version">
                    <div class="version-header">
                        <h3>Version ${version.version} ${badge}</h3>
                        <span class="version-date">${version.date}</span>
                    </div>
                    ${this.renderSection('Added', version.added, '✨')}
                    ${this.renderSection('Changed', version.changed, '🔄')}
                    ${this.renderSection('Fixed', version.fixed, '🐛')}
                    ${this.renderSection('Removed', version.removed, '🗑️')}
                </div>
            `;
        }).join('');
    }
    
    renderSection(title, items, emoji) {
        if (items.length === 0) return '';
        
        return `
            <div class="changelog-section">
                <h4>${emoji} ${title}</h4>
                <ul>
                    ${items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    attachEventListeners() {
        const closeBtn = this.modal.querySelector('.changelog-close');
        const gotItBtn = this.modal.querySelector('#changelog-got-it');
        
        const close = () => {
            this.versionManager.markChangelogAsSeen();
            this.modal.classList.add('changelog-fade-out');
            setTimeout(() => this.modal.remove(), 300);
        };
        
        closeBtn.addEventListener('click', close);
        gotItBtn.addEventListener('click', close);
        
        // Close on overlay click (but not modal content)
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) close();
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.parentElement) close();
        });
    }
    
    show() {
        document.body.appendChild(this.modal);
        // Trigger animation
        requestAnimationFrame(() => {
            this.modal.classList.add('changelog-show');
        });
    }
}

// Auto-initialize on page load
export async function initializeChangelog() {
    try {
        const versionManager = await new VersionManager().initialize();
        
        if (versionManager.shouldShowChangelog()) {
            const modal = new ChangelogModal(versionManager);
            const element = modal.createModal();
            
            if (element) {
                modal.show();
            } else {
                // No major/minor updates, just mark as seen
                versionManager.markChangelogAsSeen();
            }
        }
    } catch (error) {
        console.error('Failed to load changelog:', error);
    }
}
```

#### File: `assets/css/changelog.css` (NEW)
```css
/**
 * Changelog Modal Styles
 */

.changelog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.changelog-overlay.changelog-show {
    opacity: 1;
}

.changelog-overlay.changelog-fade-out {
    opacity: 0;
}

.changelog-modal {
    background: var(--background, #ffffff);
    color: var(--text-color, #333333);
    border-radius: 16px;
    max-width: 600px;
    max-height: 80vh;
    width: 90%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    transform: translateY(-20px);
    transition: transform 0.3s ease;
}

.changelog-show .changelog-modal {
    transform: translateY(0);
}

.changelog-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.changelog-header h2 {
    margin: 0;
    font-size: 24px;
    color: var(--primary-color, #007AFF);
}

.changelog-close {
    background: none;
    border: none;
    font-size: 32px;
    color: var(--text-muted, #999999);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
}

.changelog-close:hover {
    background: var(--hover-background, #f5f5f5);
}

.changelog-content {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
}

.changelog-version {
    margin-bottom: 32px;
}

.changelog-version:last-child {
    margin-bottom: 0;
}

.version-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 8px;
}

.version-header h3 {
    margin: 0;
    font-size: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.version-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.version-badge.major {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.version-badge.minor {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
}

.version-date {
    font-size: 14px;
    color: var(--text-muted, #999999);
}

.changelog-section {
    margin-bottom: 20px;
}

.changelog-section h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: var(--text-color, #333333);
}

.changelog-section ul {
    margin: 0;
    padding-left: 24px;
}

.changelog-section li {
    margin-bottom: 6px;
    line-height: 1.6;
}

.changelog-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border-color, #e0e0e0);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.changelog-btn-primary {
    background: var(--primary-color, #007AFF);
    color: white;
    border: none;
    padding: 12px 32px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.changelog-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.changelog-btn-primary:active {
    transform: translateY(0);
}

.changelog-link {
    color: var(--primary-color, #007AFF);
    text-decoration: none;
    font-size: 14px;
    transition: opacity 0.2s;
}

.changelog-link:hover {
    opacity: 0.7;
    text-decoration: underline;
}

/* Dark theme support */
[data-theme="dark"] .changelog-modal {
    background: #1e1e1e;
    color: #e0e0e0;
}

[data-theme="dark"] .changelog-close:hover {
    background: #333333;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
    .changelog-modal {
        width: 95%;
        max-height: 90vh;
    }
    
    .changelog-header h2 {
        font-size: 20px;
    }
    
    .changelog-footer {
        flex-direction: column;
        gap: 12px;
    }
    
    .changelog-btn-primary {
        width: 100%;
    }
}
```

#### Integration in `index.html`:
```html
<!-- In <head> -->
<link rel="stylesheet" href="assets/css/changelog.css">

<!-- Before closing </body>, after other scripts -->
<script type="module">
    import { initializeChangelog } from './assets/js/changelog.js';
    
    // Initialize changelog after DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        initializeChangelog();
    });
</script>
```

### 🧪 Test Suite: `tests/test-changelog.js`

```javascript
/**
 * Changelog Display Tests
 */

import { VersionManager, ChangelogModal } from '../assets/js/changelog.js';

export function runChangelogTests() {
    console.log('\n🧪 Testing Changelog System\n');
    
    testVersionParsing();
    testVersionComparison();
    testChangelogParsing();
    testShouldShowChangelog();
    testMajorMinorFiltering();
    testLocalStoragePersistence();
    testModalCreation();
}

function testVersionParsing() {
    console.log('🧪 Test: Version Parsing');
    
    const vm = new VersionManager();
    const version = vm.parseVersion('1.2.3');
    
    if (version.major === 1 && version.minor === 2 && version.patch === 3) {
        console.log('  ✅ PASS: Version parsed correctly');
    } else {
        console.log('  ❌ FAIL: Version parsing failed');
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
    }
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
    } else {
        console.log('  ❌ FAIL: Changelog parsing failed');
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
        return;
    }
    
    // Test minor version increase
    vm.lastSeenVersion = '1.4.0';
    if (!vm.shouldShowChangelog()) {
        console.log('  ❌ FAIL: Should show for minor version increase');
        return;
    }
    
    // Test patch version increase (should NOT show)
    vm.lastSeenVersion = '1.5.0';
    if (vm.shouldShowChangelog()) {
        console.log('  ❌ FAIL: Should NOT show for same version');
        return;
    }
    
    // Test patch only increase (should NOT show)
    vm.currentVersion = '1.5.1';
    vm.lastSeenVersion = '1.5.0';
    if (vm.shouldShowChangelog()) {
        console.log('  ❌ FAIL: Should NOT show for patch-only increase');
        return;
    }
    
    console.log('  ✅ PASS: Changelog display logic correct');
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
    } else {
        console.log(`  ❌ FAIL: Expected 4 versions, got ${changes.length}`);
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
    } else {
        console.log(`  ❌ FAIL: Expected '1.5.0', got '${stored}'`);
    }
    
    // Cleanup
    localStorage.removeItem('loreweaver_last_seen_version');
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
    } else {
        console.log('  ❌ FAIL: Modal creation failed');
    }
}
```

### 📝 Workflow Example

#### When Deploying a New Version:

1. **Update version.json**:
```json
{
  "version": "1.3.0",
  "releaseDate": "2024-12-01",
  "showChangelog": true
}
```

2. **Update CHANGELOG.md**:
```markdown
## [1.3.0] - 2024-12-01

### Added
- New export formats (HTML, JSON)
- Undo/Redo functionality
- Event-based state management

### Changed
- Improved performance by 40%
- Redesigned settings page
```

3. **Commit and Deploy**:
```bash
git add data/version.json CHANGELOG.md
git commit -m "Release v1.3.0: Export formats and undo/redo"
git tag v1.3.0
git push origin main --tags
```

4. **Result**: 
   - Users visiting after update see changelog overlay
   - Only major/minor updates trigger overlay
   - Patch updates (1.3.0 → 1.3.1) don't show overlay

### 🎯 Benefits

- **User Engagement**: Users see what's new immediately
- **Version Control**: Clear semantic versioning system
- **Selective Notifications**: Only show important updates
- **Persistent Tracking**: LocalStorage prevents repeat displays
- **Professional**: Industry-standard changelog format
- **Accessible**: Keyboard navigation, ARIA labels
- **Responsive**: Works on mobile and desktop

### 📊 Success Metrics

- ✅ Changelog displays on first visit after major/minor update
- ✅ Patch updates don't trigger overlay
- ✅ Version persists in localStorage correctly
- ✅ Modal dismissible via button, X, Escape, or overlay click
- ✅ Parses Keep a Changelog format correctly
- ✅ Responsive design works on mobile
- ✅ Dark theme support

---

## Pattern #1: Observer Pattern (PubSub) for State Management

### 📋 Current Problem
- Global state scattered across multiple files (`selectedEnvironment`, `activeFilters`, `currentPage`, etc.)
- Direct function calls between modules create tight coupling
- No centralized way to react to state changes
- Difficult to track which components depend on which state

### ✅ Proposed Solution
Implement a lightweight PubSub (Publish-Subscribe) event system for state management.

### 🔧 Implementation Plan

#### File: `assets/js/event-bus.js` (NEW)
```javascript
/**
 * Simple EventBus for decoupled component communication
 */
class EventBus {
    constructor() {
        this.events = {};
    }
    
    subscribe(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        };
    }
    
    publish(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
    
    // Debug helper
    listSubscriptions() {
        return Object.keys(this.events).map(event => ({
            event,
            subscriberCount: this.events[event].length
        }));
    }
}

export const eventBus = new EventBus();
```

#### Changes Required:
1. **State Updates Publish Events**:
   - `environment:changed` when environment selection changes
   - `filters:updated` when any filter changes
   - `search:completed` when search finishes
   - `page:switched` when navigation changes
   - `theme:toggled` when theme changes

2. **Components Subscribe to Events**:
   - Flow navigator subscribes to `search:completed`
   - Pagination subscribes to `filters:updated`
   - Theme UI subscribes to `theme:toggled`

3. **Benefits**:
   - Loose coupling between modules
   - Easier to add new features without modifying existing code
   - Better testability (can mock event bus)
   - Clear data flow

### 🧪 Test Suite: `tests/test-event-bus.js`

```javascript
/**
 * EventBus Pattern Tests
 */

export function runEventBusTests() {
    console.log('\n🧪 Testing EventBus Pattern\n');
    
    testEventSubscriptionAndPublishing();
    testMultipleSubscribers();
    testUnsubscribe();
    testEventIsolation();
    testDataPassing();
    testMemoryLeakPrevention();
}

function testEventSubscriptionAndPublishing() {
    console.log('🧪 Test: Event Subscription and Publishing');
    
    const testBus = new EventBus();
    let received = false;
    
    testBus.subscribe('test:event', () => {
        received = true;
    });
    
    testBus.publish('test:event');
    
    if (received) {
        console.log('  ✅ PASS: Event received by subscriber');
    } else {
        console.log('  ❌ FAIL: Event not received');
    }
}

function testMultipleSubscribers() {
    console.log('🧪 Test: Multiple Subscribers');
    
    const testBus = new EventBus();
    let count = 0;
    
    testBus.subscribe('test:multi', () => count++);
    testBus.subscribe('test:multi', () => count++);
    testBus.subscribe('test:multi', () => count++);
    
    testBus.publish('test:multi');
    
    if (count === 3) {
        console.log('  ✅ PASS: All 3 subscribers received event');
    } else {
        console.log(`  ❌ FAIL: Expected 3 calls, got ${count}`);
    }
}

function testUnsubscribe() {
    console.log('🧪 Test: Unsubscribe Functionality');
    
    const testBus = new EventBus();
    let count = 0;
    
    const unsubscribe = testBus.subscribe('test:unsub', () => count++);
    
    testBus.publish('test:unsub'); // count = 1
    unsubscribe();
    testBus.publish('test:unsub'); // count should still be 1
    
    if (count === 1) {
        console.log('  ✅ PASS: Unsubscribe prevents further calls');
    } else {
        console.log(`  ❌ FAIL: Expected 1 call, got ${count}`);
    }
}

function testEventIsolation() {
    console.log('🧪 Test: Event Isolation');
    
    const testBus = new EventBus();
    let event1Fired = false;
    let event2Fired = false;
    
    testBus.subscribe('event:one', () => event1Fired = true);
    testBus.subscribe('event:two', () => event2Fired = true);
    
    testBus.publish('event:one');
    
    if (event1Fired && !event2Fired) {
        console.log('  ✅ PASS: Events are properly isolated');
    } else {
        console.log('  ❌ FAIL: Event isolation failed');
    }
}

function testDataPassing() {
    console.log('🧪 Test: Data Passing');
    
    const testBus = new EventBus();
    let receivedData = null;
    
    testBus.subscribe('data:test', (data) => {
        receivedData = data;
    });
    
    const testData = { value: 42, name: 'test' };
    testBus.publish('data:test', testData);
    
    if (receivedData && receivedData.value === 42) {
        console.log('  ✅ PASS: Data passed correctly to subscriber');
    } else {
        console.log('  ❌ FAIL: Data not received correctly');
    }
}

function testMemoryLeakPrevention() {
    console.log('🧪 Test: Memory Leak Prevention');
    
    const testBus = new EventBus();
    const unsubscribers = [];
    
    // Add 100 subscribers
    for (let i = 0; i < 100; i++) {
        const unsub = testBus.subscribe('leak:test', () => {});
        unsubscribers.push(unsub);
    }
    
    const beforeCount = testBus.events['leak:test'].length;
    
    // Unsubscribe all
    unsubscribers.forEach(unsub => unsub());
    
    const afterCount = testBus.events['leak:test'].length;
    
    if (beforeCount === 100 && afterCount === 0) {
        console.log('  ✅ PASS: All subscribers properly cleaned up');
    } else {
        console.log(`  ❌ FAIL: Memory leak detected (${afterCount} subscribers remaining)`);
    }
}
```

### 📝 Integration Example

```javascript
// In app.js
import { eventBus } from './event-bus.js';

export function switchPage(page) {
    // ... existing page switch logic ...
    
    // Publish event
    eventBus.publish('page:switched', { page, timestamp: Date.now() });
}

// In ui.js
import { eventBus } from './event-bus.js';

// Subscribe to page changes
eventBus.subscribe('page:switched', ({ page }) => {
    if (page === 'search') {
        initializeSearchFilters();
    }
});
```

---

## Pattern #2: Command Pattern for Undo/Redo History

### 📋 Current Problem
- No way to undo generated encounters
- Users can't revert filter changes
- No history of search queries
- Difficult to implement "Previous Encounter" functionality

### ✅ Proposed Solution
Implement Command Pattern with history stack for undoable actions.

### 🔧 Implementation Plan

#### File: `assets/js/command-history.js` (NEW)
```javascript
/**
 * Command Pattern for Undo/Redo functionality
 */
class CommandHistory {
    constructor(maxHistorySize = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = maxHistorySize;
    }
    
    execute(command) {
        // Execute the command
        command.execute();
        
        // Remove any "future" commands (after undo)
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        // Add to history
        this.history.push(command);
        this.currentIndex++;
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }
        
        return command;
    }
    
    undo() {
        if (!this.canUndo()) return false;
        
        const command = this.history[this.currentIndex];
        command.undo();
        this.currentIndex--;
        
        return true;
    }
    
    redo() {
        if (!this.canRedo()) return false;
        
        this.currentIndex++;
        const command = this.history[this.currentIndex];
        command.execute();
        
        return true;
    }
    
    canUndo() {
        return this.currentIndex >= 0;
    }
    
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
    
    getHistory() {
        return this.history.slice(0, this.currentIndex + 1);
    }
    
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }
}

// Command classes
export class GenerateEncounterCommand {
    constructor(environment, partyLevel, numLocations) {
        this.environment = environment;
        this.partyLevel = partyLevel;
        this.numLocations = numLocations;
        this.previousEncounter = null;
        this.generatedEncounter = null;
    }
    
    execute() {
        // Store current encounter
        this.previousEncounter = window.currentEncounterData || null;
        
        // Generate new encounter
        this.generatedEncounter = window.generateEncounter();
        
        return this.generatedEncounter;
    }
    
    undo() {
        // Restore previous encounter
        if (this.previousEncounter) {
            window.restoreEncounter(this.previousEncounter);
        }
    }
}

export class FilterChangeCommand {
    constructor(filterType, oldValue, newValue) {
        this.filterType = filterType;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }
    
    execute() {
        window.setFilter(this.filterType, this.newValue);
    }
    
    undo() {
        window.setFilter(this.filterType, this.oldValue);
    }
}

export const commandHistory = new CommandHistory();
```

#### UI Changes:
1. Add Undo/Redo buttons to header
2. Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
3. Show history in dropdown menu
4. Visual indicator when undo/redo is available

### 🧪 Test Suite: `tests/test-command-history.js`

```javascript
/**
 * Command Pattern History Tests
 */

export function runCommandHistoryTests() {
    console.log('\n🧪 Testing Command Pattern History\n');
    
    testCommandExecution();
    testUndoFunctionality();
    testRedoFunctionality();
    testHistoryLimit();
    testCanUndoCanRedo();
    testHistoryClear();
    testCommandChaining();
}

function testCommandExecution() {
    console.log('🧪 Test: Command Execution');
    
    const history = new CommandHistory();
    let executedValue = null;
    
    const testCommand = {
        execute: () => { executedValue = 'executed'; },
        undo: () => { executedValue = null; }
    };
    
    history.execute(testCommand);
    
    if (executedValue === 'executed') {
        console.log('  ✅ PASS: Command executed successfully');
    } else {
        console.log('  ❌ FAIL: Command not executed');
    }
}

function testUndoFunctionality() {
    console.log('🧪 Test: Undo Functionality');
    
    const history = new CommandHistory();
    let value = 0;
    
    const incrementCommand = {
        execute: () => { value++; },
        undo: () => { value--; }
    };
    
    history.execute(incrementCommand);
    history.execute(incrementCommand);
    history.execute(incrementCommand);
    
    if (value !== 3) {
        console.log(`  ❌ FAIL: Expected value 3, got ${value}`);
        return;
    }
    
    history.undo();
    history.undo();
    
    if (value === 1) {
        console.log('  ✅ PASS: Undo restored previous states');
    } else {
        console.log(`  ❌ FAIL: Expected value 1 after undo, got ${value}`);
    }
}

function testRedoFunctionality() {
    console.log('🧪 Test: Redo Functionality');
    
    const history = new CommandHistory();
    let value = 0;
    
    const incrementCommand = {
        execute: () => { value++; },
        undo: () => { value--; }
    };
    
    history.execute(incrementCommand);
    history.execute(incrementCommand);
    history.undo();
    history.redo();
    
    if (value === 2) {
        console.log('  ✅ PASS: Redo re-applied command');
    } else {
        console.log(`  ❌ FAIL: Expected value 2, got ${value}`);
    }
}

function testHistoryLimit() {
    console.log('🧪 Test: History Size Limit');
    
    const history = new CommandHistory(5); // Limit to 5
    const dummyCommand = {
        execute: () => {},
        undo: () => {}
    };
    
    // Execute 10 commands
    for (let i = 0; i < 10; i++) {
        history.execute(dummyCommand);
    }
    
    if (history.history.length === 5) {
        console.log('  ✅ PASS: History limited to max size');
    } else {
        console.log(`  ❌ FAIL: Expected 5 items, got ${history.history.length}`);
    }
}

function testCanUndoCanRedo() {
    console.log('🧪 Test: canUndo/canRedo State');
    
    const history = new CommandHistory();
    const dummyCommand = {
        execute: () => {},
        undo: () => {}
    };
    
    if (history.canUndo() || history.canRedo()) {
        console.log('  ❌ FAIL: Should not be able to undo/redo empty history');
        return;
    }
    
    history.execute(dummyCommand);
    
    if (history.canUndo() && !history.canRedo()) {
        console.log('  ✅ PASS: State correctly indicates undo available');
    } else {
        console.log('  ❌ FAIL: Incorrect state after execution');
    }
    
    history.undo();
    
    if (!history.canUndo() && history.canRedo()) {
        console.log('  ✅ PASS: State correctly indicates redo available');
    } else {
        console.log('  ❌ FAIL: Incorrect state after undo');
    }
}

function testHistoryClear() {
    console.log('🧪 Test: History Clear');
    
    const history = new CommandHistory();
    const dummyCommand = {
        execute: () => {},
        undo: () => {}
    };
    
    history.execute(dummyCommand);
    history.execute(dummyCommand);
    history.clear();
    
    if (history.history.length === 0 && history.currentIndex === -1) {
        console.log('  ✅ PASS: History cleared successfully');
    } else {
        console.log('  ❌ FAIL: History not properly cleared');
    }
}

function testCommandChaining() {
    console.log('🧪 Test: Command Chaining');
    
    const history = new CommandHistory();
    let value = 0;
    
    const addCommand = {
        execute: () => { value += 5; },
        undo: () => { value -= 5; }
    };
    
    const multiplyCommand = {
        execute: () => { value *= 2; },
        undo: () => { value /= 2; }
    };
    
    history.execute(addCommand);    // value = 5
    history.execute(multiplyCommand); // value = 10
    history.undo();                  // value = 5
    history.undo();                  // value = 0
    
    if (value === 0) {
        console.log('  ✅ PASS: Command chain properly undone');
    } else {
        console.log(`  ❌ FAIL: Expected 0, got ${value}`);
    }
}
```

---

## Pattern #3: Strategy Pattern for Export Formats

### 📋 Current Problem
- Export logic tightly coupled in `export.js`
- Hard to add new export formats
- Duplicate code for similar formats
- No way to customize export options

### ✅ Proposed Solution
Implement Strategy Pattern to encapsulate export algorithms.

### 🔧 Implementation Plan

#### File: `assets/js/export-strategies.js` (NEW)
```javascript
/**
 * Strategy Pattern for Export Formats
 */

// Base Strategy Interface
class ExportStrategy {
    constructor(options = {}) {
        this.options = options;
    }
    
    export(encounterData) {
        throw new Error('Export method must be implemented');
    }
    
    getFileName(title) {
        const sanitized = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        return `${sanitized}_${Date.now()}`;
    }
}

// Markdown Strategy
export class MarkdownExportStrategy extends ExportStrategy {
    export(encounterData) {
        let md = `# ${encounterData.title}\n\n`;
        
        if (this.options.includeMetadata) {
            md += this.generateMetadata(encounterData);
        }
        
        md += this.generateContent(encounterData);
        
        return {
            content: md,
            mimeType: 'text/markdown',
            extension: '.md'
        };
    }
    
    generateMetadata(data) {
        return `**Generated:** ${new Date().toLocaleString()}\n\n`;
    }
    
    generateContent(data) {
        // ... existing markdown generation logic ...
        return '## Content\n\n';
    }
}

// JSON Strategy
export class JSONExportStrategy extends ExportStrategy {
    export(encounterData) {
        const jsonData = {
            ...encounterData,
            exported: new Date().toISOString(),
            version: '1.0'
        };
        
        const content = this.options.pretty 
            ? JSON.stringify(jsonData, null, 2)
            : JSON.stringify(jsonData);
        
        return {
            content,
            mimeType: 'application/json',
            extension: '.json'
        };
    }
}

// HTML Strategy
export class HTMLExportStrategy extends ExportStrategy {
    export(encounterData) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${encounterData.title}</title>
    <style>${this.getStyles()}</style>
</head>
<body>
    ${this.generateBody(encounterData)}
</body>
</html>
        `;
        
        return {
            content: html,
            mimeType: 'text/html',
            extension: '.html'
        };
    }
    
    getStyles() {
        return `
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; }
            h1 { color: #007AFF; }
            .section { margin: 20px 0; }
        `;
    }
    
    generateBody(data) {
        return `<h1>${data.title}</h1>`;
    }
}

// PDF Strategy (uses jsPDF)
export class PDFExportStrategy extends ExportStrategy {
    async export(encounterData) {
        // This would use jsPDF library
        const { jsPDF } = window;
        if (!jsPDF) {
            throw new Error('jsPDF library not loaded');
        }
        
        const doc = new jsPDF();
        doc.text(encounterData.title, 10, 10);
        
        return {
            content: doc.output('blob'),
            mimeType: 'application/pdf',
            extension: '.pdf'
        };
    }
}

// Context class
export class ExportManager {
    constructor() {
        this.strategies = new Map();
        this.defaultStrategy = null;
    }
    
    registerStrategy(name, strategy) {
        this.strategies.set(name, strategy);
        
        if (!this.defaultStrategy) {
            this.defaultStrategy = name;
        }
    }
    
    setDefaultStrategy(name) {
        if (!this.strategies.has(name)) {
            throw new Error(`Strategy '${name}' not registered`);
        }
        this.defaultStrategy = name;
    }
    
    async export(encounterData, strategyName = null) {
        const name = strategyName || this.defaultStrategy;
        const strategy = this.strategies.get(name);
        
        if (!strategy) {
            throw new Error(`Strategy '${name}' not found`);
        }
        
        return await strategy.export(encounterData);
    }
    
    getAvailableFormats() {
        return Array.from(this.strategies.keys());
    }
}
```

#### Usage:
```javascript
// In export.js
import { 
    ExportManager, 
    MarkdownExportStrategy,
    JSONExportStrategy,
    HTMLExportStrategy 
} from './export-strategies.js';

const exportManager = new ExportManager();

exportManager.registerStrategy('markdown', new MarkdownExportStrategy());
exportManager.registerStrategy('json', new JSONExportStrategy({ pretty: true }));
exportManager.registerStrategy('html', new HTMLExportStrategy());

// Export encounter
const result = await exportManager.export(encounterData, 'markdown');
downloadFile(result.content, 'encounter' + result.extension, result.mimeType);
```

### 🧪 Test Suite: `tests/test-export-strategies.js`

```javascript
/**
 * Export Strategy Pattern Tests
 */

export function runExportStrategyTests() {
    console.log('\n🧪 Testing Export Strategy Pattern\n');
    
    testStrategyRegistration();
    testMarkdownExport();
    testJSONExport();
    testHTMLExport();
    testStrategySwapping();
    testInvalidStrategy();
    testExportOptions();
}

function testStrategyRegistration() {
    console.log('🧪 Test: Strategy Registration');
    
    const manager = new ExportManager();
    const mockStrategy = {
        export: () => ({ content: 'test', mimeType: 'text/plain', extension: '.txt' })
    };
    
    manager.registerStrategy('test', mockStrategy);
    
    const formats = manager.getAvailableFormats();
    
    if (formats.includes('test')) {
        console.log('  ✅ PASS: Strategy registered successfully');
    } else {
        console.log('  ❌ FAIL: Strategy not registered');
    }
}

function testMarkdownExport() {
    console.log('🧪 Test: Markdown Export');
    
    const strategy = new MarkdownExportStrategy();
    const testData = {
        title: 'Test Encounter',
        description: 'Test description'
    };
    
    const result = strategy.export(testData);
    
    if (result.content.includes('# Test Encounter') && 
        result.extension === '.md' &&
        result.mimeType === 'text/markdown') {
        console.log('  ✅ PASS: Markdown export works correctly');
    } else {
        console.log('  ❌ FAIL: Markdown export failed');
    }
}

function testJSONExport() {
    console.log('🧪 Test: JSON Export');
    
    const strategy = new JSONExportStrategy({ pretty: true });
    const testData = {
        title: 'Test',
        value: 42
    };
    
    const result = strategy.export(testData);
    
    try {
        const parsed = JSON.parse(result.content);
        if (parsed.title === 'Test' && 
            result.extension === '.json' &&
            result.mimeType === 'application/json') {
            console.log('  ✅ PASS: JSON export works correctly');
        } else {
            console.log('  ❌ FAIL: JSON export data incorrect');
        }
    } catch (e) {
        console.log('  ❌ FAIL: Invalid JSON generated');
    }
}

function testHTMLExport() {
    console.log('🧪 Test: HTML Export');
    
    const strategy = new HTMLExportStrategy();
    const testData = {
        title: 'Test Encounter'
    };
    
    const result = strategy.export(testData);
    
    if (result.content.includes('<!DOCTYPE html>') &&
        result.content.includes('<title>Test Encounter</title>') &&
        result.extension === '.html') {
        console.log('  ✅ PASS: HTML export works correctly');
    } else {
        console.log('  ❌ FAIL: HTML export failed');
    }
}

function testStrategySwapping() {
    console.log('🧪 Test: Strategy Swapping');
    
    const manager = new ExportManager();
    const testData = { title: 'Test' };
    
    manager.registerStrategy('format1', {
        export: () => ({ content: 'format1', mimeType: 'text/plain', extension: '.txt' })
    });
    
    manager.registerStrategy('format2', {
        export: () => ({ content: 'format2', mimeType: 'text/plain', extension: '.txt' })
    });
    
    const result1 = manager.export(testData, 'format1');
    const result2 = manager.export(testData, 'format2');
    
    if (result1.content === 'format1' && result2.content === 'format2') {
        console.log('  ✅ PASS: Strategy swapping works');
    } else {
        console.log('  ❌ FAIL: Strategy swapping failed');
    }
}

function testInvalidStrategy() {
    console.log('🧪 Test: Invalid Strategy Handling');
    
    const manager = new ExportManager();
    let errorThrown = false;
    
    try {
        manager.export({}, 'nonexistent');
    } catch (e) {
        errorThrown = true;
    }
    
    if (errorThrown) {
        console.log('  ✅ PASS: Invalid strategy throws error');
    } else {
        console.log('  ❌ FAIL: No error thrown for invalid strategy');
    }
}

function testExportOptions() {
    console.log('🧪 Test: Export Options');
    
    const strategyWithMeta = new MarkdownExportStrategy({ includeMetadata: true });
    const strategyWithoutMeta = new MarkdownExportStrategy({ includeMetadata: false });
    
    const testData = { title: 'Test' };
    
    const result1 = strategyWithMeta.export(testData);
    const result2 = strategyWithoutMeta.export(testData);
    
    const hasMetadata = result1.content.includes('**Generated:**');
    const noMetadata = !result2.content.includes('**Generated:**');
    
    if (hasMetadata && noMetadata) {
        console.log('  ✅ PASS: Export options work correctly');
    } else {
        console.log('  ❌ FAIL: Export options not applied');
    }
}
```

---

## 📊 Priority & Timeline

| Pattern | Priority | Estimated Effort | Impact |
|---------|----------|-----------------|--------|
| Observer Pattern (PubSub) | HIGH | 4-6 hours | High - Improves architecture |
| Command Pattern (Undo/Redo) | MEDIUM | 6-8 hours | High - Major UX improvement |
| Strategy Pattern (Export) | LOW | 3-4 hours | Medium - Better maintainability |

## 🎯 Success Metrics

### Observer Pattern
- ✅ All state changes use event bus
- ✅ No direct module-to-module function calls
- ✅ <100ms event propagation time
- ✅ Test coverage >90%

### Command Pattern
- ✅ Users can undo/redo at least 10 actions
- ✅ Keyboard shortcuts work (Ctrl+Z/Ctrl+Shift+Z)
- ✅ History persists in session storage
- ✅ Memory usage <5MB for 50 commands

### Strategy Pattern
- ✅ Can add new export format in <30 minutes
- ✅ All formats have consistent API
- ✅ Export options work correctly
- ✅ No duplicate code between formats

---

## 🚀 Implementation Order

1. **Start with Observer Pattern** - Foundation for other patterns
2. **Add Command Pattern** - Builds on event system
3. **Refactor Export with Strategy** - Can be done independently

---

## 📝 Notes

- All patterns include comprehensive test suites
- Tests use same structure as existing bug fix tests
- Can be integrated into existing CI pipeline
- Backward compatible with current code
- Each pattern can be implemented incrementally

---

## 🔄 Additional Enhancements

### Version Display in UI
- **Current Issue**: Users cannot see which version of LoreWeaver they're using
- **Proposed Solution**: Display version number in the footer or header
  - Show version from `data/version.json`
  - Format: "v1.3.0" with subtle styling
  - Make it clickable to open changelog modal
  - Consider adding "What's New" badge when new version available

#### Implementation:
```javascript
// In app.js - Add version display
async function displayVersion() {
    const response = await fetch('data/version.json');
    const data = await response.json();
    const versionElement = document.getElementById('app-version');
    if (versionElement) {
        versionElement.textContent = `v${data.version}`;
        versionElement.title = 'Click to view changelog';
        versionElement.style.cursor = 'pointer';
        versionElement.addEventListener('click', () => {
            // Manually trigger changelog modal
            import('./changelog.js').then(module => {
                const modal = new module.ChangelogModal(versionManager);
                const element = modal.createModal();
                if (element) modal.show();
            });
        });
    }
}
```

#### HTML Changes:
```html
<!-- In footer or header -->
<div class="app-version-container">
    <span id="app-version" class="app-version">Loading...</span>
</div>
```

#### CSS:
```css
.app-version {
    font-size: 12px;
    color: var(--text-muted);
    opacity: 0.7;
    transition: opacity 0.2s;
}

.app-version:hover {
    opacity: 1;
    text-decoration: underline;
}
```

### Manual Changelog Access
- **Current Issue**: Users can only see changelog on version updates, no way to view it manually
- **Proposed Solution**: Add "What's New" or "Changelog" link in settings/menu
  - Add button/link in Settings page
  - Add menu item in header navigation (optional)
  - Clicking opens the changelog modal with full history
  - No localStorage check - always shows all versions

#### Implementation:
```javascript
// In ui.js - Add manual changelog trigger
export function showChangelogManual() {
    import('./changelog.js').then(async module => {
        const versionManager = await new module.VersionManager().initialize();
        
        // Show all changes regardless of last seen version
        const tempLastSeen = versionManager.lastSeenVersion;
        versionManager.lastSeenVersion = '0.0.0'; // Show all versions
        
        const modal = new module.ChangelogModal(versionManager);
        const element = modal.createModal();
        
        if (element) {
            modal.show();
        }
        
        // Restore original last seen version
        versionManager.lastSeenVersion = tempLastSeen;
    });
}

// Expose to window
window.showChangelogManual = showChangelogManual;
```

#### HTML Changes:
```html
<!-- In Settings page -->
<div class="settings-section">
    <h3>About</h3>
    <button onclick="showChangelogManual()" class="btn-secondary">
        📋 View Changelog
    </button>
    <p class="settings-description">
        See what's new in LoreWeaver and view version history
    </p>
</div>
```

#### Benefits:
- ✅ Users can see current version at a glance
- ✅ Quick access to changelog without waiting for updates
- ✅ Better transparency about app version
- ✅ Helps users report bugs with version info
- ✅ Improves user trust and communication

#### Test Cases:
1. Version displays correctly on page load
2. Clicking version opens changelog modal
3. Manual changelog shows all versions
4. Changelog closes properly
5. Version updates when version.json changes

---

**Status:** Ready for implementation
**Last Updated:** November 18, 2025
