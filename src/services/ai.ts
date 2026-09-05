import { geminiClient } from '@/lib/gemini';

export type AIAction = 'improve' | 'summarize' | 'grammar' | 'continue' | 'custom';

export async function processWithAI(text: string, action: AIAction, customPrompt?: string): Promise<string> {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not configured in .env.local');
  }

  let prompt = '';
  switch (action) {
    case 'improve':
      prompt = `Improve the following text, making it more professional, clear, and engaging. Do not add any conversational filler, just return the improved text:\n\n"${text}"`;
      break;
    case 'summarize':
      prompt = `Summarize the following text concisely. Do not add any conversational filler, just return the summary:\n\n"${text}"`;
      break;
    case 'grammar':
      prompt = `Fix any grammar, spelling, or punctuation errors in the following text. Do not add any conversational filler, just return the corrected text. If it is already correct, return it as is:\n\n"${text}"`;
      break;
    case 'continue':
      prompt = `Continue writing the following text naturally. Add about 1-2 paragraphs of logical continuation. Do not add any conversational filler, just return the continuation:\n\n"${text}"`;
      break;
    case 'custom':
      prompt = `${customPrompt}\n\nHere is the text to process:\n"${text}"\n\nDo not add any conversational filler, just return the result.`;
      break;
  }

  try {
    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text?.trim() || '';
  } catch (error: any) {
    console.error('Error with Gemini API:', error);
    throw new Error(error.message || 'Failed to generate content');
  }
}
