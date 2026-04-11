import express from "express";
import path from "path";
import { SYSTEM_INSTRUCTION, responseSchemaObj } from "./constants";
import OpenAI from "openai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

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
      return res.status(400).json({ error: "Gemini analysis should be handled on the frontend." });
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
      return res.status(400).json({ error: "Gemini image generation should be handled on the frontend." });
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

  const port = Number(process.env.PORT) || PORT;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
