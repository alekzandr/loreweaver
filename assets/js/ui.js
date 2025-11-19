// LoreWeaver - UI & Flow Module
// User interface interactions, flow navigation, panels, search, and rendering
// Note: Due to size constraints, complex encounter rendering functions
// will remain inline in the new index.html until further modularization

import { getProfessionRoleTip, capitalizeSpecies } from './utils.js';

// ============================================================================
// UI INTERACTION FUNCTIONS
// ============================================================================

/**
 * Toggle collapsible sections
 */
export function toggleSection(event) {
    const header = event.currentTarget;
    const section = header.closest('.encounter-section');
    const content = section.querySelector('.section-content');
    const toggle = header.querySelector('.section-toggle');
    
    if (content) {
        content.classList.toggle('collapsed');
        if (toggle) {
            toggle.classList.toggle('collapsed');
        }
    }
}

/**
 * Toggle encounter actions dropdown menu
 */
export function toggleEncounterMenu(event) {
    event.stopPropagation();
    const button = event.currentTarget;
    const menu = button.nextElementSibling;
    
    // Close other open menus
    document.querySelectorAll('.encounter-menu.show').forEach(m => {
        if (m !== menu) {
            m.classList.remove('show');
        }
    });
    
    // Toggle this menu
    if (menu) {
        menu.classList.toggle('show');
    }
}

/**
 * Close encounter menu
 */
export function closeEncounterMenu() {
    document.querySelectorAll('.encounter-menu.show').forEach(m => {
        m.classList.remove('show');
    });
}

/**
 * Toggle flow navigator
 */
export function toggleFlowNavigator() {
    const navigator = document.getElementById('flowNavigator');
    const toggle = document.getElementById('flowNavigatorToggle');
    const mainContent = document.getElementById('mainContent');
    
    navigator.classList.toggle('active');
    toggle.classList.toggle('active');
    mainContent?.classList.toggle('nav-active');
    
    toggle.textContent = navigator.classList.contains('active') ? '◀' : '▶';
}

/**
 * Scroll to specific flow step
 */
