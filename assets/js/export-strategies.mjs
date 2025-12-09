/**
 * Export Strategies Module
 * Implements Strategy Pattern for flexible export format handling
 * 
 * This module provides:
 * - Base ExportStrategy class for defining export interfaces
 * - Concrete strategy implementations for each export format
 * - ExportManager for strategy registration and execution
 * - Type safety and validation
 * - Extensibility for new export formats
 * 
 * @module export-strategies
 * @version 1.5.0
 */

// capitalizeSpecies utility - use global mock in test environment, fallback otherwise
const capitalizeSpecies = globalThis.capitalizeSpecies || function (species) {
    if (!species) return species;
    return species
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');
};

/**
 * Base Export Strategy Class
 * Defines the interface that all export strategies must implement
 * 
 * @abstract
 * @class ExportStrategy
 */
export class ExportStrategy {
    /**
     * Create an export strategy
     * @param {string} name - Human-readable name of the format
     * @param {string} fileExtension - File extension (e.g., 'md', 'txt', 'html')
     * @param {string} mimeType - MIME type for the format
     */
    constructor(name, fileExtension, mimeType) {
        if (this.constructor === ExportStrategy) {
            throw new Error('ExportStrategy is an abstract class and cannot be instantiated directly');
        }

        this.name = name;
        this.fileExtension = fileExtension;
        this.mimeType = mimeType;
        this.options = {};
    }

    /**
     * Set export options
     * @param {Object} options - Strategy-specific options
     */
    setOptions(options) {
        this.options = { ...this.options, ...options };
    }

    /**
     * Get export options
     * @returns {Object} Current options
     */
    getOptions() {
        return { ...this.options };
    }

    /**
     * Export adventure data
     * Must be implemented by concrete strategies
     * 
     * @abstract
     * @param {Object} _adventureData - The adventure data to export
     * @returns {string} Formatted export content
     * @throws {Error} If not implemented by subclass
     */
    export(_adventureData) {
        throw new Error('export() must be implemented by concrete strategy');
    }

    /**
     * Validate adventure data
     * @param {Object} adventureData - The adventure data to validate
     * @returns {boolean} True if valid
     * @throws {Error} If data is invalid
     */
    validateData(adventureData) {
        if (!adventureData) {
            throw new Error('Adventure data is required');
        }
        return true;
    }

    /**
     * Generate filename for export
     * @param {Object} adventureData - The adventure data
     * @returns {string} Generated filename
     */
    generateFilename(adventureData) {
        const title = adventureData?.adventureTemplate?.title || 'adventure';
        const timestamp = Date.now();
        const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        return `${safeName}-${timestamp}.${this.fileExtension}`;
    }

    /**
     * Sanitize text content to prevent XSS
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitize(text) {
        if (typeof text !== 'string') return '';
        return text
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

/**
 * Markdown Export Strategy
 * Exports encounters in Markdown format
 * 
 * @class MarkdownExportStrategy
 * @extends ExportStrategy
 */
export class MarkdownExportStrategy extends ExportStrategy {
    constructor() {
        super('Markdown', 'md', 'text/markdown');
        this.options = {
            includeMetadata: true,
            includeFlowNumbers: true,
            includeIcons: true
        };
    }

