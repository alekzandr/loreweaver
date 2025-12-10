// LoreWeaver - Core Module
// Main encounter generation, locations, NPCs, flow, and UI interactions
// This consolidated module contains all critical application logic

import './data-loader.js';
import { random, formatLocationName, capitalizeSpecies } from './utils.js';

// ============================================================================
// ADVENTURE GENERATION
// ============================================================================

/**
 * Select adventure template based on environment and optional specific title
 */
export function selectAdventureTemplate(environment, specificTitle = null) {
    const entries = window.encounterTemplates && window.encounterTemplates[environment];

    if (specificTitle && entries) {
        const specificAdventure = entries.find(entry => entry.title === specificTitle);
        if (specificAdventure) return specificAdventure;
    }

    if (entries && entries.length > 0) {
        const totalWeight = entries.reduce((sum, entry) => sum + (entry.weight ?? 1), 0);
        let roll = random() * totalWeight;
        for (const entry of entries) {
            roll -= (entry.weight ?? 1);
            if (roll <= 0) return entry;
        }
        return entries[entries.length - 1];
    }

    // Fallback
    const fallbackTitles = {
        urban: ['The Shadowed Alley', 'Rooftop Chase'],
        arctic: ['Frozen Wasteland Trek', 'Blizzard Survival'],
        ocean: ['Storm-Tossed Voyage', 'Derelict Ship Discovery'],
        space: ['Derelict Station', 'Void Walk'],
        crypt: ['The Ancient Tomb', 'Cursed Burial Chamber'],
        forest: ['Dense Woodland Trail', 'The Overgrown Ruins'],
        desert: ['Scorching Dunes', 'Oasis Mirage'],
        mountain: ['Treacherous Peak', 'Summit Ascent'],
        swamp: ['The Mire', 'Bog of Despair'],
        underground: ['Cavern Depths', 'Crystal Caves']
    };

    const fallback = fallbackTitles[environment] || fallbackTitles.urban;
    const title = fallback[Math.floor(random() * fallback.length)];
    return { title, description: null, tags: [] };
}

/**
 * Smart selection of skill checks based on tags
 */
export function selectSkillChecks(adventureTags, locationTags, npcTags, numChecks = null) {
    if (!window.skillChecksData || !window.skillChecksData.skillChecks || window.skillChecksData.skillChecks.length === 0) {
        return [];
    }

    if (numChecks === null) {
        numChecks = random() < 0.6 ? 3 : 4;
    }

    const allTags = [...adventureTags, ...locationTags, ...npcTags];

    const scoredChecks = window.skillChecksData.skillChecks.map(check => {
        let score = 0;
        for (const tag of check.tags) {
            if (allTags.includes(tag)) score += 1;
            if (adventureTags.includes(tag)) score += 0.5;
        }
        score += random() * 0.3;
        return { check, score };
    });

    scoredChecks.sort((a, b) => b.score - a.score);

    const topCandidates = scoredChecks.slice(0, Math.min(15, scoredChecks.length));
    const selected = [];
    const usedSkills = new Set();

    for (let i = 0; i < numChecks && topCandidates.length > 0; i++) {
        let selectedCheck = null;
        for (let j = 0; j < topCandidates.length; j++) {
            if (!usedSkills.has(topCandidates[j].check.skill)) {
                selectedCheck = topCandidates.splice(j, 1)[0];
                break;
            }
        }

        if (!selectedCheck && topCandidates.length > 0) {
            selectedCheck = topCandidates.shift();
        }

        if (selectedCheck) {
            selected.push(selectedCheck.check);
            usedSkills.add(selectedCheck.check.skill);
        }
    }

    return selected;
}

/**
 * Smart selection of traps based on location tags
 */
