import { bus } from '../../shared/EventBus.js';
import { fileStorage } from '../../shared/FileStorage.js';

export class TodoStorage {
    constructor() {
        this.setupListeners();
    }

    setupListeners() {
        bus.on('state:todos:updated', ({ todos, projectId }) => this.save(todos, projectId));
        bus.on('cmd:checklist:load', (projectId) => this.load(projectId));
    }

    save(todos, projectId) {
        if (!projectId) return;
        try {
            const filename = `hitai_checklist_${projectId}.json`;
            fileStorage.save(filename, todos);
        } catch (e) {
            console.error('Failed to save to filesystem', e);
        }
    }

    load(projectId) {
        if (!projectId) return;
        try {
            const filename = `hitai_checklist_${projectId}.json`;
            const todos = fileStorage.load(filename);

            if (todos) {
                bus.emit('data:checklist:loaded', todos);
            } else {
                bus.emit('data:checklist:loaded', []);
            }
        } catch (e) {
            console.error('Failed to load from filesystem', e);
            bus.emit('data:checklist:loaded', []);
        }
    }
}
