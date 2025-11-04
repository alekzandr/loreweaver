// LoreWeaver - App Initialization
// Main app initialization, theme management, and page switching

import { loadData, dataLoaded } from './data-loader.js';

// Global state
export let selectedEnvironment = 'urban';
export let activeFilters = {
    environment: [],
    locationType: [],
    setting: []
};

/**
 * Initialize the application
 */
export async function initApp() {
    console.log('🚀 Initializing LoreWeaver...');
    
    // Load saved theme
    loadTheme();
    
    // Load progressive reveal setting
    loadProgressiveReveal();
    
    // Load external data files
    console.log('Loading data files...');
    await loadData();
    console.log('Data loading complete. window.dataLoaded =', window.dataLoaded);
    console.log('Data available:', {
        encounterTitles: window.encounterTitles ? Object.keys(window.encounterTitles).length : 0,
        locationObjects: window.locationObjects ? Object.keys(window.locationObjects).length : 0,
        npcData: window.npcData ? 'loaded' : 'missing',
        skillChecksData: window.skillChecksData?.skillChecks?.length || 0,
        dangersData: window.dangersData ? 'loaded' : 'missing'
    });
    
    // Setup Enter key for search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                window.performSearch();
            }
        });
    }
    
    // Setup environment tag selection
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            selectedEnvironment = this.dataset.env;
        });
    });
    
    // Set default active tag
    const urbanTag = document.querySelector('.tag[data-env="urban"]');
    if (urbanTag) urbanTag.classList.add('active');
    
    // Populate NPC dropdowns
    populateNPCDropdowns();
    
    console.log('✅ LoreWeaver initialized');
    console.log('Ready to generate encounters!');
}

/**
 * Populate NPC generator dropdowns from loaded data
 */
function populateNPCDropdowns() {
    if (!window.npcData) return;
    
    // Populate Species dropdown
    const speciesSelect = document.getElementById('npcSpecies');
    if (speciesSelect && window.npcData.species) {
        // Keep the Random option
        speciesSelect.innerHTML = '<option value="random">Random</option>';
        
        // Get all species keys and sort alphabetically
        const speciesKeys = Object.keys(window.npcData.species).sort();
        
        speciesKeys.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            // Capitalize first letter for display
            option.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
            speciesSelect.appendChild(option);
        });
        
        console.log('✓ Populated species dropdown with', speciesKeys.length, 'options');
    }
    
    // Populate Profession dropdown
    const professionSelect = document.getElementById('npcProfession');
    if (professionSelect && window.npcData.professions) {
        // Keep the Random option
        professionSelect.innerHTML = '<option value="random">Random</option>';
        
        // Sort professions alphabetically by name
        const sortedProfessions = [...window.npcData.professions].sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        
        sortedProfessions.forEach(profession => {
            const option = document.createElement('option');
            option.value = profession.name;
            option.textContent = profession.name;
            professionSelect.appendChild(option);
        });
        
        console.log('✓ Populated profession dropdown with', sortedProfessions.length, 'options');
    }
    
    // Populate Alignment dropdown
    const alignmentSelect = document.getElementById('npcAlignment');
    if (alignmentSelect && window.npcData.alignments) {
        // Keep the Random option
        alignmentSelect.innerHTML = '<option value="random">Random</option>';
        
        window.npcData.alignments.forEach(alignment => {
            const option = document.createElement('option');
            option.value = alignment.name;
            option.textContent = alignment.name;
            alignmentSelect.appendChild(option);
        });
        
        console.log('✓ Populated alignment dropdown with', window.npcData.alignments.length, 'options');
    }
    
    // Populate Personality dropdown
    const personalitySelect = document.getElementById('npcPersonality');
    if (personalitySelect && window.npcData.personalities) {
        // Keep the Random option
        personalitySelect.innerHTML = '<option value="random">Random</option>';
        
        // Sort personalities alphabetically by trait
        const sortedPersonalities = [...window.npcData.personalities].sort((a, b) => 
            a.trait.localeCompare(b.trait)
        );
        
        sortedPersonalities.forEach(personality => {
            const option = document.createElement('option');
            option.value = personality.trait;
            option.textContent = personality.trait;
            personalitySelect.appendChild(option);
        });
        
        console.log('✓ Populated personality dropdown with', sortedPersonalities.length, 'options');
    }
}

/**
 * Toggle theme between light and dark
 */
export function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeUI(newTheme);
}

/**
 * Update theme UI elements
 * @param {string} theme - 'light' or 'dark'
 */