    /**
     * Export adventure as Markdown
     * @param {Object} data - Adventure data
     * @returns {string} Markdown content
     */
    export(data) {
        this.validateData(data);

        let md = '';

        // Title
        md += `# ${data.adventureTemplate?.title || 'Adventure'}\n\n`;

        // Metadata
        if (this.options.includeMetadata) {
            md += `**Environment:** ${data.selectedEnvironment || 'Unknown'} | **Party Level:** ${data.partyLevel || 'Unknown'}\n\n`;
        }

        // Description
        const descSrc = data.encounterTemplate?.descriptions || data.encounterTemplate?.description;
        if (descSrc) {
            const description = Array.isArray(descSrc) ? descSrc[0] : descSrc;
            md += `${description}\n\n`;
        }

        // Adventure Flow
        if (data.currentAdventureFlow && data.currentAdventureFlow.length > 0) {
            md += `## ${this.options.includeIcons ? '🗺️ ' : ''}Adventure Flow\n\n`;
            data.currentAdventureFlow.forEach((step) => {
                md += `### Step ${step.step}: ${step.title}\n\n`;

                if (step.location) {
                    md += `**Location:** ${step.location.name || step.location.key}\n\n`;
                }

                if (step.description) {
                    md += `${step.description}\n\n`;
                }

                if (step.dmTips && step.dmTips.length > 0) {
                    md += `**${this.options.includeIcons ? '💡 ' : ''}DM Tips:**\n`;
                    step.dmTips.forEach(tip => md += `- ${tip}\n`);
                    md += '\n';
                }

                if (step.connections && step.connections.length > 0) {
                    md += '**Connections:**\n';
                    step.connections.forEach(conn => md += `- ${conn}\n`);
                    md += '\n';
                }

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
        if (data.currentAdventureLocations && data.currentAdventureLocations.length > 0) {
            md += `## ${this.options.includeIcons ? '📍 ' : ''}Locations\n\n`;
            data.currentAdventureLocations.forEach((location) => {
                md += `### ${location.name || location.key}\n\n`;
                if (location.data?.description) {
                    md += `${location.data.description}\n\n`;
                }
            });
        }

        // NPCs
        if (data.currentAdventureNPCs && data.currentAdventureNPCs.length > 0) {
            md += `## ${this.options.includeIcons ? '👥 ' : ''}NPCs\n\n`;
            data.currentAdventureNPCs.forEach((npc) => {
                md += `### ${npc.name || 'NPC'}\n\n`;
                if (npc.data) {
                    if (npc.data.species) md += `**Species:** ${capitalizeSpecies(npc.data.species)}\n`;
                    if (npc.data.class) md += `**Class:** ${npc.data.class}\n`;
                    if (npc.data.personality) md += `**Personality:** ${npc.data.personality}\n`;
                    if (npc.data.motivation) md += `**Motivation:** ${npc.data.motivation}\n`;
                    md += '\n';
                }
            });
        }

        // Skill Checks
        if (data.currentAdventureSkillChecks && data.currentAdventureSkillChecks.length > 0) {
            md += `## ${this.options.includeIcons ? '🎲 ' : ''}Skill Checks\n\n`;
            data.currentAdventureSkillChecks.forEach((check) => {
                md += `### ${check.name || 'Check'}\n\n`;
                if (check.data) {
                    if (check.data.skill) md += `**Skill:** ${check.data.skill} | **DC:** ${check.data.dc || 'Variable'}\n`;
                    if (check.data.description) md += `${check.data.description}\n`;
                    if (check.data.success) md += `**Success:** ${check.data.success}\n`;
                    if (check.data.failure) md += `**Failure:** ${check.data.failure}\n`;
                    md += '\n';
                }
            });
        }

        // Dangers
        if (data.currentAdventureDangers && data.currentAdventureDangers.length > 0) {
            md += `## ${this.options.includeIcons ? '⚠️ ' : ''}Dangers\n\n`;
            data.currentAdventureDangers.forEach((danger) => {
                md += `### ${danger.name || 'Danger'}\n\n`;
                if (danger.data) {
                    if (danger.data.description) md += `${danger.data.description}\n`;
                    if (danger.data.trigger) md += `**Trigger:** ${danger.data.trigger}\n`;
                    if (danger.data.effect) md += `**Effect:** ${danger.data.effect}\n`;
                    md += '\n';
                }
            });
        }

        return md;
    }
}

/**
 * Plain Text Export Strategy
 * Exports encounters in plain text format
 * 
 * @class TextExportStrategy
 * @extends ExportStrategy
 */
export class TextExportStrategy extends ExportStrategy {
    constructor() {
        super('Plain Text', 'txt', 'text/plain');
        this.options = {
            includeMetadata: true,
            lineLength: 80,
            useDividers: true
        };
    }

    /**
     * Export encounter as plain text
     * @param {Object} data - Encounter data
     * @returns {string} Plain text content
     */
    export(data) {
        this.validateData(data);

        let text = '';
        const divider = this.options.useDividers ? '='.repeat(this.options.lineLength) + '\n' : '';

        // Title
        text += divider;
        text += `${data.adventureTemplate?.title || 'Adventure'}\n`;
        text += divider;
        text += '\n';

        // Metadata
        if (this.options.includeMetadata) {
            text += `Environment: ${data.selectedEnvironment || 'Unknown'}\n`;
            text += `Party Level: ${data.partyLevel || 'Unknown'}\n\n`;
        }

        // Description
        const descSrc = data.encounterTemplate?.descriptions || data.encounterTemplate?.description;
        if (descSrc) {
            const description = Array.isArray(descSrc) ? descSrc[0] : descSrc;
            text += this.wrapText(description) + '\n\n';
        }

        // Adventure Flow
        if (data.currentAdventureFlow && data.currentAdventureFlow.length > 0) {
            text += 'ADVENTURE FLOW\n';
            text += '-'.repeat(this.options.lineLength) + '\n\n';
            data.currentAdventureFlow.forEach((step) => {
                text += `Step ${step.step}: ${step.title}\n\n`;
                if (step.description) {
                    text += this.wrapText(step.description) + '\n\n';
                }
            });
        }

        // Locations
        if (data.currentAdventureLocations && data.currentAdventureLocations.length > 0) {
            text += 'LOCATIONS\n';
            text += '-'.repeat(this.options.lineLength) + '\n\n';
            data.currentAdventureLocations.forEach((location) => {
                text += `${location.name || location.key}\n`;
                if (location.data?.description) {
                    text += this.wrapText(location.data.description) + '\n';
                }
                text += '\n';
            });
        }

        // NPCs
        if (data.currentAdventureNPCs && data.currentAdventureNPCs.length > 0) {
            text += 'NPCs\n';
            text += '-'.repeat(this.options.lineLength) + '\n\n';
            data.currentAdventureNPCs.forEach((npc) => {
                text += `${npc.name || 'NPC'}\n`;
                if (npc.data) {
                    if (npc.data.species) text += `  Species: ${capitalizeSpecies(npc.data.species)}\n`;
                    if (npc.data.class) text += `  Class: ${npc.data.class}\n`;
                    if (npc.data.personality) text += `  Personality: ${npc.data.personality}\n`;
                }
                text += '\n';
            });
        }

        return text;
    }

    /**
     * Wrap text to specified line length
     * @param {string} text - Text to wrap
     * @returns {string} Wrapped text
     */
    wrapText(text) {
        if (!text) return '';
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + word).length > this.options.lineLength) {
                if (currentLine) lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine += word + ' ';
            }
        });

