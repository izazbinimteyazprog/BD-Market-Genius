import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

const SYSTEM_INSTRUCTION = `You are a Senior Market Research Analyst and Performance Marketing Strategist specialized in the Bangladesh E-commerce ecosystem.

Key Guidelines:
1. Language: Use natural, conversational Bengali (not formal/Sadhubhasha) for ALL sections.
2. Connection: Emphasize 'Trust' and 'Value' relevant to Bangladeshi culture.
3. Competitor Research: Identify real top competitors in the Bangladesh market for the provided product.
   - For 'top_competitors', provide the Brand Name, active platforms, and an estimated sales volume (e.g., '100-500 units/month'). Do NOT provide URLs/links.
4. Decision Logic: Provide deep analysis into niche potential, market fit reasoning, and budget utility for a new entrepreneur.
5. Sourcing: Provide realistic sourcing information for Bangladesh (e.g., Chawkbazar, Islampur, Alibaba imports, etc.) and estimated costs in BDT.
6. Branding: NEVER mention "Gemini", "AI", or "Model" in the output text. Present all information as a professional human-led strategic report.

Return a structured response in the requested JSON format. Ensure all strings are in Bengali except for technical keys and verdicts.`;

const responseSchemaObj = {
  type: "object",
  properties: {
    product_market_fit: {
      type: "object",
      properties: {
        core_problem: { type: "string" },
        urgency_level: { type: "string" },
        demand_type: { type: "string" },
        cultural_relevance: { type: "string" },
        seasonality: { type: "string" },
        market_fit_score: { type: "number" },
        price_sensitivity: { type: "string" },
      },
      required: ["core_problem", "urgency_level", "demand_type", "cultural_relevance", "seasonality", "market_fit_score", "price_sensitivity"],
    },
    competition_analysis: {
      type: "object",
      properties: {
        estimated_active_sellers: { type: "string" },
        avg_daily_sales_per_seller: { type: "string" },
        price_range_bdt: { type: "string" },
        competition_type: { type: "string" },
        ad_saturation: {
          type: "object",
          properties: {
            facebook_instagram: { type: "number" },
            google_ads: { type: "number" },
            marketplaces: { type: "number" },
          },
          required: ["facebook_instagram", "google_ads", "marketplaces"],
        },
        entry_difficulty: { type: "string" },
      },
      required: ["estimated_active_sellers", "avg_daily_sales_per_seller", "price_range_bdt", "competition_type", "ad_saturation", "entry_difficulty"],
    },
    competitor_research: {
      type: "object",
      properties: {
        top_competitors: { 
          type: "array", 
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              active_platforms: { type: "array", items: { type: "string" } },
              estimated_sales_volume: { type: "string" }
            },
            required: ["name", "active_platforms", "estimated_sales_volume"]
          } 
        },
        live_ad_trends: {
          type: "array",
          items: {
            type: "object",
            properties: {
              platform: { type: "string" },
              brand_name: { type: "string" },
              ad_type: { type: "string" },
              estimated_duration: { type: "string" },
              strategy_insight: { type: "string" },
              performance_score: { type: "number" },
            },
            required: ["platform", "brand_name", "ad_type", "estimated_duration", "strategy_insight", "performance_score"]
          }
        },
        winning_creative_elements: { type: "array", items: { type: "string" } },
        ad_library_links: {
          type: "object",
          properties: {
            meta: { type: "string" },
            tiktok: { type: "string" },
            google: { type: "string" },
          },
          required: ["meta", "tiktok", "google"]
        }
      },
      required: ["top_competitors", "live_ad_trends", "winning_creative_elements", "ad_library_links"]
    },
    customer_avatars: {
      type: "array",
      items: {
        type: "object",
        properties: {
          avatar_name: { type: "string" },
          age_range: { type: "string" },
          gender: { type: "string" },
          location: { type: "string" },
          income_level: { type: "string" },
          pain_points: { type: "array", items: { type: "string" } },
          hidden_fears: { type: "array", items: { type: "string" } },
          desired_transformation: { type: "string" },
          buying_objections: { type: "array", items: { type: "string" } },
          purchase_triggers: { type: "array", items: { type: "string" } },
        },
        required: ["avatar_name", "age_range", "gender", "location", "income_level", "pain_points", "hidden_fears", "desired_transformation", "buying_objections", "purchase_triggers"],
      },
    },
    ad_copies: {
      type: "object",
      properties: {
        top_of_funnel: { type: "array", items: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            hooks: { type: "array", items: { type: "string" } },
            ideas: { type: "array", items: { type: "string" } },
            variations: { type: "array", items: {
              type: "object",
              properties: {
                headline: { type: "string" },
                hook: { type: "string" },
                body: { type: "string" },
                cta: { type: "string" },
              },
              required: ["headline", "hook", "body", "cta"],
            } },
            connection_psychology: { type: "string" },
            recommended_format: { type: "string" },
          },
          required: ["id", "title", "hooks", "ideas", "variations", "connection_psychology", "recommended_format"],
        } },
        middle_of_funnel: { type: "array", items: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            hooks: { type: "array", items: { type: "string" } },
            ideas: { type: "array", items: { type: "string" } },
            variations: { type: "array", items: {
              type: "object",
              properties: {
                headline: { type: "string" },
                hook: { type: "string" },
                body: { type: "string" },
                cta: { type: "string" },
              },
              required: ["headline", "hook", "body", "cta"],
            } },
            connection_psychology: { type: "string" },
            recommended_format: { type: "string" },
          },
          required: ["id", "title", "hooks", "ideas", "variations", "connection_psychology", "recommended_format"],
        } },
        bottom_of_funnel: { type: "array", items: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            hooks: { type: "array", items: { type: "string" } },
            ideas: { type: "array", items: { type: "string" } },
            variations: { type: "array", items: {
              type: "object",
              properties: {
                headline: { type: "string" },
                hook: { type: "string" },
                body: { type: "string" },
                cta: { type: "string" },
              },
              required: ["headline", "hook", "body", "cta"],
            } },
            connection_psychology: { type: "string" },
            recommended_format: { type: "string" },
          },
          required: ["id", "title", "hooks", "ideas", "variations", "connection_psychology", "recommended_format"],
        } },
        retention: { type: "array", items: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            hooks: { type: "array", items: { type: "string" } },
            ideas: { type: "array", items: { type: "string" } },
            variations: { type: "array", items: {
              type: "object",
              properties: {
                headline: { type: "string" },
                hook: { type: "string" },
                body: { type: "string" },
                cta: { type: "string" },
              },
              required: ["headline", "hook", "body", "cta"],
            } },
            connection_psychology: { type: "string" },
            recommended_format: { type: "string" },
          },
          required: ["id", "title", "hooks", "ideas", "variations", "connection_psychology", "recommended_format"],
        } },
      },
      required: ["top_of_funnel", "middle_of_funnel", "bottom_of_funnel", "retention"],
    },
    retargeting_funnel_logic: {
      type: "object",
      properties: {
        top_to_middle: { type: "string" },
        middle_to_bottom: { type: "string" },
        retention_strategy: { type: "string" },
        recommended_sequence_days: { type: "array", items: { type: "string" } },
      },
      required: ["top_to_middle", "middle_to_bottom", "retention_strategy", "recommended_sequence_days"],
    },
    final_decision: {
      type: "object",
      properties: {
        verdict: { type: "string" },
        decision_reasoning: { type: "string" },
        niche_potential_description: { type: "string" },
        market_fit_detailed_reason: { type: "string" },
        budget_breakdown_detail: { type: "string" },
        optimization_requirements: { type: "array", items: { type: "string" } },
        starting_budget_bdt: { type: "number" },
        major_risks: { type: "array", items: { type: "string" } },
        decision_factors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              factor: { type: "string" },
              impact: { type: "string" },
              score: { type: "number" }
            },
            required: ["factor", "impact", "score"]
          }
        },
        marketing_channels: {
          type: "array",
          items: {
            type: "object",
            properties: {
              channel: { type: "string" },
              allocation_percentage: { type: "number" },
              reason: { type: "string" }
            },
            required: ["channel", "allocation_percentage", "reason"]
          }
        },
        entrepreneur_advice: { type: "array", items: { type: "string" } },
        niche_trends: {
          type: "array",
          items: {
            type: "object",
            properties: {
              period: { type: "string" },
              interest_level: { type: "number" }
            },
            required: ["period", "interest_level"]
          }
        }
      },
      required: ["verdict", "decision_reasoning", "niche_potential_description", "market_fit_detailed_reason", "budget_breakdown_detail", "optimization_requirements", "starting_budget_bdt", "major_risks", "decision_factors", "marketing_channels", "entrepreneur_advice", "niche_trends"],
    },
    sourcing_information: {
      type: "object",
      properties: {
        estimated_cost_bdt: { type: "string" },
        potential_suppliers: { type: "array", items: { type: "string" } },
        sourcing_strategy: { type: "string" }
      },
      required: ["estimated_cost_bdt", "potential_suppliers", "sourcing_strategy"]
    }
  },
  required: ["product_market_fit", "competition_analysis", "competitor_research", "customer_avatars", "ad_copies", "retargeting_funnel_logic", "final_decision", "sourcing_information"],
};

