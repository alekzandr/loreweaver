// LoreWeaver - Utility Functions
// Common helper functions used throughout the app

/**
 * Seeded Random Number Generator (Mulberry32)
 * @param {number} seed - Seed value
 * @returns {Function} Random function that returns values between 0 and 1
 */
export function createSeededRandom(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Hash string to generate seed number
 * @param {string} str - Input string
 * @returns {number} Hash value as seed
 */
export function hashStringToSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Global random function that can be overridden with seeded version
export let currentRandom = Math.random;

/**
 * Set the random function to use throughout the app
 * @param {Function} randomFunc - Random function to use
 */
export function setRandomFunction(randomFunc) {
    currentRandom = randomFunc;
}

/**
 * Get current random value (uses seeded or Math.random)
 * @returns {number} Random value between 0 and 1
 */
export function random() {
    return currentRandom();
}

/**
 * Fisher-Yates shuffle to get random elements from array
 * @param {Array} array - Source array
 * @param {number} count - Number of elements to return
 * @returns {Array} Shuffled subset of array
 */
export function getRandomElements(array, count) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

/**
 * Calculate DC based on party level
 * @param {number} partyLevel - Party level (1-20)
 * @returns {number} Difficulty Class value
 */
export function calculateDC(partyLevel) {
    if (partyLevel <= 4) return 10 + Math.floor(random() * 3);
    if (partyLevel <= 10) return 12 + Math.floor(random() * 4);
    if (partyLevel <= 16) return 15 + Math.floor(random() * 5);
    return 18 + Math.floor(random() * 5);
}

/**
 * Get scaling notes for DM based on party level
 * @param {number} partyLevel - Party level (1-20)
 * @returns {Array<string>} Array of scaling recommendations
 */
export function getScalingNotes(partyLevel) {
    const notes = [];
    
    if (partyLevel <= 4) {
        notes.push('Low-level party: Reduce trap damage by 50%, lower DCs by 2-3.');
        notes.push('Focus on exploration and puzzle-solving over combat danger.');
        notes.push('Provide more obvious clues and warning signs for hazards.');
    } else if (partyLevel <= 10) {
        notes.push('Mid-level party: Standard encounter difficulty as presented.');
        notes.push('Party has access to more resources and magical solutions.');
        notes.push('Can handle multiple simultaneous challenges.');
    } else if (partyLevel <= 16) {
        notes.push('High-level party: Increase trap damage by 50%, raise DCs by 2-3.');
        notes.push('Add magical components to hazards and environmental effects.');
        notes.push('Consider multiple layers of challenges requiring diverse skills.');
    } else {
        notes.push('Epic-level party: Double trap damage, raise DCs by 4-5.');
        notes.push('Incorporate legendary environmental effects and cosmic threats.');
        notes.push('Challenges should require creative use of high-level abilities.');
        notes.push('Standard hazards may be trivial - add supernatural elements.');
    }

    return notes;
}

/**
 * Format location name for display
 * @param {string} locationType - Raw location type
 * @returns {string} Formatted location name
 */
export function formatLocationName(locationType) {
    return locationType
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Get profession-specific role-playing tips
 * @param {string} profession - NPC profession
 * @returns {string} Tip for using this NPC
 */
export function getProfessionRoleTip(profession) {
    const tips = {
        'Blacksmith': 'provide information about weapons, armor, or recent travelers',
        'Merchant': 'offer trade opportunities or gossip about local events',
        'Innkeeper': 'share rumors, provide lodging, or know about local happenings',
        'Guard': 'enforce laws, provide directions, or warn about dangers',
        'Farmer': 'know the local wilderness, weather patterns, or recent disturbances',
        'Alchemist': 'sell potions, identify substances, or explain magical phenomena',
        'Cleric': 'offer healing, spiritual guidance, or knowledge of undead',
        'Wizard': 'provide arcane knowledge, decipher runes, or identify magical items',
        'Thief': 'know secret passages, sell illegal goods, or provide underworld contacts',
        'Bard': 'share stories, perform for information, or know local legends',
        'Sailor': 'provide nautical knowledge, tell tales of distant lands, or know the docks',
        'Hunter': 'track creatures, provide survival tips, or know the wilderness',
        'Scholar': 'offer historical knowledge, translate languages, or research topics',
        'Noble': 'provide political connections, offer quests, or grant favors',
        'Beggar': 'share street information, spy for coin, or know hidden places',
        'Artisan': 'craft items, repair equipment, or appreciate quality work',
        'Soldier': 'provide tactical advice, share war stories, or enforce military law',
        'Herbalist': 'identify plants, brew remedies, or warn of poisonous flora',
        'Gambler': 'provide risky opportunities, share tips for coin, or know shady contacts',
        'Priest': 'perform ceremonies, offer blessings, or provide sanctuary',
        'Assassin': 'offer deadly services, know targets, or eliminate problems',
        'Spy': 'sell information, provide contacts, or reveal secrets for a price',
        'Gladiator': 'offer combat training, share arena knowledge, or intimidate foes',
        'Cartographer': 'provide maps, explain geography, or plan expeditions',
        'Fortune Teller': 'offer cryptic predictions, read omens, or hint at futures'
    };
    return tips[profession] || 'provide information relevant to their profession';
}

/**
 * Build encounter description from template data
 * @param {string} environment - Environment type
 * @param {string} title - Encounter title
 * @param {string|Array<string>} descriptionSource - Description string or array
 * @returns {string} Final encounter description
 */
export function buildEncounterDescription(environment, title, descriptionSource) {
    if (Array.isArray(descriptionSource)) {
        const randomIndex = Math.floor(Math.random() * descriptionSource.length);
        return descriptionSource[randomIndex];
    }
    return descriptionSource || `An exploration encounter set in ${environment}.`;
}

// Expose utility functions to window for inline HTML usage
window.getRandomElements = getRandomElements;
window.calculateDC = calculateDC;
window.getScalingNotes = getScalingNotes;
window.formatLocationName = formatLocationName;
window.getProfessionRoleTip = getProfessionRoleTip;
window.buildEncounterDescription = buildEncounterDescription;
window.createSeededRandom = createSeededRandom;
window.hashStringToSeed = hashStringToSeed;
window.setRandomFunction = setRandomFunction;
window.random = random;
