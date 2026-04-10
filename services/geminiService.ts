
import { MarketResearchResponse } from "../types";

export interface ApiKeyConfig {
  provider: 'gemini' | 'openai' | 'deepseek';
  geminiKey: string;
  openaiKey: string;
  deepseekKey: string;
}

export const analyzeProduct = async (productName: string, imageBase64?: string, mimeType?: string, config?: ApiKeyConfig): Promise<MarketResearchResponse> => {
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
