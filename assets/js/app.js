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

// Expose functions to window for HTML onclick handlers
window.initApp = initApp;
window.toggleTheme = toggleTheme;
window.switchPage = switchPage;
window.toggleProgressiveReveal = toggleProgressiveReveal;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
