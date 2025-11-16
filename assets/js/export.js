// LoreWeaver - Export Module
// Handles exporting encounters in various formats

import { capitalizeSpecies } from './utils.js';

/**
 * Export encounter as Markdown
 */
export function exportEncounterMarkdown() {
    console.log('🔍 Export Markdown called');
    console.log('window.encounterTemplate:', window.encounterTemplate);
    console.log('window.currentEncounterFlow:', window.currentEncounterFlow);
    const content = generateEncounterMarkdown();
    console.log('Generated content length:', content.length);
    downloadFile(content, `encounter-${Date.now()}.md`, 'text/markdown');
}

/**
 * Export encounter as plain text
 */
export function exportEncounterText() {
    console.log('🔍 Export Text called');
    console.log('window.encounterTemplate:', window.encounterTemplate);
    const content = generateEncounterText();
    console.log('Generated content length:', content.length);
    downloadFile(content, `encounter-${Date.now()}.txt`, 'text/plain');
}

/**
 * Export encounter as PDF (opens print dialog)
 */
export function exportEncounterPDF() {
    const content = generateEncounterHTML();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Encounter - ${window.encounterTemplate?.title || 'Unknown'}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 800px;
                    margin: 40px auto;
                    padding: 20px;
                    line-height: 1.6;
                    color: #333;
                }
                h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
                h2 { color: #34495e; margin-top: 25px; border-bottom: 2px solid #95a5a6; padding-bottom: 5px; }
                h3 { color: #7f8c8d; margin-top: 20px; }
                .meta { background: #ecf0f1; padding: 10px; border-radius: 5px; margin: 20px 0; }
                .location, .npc, .flow-step, .resolution { 
                    background: #f8f9fa; 
                    padding: 15px; 
                    margin: 15px 0; 
                    border-left: 4px solid #3498db; 
                    page-break-inside: avoid;
                }
                .secret { background: #ffe5e5; padding: 10px; margin: 10px 0; border-left: 4px solid #e74c3c; }
                ul { margin: 10px 0; }
                @media print {
                    body { margin: 0; padding: 15px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            ${content}
            <div class="no-print" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Print / Save as PDF</button>
                <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px;">Close</button>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * Generate Markdown format of encounter
 * @returns {string} Markdown content
 */
function generateEncounterMarkdown() {
    let md = `# ${window.encounterTemplate?.title || 'Encounter'}\n\n`;
    md += `**Environment:** ${window.selectedEnvironment || 'Unknown'} | **Party Level:** ${document.getElementById('partyLevel')?.value || 'Unknown'}\n\n`;
    const descSrc = window.encounterTemplate?.descriptions || window.encounterTemplate?.description;
    if (descSrc) {
        md += `${(Array.isArray(descSrc) ? (descSrc[Math.floor(Math.random() * descSrc.length)] || '') : descSrc)}\n\n`;
    }

    // Encounter Flow
    if (window.currentEncounterFlow && window.currentEncounterFlow.length > 0) {
        md += '## 🗺️ Encounter Flow\n\n';
        window.currentEncounterFlow.forEach((step) => {
            md += `### Step ${step.step}: ${step.title}\n\n`;
            
            // Location info
            if (step.location) {
                md += `**Location:** ${step.location.name || (window.formatLocationName ? window.formatLocationName(step.location.key) : step.location.key)}\n\n`;
            }
            
            // Description
            if (step.description) {
                md += `${step.description}\n\n`;
            }
            
            // DM Tips
            if (step.dmTips && step.dmTips.length > 0) {
                md += '**💡 DM Tips:**\n';
                step.dmTips.forEach(tip => {
                    md += `- ${tip}\n`;
                });
                md += '\n';
            }
            
            // Connections
            if (step.connections && step.connections.length > 0) {
                md += '**Connections:**\n';
                step.connections.forEach(conn => {
                    md += `- ${conn}\n`;
                });
                md += '\n';
            }
            
            // Custom Resolutions
            if (step.customResolutions && step.customResolutions.length > 0) {
                md += '**Possible Resolutions:**\n\n';
                step.customResolutions.forEach((res, idx) => {
                    md += `${idx + 1}. **${res.title}**\n`;
                    md += `   ${res.description}\n`;
                    md += `   - Requirements: ${res.requirements}\n`;
                    md += `   - Rewards: ${res.rewards}\n\n`;
                });
            }
        });
    }

    // Locations
    if (window.currentEncounterLocations && window.currentEncounterLocations.length > 0) {
        md += '## 📍 Locations\n\n';
        window.currentEncounterLocations.forEach((location) => {
            md += `### ${location.name || (window.formatLocationName ? window.formatLocationName(location.key) : location.key)}\n\n`;
            if (location.data?.tags) {
                md += `**Tags:** ${location.data.tags.join(', ')}\n\n`;
            }
            if (location.data?.description) {
                md += `${location.data.description}\n\n`;
            }
            
            // Primary Features with nested Secondary/Discovery
            if (location.data?.primaryFeatures && Array.isArray(location.data.primaryFeatures)) {
                md += '#### Features\n\n';
                location.data.primaryFeatures.forEach(primary => {
                    if (typeof primary === 'string') {
                        md += `**🔍 ${primary}** *(Primary - Immediately visible)*\n\n`;
                    } else if (primary.name) {
                        md += `**🔍 ${primary.name}** *(Primary - Immediately visible)*\n`;
                        md += `${primary.description || ''}\n\n`;
                        
                        // Find and display linked secondary features
                        if (primary.secondary && location.data?.secondaryFeatures) {
                            const linkedSecondaries = Array.isArray(primary.secondary) ? primary.secondary : [primary.secondary];
                            linkedSecondaries.forEach(secName => {
                                const secondary = location.data.secondaryFeatures.find(s => 
                                    (typeof s === 'object' && s.name === secName) || s === secName
                                );
                                if (secondary) {
                                    if (typeof secondary === 'string') {
                                        md += `  ↳ **🔎 ${secondary}** *(Secondary - Requires investigation)*\n\n`;
                                    } else {
                                        md += `  ↳ **🔎 ${secondary.name}** *(Secondary - Requires investigation)*\n`;
                                        md += `  ${secondary.description || ''}\n\n`;
                                        
                                        // Find and display linked discoveries
                                        if (secondary.discovery && location.data?.discoveries) {
                                            const linkedDiscoveries = Array.isArray(secondary.discovery) ? secondary.discovery : [secondary.discovery];
                                            linkedDiscoveries.forEach(discName => {
                                                const discovery = location.data.discoveries.find(d => 
                                                    (typeof d === 'object' && d.name === discName) || d === discName
                                                );
                                                if (discovery) {
                                                    if (typeof discovery === 'string') {
                                                        md += `    ↳ **💡 ${discovery}** *(Discovery)*\n\n`;
                                                    } else {
                                                        md += `    ↳ **💡 ${discovery.name}** *(Discovery)*\n`;
                                                        md += `    ${discovery.description || ''}\n\n`;
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }
                        
                        // Check if primary directly links to discoveries
                        if (primary.discovery && location.data?.discoveries) {
                            const linkedDiscoveries = Array.isArray(primary.discovery) ? primary.discovery : [primary.discovery];
                            linkedDiscoveries.forEach(discName => {
                                const discovery = location.data.discoveries.find(d => 
                                    (typeof d === 'object' && d.name === discName) || d === discName
                                );
                                if (discovery) {
                                    if (typeof discovery === 'string') {
                                        md += `  ↳ **💡 ${discovery}** *(Discovery)*\n\n`;
                                    } else {
                                        md += `  ↳ **💡 ${discovery.name}** *(Discovery)*\n`;
                                        md += `  ${discovery.description || ''}\n\n`;
                                    }
                                }
                            });
                        }
                    }
                });
            }
        });
    }

    // NPCs
    if (window.currentEncounterNPCs && window.currentEncounterNPCs.length > 0) {
        md += '## 👥 NPCs\n\n';
        window.currentEncounterNPCs.forEach((npc) => {
            const profession = npc.profession?.name || npc.profession || 'Unknown';
            const alignment = npc.alignment?.name || npc.alignment || 'Unknown';
            const appearance = npc.appearance?.description || npc.appearance || 'Unknown';
            const personality = npc.personality?.trait || npc.personality || 'Unknown';
            const secret = npc.secret?.secret || npc.secret || 'Unknown';
            md += `### ${npc.name}\n\n`;
            md += `**Species:** ${capitalizeSpecies(npc.species)} | `;
            md += `**Profession:** ${profession} | `;
            md += `**Alignment:** ${alignment}\n\n`;
            md += `**Appearance:** ${appearance}\n\n`;
            md += `**Personality:** ${personality}\n\n`;
            md += `**Secret (DM Only):** ${secret}\n\n`;
        });
    }

    // Skill Checks
    if (window.currentEncounterSkillChecks && window.currentEncounterSkillChecks.length > 0) {
        md += '## 🎲 Skill Checks\n\n';
        window.currentEncounterSkillChecks.forEach((check) => {
            md += `### ${check.skill} Check\n\n`;
            md += `**Challenge:** ${check.challenge}\n\n`;
            md += `**Success:** ${check.success}\n\n`;
            md += `**Failure:** ${check.failure}\n\n`;
        });
    }

    // Traps
    if (window.currentEncounterTraps && window.currentEncounterTraps.length > 0) {
        md += '## 🪤 Traps\n\n';
        window.currentEncounterTraps.forEach((trap) => {
            md += `### ${trap.name}\n\n`;
            md += `${trap.description}\n\n`;
            md += `**Detect:** ${trap.detectMethod || 'Perception/Investigation'}\n\n`;
            md += `**Disarm:** ${trap.disarmMethod || "Thieves' Tools"}\n\n`;
            if (trap.damageType || trap.severity) {
                md += `**Details:** ${trap.damageType ? `Damage Type: ${trap.damageType}. ` : ''}${trap.severity ? `Severity: ${trap.severity}.` : ''}\n\n`;
            }
        });
    }

    // Hazards
    if (window.currentEncounterHazards && window.currentEncounterHazards.length > 0) {
        md += '## ⚠️ Hazards\n\n';
        window.currentEncounterHazards.forEach((hazard) => {
            md += `### ${hazard.name}\n\n`;
            md += `${hazard.description}\n\n`;
            md += `**Save:** ${hazard.saveAbility || 'Varies'}${hazard.severity ? ` | **Severity:** ${hazard.severity}` : ''}\n\n`;
        });
    }

    // Environmental Effects
    if (window.currentEncounterEnvironmentalEffects && window.currentEncounterEnvironmentalEffects.length > 0) {
        md += '## 🌀 Environmental Effects\n\n';
        window.currentEncounterEnvironmentalEffects.forEach((effect) => {
            md += `### ${effect.name}\n\n`;
            md += `${effect.description}\n\n`;
            md += `**Effect:** ${effect.mechanicalEffect || 'Varies'}\n\n`;
        });
    }

    return md;
}

/**
 * Generate plain text format of encounter
 * @returns {string} Plain text content
 */
function generateEncounterText() {
    let txt = `${window.encounterTemplate?.title || 'ENCOUNTER'}\n`;
    txt += `${'='.repeat((window.encounterTemplate?.title || 'ENCOUNTER').length)}\n\n`;
    txt += `Environment: ${window.selectedEnvironment || 'Unknown'} | Party Level: ${document.getElementById('partyLevel')?.value || 'Unknown'}\n\n`;
    const txtDesc = window.encounterTemplate?.descriptions || window.encounterTemplate?.description;
    if (txtDesc) {
        txt += `${(Array.isArray(txtDesc) ? (txtDesc[Math.floor(Math.random() * txtDesc.length)] || '') : txtDesc)}\n\n`;
    }

    // Encounter Flow
    if (window.currentEncounterFlow && window.currentEncounterFlow.length > 0) {
        txt += 'ENCOUNTER FLOW\n';
        txt += `${'-'.repeat(50)}\n\n`;
        window.currentEncounterFlow.forEach((step) => {
            txt += `Step ${step.step}: ${step.title}\n`;
            txt += `${'-'.repeat(40)}\n`;
            
            // Location info
            if (step.location) {
                txt += `Location: ${step.location.name || (window.formatLocationName ? window.formatLocationName(step.location.key) : step.location.key)}\n`;
            }
            
            // Description
            if (step.description) {
                txt += `${step.description}\n\n`;
            }
            
            // DM Tips
            if (step.dmTips && step.dmTips.length > 0) {
                txt += 'DM Tips:\n';
                step.dmTips.forEach(tip => {
                    txt += `  - ${tip}\n`;
                });
                txt += '\n';
            }
            
            // Connections
            if (step.connections && step.connections.length > 0) {
                txt += 'Connections:\n';
                step.connections.forEach(conn => {
                    txt += `  - ${conn}\n`;
                });
                txt += '\n';
            }
            
            // Custom Resolutions
            if (step.customResolutions && step.customResolutions.length > 0) {
                txt += 'Possible Resolutions:\n';
                step.customResolutions.forEach((res, idx) => {
                    txt += `  ${idx + 1}. ${res.title}\n`;
                    txt += `     ${res.description}\n`;
                    txt += `     Requirements: ${res.requirements}\n`;
                    txt += `     Rewards: ${res.rewards}\n\n`;
                });
            }
            
            txt += '\n';
        });
    }

    // Locations
    if (window.currentEncounterLocations && window.currentEncounterLocations.length > 0) {
        txt += 'LOCATIONS\n';
        txt += `${'-'.repeat(50)}\n\n`;
        window.currentEncounterLocations.forEach((location) => {
            txt += `${location.name || (window.formatLocationName ? window.formatLocationName(location.key) : location.key)}\n`;
            if (location.data?.tags) {
                txt += `Tags: ${location.data.tags.join(', ')}\n`;
            }
            if (location.data?.description) {
                txt += `${location.data.description}\n\n`;
            }
            
            // Primary Features with nested Secondary/Discovery
            if (location.data?.primaryFeatures && Array.isArray(location.data.primaryFeatures)) {
                txt += 'FEATURES\n';
                location.data.primaryFeatures.forEach(primary => {
                    if (typeof primary === 'string') {
                        txt += `  [PRIMARY] ${primary} (Immediately visible)\n`;
                    } else if (primary.name) {
                        txt += `  [PRIMARY] ${primary.name} (Immediately visible)\n`;
                        txt += `    ${primary.description || ''}\n`;
                        
                        // Find and display linked secondary features
                        if (primary.secondary && location.data?.secondaryFeatures) {
                            const linkedSecondaries = Array.isArray(primary.secondary) ? primary.secondary : [primary.secondary];
                            linkedSecondaries.forEach(secName => {
                                const secondary = location.data.secondaryFeatures.find(s => 
                                    (typeof s === 'object' && s.name === secName) || s === secName
                                );
                                if (secondary) {
                                    if (typeof secondary === 'string') {
                                        txt += `    -> [SECONDARY] ${secondary} (Requires investigation)\n`;
                                    } else {
                                        txt += `    -> [SECONDARY] ${secondary.name} (Requires investigation)\n`;
                                        txt += `       ${secondary.description || ''}\n`;
                                        
                                        // Find and display linked discoveries
                                        if (secondary.discovery && location.data?.discoveries) {
                                            const linkedDiscoveries = Array.isArray(secondary.discovery) ? secondary.discovery : [secondary.discovery];
                                            linkedDiscoveries.forEach(discName => {
                                                const discovery = location.data.discoveries.find(d => 
                                                    (typeof d === 'object' && d.name === discName) || d === discName
                                                );
                                                if (discovery) {
                                                    if (typeof discovery === 'string') {
                                                        txt += `       -> [DISCOVERY] ${discovery}\n`;
                                                    } else {
                                                        txt += `       -> [DISCOVERY] ${discovery.name}\n`;
                                                        txt += `          ${discovery.description || ''}\n`;
                                                    }
                                                }
                                            });
                                        }
                                    }
                                }
                            });
                        }
                        
                        // Check if primary directly links to discoveries
                        if (primary.discovery && location.data?.discoveries) {
                            const linkedDiscoveries = Array.isArray(primary.discovery) ? primary.discovery : [primary.discovery];
                            linkedDiscoveries.forEach(discName => {
                                const discovery = location.data.discoveries.find(d => 
                                    (typeof d === 'object' && d.name === discName) || d === discName
                                );
                                if (discovery) {
                                    if (typeof discovery === 'string') {
                                        txt += `    -> [DISCOVERY] ${discovery}\n`;
                                    } else {
                                        txt += `    -> [DISCOVERY] ${discovery.name}\n`;
                                        txt += `       ${discovery.description || ''}\n`;
                                    }
                                }
                            });
                        }
                    }
                    txt += '\n';
                });
            }
            
            txt += '\n';
        });
    }

    // NPCs
    if (window.currentEncounterNPCs && window.currentEncounterNPCs.length > 0) {
        txt += 'NPCs\n';
        txt += `${'-'.repeat(50)}\n\n`;
        window.currentEncounterNPCs.forEach((npc) => {
            const profession = npc.profession?.name || npc.profession || 'Unknown';
            const alignment = npc.alignment?.name || npc.alignment || 'Unknown';
            const appearance = npc.appearance?.description || npc.appearance || 'Unknown';
            const personality = npc.personality?.trait || npc.personality || 'Unknown';
            const secret = npc.secret?.secret || npc.secret || 'Unknown';
            txt += `${npc.name}\n`;
            txt += `Species: ${capitalizeSpecies(npc.species)} | `;
            txt += `Profession: ${profession} | `;
            txt += `Alignment: ${alignment}\n`;
            txt += `Appearance: ${appearance}\n`;
            txt += `Personality: ${personality}\n`;
            txt += `Secret (DM Only): ${secret}\n\n`;
        });
    }

    // Skill Checks
    if (window.currentEncounterSkillChecks && window.currentEncounterSkillChecks.length > 0) {
        txt += 'SKILL CHECKS\n';
        txt += `${'-'.repeat(50)}\n\n`;
        window.currentEncounterSkillChecks.forEach((check) => {
            txt += `${check.skill} Check\n`;
            txt += `Challenge: ${check.challenge}\n`;
            txt += `Success: ${check.success}\n`;
            txt += `Failure: ${check.failure}\n\n`;
        });
    }

    // Traps
    if (window.currentEncounterTraps && window.currentEncounterTraps.length > 0) {
        txt += 'TRAPS\n';
        txt += `${'-'.repeat(50)}\n\n`;
        window.currentEncounterTraps.forEach((trap) => {
            txt += `${trap.name}\n`;
            txt += `${trap.description}\n`;
            txt += `Detect: ${trap.detectMethod || 'Perception/Investigation'}\n`;
            txt += `Disarm: ${trap.disarmMethod || "Thieves' Tools"}\n`;
            if (trap.damageType || trap.severity) {
                txt += `Details: ${trap.damageType ? `Damage Type: ${trap.damageType}. ` : ''}${trap.severity ? `Severity: ${trap.severity}.` : ''}\n`;
            }
            txt += '\n';
        });
    }

    // Hazards
    if (window.currentEncounterHazards && window.currentEncounterHazards.length > 0) {
        txt += 'HAZARDS\n';
        txt += `${'-'.repeat(50)}\n\n`;
        window.currentEncounterHazards.forEach((hazard) => {
            txt += `${hazard.name}\n`;
            txt += `${hazard.description}\n`;
            txt += `Save: ${hazard.saveAbility || 'Varies'}${hazard.severity ? ` | Severity: ${hazard.severity}` : ''}\n\n`;
        });
    }

    // Environmental Effects
    if (window.currentEncounterEnvironmentalEffects && window.currentEncounterEnvironmentalEffects.length > 0) {
        txt += 'ENVIRONMENTAL EFFECTS\n';
        txt += `${'-'.repeat(50)}\n\n`;
        window.currentEncounterEnvironmentalEffects.forEach((effect) => {
            txt += `${effect.name}\n`;
            txt += `${effect.description}\n`;
            txt += `Effect: ${effect.mechanicalEffect || 'Varies'}\n\n`;
        });
    }

    return txt;
}

/**
 * Generate HTML format of encounter
 * @returns {string} HTML content
 */
function generateEncounterHTML() {
    let html = `<h1>${window.encounterTemplate?.title || 'Encounter'}</h1>`;
    html += `<div class="meta"><strong>Environment:</strong> ${window.selectedEnvironment || 'Unknown'} | <strong>Party Level:</strong> ${document.getElementById('partyLevel')?.value || 'Unknown'}</div>`;
    const htmlDesc = window.encounterTemplate?.descriptions || window.encounterTemplate?.description;
    if (htmlDesc) {
        html += `<p>${(Array.isArray(htmlDesc) ? (htmlDesc[Math.floor(Math.random() * htmlDesc.length)] || '') : htmlDesc)}</p>`;
    }

    // Encounter Flow
    if (window.currentEncounterFlow && window.currentEncounterFlow.length > 0) {
        html += '<h2>🗺️ Encounter Flow</h2>';
        window.currentEncounterFlow.forEach((step) => {
            html += '<div class="flow-step">';
            html += `<h3>Step ${step.step}: ${step.title}</h3>`;
            
            // Location info
            if (step.location) {
                html += `<p><strong>Location:</strong> ${step.location.name || (window.formatLocationName ? window.formatLocationName(step.location.key) : step.location.key)}</p>`;
            }
            
            // Description
            if (step.description) {
                html += `<p>${step.description}</p>`;
            }
            
            // DM Tips
            if (step.dmTips && step.dmTips.length > 0) {
                html += '<p><strong>💡 DM Tips:</strong></p><ul>';
                step.dmTips.forEach(tip => {
                    html += `<li>${tip}</li>`;
                });
                html += '</ul>';
            }
            
            // Connections
            if (step.connections && step.connections.length > 0) {
                html += '<p><strong>Connections:</strong></p><ul>';
                step.connections.forEach(conn => {
                    html += `<li>${conn}</li>`;
                });
                html += '</ul>';
            }
            
            // Custom Resolutions
            if (step.customResolutions && step.customResolutions.length > 0) {
                html += '<p><strong>Possible Resolutions:</strong></p>';
                step.customResolutions.forEach((res, idx) => {
                    html += '<div class="resolution">';
                    html += `<h5>${idx + 1}. ${res.title}</h5>`;
                    html += `<p>${res.description}</p>`;
                    html += `<p><strong>Requirements:</strong> ${res.requirements}</p>`;
                    html += `<p><strong>Rewards:</strong> ${res.rewards}</p>`;
                    html += '</div>';
                });
            }
            
            html += '</div>';
        });
    }

    // Locations
    if (window.currentEncounterLocations && window.currentEncounterLocations.length > 0) {
        html += '<h2>📍 Locations</h2>';
        window.currentEncounterLocations.forEach((location) => {
            html += '<div class="location">';
            html += `<h3>${location.name || (window.formatLocationName ? window.formatLocationName(location.key) : location.key)}</h3>`;
            if (location.data?.tags) {
                html += `<p><strong>Tags:</strong> ${location.data.tags.join(', ')}</p>`;
            }
            if (location.data?.description) {
                html += `<p>${location.data.description}</p>`;
            }
            
            // Primary Features with nested Secondary/Discovery
            if (location.data?.primaryFeatures && Array.isArray(location.data.primaryFeatures)) {
                html += '<h4>Features</h4>';
                location.data.primaryFeatures.forEach(primary => {
                    if (typeof primary === 'string') {
                        html += '<div style="margin-bottom: 15px;">';
                        html += `<strong>🔍 ${primary}</strong> <em style="color: #666;">(Primary - Immediately visible)</em>`;
                        html += '</div>';
                    } else if (primary.name) {
                        html += '<div style="margin-bottom: 15px; padding-left: 0;">';
                        html += `<strong>🔍 ${primary.name}</strong> <em style="color: #666;">(Primary - Immediately visible)</em><br>`;
                        html += `${primary.description || ''}<br>`;
                        
                        // Find and display linked secondary features
                        if (primary.secondary && location.data?.secondaryFeatures) {
                            const linkedSecondaries = Array.isArray(primary.secondary) ? primary.secondary : [primary.secondary];
                            linkedSecondaries.forEach(secName => {
                                const secondary = location.data.secondaryFeatures.find(s => 
                                    (typeof s === 'object' && s.name === secName) || s === secName
                                );
                                if (secondary) {
                                    html += '<div style="margin-left: 20px; margin-top: 10px; padding-left: 10px; border-left: 3px solid #3498db;">';
                                    if (typeof secondary === 'string') {
                                        html += `<strong>🔎 ${secondary}</strong> <em style="color: #666;">(Secondary - Requires investigation)</em>`;
                                    } else {
                                        html += `<strong>🔎 ${secondary.name}</strong> <em style="color: #666;">(Secondary - Requires investigation)</em><br>`;
                                        html += `${secondary.description || ''}<br>`;
                                        
                                        // Find and display linked discoveries
                                        if (secondary.discovery && location.data?.discoveries) {
                                            const linkedDiscoveries = Array.isArray(secondary.discovery) ? secondary.discovery : [secondary.discovery];
                                            linkedDiscoveries.forEach(discName => {
                                                const discovery = location.data.discoveries.find(d => 
                                                    (typeof d === 'object' && d.name === discName) || d === discName
                                                );
                                                if (discovery) {
                                                    html += '<div style="margin-left: 20px; margin-top: 10px; padding-left: 10px; border-left: 3px solid #27ae60;">';
                                                    if (typeof discovery === 'string') {
                                                        html += `<strong>💡 ${discovery}</strong> <em style="color: #666;">(Discovery)</em>`;
                                                    } else {
                                                        html += `<strong>💡 ${discovery.name}</strong> <em style="color: #666;">(Discovery)</em><br>`;
                                                        html += `${discovery.description || ''}`;
                                                    }
                                                    html += '</div>';
                                                }
                                            });
                                        }
                                    }
                                    html += '</div>';
                                }
                            });
                        }
                        
                        // Check if primary directly links to discoveries
                        if (primary.discovery && location.data?.discoveries) {
                            const linkedDiscoveries = Array.isArray(primary.discovery) ? primary.discovery : [primary.discovery];
                            linkedDiscoveries.forEach(discName => {
                                const discovery = location.data.discoveries.find(d => 
                                    (typeof d === 'object' && d.name === discName) || d === discName
                                );
                                if (discovery) {
                                    html += '<div style="margin-left: 20px; margin-top: 10px; padding-left: 10px; border-left: 3px solid #27ae60;">';
                                    if (typeof discovery === 'string') {
                                        html += `<strong>💡 ${discovery}</strong> <em style="color: #666;">(Discovery)</em>`;
                                    } else {
                                        html += `<strong>💡 ${discovery.name}</strong> <em style="color: #666;">(Discovery)</em><br>`;
                                        html += `${discovery.description || ''}`;
                                    }
                                    html += '</div>';
                                }
                            });
                        }
                        
                        html += '</div>';
                    }
                });
            }
            
            html += '</div>';
        });
    }

    // NPCs
    if (window.currentEncounterNPCs && window.currentEncounterNPCs.length > 0) {
        html += '<h2>👥 NPCs</h2>';
        window.currentEncounterNPCs.forEach((npc) => {
            const profession = npc.profession?.name || npc.profession || 'Unknown';
            const alignment = npc.alignment?.name || npc.alignment || 'Unknown';
            const appearance = npc.appearance?.description || npc.appearance || 'Unknown';
            const personality = npc.personality?.trait || npc.personality || 'Unknown';
            const secret = npc.secret?.secret || npc.secret || 'Unknown';
            html += '<div class="npc">';
            html += `<h3>${npc.name}</h3>`;
            html += `<p><strong>Species:</strong> ${capitalizeSpecies(npc.species)} | `;
            html += `<strong>Profession:</strong> ${profession} | `;
            html += `<strong>Alignment:</strong> ${alignment}</p>`;
            html += `<p><strong>Appearance:</strong> ${appearance}</p>`;
            html += `<p><strong>Personality:</strong> ${personality}</p>`;
            html += `<div class="secret"><strong>Secret (DM Only):</strong> ${secret}</div>`;
            html += '</div>';
        });
    }

    // Skill Checks
    if (window.currentEncounterSkillChecks && window.currentEncounterSkillChecks.length > 0) {
        html += '<h2>🎲 Skill Checks</h2>';
        window.currentEncounterSkillChecks.forEach((check) => {
            html += '<div class="flow-step">';
            html += `<h3>${check.skill} Check</h3>`;
            html += `<p><strong>Challenge:</strong> ${check.challenge}</p>`;
            html += `<p><strong>Success:</strong> ${check.success}</p>`;
            html += `<p><strong>Failure:</strong> ${check.failure}</p>`;
            html += '</div>';
        });
    }

    // Traps
    if (window.currentEncounterTraps && window.currentEncounterTraps.length > 0) {
        html += '<h2>🪤 Traps</h2>';
        window.currentEncounterTraps.forEach((trap) => {
            html += '<div class="flow-step">';
            html += `<h3>${trap.name}</h3>`;
            html += `<p>${trap.description}</p>`;
            html += `<p><strong>Detect:</strong> ${trap.detectMethod || 'Perception/Investigation'}</p>`;
            html += `<p><strong>Disarm:</strong> ${trap.disarmMethod || "Thieves' Tools"}</p>`;
            if (trap.damageType || trap.severity) {
                html += `<p><strong>Details:</strong> ${trap.damageType ? `Damage Type: ${trap.damageType}. ` : ''}${trap.severity ? `Severity: ${trap.severity}.` : ''}</p>`;
            }
            html += '</div>';
        });
    }

    // Hazards
    if (window.currentEncounterHazards && window.currentEncounterHazards.length > 0) {
        html += '<h2>⚠️ Hazards</h2>';
        window.currentEncounterHazards.forEach((hazard) => {
            html += '<div class="flow-step">';
            html += `<h3>${hazard.name}</h3>`;
            html += `<p>${hazard.description}</p>`;
            html += `<p><strong>Save:</strong> ${hazard.saveAbility || 'Varies'}${hazard.severity ? ` | <strong>Severity:</strong> ${hazard.severity}` : ''}</p>`;
            html += '</div>';
        });
    }

    // Environmental Effects
    if (window.currentEncounterEnvironmentalEffects && window.currentEncounterEnvironmentalEffects.length > 0) {
        html += '<h2>🌀 Environmental Effects</h2>';
        window.currentEncounterEnvironmentalEffects.forEach((effect) => {
            html += '<div class="flow-step">';
            html += `<h3>${effect.name}</h3>`;
            html += `<p>${effect.description}</p>`;
            html += `<p><strong>Effect:</strong> ${effect.mechanicalEffect || 'Varies'}</p>`;
            html += '</div>';
        });
    }

    return html;
}

/**
 * Download file helper
 * @param {string} content - File content
 * @param {string} filename - Filename
 * @param {string} mimeType - MIME type
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Expose export functions to window for HTML onclick usage
window.exportEncounterMarkdown = exportEncounterMarkdown;
window.exportEncounterText = exportEncounterText;
window.exportEncounterPDF = exportEncounterPDF;
