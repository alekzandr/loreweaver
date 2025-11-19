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
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.parentElement) {
                close();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
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

// Expose for manual testing
if (typeof window !== 'undefined') {
    window.VersionManager = VersionManager;
    window.ChangelogModal = ChangelogModal;
}
