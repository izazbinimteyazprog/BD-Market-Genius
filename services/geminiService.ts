
import { GoogleGenAI, Type } from "@google/genai";
import { MarketResearchResponse } from "../types";

const SYSTEM_INSTRUCTION = `You are a Senior Market Research Analyst, Performance Marketing Strategist, and Content Architect specialized in Bangladesh E-commerce.
Your goal is to build a deep connection with Bangladeshi customers through high-converting Bengali content.

Key Content Guidelines for Bangladesh:
1. Language: Use natural, conversational Bengali (not formal/Sadhubhasha) for ALL sections including the Verdict, Market Analysis, and Personas.
2. Connection: Focus on 'Trust' (Bisshash) and 'Value' (Sustho/Susthayi).
3. Psychological Triggers: Status, family well-being, savings, and reliability.
4. Content Expansion: 
   - Provide EXACTLY 5 high-converting, scroll-stopping hooks.
   - Provide EXACTLY 5 unique content ideas.
   - Provide 2 "Ready to Publish" ad variations for each piece. 
5. Ad Variations: Each variation MUST have a Headline, a Hook, a Body, and a CTA. 
6. Scroll-stoppers: Hooks must be extremely engaging, making customers pause their scrolling for 5-10 seconds.

Return a structured response in the requested JSON format. Ensure all strings (except the model verdict 'YES'/'NO'/'TEST') are in Bengali.`;

const adVariationSchema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING, description: 'Short attention-grabbing headline in Bengali.' },
    hook: { type: Type.STRING, description: 'First 1-2 sentences to stop the scroll in Bengali.' },
    body: { type: Type.STRING, description: 'The main persuasive persuasive copy in Bengali.' },
    cta: { type: Type.STRING, description: 'Direct call to action in Bengali (e.g., এখনই অর্ডার করুন).' },
  },
  required: ["headline", "hook", "body", "cta"],
};

const contentPieceSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    hooks: { type: Type.ARRAY, items: { type: Type.STRING }, description: '5 extremely engaging Bengali hooks.' },
    ideas: { type: Type.ARRAY, items: { type: Type.STRING }, description: '5 unique Bengali content ideas.' },
    variations: { type: Type.ARRAY, items: adVariationSchema, description: '2 ready-to-publish ad variations.' },
    connection_psychology: { type: Type.STRING },
    recommended_format: { type: Type.STRING },
  },
  required: ["id", "title", "hooks", "ideas", "variations", "connection_psychology", "recommended_format"],
};

export const analyzeProduct = async (productName: string): Promise<MarketResearchResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Complete market research and full content engine for: ${productName}. 
    Translate all reasoning, problems, and insights into natural Bengali. 
    Focus on creating connection with the customer. 
    Provide 5 hooks, 5 ideas, and 2 ready-to-publish variations for each content stage.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          product_market_fit: {
            type: Type.OBJECT,
            properties: {
              core_problem: { type: Type.STRING },
              urgency_level: { type: Type.STRING },
              demand_type: { type: Type.STRING },
              cultural_relevance: { type: Type.STRING },
              seasonality: { type: Type.STRING },
              market_fit_score: { type: Type.NUMBER },
              price_sensitivity: { type: Type.STRING },
            },
            required: ["core_problem", "urgency_level", "demand_type", "cultural_relevance", "seasonality", "market_fit_score", "price_sensitivity"],
          },
          competition_analysis: {
            type: Type.OBJECT,
            properties: {
              estimated_active_sellers: { type: Type.STRING },
              avg_daily_sales_per_seller: { type: Type.STRING },
              price_range_bdt: { type: Type.STRING },
              competition_type: { type: Type.STRING },
              ad_saturation: {
                type: Type.OBJECT,
                properties: {
                  facebook_instagram: { type: Type.NUMBER },
                  google_ads: { type: Type.NUMBER },
                  marketplaces: { type: Type.NUMBER },
                },
                required: ["facebook_instagram", "google_ads", "marketplaces"],
              },
              entry_difficulty: { type: Type.STRING },
            },
            required: ["estimated_active_sellers", "avg_daily_sales_per_seller", "price_range_bdt", "competition_type", "ad_saturation", "entry_difficulty"],
          },
          customer_avatars: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                avatar_name: { type: Type.STRING },
                age_range: { type: Type.STRING },
                gender: { type: Type.STRING },
                location: { type: Type.STRING },
                income_level: { type: Type.STRING },
                pain_points: { type: Type.ARRAY, items: { type: Type.STRING } },
                hidden_fears: { type: Type.ARRAY, items: { type: Type.STRING } },
                desired_transformation: { type: Type.STRING },
                buying_objections: { type: Type.ARRAY, items: { type: Type.STRING } },
                purchase_triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["avatar_name", "age_range", "gender", "location", "income_level", "pain_points", "hidden_fears", "desired_transformation", "buying_objections", "purchase_triggers"],
            },
          },
          ad_copies: {
            type: Type.OBJECT,
            properties: {
              cold_audience: { type: Type.ARRAY, items: contentPieceSchema },
              warm_audience: { type: Type.ARRAY, items: contentPieceSchema },
              hot_audience: { type: Type.ARRAY, items: contentPieceSchema },
              retargeting: { type: Type.ARRAY, items: contentPieceSchema },
              retention: { type: Type.ARRAY, items: contentPieceSchema },
            },
            required: ["cold_audience", "warm_audience", "hot_audience", "retargeting", "retention"],
          },
          retargeting_funnel_logic: {
            type: Type.OBJECT,
            properties: {
              cold_to_warm: { type: Type.STRING },
              warm_to_hot: { type: Type.STRING },
              retention_strategy: { type: Type.STRING },
              recommended_sequence_days: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["cold_to_warm", "warm_to_hot", "retention_strategy", "recommended_sequence_days"],
          },
          final_decision: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING },
              decision_reasoning: { type: Type.STRING },
              optimization_requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              starting_budget_bdt: { type: Type.NUMBER },
              major_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["verdict", "decision_reasoning", "optimization_requirements", "starting_budget_bdt", "major_risks"],
          },
        },
        required: ["product_market_fit", "competition_analysis", "customer_avatars", "ad_copies", "retargeting_funnel_logic", "final_decision"],
      },
    },
  });

  try {
    const text = response.text || '';
    return JSON.parse(text) as MarketResearchResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Invalid response format from AI. Please try again.");
  }
};

export const generateImageForContent = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [{ parts: [{ text: `A professional e-commerce product ad visual for: ${prompt}. Cinematic lighting, premium quality, aesthetic background.` }] }],
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Image generation failed");
};
