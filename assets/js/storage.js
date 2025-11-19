// LoreWeaver - Storage Module
// Handles saving and loading encounters from localStorage

/**
 * Save current encounter to localStorage
 * @returns {boolean} Success status
 */
export function saveCurrentEncounter() {
    if (!window.encounterTemplate) {
        alert('No encounter to save!');
        return false;
    }

    const encounterName = prompt('Enter a name for this encounter:', window.encounterTemplate.title);
    if (!encounterName) return false;

    const savedEncounter = {
        name: encounterName,
        timestamp: new Date().toISOString(),
        data: {
            template: window.encounterTemplate,
            environment: window.selectedEnvironment,
            partyLevel: parseInt(document.getElementById('partyLevel')?.value || 5),
            locations: window.currentEncounterLocations,
            npcs: window.currentEncounterNPCs,
            skillChecks: window.currentEncounterSkillChecks,
            traps: window.currentEncounterTraps,
            hazards: window.currentEncounterHazards,
            environmentalEffects: window.currentEncounterEnvironmentalEffects,
            flow: window.currentEncounterFlow
        }
    };

    const saved = JSON.parse(localStorage.getItem('savedEncounters') || '[]');
    saved.push(savedEncounter);
    
    try {
        localStorage.setItem('savedEncounters', JSON.stringify(saved));
        alert(`✅ Encounter "${encounterName}" saved successfully!`);
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            alert('❌ Storage limit reached! Please delete some saved encounters to free up space.\n\nYou can manage saved encounters from the Actions menu.');
            console.error('localStorage quota exceeded:', e);
        } else {
            alert('❌ Error saving encounter: ' + e.message);
            console.error('Error saving to localStorage:', e);
        }
        return false;
    }
}

/**
 * Show saved encounters modal
 */
export function showSavedEncounters() {
    const saved = JSON.parse(localStorage.getItem('savedEncounters') || '[]');
    
    if (saved.length === 0) {
        alert('No saved encounters yet!');
        return;
    }

    let html = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
            <div style="background: var(--bg-primary); border-radius: 20px; padding: 30px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);" onclick="event.stopPropagation()">
                <h2 style="margin-top: 0; color: var(--text-primary);">📂 Saved Encounters</h2>
                <div style="margin-top: 20px;">
    `;

    saved.forEach((encounter, index) => {
        const date = new Date(encounter.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        
        html += `
            <div class="saved-encounter-item">
                <div class="saved-encounter-title">${encounter.name}</div>
                <div class="saved-encounter-meta">
                    <span>🗓️ ${formattedDate} | 📍 ${encounter.data.environment} | ⚔️ Level ${encounter.data.partyLevel}</span>
                    <div style="display: flex; gap: 8px;">
                        <button class="result-btn preview-btn" onclick="window.loadSavedEncounter(${index});" style="padding: 6px 12px;">Load</button>
                        <button class="delete-saved-btn" onclick="window.deleteSavedEncounter(${index});">Delete</button>
                    </div>
                </div>
            </div>
        `;
    });

    html += `
                </div>
                <button class="result-btn preview-btn" onclick="this.closest('[style*=fixed]').remove()" style="margin-top: 20px; width: 100%;">Close</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * Load a saved encounter
 * @param {number} index - Index in saved encounters array
 */
export function loadSavedEncounter(index) {
    const saved = JSON.parse(localStorage.getItem('savedEncounters') || '[]');
    
    if (!saved[index]) {
        alert('Encounter not found!');
        return;
    }

    const encounter = saved[index];
    const data = encounter.data;
    
    // Call rebuildEncounterDisplay which is defined in index.html
    if (typeof window.rebuildEncounterDisplay === 'function') {
        window.rebuildEncounterDisplay(data);
    } else {
        console.error('rebuildEncounterDisplay function not found!');
    }

    // Close the modal
    const modal = document.querySelector('[style*="position: fixed"]');
    if (modal) modal.remove();

    console.log('✅ Loaded encounter:', encounter.name);
}

/**
 * Delete a saved encounter
 * @param {number} index - Index in saved encounters array
 */
export function deleteSavedEncounter(index) {
    if (!confirm('Are you sure you want to delete this saved encounter?')) {
        return;
    }

    let saved = JSON.parse(localStorage.getItem('savedEncounters') || '[]');
    
    if (index < 0 || index >= saved.length) {
        alert('Error: Invalid encounter index');
        return;
    }
    
    saved.splice(index, 1);
    
    try {
        localStorage.setItem('savedEncounters', JSON.stringify(saved));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        alert('Error updating saved encounters: ' + e.message);
        return;
    }
    
    // Close and refresh
    const modal = document.querySelector('[style*="position: fixed"]');
    if (modal) modal.remove();
    
    const updatedSaved = JSON.parse(localStorage.getItem('savedEncounters') || '[]');
    if (updatedSaved.length > 0) {
        setTimeout(() => showSavedEncounters(), 100);
    }
}

// Expose storage functions to window for HTML onclick usage
window.saveCurrentEncounter = saveCurrentEncounter;
window.showSavedEncounters = showSavedEncounters;
window.loadSavedEncounter = loadSavedEncounter;
window.deleteSavedEncounter = deleteSavedEncounter;
