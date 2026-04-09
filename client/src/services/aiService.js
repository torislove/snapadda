/**
 * SnapAdda AI Service (LITE)
 * Wrapper for aiWorker to keep the main thread fluid and the bundle small.
 */

class AIService {
    constructor() {
        this.worker = null;
        this.callbacks = new Map();
        this.status = 'idle';
        this.onProgress = null;
    }

    _ensureWorker() {
        if (!this.worker) {
            // Standard Vite/Webpack 5 worker instantiation
            this.worker = new Worker(new URL('./aiWorker.js', import.meta.url), {
                type: 'module'
            });

            this.worker.onmessage = (e) => {
                const { type, progress, text, message } = e.data;
                
                if (type === 'progress' && this.onProgress) {
                    this.onProgress(progress);
                }

                if (type === 'ready') {
                    this.status = 'ready';
                    if (this.callbacks.has('init')) {
                        this.callbacks.get('init').resolve();
                        this.callbacks.delete('init');
                    }
                }

                if (type === 'result') {
                    if (this.callbacks.has('generate')) {
                        this.callbacks.get('generate').resolve(text);
                        this.callbacks.delete('generate');
                    }
                }

                if (type === 'error') {
                    console.error('AI Worker Error:', message);
                    // Resolve waiting promises with fallback or error
                    this.callbacks.forEach(cb => cb.reject(new Error(message)));
                    this.callbacks.clear();
                }
            };
        }
    }

    async init(onProgress) {
        if (this.status === 'ready') return;
        this._ensureWorker();
        this.onProgress = onProgress;

        return new Promise((resolve, reject) => {
            this.callbacks.set('init', { resolve, reject });
            this.worker.postMessage({ type: 'init' });
        });
    }

    async draftResponse(context) {
        this._ensureWorker();
        if (this.status !== 'ready') await this.init();

        return new Promise((resolve, reject) => {
            this.callbacks.set('generate', { resolve, reject });
            this.worker.postMessage({ 
                type: 'generate', 
                data: { prompt: `Draft a professional real estate response for: ${context}` } 
            });
        });
    }
}

export const aiService = new AIService();