export function selectTraps(locationTags, numTraps = null) {
    if (!window.dangersData || !window.dangersData.traps || window.dangersData.traps.length === 0) {
        return [];
    }

    if (numTraps === null) {
        const roll = random();
        if (roll < 0.3) numTraps = 0;
        else if (roll < 0.8) numTraps = 1;
        else numTraps = 2;
    }

    if (numTraps === 0) return [];

    const scoredTraps = window.dangersData.traps.map(trap => {
        let score = 0;
        for (const tag of trap.tags) {
            if (locationTags.includes(tag)) score += 1;
        }
        score += random() * 0.5;
        return { trap, score };
    });

    scoredTraps.sort((a, b) => b.score - a.score);

    const selected = [];
    const topCandidates = scoredTraps.slice(0, Math.min(10, scoredTraps.length));

    for (let i = 0; i < numTraps && topCandidates.length > 0; i++) {
        const index = Math.floor(random() * Math.min(5, topCandidates.length));
        selected.push(topCandidates.splice(index, 1)[0].trap);
    }

    return selected;
}

/**
 * Smart selection of hazards
 */
export function selectHazards(environmentTag, locationTags, numHazards = null) {
    if (!window.dangersData || !window.dangersData.hazards || window.dangersData.hazards.length === 0) {
        return [];
    }

    if (numHazards === null) {
        numHazards = random() < 0.6 ? 1 : 2;
    }

    const allTags = [environmentTag, ...locationTags];

    const scoredHazards = window.dangersData.hazards.map(hazard => {
        let score = 0;
        for (const tag of hazard.tags) {
            if (allTags.includes(tag)) score += 1;
        }
        if (hazard.tags.includes(environmentTag)) score += 1;
        score += random() * 0.5;
        return { hazard, score };
    });

    scoredHazards.sort((a, b) => b.score - a.score);

    const selected = [];
    const topCandidates = scoredHazards.slice(0, Math.min(10, scoredHazards.length));

    for (let i = 0; i < numHazards && topCandidates.length > 0; i++) {
        const index = Math.floor(random() * Math.min(5, topCandidates.length));
        selected.push(topCandidates.splice(index, 1)[0].hazard);
    }

    return selected;
}

/**
 * Smart selection of environmental effects
 */
export function selectEnvironmentalEffects(environmentTag, adventureTags, numEffects = null) {
    if (!window.dangersData || !window.dangersData.environmentalEffects || window.dangersData.environmentalEffects.length === 0) {
        return [];
    }

    if (numEffects === null) {
        numEffects = random() < 0.4 ? 1 : 0;
    }

    if (numEffects === 0) return [];

    const allTags = [environmentTag, ...adventureTags];

    const scoredEffects = window.dangersData.environmentalEffects.map(effect => {
        let score = 0;
        for (const tag of effect.tags) {
            if (allTags.includes(tag)) score += 1;
        }
        if (effect.tags.includes(environmentTag)) score += 1;
        score += random() * 0.5;
        return { effect, score };
    });

    scoredEffects.sort((a, b) => b.score - a.score);

    const selected = [];
    const topCandidates = scoredEffects.slice(0, Math.min(10, scoredEffects.length));

    for (let i = 0; i < numEffects && topCandidates.length > 0; i++) {
        const index = Math.floor(random() * Math.min(3, topCandidates.length));
        selected.push(topCandidates.splice(index, 1)[0].effect);
    }

    return selected;
}

// ============================================================================
// LOCATION FUNCTIONS
// ============================================================================

/**
 * Select locations for adventure based on tags
 */
