
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from "@google/genai";
import { MarketResearchResponse } from "../types";
import { SYSTEM_INSTRUCTION, responseSchemaObj } from "../constants";

export interface ApiKeyConfig {
  provider: 'gemini' | 'openai' | 'deepseek';
  geminiKey: string;
  openaiKey: string;
  deepseekKey: string;
}

const getGeminiApiKey = (config?: ApiKeyConfig) => {
  const key = (config?.geminiKey && config.geminiKey.trim() !== '') ? config.geminiKey : (process.env.GEMINI_API_KEY || '');
  return key;
};

export const analyzeProduct = async (productName: string, imageBase64?: string, mimeType?: string, config?: ApiKeyConfig): Promise<MarketResearchResponse> => {
  const provider = config?.provider || 'gemini';

  if (provider === 'gemini') {
    const apiKey = getGeminiApiKey(config);
    if (!apiKey) throw new Error("Gemini API key is required. Please check your settings.");

    const ai = new GoogleGenAI({ apiKey });
    const promptText = `Complete market research, live competitor ad analysis, and sourcing information for: ${productName || 'this product'} in Bangladesh.
      Provide detailed niche potential, fit score reasoning, and budget breakdowns.
      List 5 top competitors in BD and identify which social platforms they use and their estimated sales volume.
      Provide sourcing information including estimated cost in BDT, potential suppliers/locations, and sourcing strategy.`;

    const contents: any[] = [{ parts: [{ text: promptText }] }];
    if (imageBase64 && mimeType) {
      contents[0].parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: responseSchemaObj as any,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          ]
        },
      });

      const text = response.text || '';
      if (!text) {
        throw new Error("Empty response from AI.");
      }
      
      try {
        const parsed = JSON.parse(text);
        // Basic validation to ensure we have the expected structure
        if (!parsed.final_decision || !parsed.product_market_fit) {
          throw new Error("Incomplete analysis data received.");
        }
        return parsed;
      } catch (parseError) {
        console.error("JSON Parse Error. Raw text:", text);
        // Try one more time with regex extraction if JSON mode failed or returned extra text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e) {
            throw new Error("Failed to parse analysis results. The AI response was not in a valid JSON format.");
          }
        }
        throw new Error("Failed to parse analysis results. The AI response was not in the expected format. Please try again.");
      }
    } catch (apiError: any) {
      console.error("Gemini API Error:", apiError);
      const errorMessage = apiError.message || "";
      if (errorMessage.includes("API key not valid")) {
        throw new Error("Invalid Gemini API key. Please check your settings and try again.");
      }
      if (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("Gemini API quota exceeded. Please try again later or use a different API key.");
      }
      throw new Error("Gemini API Error: " + errorMessage);
    }
  }

  // Fallback to backend for other providers
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productName,
      imageBase64,
      mimeType,
      config
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  return response.json();
};

export const generateImageForContent = async (prompt: string, config?: ApiKeyConfig): Promise<string> => {
  const provider = config?.provider || 'gemini';

  if (provider === 'gemini') {
    const apiKey = getGeminiApiKey(config);
    if (!apiKey) throw new Error("Gemini API key is required for image generation.");

    const ai = new GoogleGenAI({ apiKey });
    try {
      // Use gemini-2.5-flash-image for image generation as per skill
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `A high-end e-commerce product visual for a Bangladeshi brand: ${prompt}. Professional commercial photography, stunning lighting, minimalist aesthetic background, high resolution.` }] }],
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Image generation failed: No image data returned.");
    } catch (apiError: any) {
      console.error("Gemini Image Gen Error:", apiError);
      throw new Error("Gemini Image Gen Error: " + (apiError.message || "Unknown error"));
    }
  }

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      config
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error: ${response.status}`);
  }

  const data = await response.json();
  return data.url;
};
