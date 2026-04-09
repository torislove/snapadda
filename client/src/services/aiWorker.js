import { pipeline, env } from '@huggingface/transformers';

/**
 * SnapAdda AI Worker
 * Offloads heavy model loading and inference from the main thread
 * to prevent browser freezes.
 */

// Configure environment
env.allowLocalModels = false;
env.useBrowserCache = true;

let generator = null;

// Handle messages from the main thread
self.onmessage = async (e) => {
    const { type, data } = e.data;

    if (type === 'init') {
        try {
            if (generator) {
                self.postMessage({ type: 'ready' });
                return;
            }

            self.postMessage({ type: 'loading', status: 'Fetching model...' });
            
            generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-78M', {
                progress_callback: (info) => {
                    if (info.status === 'progress') {
                        self.postMessage({ type: 'progress', progress: info.progress });
                    }
                }
            });

            self.postMessage({ type: 'ready' });
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message });
        }
    }

    if (type === 'generate') {
        if (!generator) {
            self.postMessage({ type: 'error', message: 'Model not initialized' });
            return;
        }

        try {
            const { prompt, options } = data;
            const output = await generator(prompt, {
                max_new_tokens: 128,
                temperature: 0.7,
                do_sample: true,
                ...options
            });

            self.postMessage({ type: 'result', text: output[0].generated_text });
        } catch (err) {
            self.postMessage({ type: 'error', message: err.message });
        }
    }
};
