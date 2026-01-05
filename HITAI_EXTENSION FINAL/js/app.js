import { ProjectEngine } from './domains/project/ProjectEngine.js';
import { ProjectUI } from './domains/project/ProjectUI.js';
import { ProjectStorage } from './domains/project/ProjectStorage.js';
import { TodoEngine } from './domains/todo/TodoEngine.js';
import { TodoUI } from './domains/todo/TodoUI.js';
import { TodoStorage } from './domains/todo/TodoStorage.js';
import { NotesEngine } from './domains/notes/NotesEngine.js';
import { NotesUI } from './domains/notes/NotesUI.js';
import { NotesStorage } from './domains/notes/NotesStorage.js';
import { bus } from './shared/EventBus.js';

// Initialize the vertical slices
document.addEventListener('DOMContentLoaded', () => {

    // 1. Instantiate Core Logic (The Physics)
    const projectEngine = new ProjectEngine();
    const todoEngine = new TodoEngine();
    const notesEngine = new NotesEngine();

    // 2. Instantiate Adapters (The Ports)
    const projectUi = new ProjectUI();
    const projectStorage = new ProjectStorage();

    const todoUi = new TodoUI();
    const todoStorage = new TodoStorage();

    const notesUi = new NotesUI();
    const notesStorage = new NotesStorage();

    console.log('HITAI Extension Initialized');

    // 3. Kickstart the application
    bus.emit('cmd:app:init');
});
