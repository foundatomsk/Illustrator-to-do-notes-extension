/**
 * Simple Event Bus for decoupled communication.
 */
class EventBus {
    constructor() {
        this.listeners = {};
    }

    /**
     * Subscribe to an event
     * @param {string} event 
     * @param {Function} callback 
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event 
     * @param {Function} callback 
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    /**
     * Emit an event with data
     * @param {string} event 
     * @param {any} data 
     */
    emit(event, data) {
        console.log(`[EventBus] Emitting: ${event}`, data);
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => callback(data));
    }
}

export const bus = new EventBus();
