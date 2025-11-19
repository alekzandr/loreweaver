/**
 * Command Pattern Implementation for Undo/Redo Functionality
 * 
 * Security considerations:
 * - Commands are kept in memory only (no sensitive data persistence)
 * - History size is limited to prevent memory exhaustion
 * - Input validation on all command parameters
 * - No eval() or dynamic code execution
 * 
 * @module command-history
 */

/**
 * CommandHistory manages the execution and undo/redo of commands
 * Implements a stack-based history with configurable size limits
 */
export class CommandHistory {
    /**
     * @param {number} maxHistorySize - Maximum number of commands to keep in history
     */
    constructor(maxHistorySize = 50) {
        if (maxHistorySize < 1 || maxHistorySize > 200) {
            throw new Error('maxHistorySize must be between 1 and 200');
        }
        
        this.history = [];
        this.currentIndex = -1;
        this.maxHistorySize = maxHistorySize;
        this.listeners = new Set();
    }
    
    /**
     * Execute a command and add it to history
     * @param {Command} command - Command to execute
     * @returns {*} Result of command execution
     */
    execute(command) {
        if (!command || typeof command.execute !== 'function') {
            throw new Error('Command must have an execute method');
        }
        
        if (typeof command.undo !== 'function') {
            throw new Error('Command must have an undo method');
        }
        
        // Execute the command
        const result = command.execute();
        
        // Remove any "future" commands (after undo)
        this.history = this.history.slice(0, this.currentIndex + 1);
        
        // Add to history
        this.history.push(command);
        this.currentIndex++;
        
        // Limit history size (FIFO - remove oldest)
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.currentIndex--;
        }
        
        this.notifyListeners();
        return result;
    }
    
    /**
     * Undo the last command
     * @returns {boolean} True if undo was successful
     */
    undo() {
        if (!this.canUndo()) {
            return false;
        }
        
        const command = this.history[this.currentIndex];
        
        try {
            command.undo();
            this.currentIndex--;
            this.notifyListeners();
            return true;
        } catch (error) {
            console.error('Error during undo:', error);
            return false;
        }
    }
    
    /**
     * Redo the next command
     * @returns {boolean} True if redo was successful
     */
    redo() {
        if (!this.canRedo()) {
            return false;
        }
        
        this.currentIndex++;
        const command = this.history[this.currentIndex];
        
        try {
            // Always use redo() which should restore the saved state
            command.redo();
            this.notifyListeners();
            return true;
        } catch (error) {
            console.error('Error during redo:', error);
            this.currentIndex--;
            return false;
        }
    }
    
    /**
     * Check if undo is possible
     * @returns {boolean}
     */
    canUndo() {
        return this.currentIndex >= 0;
    }
    
    /**
     * Check if redo is possible
     * @returns {boolean}
     */
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }
    
    /**
     * Get the current history (up to current index)
     * @returns {Array<Command>}
     */
    getHistory() {
        return this.history.slice(0, this.currentIndex + 1);
    }
    
    /**
     * Clear all history
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.notifyListeners();
    }
    
    /**
     * Get history metadata (for debugging/UI)
     * @returns {Object}
     */
    getMetadata() {
        return {
            size: this.history.length,
            currentIndex: this.currentIndex,
            canUndo: this.canUndo(),
            canRedo: this.canRedo(),
            maxSize: this.maxHistorySize
        };
    }
    
    /**
     * Subscribe to history changes
     * @param {Function} listener - Callback when history changes
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        if (typeof listener !== 'function') {
            throw new Error('Listener must be a function');
        }
        
        this.listeners.add(listener);
        
        return () => {
            this.listeners.delete(listener);
        };
    }
    
    /**
     * Notify all listeners of history changes
     * @private
     */
    notifyListeners() {
        const metadata = this.getMetadata();
        this.listeners.forEach(listener => {
            try {
                listener(metadata);
            } catch (error) {
                console.error('Error in history listener:', error);
            }
        });
    }
}

/**
 * Base Command interface
 * All commands should extend this or implement these methods
 */
export class Command {
    constructor(description = 'Command') {
        this.description = description;
        this.timestamp = Date.now();
    }
    
    execute() {
        throw new Error('Execute method must be implemented');
    }
    
    undo() {
        throw new Error('Undo method must be implemented');
    }
    
    redo() {
        throw new Error('Redo method must be implemented');
    }
    
    getDescription() {
        return this.description;
    }
}

/**
 * Command to generate an encounter
 * Captures and stores the actual generated content for proper undo/redo
 */
export class GenerateEncounterCommand extends Command {
    /**
     * @param {Function} generateFn - Function that generates an encounter
     * @param {Function} getStateFn - Function that captures current state
     * @param {Function} setStateFn - Function that restores a saved state
     */
    constructor(generateFn, getStateFn, setStateFn) {
        super('Generate Encounter');
        
        if (typeof generateFn !== 'function') {
            throw new Error('generateFn must be a function');
        }
        if (typeof getStateFn !== 'function') {
            throw new Error('getStateFn must be a function');
        }
        if (typeof setStateFn !== 'function') {
            throw new Error('setStateFn must be a function');
        }
        
        this.generateFn = generateFn;
        this.getStateFn = getStateFn;
        this.setStateFn = setStateFn;
        
        // Capture the state BEFORE generation
        this.previousState = this.captureState();
        this.newState = null;
    }
    