export function scrollToFlowStep(stepNumber) {
    const stepElement = document.getElementById(`flow-step-${stepNumber}`);
    if (stepElement) {
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Populate flow navigator sidebar
 */
export function populateFlowNavigator(flowSteps) {
    const content = document.getElementById('flowNavigatorContent');
    
    if (!flowSteps || flowSteps.length === 0) {
        content.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9em;">No encounter available</p>';
        return;
    }
    
    let html = '';
    
    // Encounter Flow Section
    html += `<div style="margin-bottom: 20px;">
        <div style="font-size: 0.75em; font-weight: bold; color: var(--accent-blue); text-transform: uppercase; margin-bottom: 10px; padding: 0 5px;">🗺️ Encounter Flow</div>
    `;
    
    flowSteps.forEach((step, index) => {
        const isLastStep = index === flowSteps.length - 1;
        
        html += `
            <div class="flow-step" onclick="scrollToFlowStep(${step.step})">
                <div class="flow-step-node">
                    <div class="flow-step-number">${step.step}</div>
                    <div class="flow-step-title">${step.title}</div>
        `;
        
        if (step.location) {
            html += `
                    <div class="flow-step-location">
                        📍 ${step.location.name}
                    </div>
            `;
        } else if (step.locations && step.locations.length > 0) {
            html += `
                    <div class="flow-step-location">
                        📍 ${step.locations.length} optional locations
                    </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
        
        if (!isLastStep) {
            html += '<div class="flow-connector"></div>';
        }
    });
    
    html += '</div>';
    
    // NPCs Section
    if (window.currentEncounterNPCs && window.currentEncounterNPCs.length > 0) {
        html += `
            <div style="margin-bottom: 20px;">
                <div style="font-size: 0.75em; font-weight: bold; color: var(--accent-blue); text-transform: uppercase; margin-bottom: 10px; padding: 0 5px;">👥 NPCs</div>
        `;
        
        window.currentEncounterNPCs.forEach((npc, idx) => {
            const isLastNPC = idx === window.currentEncounterNPCs.length - 1;
            
            html += `
                <div class="flow-step" onclick="window.showNPCDetail(${idx})" style="cursor: pointer;">
                    <div class="flow-step-node" style="padding: 8px 12px;">
                        <div class="flow-step-title" style="font-size: 0.9em;">${npc.name}</div>
                        <div class="flow-step-location" style="font-size: 0.75em;">
                            ${capitalizeSpecies(npc.species)} | ${npc.profession?.name || npc.profession}
                        </div>
                    </div>
                </div>
            `;
            
            if (!isLastNPC) {
                html += '<div class="flow-connector"></div>';
            }
        });
        
        html += '</div>';
    }
    
    content.innerHTML = html;
}

// ============================================================================
// PANEL FUNCTIONS
// ============================================================================

/**
 * Show location detail in side panel
 */
export function showLocationDetail(locationKey, viewLevel = 'primary', selectedIndex = null, environment = null) {
    // Close NPC panel if open - use requestAnimationFrame for proper transition
    const npcPanel = document.getElementById('npcDetailPanel');
    if (npcPanel && npcPanel.classList.contains('active')) {
        npcPanel.classList.remove('active');
    }

    // Determine environment and locate the raw location data from loaded JSON
    const env = environment || window.selectedEnvironment;
    const envLocations = window.locationObjects?.[env];
    const raw = envLocations?.[locationKey];

    if (!raw) {
        console.error('Location not found:', locationKey, 'in environment:', env);
        return;
    }

    // Normalize into the shape this renderer expects
    const location = {
        key: locationKey,
        name: window.formatLocationName ? window.formatLocationName(locationKey) : locationKey,
        data: {
            description: raw.description || 'A location of interest in the encounter.',
            tags: raw.tags || [],
            primary: raw.primary || [],
            secondary: raw.secondary || [],
            tertiary: raw.tertiary || []
        }
    };

    const panel = document.getElementById('locationDetailPanel');
    const content = document.getElementById('locationDetailContent');
    const progressiveReveal = localStorage.getItem('progressiveReveal') === 'true';
    
    // Get contextual content for this location
    const locationTags = location.data.tags || [];
    
    let html = `
        <h3 style="margin-top: 0;">🗺️ ${location.name}</h3>
        <p style="color: var(--text-secondary); font-style: italic; margin-bottom: 20px;">
            ${location.data.description || 'A location of interest in the encounter.'}
        </p>
    `;
    
    if (progressiveReveal) {
        // Progressive reveal mode - interactive drill-down
        html += `
            <div class="location-breadcrumb">
                <span class="breadcrumb-item ${viewLevel === 'primary' ? 'active' : ''}" 
                      onclick="showLocationDetail('${locationKey}', 'primary', null, '${env}')">
                    🔍 Primary
                </span>
        `;
        
        if (viewLevel === 'secondary' || viewLevel === 'tertiary') {
            html += `
                <span class="breadcrumb-separator">→</span>
                <span class="breadcrumb-item ${viewLevel === 'secondary' ? 'active' : ''}" 
                      onclick="showLocationDetail('${locationKey}', 'secondary', ${selectedIndex}, '${env}')">
                    🔎 Secondary
                </span>
            `;
        }
        
        if (viewLevel === 'tertiary') {
            html += `
                <span class="breadcrumb-separator">→</span>
                <span class="breadcrumb-item active">
                    ✨ Discovery
                </span>
            `;
        }
        
        html += '</div>';
        
        if (viewLevel === 'primary') {
            if (location.data.primary && location.data.primary.length > 0) {
                html += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: var(--accent-blue); margin-bottom: 15px;">
                            🔍 Primary Features
                        </h4>
                        <p style="color: var(--text-secondary); font-size: 0.9em; margin-bottom: 10px; font-style: italic;">
                            Click a feature to investigate further...
                        </p>
                `;
                
                location.data.primary.forEach((item, index) => {
                    html += `
                        <div class="feature-item primary-feature" 
                             onclick="showLocationDetail('${locationKey}', 'secondary', ${index})">
                            ${item}
                        </div>
                    `;
                });
                
                html += '</div>';
            }
        } else if (viewLevel === 'secondary' && selectedIndex !== null) {
            if (location.data.secondary && location.data.secondary[selectedIndex] !== undefined) {
                html += `
                    <div class="back-button" onclick="showLocationDetail('${locationKey}', 'primary', null, '${env}')">
                        ← Back to Primary Features
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: var(--accent-blue); margin-bottom: 10px;">
                            🔍 Investigating: ${location.data.primary[selectedIndex]}
                        </h4>
                        <div class="feature-item secondary-feature" 
                             onclick="showLocationDetail('${locationKey}', 'tertiary', ${selectedIndex}, '${env}')"
                             style="margin-top: 15px;">
                            <strong>🔎 What you discover:</strong><br>
                            ${location.data.secondary[selectedIndex]}
                            <div style="margin-top: 10px; font-size: 0.85em; color: var(--text-secondary); font-style: italic;">
                                Click to investigate deeper...
                            </div>
                        </div>
                    </div>
                `;
            }
        } else if (viewLevel === 'tertiary' && selectedIndex !== null) {
            if (location.data.tertiary && location.data.tertiary[selectedIndex] !== undefined) {
                html += `
                    <div class="back-button" onclick="showLocationDetail('${locationKey}', 'secondary', ${selectedIndex}, '${env}')">
                        ← Back to Secondary Details
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: var(--accent-blue); margin-bottom: 10px;">
                            🔍 ${location.data.primary[selectedIndex]}
                        </h4>
                        <div style="background: rgba(52, 152, 219, 0.08); padding: 12px; border-radius: 6px; margin-bottom: 15px;">
                            <strong>🔎 Secondary Details:</strong><br>
                            ${location.data.secondary[selectedIndex]}
                        </div>
                        <div class="feature-item tertiary-feature" style="border: 2px solid #f39c12; cursor: default;">
                            <strong>✨ Hidden Discovery:</strong><br>
                            ${location.data.tertiary[selectedIndex]}
                            <div style="margin-top: 10px; font-size: 0.85em; opacity: 0.8; font-style: italic;">
                                💎 This could be valuable, dangerous, or story-relevant!
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    } else {
        // Show all mode
        if (location.data.primary && location.data.primary.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h4 style="color: var(--accent-blue); margin-bottom: 10px;">
                        🔍 Primary Features
                    </h4>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        ${location.data.primary.map(item => `<li style="margin: 8px 0;">${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (location.data.secondary && location.data.secondary.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h4 style="color: var(--accent-blue); margin-bottom: 10px;">
                        🔎 Secondary Details
                    </h4>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        ${location.data.secondary.map(item => `<li style="margin: 8px 0;">${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (location.data.tertiary && location.data.tertiary.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #f39c12; margin-bottom: 10px;">
                        ✨ Hidden Discoveries
                    </h4>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        ${location.data.tertiary.map(item => `<li style="margin: 8px 0; color: #f39c12;">${item}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    }
    
    // Skill Checks - filter by location tags (must have at least one matching tag)
    if (window.currentEncounterSkillChecks && window.currentEncounterSkillChecks.length > 0) {
        const relevantSkillChecks = window.currentEncounterSkillChecks.filter(check => 
            check.tags && check.tags.some(tag => locationTags.includes(tag))
        );
        
        if (relevantSkillChecks.length > 0) {
            const partyLevel = parseInt(document.getElementById('partyLevel')?.value) || 5;
            html += `
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <h4 style="color: #9b59b6; margin-bottom: 10px;"><img src="assets/img/d20.png" alt="dice" class="dice-icon"> Skill Checks</h4>
            `;
            relevantSkillChecks.forEach(check => {
                html += `
                    <div style="background: rgba(155, 89, 182, 0.1); padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #9b59b6;">
                        <strong>${check.challenge}</strong><br>
                        <p style="margin: 8px 0; font-size: 0.9em;">${check.description}</p>
                        <div style="font-size: 0.85em; color: var(--text-secondary);">
                            <strong>Check:</strong> ${check.skill || 'Varies'} (DC ${window.calculateDC ? window.calculateDC(partyLevel) : 15})
                            ${check.success ? `<br><strong>Success:</strong> ${check.success}` : ''}
                            ${check.failure ? `<br><strong>Failure:</strong> ${check.failure}` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
    }
    
    // Traps - filter by location tags (must have at least one matching tag)
    if (window.currentEncounterTraps && window.currentEncounterTraps.length > 0) {
        const relevantTraps = window.currentEncounterTraps.filter(trap => 
            trap.tags && trap.tags.some(tag => locationTags.includes(tag))
        );
        
        if (relevantTraps.length > 0) {
            html += `
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <h4 style="color: #e74c3c; margin-bottom: 10px;">🪤 Traps</h4>
            `;
            relevantTraps.forEach(trap => {
                const partyLevel = parseInt(document.getElementById('partyLevel')?.value) || 5;
                html += `
                    <div style="background: rgba(231, 76, 60, 0.1); padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #e74c3c;">
                        <strong>${trap.name}</strong><br>
                        <p style="margin: 8px 0; font-size: 0.9em;">${trap.description}</p>
                        <div style="font-size: 0.85em; color: var(--text-secondary);">
                            <strong>Detect:</strong> ${trap.detectMethod || 'Perception/Investigation'} (DC ${window.calculateDC ? window.calculateDC(partyLevel) : 15})<br>
                            <strong>Disarm:</strong> ${trap.disarmMethod || "Thieves' Tools"} (DC ${window.calculateDC ? window.calculateDC(partyLevel) + 2 : 17})
                            ${trap.damageType ? `<br><strong>Damage Type:</strong> ${trap.damageType}` : ''}
                            ${trap.severity ? `<br><strong>Severity:</strong> ${trap.severity}` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
    }
    
    // Hazards - filter by location tags (must have at least one matching tag)
    if (window.currentEncounterHazards && window.currentEncounterHazards.length > 0) {
        const relevantHazards = window.currentEncounterHazards.filter(hazard => 
            hazard.tags && hazard.tags.some(tag => locationTags.includes(tag))
        );
        
        if (relevantHazards.length > 0) {
            html += `
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <h4 style="color: #f39c12; margin-bottom: 10px;">⚠️ Hazards</h4>
            `;
            relevantHazards.forEach(hazard => {
                html += `
                    <div style="background: rgba(243, 156, 18, 0.1); padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #f39c12;">
                        <strong>${hazard.name}</strong><br>
                        <p style="margin: 8px 0; font-size: 0.9em;">${hazard.description}</p>
                        <div style="font-size: 0.85em; color: var(--text-secondary);">
                            <strong>Save:</strong> ${hazard.saveAbility || 'Varies'}
                            ${hazard.severity ? `<br><strong>Severity:</strong> ${hazard.severity}` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
    }
    
    // Environmental Effects - filter by location tags (must have at least one matching tag)
    if (window.currentEncounterEnvironmentalEffects && window.currentEncounterEnvironmentalEffects.length > 0) {
        const relevantEffects = window.currentEncounterEnvironmentalEffects.filter(effect => 
            effect.tags && effect.tags.some(tag => locationTags.includes(tag))
        );
        
        if (relevantEffects.length > 0) {
            html += `
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <h4 style="color: #3498db; margin-bottom: 10px;">🌀 Environmental Effects</h4>
            `;
            relevantEffects.forEach(effect => {
                html += `
                    <div style="background: rgba(52, 152, 219, 0.1); padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #3498db;">
                        <strong>${effect.name}</strong><br>
                        <p style="margin: 8px 0; font-size: 0.9em;">${effect.description}</p>
                        <div style="font-size: 0.85em; color: var(--text-secondary);">
                            <strong>Effect:</strong> ${effect.mechanicalEffect || 'Varies'}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
    }
    
    // NPCs in this location - check if any NPCs have been added to this location
    if (window.currentEncounterLocations && window.currentEncounterLocations.length > 0) {
        // Find the location in the encounter's location array
        const encounterLocation = window.currentEncounterLocations.find(loc => 
            (loc.key === locationKey) || (loc.name && loc.name.toLowerCase() === location.name.toLowerCase())
        );
        
        if (encounterLocation && encounterLocation.npcs && encounterLocation.npcs.length > 0) {
            html += `
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                    <h4 style="color: #2ecc71; margin-bottom: 10px;">👥 NPCs in this Location (${encounterLocation.npcs.length})</h4>
            `;
            encounterLocation.npcs.forEach((npc) => {
                html += `
                    <div style="background: rgba(46, 204, 113, 0.1); padding: 12px; border-radius: 6px; margin-bottom: 10px; border-left: 3px solid #2ecc71;">
                        <strong>${npc.name}</strong><br>
                        <p style="margin: 4px 0; font-size: 0.9em;">${capitalizeSpecies(npc.species)} ${npc.profession?.name || npc.profession}</p>
                        <p style="margin: 4px 0; font-size: 0.85em; color: var(--text-secondary);">${npc.appearance?.description || npc.appearance || ''}</p>
                        ${npc.personality ? `<p style="margin: 4px 0; font-size: 0.85em; font-style: italic;">${npc.personality?.trait || npc.personality}</p>` : ''}
                    </div>
                `;
            });
            html += '</div>';
        }
    }
    
    // Tags
    if (locationTags.length > 0) {
        html += `
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    ${locationTags.map(tag => `
                        <span style="background: rgba(0, 122, 255, 0.2); color: var(--accent-blue); padding: 4px 10px; border-radius: 12px; font-size: 0.85em;">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    content.innerHTML = html;
    panel.classList.add('active');
}

/**
 * Hide location detail panel
 */
export function hideLocationDetail() {
    const panel = document.getElementById('locationDetailPanel');
    panel.classList.remove('active');
}

/**
 * Show NPC detail in side panel
 */
export function showNPCDetail(npcIndex) {
    // Close location panel if open
    const locationPanel = document.getElementById('locationDetailPanel');
    if (locationPanel && locationPanel.classList.contains('active')) {
        locationPanel.classList.remove('active');
    }

    const npc = window.currentEncounterNPCs[npcIndex];
    
    if (!npc) {
        console.error('NPC not found at index:', npcIndex);
        return;
    }

    const panel = document.getElementById('npcDetailPanel');
    const content = document.getElementById('npcDetailContent');
    
    let html = `
        <h3 style="margin-top: 0; color: #9b59b6;"><img src="assets/img/character.png" alt="character" class="character-icon"> ${npc.name}</h3>
        <p style="color: var(--text-secondary); font-style: italic; margin-bottom: 20px;">
            ${capitalizeSpecies(npc.species)} ${npc.profession?.name || npc.profession}
        </p>

        <div style="margin-bottom: 20px;">
            <h4 style="color: #9b59b6; margin-bottom: 10px;">
                📋 Basic Information
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                <div>
                    <strong style="color: var(--text-secondary);">Species:</strong>
                    <div style="color: var(--text-primary);">${capitalizeSpecies(npc.species) || 'Unknown'}</div>
                </div>
                <div>
                    <strong style="color: var(--text-secondary);">Profession:</strong>
                    <div style="color: var(--text-primary);">${npc.profession?.name || npc.profession || 'Unknown'}</div>
                </div>
                <div>
                    <strong style="color: var(--text-secondary);">Alignment:</strong>
                    <div style="color: var(--text-primary);">${npc.alignment?.name || npc.alignment || 'Unknown'}</div>
                </div>
                <div>
                    <strong style="color: var(--text-secondary);">Personality:</strong>
                    <div style="color: var(--text-primary);">${npc.personality?.trait || npc.personality || 'Unknown'}</div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="color: #9b59b6; margin-bottom: 10px;">
                👁️ Appearance
            </h4>
            <p style="color: var(--text-secondary); font-style: italic;">${npc.appearance?.description || npc.appearance || 'No description available'}</p>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="color: #9b59b6; margin-bottom: 10px;">
                🎭 Role in Encounter
            </h4>
            <p style="color: var(--text-secondary);">${npc.profession?.description || 'A ' + (npc.profession?.name || npc.profession) + ' in the area.'}</p>
            <p style="color: var(--text-secondary); margin-top: 8px;"><strong>Can:</strong> ${getProfessionRoleTip(npc.profession?.name || npc.profession)}</p>
        </div>

        <div style="background: rgba(255, 149, 0, 0.1); border-left: 3px solid #ff9500; padding: 12px; border-radius: 6px; margin-bottom: 20px;">
            <h4 style="color: #ff9500; margin: 0 0 8px 0;">
                🤫 Secret (DM Only)
            </h4>
            <p style="color: var(--text-secondary); margin: 0; font-style: italic;">${npc.secret?.secret || npc.secret || 'No secret revealed'}</p>
        </div>

        <div style="background: rgba(155, 89, 182, 0.1); border-radius: 6px; padding: 12px;">
            <h4 style="color: #9b59b6; margin: 0 0 8px 0;">
                ⚖️ Alignment
            </h4>
            <p style="color: var(--text-secondary); margin: 0;">${npc.alignment?.description || 'Alignment: ' + (npc.alignment?.name || npc.alignment || 'Unknown')}</p>
        </div>
    `;
    
    content.innerHTML = html;
    panel.classList.add('active');
}

/**
 * Hide NPC detail panel
 */
export function hideNPCDetail() {
    const panel = document.getElementById('npcDetailPanel');
    panel.classList.remove('active');
}

/**
 * Show NPC tooltip on hover
 */
export function showNPCTooltip(event, npcIndex) {
    const npc = window.currentEncounterNPCs?.[npcIndex];
    
    if (!npc) return;

    const tooltip = document.getElementById('npcTooltip');
    
    tooltip.innerHTML = `
        <div class="npc-tooltip-header"><img src="assets/img/character.png" alt="character" class="character-icon"> ${npc.name}</div>
        <div class="npc-tooltip-row">
            <span class="npc-tooltip-label">Species:</span>
            <span class="npc-tooltip-value">${capitalizeSpecies(npc.species) || 'Unknown'}</span>
        </div>
        <div class="npc-tooltip-row">
            <span class="npc-tooltip-label">Profession:</span>
            <span class="npc-tooltip-value">${npc.profession?.name || npc.profession || 'Unknown'}</span>
        </div>
        <div class="npc-tooltip-row">
            <span class="npc-tooltip-label">Alignment:</span>
            <span class="npc-tooltip-value">${npc.alignment?.name || npc.alignment || 'Unknown'}</span>
        </div>
        <div class="npc-tooltip-row">
            <span class="npc-tooltip-label">Personality:</span>
            <span class="npc-tooltip-value">${npc.personality?.trait || npc.personality || 'Unknown'}</span>
        </div>
        <div class="npc-tooltip-hint">Click for full details</div>
    `;
    
    const x = event.clientX + 15;
    const y = event.clientY + 15;
    
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    tooltip.classList.add('active');
}

/**
 * Hide NPC tooltip
 */
export function hideNPCTooltip() {
    const tooltip = document.getElementById('npcTooltip');
    tooltip.classList.remove('active');
}

/**
 * Show NPC detail from NPC object (for location-specific NPCs)
 */
export function showNPCDetailFromObject(npcJson) {
    // Close location panel if open
    const locationPanel = document.getElementById('locationDetailPanel');
    if (locationPanel && locationPanel.classList.contains('active')) {
        locationPanel.classList.remove('active');
    }

    const npc = JSON.parse(npcJson);
    
    if (!npc) {
        console.error('Invalid NPC data');
        return;
    }

    const panel = document.getElementById('npcDetailPanel');
    const content = document.getElementById('npcDetailContent');
    
    let html = `
        <h3 style="margin-top: 0; color: #9b59b6;"><img src="assets/img/character.png" alt="character" class="character-icon"> ${npc.name}</h3>
        <p style="color: var(--text-secondary); font-style: italic; margin-bottom: 20px;">
            ${capitalizeSpecies(npc.species)} ${npc.profession?.name || npc.profession}
        </p>

        <div style="margin-bottom: 20px;">
            <h4 style="color: #9b59b6; margin-bottom: 10px;">
                📋 Basic Information
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                <div>
                    <strong style="color: var(--text-secondary);">Species:</strong>
                    <div style="color: var(--text-primary);">${capitalizeSpecies(npc.species) || 'Unknown'}</div>
                </div>
                <div>
                    <strong style="color: var(--text-secondary);">Profession:</strong>
                    <div style="color: var(--text-primary);">${npc.profession?.name || npc.profession || 'Unknown'}</div>
                </div>
                <div>
                    <strong style="color: var(--text-secondary);">Alignment:</strong>
                    <div style="color: var(--text-primary);">${npc.alignment?.name || npc.alignment || 'Unknown'}</div>
                </div>
                <div>
                    <strong style="color: var(--text-secondary);">Personality:</strong>
                    <div style="color: var(--text-primary);">${npc.personality?.trait || npc.personality || 'Unknown'}</div>
                </div>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="color: #9b59b6; margin-bottom: 10px;">
                👁️ Appearance
            </h4>
            <p style="color: var(--text-secondary); font-style: italic;">
                ${npc.appearance?.description || npc.appearance || 'No description available'}
            </p>
        </div>

        <div style="background: rgba(255, 149, 0, 0.1); border-left: 3px solid #ff9500; padding: 12px; border-radius: 4px; margin-bottom: 20px;">
            <h4 style="color: #ff9500; margin-top: 0; margin-bottom: 10px;">
                🔒 Secret (DM Only)
            </h4>
            <p style="color: var(--text-secondary); font-style: italic; margin: 0;">
                ${npc.secret?.secret || npc.secret || 'No secret recorded'}
            </p>
        </div>
    `;
    
    content.innerHTML = html;
    panel.classList.add('active');
}

// ============================================================================
// SEARCH FUNCTIONS
// ============================================================================

/**
 * Initialize search filters
 */
export function initializeSearchFilters() {
    const envFilter = document.getElementById('envFilter');
    const locationTypeFilter = document.getElementById('locationTypeFilter');
    const settingFilter = document.getElementById('settingFilter');
    const planeFilter = document.getElementById('planeFilter');

    // Store current selections
    const currentEnv = envFilter?.value || '';
    const currentLocationType = locationTypeFilter?.value || '';
    const currentSetting = settingFilter?.value || '';
    const currentPlane = planeFilter?.value || '';

    // Populate environments from data
    const environments = new Set();
    const locationTypes = new Set();
    const settings = new Set();

    if (window.locationObjects) {
        Object.entries(window.locationObjects).forEach(([env, locations]) => {
            environments.add(env);
            Object.entries(locations).forEach(([locType, locData]) => {
                locationTypes.add(locType);
                if (locData.tags) {
                    locData.tags.forEach(tag => settings.add(tag));
                }
            });
        });
    }

    // Clear and repopulate environment filter
    envFilter.innerHTML = '<option value="">All Environments</option>';
    Array.from(environments).sort().forEach(env => {
        const option = document.createElement('option');
        option.value = env;
        option.textContent = env.charAt(0).toUpperCase() + env.slice(1);
        if (env === currentEnv) option.selected = true;
        envFilter.appendChild(option);
    });

    // Clear and repopulate location type filter
    locationTypeFilter.innerHTML = '<option value="">All Location Types</option>';
    Array.from(locationTypes).sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        if (type === currentLocationType) option.selected = true;
        locationTypeFilter.appendChild(option);
    });

    // Clear and repopulate setting filter (from tags)
    settingFilter.innerHTML = '<option value="">All Settings</option>';
    Array.from(settings).sort().forEach(setting => {
        const option = document.createElement('option');
        option.value = setting;
        option.textContent = setting.charAt(0).toUpperCase() + setting.slice(1);
        if (setting === currentSetting) option.selected = true;
        settingFilter.appendChild(option);
    });

    // Clear and repopulate plane filter
    planeFilter.innerHTML = '<option value="">All Planes</option>';
    const planes = ['Material Plane', 'Feywild', 'Shadowfell', 'Astral Plane', 'Ethereal Plane'];
    planes.forEach(plane => {
        const option = document.createElement('option');
        option.value = plane.toLowerCase().replace(/\s+/g, '-');
        option.textContent = plane;
        if (plane.toLowerCase().replace(/\s+/g, '-') === currentPlane) option.selected = true;
        planeFilter.appendChild(option);
    });
    
    // Update filter counts after initialization
    if (window.updateAllFilters) {
        window.updateAllFilters();
    }
}

// Export functions to window for HTML onclick handlers
window.toggleSection = toggleSection;
window.toggleEncounterMenu = toggleEncounterMenu;
window.closeEncounterMenu = closeEncounterMenu;
window.toggleFlowNavigator = toggleFlowNavigator;
window.scrollToFlowStep = scrollToFlowStep;
window.populateFlowNavigator = populateFlowNavigator;
window.showLocationDetail = showLocationDetail;
window.hideLocationDetail = hideLocationDetail;
window.showNPCDetail = showNPCDetail;
window.hideNPCDetail = hideNPCDetail;
window.showNPCTooltip = showNPCTooltip;
window.hideNPCTooltip = hideNPCTooltip;
window.showNPCDetailFromObject = showNPCDetailFromObject;
window.initializeSearchFilters = initializeSearchFilters;