        if (currentLine) lines.push(currentLine.trim());
        return lines.join('\n');
    }
}

/**
 * HTML Export Strategy
 * Exports encounters in HTML format for printing/PDF
 * 
 * @class HTMLExportStrategy
 * @extends ExportStrategy
 */
export class HTMLExportStrategy extends ExportStrategy {
    constructor() {
        super('HTML', 'html', 'text/html');
        this.options = {
            includeStyles: true,
            printMode: true,
            colorScheme: 'light'
        };
    }

    /**
     * Export encounter as HTML
     * @param {Object} data - Encounter data
     * @returns {string} HTML content
     */
    export(data) {
        this.validateData(data);

        let html = '';

        if (this.options.includeStyles) {
            html += this.getStyles();
        }

        html += '<div class="adventure-export">';

        // Title
        html += `<h1>${this.sanitize(data.adventureTemplate?.title || 'Adventure')}</h1>`;

        // Metadata
        html += '<div class="meta">';
        html += `<span><strong>Environment:</strong> ${this.sanitize(data.selectedEnvironment || 'Unknown')}</span>`;
        html += `<span><strong>Party Level:</strong> ${this.sanitize(data.partyLevel || 'Unknown')}</span>`;
        html += '</div>';

        // Description
        const descSrc = data.encounterTemplate?.descriptions || data.encounterTemplate?.description;
        if (descSrc) {
            const description = Array.isArray(descSrc) ? descSrc[0] : descSrc;
            html += `<p class="description">${this.sanitize(description)}</p>`;
        }

        // Adventure Flow
        if (data.currentAdventureFlow && data.currentAdventureFlow.length > 0) {
            html += '<div class="section"><h2>🗺️ Adventure Flow</h2>';
            data.currentAdventureFlow.forEach((step) => {
                html += '<div class="flow-step">';
                html += `<h3>Step ${step.step}: ${this.sanitize(step.title)}</h3>`;
                if (step.description) {
                    html += `<p>${this.sanitize(step.description)}</p>`;
                }
                html += '</div>';
            });
            html += '</div>';
        }

        // Locations
        if (data.currentAdventureLocations && data.currentAdventureLocations.length > 0) {
            html += '<div class="section"><h2>📍 Locations</h2>';
            data.currentAdventureLocations.forEach((location) => {
                html += '<div class="location">';
                html += `<h3>${this.sanitize(location.name || location.key)}</h3>`;
                if (location.data?.description) {
                    html += `<p>${this.sanitize(location.data.description)}</p>`;
                }
                html += '</div>';
            });
            html += '</div>';
        }

        // NPCs
        if (data.currentAdventureNPCs && data.currentAdventureNPCs.length > 0) {
            html += '<div class="section"><h2>👥 NPCs</h2>';
            data.currentAdventureNPCs.forEach((npc) => {
                html += '<div class="npc">';
                html += `<h3>${this.sanitize(npc.name || 'NPC')}</h3>`;
                if (npc.data) {
                    html += '<dl>';
                    if (npc.data.species) html += `<dt>Species:</dt><dd>${this.sanitize(capitalizeSpecies(npc.data.species))}</dd>`;
                    if (npc.data.class) html += `<dt>Class:</dt><dd>${this.sanitize(npc.data.class)}</dd>`;
                    if (npc.data.personality) html += `<dt>Personality:</dt><dd>${this.sanitize(npc.data.personality)}</dd>`;
                    html += '</dl>';
                }
                html += '</div>';
            });
            html += '</div>';
        }

        html += '</div>';

        return html;
    }

