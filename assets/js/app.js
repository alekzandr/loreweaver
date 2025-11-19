// LoreWeaver - App Initialization
// Main app initialization, theme management, and page switching

import { loadData } from './data-loader.js';
import { debounce } from './utils.js';
import { eventBus, Events } from './event-bus.js';

// Global state
export let selectedEnvironment = 'urban';
export let activeFilters = {
    type: '',
    environment: [],
    locationType: [],
    setting: [],
    plane: []
};

// Pagination state
let currentPage = 1;
let itemsPerPage = 5;
let allResults = [];

// Filter calculation cache
let filterCache = {
    lastDataTimestamp: null,
    typeCountsCache: null,
    optionsCache: {}
};

// DOM element cache
let domCache = {
    // Pages
    generatePage: null,
    npcPage: null,
    searchPage: null,
    settingsPage: null,
    // Search elements
    searchInput: null,
    searchResults: null,
    // Filter elements
    typeFilter: null,
    envFilter: null,
    locationTypeFilter: null,
    settingFilter: null,
    planeFilter: null,
    // NPC elements
    npcSpecies: null,
    npcProfession: null,
    npcAlignment: null,
    npcPersonality: null,
    // Settings
    themeSwitch: null,
    progressiveRevealSwitch: null,
    // Pagination
    itemsPerPageTop: null,
    itemsPerPageBottom: null
};

/**
 * Cache DOM elements for reuse
 */
function cacheDOMElements() {
    // Pages
    domCache.generatePage = document.getElementById('generatePage');
    domCache.npcPage = document.getElementById('npcPage');
    domCache.searchPage = document.getElementById('searchPage');
    domCache.settingsPage = document.getElementById('settingsPage');
    
    // Search elements
    domCache.searchInput = document.getElementById('searchInput');
    domCache.searchResults = document.getElementById('searchResults');
    
    // Filter elements
    domCache.typeFilter = document.getElementById('typeFilter');
    domCache.envFilter = document.getElementById('envFilter');
    domCache.locationTypeFilter = document.getElementById('locationTypeFilter');
    domCache.settingFilter = document.getElementById('settingFilter');
    domCache.planeFilter = document.getElementById('planeFilter');
    
    // NPC elements
    domCache.npcSpecies = document.getElementById('npcSpecies');
    domCache.npcProfession = document.getElementById('npcProfession');
    domCache.npcAlignment = document.getElementById('npcAlignment');
    domCache.npcPersonality = document.getElementById('npcPersonality');
    
    // Settings
    domCache.themeSwitch = document.getElementById('themeSwitch');
    domCache.progressiveRevealSwitch = document.getElementById('progressiveRevealSwitch');
    
    // Pagination
    domCache.itemsPerPageTop = document.getElementById('itemsPerPageTop');
    domCache.itemsPerPageBottom = document.getElementById('itemsPerPageBottom');
}

/**
 * Initialize the application
 */