// API route for analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const { productName, imageBase64, mimeType, config } = req.body;
    const provider = config?.provider || 'gemini';
    
    const promptText = `Complete market research, live competitor ad analysis, and sourcing information for: ${productName || 'this product'} in Bangladesh.
      Provide detailed niche potential, fit score reasoning, and budget breakdowns.
      List 5 top competitors in BD and identify which social platforms they use and their estimated sales volume.
      Provide sourcing information including estimated cost in BDT, potential suppliers/locations, and sourcing strategy.`;

    if (provider === 'gemini') {
      const apiKey = config?.geminiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is required.");
      
      const ai = new GoogleGenAI({ apiKey });
      const contents: any[] = [promptText];

      if (imageBase64 && mimeType) {
        contents.push({
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: responseSchemaObj.properties as any,
            required: responseSchemaObj.required,
          },
        },
      });

      const text = response.text || '';
      res.json(JSON.parse(text));

    } else if (provider === 'openai') {
      if (!config?.openaiKey) throw new Error("OpenAI API key is required.");
      
      const openai = new OpenAI({ apiKey: config.openaiKey });
      const messages: any[] = [{ role: "system", content: SYSTEM_INSTRUCTION }];

      if (imageBase64 && mimeType) {
        messages.push({
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } }
          ]
        });
      } else {
        messages.push({ role: "user", content: promptText });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "market_research",
            strict: true,
            schema: {
              type: "object",
              properties: responseSchemaObj.properties,
              required: responseSchemaObj.required,
              additionalProperties: false,
            }
          }
        }
      });

      const text = response.choices[0].message.content || '';
      res.json(JSON.parse(text));

    } else if (provider === 'deepseek') {
      if (!config?.deepseekKey) throw new Error("DeepSeek API key is required.");
      
      const openai = new OpenAI({ apiKey: config.deepseekKey, baseURL: 'https://api.deepseek.com/v1' });
      const messages: any[] = [{ role: "system", content: SYSTEM_INSTRUCTION }];

      messages.push({ role: "user", content: promptText + (imageBase64 ? " (Note: Image was provided but DeepSeek vision is not supported here, please analyze based on the product name)" : "") });

      const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: messages,
        response_format: { type: "json_object" }
      });

      const text = response.choices[0].message.content || '';
      res.json(JSON.parse(text));
    } else {
      throw new Error("Invalid provider selected.");
    }
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during analysis." });
  }
});

