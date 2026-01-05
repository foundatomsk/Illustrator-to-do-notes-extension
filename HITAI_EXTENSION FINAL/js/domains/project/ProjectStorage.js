import { bus } from '../../shared/EventBus.js';
import { fileStorage } from '../../shared/FileStorage.js';

export class ProjectStorage {
    constructor() {
        this.FILENAME = 'hitai_projects.json';
        this.setupListeners();
    }

    setupListeners() {
        bus.on('state:project:list:updated', (data) => this.save(data));
        bus.on('cmd:app:init', () => this.load());
    }

    save({ projects, currentId }) {
        const data = { projects, currentId };
        fileStorage.save(this.FILENAME, data);
    }

    load() {
        try {
            const data = fileStorage.load(this.FILENAME);
            if (data) {
                bus.emit('data:projects:loaded', data);
            } else {
                // First run, pass nulls to let Engine allow defaults
                bus.emit('data:projects:loaded', { projects: null, currentId: null });
            }
        } catch (e) {
            console.error("Failed to load projects", e);
            bus.emit('data:projects:loaded', { projects: null, currentId: null });
        }
    }
}
