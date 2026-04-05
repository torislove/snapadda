import { GoogleGenerativeAI } from '@google/generative-ai';
import Property from '../models/Property.js';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const askOracle = async (req, res) => {
  const { query, history } = req.body;
  if (!query) return res.status(400).json({ status: 'error', message: 'Question required' });

  try {
    // 1. Context Retrieval (RAG Light)
    // We fetch a handful of relevant properties to give the AI context.
    const contextProperties = await Property.find({ status: 'Active' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title price location type beds baths');

    const contextStr = contextProperties.map(p => 
      `${p.title} in ${p.location}: ${p.priceDisplay || 'Price on request'} (${p.type})`
    ).join('\n');

    const systemPrompt = `You are the "SnapAdda Oracle", a high-intelligence real estate assistant for Andhra Pradesh. 
You are royal, helpful, and concise. 
Available Properties Context:
${contextStr}

Andhra Pradesh District Context: Amaravati, Vijayawada, Guntur, Visakhapatnam, Mangalagiri, Tenali.
Answer the user's question. If they ask about a property you don't see, suggest they use the "Search" bar. 
Always end with a helpful real estate tip. Use emojis.`;

    const chat = model.startChat({
      history: history || [],
      generationConfig: { maxOutputTokens: 500 },
    });

    const result = await chat.sendMessage(systemPrompt + "\n\nUser Question: " + query);
    const response = await result.response;
    const text = response.text();

    res.json({
      status: 'success',
      data: text
    });

  } catch (err) {
    console.error('AI_ORACLE_FAILURE:', err);
    res.status(500).json({ status: 'error', message: 'The Oracle is resting. Please try again later.' });
  }
};
