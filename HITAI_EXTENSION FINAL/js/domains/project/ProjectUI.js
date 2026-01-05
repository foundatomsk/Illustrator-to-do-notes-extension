import { bus } from '../../shared/EventBus.js';

export class ProjectUI {
    constructor() {
        this.elements = {
            select: document.getElementById('projectSelect'),
            btnAdd: document.getElementById('btnAddProject'),
            btnDelete: document.getElementById('btnDeleteProject'),
            btnEdit: document.getElementById('btnEditProject'),

            // Modals
            deleteModal: document.getElementById('deleteModal'),
            renameModal: document.getElementById('renameModal'),

            // Delete Action
            btnConfirmDelete: document.getElementById('btnConfirmDelete'),
            btnCancelDelete: document.getElementById('btnCancelDelete'),

            // Rename Action
            inputRename: document.getElementById('inputRename'),
            btnConfirmRename: document.getElementById('btnConfirmRename'),
            btnCancelRename: document.getElementById('btnCancelRename')
        };

        this.currentProjectId = null; // Track locally for Rename operations
        this.setupListeners();
    }

    setupListeners() {
        // --- Main Buttons ---
        if (this.elements.btnAdd) {
            this.elements.btnAdd.addEventListener('click', () => bus.emit('cmd:project:add'));
        }

        if (this.elements.btnDelete) {
            this.elements.btnDelete.addEventListener('click', () => this.showDeleteModal());
        }

        if (this.elements.btnEdit) {
            this.elements.btnEdit.addEventListener('click', () => this.showRenameModal());
        }

        if (this.elements.select) {
            this.elements.select.addEventListener('change', (e) => {
                bus.emit('cmd:project:select', e.target.value);
            });
            // Double click to rename
            this.elements.select.addEventListener('dblclick', () => {
                this.showRenameModal();
            });
        }

        // --- Modals ---
        // Delete
        if (this.elements.btnConfirmDelete) {
            this.elements.btnConfirmDelete.addEventListener('click', () => {
                bus.emit('cmd:project:delete');
                this.elements.deleteModal.close();
            });
        }
        if (this.elements.btnCancelDelete) {
            this.elements.btnCancelDelete.addEventListener('click', () => this.elements.deleteModal.close());
        }

        // Rename
        if (this.elements.btnConfirmRename) {
            this.elements.btnConfirmRename.addEventListener('click', () => {
                const newName = this.elements.inputRename.value;
                if (newName) {
                    bus.emit('cmd:project:rename', { id: this.currentProjectId, newName });
                    this.elements.renameModal.close();
                }
            });
        }
        if (this.elements.btnCancelRename) {
            this.elements.btnCancelRename.addEventListener('click', () => this.elements.renameModal.close());
        }

        // Bus -> UI
        bus.on('state:project:list:updated', (data) => this.render(data));
    }

    showDeleteModal() {
        if (!this.currentProjectId) return;
        // Check if it's the last one? Ideally Engine checks, but we can check here to avoid showing modal
        if (this.elements.select.options.length <= 1) {
            alert('Cannot delete the only project.'); // Keep native for simple error, or use another modal
            return;
        }
        this.elements.deleteModal.showModal();
    }

    showRenameModal() {
        const option = this.elements.select.options[this.elements.select.selectedIndex];
        if (option) {
            this.elements.inputRename.value = option.text;
            this.elements.renameModal.showModal();
        }
    }

    render({ projects, currentId }) {
        this.currentProjectId = currentId;
        if (!this.elements.select) return;

        this.elements.select.innerHTML = '';
        projects.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.name;
            if (p.id === currentId) {
                option.selected = true;
            }
            this.elements.select.appendChild(option);
        });
    }
}
