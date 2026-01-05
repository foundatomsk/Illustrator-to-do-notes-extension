import { bus } from '../../shared/EventBus.js';

/**
 * TodoEngine: Manages Todo State.
 * Now Project-Aware.
 */
export class TodoEngine {
    constructor() {
        this.todos = [];
        this.currentProjectId = null;
        this.setupListeners();
    }

    setupListeners() {
        bus.on('cmd:todo:add', (text) => this.addTodo(text));
        bus.on('cmd:todo:delete', (id) => this.deleteTodo(id));
        bus.on('cmd:todo:toggle', (id) => this.toggleTodo(id));
        bus.on('cmd:todo:update', ({ id, text }) => this.updateTodo(id, text));

        bus.on('data:checklist:loaded', (items) => this.loadTodos(items));

        // Listen for project changes
        bus.on('state:project:changed', (projectId) => {
            // 1. Valid data for *previous* project was already saved on every update.

            // 2. Prevent saving empty list to the *new* project ID by temporarily nulling currentProjectId
            this.currentProjectId = null;
            this.todos = [];
            this.emitState(); // Storage ignores this because projectId is null. UI clears.

            // 3. Set new ID and request load
            this.currentProjectId = projectId;
            bus.emit('cmd:checklist:load', projectId);
        });
    }

    addTodo(text) {
        if (!text || text.trim() === '' || !this.currentProjectId) return;

        const newTodo = {
            id: Date.now().toString(),
            text: text,
            checked: false
        };

        this.todos.push(newTodo);
        this.emitState();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(t => t.id !== id);
        this.emitState();
    }

    toggleTodo(id) {
        this.todos = this.todos.map(t => {
            if (t.id === id) {
                return { ...t, checked: !t.checked };
            }
            return t;
        });
        this.emitState();
    }

    updateTodo(id, text) {
        this.todos = this.todos.map(t => {
            if (t.id === id) {
                return { ...t, text: text };
            }
            return t;
        });
        this.emitState();
    }

    loadTodos(items) {
        if (Array.isArray(items)) {
            this.todos = items;
            this.emitState();
        } else {
            this.todos = [];
            this.emitState();
        }
    }

    emitState() {
        bus.emit('state:todos:updated', {
            todos: this.todos,
            projectId: this.currentProjectId
        });
    }
}