function updateThemeUI(theme) {
    const icons = document.querySelectorAll('.theme-icon');
    const themeSwitch = document.getElementById('themeSwitch');
    
    icons.forEach(icon => {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
    
    if (themeSwitch) {
        if (theme === 'dark') {
            themeSwitch.classList.add('active');
        } else {
            themeSwitch.classList.remove('active');
        }
    }
}

/**
 * Load saved theme from localStorage
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
}

/**
 * Toggle progressive reveal setting
 */
export function toggleProgressiveReveal() {
    const currentSetting = localStorage.getItem('progressiveReveal') === 'true';
    const newSetting = !currentSetting;
    
    localStorage.setItem('progressiveReveal', newSetting);
    updateProgressiveRevealUI(newSetting);
}

/**
 * Update progressive reveal UI
 * @param {boolean} enabled - Whether progressive reveal is enabled
 */
function updateProgressiveRevealUI(enabled) {
    const progressiveRevealSwitch = document.getElementById('progressiveRevealSwitch');
    const icon = progressiveRevealSwitch?.querySelector('.theme-icon');
    
    if (progressiveRevealSwitch) {
        if (enabled) {
            progressiveRevealSwitch.classList.add('active');
            if (icon) icon.textContent = '🔓';
        } else {
            progressiveRevealSwitch.classList.remove('active');
            if (icon) icon.textContent = '🔍';
        }
    }
}

/**
 * Load progressive reveal setting from localStorage
 */
function loadProgressiveReveal() {
    const savedSetting = localStorage.getItem('progressiveReveal') === 'true';
    updateProgressiveRevealUI(savedSetting);
}

/**
 * Switch between app pages
 * @param {string} page - Page name ('generate', 'npc', 'search', 'settings')
 */
export function switchPage(page) {
    document.getElementById('generatePage').style.display = 'none';
    document.getElementById('npcPage').style.display = 'none';
    document.getElementById('searchPage').style.display = 'none';
    document.getElementById('settingsPage').style.display = 'none';
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));

    if (page === 'generate') {
        document.getElementById('generatePage').style.display = 'block';
        document.querySelectorAll('.nav-tab')[0].classList.add('active');
    } else if (page === 'npc') {
        document.getElementById('npcPage').style.display = 'block';
        document.querySelectorAll('.nav-tab')[1].classList.add('active');
    } else if (page === 'search') {
        document.getElementById('searchPage').style.display = 'block';
        document.querySelectorAll('.nav-tab')[2].classList.add('active');
        if (window.initializeSearchFilters) window.initializeSearchFilters();
    } else if (page === 'settings') {
        document.getElementById('settingsPage').style.display = 'block';
        document.querySelectorAll('.nav-tab')[3].classList.add('active');
    }
}

/**
 * Apply filters to search results
 */
export function applyFilters() {
    const envFilter = document.getElementById('envFilter').value;
    const locationTypeFilter = document.getElementById('locationTypeFilter').value;
    const settingFilter = document.getElementById('settingFilter').value;
    const planeFilter = document.getElementById('planeFilter').value;

    // Update active filters
    activeFilters = {
        environment: envFilter ? [envFilter] : [],
        locationType: locationTypeFilter ? [locationTypeFilter] : [],
        setting: settingFilter ? [settingFilter] : [],
        plane: planeFilter ? [planeFilter] : []
    };

    // Trigger search if there's a search term
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        window.performSearch();
    }
}

/**
 * Clear all filters
 */
export function clearFilters() {
    document.getElementById('envFilter').value = '';
    document.getElementById('locationTypeFilter').value = '';
    document.getElementById('settingFilter').value = '';
    document.getElementById('planeFilter').value = '';
    
    activeFilters = {
        environment: [],
        locationType: [],
        setting: [],
        plane: []
    };

    // Trigger search if there's a search term
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        window.performSearch();
    }
}

/**
 * Perform search based on input and filters
 */
