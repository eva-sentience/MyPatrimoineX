import { GoogleGenAI } from "@google/genai";
import { Asset, AssetType } from "../types";

// Helper to format portfolio for the AI context
const formatPortfolioContext = (assets: Asset[]) => {
  const totalValue = assets.reduce((acc, a) => acc + (a.amount * a.currentValue), 0);
  const breakdown = assets.map(a => 
    `- ${a.name} (${a.type}): ${a.amount} units @ €${a.currentValue} (Total: €${(a.amount * a.currentValue).toFixed(2)})`
  ).join('\n');

  return `
    User Portfolio Summary:
    Total Net Worth: €${totalValue.toFixed(2)}
    
    Assets:
    ${breakdown}
  `;
};

export const generateFinancialAdvice = async (
  prompt: string, 
  assets: Asset[], 
  history: {role: 'user'|'model', text: string}[]
) => {
  if (!process.env.API_KEY) {
    return "Error: API Key is missing. Please check your environment configuration.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct a system instruction that gives the persona and the data context
    const systemInstruction = `
      You are "PatrimoineAI", a sophisticated, private financial assistant for a French investor.
      You are helpful, precise, and knowledgeable about global markets (US, EU, Emerging) and French specificities (PEA, Assurance Vie, LMNP).
      
      The user's current portfolio data is strictly private and stored locally. Here is a summary of their *current* holdings for your context:
      ${formatPortfolioContext(assets)}
      
      Rules:
      1. Always answer in the language the user speaks (default to English if unsure, but capable of French).
      2. Be concise and professional.
      3. Do not offer legal financial advice, but offer educational insights and strategy analysis.
      4. Use the portfolio context to give personalized answers (e.g., "Considering your high exposure to Crypto...").
    `;

    const model = "gemini-2.5-flash"; // Efficient model for chat
    
    // We simulate a chat history by appending previous turns to the content if needed, 
    // but for simplicity in this stateless call, we'll just combine context.
    // Ideally, we use ai.chats.create, but let's use generateContent for direct control over systemInstruction per turn 
    // or just use the chat helper. 
    
    // Using Chat helper for history management
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: systemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message: prompt });
    return result.text;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the market data right now. Please try again later.";
  }
};