export async function initApp() {
    console.log('🚀 Initializing LoreWeaver...');
    
    // Cache DOM elements
    cacheDOMElements();
    
    // Show loading indicator on generate button
    const generateBtns = document.querySelectorAll('button[onclick*="generateEncounter"]');
    generateBtns.forEach(btn => {
        btn.disabled = true;
        btn.textContent = '⏳ Loading data...';
    });
    
    // Disable NPC generate button
    const npcGenerateBtn = document.querySelector('button[onclick*="generateNPC"]');
    if (npcGenerateBtn) {
        npcGenerateBtn.disabled = true;
    }
    
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
    
    // Re-enable generate buttons after data loads
    if (window.dataLoaded) {
        generateBtns.forEach(btn => {
            btn.disabled = false;
            // Restore original button text by checking for dice icon
            const hasDiceIcon = btn.querySelector('.dice-icon');
            if (hasDiceIcon) {
                btn.innerHTML = '<img src="assets/img/d20.png" alt="dice" class="dice-icon"> Generate Encounter';
            } else {
                btn.textContent = 'Generate';
            }
        });
        
        if (npcGenerateBtn) {
            npcGenerateBtn.disabled = false;
        }
    } else {
        console.error('❌ Data failed to load properly');
        generateBtns.forEach(btn => {
            btn.textContent = '❌ Data load failed - Refresh page';
        });
    }
    
    // Setup search input with debouncing
    if (domCache.searchInput) {
        // Create debounced version of performSearch (300ms delay)
        const debouncedSearch = debounce(window.performSearch, 300);
        
        // Listen for input events (typing)
        domCache.searchInput.addEventListener('input', debouncedSearch);
        
        // Keep Enter key for immediate search
        domCache.searchInput.addEventListener('keypress', function(e) {
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
    
    // Set initial page context for undo/redo
    window.currentPage = 'generate';
    
    console.log('✅ LoreWeaver initialized');
    console.log('Ready to generate encounters!');
}

/**
 * Populate NPC generator dropdowns from loaded data
 */
function populateNPCDropdowns() {
    if (!window.npcData || !window.dataLoaded) {
        console.warn('NPC data not loaded yet, skipping dropdown population');
        return;
    }
    
    // Populate Species dropdown
    if (domCache.npcSpecies && window.npcData.species) {
        // Keep the Random option
        domCache.npcSpecies.innerHTML = '<option value="random">Random</option>';
        
        // Get all species keys and sort alphabetically
        const speciesKeys = Object.keys(window.npcData.species).sort();
        
        speciesKeys.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            // Capitalize first letter for display
            option.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');
            domCache.npcSpecies.appendChild(option);
        });
        
        console.log('✓ Populated species dropdown with', speciesKeys.length, 'options');
    }
    
    // Populate Profession dropdown
    if (domCache.npcProfession && window.npcData.professions) {
        // Keep the Random option
        domCache.npcProfession.innerHTML = '<option value="random">Random</option>';
        
        // Sort professions alphabetically by name
        const sortedProfessions = [...window.npcData.professions].sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        
        sortedProfessions.forEach(profession => {
            const option = document.createElement('option');
            option.value = profession.name;
            option.textContent = profession.name;
            domCache.npcProfession.appendChild(option);
        });
        
        console.log('✓ Populated profession dropdown with', sortedProfessions.length, 'options');
    }
    
    // Populate Alignment dropdown
    if (domCache.npcAlignment && window.npcData.alignments) {
        // Keep the Random option
        domCache.npcAlignment.innerHTML = '<option value="random">Random</option>';
        
        window.npcData.alignments.forEach(alignment => {
            const option = document.createElement('option');
            option.value = alignment.name;
            option.textContent = alignment.name;
            domCache.npcAlignment.appendChild(option);
        });
        
        console.log('✓ Populated alignment dropdown with', window.npcData.alignments.length, 'options');
    }
    
    // Populate Personality dropdown
    if (domCache.npcPersonality && window.npcData.personalities) {
        // Keep the Random option
        domCache.npcPersonality.innerHTML = '<option value="random">Random</option>';
        
        // Sort personalities alphabetically by trait
        const sortedPersonalities = [...window.npcData.personalities].sort((a, b) => 
            a.trait.localeCompare(b.trait)
        );
        
        sortedPersonalities.forEach(personality => {
            const option = document.createElement('option');
            option.value = personality.trait;
            option.textContent = personality.trait;
            domCache.npcPersonality.appendChild(option);
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
    
    try {
        localStorage.setItem('theme', newTheme);
    } catch (e) {
        console.warn('Could not save theme preference:', e);
        // Non-critical error, continue without saving
    }
    
    updateThemeUI(newTheme);
    
    // Publish theme toggled event
    eventBus.publish(Events.THEME_TOGGLED, { 
        theme: newTheme,
        timestamp: Date.now() 
    });
}

/**
 * Update theme UI elements
 * @param {string} theme - 'light' or 'dark'
 */
function updateThemeUI(theme) {
    const icons = document.querySelectorAll('.theme-icon');
    
    icons.forEach(icon => {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    });
    
    if (domCache.themeSwitch) {
        if (theme === 'dark') {
            domCache.themeSwitch.classList.add('active');
        } else {
            domCache.themeSwitch.classList.remove('active');
        }
    }
}

/**
 * Load saved theme from localStorage
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeUI(savedTheme);
}

/**
 * Toggle progressive reveal setting
 */
export function toggleProgressiveReveal() {
    const currentSetting = localStorage.getItem('progressiveReveal') === 'true';
    const newSetting = !currentSetting;
    
    try {
        localStorage.setItem('progressiveReveal', newSetting);
    } catch (e) {
        console.warn('Could not save progressive reveal preference:', e);
        // Non-critical error, continue without saving
    }
    
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
    domCache.generatePage.style.display = 'none';
    domCache.npcPage.style.display = 'none';
    domCache.searchPage.style.display = 'none';
    domCache.settingsPage.style.display = 'none';
    
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));

    // Set current page for context-aware undo/redo
    window.currentPage = page;

    if (page === 'generate') {
        domCache.generatePage.style.display = 'block';
        document.querySelectorAll('.nav-tab')[0].classList.add('active');
    } else if (page === 'npc') {
        domCache.npcPage.style.display = 'block';
        document.querySelectorAll('.nav-tab')[1].classList.add('active');
    } else if (page === 'search') {
        domCache.searchPage.style.display = 'block';
        document.querySelectorAll('.nav-tab')[2].classList.add('active');
        if (window.initializeSearchFilters) window.initializeSearchFilters();
    } else if (page === 'settings') {
        domCache.settingsPage.style.display = 'block';
        document.querySelectorAll('.nav-tab')[3].classList.add('active');
    }
    
    // Publish page switched event
    eventBus.publish(Events.PAGE_SWITCHED, { page, timestamp: Date.now() });
}

/**
 * Handle environment filter change
 */
export function onEnvironmentChange() {
    onFilterChange();
}

/**
 * Handle any filter change - update all dependent filters
 */
export function onFilterChange() {
    updateAllFilters();
    applyFilters();
}

/**
 * Apply filters to search results
 */
export function applyFilters() {
    const typeFilter = domCache.typeFilter.value;
    const envFilter = domCache.envFilter.value;
    const locationTypeFilter = domCache.locationTypeFilter.value;
    const settingFilter = domCache.settingFilter.value;
    const planeFilter = domCache.planeFilter.value;

    // Update active filters
    activeFilters = {
        type: typeFilter,
        environment: envFilter ? [envFilter] : [],
        locationType: locationTypeFilter ? [locationTypeFilter] : [],
        setting: settingFilter ? [settingFilter] : [],
        plane: planeFilter ? [planeFilter] : []
    };

    // Trigger search if there's a search term
    if (domCache.searchInput && domCache.searchInput.value.trim()) {
        window.performSearch();
    }
}

/**
 * Update all filter dropdowns based on current selections
 */
function updateAllFilters() {
    if (!window.locationObjects) return;
    
    // Check if data has changed - invalidate cache if so
    const currentTimestamp = window.dataLoadedTimestamp || Date.now();
    if (filterCache.lastDataTimestamp !== currentTimestamp) {
        filterCache.lastDataTimestamp = currentTimestamp;
        filterCache.typeCountsCache = null;
        filterCache.optionsCache = {};
    }
    
    // Get current selections from cached elements
    const currentType = domCache.typeFilter.value;
    const currentEnv = domCache.envFilter.value;
    const currentLocationType = domCache.locationTypeFilter.value;
    const currentSetting = domCache.settingFilter.value;
    
    // Helper function to collect available options with counts, excluding the filter being updated
    function collectOptionsWithCounts(excludeFilter) {
        const environmentCounts = {};
        const locationTypeCounts = {};
        const settingCounts = {};
        
        // If type is "encounter", count encounters by environment
        if (currentType === 'encounter') {
            if (window.encounterTitles) {
                Object.entries(window.encounterTitles).forEach(([env, encounters]) => {
                    environmentCounts[env] = (environmentCounts[env] || 0) + encounters.length;
                });
            }
        } 
        // If type is "location" or no type filter, process locations
        else if (!currentType || currentType === 'location') {
            Object.entries(window.locationObjects).forEach(([env, locationTypes_]) => {
                Object.entries(locationTypes_).forEach(([locType, locData]) => {
                    // Check if this location matches current filters (excluding the one being updated)
                    const matchesEnv = excludeFilter === 'environment' || !currentEnv || env === currentEnv;
                    const matchesLocType = excludeFilter === 'locationType' || !currentLocationType || locType === currentLocationType;
                    const matchesSetting = excludeFilter === 'setting' || !currentSetting || (locData.tags && locData.tags.includes(currentSetting));
                    
                    if (matchesEnv && matchesLocType && matchesSetting) {
                        environmentCounts[env] = (environmentCounts[env] || 0) + 1;
                        locationTypeCounts[locType] = (locationTypeCounts[locType] || 0) + 1;
                        if (locData.tags) {
                            locData.tags.forEach(tag => {
                                settingCounts[tag] = (settingCounts[tag] || 0) + 1;
                            });
                        }
                    }
                });
            });
        }
        
        // If showing both types, also count encounters for environment
        if (!currentType) {
            if (window.encounterTitles) {
                Object.entries(window.encounterTitles).forEach(([env, encounters]) => {
                    const matchesEnv = excludeFilter === 'environment' || !currentEnv || env === currentEnv;
                    if (matchesEnv) {
                        environmentCounts[env] = (environmentCounts[env] || 0) + encounters.length;
                    }
                });
            }
        }
        
        return { environmentCounts, locationTypeCounts, settingCounts };
    }
    
    // Helper function to count total items for Type filter
    function getTypeCounts() {
        // Return cached value if available
        const cacheKey = `type-${currentEnv}-${currentLocationType}-${currentSetting}`;
        if (filterCache.optionsCache[cacheKey]) {
            return filterCache.optionsCache[cacheKey];
        }
        
        let encounterCount = 0;
        let locationCount = 0;
        
        // Count encounters
        if (window.encounterTitles) {
            Object.entries(window.encounterTitles).forEach(([env, encounters]) => {
                const matchesEnv = !currentEnv || env === currentEnv;
                if (matchesEnv) {
                    encounterCount += encounters.length;
                }
            });
        }
        
        // Count locations
        Object.entries(window.locationObjects).forEach(([env, locationTypes_]) => {
            Object.entries(locationTypes_).forEach(([locType, locData]) => {
                const matchesEnv = !currentEnv || env === currentEnv;
                const matchesLocType = !currentLocationType || locType === currentLocationType;
                const matchesSetting = !currentSetting || (locData.tags && locData.tags.includes(currentSetting));
                
                if (matchesEnv && matchesLocType && matchesSetting) {
                    locationCount++;
                }
            });
        });
        
        const result = { encounterCount, locationCount };
        // Cache the result
        filterCache.optionsCache[cacheKey] = result;
        return result;
    }
    
    // Update Type filter with counts
    const typeCounts = getTypeCounts();
    const currentTypeValue = domCache.typeFilter.value;
    domCache.typeFilter.innerHTML = `
        <option value="">All Types (${typeCounts.encounterCount + typeCounts.locationCount})</option>
        <option value="encounter">Encounters Only (${typeCounts.encounterCount})</option>
        <option value="location">Locations Only (${typeCounts.locationCount})</option>
    `;
    domCache.typeFilter.value = currentTypeValue;
    
    // Update environment dropdown (exclude environment filter when collecting)
    const counts = collectOptionsWithCounts('environment');
    const totalEnvCount = Object.values(counts.environmentCounts).reduce((sum, count) => sum + count, 0);
    domCache.envFilter.innerHTML = `<option value="">All Environments (${totalEnvCount})</option>`;
    Array.from(Object.keys(counts.environmentCounts)).sort().forEach(env => {
        const option = document.createElement('option');
        option.value = env;
        option.textContent = `${env.charAt(0).toUpperCase() + env.slice(1)} (${counts.environmentCounts[env]})`;
        if (env === currentEnv) option.selected = true;
        domCache.envFilter.appendChild(option);
    });
    
    // Update location type dropdown (exclude locationType filter when collecting)
    if (currentType !== 'encounter') {
        const locTypeCounts = collectOptionsWithCounts('locationType');
        const totalLocTypeCount = Object.values(locTypeCounts.locationTypeCounts).reduce((sum, count) => sum + count, 0);
        domCache.locationTypeFilter.innerHTML = `<option value="">All Location Types (${totalLocTypeCount})</option>`;
        Array.from(Object.keys(locTypeCounts.locationTypeCounts)).sort().forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = `${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} (${locTypeCounts.locationTypeCounts[type]})`;
            if (type === currentLocationType) option.selected = true;
            domCache.locationTypeFilter.appendChild(option);
        });
        domCache.locationTypeFilter.disabled = false;
    } else {
        domCache.locationTypeFilter.innerHTML = '<option value="">All Location Types</option>';
        domCache.locationTypeFilter.disabled = true;
    }
    
    // Update setting dropdown (exclude setting filter when collecting)
    if (currentType !== 'encounter') {
        const settingCounts = collectOptionsWithCounts('setting');
        const totalSettingCount = Object.values(settingCounts.settingCounts).reduce((sum, count) => sum + count, 0);
        domCache.settingFilter.innerHTML = `<option value="">All Settings (${totalSettingCount})</option>`;
        Array.from(Object.keys(settingCounts.settingCounts)).sort().forEach(setting => {
            const option = document.createElement('option');
            option.value = setting;
            option.textContent = `${setting.charAt(0).toUpperCase() + setting.slice(1)} (${settingCounts.settingCounts[setting]})`;
            if (setting === currentSetting) option.selected = true;
            domCache.settingFilter.appendChild(option);
        });
        domCache.settingFilter.disabled = false;
    } else {
        domCache.settingFilter.innerHTML = '<option value="">All Settings</option>';
        domCache.settingFilter.disabled = true;
    }
    
    // Publish filters updated event
    eventBus.publish(Events.FILTERS_UPDATED, { 
        filters: activeFilters,
        timestamp: Date.now() 
    });
}

