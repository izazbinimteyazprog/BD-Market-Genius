
export const SYSTEM_INSTRUCTION = `You are a Senior Market Research Analyst and Performance Marketing Strategist specialized in the Bangladesh E-commerce ecosystem.

Key Guidelines:
1. Language: Use natural, conversational Bengali (not formal/Sadhubhasha) for ALL sections.
2. Connection: Emphasize 'Trust' and 'Value' relevant to Bangladeshi culture.
3. Competitor Research: Identify real top competitors in the Bangladesh market for the provided product.
   - For 'top_competitors', provide the Brand Name, active platforms, and an estimated sales volume (e.g., '100-500 units/month'). Do NOT provide URLs/links.
4. Decision Logic: Provide deep analysis into niche potential, market fit reasoning, and budget utility for a new entrepreneur.
5. Sourcing: Provide realistic sourcing information for Bangladesh (e.g., Chawkbazar, Islampur, Alibaba imports, etc.) and estimated costs in BDT.
6. Branding: NEVER mention "Gemini", "AI", or "Model" in the output text. Present all information as a professional human-led strategic report.

Return a structured response in the requested JSON format. Ensure all strings are in Bengali except for technical keys and verdicts.`;

export const responseSchemaObj = {
  type: "OBJECT",
  properties: {
    product_market_fit: {
      type: "OBJECT",
      properties: {
        core_problem: { type: "STRING" },
        urgency_level: { type: "STRING" },
        demand_type: { type: "STRING" },
        cultural_relevance: { type: "STRING" },
        seasonality: { type: "STRING" },
        market_fit_score: { type: "NUMBER" },
        price_sensitivity: { type: "STRING" },
      },
      required: ["core_problem", "urgency_level", "demand_type", "cultural_relevance", "seasonality", "market_fit_score", "price_sensitivity"],
    },
    competition_analysis: {
      type: "OBJECT",
      properties: {
        estimated_active_sellers: { type: "STRING" },
        avg_daily_sales_per_seller: { type: "STRING" },
        price_range_bdt: { type: "STRING" },
        competition_type: { type: "STRING" },
        ad_saturation: {
          type: "OBJECT",
          properties: {
            facebook_instagram: { type: "NUMBER" },
            google_ads: { type: "NUMBER" },
            marketplaces: { type: "NUMBER" },
          },
          required: ["facebook_instagram", "google_ads", "marketplaces"],
        },
        entry_difficulty: { type: "STRING" },
      },
      required: ["estimated_active_sellers", "avg_daily_sales_per_seller", "price_range_bdt", "competition_type", "ad_saturation", "entry_difficulty"],
    },
    competitor_research: {
      type: "OBJECT",
      properties: {
        top_competitors: { 
          type: "ARRAY", 
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              active_platforms: { type: "ARRAY", items: { type: "STRING" } },
              estimated_sales_volume: { type: "STRING" }
            },
            required: ["name", "active_platforms", "estimated_sales_volume"]
          } 
        },
        live_ad_trends: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              platform: { type: "STRING" },
              brand_name: { type: "STRING" },
              ad_type: { type: "STRING" },
              estimated_duration: { type: "STRING" },
              strategy_insight: { type: "string" },
              performance_score: { type: "NUMBER" },
            },
            required: ["platform", "brand_name", "ad_type", "estimated_duration", "strategy_insight", "performance_score"]
          }
        },
        winning_creative_elements: { type: "ARRAY", items: { type: "STRING" } },
        ad_library_links: {
          type: "OBJECT",
          properties: {
            meta: { type: "STRING" },
            tiktok: { type: "STRING" },
            google: { type: "STRING" },
          },
          required: ["meta", "tiktok", "google"]
        }
      },
      required: ["top_competitors", "live_ad_trends", "winning_creative_elements", "ad_library_links"]
    },
    customer_avatars: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          avatar_name: { type: "STRING" },
          age_range: { type: "STRING" },
          gender: { type: "STRING" },
          location: { type: "STRING" },
          income_level: { type: "STRING" },
          pain_points: { type: "ARRAY", items: { type: "STRING" } },
          hidden_fears: { type: "ARRAY", items: { type: "STRING" } },
          desired_transformation: { type: "STRING" },
          buying_objections: { type: "ARRAY", items: { type: "STRING" } },
          purchase_triggers: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["avatar_name", "age_range", "gender", "location", "income_level", "pain_points", "hidden_fears", "desired_transformation", "buying_objections", "purchase_triggers"],
      },
    },
    ad_copies: {
      type: "OBJECT",
      properties: {
        top_of_funnel: { type: "ARRAY", items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            title: { type: "STRING" },
            hooks: { type: "ARRAY", items: { type: "STRING" } },
            ideas: { type: "ARRAY", items: { type: "STRING" } },
            variations: { type: "ARRAY", items: {
              type: "OBJECT",
              properties: {
                headline: { type: "STRING" },
                hook: { type: "STRING" },
                body: { type: "STRING" },
                cta: { type: "STRING" },
              },
              required: ["headline", "hook", "body", "cta"],
            } },
            connection_psychology: { type: "STRING" },
            recommended_format: { type: "STRING" },
          },
          required: ["id", "title", "hooks", "ideas", "variations", "connection_psychology", "recommended_format"],
        } },
        middle_of_funnel: { type: "ARRAY", items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            title: { type: "STRING" },
            hooks: { type: "ARRAY", items: { type: "STRING" } },
            ideas: { type: "ARRAY", items: { type: "STRING" } },
            variations: { type: "ARRAY", items: {
              type: "OBJECT",
              properties: {
                headline: { type: "STRING" },
                hook: { type: "STRING" },
                body: { type: "STRING" },
                cta: { type: "STRING" },
              },
              required: ["headline", "hook", "body", "cta"],
            } },
            connection_psychology: { type: "STRING" },
            recommended_format: { type: "STRING" },
          },
          required: ["id", "title", "hooks", "ideas", "variations", "connection_psychology", "recommended_format"],
        } },
        bottom_of_funnel: { type: "ARRAY", items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            title: { type: "STRING" },
            hooks: { type: "ARRAY", items: { type: "STRING" } },
            ideas: { type: "ARRAY", items: { type: "STRING" } },
            variations: { type: "ARRAY", items: {
              type: "OBJECT",
              properties: {
                headline: { type: "STRING" },
                hook: { type: "STRING" },
                body: { type: "STRING" },
                cta: { type: "STRING" },
              },
              required: ["headline", "hook", "body", "cta"],
            } },
            connection_psychology: { type: "STRING" },
            recommended_format: { type: "STRING" },
          },
          required: ["id", "title", "hooks", "ideas", "variations", "connection_psychology", "recommended_format"],
        } },
        retention: { type: "ARRAY", items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            title: { type: "STRING" },
            hooks: { type: "ARRAY", items: { type: "STRING" } },
            ideas: { type: "ARRAY", items: { type: "STRING" } },
            variations: { type: "ARRAY", items: {
              type: "OBJECT",
              properties: {
                headline: { type: "STRING" },
                hook: { type: "STRING" },
                body: { type: "STRING" },
                cta: { type: "STRING" },
              },
              required: ["headline", "hook", "body", "cta"],
            } },
            connection_psychology: { type: "STRING" },
            recommended_format: { type: "STRING" },
          },
          required: ["id", "title", "hooks", "ideas", "variations", "connection_psychology", "recommended_format"],
        } },
      },
      required: ["top_of_funnel", "middle_of_funnel", "bottom_of_funnel", "retention"],
    },
    retargeting_funnel_logic: {
      type: "OBJECT",
      properties: {
        top_to_middle: { type: "STRING" },
        middle_to_bottom: { type: "STRING" },
        retention_strategy: { type: "STRING" },
        recommended_sequence_days: { type: "ARRAY", items: { type: "STRING" } },
      },
      required: ["top_to_middle", "middle_to_bottom", "retention_strategy", "recommended_sequence_days"],
    },
    final_decision: {
      type: "OBJECT",
      properties: {
        verdict: { type: "STRING" },
        decision_reasoning: { type: "STRING" },
        niche_potential_description: { type: "STRING" },
        market_fit_detailed_reason: { type: "STRING" },
        budget_breakdown_detail: { type: "STRING" },
        optimization_requirements: { type: "ARRAY", items: { type: "STRING" } },
        starting_budget_bdt: { type: "NUMBER" },
        major_risks: { type: "ARRAY", items: { type: "STRING" } },
        decision_factors: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              factor: { type: "STRING" },
              impact: { type: "STRING" },
              score: { type: "NUMBER" }
            },
            required: ["factor", "impact", "score"]
          }
        },
        marketing_channels: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              channel: { type: "STRING" },
              allocation_percentage: { type: "NUMBER" },
              reason: { type: "STRING" }
            },
            required: ["channel", "allocation_percentage", "reason"]
          }
        },
        entrepreneur_advice: { type: "ARRAY", items: { type: "STRING" } },
        niche_trends: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              period: { type: "STRING" },
              interest_level: { type: "NUMBER" }
            },
            required: ["period", "interest_level"]
          }
        }
      },
      required: ["verdict", "decision_reasoning", "niche_potential_description", "market_fit_detailed_reason", "budget_breakdown_detail", "optimization_requirements", "starting_budget_bdt", "major_risks", "decision_factors", "marketing_channels", "entrepreneur_advice", "niche_trends"],
    },
    sourcing_information: {
      type: "OBJECT",
      properties: {
        estimated_cost_bdt: { type: "STRING" },
        potential_suppliers: { type: "ARRAY", items: { type: "STRING" } },
        sourcing_strategy: { type: "STRING" }
      },
      required: ["estimated_cost_bdt", "potential_suppliers", "sourcing_strategy"]
    }
  },
  required: ["product_market_fit", "competition_analysis", "competitor_research", "customer_avatars", "ad_copies", "retargeting_funnel_logic", "final_decision", "sourcing_information"],
};