    /**
     * Get CSS styles for HTML export
     * @returns {string} CSS styles
     */
    getStyles() {
        return `
        <style>
            .adventure-export {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 800px;
                margin: 40px auto;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            .adventure-export h1 {
                color: #2c3e50;
                border-bottom: 3px solid #3498db;
                padding-bottom: 10px;
            }
            .adventure-export h2 {
                color: #34495e;
                margin-top: 25px;
                border-bottom: 2px solid #95a5a6;
                padding-bottom: 5px;
            }
            .encounter-export h3 {
                color: #7f8c8d;
                margin-top: 20px;
            }
            .meta {
                background: #ecf0f1;
                padding: 10px;
                border-radius: 5px;
                margin: 20px 0;
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
            }
            .section {
                margin: 30px 0;
            }
            .flow-step, .location, .npc {
                background: #f8f9fa;
                padding: 15px;
                margin: 15px 0;
                border-left: 4px solid #3498db;
                page-break-inside: avoid;
            }
            dl {
                display: grid;
                grid-template-columns: auto 1fr;
                gap: 10px;
            }
            dt {
                font-weight: bold;
            }
            @media print {
                .encounter-export {
                    margin: 0;
                    padding: 15px;
                }
            }
        </style>
        `;
    }
}

/**
 * JSON Export Strategy
 * Exports encounters in structured JSON format
 * 
 * @class JSONExportStrategy
 * @extends ExportStrategy
 */
export class JSONExportStrategy extends ExportStrategy {
    constructor() {
        super('JSON', 'json', 'application/json');
        this.options = {
            pretty: true,
            includeMetadata: true
        };
    }

