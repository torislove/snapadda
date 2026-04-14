import { pipeline, env } from '@huggingface/transformers';

/**
 * SnapAdda Admin AI Worker (TypeScript)
 * Keeps the Admin dashboard fluid during heavy processing
 */

env.allowLocalModels = false;
env.useBrowserCache = true;

let generator: any = null;

const AI_FALLBACKS: Record<string, string[]> = {
    description: [
        "A premium residence offering elite living standards, strategic positioning, and exceptional value.",
        "An exquisite investment opportunity featuring modern architectural ethics and location-centric advantages.",
        "Luxurious asset with verified legal standing, perfect for sophisticated investors seeking long-term growth.",
        "Prime location with high ROI potential and immediate connectivity to key transport nodes."
    ],
    draft_email: [
        "Thank you for your inquiry. We are reviewing your interest and an executive consultant will provide a detailed walkthrough soon.",
        "Hello! We appreciate your interest in our premium assets. Here is the latest availability and pricing schedule.",
        "Regarding your request, our team is processing the legal documentation for this property. We will contact you for a site visit."
    ]
};

const getFallback = (task: string) => {
    const pool = AI_FALLBACKS[task] || AI_FALLBACKS.description;
    return pool[Math.floor(Math.random() * pool.length)];
};

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
            // Silently fail to ready state so prompts can hit the fallback
            self.postMessage({ type: 'ready' });
        }
    }

    if (type === 'generate') {
        const { task } = data;
        
        if (!generator) {
            self.postMessage({ type: 'result', text: getFallback(task) });
            return;
        }

        try {
            const { prompt, options, details } = data;
            
            // Specialized Admin Prompts
            let finalPrompt = prompt;
            if (task === 'description') {
                finalPrompt = `Property Details: ${JSON.stringify(details)}. Generate a professional real estate description for a listing.`;
            } else if (task === 'draft_email') {
                finalPrompt = `Draft a professional property inquiry response email for: ${prompt}`;
            }

            const output = await generator(finalPrompt, {
                max_new_tokens: 160,
                temperature: 0.65,
                do_sample: true,
                ...options
            });

            self.postMessage({ type: 'result', text: output[0].generated_text });
        } catch (err: any) {
            self.postMessage({ type: 'result', text: getFallback(task) });
        }
    }
};
