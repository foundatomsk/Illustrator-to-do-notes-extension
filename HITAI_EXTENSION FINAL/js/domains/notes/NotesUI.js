import { bus } from '../../shared/EventBus.js';

export class NotesUI {
    constructor() {
        this.elements = {
            addBtn: document.getElementById('addNoteBtn'),
            container: document.getElementById('notesList'),

            // Delete Note Modal
            deleteModal: document.getElementById('deleteNoteModal'),
            btnConfirmDelete: document.getElementById('btnConfirmDeleteNote'),
            btnCancelDelete: document.getElementById('btnCancelDeleteNote')
        };

        this.noteToDeleteId = null;
        this.setupListeners();
    }

    setupListeners() {
        // UI -> Bus
        this.elements.addBtn.addEventListener('click', () => {
            bus.emit('cmd:note:add', 'New Note');
        });

        // Bus -> UI
        bus.on('state:notes:updated', ({ notes }) => this.render(notes));

        // Modal Listeners
        if (this.elements.btnConfirmDelete) {
            this.elements.btnConfirmDelete.addEventListener('click', () => {
                if (this.noteToDeleteId) {
                    bus.emit('cmd:note:delete', this.noteToDeleteId);
                    this.noteToDeleteId = null;
                    this.elements.deleteModal.close();
                }
            });
        }

        if (this.elements.btnCancelDelete) {
            this.elements.btnCancelDelete.addEventListener('click', () => {
                this.noteToDeleteId = null;
                this.elements.deleteModal.close();
            });
        }
    }

    render(notes) {
        this.elements.container.innerHTML = '';
        notes.forEach(note => {
            const card = this.createNoteCard(note);
            this.elements.container.appendChild(card);
        });
    }

    createNoteCard(note) {
        const div = document.createElement('div');
        div.className = 'note-card';

        // Content
        const textarea = document.createElement('textarea');
        textarea.value = note.text;
        textarea.placeholder = "Type your note here...";

        // Save on blur
        textarea.addEventListener('blur', () => {
            if (textarea.value !== note.text) {
                bus.emit('cmd:note:update', { id: note.id, text: textarea.value });
            }
        });

        // Controls
        const controls = document.createElement('div');
        controls.className = 'controls';

        // Delete Button
        // Delete Button
        const delBtn = document.createElement('button');
        delBtn.className = 'icon delete-note-btn'; // Use base icon class
        delBtn.setAttribute('aria-label', 'Delete note');
        // Add styling for icon content (X) or SVG if available. Using CSS pseudo-element or innerHTML
        // Since other icons use ::before/::after in CSS, let's stick to that pattern or add inner content
        // Adding a specific class 'cross' for X

        // Let's modify className to reuse 'icon' styles but maybe smaller
        delBtn.classList.add('cross');
        // We need to define .icon.cross::before/after in CSS for the X shape

        delBtn.addEventListener('click', () => {
            this.noteToDeleteId = note.id;
            this.elements.deleteModal.showModal();
        });

        controls.appendChild(delBtn);
        div.appendChild(controls);
        div.appendChild(textarea);

        return div;
    }
}