// API route for image generation
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, config } = req.body;
    const provider = config?.provider || 'gemini';

    if (provider === 'gemini') {
      const apiKey = config?.geminiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key is required.");
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: `A high-end e-commerce product visual for a Bangladeshi brand: ${prompt}. Professional commercial photography, stunning lighting, minimalist aesthetic background, high resolution.` }] }],
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return res.json({ url: `data:image/png;base64,${part.inlineData.data}` });
        }
      }
      throw new Error("Image generation failed");

    } else if (provider === 'openai') {
      if (!config?.openaiKey) throw new Error("OpenAI API key is required for image generation.");
      
      const openai = new OpenAI({ apiKey: config.openaiKey });
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: `A high-end e-commerce product visual for a Bangladeshi brand: ${prompt}. Professional commercial photography, stunning lighting, minimalist aesthetic background, high resolution.`,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      });
      
      if (response.data[0].b64_json) {
        return res.json({ url: `data:image/png;base64,${response.data[0].b64_json}` });
      }
      throw new Error("Image generation failed");

    } else if (provider === 'deepseek') {
      throw new Error("DeepSeek does not currently support image generation.");
    } else {
      throw new Error("Invalid provider selected.");
    }
  } catch (error: any) {
    console.error("Image Gen API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during image generation." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = process.env.PORT || PORT;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
