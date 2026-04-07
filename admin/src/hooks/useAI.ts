import { useState, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';

/**
 * useAI Hook for Admin Panel
 * Manages browser-native Transformers.js pipelines using TypeScript.
 */
export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [pipelineInstance, setPipelineInstance] = useState<any>(null);

  // Initialize the pipeline (Lazy)
  const init = useCallback(async (task = 'text-generation', model = 'Xenova/Llama-3.2-1B-Instruct') => {
    if (ready) return;
    setLoading(true);
    try {
      console.log(`[AI] Admin: Loading ${model} into browser...`);
      const instance = await pipeline(task as any, model, {
        device: 'webgpu', // Prefer WebGPU for AI Developer performance
        dtype: 'q4',    // Quantized for efficiency
      });
      setPipelineInstance(() => instance);
      setReady(true);
      return instance;
    } catch (err) {
      console.warn(`[AI] Admin: WebGPU failed, falling back to WASM/CPU:`, err);
      try {
        const instance = await pipeline(task as any, model, {
          device: 'cpu',
          dtype: 'q4',
        });
        setPipelineInstance(() => instance);
        setReady(true);
        return instance;
      } catch (innerErr) {
        console.error(`[AI] Admin: Fatal initialization error:`, innerErr);
        throw innerErr;
      }
    } finally {
      setLoading(false);
    }
  }, [ready]);

  const generate = useCallback(async (text: string, options = {}) => {
    let instance = pipelineInstance;
    if (!instance) {
      instance = await init();
    }
    
    // Instruction format for Llama-3.2
    const prompt = `<|user|>\n${text}<|end|>\n<|assistant|>`;
    const output = await instance(prompt, {
      max_new_tokens: 512,
      temperature: 0.7,
      ...options
    });
    
    const result = output[0].generated_text;
    return result.split('<|assistant|>')[1]?.trim() || result;
  }, [pipelineInstance, init]);

  return { init, generate, loading, ready };
};
