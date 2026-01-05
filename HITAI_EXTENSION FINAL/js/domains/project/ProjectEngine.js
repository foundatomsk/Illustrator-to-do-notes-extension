import { bus } from '../../shared/EventBus.js';

export class ProjectEngine {
    constructor() {
        this.projects = [];
        this.currentProjectId = null;
        this.setupListeners();
    }

    setupListeners() {
        bus.on('cmd:project:add', () => this.addProject());
        bus.on('cmd:project:delete', () => this.deleteCurrentProject());
        bus.on('cmd:project:select', (id) => this.selectProject(id));
        bus.on('cmd:project:rename', ({ id, newName }) => this.renameProject(id, newName));
        bus.on('data:projects:loaded', ({ projects, currentId }) => this.loadProjects(projects, currentId));
    }

    addProject() {
        const count = this.projects.length + 1;
        const newProject = {
            id: `proj_${Date.now()}`,
            name: `Project ${count}`
        };
        this.projects.push(newProject);
        this.selectProject(newProject.id);
        this.emitList();
    }

    deleteCurrentProject() {
        if (this.projects.length <= 1) {
            // UI should normally prevent this or show error, but we'll leave basic alert for safety or ignore
            // Better to let UI handle the "error" display, but here we just no-op or log
            console.warn("Cannot delete the last project.");
            return;
        }

        const deletedId = this.currentProjectId;
        this.projects = this.projects.filter(p => p.id !== deletedId);

        // Select the first available project
        this.selectProject(this.projects[0].id);
        this.emitList();
    }

    renameProject(id, newName) {
        if (!newName || newName.trim() === '') return;

        this.projects = this.projects.map(p =>
            p.id === id ? { ...p, name: newName.trim() } : p
        );
        this.emitList();
    }

    selectProject(id) {
        if (this.currentProjectId === id) return;

        const project = this.projects.find(p => p.id === id);
        if (project) {
            this.currentProjectId = project.id;
            bus.emit('state:project:changed', this.currentProjectId);
            // Re-emit list so UI updates selection state
            this.emitList();
        }
    }

    loadProjects(projects, currentId) {
        if (projects && projects.length > 0) {
            this.projects = projects;
        } else {
            this.projects = [{ id: 'proj_default', name: 'Project 1' }];
        }

        const validId = this.projects.find(p => p.id === currentId) ? currentId : this.projects[0].id; // Validate ID exists

        // Don't trigger 'change' yet, just set internal state? 
        // Actually we do want to trigger change to load Todos/Notes
        this.selectProject(validId);

        // Force emit list even if selectProject returned early (though it shouldn't for new load)
        this.emitList();
    }

    emitList() {
        // Find current project object to send its name if needed, or just send id
        bus.emit('state:project:list:updated', {
            projects: this.projects,
            currentId: this.currentProjectId
        });
    }
}
