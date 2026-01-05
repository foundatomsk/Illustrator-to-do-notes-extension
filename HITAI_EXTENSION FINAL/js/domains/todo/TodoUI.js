import { bus } from '../../shared/EventBus.js';

/**
 * TodoUI: Corresponds to "Export" or "View Adapter".
 * Handles all DOM manipulation and user interaction.
 * Translates DOM events into EventBus commands.
 * Translates EventBus state updates into DOM updates.
 */
export class TodoUI {
    constructor() {
        this.elements = {
            input: document.getElementById('newItemInput'),
            addBtn: document.getElementById('addBtn'),
            list: document.getElementById('checklist')
        };

        this.setupListeners();
    }

    setupListeners() {
        // UI -> Bus
        this.elements.addBtn.addEventListener('click', () => this.handleAddItem());

        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAddItem();
        });

        // Bus -> UI
        bus.on('state:todos:updated', ({ todos }) => this.render(todos));
    }

    handleAddItem() {
        const text = this.elements.input.value;
        if (text) {
            bus.emit('cmd:todo:add', text);
            this.elements.input.value = ''; // Clear input immediately for better UX
        }
    }

    render(todos) {
        // Clear current list
        this.elements.list.innerHTML = '';

        todos.forEach(todo => {
            const li = this.createDOMItem(todo);
            this.elements.list.appendChild(li);
        });
    }

    createDOMItem(todo) {
        const li = document.createElement('li');
        li.className = 'item';

        // Using innerHTML structure but modified for contenteditable
        li.innerHTML = `
          <label class="checkbox">
            <input type="checkbox" ${todo.checked ? "checked" : ""} />
            <span class="box"></span>
          </label>
          <div class="text" contenteditable="true" style="${todo.checked ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${todo.text}</div>
          <button class="pill-delete">delete</button>
        `;

        // Attach listeners
        const checkbox = li.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            bus.emit('cmd:todo:toggle', todo.id);
        });

        const deleteBtn = li.querySelector('.pill-delete');
        deleteBtn.addEventListener('click', () => {
            bus.emit('cmd:todo:delete', todo.id);
        });

        // Inline Editing Logic
        const textDiv = li.querySelector('.text');

        // Prevent enter from creating Divs, make it blur (save)
        // Optionally Allow Shift+Enter for sub-lines
        textDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                textDiv.blur();
            }
        });

        // Save on blur
        textDiv.addEventListener('blur', () => {
            const newText = textDiv.innerText; // innerText preserves newlines as \n
            if (newText !== todo.text) {
                bus.emit('cmd:todo:update', { id: todo.id, text: newText });
            }
        });

        return li;
    }
}