export function selectLocationsForAdventure(adventureTags, environment, numLocations = null, customLocationKeys = null) {
    if (customLocationKeys && customLocationKeys.length > 0) {
        const environmentLocations = window.locationObjects[environment];
        if (!environmentLocations) return [];

        return customLocationKeys.map(key => {
            const locationData = environmentLocations[key];
            if (!locationData) return null;
            return {
                key: key,
                name: formatLocationName(key),
                data: locationData
            };
        }).filter(loc => loc !== null);
    }

    if (numLocations === null) {
        const roll = random();
        if (roll < 0.4) numLocations = 3;
        else if (roll < 0.75) numLocations = 4;
        else numLocations = 5;
    }

    const environmentLocations = window.locationObjects[environment];
    if (!environmentLocations) return [];

    const locations = [];
    const locationKeys = Object.keys(environmentLocations);
    const usedLocations = new Set();

    for (let i = 0; i < numLocations && locationKeys.length > 0; i++) {
        const locationScores = locationKeys
            .filter(key => !usedLocations.has(key))
            .map(key => {
                const location = environmentLocations[key];
                let score = 0;

                for (const tag of adventureTags) {
                    if (location.tags && location.tags.includes(tag)) {
                        score += 2;
                    }
                }

                if (location.tags) {
                    for (const tag of location.tags) {
                        if (adventureTags.includes(tag)) {
                            score += 1;
                        }
                    }
                }

                score += random() * 0.5;

                return { key, location, score };
            });

        if (locationScores.every(l => l.score < 0.5)) {
            const availableKeys = locationKeys.filter(k => !usedLocations.has(k));
            if (availableKeys.length === 0) break;

            const randomKey = availableKeys[Math.floor(random() * availableKeys.length)];
            usedLocations.add(randomKey);
            locations.push({
                key: randomKey,
                name: formatLocationName(randomKey),
                data: environmentLocations[randomKey]
            });
            continue;
        }

        locationScores.sort((a, b) => b.score - a.score);

        const totalScore = locationScores.reduce((sum, l) => sum + Math.max(0.1, l.score), 0);
        let rnd = random() * totalScore;

        let selectedLocation = null;
        for (const scored of locationScores) {
            rnd -= Math.max(0.1, scored.score);
            if (rnd <= 0) {
                selectedLocation = scored;
                break;
            }
        }

        if (!selectedLocation) {
            selectedLocation = locationScores[0];
        }

        usedLocations.add(selectedLocation.key);
        locations.push({
            key: selectedLocation.key,
            name: formatLocationName(selectedLocation.key),
            data: selectedLocation.location
        });
    }

    return locations;
}

// ============================================================================
// NPC FUNCTIONS
// ============================================================================

/**
 * Select NPCs for adventure based on tags
 */
export function selectNPCsForAdventure(adventureTags, numNPCs = null) {
    if (!window.npcData || !window.npcData.professions || !window.npcData.species) {
        console.error('NPC data not loaded yet!');
        return [];
    }

    if (numNPCs === null) {
        numNPCs = Math.floor(random() * 3) + 1;
    }

    const npcs = [];
    const usedProfessions = new Set();
    const usedTemplates = new Set();

    for (let i = 0; i < numNPCs; i++) {
        let selectedProfession = null;
        let usingTemplate = false;
        let templateName = null;

        // Try to use NPC templates (70% chance)
        if (window.npcData.npcTemplates && window.npcData.npcTemplates.length > 0 && random() < 0.7) {
            const templateScores = window.npcData.npcTemplates.map(template => {
                if (usedTemplates.has(template.name)) {
                    return { template, score: -1 };
                }

                let score = 0;
                for (const tag of adventureTags) {
                    if (template.tags && template.tags.includes(tag)) {
                        score++;
                    }
                }

                return { template, score };
            });

            const validTemplates = templateScores.filter(t => t.score >= 2);

            if (validTemplates.length > 0) {
                const maxScore = Math.max(...validTemplates.map(t => t.score));
                const topTemplates = validTemplates.filter(t => t.score >= maxScore - 1);
                const selectedTemplate = topTemplates[Math.floor(random() * topTemplates.length)].template;

                usedTemplates.add(selectedTemplate.name);
                usingTemplate = true;
                templateName = selectedTemplate.name;

                selectedProfession = {
                    name: selectedTemplate.role,
                    tags: selectedTemplate.tags
                };
            }
        }

        // Fall back to profession-based generation
        if (!usingTemplate) {
            const professionScores = window.npcData.professions.map(profession => {
                if (usedProfessions.has(profession.name)) {
                    return { profession, score: -1 };
                }

                let score = 0;
                for (const tag of adventureTags) {
                    if (profession.tags.includes(tag)) {
                        score++;
                    }
                }

                return { profession, score };
            });

            const validProfessions = professionScores.filter(p => p.score > 0);

            if (validProfessions.length === 0) {
                const availableProfessions = window.npcData.professions.filter(p => !usedProfessions.has(p.name));
                selectedProfession = availableProfessions[Math.floor(random() * availableProfessions.length)];
            } else {
                const maxScore = Math.max(...validProfessions.map(p => p.score));
                const topProfessions = validProfessions.filter(p => p.score >= maxScore - 1);
                selectedProfession = topProfessions[Math.floor(random() * topProfessions.length)].profession;
            }

            usedProfessions.add(selectedProfession.name);
        }

        // Generate the NPC
        const speciesKeys = Object.keys(window.npcData.species);
        const species = speciesKeys[Math.floor(random() * speciesKeys.length)];
        const speciesData = window.npcData.species[species];

        const firstName = speciesData.firstNames[Math.floor(random() * speciesData.firstNames.length)];
        const surname = speciesData.surnames[Math.floor(random() * speciesData.surnames.length)];
        const fullName = `${firstName} ${surname}`;

        const alignment = window.npcData.alignments?.[Math.floor(Math.random() * window.npcData.alignments.length)] || { name: 'Neutral', description: 'Acts according to circumstance' };
        const personality = window.npcData.personalities?.[Math.floor(Math.random() * window.npcData.personalities.length)] || { trait: 'Reserved', description: 'Keeps to themselves' };
        const secretObj = window.npcData.secrets?.[Math.floor(Math.random() * window.npcData.secrets.length)] || { secret: 'Has a hidden past', tags: [] };
        const appearanceObj = window.npcData.appearances?.[Math.floor(Math.random() * window.npcData.appearances.length)] || { description: 'Unremarkable appearance', tags: [] };

        npcs.push({
            name: fullName,
            species,
            speciesData,
            profession: selectedProfession,
            templateName: usingTemplate ? templateName : null,
            alignment,
            personality,
            appearance: appearanceObj,
            secret: secretObj
        });
    }

    return npcs;
}

