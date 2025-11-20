// LoreWeaver - Export Module
// Handles exporting encounters in various formats using Strategy Pattern

import { exportManager } from './export-strategies.mjs';

/**
 * Gather current encounter data from window globals
 * @returns {Object} Encounter data object
 */
function gatherEncounterData() {
    return {
        encounterTemplate: window.encounterTemplate,
        selectedEnvironment: window.selectedEnvironment,
        partyLevel: document.getElementById('partyLevel')?.value,
        currentEncounterFlow: window.currentEncounterFlow,
        currentEncounterLocations: window.currentEncounterLocations,
        currentEncounterNPCs: window.currentEncounterNPCs,
        currentEncounterSkillChecks: window.currentEncounterSkillChecks,
        currentEncounterDangers: window.currentEncounterDangers
    };
}

/**
 * Export encounter as Markdown
 * Uses Strategy Pattern with MarkdownExportStrategy
 */
export function exportEncounterMarkdown() {
    console.log('🔍 Export Markdown called');
    try {
        const encounterData = gatherEncounterData();
        console.log('Encounter data gathered:', encounterData);
        exportManager.exportAndDownload(encounterData, 'markdown');
        console.log('✅ Markdown export successful');
    } catch (error) {
        console.error('❌ Markdown export failed:', error);
        alert('Export failed: ' + error.message);
    }
}

/**
 * Export encounter as plain text
 * Uses Strategy Pattern with TextExportStrategy
 */
export function exportEncounterText() {
    console.log('🔍 Export Text called');
    try {
        const encounterData = gatherEncounterData();
        exportManager.exportAndDownload(encounterData, 'text');
        console.log('✅ Text export successful');
    } catch (error) {
        console.error('❌ Text export failed:', error);
        alert('Export failed: ' + error.message);
    }
}

/**
 * Export encounter as PDF (opens print dialog)
 * Uses Strategy Pattern with HTMLExportStrategy
 */
export function exportEncounterPDF() {
    console.log('🔍 Export PDF called');
    try {
        const encounterData = gatherEncounterData();
        const result = exportManager.export(encounterData, 'html', {
            includeStyles: true,
            printMode: true
        });
        
        // Open print window with generated HTML
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Encounter - ${encounterData.encounterTemplate?.title || 'Unknown'}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
                ${result.content}
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; background: #3498db; color: white; border: none; border-radius: 4px;">Print / Save as PDF</button>
                    <button onclick="window.close()" style="padding: 10px 20px; font-size: 16px; cursor: pointer; margin-left: 10px; background: #95a5a6; color: white; border: none; border-radius: 4px;">Close</button>
                </div>
                <style>
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </body>
            </html>
        `);
        printWindow.document.close();
        console.log('✅ PDF export window opened');
    } catch (error) {
        console.error('❌ PDF export failed:', error);
        alert('Export failed: ' + error.message);
    }
}

/**
 * Export encounter as JSON
 * Uses Strategy Pattern with JSONExportStrategy
 */
export function exportEncounterJSON() {
    console.log('🔍 Export JSON called');
    try {
        const encounterData = gatherEncounterData();
        exportManager.exportAndDownload(encounterData, 'json', {
            pretty: true,
            includeMetadata: true
        });
        console.log('✅ JSON export successful');
    } catch (error) {
        console.error('❌ JSON export failed:', error);
        alert('Export failed: ' + error.message);
    }
}

/**
 * Export encounter using a specific strategy
 * @param {string} strategyKey - The strategy to use ('markdown', 'text', 'html', 'json')
 * @param {Object} [options] - Strategy-specific options
 */
export function exportEncounter(strategyKey = 'markdown', options = {}) {
    console.log(`🔍 Export called with strategy: ${strategyKey}`);
    try {
        const encounterData = gatherEncounterData();
        
        // Special handling for PDF (HTML + print dialog)
        if (strategyKey === 'pdf' || strategyKey === 'html') {
            exportEncounterPDF();
            return;
        }
        
        exportManager.exportAndDownload(encounterData, strategyKey, options);
        console.log(`✅ Export successful: ${strategyKey}`);
    } catch (error) {
        console.error(`❌ Export failed (${strategyKey}):`, error);
        alert('Export failed: ' + error.message);
    }
}

/**
 * Get available export formats
 * @returns {Array<Object>} Array of available export formats
 */
export function getAvailableFormats() {
    const strategies = exportManager.getAllStrategies();
    return strategies.map(({ key, name, fileExtension }) => ({
        key,
        name,
        fileExtension,
        displayName: `${name} (.${fileExtension})`
    }));
}
