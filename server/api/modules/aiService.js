import { pipeline, env } from '@huggingface/transformers';
import fs from 'fs';
import path from 'path';

// Production optimization for Cloud Functions
if (process.env.NODE_ENV === 'production') {
  env.cacheDir = '/tmp/transformers-cache';
  env.allowLocalModels = false; // Always ensure a model fetching attempt
}

class AIService {
  constructor() {
    this.model = 'Xenova/phi-3-mini-4k-instruct';
    this.generator = null;
    this.tokenizer = null;
    this.isReady = false;
  }

  /**
   * Initialize the pipeline (Lazy Load)
   */
  async init() {
    if (this.isReady) return;
    try {
      console.log(`[AI] Loading Transformers.js model: ${this.model}...`);
      this.generator = await pipeline('text-generation', this.model, {
        dtype: 'q4', // Quantized for performance
        device: 'cpu', // Default to CPU for maximum compatibility
      });
      this.isReady = true;
      console.log(`[AI] Transformers.js is ready.`);
    } catch (err) {
      console.error(`[AI] Failed to load model:`, err);
      throw err;
    }
  }

  /**
   * Universal Completion Method
   */
  async generateCompletion(prompt, systemPrompt = "") {
    await this.init();
    
    // Format prompt for Phi-3 (ChatML or similar)
    const fullPrompt = `<|system|>\n${systemPrompt}<|end|>\n<|user|>\n${prompt}<|end|>\n<|assistant|>`;

    const output = await this.generator(fullPrompt, {
      max_new_tokens: 1024,
      temperature: 0.7,
      repetition_penalty: 1.1,
      top_k: 40,
    });

    return output[0].generated_text.split('<|assistant|>')[1]?.trim() || output[0].generated_text;
  }

  /**
   * Specialized: Natural Language Search Parsing
   */
  async parseNaturalLanguageSearch(query, userLocation = null) {
    const systemPrompt = `You are an AI assistant for SnapAdda real estate.
1. If the user is searching for a property (e.g. '3BHK in Vizag'), return ONLY JSON:
   { "type": "...", "city": "...", "minPrice": 0, "maxPrice": 0, "bhk": 0 }
2. If the user is asking a general question, return a helpful, elegant answer as a simple string.
3. If they say 'near me' and location is provided [${JSON.stringify(userLocation)}], use that city.`;

    const prompt = `User Query: "${query}"`;
    const response = await this.generateCompletion(prompt, systemPrompt);
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
      return response;
    } catch (e) {
      return response;
    }
  }

  /**
   * Specialized: Auto-Drafting Communications
   */
  async draftCommunication(type, data) {
    const systemPrompt = "You are an elite real estate concierge. Draft short, premium messages.";
    const prompt = `Draft a ${type} for this property/lead: ${JSON.stringify(data)}`;
    return this.generateCompletion(prompt, systemPrompt);
  }

  /**
   * AI Developer: Analyze Codebase
   */
  async analyzeCodebase(problem) {
    const systemPrompt = "You are a Senior Fullstack Developer. Analyze the problem and provide a concise technical summary and list of files to modify.";
    return this.generateCompletion(`Problem: ${problem}`, systemPrompt);
  }

  /**
   * AI Developer: Apply File Patch
   */
  async applyFilePatch(filePath, issue) {
    const absolutePath = path.resolve(process.cwd(), '..', filePath);
    if (!fs.existsSync(absolutePath)) throw new Error("File not found");

    const content = fs.readFileSync(absolutePath, 'utf8');
    const systemPrompt = "You are a code patching assistant. Return ONLY the new content of the file. Do not explain anything.";
    const prompt = `File: ${filePath}\nContent:\n${content}\n\nTask: ${issue}`;
    
    const newContent = await this.generateCompletion(prompt, systemPrompt);
    // Remove potential markdown blocks if the AI includes them
    const cleanedContent = newContent.replace(/^```[a-z]*\n/i, '').replace(/\n```$/m, '');
    
    fs.writeFileSync(absolutePath, cleanedContent);
    return `Successfully applied patch to ${filePath}`;
  }
}

export const aiService = new AIService();