/**
 * Generate single NPC for NPC generator page
 */
export function generateNPC() {
    const selectedSpecies = document.getElementById('npcSpecies').value;
    const selectedProfession = document.getElementById('npcProfession').value;
    const selectedAlignment = document.getElementById('npcAlignment').value;
    const selectedPersonality = document.getElementById('npcPersonality').value;

    const speciesKeys = Object.keys(window.npcData.species);
    const species = selectedSpecies === 'random'
        ? speciesKeys[Math.floor(Math.random() * speciesKeys.length)]
        : selectedSpecies;

    const speciesData = window.npcData.species[species];

    const firstName = speciesData.firstNames[Math.floor(Math.random() * speciesData.firstNames.length)];
    const surname = speciesData.surnames[Math.floor(Math.random() * speciesData.surnames.length)];

    const alignment = selectedAlignment === 'random'
        ? window.npcData.alignments[Math.floor(Math.random() * window.npcData.alignments.length)]
        : window.npcData.alignments.find(a => a.name === selectedAlignment);

    const personality = selectedPersonality === 'random'
        ? window.npcData.personalities[Math.floor(Math.random() * window.npcData.personalities.length)]
        : window.npcData.personalities.find(p => p.trait === selectedPersonality);

    const profession = selectedProfession === 'random'
        ? window.npcData.professions[Math.floor(Math.random() * window.npcData.professions.length)]
        : window.npcData.professions.find(p => p.name === selectedProfession);

    const secret = window.npcData.secrets[Math.floor(Math.random() * window.npcData.secrets.length)];
    const appearance = window.npcData.appearances[Math.floor(Math.random() * window.npcData.appearances.length)];

    // Store current NPC data for editing
    window.currentGeneratedNPC = {
        firstName,
        surname,
        species,
        speciesData,
        profession,
        alignment,
        personality,
        appearance,
        secret
    };

    // Render the NPC stat block
    renderNPCStatBlock();
}

/**
 * Render NPC stat block from stored data
 */