    /**
     * Export encounter as JSON
     * @param {Object} data - Encounter data
     * @returns {string} JSON content
     */
    export(data) {
        this.validateData(data);

        const exportData = {
            meta: this.options.includeMetadata ? {
                exportedAt: new Date().toISOString(),
                exportedBy: 'LoreWeaver',
                version: '1.5.0'
            } : undefined,
            adventure: {
                title: data.adventureTemplate?.title || 'Adventure',
                environment: data.selectedEnvironment,
                partyLevel: data.partyLevel,
                description: data.adventureTemplate?.description || data.adventureTemplate?.descriptions?.[0]
            },
            flow: data.currentAdventureFlow || [],
            locations: data.currentAdventureLocations || [],
            npcs: data.currentAdventureNPCs || [],
            skillChecks: data.currentAdventureSkillChecks || [],
            dangers: data.currentAdventureDangers || []
        };

        return this.options.pretty
            ? JSON.stringify(exportData, null, 2)
            : JSON.stringify(exportData);
    }
}

/**
 * Export Manager
 * Manages strategy registration and execution
 * 
 * @class ExportManager
 */
export class ExportManager {
    constructor() {
        this.strategies = new Map();
        this.defaultStrategy = null;

        // Register built-in strategies
        this.registerStrategy('markdown', new MarkdownExportStrategy());
        this.registerStrategy('text', new TextExportStrategy());
        this.registerStrategy('html', new HTMLExportStrategy());
        this.registerStrategy('json', new JSONExportStrategy());

        this.setDefaultStrategy('markdown');
    }

    /**
     * Register a new export strategy
     * @param {string} key - Unique identifier for the strategy
     * @param {ExportStrategy} strategy - The strategy instance
     * @throws {Error} If strategy is invalid
     */
    registerStrategy(key, strategy) {
        if (!(strategy instanceof ExportStrategy)) {
            throw new Error('Strategy must be an instance of ExportStrategy');
        }
        this.strategies.set(key, strategy);
    }

    /**
     * Get a registered strategy
     * @param {string} key - Strategy identifier
     * @returns {ExportStrategy|null} The strategy or null if not found
     */
    getStrategy(key) {
        return this.strategies.get(key) || null;
    }

    /**
     * Get all registered strategies
     * @returns {Array<{key: string, strategy: ExportStrategy}>} Array of strategies
     */
    getAllStrategies() {
        return Array.from(this.strategies.entries()).map(([key, strategy]) => ({
            key,
            name: strategy.name,
            fileExtension: strategy.fileExtension,
            strategy
        }));
    }

    /**
     * Set the default export strategy
     * @param {string} key - Strategy identifier
     * @throws {Error} If strategy not found
     */
    setDefaultStrategy(key) {
        if (!this.strategies.has(key)) {
            throw new Error(`Strategy '${key}' not found`);
        }
        this.defaultStrategy = key;
    }

    /**
     * Export adventure data using specified strategy
     * @param {Object} adventureData - The data to export
     * @param {string} [strategyKey] - Strategy to use (defaults to default strategy)
     * @param {Object} [options] - Options to pass to the strategy
     * @returns {Object} Export result with content and metadata
     * @throws {Error} If strategy not found or export fails
     */
    export(adventureData, strategyKey = null, options = {}) {
        const key = strategyKey || this.defaultStrategy;
        const strategy = this.getStrategy(key);

        if (!strategy) {
            throw new Error(`Export strategy '${key}' not found`);
        }

        try {
            // Set options if provided
            if (Object.keys(options).length > 0) {
                strategy.setOptions(options);
            }

            // Perform export
            const content = strategy.export(adventureData);
            const filename = strategy.generateFilename(adventureData);

            return {
                success: true,
                content,
                filename,
                mimeType: strategy.mimeType,
                strategy: strategy.name
            };
        } catch (error) {
            console.error(`Export failed with strategy '${key}':`, error);
            throw new Error(`Export failed: ${error.message}`);
        }
    }

    /**
     * Export and trigger download
     * @param {Object} adventureData - The data to export
     * @param {string} [strategyKey] - Strategy to use
     * @param {Object} [options] - Strategy options
     */
    exportAndDownload(adventureData, strategyKey = null, options = {}) {
        const result = this.export(adventureData, strategyKey, options);
        this.downloadFile(result.content, result.filename, result.mimeType);
    }

    /**
     * Trigger file download
     * @param {string} content - File content
     * @param {string} filename - Name of the file
     * @param {string} mimeType - MIME type
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Create and export singleton instance
export const exportManager = new ExportManager();
