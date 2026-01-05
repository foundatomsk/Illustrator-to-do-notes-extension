import { bus } from '../../shared/EventBus.js';

export class NotesEngine {
    constructor() {
        this.notes = [];
        this.currentProjectId = null;
        this.setupListeners();
    }

    setupListeners() {
        bus.on('cmd:note:add', (text) => this.addNote(text));
        bus.on('cmd:note:delete', (id) => this.deleteNote(id));
        bus.on('cmd:note:update', ({ id, text }) => this.updateNote(id, text));

        bus.on('data:notes:loaded', (notes) => this.loadNotes(notes));

        // Listen for project changes
        bus.on('state:project:changed', (projectId) => {
            // Prevent saving empty list to the *new* project ID
            this.currentProjectId = null;
            this.notes = [];
            this.emitState(); // Storage ignores (projectId is null)

            this.currentProjectId = projectId;
            bus.emit('cmd:notes:load', projectId);
        });
    }

    addNote(text) {
        if (!this.currentProjectId) return;

        const note = {
            id: Date.now().toString(),
            text: text || '',
            timestamp: Date.now()
        };
        this.notes.unshift(note);
        this.emitState();
    }

    deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        this.emitState();
    }

    updateNote(id, text) {
        this.notes = this.notes.map(n =>
            n.id === id ? { ...n, text, timestamp: Date.now() } : n
        );
        this.emitState();
    }

    loadNotes(notes) {
        if (Array.isArray(notes)) {
            this.notes = notes;
            this.emitState();
        } else {
            this.notes = [];
            this.emitState();
        }
    }

    emitState() {
        bus.emit('state:notes:updated', {
            notes: this.notes,
            projectId: this.currentProjectId
        });
    }
}
