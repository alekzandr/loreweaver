// LoreWeaver - Export Module
// Handles exporting encounters in various formats using Strategy Pattern

import { exportManager } from './export-strategies.mjs';

/**
 * Gather current adventure data from window globals
 * @returns {Object} Adventure data object
 */
function gatherAdventureData() {
    return {
        adventureTemplate: window.adventureTemplate,
        selectedEnvironment: window.selectedEnvironment,
        partyLevel: document.getElementById('partyLevel')?.value,
        currentAdventureFlow: window.currentAdventureFlow,
        currentAdventureLocations: window.currentAdventureLocations,
        currentAdventureNPCs: window.currentAdventureNPCs,
        currentAdventureSkillChecks: window.currentAdventureSkillChecks,
        currentAdventureDangers: window.currentAdventureDangers
    };
}

/**
 * Export adventure as Markdown
 * Uses Strategy Pattern with MarkdownExportStrategy
 */
export function exportAdventureMarkdown() {
    console.log('🔍 Export Markdown called');
    try {
        const adventureData = gatherAdventureData();
        console.log('Adventure data gathered:', adventureData);
        exportManager.exportAndDownload(adventureData, 'markdown');
        console.log('✅ Markdown export successful');
    } catch (error) {
        console.error('❌ Markdown export failed:', error);
        alert('Export failed: ' + error.message);
    }
}

/**
 * Export adventure as plain text
 * Uses Strategy Pattern with TextExportStrategy
 */
export function exportAdventureText() {
    console.log('🔍 Export Text called');
    try {
        const adventureData = gatherAdventureData();
        exportManager.exportAndDownload(adventureData, 'text');
        console.log('✅ Text export successful');
    } catch (error) {
        console.error('❌ Text export failed:', error);
        alert('Export failed: ' + error.message);
    }
}

/**
 * Export adventure as PDF (opens print dialog)
 * Uses Strategy Pattern with HTMLExportStrategy
 */
export function exportAdventurePDF() {
    console.log('🔍 Export PDF called');
    try {
        const adventureData = gatherAdventureData();
        const result = exportManager.export(adventureData, 'html', {
            includeStyles: true,
            printMode: true
        });

        // Open print window with generated HTML
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Adventure - ${adventureData.adventureTemplate?.title || 'Unknown'}</title>
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
 * Export adventure as JSON
 * Uses Strategy Pattern with JSONExportStrategy
 */
export function exportAdventureJSON() {
    console.log('🔍 Export JSON called');
    try {
        const adventureData = gatherAdventureData();
        exportManager.exportAndDownload(adventureData, 'json', {
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
 * Export adventure using a specific strategy
 * @param {string} strategyKey - The strategy to use ('markdown', 'text', 'html', 'json')
 * @param {Object} [options] - Strategy-specific options
 */
export function exportAdventure(strategyKey = 'markdown', options = {}) {
    console.log(`🔍 Export called with strategy: ${strategyKey}`);
    try {
        const adventureData = gatherAdventureData();

        // Special handling for PDF (HTML + print dialog)
        if (strategyKey === 'pdf' || strategyKey === 'html') {
            exportAdventurePDF();
            return;
        }

        exportManager.exportAndDownload(adventureData, strategyKey, options);
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
