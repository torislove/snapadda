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

// High-Resiliency Template Engine (Elite Fallback)
const AI_FALLBACKS = {
    description: [
        "A premium residence offering elite living standards, strategic positioning, and exceptional value in a high-growth sector.",
        "An exquisite investment opportunity featuring modern architectural ethics and location-centric advantages.",
        "Luxurious asset with verified legal standing, perfect for sophisticated investors seeking long-term growth."
    ],
    inquiry: [
        "I am highly interested in this asset and would like to request detailed metrics, legal documentation, and a physical walkthrough site visit at your earliest convenience.",
        "Requesting more details on the pricing schedule and the latest availability for this specific unit.",
        "I would like to discuss the ROI potential and acquisition steps for this property with an executive consultant."
    ],
    insight: [
        "The current market trajectory in Andhra Pradesh suggests strong urban expansion. Asset acquisition in these verified sectors remains a high-confidence move.",
        "Andhra real estate metrics are showing a consistent 8-12% annual growth in major hubs like Amaravati and Visakhapatnam.",
        "Focusing on verified plots is currently the most secure path for high-yield property investment in the region."
    ]
};

const getFallback = (task) => {
    const pool = AI_FALLBACKS[task] || AI_FALLBACKS.description;
    return pool[Math.floor(Math.random() * pool.length)];
};

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
            const { prompt, options, task } = data;
            
            // Task-Specific Prompt Engineering (Elite Real Estate Optimization)
            let finalPrompt = prompt;
            if (task === 'description') {
               finalPrompt = `Summary of property: ${data.details}. Draft a premium real estate description for SnapAdda, highlighting luxury and location.`;
            } else if (task === 'inquiry') {
               finalPrompt = `Context: ${data.context}. Draft a professional inquiry for a real estate property.`;
            } else if (task === 'insight') {
               finalPrompt = `Data: ${data.data}. Provide a short market insight for a buyer interested in Andhra Pradesh real estate.`;
            }

            if (!generator) {
                // Return Elite Fallback if model is not ready/blocked
                self.postMessage({ type: 'result', text: getFallback(task) });
                return;
            }

            const output = await generator(finalPrompt, {
                max_new_tokens: 160,
                temperature: 0.7,
                do_sample: true,
                ...options
            });

            self.postMessage({ type: 'result', text: output[0].generated_text });
        } catch (err) {
            // Fallback on catch
            self.postMessage({ type: 'result', text: getFallback(data.task) });
        }
    }
};