/**
 * Clear all filters
 */
export function clearFilters() {
    domCache.typeFilter.value = '';
    domCache.envFilter.value = '';
    domCache.locationTypeFilter.value = '';
    domCache.settingFilter.value = '';
    domCache.planeFilter.value = '';
    
    activeFilters = {
        type: '',
        environment: [],
        locationType: [],
        setting: [],
        plane: []
    };
    
    // Publish filters cleared event
    eventBus.publish(Events.FILTERS_CLEARED, { timestamp: Date.now() });

    // Reset dependent dropdowns to show all options
    if (window.initializeSearchFilters) {
        window.initializeSearchFilters();
    }

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
    // Check if data is loaded
    if (!window.dataLoaded) {
        if (domCache.searchResults) {
            domCache.searchResults.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">⏳ Data is still loading. Please wait a moment...</p>';
        }
        return;
    }
    
    // Publish search started event
    const searchTerm = domCache.searchInput.value.toLowerCase().trim();
    eventBus.publish(Events.SEARCH_STARTED, { searchTerm, timestamp: Date.now() });

    let results = [];

    // Search through encounters (only if type filter allows)
    if (window.encounterTitles && (!activeFilters.type || activeFilters.type === 'encounter')) {
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

    // Search through locations (only if type filter allows)
    if (window.locationObjects && (!activeFilters.type || activeFilters.type === 'location')) {
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

    // Store results and reset to first page
    allResults = results;
    currentPage = 1;
    
    // Publish search completed event
    eventBus.publish(Events.SEARCH_COMPLETED, { 
        searchTerm, 
        resultCount: results.length,
        timestamp: Date.now() 
    });
    
    // Display paginated results
    renderPaginatedResults();
}

/**
 * Render paginated results
 */
function renderPaginatedResults() {
    const resultsContainer = document.getElementById('searchResults');
    
    if (allResults.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No results found. Try different search terms or filters.</p>';
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(allResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, allResults.length);
    const paginatedResults = allResults.slice(startIndex, endIndex);
    
    // Count encounters and locations
    const encounterCount = allResults.filter(r => r.type === 'encounter').length;
    const locationCount = allResults.filter(r => r.type === 'location').length;
    
    const resultSummary = `
        <div class="result-summary">
            <span class="result-count">Found ${allResults.length} result${allResults.length !== 1 ? 's' : ''}</span>
            <span class="result-breakdown">
                ${encounterCount > 0 ? `<span class="count-badge encounter-badge">${encounterCount} Encounter${encounterCount !== 1 ? 's' : ''}</span>` : ''}
                ${locationCount > 0 ? `<span class="count-badge location-badge">${locationCount} Location${locationCount !== 1 ? 's' : ''}</span>` : ''}
            </span>
        </div>
    `;
    
    // Pagination controls (top)
    const paginationControls = `
        <div class="pagination-controls">
            <div class="pagination-info">
                Showing ${startIndex + 1}-${endIndex} of ${allResults.length}
            </div>
            <div class="pagination-buttons">
                <button class="pagination-btn" onclick="window.previousPage()" ${currentPage === 1 ? 'disabled' : ''}>
                    ‹
                </button>
                <span class="pagination-page">${currentPage} / ${totalPages}</span>
                <button class="pagination-btn" onclick="window.nextPage()" ${currentPage === totalPages ? 'disabled' : ''}>
                    ›
                </button>
            </div>
            <div class="pagination-per-page">
                <label for="itemsPerPageTop">Show:</label>
                <select id="itemsPerPageTop" onchange="window.changeItemsPerPage(this.value)">
                    <option value="5" ${itemsPerPage === 5 ? 'selected' : ''}>5</option>
                    <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10</option>
                    <option value="15" ${itemsPerPage === 15 ? 'selected' : ''}>15</option>
                    <option value="20" ${itemsPerPage === 20 ? 'selected' : ''}>20</option>
                </select>
            </div>
        </div>
    `;
    
    // Pagination controls (bottom)
    const bottomPaginationControls = `
        <div class="pagination-controls bottom">
            <div class="pagination-info">
                Showing ${startIndex + 1}-${endIndex} of ${allResults.length}
            </div>
            <div class="pagination-buttons">
                <button class="pagination-btn" onclick="window.previousPage()" ${currentPage === 1 ? 'disabled' : ''}>
                    ‹
                </button>
                <span class="pagination-page">${currentPage} / ${totalPages}</span>
                <button class="pagination-btn" onclick="window.nextPage()" ${currentPage === totalPages ? 'disabled' : ''}>
                    ›
                </button>
            </div>
            <div class="pagination-per-page">
                <label for="itemsPerPageBottom">Show:</label>
                <select id="itemsPerPageBottom" onchange="window.changeItemsPerPage(this.value)">
                    <option value="5" ${itemsPerPage === 5 ? 'selected' : ''}>5</option>
                    <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10</option>
                    <option value="15" ${itemsPerPage === 15 ? 'selected' : ''}>15</option>
                    <option value="20" ${itemsPerPage === 20 ? 'selected' : ''}>20</option>
                </select>
            </div>
        </div>
    `;
    
    const resultsHTML = paginatedResults.map(result => {
        if (result.type === 'encounter') {
            return renderEncounterResult(result);
        } else {
            return renderLocationResult(result);
        }
    }).join('');
    
    resultsContainer.innerHTML = resultSummary + paginationControls + resultsHTML + bottomPaginationControls;
    
    // Attach click handlers for expandable cards
    attachExpandHandlers();
    
    // Scroll to top of results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            <div class="result-actions">
                <button class="result-btn use-for-gen-btn" 
                        data-environment="${result.environment}" 
                        data-encounter='${JSON.stringify(encounter).replace(/'/g, '&apos;')}'>
                    <img src="assets/img/d20.png" alt="dice" class="dice-icon"> Use for Generation
                </button>
            </div>
        </div>
    `;
}

/**
 * Render a location result with expandable description card
 */
function renderLocationResult(result) {
    const location = result.data;
    const description = location.description || '';
    const primary = location.primary || [];
    const secondary = location.secondary || [];
    const tertiary = location.tertiary || [];
    
    const primaryList = primary.length > 0 ? primary.map(item => `<li>${item}</li>`).join('') : '<li class="empty-list">None listed</li>';
    const secondaryList = secondary.length > 0 ? secondary.map(item => `<li>${item}</li>`).join('') : '<li class="empty-list">None listed</li>';
    const tertiaryList = tertiary.length > 0 ? tertiary.map(item => `<li>${item}</li>`).join('') : '<li class="empty-list">None listed</li>';
    
    return `
        <div class="result-card location-result">
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
            <div class="location-features">
                <div class="feature-column">
                    <h4>Primary Features</h4>
                    <ul>${primaryList}</ul>
                </div>
                <div class="feature-column">
                    <h4>Secondary Features</h4>
                    <ul>${secondaryList}</ul>
                </div>
                <div class="feature-column">
                    <h4>Discoveries</h4>
                    <ul>${tertiaryList}</ul>
                </div>
            </div>
        </div>
    `;
}

/**
 * Attach click handlers to expandable cards
 */
function attachExpandHandlers() {
    // Attach handlers for expandable cards
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
    
    // Attach handlers for "Use for Generation" buttons
    document.querySelectorAll('.use-for-gen-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const environment = this.getAttribute('data-environment');
            const encounterJson = this.getAttribute('data-encounter');
            
            if (environment && encounterJson) {
                try {
                    const encounter = JSON.parse(encounterJson.replace(/&apos;/g, "'"));
                    window.useEncounterForGeneration(environment, encounter);
                } catch (error) {
                    console.error('Error parsing encounter data:', error);
                    alert('Error loading encounter. Please try again.');
                }
            }
        });
    });
}

/**
 * Check if encounter matches active filters
 */
function checkEncounterFilters(environment) {
    // If location-specific filters are set, encounters should not match
    if (activeFilters.locationType.length || activeFilters.setting.length) {
        return false;
    }
    
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

/**
 * Go to next page
 */
export function nextPage() {
    const totalPages = Math.ceil(allResults.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderPaginatedResults();
    }
}

/**
 * Go to previous page
 */
export function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderPaginatedResults();
    }
}

/**
 * Change items per page
 */
export function changeItemsPerPage(value) {
    itemsPerPage = parseInt(value);
    currentPage = 1; // Reset to first page
    renderPaginatedResults();
    
    // Sync both dropdowns
    document.getElementById('itemsPerPageTop').value = value;
    document.getElementById('itemsPerPageBottom').value = value;
}

/**
 * Use an encounter from search results for generation
 * @param {string} environment - The environment of the encounter
 * @param {object} encounterData - The encounter data object
 */
export function useEncounterForGeneration(environment, encounterData) {
    console.log('🎲 Using encounter for generation:', encounterData.title);
    
    // Store the preselected encounter
    window.preselectedEncounter = {
        environment: environment,
        template: encounterData
    };
    
    // Update the environment selector
    window.selectedEnvironment = environment;
    const envSelect = document.getElementById('environmentSelect');
    if (envSelect) {
        envSelect.value = environment;
    }
    
    // Clear any existing seed to allow for randomization
    const seedInput = document.getElementById('encounterSeed');
    if (seedInput) {
        seedInput.value = '';
    }
    
    // Switch to the Generate page
    switchPage('generate');
    
    // Show a notification banner
    showEncounterSelectedBanner(encounterData.title);
    
    console.log('✅ Generate page prepared with encounter:', encounterData.title);
}

/**
 * Show a temporary banner indicating which encounter was selected
 * @param {string} encounterTitle - The title of the selected encounter
 */
function showEncounterSelectedBanner(encounterTitle) {
    // Remove any existing banner
    const existingBanner = document.getElementById('encounterSelectedBanner');
    if (existingBanner) {
        existingBanner.remove();
    }
    
    // Create and show the banner
    const banner = document.createElement('div');
    banner.id = 'encounterSelectedBanner';
    banner.className = 'encounter-selected-banner';
    banner.innerHTML = `
        <div class="banner-content">
            <span class="banner-icon">✨</span>
            <span class="banner-text">Ready to generate: <strong>${encounterTitle}</strong></span>
            <button class="banner-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Insert at the top of the generate page
    const generatePage = document.getElementById('generatePage');
    if (generatePage) {
        generatePage.insertBefore(banner, generatePage.firstChild);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (banner.parentElement) {
                banner.style.opacity = '0';
                setTimeout(() => banner.remove(), 300);
            }
        }, 8000);
    }
}

// Expose functions to window for HTML onclick handlers
window.initApp = initApp;
window.toggleTheme = toggleTheme;
window.switchPage = switchPage;
window.toggleProgressiveReveal = toggleProgressiveReveal;
window.performSearch = performSearch;
window.applyFilters = applyFilters;
window.onEnvironmentChange = onEnvironmentChange;
window.onFilterChange = onFilterChange;
window.updateAllFilters = updateAllFilters;
window.clearFilters = clearFilters;
window.nextPage = nextPage;
window.previousPage = previousPage;
window.changeItemsPerPage = changeItemsPerPage;
window.useEncounterForGeneration = useEncounterForGeneration;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