function renderNPCStatBlock(editMode = false) {
    const npc = window.currentGeneratedNPC;

    // Build display HTML - Stat Block Style with Edit Button
    let html = `
        <div class="encounter-section npc-stat-block-hover" style="position: relative;">
            <div id="npcStatBlock" style="background: var(--card-background); border: 1px solid var(--accent-blue); border-radius: 8px; padding: 20px; position: relative;">
                <!-- Edit/Save Button (inside stat block) -->
                <button id="npcEditBtn" class="stat-block-action" onclick="window.toggleNPCEdit()" title="${editMode ? 'Save changes' : 'Edit NPC'}" style="position: absolute; top: 12px; right: 52px; background: gainsboro; border: none; cursor: pointer; font-size: 1em; opacity: ${editMode ? '1' : '0'}; transition: opacity 0.3s; z-index: 10; padding: 4px 6px; line-height: 1; width: 28px; min-width: 28px; height: 28px; border-radius: 4px; color: var(--accent-blue); display: flex; align-items: center; justify-content: center;">
                    ${editMode ? '✓' : '✎'}
                </button>
                
                <!-- Add to Adventure Button (inside stat block) -->
                <button id="npcAddBtn" class="stat-block-action" onclick="window.showAddNPCToAdventureMenu()" title="Add to Adventure" style="position: absolute; top: 12px; right: 12px; background: gainsboro; border: none; cursor: pointer; font-size: 1em; opacity: 0; transition: opacity 0.3s; z-index: 10; padding: 4px 6px; line-height: 1; width: 28px; min-width: 28px; height: 28px; border-radius: 4px; color: var(--accent-blue); display: flex; align-items: center; justify-content: center;">
                    +
                </button>
                <!-- Header -->
                <div style="text-align: center; border-bottom: 2px solid var(--accent-blue); padding-bottom: 10px; margin-bottom: 15px;">
                    <h2 style="margin: 0; color: #9b59b6; font-size: 1.8em; display: flex; align-items: center; gap: 10px; justify-content: flex-start;">
                        <img src="assets/img/character.png" alt="character" class="character-icon"> ${editMode ? `<input type="text" id="editFirstName" value="${npc.firstName}" style="width: 120px; background: var(--card-background); color: #9b59b6; border: 1px solid var(--accent-blue); border-radius: 4px; padding: 4px; text-align: left; font-size: 1em; font-family: inherit;"> <input type="text" id="editSurname" value="${npc.surname}" style="width: 150px; background: var(--card-background); color: #9b59b6; border: 1px solid var(--accent-blue); border-radius: 4px; padding: 4px; text-align: left; font-size: 1em; font-family: inherit;">` : `${npc.firstName} ${npc.surname}`}
                    </h2>
                    <p style="margin: 5px 0 0 0; font-style: italic; color: var(--text-secondary); font-size: 1em;">
                        ${editMode ? `<input type="text" id="editSpecies" value="${npc.species}" style="width: 100px; background: var(--card-background); color: var(--text-secondary); border: 1px solid var(--accent-blue); border-radius: 4px; padding: 4px; text-align: center; font-style: italic;"> <input type="text" id="editProfession" value="${npc.profession.name}" style="width: 150px; background: var(--card-background); color: var(--text-secondary); border: 1px solid var(--accent-blue); border-radius: 4px; padding: 4px; text-align: center; font-style: italic;">, <input type="text" id="editAlignment" value="${npc.alignment.name}" style="width: 120px; background: var(--card-background); color: var(--text-secondary); border: 1px solid var(--accent-blue); border-radius: 4px; padding: 4px; text-align: center; font-style: italic;">` : `${capitalizeSpecies(npc.species)} ${npc.profession.name}, ${npc.alignment.name}`}
                    </p>
                </div>

                <!-- Appearance -->
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <p id="npcAppearance" style="margin: 0; font-style: italic; color: var(--text-secondary); font-size: 0.95em;">
                        ${editMode ? `<textarea id="editAppearance" style="width: 100%; min-height: 60px; background: var(--card-background); color: var(--text-secondary); border: 1px solid var(--accent-blue); border-radius: 4px; padding: 8px; font-style: italic; font-family: inherit; resize: vertical;">${npc.appearance.description}</textarea>` : npc.appearance.description}
                    </p>
                </div>

                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                    <div>
                        <strong style="color: var(--accent-blue); font-size: 0.85em; text-transform: uppercase;">Personality</strong>
                        <p id="npcPersonality" style="margin: 5px 0 0 0; color: var(--text-primary); font-size: 0.9em;">
                            ${editMode ? `<input type="text" id="editPersonality" value="${npc.personality.trait}" style="width: 100%; background: var(--card-background); color: var(--text-primary); border: 1px solid var(--accent-blue); border-radius: 4px; padding: 4px;">` : npc.personality.trait}
                        </p>
                    </div>
                    <div>
                        <strong style="color: var(--accent-blue); font-size: 0.85em; text-transform: uppercase;">Alignment</strong>
                        <p style="margin: 5px 0 0 0; color: var(--text-primary); font-size: 0.9em;">
                            ${editMode ? `<input type="text" id="editAlignmentAlt" value="${npc.alignment.name}" style="width: 100%; background: var(--card-background); color: var(--text-primary); border: 1px solid var(--accent-blue); border-radius: 4px; padding: 4px;">` : npc.alignment.name}
                        </p>
                    </div>
                </div>

                <!-- Secret -->
                <div style="background: rgba(255, 149, 0, 0.1); border-left: 3px solid #ff9500; padding: 12px; border-radius: 4px;">
                    <strong style="color: #ff9500; font-size: 0.85em; text-transform: uppercase;">🔒 Secret (DM Only)</strong>
                    <p id="npcSecret" style="margin: 5px 0 0 0; color: var(--text-secondary); font-size: 0.9em; font-style: italic;">
                        ${editMode ? `<textarea id="editSecret" style="width: 100%; min-height: 60px; background: var(--card-background); color: var(--text-secondary); border: 1px solid #ff9500; border-radius: 4px; padding: 8px; font-style: italic; font-family: inherit; resize: vertical;">${npc.secret.secret}</textarea>` : npc.secret.secret}
                    </p>
                </div>
            </div>
        </div>
    `;

    const npcDisplay = document.getElementById('npcDisplay');

    // Remove old event listeners by cloning and replacing the element
    // This prevents memory leaks from accumulating listeners
    const npcDisplayClone = npcDisplay.cloneNode(false);
    npcDisplay.parentNode.replaceChild(npcDisplayClone, npcDisplay);

    npcDisplayClone.innerHTML = html;
    npcDisplayClone.classList.add('active');
    npcDisplayClone.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Add hover effect for buttons (only in view mode)
    if (!editMode) {
        const statBlock = document.getElementById('npcStatBlock');
        const editBtn = document.getElementById('npcEditBtn');
        const addBtn = document.getElementById('npcAddBtn');

        // Use the parent container for hover detection
        const hoverTarget = statBlock.parentElement;

        // Define named functions for listeners so they can be removed later
        const handleMouseEnter = () => {
            editBtn.style.opacity = '1';
            editBtn.style.transform = 'scale(1.1)';
            addBtn.style.opacity = '1';
            addBtn.style.transform = 'scale(1.1)';
        };

        const handleMouseLeave = () => {
            editBtn.style.opacity = '0';
            editBtn.style.transform = 'scale(1)';
            addBtn.style.opacity = '0';
            addBtn.style.transform = 'scale(1)';
        };

        // Store references for potential cleanup
        hoverTarget._mouseEnterHandler = handleMouseEnter;
        hoverTarget._mouseLeaveHandler = handleMouseLeave;

        // Add event listeners with named functions
        hoverTarget.addEventListener('mouseenter', handleMouseEnter);
        hoverTarget.addEventListener('mouseleave', handleMouseLeave);
    }
}

