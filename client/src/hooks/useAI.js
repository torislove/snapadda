import { useState, useCallback, useEffect } from 'react';
import { pipeline } from '@huggingface/transformers';

/**
 * useAI Hook
 * Manages browser-native Transformers.js pipelines.
 */
export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [pipelineInstance, setPipelineInstance] = useState(null);

  // Initialize the pipeline (Lazy)
  const init = useCallback(async (task = 'text-generation', model = 'Xenova/Llama-3.2-1B-Instruct') => {
    if (ready) return;
    setLoading(true);
    try {
      console.log(`[AI] Loading ${model} into browser...`);
      const instance = await pipeline(task, model, {
        device: 'webgpu', // Use WebGPU for premium performance
        dtype: 'q4',    // Quantized for fast download
      });
      setPipelineInstance(() => instance);
      setReady(true);
      return instance;
    } catch (err) {
      console.warn(`[AI] WebGPU failed, falling back to WASM/CPU:`, err);
      // Fallback to CPU if WebGPU isn't available
      const instance = await pipeline(task, model, {
        device: 'cpu',
        dtype: 'q4',
      });
      setPipelineInstance(() => instance);
      setReady(true);
      return instance;
    } finally {
      setLoading(false);
    }
  }, [ready]);

  const generate = useCallback(async (text, options = {}) => {
    let instance = pipelineInstance;
    if (!instance) {
      instance = await init();
    }
    
    // Simple generation with instruction format
    const prompt = `<|user|>\n${text}<|end|>\n<|assistant|>`;
    const output = await instance(prompt, {
      max_new_tokens: 256,
      temperature: 0.7,
      ...options
    });
    
    return output[0].generated_text.split('<|assistant|>')[1]?.trim();
  }, [pipelineInstance, init]);

  return { init, generate, loading, ready };
};
