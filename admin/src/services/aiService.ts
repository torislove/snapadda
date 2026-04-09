/**
 * SnapAdda Admin AI Service (Workerized)
 */

class AdminAIService {
    private worker: Worker | null = null;
    private callbacks: Map<string, { resolve: Function; reject: Function }> = new Map();
    public status: 'idle' | 'loading' | 'ready' = 'idle';
    private onProgress: ((p: number) => void) | null = null;

    private _ensureWorker() {
        if (!this.worker) {
            this.worker = new Worker(new URL('./aiWorker.ts', import.meta.url), {
                type: 'module'
            });

            this.worker.onmessage = (e: MessageEvent) => {
                const { type, progress, text, message } = e.data;

                if (type === 'progress' && this.onProgress) {
                    this.onProgress(progress);
                }

                if (type === 'ready') {
                    this.status = 'ready';
                    const cb = this.callbacks.get('init');
                    if (cb) {
                        cb.resolve();
                        this.callbacks.delete('init');
                    }
                }

                if (type === 'result') {
                    const cb = this.callbacks.get('generate');
                    if (cb) {
                        cb.resolve(text);
                        this.callbacks.delete('generate');
                    }
                }

                if (type === 'error') {
                    console.error('Admin AI Worker Error:', message);
                    this.callbacks.forEach(cb => cb.reject(new Error(message)));
                    this.callbacks.clear();
                }
            };
        }
    }

    async init(onProgress?: (p: number) => void): Promise<void> {
        if (this.status === 'ready') return;
        this._ensureWorker();
        this.status = 'loading';
        if (onProgress) this.onProgress = onProgress;

        return new Promise((resolve, reject) => {
            this.callbacks.set('init', { resolve, reject });
            this.worker?.postMessage({ type: 'init' });
        });
    }

    async generate(prompt: string): Promise<string> {
        this._ensureWorker();
        if (this.status !== 'ready') await this.init();

        return new Promise((resolve, reject) => {
            this.callbacks.set('generate', { resolve, reject });
            this.worker?.postMessage({ 
                type: 'generate', 
                data: { prompt } 
            });
        });
    }
}

export const adminAIService = new AdminAIService();