/**
 * Show menu to add NPC to adventure
 */
function showAddNPCToAdventureMenu() {
    const npc = window.currentGeneratedNPC;

    if (!npc) {
        alert('Please generate an NPC first!');
        return;
    }

    // Check if there's an active adventure
    if (!window.currentAdventureLocations || window.currentAdventureLocations.length === 0) {
        alert('Please generate an adventure first on the Generate page!');
        return;
    }

    // Build menu HTML
    let menuHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #1a1a1a; border: 2px solid var(--accent-blue); border-radius: 8px; padding: 20px; z-index: 1000; max-width: 400px; max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);">
            <h3 style="margin-top: 0; color: #9b59b6;">Add ${npc.firstName} ${npc.surname} to Adventure</h3>
            <p style="color: var(--text-secondary); margin-bottom: 15px;">Choose where to add this NPC:</p>
            
            <button onclick="addNPCToAdventure('general')" style="width: 100%; padding: 12px; margin-bottom: 10px; background: rgba(155, 89, 182, 0.2); border: 1px solid #9b59b6; color: #9b59b6; border-radius: 6px; cursor: pointer; font-size: 1em;">
                ➕ Add to General NPCs Section
            </button>`;

    // Show replace options if there are existing NPCs
    if (window.currentAdventureNPCs && window.currentAdventureNPCs.length > 0) {
        menuHTML += `
            <div style="margin: 15px 0; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 15px;">
                <strong style="color: #f39c12; font-size: 0.9em;">Replace existing NPC:</strong>
            </div>
            
            ${window.currentAdventureNPCs.map((existingNpc, idx) => `
                <button onclick="addNPCToAdventure('replace', ${idx})" style="width: 100%; padding: 10px; margin-bottom: 8px; background: rgba(243, 156, 18, 0.2); border: 1px solid #f39c12; color: #f39c12; border-radius: 6px; cursor: pointer; font-size: 0.9em; text-align: left;">
                    🔄 Replace ${existingNpc.name}
                </button>
            `).join('')}`;
    }

    menuHTML += `
            <div style="margin: 15px 0; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 15px;">
                <strong style="color: var(--accent-blue); font-size: 0.9em;">Add to a specific location:</strong>
            </div>
            
            ${window.currentAdventureLocations.map((loc, idx) => `
                <button onclick="addNPCToAdventure('location', ${idx})" style="width: 100%; padding: 10px; margin-bottom: 8px; background: rgba(0, 122, 255, 0.2); border: 1px solid var(--accent-blue); color: var(--accent-blue); border-radius: 6px; cursor: pointer; font-size: 0.9em; text-align: left;">
                    📍 ${loc.name}
                </button>
            `).join('')}
            
            <button onclick="closeAddNPCMenu()" style="width: 100%; padding: 10px; margin-top: 15px; background: rgba(231, 76, 60, 0.2); border: 1px solid #e74c3c; color: #e74c3c; border-radius: 6px; cursor: pointer; font-size: 0.9em;">
                ✖️ Cancel
            </button>
        </div>
        <div id="npcMenuOverlay" onclick="closeAddNPCMenu()" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 999;"></div>
    `;

    // Create menu container
    const menuContainer = document.createElement('div');
    menuContainer.id = 'addNPCMenuContainer';
    menuContainer.innerHTML = menuHTML;
    document.body.appendChild(menuContainer);
}

/**
 * Add NPC to adventure
 */
function addNPCToAdventure(target, locationIndex = null) {
    const npc = window.currentGeneratedNPC;

    console.log('Adding NPC to adventure:', { target, locationIndex, npc });

    // Create NPC object in the format used by adventures
    const adventureNPC = {
        name: `${npc.firstName} ${npc.surname}`,
        species: npc.species,
        profession: npc.profession,
        alignment: npc.alignment,
        personality: npc.personality,
        appearance: npc.appearance,
        secret: npc.secret
    };

    if (target === 'general') {
        // Add to general NPCs section
        if (!window.currentAdventureNPCs) {
            window.currentAdventureNPCs = [];
        }
        window.currentAdventureNPCs.push(adventureNPC);
        console.log('Added to general NPCs. Total NPCs:', window.currentAdventureNPCs.length);
        console.log('currentAdventureNPCs array:', window.currentAdventureNPCs);
        alert(`Added ${adventureNPC.name} to the adventure's NPC section!`);
    } else if (target === 'replace' && locationIndex !== null) {
        // Replace an existing NPC
        const oldNPC = window.currentAdventureNPCs[locationIndex];
        window.currentAdventureNPCs[locationIndex] = adventureNPC;
        console.log('Replaced NPC at index', locationIndex);
        alert(`Replaced ${oldNPC.name} with ${adventureNPC.name}!`);
    } else if (target === 'location' && locationIndex !== null) {
        // Add to specific location
        const location = window.currentAdventureLocations[locationIndex];
        if (!location.npcs) {
            location.npcs = [];
        }
        location.npcs.push(adventureNPC);
        console.log('Added to location. Location NPCs:', location.npcs);
        alert(`Added ${adventureNPC.name} to ${location.name}!`);
    }

    closeAddNPCMenu();

    // Regenerate the adventure flow to update NPC references in DM Tips
    console.log('Regenerating adventure flow...');
    if (window.generateAdventureFlow) {
        window.currentAdventureFlow = window.generateAdventureFlow();
        console.log('Adventure flow regenerated');
    } else {
        console.warn('window.generateAdventureFlow is not defined');
    }

    // Refresh the adventure display to show the new NPC
    console.log('Calling displayAdventure...');
    if (window.displayAdventure) {
        window.displayAdventure();
        console.log('displayAdventure called successfully');
    } else {
        console.error('window.displayAdventure is not defined!');
    }
}

