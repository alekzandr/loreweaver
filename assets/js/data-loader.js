// LoreWeaver - Data Loader Module
// Handles async loading of all JSON data files

export let encounterTemplates = {};
export let locationObjects = {};
export let npcData = {};
export let skillChecksData = {};
export let dangersData = {};
export let dataLoaded = false;

/**
 * Load all data files from the data/ directory
 * Returns a promise that resolves when all data is loaded
 */
export async function loadData() {
    try {
        console.log('Starting data load...');
        const [encountersResponse, locationsResponse, npcsResponse, skillChecksResponse, dangersResponse] = await Promise.all([
            fetch('data/encounters.json').catch(err => { console.error('Failed to fetch encounters.json:', err); return null; }),
            fetch('data/locations.json').catch(err => { console.error('Failed to fetch locations.json:', err); return null; }),
            fetch('data/npcs.json').catch(err => { console.error('Failed to fetch npcs.json:', err); return null; }),
            fetch('data/skillchecks.json').catch(err => { console.error('Failed to fetch skillchecks.json:', err); return null; }),
            fetch('data/dangers.json').catch(err => { console.error('Failed to fetch dangers.json:', err); return null; })
        ]);

        if (encountersResponse && encountersResponse.ok) {
            encounterTemplates = await encountersResponse.json();
            console.log('✓ Loaded encounters.json:', Object.keys(encounterTemplates).length, 'environments');
        } else {
            console.error('❌ Failed to load encounters.json - response:', encountersResponse?.status);
        }

        if (locationsResponse && locationsResponse.ok) {
            locationObjects = await locationsResponse.json();
            console.log('✓ Loaded locations.json');
        } else {
            console.error('❌ Failed to load locations.json - response:', locationsResponse?.status);
        }

        if (npcsResponse && npcsResponse.ok) {
            npcData = await npcsResponse.json();
            console.log('✓ Loaded npcs.json');
        } else {
            console.error('❌ Failed to load npcs.json - response:', npcsResponse?.status);
        }

        if (skillChecksResponse && skillChecksResponse.ok) {
            skillChecksData = await skillChecksResponse.json();
            console.log('✓ Loaded skillchecks.json:', skillChecksData.skillChecks?.length || 0, 'skill checks');
        } else {
            console.error('❌ Failed to load skillchecks.json - response:', skillChecksResponse?.status);
        }

        if (dangersResponse && dangersResponse.ok) {
            dangersData = await dangersResponse.json();
            console.log('✓ Loaded dangers.json:',
                dangersData.traps?.length || 0, 'traps,',
                dangersData.hazards?.length || 0, 'hazards,',
                dangersData.environmentalEffects?.length || 0, 'effects');
        } else {
            console.error('❌ Failed to load dangers.json - response:', dangersResponse?.status);
        }

        dataLoaded = true;
        console.log('✓ Data load complete');

        // Expose data to window for inline scripts
        window.encounterTemplates = encounterTemplates;
        window.locationObjects = locationObjects;
        window.npcData = npcData;
        window.skillChecksData = skillChecksData;
        window.dangersData = dangersData;
        window.dataLoaded = dataLoaded;

        return true;
    } catch (error) {
        console.error('❌ Error during data load:', error);
        dataLoaded = false;
        window.dataLoaded = false;
        return false;
    }
}

// Also expose the loadData function to window
window.loadData = loadData;
