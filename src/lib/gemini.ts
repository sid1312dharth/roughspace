import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const geminiClient = new GoogleGenAI({
  apiKey: apiKey || 'dummy-key',
});
