
export interface ProductMarketFit {
  core_problem: string;
  urgency_level: 'High' | 'Medium' | 'Low';
  demand_type: 'Impulse' | 'Considered' | 'Necessity';
  cultural_relevance: string;
  seasonality: string;
  market_fit_score: number;
  price_sensitivity: 'Low' | 'Medium' | 'High';
}

export interface AdSaturation {
  facebook_instagram: number;
  google_ads: number;
  marketplaces: number;
}

export interface CompetitionAnalysis {
  estimated_active_sellers: 'Low' | 'Medium' | 'High';
  avg_daily_sales_per_seller: 'Low' | 'Medium' | 'High';
  price_range_bdt: string;
  competition_type: 'Brand-led' | 'Commodity-led' | 'Mixed';
  ad_saturation: AdSaturation;
  entry_difficulty: 'Easy' | 'Moderate' | 'Hard';
}

export interface CustomerAvatar {
  avatar_name: string;
  age_range: string;
  gender: string;
  location: 'Urban' | 'Semi-Urban' | 'Rural';
  income_level: string;
  pain_points: string[];
  hidden_fears: string[];
  desired_transformation: string;
  buying_objections: string[];
  purchase_triggers: string[];
}

export interface AdVariation {
  headline: string;
  hook: string;
  body: string;
  cta: string;
}

export interface ContentPiece {
  id: string;
  title: string;
  hooks: string[]; // 5 scroll-stopping hooks
  ideas: string[]; // 5 content ideas
  variations: AdVariation[]; // "Ready to publish" ad variations
  connection_psychology: string;
  recommended_format: string;
  generatedImageUrl?: string;
}

export interface AdCopies {
  cold_audience: ContentPiece[];
  warm_audience: ContentPiece[];
  hot_audience: ContentPiece[];
  retargeting: ContentPiece[];
  retention: ContentPiece[];
}

export interface RetargetingLogic {
  cold_to_warm: string;
  warm_to_hot: string;
  retention_strategy: string;
  recommended_sequence_days: string[];
}

export interface FinalDecision {
  verdict: 'YES' | 'NO' | 'TEST';
  decision_reasoning: string;
  optimization_requirements: string[];
  starting_budget_bdt: number;
  major_risks: string[];
}

export interface MarketResearchResponse {
  product_market_fit: ProductMarketFit;
  competition_analysis: CompetitionAnalysis;
  customer_avatars: CustomerAvatar[];
  ad_copies: AdCopies;
  retargeting_funnel_logic: RetargetingLogic;
  final_decision: FinalDecision;
}
