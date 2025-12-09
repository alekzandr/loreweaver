// LoreWeaver - Storage Module
// Handles saving and loading adventures from localStorage

/**
 * Initialize storage and migrate old data if necessary
 */
(function initStorage() {
    try {
        const oldSaved = localStorage.getItem('savedEncounters');
        const currentSaved = localStorage.getItem('savedAdventures');

        // Migration: If we have old data but no new data, migrate it
        if (oldSaved && !currentSaved) {
            console.log('🔄 Migrating saved encounters to saved adventures...');
            localStorage.setItem('savedAdventures', oldSaved);
            // Optional: Backup old data or just leave it. We'll leave it for safety.
        }
    } catch (e) {
        console.error('Error initializing storage migration:', e);
    }
})();

/**
 * Save current adventure to localStorage
 * @returns {boolean} Success status
 */
export function saveCurrentAdventure() {
    if (!window.adventureTemplate) {
        alert('No adventure to save!');
        return false;
    }

    const adventureName = prompt('Enter a name for this adventure:', window.adventureTemplate.title);
    if (!adventureName) return false;

    const savedAdventure = {
        name: adventureName,
        timestamp: new Date().toISOString(),
        data: {
            template: window.adventureTemplate,
            environment: window.selectedEnvironment,
            partyLevel: parseInt(document.getElementById('partyLevel')?.value || 5),
            locations: window.currentAdventureLocations,
            npcs: window.currentAdventureNPCs,
            skillChecks: window.currentAdventureSkillChecks,
            traps: window.currentAdventureTraps,
            hazards: window.currentAdventureHazards,
            environmentalEffects: window.currentAdventureEnvironmentalEffects,
            flow: window.currentAdventureFlow
        }
    };

    const saved = JSON.parse(localStorage.getItem('savedAdventures') || '[]');
    saved.push(savedAdventure);

    try {
        localStorage.setItem('savedAdventures', JSON.stringify(saved));
        alert(`✅ Adventure "${adventureName}" saved successfully!`);
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            alert('❌ Storage limit reached! Please delete some saved adventures to free up space.\n\nYou can manage saved adventures from the Actions menu.');
            console.error('localStorage quota exceeded:', e);
        } else {
            alert('❌ Error saving adventure: ' + e.message);
            console.error('Error saving to localStorage:', e);
        }
        return false;
    }
}

/**
 * Show saved adventures modal
 */
export function showSavedAdventures() {
    const saved = JSON.parse(localStorage.getItem('savedAdventures') || '[]');

    if (saved.length === 0) {
        alert('No saved adventures yet!');
        return;
    }

    let html = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;" onclick="this.remove()">
            <div style="background: var(--bg-primary); border-radius: 20px; padding: 30px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);" onclick="event.stopPropagation()">
                <h2 style="margin-top: 0; color: var(--text-primary);">📂 Saved Adventures</h2>
                <div style="margin-top: 20px;">
    `;

    saved.forEach((adventure, index) => {
        const date = new Date(adventure.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        html += `
            <div class="saved-encounter-item">
                <div class="saved-encounter-title">${adventure.name}</div>
                <div class="saved-encounter-meta">
                    <span>🗓️ ${formattedDate} | 📍 ${adventure.data.environment} | ⚔️ Level ${adventure.data.partyLevel}</span>
                    <div style="display: flex; gap: 8px;">
                        <button class="result-btn preview-btn" onclick="window.loadSavedAdventure(${index});" style="padding: 6px 12px;">Load</button>
                        <button class="delete-saved-btn" onclick="window.deleteSavedAdventure(${index});">Delete</button>
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
 * Load a saved adventure
 * @param {number} index - Index in saved adventures array
 */
export function loadSavedAdventure(index) {
    const saved = JSON.parse(localStorage.getItem('savedAdventures') || '[]');

    if (!saved[index]) {
        alert('Adventure not found!');
        return;
    }

    const adventure = saved[index];
    const data = adventure.data;

    // Call rebuildAdventureDisplay which is defined in index.html
    if (typeof window.rebuildAdventureDisplay === 'function') {
        window.rebuildAdventureDisplay(data);
    } else {
        console.error('rebuildAdventureDisplay function not found!');
    }

    // Close the modal
    const modal = document.querySelector('[style*="position: fixed"]');
    if (modal) modal.remove();

    console.log('✅ Loaded adventure:', adventure.name);
}

/**
 * Delete a saved adventure
 * @param {number} index - Index in saved adventures array
 */
export function deleteSavedAdventure(index) {
    if (!confirm('Are you sure you want to delete this saved adventure?')) {
        return;
    }

    let saved = JSON.parse(localStorage.getItem('savedAdventures') || '[]');

    if (index < 0 || index >= saved.length) {
        alert('Error: Invalid adventure index');
        return;
    }

    saved.splice(index, 1);

    try {
        localStorage.setItem('savedAdventures', JSON.stringify(saved));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
        alert('Error updating saved adventures: ' + e.message);
        return;
    }

    // Close and refresh
    const modal = document.querySelector('[style*="position: fixed"]');
    if (modal) modal.remove();

    const updatedSaved = JSON.parse(localStorage.getItem('savedAdventures') || '[]');
    if (updatedSaved.length > 0) {
        setTimeout(() => showSavedAdventures(), 100);
    }
}

// Expose storage functions to window for HTML onclick usage
window.saveCurrentAdventure = saveCurrentAdventure;
window.showSavedAdventures = showSavedAdventures;
window.loadSavedAdventure = loadSavedAdventure;
window.deleteSavedAdventure = deleteSavedAdventure;