/**
 * Close the add NPC menu
 */
function closeAddNPCMenu() {
    const menuContainer = document.getElementById('addNPCMenuContainer');
    if (menuContainer) {
        menuContainer.remove();
    }
}

/**
 * Toggle NPC edit mode
 */
function toggleNPCEdit() {
    const npc = window.currentGeneratedNPC;
    const editBtn = document.getElementById('npcEditBtn');

    // Use aria-label or title for mode detection, or check for ✓ (save) icon
    if (editBtn.title === 'Edit NPC' || editBtn.textContent.trim() === '✎') {
        // Enter edit mode
        renderNPCStatBlock(true);
    } else {
        // Save changes
        npc.firstName = document.getElementById('editFirstName').value.trim() || npc.firstName;
        npc.surname = document.getElementById('editSurname').value.trim() || npc.surname;
        npc.species = document.getElementById('editSpecies').value.trim().toLowerCase() || npc.species;

        const professionName = document.getElementById('editProfession').value.trim();
        if (professionName) {
            // Try to find existing profession or create custom one
            const foundProfession = window.npcData.professions.find(p => p.name === professionName);
            npc.profession = foundProfession || { name: professionName, tags: [] };
        }

        const alignmentName = document.getElementById('editAlignment').value.trim();
        if (alignmentName) {
            const foundAlignment = window.npcData.alignments.find(a => a.name === alignmentName);
            npc.alignment = foundAlignment || { name: alignmentName, tags: [] };
        }

        const personalityTrait = document.getElementById('editPersonality').value.trim();
        if (personalityTrait) {
            const foundPersonality = window.npcData.personalities.find(p => p.trait === personalityTrait);
            npc.personality = foundPersonality || { trait: personalityTrait, tags: [] };
        }

        const appearanceDesc = document.getElementById('editAppearance').value.trim();
        if (appearanceDesc) {
            const foundAppearance = window.npcData.appearances.find(a => a.description === appearanceDesc);
            npc.appearance = foundAppearance || { description: appearanceDesc, tags: [] };
        }

        const secretText = document.getElementById('editSecret').value.trim();
        if (secretText) {
            const foundSecret = window.npcData.secrets.find(s => s.secret === secretText);
            npc.secret = foundSecret || { secret: secretText, tags: [] };
        }

        // Re-render in view mode
        renderNPCStatBlock(false);
    }
}

// Export all functions to window for HTML onclick handlers
window.generateNPC = generateNPC;
window.toggleNPCEdit = toggleNPCEdit;
window.showAddNPCToAdventureMenu = showAddNPCToAdventureMenu;
window.addNPCToAdventure = addNPCToAdventure;
window.closeAddNPCMenu = closeAddNPCMenu;
window.selectNPCsForAdventure = selectNPCsForAdventure;
window.selectLocationsForAdventure = selectLocationsForAdventure;
window.selectAdventureTemplate = selectAdventureTemplate;
window.selectSkillChecks = selectSkillChecks;
window.selectTraps = selectTraps;
window.selectHazards = selectHazards;
window.selectEnvironmentalEffects = selectEnvironmentalEffects;

// Backward Compatibility Aliases
window.showAddNPCToEncounterMenu = showAddNPCToAdventureMenu;
window.addNPCToEncounter = addNPCToAdventure;
window.selectNPCsForEncounter = selectNPCsForAdventure;
window.selectLocationsForEncounter = selectLocationsForAdventure;
window.selectEncounterTemplate = selectAdventureTemplate;