export function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!searchTerm && !activeFilters.environment.length && !activeFilters.locationType.length && !activeFilters.setting.length && !activeFilters.plane.length) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Enter a search term or select filters to find encounters and locations</p>';
        return;
    }

    let results = [];

    // Search through encounters
    if (window.encounterTitles) {
        Object.entries(window.encounterTitles).forEach(([environment, encounters]) => {
            if (Array.isArray(encounters)) {
                encounters.forEach((encounter, index) => {
                    const matchesSearch = !searchTerm || 
                        encounter.title.toLowerCase().includes(searchTerm) ||
                        (encounter.descriptions && encounter.descriptions.some(desc => desc.toLowerCase().includes(searchTerm))) ||
                        (encounter.tags && encounter.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
                    const matchesFilters = checkEncounterFilters(environment);
                    
                    if (matchesSearch && matchesFilters) {
                        results.push({
                            type: 'encounter',
                            title: encounter.title,
                            key: `${environment}-${index}`,
                            environment: environment,
                            description: encounter.descriptions ? encounter.descriptions[0].substring(0, 150) + '...' : 'No description available',
                            data: encounter
                        });
                    }
                });
            }
        });
    }

    // Search through locations
    if (window.locationObjects) {
        Object.entries(window.locationObjects).forEach(([environment, locationTypes]) => {
            Object.entries(locationTypes).forEach(([locationType, location]) => {
                const locationName = locationType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const matchesSearch = !searchTerm || 
                    locationName.toLowerCase().includes(searchTerm) ||
                    locationType.toLowerCase().includes(searchTerm) ||
                    (location.description && location.description.toLowerCase().includes(searchTerm)) ||
                    (location.tags && location.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
                const matchesFilters = checkLocationFilters(location, environment, locationType);
                
                if (matchesSearch && matchesFilters) {
                    results.push({
                        type: 'location',
                        title: locationName,
                        key: `${environment}-${locationType}`,
                        environment: environment,
                        locationType: locationType,
                        description: location.description || 'No description available',
                        data: location
                    });
                }
            });
        });
    }

    // Display results
    if (results.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No results found. Try different search terms or filters.</p>';
    } else {
        resultsContainer.innerHTML = results.map(result => {
            if (result.type === 'encounter') {
                return renderEncounterResult(result);
            } else {
                return renderLocationResult(result);
            }
        }).join('');
        
        // Attach click handlers for expandable cards
        attachExpandHandlers();
    }
}

/**
 * Render an encounter result with expandable description cards
 */
function renderEncounterResult(result) {
    const encounter = result.data;
    const descriptions = encounter.descriptions || (encounter.description ? [encounter.description] : []);
    const resolutions = encounter.resolutions || [];
    
    const descriptionCards = descriptions.map((desc, index) => `
        <div class="description-card collapsed" data-index="${index}">
            <div class="description-preview">${desc.substring(0, 150)}...</div>
            <div class="description-full" style="display: none;">${desc}</div>
            <div class="expand-hint">Click to expand</div>
        </div>
    `).join('');
    
    const resolutionCards = resolutions.map((res, index) => `
        <div class="resolution-card collapsed" data-index="${index}">
            <div class="resolution-title">${res.title}</div>
            <div class="resolution-preview">${res.description.substring(0, 100)}...</div>
            <div class="resolution-full" style="display: none;">
                <p>${res.description}</p>
                ${res.requirements ? `<p><strong>Requirements:</strong> ${res.requirements}</p>` : ''}
                ${res.rewards ? `<p><strong>Rewards:</strong> ${res.rewards}</p>` : ''}
            </div>
            <div class="expand-hint">Click to expand</div>
        </div>
    `).join('');
    
    return `
        <div class="result-card">
            <div class="result-header">
                <div class="result-title">${result.title}</div>
                <span class="result-type">⚔️ Encounter</span>
            </div>
            <div class="result-environment">${result.environment}</div>
            <div class="descriptions-container">
                <h4>Descriptions:</h4>
                ${descriptionCards}
            </div>
            ${resolutions.length > 0 ? `
                <div class="resolutions-container">
                    <h4>Resolutions:</h4>
                    ${resolutionCards}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Render a location result with expandable description card
 */
function renderLocationResult(result) {
    const location = result.data;
    const description = location.description || '';
    
    return `
        <div class="result-card">
            <div class="result-header">
                <div class="result-title">${result.title}</div>
                <span class="result-type">📍 Location</span>
            </div>
            <div class="result-environment">${result.environment} - ${result.locationType.replace(/_/g, ' ')}</div>
            ${description ? `
                <div class="descriptions-container">
                    <h4>Description:</h4>
                    <div class="description-card collapsed" data-index="0">
                        <div class="description-preview">${description.substring(0, 150)}...</div>
                        <div class="description-full" style="display: none;">${description}</div>
                        <div class="expand-hint">Click to expand</div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Attach click handlers to expandable cards
 */
function attachExpandHandlers() {
    document.querySelectorAll('.description-card, .resolution-card').forEach(card => {
        card.addEventListener('click', function() {
            const preview = this.querySelector('.description-preview, .resolution-preview');
            const full = this.querySelector('.description-full, .resolution-full');
            const hint = this.querySelector('.expand-hint');
            
            if (this.classList.contains('collapsed')) {
                this.classList.remove('collapsed');
                this.classList.add('expanded');
                if (preview) preview.style.display = 'none';
                if (full) full.style.display = 'block';
                if (hint) hint.textContent = 'Click to collapse';
            } else {
                this.classList.remove('expanded');
                this.classList.add('collapsed');
                if (preview) preview.style.display = 'block';
                if (full) full.style.display = 'none';
                if (hint) hint.textContent = 'Click to expand';
            }
        });
    });
}

/**
 * Check if encounter matches active filters
 */
function checkEncounterFilters(environment) {
    if (activeFilters.environment.length && !activeFilters.environment.includes(environment)) {
        return false;
    }
    
    return true;
}

/**
 * Check if location matches active filters
 */
function checkLocationFilters(location, environment, locationType) {
    if (activeFilters.environment.length && !activeFilters.environment.includes(environment)) {
        return false;
    }
    
    if (activeFilters.locationType.length && !activeFilters.locationType.includes(locationType)) {
        return false;
    }
    
    if (activeFilters.setting.length) {
        const locationTags = location.tags || [];
        if (!locationTags.some(tag => activeFilters.setting.includes(tag))) {
            return false;
        }
    }
    
    // TODO: Add plane filter check once plane data is added to locations
    if (activeFilters.plane && activeFilters.plane.length && location.plane) {
        if (!activeFilters.plane.includes(location.plane)) {
            return false;
        }
    }
    
    return true;
}

// Expose functions to window for HTML onclick handlers
window.initApp = initApp;
window.toggleTheme = toggleTheme;
window.switchPage = switchPage;
window.toggleProgressiveReveal = toggleProgressiveReveal;
window.performSearch = performSearch;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
