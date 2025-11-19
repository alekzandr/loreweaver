/**
 * EventBus - Simple Publish/Subscribe Pattern for Decoupled Component Communication
 * 
 * This implements the Observer pattern to allow components to communicate
 * without tight coupling. Components can publish events and subscribe to events
 * without knowing about each other.
 */

class EventBus {
    constructor() {
        this.events = {};
        this.eventHistory = [];
        this.maxHistorySize = 100;
    }
    
    /**
     * Subscribe to an event
     * @param {string} event - Event name to subscribe to
     * @param {Function} callback - Function to call when event is published
     * @returns {Function} Unsubscribe function
     */
    subscribe(event, callback) {
        if (typeof callback !== 'function') {
            throw new Error('Callback must be a function');
        }
        
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
            // Clean up empty event arrays
            if (this.events[event].length === 0) {
                delete this.events[event];
            }
        };
    }
    
    /**
     * Subscribe to an event only once
     * @param {string} event - Event name to subscribe to
     * @param {Function} callback - Function to call when event is published
     * @returns {Function} Unsubscribe function
     */
    once(event, callback) {
        const unsubscribe = this.subscribe(event, (data) => {
            callback(data);
            unsubscribe();
        });
        return unsubscribe;
    }
    
    /**
     * Publish an event
     * @param {string} event - Event name to publish
     * @param {*} data - Data to pass to subscribers
     */
    publish(event, data) {
        // Record event in history for debugging
        this.eventHistory.push({
            event,
            data,
            timestamp: Date.now(),
            subscriberCount: this.events[event]?.length || 0
        });
        
        // Limit history size
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
        
        if (!this.events[event]) return;
        
        // Call each subscriber with the data
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event subscriber for '${event}':`, error);
            }
        });
    }
    
    /**
     * Get list of all subscriptions (for debugging)
     * @returns {Array} List of events with subscriber counts
     */
    listSubscriptions() {
        return Object.keys(this.events).map(event => ({
            event,
            subscriberCount: this.events[event].length
        }));
    }
    
    /**
     * Get event history (for debugging)
     * @param {number} limit - Number of recent events to return
     * @returns {Array} Recent event history
     */
    getHistory(limit = 10) {
        return this.eventHistory.slice(-limit);
    }
    
    /**
     * Clear all subscriptions
     */
    clear() {
        this.events = {};
    }
    
    /**
     * Check if event has any subscribers
     * @param {string} event - Event name to check
     * @returns {boolean}
     */
    hasSubscribers(event) {
        return !!(this.events[event] && this.events[event].length > 0);
    }
    
    /**
     * Get subscriber count for an event
     * @param {string} event - Event name
     * @returns {number} Number of subscribers
     */
    getSubscriberCount(event) {
        return this.events[event]?.length || 0;
    }
}

// Create singleton instance
export const eventBus = new EventBus();

// Export class for testing
export { EventBus };

// Standard event names (to avoid typos and provide autocomplete)
export const Events = {
    // Page navigation
    PAGE_SWITCHED: 'page:switched',
    
    // Environment selection
    ENVIRONMENT_CHANGED: 'environment:changed',
    
    // Search
    SEARCH_STARTED: 'search:started',
    SEARCH_COMPLETED: 'search:completed',
    SEARCH_CLEARED: 'search:cleared',
    
    // Filters
    FILTERS_UPDATED: 'filters:updated',
    FILTERS_CLEARED: 'filters:cleared',
    
    // Pagination
    PAGE_CHANGED: 'pagination:page_changed',
    ITEMS_PER_PAGE_CHANGED: 'pagination:items_per_page_changed',
    
    // Encounter generation
    ENCOUNTER_GENERATED: 'encounter:generated',
    ENCOUNTER_SAVED: 'encounter:saved',
    ENCOUNTER_LOADED: 'encounter:loaded',
    ENCOUNTER_DELETED: 'encounter:deleted',
    
    // NPC
    NPC_GENERATED: 'npc:generated',
    NPC_DETAIL_OPENED: 'npc:detail_opened',
    NPC_DETAIL_CLOSED: 'npc:detail_closed',
    
    // Location
    LOCATION_DETAIL_OPENED: 'location:detail_opened',
    LOCATION_DETAIL_CLOSED: 'location:detail_closed',
    
    // Theme
    THEME_TOGGLED: 'theme:toggled',
    
    // Data loading
    DATA_LOADED: 'data:loaded',
    DATA_LOAD_ERROR: 'data:load_error',
    
    // Export
    EXPORT_STARTED: 'export:started',
    EXPORT_COMPLETED: 'export:completed',
    EXPORT_FAILED: 'export:failed',
    
    // Flow navigator
    FLOW_NAVIGATOR_TOGGLED: 'flow:navigator_toggled'
};

// Expose to window for inline event handlers (backwards compatibility)
if (typeof window !== 'undefined') {
    window.eventBus = eventBus;
    window.Events = Events;
}
