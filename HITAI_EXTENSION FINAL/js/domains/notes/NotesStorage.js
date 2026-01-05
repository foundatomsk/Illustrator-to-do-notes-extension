import { bus } from '../../shared/EventBus.js';
import { fileStorage } from '../../shared/FileStorage.js';

export class NotesStorage {
    constructor() {
        this.setupListeners();
    }

    setupListeners() {
        bus.on('state:notes:updated', ({ notes, projectId }) => this.save(notes, projectId));
        bus.on('cmd:notes:load', (projectId) => this.load(projectId));
    }

    save(notes, projectId) {
        if (!projectId) return;
        try {
            const filename = `hitai_notes_${projectId}.json`;
            fileStorage.save(filename, notes);
        } catch (e) {
            console.error('Failed to save notes to filesystem', e);
        }
    }

    load(projectId) {
        if (!projectId) return;
        try {
            const filename = `hitai_notes_${projectId}.json`;
            const data = fileStorage.load(filename);

            if (data) {
                bus.emit('data:notes:loaded', data);
            } else {
                bus.emit('data:notes:loaded', []);
            }
        } catch (e) {
            console.error("Error loading notes from filesystem", e);
            bus.emit('data:notes:loaded', []);
        }
    }
}