    execute() {
        // Generate new content
        const result = this.generateFn();
        
        // Capture the state AFTER generation
        this.newState = this.captureState();
        
        return result;
    }
    
    undo() {
        // Restore the previous state
        this.restoreState(this.previousState);
    }
    
    redo() {
        // Restore the generated state
        this.restoreState(this.newState);
    }
    
    /**
     * Capture current state
     * @private
     */
    captureState() {
        const state = this.getStateFn();
        return this.deepClone(state);
    }
    
    /**
     * Restore a saved state
     * @private
     */
    restoreState(state) {
        this.setStateFn(state);
    }
    
    /**
     * Deep clone an object to prevent reference issues
     * @private
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        // Security: Don't clone functions or DOM elements
        if (typeof obj === 'function' || obj instanceof HTMLElement) {
            return null;
        }
        
        try {
            // Use structuredClone if available (modern browsers)
            if (typeof structuredClone === 'function') {
                return structuredClone(obj);
            }
            
            // Fallback to JSON clone (has limitations but safe)
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.error('Error cloning object:', error);
            return null;
        }
    }
}

/**
 * Command to generate an NPC
 * Captures and stores the actual generated NPC for proper undo/redo
 */
export class GenerateNPCCommand extends Command {
    /**
     * @param {Function} generateFn - Function that generates an NPC
     * @param {Function} getStateFn - Function that captures current state
     * @param {Function} setStateFn - Function that restores a saved state
     */
    constructor(generateFn, getStateFn, setStateFn) {
        super('Generate NPC');
        
        if (typeof generateFn !== 'function') {
            throw new Error('generateFn must be a function');
        }
        if (typeof getStateFn !== 'function') {
            throw new Error('getStateFn must be a function');
        }
        if (typeof setStateFn !== 'function') {
            throw new Error('setStateFn must be a function');
        }
        
        this.generateFn = generateFn;
        this.getStateFn = getStateFn;
        this.setStateFn = setStateFn;
        
        // Capture the state BEFORE generation
        this.previousState = this.captureState();
        this.newState = null;
    }
    
    execute() {
        // Generate new NPC
        const result = this.generateFn();
        
        // Capture the state AFTER generation
        this.newState = this.captureState();
        
        return result;
    }
    
    undo() {
        // Restore the previous state
        this.restoreState(this.previousState);
    }
    
    redo() {
        // Restore the generated state
        this.restoreState(this.newState);
    }
    
    /**
     * Capture current state
     * @private
     */
    captureState() {
        const state = this.getStateFn();
        return this.deepClone(state);
    }
    
    /**
     * Restore a saved state
     * @private
     */
    restoreState(state) {
        this.setStateFn(state);
    }
    
    /**
     * Deep clone an object to prevent reference issues
     * @private
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        // Security: Don't clone functions or DOM elements
        if (typeof obj === 'function' || obj instanceof HTMLElement) {
            return null;
        }
        
        try {
            // Use structuredClone if available (modern browsers)
            if (typeof structuredClone === 'function') {
                return structuredClone(obj);
            }
            
            // Fallback to JSON clone (has limitations but safe)
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.error('Error cloning object:', error);
            return null;
        }
    }
}

/**
 * Command to change filter values
 * Allows undoing filter changes
 */
export class FilterChangeCommand extends Command {
    /**
     * @param {string} filterType - Type of filter being changed
     * @param {*} oldValue - Previous filter value
     * @param {*} newValue - New filter value
     * @param {Function} applyFn - Function to apply the filter change
     */
    constructor(filterType, oldValue, newValue, applyFn) {
        super(`Change ${filterType} filter`);
        
        if (!filterType || typeof filterType !== 'string') {
            throw new Error('filterType must be a non-empty string');
        }
        if (typeof applyFn !== 'function') {
            throw new Error('applyFn must be a function');
        }
        
        this.filterType = filterType;
        this.oldValue = this.deepClone(oldValue);
        this.newValue = this.deepClone(newValue);
        this.applyFn = applyFn;
    }
    
    execute() {
        this.applyFn(this.filterType, this.newValue);
    }
    
    undo() {
        this.applyFn(this.filterType, this.oldValue);
    }
    
    redo() {
        this.applyFn(this.filterType, this.newValue);
    }
    
    /**
     * Deep clone for safety
     * @private
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        try {
            if (typeof structuredClone === 'function') {
                return structuredClone(obj);
            }
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.error('Error cloning:', error);
            return obj;
        }
    }
}

/**
 * Command to perform a search
 * Allows undoing search operations
 */
export class SearchCommand extends Command {
    /**
     * @param {string} oldQuery - Previous search query
     * @param {string} newQuery - New search query
     * @param {Function} searchFn - Function to perform search
     */
    constructor(oldQuery, newQuery, searchFn) {
        super('Search');
        
        if (typeof searchFn !== 'function') {
            throw new Error('searchFn must be a function');
        }
        
        // Sanitize search queries to prevent XSS
        this.oldQuery = this.sanitizeString(oldQuery);
        this.newQuery = this.sanitizeString(newQuery);
        this.searchFn = searchFn;
    }
    
