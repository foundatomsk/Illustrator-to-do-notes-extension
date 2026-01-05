/**
 * FileStorage.js
 * Handles file system operations for persistent storage using Node.js modules 
 * available in Adobe CEP environment.
 */
class FileStorage {
    constructor() {
        this.fs = null;
        this.path = null;
        this.os = null;
        this.storageDir = null;
        this.init();
    }

    init() {
        try {
            if (window.require) {
                this.fs = window.require('fs');
                this.path = window.require('path');
                this.os = window.require('os');

                // Set storage location: ~/Documents/HITAI_Data
                const homeDir = this.os.homedir();
                this.storageDir = this.path.join(homeDir, 'Documents', 'HITAI_Data');

                this.ensureDirectoryExists();
            } else {
                console.warn('Node.js require not found. Using LocalStorage fallback.');
            }
        } catch (e) {
            console.error('Failed to initialize FileStorage', e);
        }
    }

    ensureDirectoryExists() {
        if (this.fs && !this.fs.existsSync(this.storageDir)) {
            try {
                this.fs.mkdirSync(this.storageDir, { recursive: true });
                console.log(`Created storage directory: ${this.storageDir}`);
            } catch (e) {
                console.error('Failed to create storage directory', e);
            }
        }
    }

    async save(filename, data) {
        if (this.fs) {
            try {
                const filePath = this.path.join(this.storageDir, filename);
                this.fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                // console.log(`Saved ${filename}`);
            } catch (e) {
                console.error(`Failed to write file ${filename}`, e);
            }
        } else {
            // Fallback
            localStorage.setItem(`hitai_fs_${filename}`, JSON.stringify(data));
        }
    }

    load(filename) {
        if (this.fs) {
            try {
                const filePath = this.path.join(this.storageDir, filename);
                if (this.fs.existsSync(filePath)) {
                    const data = this.fs.readFileSync(filePath, 'utf-8');
                    return JSON.parse(data);
                }
            } catch (e) {
                console.error(`Failed to read file ${filename}`, e);
            }
            return null;
        } else {
            // Fallback
            const data = localStorage.getItem(`hitai_fs_${filename}`);
            return data ? JSON.parse(data) : null;
        }
    }

    // Helper to delete if needed
    delete(filename) {
        if (this.fs) {
            try {
                const filePath = this.path.join(this.storageDir, filename);
                if (this.fs.existsSync(filePath)) {
                    this.fs.unlinkSync(filePath);
                }
            } catch (e) {
                console.error(`Failed to delete ${filename}`, e);
            }
        } else {
            localStorage.removeItem(`hitai_fs_${filename}`);
        }
    }
}

export const fileStorage = new FileStorage();
