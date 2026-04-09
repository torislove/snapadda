import { pipeline, env } from '@huggingface/transformers';

/**
 * SnapAdda Admin AI Worker (TypeScript)
 * Keeps the Admin dashboard fluid during heavy processing
 */

env.allowLocalModels = false;
env.useBrowserCache = true;

let generator: any = null;

// @ts-ignore
self.onmessage = async (e: MessageEvent) => {
    const { type, data } = e.data;

    if (type === 'init') {
        try {
            if (generator) {
                self.postMessage({ type: 'ready' });
                return;
            }

            generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-78M', {
                progress_callback: (info: any) => {
                    if (info.status === 'progress') {
                        self.postMessage({ type: 'progress', progress: info.progress });
                    }
                }
            });

            self.postMessage({ type: 'ready' });
        } catch (err: any) {
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
                max_new_tokens: 151,
                temperature: 0.6,
                do_sample: true,
                ...options
            });

            self.postMessage({ type: 'result', text: output[0].generated_text });
        } catch (err: any) {
            self.postMessage({ type: 'error', message: err.message });
        }
    }
};