    execute() {
        this.searchFn(this.newQuery);
    }
    
    undo() {
        this.searchFn(this.oldQuery);
    }
    
    redo() {
        this.searchFn(this.newQuery);
    }
    
    /**
     * Sanitize string input to prevent XSS
     * @private
     */
    sanitizeString(str) {
        if (typeof str !== 'string') {
            return '';
        }
        
        // Remove any HTML tags and trim
        return str.replace(/<[^>]*>/g, '').trim();
    }
}

/**
 * Batch command - executes multiple commands as one atomic operation
 * All commands succeed or all fail (transaction-like behavior)
 */
export class BatchCommand extends Command {
    /**
     * @param {Array<Command>} commands - Array of commands to execute
     * @param {string} description - Description of the batch operation
     */
    constructor(commands, description = 'Batch Operation') {
        super(description);
        
        if (!Array.isArray(commands) || commands.length === 0) {
            throw new Error('commands must be a non-empty array');
        }
        
        // Validate all commands
        commands.forEach((cmd, index) => {
            if (!cmd || typeof cmd.execute !== 'function' || typeof cmd.undo !== 'function') {
                throw new Error(`Invalid command at index ${index}`);
            }
        });
        
        this.commands = commands;
    }
    
    execute() {
        const results = [];
        
        try {
            for (const command of this.commands) {
                results.push(command.execute());
            }
            return results;
        } catch (error) {
            // Rollback all executed commands
            console.error('Batch command failed, rolling back:', error);
            this.undo();
            throw error;
        }
    }
    
    undo() {
        // Undo in reverse order
        for (let i = this.commands.length - 1; i >= 0; i--) {
            try {
                this.commands[i].undo();
            } catch (error) {
                console.error(`Error undoing command ${i}:`, error);
            }
        }
    }
    
    redo() {
        // Redo in forward order
        for (let i = 0; i < this.commands.length; i++) {
            try {
                if (typeof this.commands[i].redo === 'function') {
                    this.commands[i].redo();
                } else {
                    this.commands[i].execute();
                }
            } catch (error) {
                console.error(`Error redoing command ${i}:`, error);
            }
        }
    }
}

// Create separate history instances for different contexts
export const generateHistory = new CommandHistory(50);
export const npcHistory = new CommandHistory(50);
export const searchHistory = new CommandHistory(30);

// Legacy alias for backward compatibility
export const commandHistory = generateHistory;

/**
 * Get the appropriate history for the current page context
 * @returns {CommandHistory}
 */
export function getActiveHistory() {
    if (typeof window === 'undefined') {
        return generateHistory;
    }
    
    const currentPage = window.currentPage || 'generate';
    
    switch (currentPage) {
        case 'npc':
            return npcHistory;
        case 'search':
            return searchHistory;
        case 'generate':
        default:
            return generateHistory;
    }
}

/**
 * Execute a command in the appropriate context
 * @param {Command} command - Command to execute
 * @param {string} context - Optional context override ('generate', 'npc', 'search')
 * @returns {*} Result of command execution
 */
export function executeInContext(command, context = null) {
    if (context) {
        // Use specified context
        switch (context) {
            case 'npc':
                return npcHistory.execute(command);
            case 'search':
                return searchHistory.execute(command);
            case 'generate':
            default:
                return generateHistory.execute(command);
        }
    }
    
    // Use active page context
    return getActiveHistory().execute(command);
}

/**
 * Undo in the active context
 * @returns {boolean}
 */
export function undoInContext() {
    return getActiveHistory().undo();
}

/**
 * Redo in the active context
 * @returns {boolean}
 */
export function redoInContext() {
    return getActiveHistory().redo();
}

/**
 * Check if undo is available in active context
 * @returns {boolean}
 */
export function canUndoInContext() {
    return getActiveHistory().canUndo();
}

/**
 * Check if redo is available in active context
 * @returns {boolean}
 */
export function canRedoInContext() {
    return getActiveHistory().canRedo();
}

/**
 * Clear history for a specific context
 * @param {string} context - Context to clear ('generate', 'npc', 'search', 'all')
 */
export function clearContext(context = 'all') {
    if (context === 'all') {
        generateHistory.clear();
        npcHistory.clear();
        searchHistory.clear();
    } else if (context === 'npc') {
        npcHistory.clear();
    } else if (context === 'search') {
        searchHistory.clear();
    } else {
        generateHistory.clear();
    }
}

// Expose to window for debugging (dev mode only)
if (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost') {
    window.__commandHistory = {
        generate: generateHistory,
        npc: npcHistory,
        search: searchHistory,
        getActive: getActiveHistory,
        executeInContext,
        undoInContext,
        redoInContext,
        canUndoInContext,
        canRedoInContext,
        clearContext
    };
}
